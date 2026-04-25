// ---------------- Database ----------------
import sequelize from "../config/db.config.js";

// ---------------- Service Configs ----------------
import "../config/firebase.config.js";

// ---------------- Models / Associations ----------------
import { Donor, Donation } from "../models/associations.js";
export const makeDonation = async (req, res) => {
  try {
    const { amount, purpose, customer_id, payment_id, payment_signature } =
      req.body;
    const user_id = req.user.id;

    // Check if user is a registered donor
    const donor = await Donor.findOne({ where: { user_id } });
    if (!donor) {
      return res
        .status(400)
        .json({ error: "User must be registered as a donor first" });
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Valid donation amount is required" });
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear();

    // Create donation record
    const donation = await Donation.create({
      donor_id: donor.donor_id,
      user_id,
      customer_id: customer_id || donor.customer_id,
      purpose: purpose || donor.purpose,
      amount: parseFloat(amount),
      date: currentDate,
      year,
      payment_id: payment_id || null,
      payment_signature: payment_signature || null,
      payment_status: payment_id ? "completed" : "pending",
    });

    res.status(201).json({
      message: "Donation recorded successfully",
      donation: {
        donation_id: donation.donation_id,
        amount: donation.amount,
        purpose: donation.purpose,
        date: donation.date,
        year: donation.year,
      },
    });
  } catch (error) {
    console.error("Error making donation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Get user's donation history
export const donationHistory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { year, limit = 50 } = req.query;

    const whereClause = { user_id };

    // Filter by year if provided
    if (year) {
      whereClause.year = parseInt(year);
    }

    const donations = await Donation.findAll({
      where: whereClause,
      include: [
        {
          model: Donor,
          as: "donor",
          attributes: ["subscription_type", "is_subscriber"],
          required: false,
        },
      ],
      attributes: ["donation_id", "purpose", "amount", "date", "year"],
      order: [["date", "DESC"]],
      limit: parseInt(limit),
    });

    const formattedDonations = donations.map((d) => ({
      id: d.donation_id,
      purpose: d.purpose || "General Donation",
      amount: d.amount || 0,
      date: d.date,
      donor: {
        subscription_type: d.donor?.subscription_type || "one-time",
        is_subscriber: d.donor?.is_subscriber || false,
      },
    }));

    res.status(200).json({
      success: true,
      count: formattedDonations.length,
      donations: formattedDonations,
    });
  } catch (error) {
    console.error("Error fetching donation history:", {
      message: error.message,
      stack: error.stack,
      sql: error.sql, // VERY useful for DB issues
    });

    res.status(500).json({
      success: false,
      message: "Failed to fetch donation history",
    });
  }
};

// ======================================================
// GET DONATION ANALYTICS (YEAR + MONTH WISE)
// ======================================================
export const getDonationAnalytics = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // --------------------------------------------------
    // Get donation list (for cumulative graph)
    // --------------------------------------------------
    const donations = await Donation.findAll({
      where: {
        user_id,
        year: currentYear,
      },
      include: [
        {
          model: Donor,
          as: "donor",
          attributes: ["subscription_type"],
        },
      ],
      order: [["date", "ASC"]],
    });

    // --------------------------------------------------
    // Build cumulative data
    // --------------------------------------------------
    let cumulative = 0;
    const donationData = donations.map((donation) => {
      cumulative += parseFloat(donation.amount);

      return {
        date: donation.date,
        amount: parseFloat(donation.amount),
        cumulative,
        purpose: donation.purpose,
        subscription_type: donation.donor?.subscription_type,
      };
    });

    // --------------------------------------------------
    // Purpose totals
    // --------------------------------------------------
    const purposeTotals = await Donation.findAll({
      where: {
        user_id,
        year: currentYear,
      },
      attributes: [
        "purpose",
        [sequelize.fn("SUM", sequelize.col("amount")), "total_amount"],
      ],
      group: ["purpose"],
      raw: true,
    });

    // --------------------------------------------------
    // Subscription totals
    // --------------------------------------------------
    const subscriptionTotals = await Donation.findAll({
      where: {
        user_id,
        year: currentYear,
      },
      include: [
        {
          model: Donor,
          as: "donor",
          attributes: ["subscription_type"],
        },
      ],
      attributes: [
        [sequelize.fn("SUM", sequelize.col("Donation.amount")), "total_amount"],
      ],
      group: ["donor.subscription_type"],
      raw: true,
    });

    // ==================================================
    // MONTH-WISE TOTALS (MAIN FEATURE)
    // ==================================================
    const monthlyTotalsRaw = await Donation.findAll({
      where: {
        user_id,
        year: currentYear,
      },
      attributes: [
        [sequelize.fn("MONTH", sequelize.col("date")), "month"],
        [sequelize.fn("SUM", sequelize.col("amount")), "total_amount"],
      ],
      group: [sequelize.fn("MONTH", sequelize.col("date"))],
      order: [[sequelize.fn("MONTH", sequelize.col("date")), "ASC"]],
      raw: true,
    });

    // --------------------------------------------------
    // Normalize missing months (VERY IMPORTANT)
    // --------------------------------------------------
    const monthlyTotals = Array.from({ length: 12 }, (_, i) => {
      const found = monthlyTotalsRaw.find((m) => parseInt(m.month) === i + 1);

      return {
        month: i + 1,
        total_amount: found ? parseFloat(found.total_amount) : 0,
      };
    });

    // --------------------------------------------------
    // Final response
    // --------------------------------------------------
    res.json({
      donationData,
      purposeTotals,
      subscriptionTotals,
      monthlyTotals, // ⭐ NEW
      totalDonated: cumulative,
      year: currentYear,
    });
  } catch (error) {
    console.error("Error fetching donation analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update bank account for a donation (admin function)
export const updateDonationBankAccount = async (req, res) => {
  try {
    const { donation_id, bank_account, transfer_status } = req.body;

    const donation = await Donation.findByPk(donation_id);
    if (!donation) {
      return res.status(404).json({ error: "Donation not found" });
    }

    await donation.update({
      bank_account: bank_account || donation.bank_account,
      transfer_status: transfer_status || donation.transfer_status,
    });

    res.json({
      message: "Bank account updated successfully",
      donation: {
        donation_id: donation.donation_id,
        bank_account: donation.bank_account,
        transfer_status: donation.transfer_status,
      },
    });
  } catch (error) {
    console.error("Error updating bank account:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
