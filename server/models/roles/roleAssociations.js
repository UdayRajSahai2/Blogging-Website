import User from "../user/User.js";
import Role from "./Role.js";
import UserRole from "./UserRole.js";

const setupRoleAssociations = () => {
  // ===============================
  // MANY-TO-MANY (User ↔ Role)
  // ===============================
  User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: "user_id",
    otherKey: "role_id",
  });

  Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: "role_id",
    otherKey: "user_id",
  });

  // ===============================
  // DIRECT RELATIONS (WITH ALIAS 🔥)
  // ===============================
  User.hasMany(UserRole, {
    foreignKey: "user_id",
    as: "userRoles",
  });

  Role.hasMany(UserRole, {
    foreignKey: "role_id",
    as: "userRoles",
  });

  UserRole.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  UserRole.belongsTo(Role, {
    foreignKey: "role_id",
    as: "role",
  });

  console.log("✅ Role associations initialized");
};

export default setupRoleAssociations;
