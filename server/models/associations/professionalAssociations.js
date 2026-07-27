import User from "../user/User.js";
import ProfessionalExperience from "../user/ProfessionalExperience.js";
import Profession from "../Profession.js";

const setupProfessionalAssociations = () => {
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
  | EXPERIENCE -> PROFESSION
  |--------------------------------------------------------------------------
  */

  ProfessionalExperience.belongsTo(Profession, {
    foreignKey: "profession_id",
    targetKey: "profession_id",
    as: "profession",
    constraints: false,
  });

  Profession.hasMany(ProfessionalExperience, {
    foreignKey: "profession_id",
    sourceKey: "profession_id",
    as: "experiences",
    constraints: false,
  });

  // ================= PROFESSION =================
  Profession.hasMany(User, {
    foreignKey: "profession_id",
    as: "users",
  });

  Profession.belongsTo(Profession, {
    foreignKey: "parent_id",
    as: "parentProfession",
  });

  Profession.hasMany(Profession, {
    foreignKey: "parent_id",
    as: "childProfessions",
  });
};

export default setupProfessionalAssociations;
