import User from "../user/User.js";
import Interest from "../user/Interest.js";
import UserInterest from "../user/UserInterest.js";

const setupUserInterestsAssociations = () => {
  // =========================
  // 👤 USER ↔ INTEREST (M:N)
  // =========================

  User.belongsToMany(Interest, {
    through: UserInterest,
    foreignKey: "user_id",
    otherKey: "interest_id",
    as: "Interests", // ✅ IMPORTANT (used in include)
    onDelete: "CASCADE",
  });

  Interest.belongsToMany(User, {
    through: UserInterest,
    foreignKey: "interest_id",
    otherKey: "user_id",
    as: "Users", // ✅ REQUIRED for COUNT query
    onDelete: "CASCADE",
  });

  // =========================
  // 🌳 INTEREST TREE (SELF)
  // =========================

  Interest.hasMany(Interest, {
    as: "children",
    foreignKey: "parent_id",
    onDelete: "CASCADE",
  });

  Interest.belongsTo(Interest, {
    as: "parent",
    foreignKey: "parent_id",
  });
};

export default setupUserInterestsAssociations;
