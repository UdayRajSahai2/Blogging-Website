import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";

const UserInterest = sequelize.define(
  "UserInterest",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "CASCADE",
    },

    interest_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "interests",
        key: "interest_id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "user_interests",
    timestamps: false,
  },
);

export default UserInterest;
