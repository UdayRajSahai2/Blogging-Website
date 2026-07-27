import User from "../user/User.js";
import Donor from "../Donor.js";
import Donation from "../Donation.js";
const setupDonationAssociations = () => {
  // ================= DONATIONS =================
  User.hasOne(Donor, {
    foreignKey: "user_id",
    sourceKey: "user_id",
    as: "donorProfile",
    onDelete: "CASCADE", // ensures donor removed if user deleted
    onUpdate: "CASCADE",
  });

  Donor.belongsTo(User, {
    foreignKey: "user_id",
    targetKey: "user_id",
    as: "user",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  Donor.hasMany(Donation, {
    foreignKey: "donor_id",
    as: "donations",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  });

  Donation.belongsTo(Donor, {
    foreignKey: "donor_id",
    as: "donor",
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  });

  Donation.belongsTo(User, {
    foreignKey: "user_id",
    targetKey: "user_id",
    as: "user",
    onDelete: "SET NULL", // financial history preserved
    onUpdate: "CASCADE",
  });
};
export default setupDonationAssociations;
