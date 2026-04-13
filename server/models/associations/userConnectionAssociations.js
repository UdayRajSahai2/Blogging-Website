import User from "../user/User.js";
import UserConnection from "../user/UserConnection.js";

const setupUserConnectionAssociations = () => {
  console.log("🔗 UserConnection associations...");

  UserConnection.belongsTo(User, {
    foreignKey: "sender_id",
    as: "sender",
    constraints: false,
  });

  UserConnection.belongsTo(User, {
    foreignKey: "receiver_id",
    as: "receiver",
    constraints: false,
  });

  User.hasMany(UserConnection, {
    foreignKey: "sender_id",
    as: "sentConnections",
    constraints: false,
  });

  User.hasMany(UserConnection, {
    foreignKey: "receiver_id",
    as: "receivedConnections",
    constraints: false,
  });

  console.log("✅ UserConnection associations ready");
};

export default setupUserConnectionAssociations;
