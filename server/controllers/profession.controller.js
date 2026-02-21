import { Profession } from "../models/associations.js";
import { Op } from "sequelize";
import sequelize from "../config/db.config.js";
import {
  importProfessionData,
  getProfessionStats,
} from "../utils/import-profession-data.js";
import { getProfessionNamesFromProfileId } from "../utils/profile-id.generator.js";

// --- PROFILE ID MANAGEMENT ENDPOINTS ---

// // Import profession data from JSON file (admin endpoint)
export const importProfessions = async (req, res) => {
  try {
    const { importProfessionData } =
      await import("../utils/import-profession-data.js");
    const result = await importProfessionData();

    return res.status(200).json({
      message: "Profession data imported successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error importing profession data:", error);
    return res.status(500).json({
      error: "Failed to import profession data",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

// Get all domains (level 0)
export const getDomains = async (req, res) => {
  try {
    const domains = await Profession.findAll({
      where: {
        level: 0,
        parent_id: null,
      },
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      message: "Domains retrieved successfully",
      data: domains,
    });
  } catch (error) {
    console.error("Error getting domains:", error);
    return res.status(500).json({
      error: "Failed to retrieve domains",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

// Get fields by domain_id
export const getFieldsByDomain = async (req, res) => {
  try {
    const { domain_id } = req.params;

    const fields = await Profession.findAll({
      where: {
        level: 1,
        parent_id: domain_id,
      },
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      message: "Fields retrieved successfully",
      data: fields,
    });
  } catch (error) {
    console.error("Error getting fields:", error);
    return res.status(500).json({
      error: "Failed to retrieve fields",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

// Get specialties by field_id
export const getSpecialtiesByField = async (req, res) => {
  try {
    const { field_id } = req.params;
    const { Op } = await import("sequelize");

    // Get detailed occupations (level 3) instead of broad groups (level 2)
    const specialties = await Profession.findAll({
      where: {
        level: 3,
        parent_id: {
          [Op.in]: sequelize.literal(`(
            SELECT profession_id FROM Professions
            WHERE level = 2 AND parent_id = ${field_id}
          )`),
        },
      },
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      message: "Specialties retrieved successfully",
      data: specialties,
    });
  } catch (error) {
    console.error("Error getting specialties:", error);
    return res.status(500).json({
      error: "Failed to retrieve specialties",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

// Get profession details by profile_id
export const getProfessionByProfileId = async (req, res) => {
  try {
    const { profile_id } = req.params;
    const professionDetails = await getProfessionNamesFromProfileId(profile_id);

    return res.status(200).json({
      message: "Profession details retrieved successfully",
      data: professionDetails,
    });
  } catch (error) {
    console.error("Error getting profession by profile_id:", error);
    return res.status(400).json({
      error: "Failed to retrieve profession details",
      details: error.message,
    });
  }
};

// Get profession stats
export const getProfessionStatistics = async (req, res) => {
  try {
    const { getProfessionStats } =
      await import("../utils/import-profession-data.js");
    const stats = await getProfessionStats();

    return res.status(200).json({
      message: "Profession statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error getting profession stats:", error);
    return res.status(500).json({
      error: "Failed to retrieve profession statistics",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};

// Search professions
export const searchProfessions = async (req, res) => {
  try {
    const { query, level } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        error: "Search query must be at least 2 characters long",
      });
    }

    const { Profession } = await import("./Schema/associations.js");
    const { Op } = await import("sequelize");

    const whereClause = {
      name: {
        [Op.like]: `%${query.trim()}%`,
      },
    };

    if (level !== undefined) {
      whereClause.level = parseInt(level);
    }

    const results = await Profession.findAll({
      where: whereClause,
      limit: 10,
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      message: "Profession search completed successfully",
      data: results,
    });
  } catch (error) {
    console.error("Error searching professions:", error);
    return res.status(500).json({
      error: "Failed to search professions",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
};
