//server\services\experience.service.js
import ProfessionalExperience from "../models/user/ProfessionalExperience.js";
import { Profession } from "../models/associations.js";

export const getUserExperiences = async (user_id) => {
  return await ProfessionalExperience.findAll({
    where: { user_id },

    include: [
      {
        model: Profession,
        as: "profession",
        attributes: ["profession_id", "name"],
        required: false,
      },
    ],

    order: [["start_date", "DESC"]],
  });
};
