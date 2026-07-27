//server\services\experience.service.js
import ProfessionalExperience from "../models/user/ProfessionalExperience.js";
import Profession from "../models/Profession.js";
import Country from "../models/locations/Country.js";
import State from "../models/locations/State.js";
import District from "../models/locations/District.js";

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

export const getExperienceByIdService = async (id, user_id) => {
  const experience = await ProfessionalExperience.findOne({
    where: { id, user_id },
    include: [
      {
        model: Profession,
        as: "profession",
        attributes: ["profession_id", "name"],
      },
    ],
  });

  if (!experience) {
    throw new Error("Experience not found");
  }

  const data = experience.toJSON();

  const country = await Country.findOne({
    where: { country_name: data.country },
  });

  const state = await State.findOne({
    where: {
      state_name: data.state,
      country_code: country?.country_code,
    },
  });

  const district = await District.findOne({
    where: {
      district_name: data.city,
      state_code: state?.state_code,
    },
  });

  return {
    ...data,
    country_code: country?.country_code || "",
    state_code: state?.state_code || "",
    district_code: district?.district_code || "",
  };
};
