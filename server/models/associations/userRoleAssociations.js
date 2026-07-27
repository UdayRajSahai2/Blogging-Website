//server\models\associations\userRoleAssociations.js
import User from "../user/User.js";
import Role from "../roles/Role.js";
import UserRole from "../roles/UserRole.js";

// USER ROLE ASSOCIATIONS

const setupUserRoleAssociations = () => {
  /**
   * USER ↔ ROLE (MANY TO MANY via UserRole)
   */
  User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: "user_id",
    otherKey: "role_id",
    as: "roles",
  });

  Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: "role_id",
    otherKey: "user_id",
    as: "users",
  });

  /**
   * DIRECT ACCESS (for admin & joins)
   */
  UserRole.belongsTo(User, {
    foreignKey: "user_id",
    as: "user",
  });

  UserRole.belongsTo(Role, {
    foreignKey: "role_id",
    as: "role",
  });
};
export default setupUserRoleAssociations;
