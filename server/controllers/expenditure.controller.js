// ---------------- Models / Associations ----------------
import { Expenditure } from "../models/associations.js";

// Add expenditure (admin only - for now, any authenticated user can add)
export const addExpenditure = async (req, res) => {
  try {
    const {
      initiative,
      amount,
      invoice_number,
      by_whom,
      expense_details,
      evidence_copy_url,
    } = req.body;

    if (!initiative || !amount || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Initiative and valid amount are required" });
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear();

    const expenditure = await Expenditure.create({
      initiative,
      amount: parseFloat(amount),
      date: currentDate,
      year,
      invoice_number: invoice_number || null,
      by_whom: by_whom || null,
      expense_details: expense_details || null,
      evidence_copy_url: evidence_copy_url || null,
    });

    res.status(201).json({
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
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get expenditure history
export const getExpenditureHistory = async (req, res) => {
  try {
    const { year, limit = 50 } = req.query;

    const whereClause = {};
    if (year) {
      whereClause.year = parseInt(year);
    }

    const expenditures = await Expenditure.findAll({
      where: whereClause,
      order: [["date", "DESC"]],
      limit: parseInt(limit),
    });

    res.json({ expenditures });
  } catch (error) {
    console.error("Error fetching expenditure history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
