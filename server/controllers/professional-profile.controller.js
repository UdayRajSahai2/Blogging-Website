//server\controllers\professional-profile.controller.js
import ProfessionalExperience from "../models/user/ProfessionalExperience.js";
import {
  getUserExperiences,
  getExperienceByIdService,
} from "../services/experience.service.js";
import Profession from "../models/Profession.js";
/*
|--------------------------------------------------------------------------
| FIELD WHITELISTS
|--------------------------------------------------------------------------
*/

// EXPERIENCE
const allowedExperienceFields = [
  "profession_id",
  "employer_name",
  "industry",
  "designation",
  "employment_type",
  "start_date",
  "end_date",
  "is_current",
  "city",
  "state",
  "country",
  "roles_responsibilities",
  "achievements",
];

/*
|--------------------------------------------------------------------------
| HELPER: PICK ALLOWED FIELDS
|--------------------------------------------------------------------------
*/
const pickFields = (source, allowedFields) => {
  const data = {};
  for (const key of allowedFields) {
    if (source[key] !== undefined) {
      data[key] = source[key];
    }
  }
  return data;
};

const validateExperience = (body) => {
  if (body.roles_responsibilities?.length > 3000) {
    return "Roles & Responsibilities is too long";
  }

  if (body.achievements?.length > 2000) {
    return "Achievements is too long";
  }

  return null;
};
/*
|--------------------------------------------------------------------------
| GET PROFESSIONAL PROFILE
|--------------------------------------------------------------------------
*/
export const getProfessionalProfile = async (req, res) => {
  try {
    const user_id = req.params.user_id || req.user.id;

    const experiences = await getUserExperiences(user_id);

    const safeExperiences = Array.isArray(experiences)
      ? experiences.map((exp) => exp.toJSON())
      : [];

    return res.json({
      success: true,
      data: { experiences: safeExperiences },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching professional profile",
    });
  }
};

export const getExperienceById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await getExperienceByIdService(id, req.user.id);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| EXPERIENCE CRUD
|--------------------------------------------------------------------------
*/

export const addExperience = async (req, res) => {
  try {
    const error = validateExperience(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error,
      });
    }
    const user_id = req.user.id;

    const data = pickFields(req.body, allowedExperienceFields);

    const experience = await ProfessionalExperience.create({
      ...data,
      user_id,
    });

    // FETCH FULL DATA WITH RELATION
    const fullExperience = await ProfessionalExperience.findByPk(
      experience.id,
      {
        include: [
          {
            model: Profession,
            as: "profession",
            attributes: ["profession_id", "name"],
          },
        ],
      },
    );

    return res.status(201).json({
      success: true,
      message: "Experience added successfully",
      data: fullExperience,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error adding experience",
    });
  }
};

export const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await ProfessionalExperience.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    const updateData = pickFields(req.body, allowedExperienceFields);

    if (!Object.keys(updateData).length) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided",
      });
    }

    await experience.update(updateData);

    // FETCH FULL UPDATED DATA WITH RELATION
    const updatedExperience = await ProfessionalExperience.findByPk(id, {
      include: [
        {
          model: Profession,
          as: "profession",
          attributes: ["profession_id", "name"],
        },
      ],
    });

    return res.json({
      success: true,
      message: "Experience updated",
      data: updatedExperience,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error updating experience",
    });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await ProfessionalExperience.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    await experience.destroy();

    return res.json({
      success: true,
      message: "Experience deleted",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error deleting experience",
    });
  }
};
