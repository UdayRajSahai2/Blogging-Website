import { User, Profession } from "../models/associations.js";
import { Op } from "sequelize";
import sequelize from "../config/db.config.js";

export const searchUsers = async (req, res) => {
  let { query } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const users = await User.findAll({
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("username")),
        "LIKE",
        `%${query.toLowerCase()}%`,
      ),
      limit: 50,
      attributes: ["fullname", "username", "profile_img"],
      order: [["username", "ASC"]],
    });

    return res.status(200).json({ users });
  } catch (err) {
    console.error("Error searching users:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const { profile_img } = req.body;
    const user_id = req.user;

    if (!profile_img) {
      return res.status(400).json({ error: "Profile image URL is required" });
    }

    await User.update({ profile_img }, { where: { user_id } });

    return res.status(200).json({
      message: "Profile image updated successfully",
      profile_img,
    });
  } catch (err) {
    console.error("Error updating profile image:", err);
    return res.status(500).json({
      error: "Failed to update profile image",
      details: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { username } = req.body;

    // Find user and exclude sensitive fields
    const user = await User.findOne({
      where: { username },
      attributes: {
        exclude: ["password", "google_auth", "updateAt"],
      },
      include: [], // You can include associated models here if needed
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user_id = req.user;
    const {
      username,
      bio,
      facebook,
      instagram,
      twitter,
      youtube,
      github,
      website,
      personal_city,
      personal_country,
      personal_state,
      personal_street,
      personal_zip_code,
      profession_id, // Keep for backward compatibility
      // NEW FIELDS for hierarchy selection
      domain_id, // Level 0 profession
      field_id, // Level 1 profession
      specialty_id, // Level 2 profession
      professional_city,
      professional_country,
      professional_state,
      professional_street,
      professional_zip_code,
    } = req.body;

    // Validate username
    if (!username || username.length < 3) {
      return res
        .status(400)
        .json({ error: "Username must be at least 3 characters" });
    }

    // Check if username is already taken by another user
    const existingUser = await User.findOne({
      where: {
        username,
        user_id: { [Op.ne]: user_id },
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    // Validate social URLs if provided
    const validateUrl = (url) => {
      if (!url) return true;
      try {
        new URL(url.startsWith("http") ? url : `https://${url}`);
        return true;
      } catch {
        return false;
      }
    };

    if (facebook && !validateUrl(facebook)) {
      return res.status(400).json({ error: "Invalid Facebook URL" });
    }
    if (instagram && !validateUrl(instagram)) {
      return res.status(400).json({ error: "Invalid Instagram URL" });
    }
    if (twitter && !validateUrl(twitter)) {
      return res.status(400).json({ error: "Invalid Twitter URL" });
    }
    if (youtube && !validateUrl(youtube)) {
      return res.status(400).json({ error: "Invalid YouTube URL" });
    }
    if (github && !validateUrl(github)) {
      return res.status(400).json({ error: "Invalid GitHub URL" });
    }
    if (website && !validateUrl(website)) {
      return res.status(400).json({ error: "Invalid Website URL" });
    }
    // Handle profession hierarchy and profile_id generation
    let finalProfessionId = profession_id;
    let profile_id = null;

    // If domain->field->specialty selection is provided, use that
    if (domain_id && field_id && specialty_id) {
      try {
        const { generateProfileId } =
          await import("../utils/profile-id.generator.js");
        const professionResult = await generateProfileId(
          domain_id,
          field_id,
          specialty_id,
        );

        profile_id = professionResult.profile_id;
        finalProfessionId = specialty_id; // Store the most specific profession
      } catch (error) {
        console.error("Error generating profile_id:", error);
        return res.status(400).json({
          error: "Invalid profession selection",
          details: error.message,
        });
      }
    }

    // Prepare update data
    const updateData = {
      username,
      bio,
      facebook: facebook || null,
      instagram: instagram || null,
      twitter: twitter || null,
      youtube: youtube || null,
      github: github || null,
      website: website || null,
      personal_city: personal_city || null,
      personal_country: personal_country || null,
      personal_state: personal_state || null,
      personal_street: personal_street || null,
      personal_zip_code: personal_zip_code || null,
      profession_id: finalProfessionId || null,
      professional_city: professional_city || null,
      professional_country: professional_country || null,
      professional_state: professional_state || null,
      professional_street: professional_street || null,
      professional_zip_code: professional_zip_code || null,
    };

    // Only update profile_id if it was generated
    if (profile_id !== null) {
      updateData.profile_id = profile_id;
    }

    // Update user profile
    await User.update(updateData, {
      where: { user_id },
      returning: true,
      plain: true,
    });

    // Get updated user data
    const updatedUser = await User.findOne({
      where: { user_id },
      attributes: { exclude: ["password", "google_auth"] },
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({
      error: "Failed to update profile",
      details: process.env.NODE_ENV === "development" ? err.message : null,
    });
  }
};

// --- LOCATION TRACKING ENDPOINTS ---

// POST /update-location
export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const user_id = req.user;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({
        error: "Latitude and longitude are required and must be numbers",
      });
    }
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({ error: "Invalid latitude" });
    }
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: "Invalid longitude" });
    }

    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.update({
      current_latitude: latitude,
      current_longitude: longitude,
      location_updated_at: new Date(),
    });
    return res.status(200).json({
      message: "Location updated successfully",
      location: { latitude, longitude },
    });
  } catch (error) {
    console.error("Error updating location:", error);
    return res.status(500).json({ error: "Failed to update location" });
  }
};

// POST /toggle-location-privacy
export const toggleLocationPrivacy = async (req, res) => {
  try {
    const user_id = req.user;
    const { is_public } = req.body;
    if (typeof is_public !== "boolean") {
      return res.status(400).json({ error: "is_public must be a boolean" });
    }
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.update({ is_location_public: is_public });
    return res.status(200).json({
      message: `Location is now ${is_public ? "public" : "private"}`,
      is_location_public: is_public,
    });
  } catch (error) {
    console.error("Error toggling location privacy:", error);
    return res.status(500).json({ error: "Failed to update location privacy" });
  }
};

// POST /find-nearby-users
export const findNearbyUsers = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      radius_km = 10,
      profession_id = null,
      limit = 20,
      include_non_public = false,
    } = req.body;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({
        error: "Latitude and longitude are required and must be numbers",
      });
    }
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }
    const Op = sequelize.Sequelize.Op;
    const haversinePublic = sequelize.literal(`
      (6371 * acos(
        cos(radians(${latitude})) * 
        cos(radians(current_latitude)) * 
        cos(radians(current_longitude) - radians(${longitude})) + 
        sin(radians(${latitude})) * 
        sin(radians(current_latitude))
      ))
    `);
    let users = await User.findAll({
      where: {
        is_location_public: true,
        current_latitude: { [Op.ne]: null },
        current_longitude: { [Op.ne]: null },
        ...(profession_id ? { profession_id } : {}),
      },
      attributes: [
        "fullname",
        "username",
        "profile_img",
        "bio",
        "profile_id",
        "profession_id",
        [haversinePublic, "distance"],
      ],
      include: [
        {
          model: Profession,
          as: "profession",
          attributes: ["name"],
        },
      ],
      having: sequelize.literal(`distance <= ${radius_km}`),
      order: [["distance", "ASC"]],
      limit,
    });
    if ((!users || users.length === 0) && include_non_public === true) {
      const haversine = sequelize.literal(`
        (6371 * acos(
          cos(radians(${latitude})) * 
          cos(radians(current_latitude)) * 
          cos(radians(current_longitude) - radians(${longitude})) + 
          sin(radians(${latitude})) * 
          sin(radians(current_latitude))
        ))
      `);
      users = await User.findAll({
        where: {
          current_latitude: { [Op.ne]: null },
          current_longitude: { [Op.ne]: null },
          ...(profession_id ? { profession_id } : {}),
        },
        attributes: [
          "fullname",
          "username",
          "profile_img",
          "bio",
          "profile_id",
          "profession_id",
          [haversine, "distance"],
        ],
        include: [
          {
            model: Profession,
            as: "profession",
            attributes: ["name"],
          },
        ],
        having: sequelize.literal(`distance <= ${radius_km}`),
        order: [["distance", "ASC"]],
        limit,
      });
    }
    return res.status(200).json({
      users,
      count: users.length,
      search_radius: radius_km,
    });
  } catch (error) {
    console.error("Error finding nearby users:", error);
    return res.status(500).json({ error: "Failed to find nearby users" });
  }
};
