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
    const user_id = req.user;

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
    const user_id = req.user;
    const { year, limit = 50 } = req.query;

    const whereClause = { user_id };
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
        },
      ],
      order: [["date", "DESC"]],
      limit: parseInt(limit),
    });

    res.json({ donations });
  } catch (error) {
    console.error("Error fetching donation history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get donation analytics for profile dashboard
export const getDonationAnalytics = async (req, res) => {
  try {
    const user_id = req.user;
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Get user's donations for the year
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

    // Calculate cumulative donations
    let cumulative = 0;
    const donationData = donations.map((donation) => {
      cumulative += parseFloat(donation.amount);
      return {
        date: donation.date,
        amount: parseFloat(donation.amount),
        cumulative,
        purpose: donation.purpose,
        subscription_type: donation.donor.subscription_type,
      };
    });

    // Get total donations by purpose
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

    // Get total donations by subscription type
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

    res.json({
      donationData,
      purposeTotals,
      subscriptionTotals,
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
