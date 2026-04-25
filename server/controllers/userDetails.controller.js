//server\controllers\userDetails.controller.js

import User from "../models/user/User.js";
import UserDetails from "../models/user/UserDetails.js";
import UserAddress from "../models/user/UserAddress.js";
import Country from "../models/locations/Country.js";
import State from "../models/locations/State.js";
import District from "../models/locations/District.js";

export const getUserTypeFromEmployment = (occupation_status) => {
  if (occupation_status === "working") return "professional";
  if (occupation_status === "student") return "student";
  if (occupation_status === "retired") return "retired";
  if (occupation_status === "not_working") return "student"; // adjust if needed
  return null;
};

const getUserMetaFromDOB = (dob) => {
  if (!dob) return { age: null, user_type: null };

  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 16) return { age, user_type: "student" };
  if (age >= 60) return { age, user_type: "retired" };

  return { age, user_type: "unknown" };
};
/* ---------------- CONSTANTS ---------------- */
const allowedSalutations = ["Mr", "Ms", "Mrs", "Dr", "Prof"];
const allowedGender = ["male", "female", "other"];

/* ---------------- URL VALIDATOR ---------------- */
const validateUrl = (url) => {
  if (!url) return true;
  const pattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]{2,}(\/\S*)?$/;
  return pattern.test(url);
};

/* ---------------- VALIDATION FUNCTION ---------------- */
const validateUserDetails = (body) => {
  const {
    salutation,
    gender,
    father_phone,
    whatsapp,
    date_of_birth,
    facebook,
    instagram,
    twitter,
    youtube,
    github,
    website,
  } = body;

  if (salutation && !allowedSalutations.includes(salutation)) {
    return "Invalid salutation";
  }

  if (gender && !allowedGender.includes(gender)) {
    return "Invalid gender";
  }

  if (father_phone && !/^\d{10}$/.test(father_phone)) {
    return "Invalid phone number";
  }

  if (whatsapp && !/^\d{10}$/.test(whatsapp)) {
    return "Invalid WhatsApp number";
  }

  if (date_of_birth) {
    const dob = new Date(date_of_birth);
    const today = new Date();
    const minDate = new Date("1900-01-01");

    if (isNaN(dob.getTime())) {
      return "Invalid date of birth";
    }

    if (dob > today) {
      return "Date of birth cannot be in the future";
    }

    if (dob < minDate) {
      return "Date of birth cannot be before 1900";
    }
  }

  const socialLinks = {
    facebook,
    instagram,
    twitter,
    youtube,
    github,
    website,
  };

  for (const [platform, url] of Object.entries(socialLinks)) {
    if (url && !validateUrl(url)) {
      return `Invalid ${platform} URL`;
    }
  }

  return null;
};

/* ---------------- CREATE OR UPDATE USER DETAILS ---------------- */
export const upsertUserDetails = async (req, res) => {
  try {
    const user_id = req.user.id;

    /*  Check user existence */
    const userExists = await User.findByPk(user_id);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    /*  Validate input */
    const validationError = validateUserDetails(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const data = { user_id };

    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key];
      }
    });

    const { date_of_birth } = req.body;

    if (date_of_birth) {
      const { age } = getUserMetaFromDOB(date_of_birth);
      data.age = age;
    }

    //  already existing
    const { occupation_status } = req.body;

    if (occupation_status !== undefined) {
      data.user_type = getUserTypeFromEmployment(occupation_status);
    }

    /*  UPSERT (atomic operation) */
    await UserDetails.upsert(data);

    return res.status(200).json({
      message: "User details saved successfully",
    });
  } catch (err) {
    console.error("UserDetails error:", err.message);

    return res.status(500).json({
      error: "Failed to save user details",
    });
  }
};
export const updateEmploymentStatus = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { isWorking } = req.body;

    const occupation_status = isWorking ? "working" : "not_working";
    const user_type = getUserTypeFromEmployment(occupation_status);

    await UserDetails.update(
      { user_type, occupation_status },
      { where: { user_id } },
    );

    return res.json({
      message: "Employment status updated",
      user_type,
      occupation_status,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update" });
  }
};
/* ---------------- GET USER DETAILS ---------------- */
export const getUserDetails = async (req, res) => {
  try {
    const user_id = req.user.id || req.params.user_id;

    const user = await User.findByPk(user_id, {
      include: [
        {
          model: UserDetails,
          as: "details",
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

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      user_id: user.user_id,
      details: user.details?.get({ plain: true }) || null,
      addresses: Array.isArray(user.addresses)
        ? user.addresses.map((addr) => addr.get({ plain: true }))
        : [],
    });
  } catch (err) {
    console.error("getUserDetails error:", err.message);

    return res.status(500).json({
      error: "Failed to fetch user details",
    });
  }
};

/* ---------------- DELETE USER DETAILS ---------------- */
export const deleteUserDetails = async (req, res) => {
  try {
    const user_id = req.user.id;

    /* Check user existence */
    const userExists = await User.findByPk(user_id);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    /*  Delete related data */
    await UserDetails.destroy({ where: { user_id } });
    await UserAddress.destroy({ where: { user_id } });

    return res.status(200).json({
      message: "User details and related data deleted successfully",
    });
  } catch (err) {
    console.error("deleteUserDetails error:", err.message);

    return res.status(500).json({
      error: "Failed to delete user details",
    });
  }
};
