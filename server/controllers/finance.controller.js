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

// ================= ADD BALANCE SNAPSHOT =================
export const addBalanceSnapshot = async (req, res) => {
  try {
    let { balance_amount } = req.body;

    const amountNum = Number(balance_amount);

    if (balance_amount === undefined || isNaN(amountNum) || amountNum < 0) {
      return res
        .status(400)
        .json({ error: "Valid balance amount is required" });
    }

    const now = new Date();
    const year = now.getFullYear();

    try {
      const balanceSnapshot = await BalanceSnapshot.create({
        balance_amount: amountNum,
        date: now,
        year,
      });

      return res.status(201).json({
        message: "Balance snapshot recorded successfully",
        balanceSnapshot: {
          snapshot_id: balanceSnapshot.snapshot_id,
          balance_amount: balanceSnapshot.balance_amount,
          date: balanceSnapshot.date,
          year: balanceSnapshot.year,
        },
      });
    } catch (err) {
      // handle unique date violation gracefully
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          error: "Balance snapshot already exists for today",
        });
      }
      throw err;
    }
  } catch (error) {
    console.error("Error adding balance snapshot:", error);
    return res.status(500).json({
      error: "Failed to record balance snapshot",
    });
  }
};

// ================= GET BALANCE HISTORY =================
export const getBalanceHistory = async (req, res) => {
  try {
    let { year, limit = 50 } = req.query;

    // ---------- sanitize limit ----------
    limit = Number(limit);
    if (isNaN(limit) || limit <= 0) limit = 50;
    if (limit > 200) limit = 200;

    const whereClause = {};

    if (year) {
      const parsedYear = Number(year);
      if (!isNaN(parsedYear)) {
        whereClause.year = parsedYear;
      }
    }

    const balanceSnapshots = await BalanceSnapshot.findAll({
      where: whereClause,
      order: [["date", "DESC"]],
      limit,
    });

    return res.json({ balanceSnapshots });
  } catch (error) {
    console.error("Error fetching balance history:", error);
    return res.status(500).json({
      error: "Failed to fetch balance history",
    });
  }
};

// ================= FINANCIAL SUMMARY =================
export const getFinancialSummary = async (req, res) => {
  try {
    let { year } = req.query;
    const currentYear =
      !year || isNaN(Number(year)) ? new Date().getFullYear() : Number(year);

    // ---------- totals ----------
    const totalDonationsRaw = await Donation.sum("amount", {
      where: { year: currentYear },
    });

    const totalExpendituresRaw = await Expenditure.sum("amount", {
      where: { year: currentYear },
    });

    const totalDonations = Number(totalDonationsRaw) || 0;
    const totalExpenditures = Number(totalExpendituresRaw) || 0;

    // ---------- latest balance ----------
    const latestBalance = await BalanceSnapshot.findOne({
      where: { year: currentYear },
      order: [["date", "DESC"]],
    });

    // ---------- grouped donations ----------
    const donationsByPurpose = await Donation.findAll({
      where: { year: currentYear },
      attributes: [
        "purpose",
        [sequelize.fn("SUM", sequelize.col("amount")), "total_amount"],
      ],
      group: ["purpose"],
      raw: true,
    });

    // ---------- grouped expenditures ----------
    const expendituresByInitiative = await Expenditure.findAll({
      where: { year: currentYear },
      attributes: [
        "initiative",
        [sequelize.fn("SUM", sequelize.col("amount")), "total_amount"],
      ],
      group: ["initiative"],
      raw: true,
    });

    return res.json({
      year: currentYear,
      totalDonations,
      totalExpenditures,
      currentBalance: latestBalance ? Number(latestBalance.balance_amount) : 0,
      donationsByPurpose,
      expendituresByInitiative,
    });
  } catch (error) {
    console.error("Error fetching financial summary:", error);
    return res.status(500).json({
      error: "Failed to fetch financial summary",
    });
  }
};
