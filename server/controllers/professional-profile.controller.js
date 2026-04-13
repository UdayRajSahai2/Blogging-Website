import ProfessionalExperience from "../models/user/ProfessionalExperience.js";
import { getUserExperiences } from "../services/experience.service.js";
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
  "employer_type",
  "designation",
  "employment_type",
  "experience_type",
  "location_type",
  "start_date",
  "end_date",
  "is_current",
  "city",
  "state",
  "country",
  "roles_responsibilities",
  "achievements",
  "experience_document_url",
  "visibility",
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

/*
|--------------------------------------------------------------------------
| GET PROFESSIONAL PROFILE
|--------------------------------------------------------------------------
*/
export const getProfessionalProfile = async (req, res) => {
  try {
    const user_id = req.params.user_id || req.userId;

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

/*
|--------------------------------------------------------------------------
| EXPERIENCE CRUD
|--------------------------------------------------------------------------
*/

export const addExperience = async (req, res) => {
  try {
    const user_id = req.userId;

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
      where: { id, user_id: req.userId },
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
      where: { id, user_id: req.userId },
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
