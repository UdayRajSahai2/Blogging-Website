//server\controllers\profile.controller.js
import { fetchSimilarProfiles } from "../services/profile.service.js";

//Similar profiles
export const getSimilarProfiles = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const data = await fetchSimilarProfiles(Number(userId));

    return res.status(200).json({
      data,
    });
  } catch (err) {
    console.error("Similar profiles error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
