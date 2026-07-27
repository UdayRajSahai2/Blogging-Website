import UserAcademic from "../user/UserAcademic.js";
import User from "../user/User.js";
const setupAcademicAssociations = () => {
  /* ======================================================
   USER ↔ ACADEMICS
====================================================== */

  // One user → many academic records
  User.hasMany(UserAcademic, {
    foreignKey: {
      name: "user_id",
      allowNull: false,
    },
    as: "academics",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    constraints: true,
  });

  // Each academic record belongs to one user
  UserAcademic.belongsTo(User, {
    foreignKey: {
      name: "user_id",
      allowNull: false,
    },
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    constraints: true,
  });
};

export default setupAcademicAssociations;
