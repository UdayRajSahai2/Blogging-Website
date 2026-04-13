import * as service from "../services/userInterests.service.js";

// =========================
// 🛠️ HELPER
// =========================
const sendSuccess = (res, data) => {
  res.json({ success: true, data });
};

const sendError = (res, err) => {
  console.error("ERROR:", err);

  const message = err.message || "Internal Server Error";

  let status = 500;

  if (message.includes("not found")) status = 404;
  else if (message.includes("Invalid")) status = 400;
  else if (message.includes("required")) status = 400;
  else if (message.includes("Only leaf")) status = 400;

  res.status(status).json({
    success: false,
    error: message,
  });
};

const validateId = (id) => id && !isNaN(id);

// =========================
// ✅ CREATE
// =========================
export const createInterest = async (req, res) => {
  try {
    const { name, parent_id } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (parent_id && isNaN(parent_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid parent_id",
      });
    }

    const data = await service.createInterest({ name, parent_id });
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
};

// =========================
// 🌳 GET TREE
// =========================
export const getInterestTree = async (req, res) => {
  try {
    const data = await service.getInterestTree();
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
};

// =========================
// 📋 GET ALL
// =========================
export const getAllInterests = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const data = await service.getAllInterests({
      page: Number(page),
      limit: Number(limit),
    });

    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
};

// =========================
// ➕ ADD USER INTERESTS
// =========================
export const addUserInterests = async (req, res) => {
  try {
    const { interest_ids } = req.body;

    if (!Array.isArray(interest_ids) || interest_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "interest_ids must be a non-empty array",
      });
    }

    if (interest_ids.some((id) => isNaN(id))) {
      return res.status(400).json({
        success: false,
        message: "All interest_ids must be numbers",
      });
    }

    const uniqueIds = [...new Set(interest_ids)];

    const data = await service.addUserInterests(req.userId, uniqueIds);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
};

// =========================
// 📥 GET USER INTERESTS
// =========================
export const getUserInterests = async (req, res) => {
  try {
    const data = await service.getUserInterests(req.userId);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
};

// =========================
// 🔁 REPLACE
// =========================
export const replaceUserInterests = async (req, res) => {
  try {
    const { interest_ids } = req.body;

    if (!Array.isArray(interest_ids)) {
      return res.status(400).json({
        success: false,
        message: "interest_ids must be an array",
      });
    }

    if (interest_ids.some((id) => isNaN(id))) {
      return res.status(400).json({
        success: false,
        message: "All interest_ids must be numbers",
      });
    }

    const uniqueIds = [...new Set(interest_ids)];

    const data = await service.replaceUserInterests(req.userId, uniqueIds);

    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
};

// =========================
// ❌ DELETE INTEREST (ADMIN)
// =========================
export const deleteInterest = async (req, res) => {
  try {
    const { interest_id } = req.params;

    if (!validateId(interest_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interest_id",
      });
    }

    const data = await service.deleteInterest(interest_id);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
};

// =========================
// ❌ REMOVE USER INTEREST
// =========================
export const removeUserInterest = async (req, res) => {
  try {
    const { interest_id } = req.params;

    if (!validateId(interest_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interest_id",
      });
    }

    const data = await service.removeUserInterest(req.userId, interest_id);

    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
};

// =========================
// 🧭 GET INTEREST PATH
// =========================
export const getInterestPath = async (req, res) => {
  try {
    const { interest_id } = req.params;

    if (!validateId(interest_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interest_id",
      });
    }

    const data = await service.getInterestPath(interest_id);
    sendSuccess(res, data);
  } catch (err) {
    sendError(res, err);
  }
};
