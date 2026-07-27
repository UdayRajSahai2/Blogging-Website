import { Op } from "sequelize";

import User from "../models/user/User.js";
import UserAcademic from "../models/user/UserAcademic.js";
import ProfessionalExperience from "../models/user/ProfessionalExperience.js";
import Interest from "../models/user/Interest.js";
import UserDetails from "../models/user/UserDetails.js";
import Profession from "../models/Profession.js";

export const fetchSimilarProfiles = async (userId) => {
  try {
    // =========================
    // STEP 1: GET CURRENT USER
    // =========================
    const currentUser = await User.findByPk(userId, {
      include: [
        {
          model: UserAcademic,
          as: "academics",
        },
        {
          model: ProfessionalExperience,
          as: "experiences",
          include: [
            {
              model: Profession,
              as: "profession",
            },
          ],
        },
        {
          model: Interest,
          as: "Interests",
        },
        {
          model: UserDetails,
          as: "details",
          attributes: ["user_type"],
        },
      ],
    });

    if (!currentUser) {
      return [];
    }

    const normalize = (value) => value?.toString().trim().toLowerCase();

    const currentUserType = normalize(currentUser.details?.user_type);

    // =========================
    // STEP 2: GET ALL CANDIDATES
    // =========================
    const candidates = await User.findAll({
      where: {
        user_id: {
          [Op.ne]: userId,
        },
        system_role: {
          [Op.notIn]: ["admin", "superadmin"],
        },
      },

      include: [
        {
          model: UserAcademic,
          as: "academics",
        },
        {
          model: ProfessionalExperience,
          as: "experiences",
        },
        {
          model: Interest,
          as: "Interests",
        },
        {
          model: UserDetails,
          as: "details",
          attributes: ["user_type"],
        },
      ],

      order: [["user_id", "ASC"]],
      limit: 80,
    });

    // =========================
    // STEP 3: MATCH ONLY SAME USER TYPE
    // =========================
    const matchedUsers = candidates
      .filter((user) => normalize(user.details?.user_type) === currentUserType)
      .map((user) => {
        const experiences = user.experiences || [];

        const currentExperience =
          experiences.find((exp) => exp.is_current) || experiences[0] || null;
        return {
          user_id: user.user_id,
          username: user.username,
          fullname: user.fullname,
          display_location: user.display_location,
          bio: user.bio,
          profile_img: user.profile_img,

          user_type: user.details?.user_type,

          designation: currentExperience?.designation || "",
        };
      });

    // =========================
    // STEP 4: RETURN TOP 3
    // =========================
    return matchedUsers.slice(0, 3);
  } catch (error) {
    console.error("Similar profile error:", error);
    return [];
  }
};
