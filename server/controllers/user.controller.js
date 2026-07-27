//server\controllers\user.controller.js
import User from "../models/user/User.js";
import Profession from "../models/Profession.js";
import UserDetails from "../models/user/UserDetails.js";
import UserAddress from "../models/user/UserAddress.js";
import Country from "../models/locations/Country.js";
import State from "../models/locations/State.js";
import District from "../models/locations/District.js";
import { Op } from "sequelize";
import sequelize from "../config/db.config.js";

import { assignCustomerLocation } from "../services/locationService.js";
import { getUserAcademics } from "../services/academic.service.js";
import { getUserExperiences } from "../services/experience.service.js";
import { getUserInterests } from "../services/userInterests.service.js";
import { generateOTP, sendSMSOTP } from "../services/otp.service.js";
import { generateProfileId } from "../services/profile-id.service.js";
import { getUserType } from "./userDetails.controller.js";

import {
  createEnrollment,
  getEnrollmentByUserId,
} from "../services/userService.js";

import { sendAdminSignupNotification } from "../services/email.service.js";

export const searchUsers = async (req, res) => {
  const query = (req.body.query || req.query.query || "").trim();

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const { role } = req.body; // optional filter

    const users = await User.findAll({
      where: {
        system_role: {
          [Op.notIn]: ["admin", "super_admin"],
        },
        [Op.or]: [
          { username: { [Op.like]: `%${query}%` } },
          { fullname: { [Op.like]: `%${query}%` } },
        ],
      },
      limit: 50,
      attributes: ["user_id", "fullname", "username", "profile_img"],
      order: [["username", "ASC"]],
    });

    return res.status(200).json({ users });
  } catch (err) {
    console.error("Error searching users:", err);
    return res.status(500).json({ error: "Failed to search users" });
  }
};

