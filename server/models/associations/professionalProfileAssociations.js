import User from "../../models/user/User.js";
import ProfessionalExperience from "../user/ProfessionalExperience.js";
import { Profession } from "../associations.js";

const professionalProfileAssociations = () => {
  /*
  |--------------------------------------------------------------------------
  | USER -> EXPERIENCES
  |--------------------------------------------------------------------------
  */

  User.hasMany(ProfessionalExperience, {
    foreignKey: "user_id",
    as: "experiences",
    onDelete: "CASCADE",
    constraints: false,
  });

  ProfessionalExperience.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
    constraints: false,
  });

  /*
  |--------------------------------------------------------------------------
  | EXPERIENCE -> PROFESSION (FIXED)
  |--------------------------------------------------------------------------
  */

  ProfessionalExperience.belongsTo(Profession, {
    foreignKey: "profession_id",
    targetKey: "profession_id", // ✅ CRITICAL FIX
    as: "profession",
    constraints: false,
  });

  Profession.hasMany(ProfessionalExperience, {
    foreignKey: "profession_id",
    sourceKey: "profession_id", // ✅ IMPORTANT
    as: "experiences",
    constraints: false,
  });
};

export default professionalProfileAssociations;
