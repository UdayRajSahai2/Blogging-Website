// ---------------- Models / Associations ----------------
import Expenditure from "../models/Expenditure.js";

// ================= ADD EXPENDITURE =================
// (admin only — middleware should enforce system_role)
export const addExpenditure = async (req, res) => {
  try {
    let {
      initiative,
      amount,
      invoice_number,
      by_whom,
      expense_details,
      evidence_copy_url,
    } = req.body;

    // ---------------- VALIDATION ----------------
    if (!initiative || typeof initiative !== "string") {
      return res.status(400).json({ error: "Initiative is required" });
    }

    const amountNum = Number(amount);

    if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    // ---------------- NORMALIZATION ----------------
    initiative = initiative.trim();

    const now = new Date();
    const year = now.getFullYear();

    // ---------------- CREATE ----------------
    const expenditure = await Expenditure.create({
      initiative,
      amount: amountNum,
      date: now,
      year,
      invoice_number: invoice_number?.trim() || null,
      by_whom: by_whom?.trim() || null,
      expense_details: expense_details?.trim() || null,
      evidence_copy_url: evidence_copy_url?.trim() || null,
    });

    return res.status(201).json({
      message: "Expenditure recorded successfully",
      expenditure: {
        expenditure_id: expenditure.expenditure_id,
        initiative: expenditure.initiative,
        amount: expenditure.amount,
        date: expenditure.date,
        year: expenditure.year,
      },
    });
  } catch (error) {
    console.error("Error adding expenditure:", error);
    return res.status(500).json({
      error: "Failed to record expenditure",
    });
  }
};

// ================= GET EXPENDITURE HISTORY =================
export const getExpenditureHistory = async (req, res) => {
  try {
    let { year, limit = 50 } = req.query;

    // ---------------- SANITIZE LIMIT ----------------
    limit = Number(limit);
    if (isNaN(limit) || limit <= 0) limit = 50;
    if (limit > 200) limit = 200; //  prevent abuse

    // ---------------- WHERE CLAUSE ----------------
    const whereClause = {};

    if (year) {
      const parsedYear = Number(year);
      if (!isNaN(parsedYear)) {
        whereClause.year = parsedYear;
      }
    }

    // ---------------- QUERY ----------------
    const expenditures = await Expenditure.findAll({
      where: whereClause,
      order: [["date", "DESC"]],
      limit,
    });

    return res.json({ expenditures });
  } catch (error) {
    console.error("Error fetching expenditure history:", error);
    return res.status(500).json({
      error: "Failed to fetch expenditure history",
    });
  }
};
