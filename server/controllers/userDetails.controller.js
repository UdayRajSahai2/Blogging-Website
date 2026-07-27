// server\controllers\userDetails.controller.js

import User from "../models/user/User.js";
import UserDetails from "../models/user/UserDetails.js";
import UserAddress from "../models/user/UserAddress.js";
import Country from "../models/locations/Country.js";
import State from "../models/locations/State.js";
import District from "../models/locations/District.js";

export const getUserType = (employment_status, education_status) => {
  if (employment_status === "retired") return "retired";

  if (employment_status === "employed" && education_status === "student") {
    return "working_student";
  }

  if (employment_status === "employed") {
    return "professional";
  }

  if (education_status === "student") {
    return "student";
  }

  return "open";
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
// ADDED: Allowed blood groups constant
const allowedBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

/* ---------------- URL VALIDATOR ---------------- */
const validateUrl = (url) => {
  if (!url) return true;
  const pattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]{2,}(\/\S*)?$/;
  return pattern.test(url);
};

/* ---------------- VALIDATION FUNCTION ---------------- */
export const validateUserDetails = (body) => {
  const {
    salutation,
    gender,
    father_phone,
    alternate_mobile_number, // ADDED
    blood_group, // ADDED
    whatsapp,
    date_of_birth,
    facebook,
    instagram,
    twitter,
    youtube,
    github,
    website,
    linkedin, // ADDED
  } = body;

  if (salutation && !allowedSalutations.includes(salutation)) {
    return "Invalid salutation";
  }

  if (gender && !allowedGender.includes(gender)) {
    return "Invalid gender";
  }

  // ADDED: Validate blood group
  if (blood_group && !allowedBloodGroups.includes(blood_group)) {
    return "Invalid blood group";
  }

  if (father_phone && !/^\d{10}$/.test(father_phone)) {
    return "Invalid phone number";
  }

  // ADDED: Validate alternate mobile number (allows 10 digits or format with standard phone pattern)
  if (
    alternate_mobile_number &&
    !/^[+\d\s-()]{7,20}$/.test(alternate_mobile_number)
  ) {
    return "Invalid alternate mobile number";
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
    linkedin, // ADDED: linkedin to URL checks
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

    /* Sanitize inputs: Convert empty strings ("") to null so ENUM & validation pass */
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key] === "" ? null : req.body[key];
      }
    });

    const { date_of_birth } = req.body;

    if (date_of_birth) {
      const { age } = getUserMetaFromDOB(date_of_birth);
      data.age = age;
    }

    //  already existing
    const { employment_status, education_status } = req.body;

    if (employment_status || education_status) {
      data.user_type = getUserType(employment_status, education_status);
    }
    const allowedUserTypes = [
      "student",
      "professional",
      "working_student",
      "retired",
      "open",
    ];

    if (!allowedUserTypes.includes(data.user_type)) {
      data.user_type = "open";
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
    const { employment_status, education_status } = req.body;

    const user_type = getUserType(employment_status, education_status);

    await UserDetails.update(
      {
        employment_status,
        education_status,
        user_type,
      },
      {
        where: { user_id },
      },
    );

    return res.json({
      message: "Employment status updated",
      employment_status,
      education_status,
      user_type,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to update",
    });
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