export const updateProfileImage = async (req, res) => {
  try {
    const { profile_img } = req.body;
    const userId = req.user.id;

    console.log(
      "Updating profile image for user:",
      userId,
      "URL:",
      profile_img,
    );

    if (!profile_img) {
      return res.status(400).json({ error: "Profile image URL is required" });
    }

    await User.update({ profile_img }, { where: { user_id: userId } });

    return res.status(200).json({
      message: "Profile image updated successfully",
      profile_img,
    });
  } catch (err) {
    console.error("Error updating profile image:", err);
    return res.status(500).json({
      error: "Failed to update profile image",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { username, user_id } = req.body;

    let user;

    //  SUPPORT BOTH
    if (user_id) {
      user = await User.findOne({
        where: { user_id },
        attributes: {
          exclude: ["password", "google_auth", "updatedAt"],
          include: [
            "current_latitude",
            "current_longitude",
            "display_location",
            "current_city",
            "current_state",
            "current_country",
          ],
        },
        include: [
          {
            model: Profession,
            as: "profession",
            attributes: ["profession_id", "name", "level"],
            required: false,
          },
          {
            model: UserDetails,
            as: "details",
            required: false,
          },
          {
            model: UserAddress,
            as: "addresses",
            include: [
              {
                model: Country,
                as: "countryDetails",
                attributes: ["country_name", "country_code"],
              },
              {
                model: State,
                as: "stateDetails",
                attributes: ["state_name", "state_code"],
              },
              {
                model: District,
                as: "districtDetails",
                attributes: ["district_name", "district_code"],
              },
            ],
          },
        ],
      });
    } else if (username) {
      user = await User.findOne({
        where: { username },
        attributes: {
          exclude: ["password", "google_auth", "updatedAt"],
          include: [
            "current_latitude",
            "current_longitude",
            "display_location",
            "current_city",
            "current_state",
            "current_country",
          ],
        },
        include: [
          {
            model: Profession,
            as: "profession",
            attributes: ["profession_id", "name", "level"],
            required: false,
          },
          {
            model: UserDetails,
            as: "details",
            required: false,
          },
          {
            model: UserAddress,
            as: "addresses",
            required: false,
            include: [
              {
                model: Country,
                as: "countryDetails",
                attributes: ["country_name", "country_code"],
                required: false,
              },
              {
                model: State,
                as: "stateDetails",
                attributes: ["state_name", "state_code"],
                required: false,
              },
              {
                model: District,
                as: "districtDetails",
                attributes: ["district_name", "district_code"],
                required: false,
              },
            ],
          },
        ],
      });
    } else {
      return res.status(400).json({ error: "username or user_id required" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const experiences = await getUserExperiences(user.user_id);
    const academics = await getUserAcademics(user.user_id);
    const interests = await getUserInterests(user.user_id);

    const safeUser = user.toJSON();

    safeUser.details = safeUser.details || {};
    safeUser.isOnboardingCompleted = safeUser.is_onboarding_completed;

    const isEmployed = safeUser?.details?.employment_status === "employed";

    const allowedTypes = isEmployed
      ? ["personal", "office", "work"]
      : ["personal"];

    safeUser.addresses = (safeUser.addresses || []).filter((addr) =>
      allowedTypes.includes(addr.type),
    );

    safeUser.experiences = Array.isArray(experiences)
      ? experiences.map((exp) => exp.toJSON())
      : [];
    safeUser.academics = Array.isArray(academics) ? academics : [];
    safeUser.interests = Array.isArray(interests) ? interests : [];

    return res.status(200).json(safeUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;

    const {
      username,
      bio,

      profession_id,
      domain_id,
      field_id,
      specialty_id,
    } = req.body;

    /* ---------- USERNAME VALIDATION ---------- */

    if (!username || username.length < 3) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ error: "Username must be at least 3 characters" });
    }

    const existingUser = await User.findOne({
      where: {
        username,
        user_id: { [Op.ne]: userId },
      },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({ error: "Username is already taken" });
    }

    /* ---------- PROFESSION LOGIC ---------- */

    let finalProfessionId = profession_id;
    let profile_id = null;

    if (domain_id && field_id && specialty_id) {
      try {
        const professionResult = await generateProfileId(
          domain_id,
          field_id,
          specialty_id,
        );

        profile_id = professionResult.profile_id;
        finalProfessionId = specialty_id;
      } catch (error) {
        await transaction.rollback();
        return res.status(400).json({
          error: "Invalid profession selection",
          details: error.message,
        });
      }
    }

    /* ---------- UPDATE USER ---------- */

    const updateData = {
      username,
      bio,
    };

    if (finalProfessionId !== undefined) {
      updateData.profession_id = finalProfessionId;
    }

    if (profile_id !== null) {
      updateData.profile_id = profile_id;
    }

    await User.update(updateData, {
      where: { user_id: userId },
      transaction,
    });

    /* ---------- UPSERT User  ADDRESS ---------- */

    const isEmployed = req.body.employment_status === "employed";

    const ADDRESS_TYPES = isEmployed
      ? ["personal", "office", "work"]
      : ["personal"];

    for (const type of ADDRESS_TYPES) {
      await UserAddress.upsert(
        {
          user_id: userId,
          type,
          street: req.body[`${type}_street`] || null,
          city: req.body[`${type}_city`] || null,

          state_code: req.body[`${type}_state_code`] || null,
          country_code: req.body[`${type}_country_code`] || null,
          district_code: req.body[`${type}_district_code`] || null,

          zip_code: req.body[`${type}_zip_code`] || null,
        },
        { transaction },
      );
    }

    await transaction.commit();

    /* ---------- FETCH UPDATED USER ---------- */

    const updatedUser = await User.findOne({
      where: { user_id: userId },
      attributes: { exclude: ["password", "google_auth"] },
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    await transaction.rollback();

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
    const userId = req.user.id;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({
        error: "Latitude and longitude are required",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    /* 🔥 HARD THROTTLE (MOST IMPORTANT FIX) */
    const lastUpdate = user.location_updated_at;

    if (
      lastUpdate &&
      new Date() - new Date(lastUpdate) < 60 * 1000 // 1 minute
    ) {
      return res.status(200).json({
        message: "Skipped (recent update)",
        display_location: user.display_location,
      });
    }

    const updatedUser = await assignCustomerLocation(user, latitude, longitude);

    return res.status(200).json({
      message: "Location updated",
      display_location: updatedUser.display_location,
    });
  } catch (error) {
    console.error("[updateLocation]", error);
    return res.status(500).json({ error: "Failed to update location" });
  }
};

// POST /toggle-location-privacy
export const toggleLocationPrivacy = async (req, res) => {
  try {
    const userId = req.user.id;
    const { is_public } = req.body;
    if (typeof is_public !== "boolean") {
      return res.status(400).json({ error: "is_public must be a boolean" });
    }
    const user = await User.findByPk(userId);
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
  const { role } = req.body;
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

    const roleFilter = {
      system_role: {
        [Op.notIn]: ["admin", "super_admin"],
      },
    };

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
        ...roleFilter,
        is_location_public: true,
        current_latitude: { [Op.ne]: null },
        current_longitude: { [Op.ne]: null },
        ...(profession_id ? { profession_id } : {}),
      },
      include: [
        {
          model: Profession,
          as: "profession",
          attributes: ["name"],
        },
        {
          model: UserDetails, //  ADD THIS
          as: "details", // must match your association
          attributes: [
            "salutation",
            "gender",
            "marital_status",
            "date_of_birth",
          ],
        },
      ],
      attributes: [
        "user_id",
        "fullname",
        "username",
        "profile_img",
        "bio",
        "profile_id",
        "profession_id",
        "display_location",
        [haversinePublic, "distance"],
      ],
      having: sequelize.literal(`distance <= ${radius_km}`),
      order: [["distance", "ASC"]],
      limit,
    });

    // fallback
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
          ...roleFilter,
          current_latitude: { [Op.ne]: null },
          current_longitude: { [Op.ne]: null },
          ...(profession_id ? { profession_id } : {}),
        },
        attributes: [
          "user_id",
          "fullname",
          "username",
          "profile_img",
          "bio",
          "profile_id",
          "profession_id",
          "display_location",
          [haversine, "distance"],
        ],
        include: [
          {
            model: Profession,
            as: "profession",
            attributes: ["name"],
          },
          {
            model: UserDetails,
            as: "details", // must match your association
            attributes: [
              "salutation",
              "gender",
              "marital_status",
              "date_of_birth",
            ],
          },
        ],
        having: sequelize.literal(`distance <= ${radius_km}`),
        order: [["distance", "ASC"]],
        limit,
      });
    }

    //  ADD (IMPORTANT)
    const safeArray = (data) => (Array.isArray(data) ? data : []);

    const usersWithExperiences = await Promise.all(
      safeArray(users).map(async (user) => {
        const plainUser = user?.toJSON ? user.toJSON() : user || {};

        const experiencesRaw = await getUserExperiences(plainUser.user_id);

        return {
          ...plainUser,

          // ensure always object
          details: plainUser.details || {},

          // ensure always array
          experiences: safeArray(experiencesRaw).map((exp) =>
            exp?.toJSON ? exp.toJSON() : exp,
          ),

          //  prevent toFixed crash
          distance:
            plainUser.distance != null ? Number(plainUser.distance) : null,
        };
      }),
    );

    // REPLACE RETURN
    return res.status(200).json({
      success: true,
      users: usersWithExperiences || [],
      count: usersWithExperiences?.length || 0,
      search_radius: radius_km,
    });
  } catch (error) {
    console.error("Error finding nearby users:", error);
    return res.status(500).json({
      success: false,
      users: [],
      error: "Failed to find nearby users",
    });
  }
};

export const sendMobileUpdateOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mobile_number } = req.body;

    if (!mobile_number) {
      return res.status(400).json({ error: "Mobile number required" });
    }

    if (!/^[6-9]\d{9}$/.test(mobile_number)) {
      return res.status(400).json({ error: "Invalid mobile number" });
    }

    const existingUser = await User.findOne({
      where: { mobile_number },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Mobile number already in use",
      });
    }

    const otp = generateOTP();

    await User.update(
      {
        mobile_otp: otp,
        otp_expires_at: new Date(Date.now() + 5 * 60 * 1000),
        temp_mobile_number: mobile_number, // only this is new
      },
      { where: { user_id: userId } },
    );

    await sendSMSOTP(mobile_number, otp);

    return res.status(200).json({
      message: "OTP sent",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
export const verifyMobileUpdateOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otp } = req.body;

    const user = await User.findByPk(userId);

    if (!user || !user.mobile_otp) {
      return res.status(400).json({ error: "No OTP request found" });
    }

    if (new Date() > user.otp_expires_at) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (String(otp) !== String(user.mobile_otp)) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    await User.update(
      {
        mobile_number: user.temp_mobile_number,
        temp_mobile_number: null,
        mobile_otp: null,
        otp_expires_at: null,
        mobile_verified: true,
      },
      { where: { user_id: userId } },
    );

    return res.status(200).json({
      message: "Mobile updated successfully",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

//User-Enrollment
export const createEnrollmentController = async (req, res) => {
  try {
    const enrollment = await createEnrollment(req.body);

    const user = await User.findByPk(enrollment.user_id);

    try {
      await sendAdminSignupNotification(user, enrollment);
    } catch (err) {
      console.error("Enrollment email failed:", err);
    }

    return res.status(201).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error("Create Enrollment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create enrollment",
    });
  }
};

export const getEnrollmentByUserController = async (req, res) => {
  try {
    const { user_id } = req.params;

    const enrollment = await getEnrollmentByUserId(user_id);

    return res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    console.error("Get Enrollment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrollment",
    });
  }
};
