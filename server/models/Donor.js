import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Donor = sequelize.define(
  "Donor",
  {
    donor_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "user_id",
      },
    },
    customer_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
    },
    is_subscriber: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    subscription_type: {
      type: DataTypes.ENUM("one-time", "repeated"),
      allowNull: false,
      defaultValue: "one-time",
    },
    purpose: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    // Optional metadata for future expansion
    meta: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["user_id"], name: "donor_user_idx" },
      {
        fields: ["is_subscriber", "subscription_type"],
        name: "donor_subscription_idx",
      },
    ],
  },
);

export default Donor;
