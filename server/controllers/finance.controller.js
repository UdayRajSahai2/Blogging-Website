// ---------------- Database ----------------
import sequelize from "../config/db.config.js";

// ---------------- Service Configs ----------------
import "../config/firebase.config.js";

// ---------------- Models / Associations ----------------
import {
  Donation,
  Expenditure,
  BalanceSnapshot,
} from "../models/associations.js";
// Add balance snapshot
export const addBalanceSnapshot = async (req, res) => {
  try {
    const { balance_amount } = req.body;

    if (balance_amount === undefined || balance_amount < 0) {
      return res
        .status(400)
        .json({ error: "Valid balance amount is required" });
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear();

    const balanceSnapshot = await BalanceSnapshot.create({
      balance_amount: parseFloat(balance_amount),
      date: currentDate,
      year,
    });

    res.status(201).json({
      message: "Balance snapshot recorded successfully",
      balanceSnapshot: {
        snapshot_id: balanceSnapshot.snapshot_id,
        balance_amount: balanceSnapshot.balance_amount,
        date: balanceSnapshot.date,
        year: balanceSnapshot.year,
      },
    });
  } catch (error) {
    console.error("Error adding balance snapshot:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getBalanceHistory = async (req, res) => {
  try {
    const { year, limit = 50 } = req.query;

    const whereClause = {};
    if (year) {
      whereClause.year = parseInt(year);
    }

    const balanceSnapshots = await BalanceSnapshot.findAll({
      where: whereClause,
      order: [["date", "DESC"]],
      limit: parseInt(limit),
    });

    res.json({ balanceSnapshots });
  } catch (error) {
    console.error("Error fetching balance history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFinancialSummary = async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Get total donations for the year
    const totalDonations =
      (await Donation.sum("amount", {
        where: { year: currentYear },
      })) || 0;

    // Get total expenditures for the year
    const totalExpenditures =
      (await Expenditure.sum("amount", {
        where: { year: currentYear },
      })) || 0;

    // Get latest balance
    const latestBalance = await BalanceSnapshot.findOne({
      where: { year: currentYear },
      order: [["date", "DESC"]],
    });

    // Get donations by purpose
    const donationsByPurpose = await Donation.findAll({
      where: { year: currentYear },
      attributes: [
        "purpose",
        [sequelize.fn("SUM", sequelize.col("amount")), "total_amount"],
      ],
      group: ["purpose"],
      raw: true,
    });

    // Get expenditures by initiative
    const expendituresByInitiative = await Expenditure.findAll({
      where: { year: currentYear },
      attributes: [
        "initiative",
        [sequelize.fn("SUM", sequelize.col("amount")), "total_amount"],
      ],
      group: ["initiative"],
      raw: true,
    });

    res.json({
      year: currentYear,
      totalDonations: parseFloat(totalDonations),
      totalExpenditures: parseFloat(totalExpenditures),
      currentBalance: latestBalance
        ? parseFloat(latestBalance.balance_amount)
        : 0,
      donationsByPurpose,
      expendituresByInitiative,
    });
  } catch (error) {
    console.error("Error fetching financial summary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
