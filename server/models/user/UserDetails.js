import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";

const UserDetails = sequelize.define(
  "UserDetails",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "users",
        key: "user_id",
      },
    },

    salutation: {
      type: DataTypes.ENUM("Mr", "Ms", "Mrs", "Dr", "Prof"),
      allowNull: true,
    },

    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },

    marital_status: {
      type: DataTypes.ENUM("single", "married"),
      allowNull: true,
    },

    // ✅ NEW
    user_type: {
      type: DataTypes.ENUM("student", "professional", "retired", "unknown"),
      allowNull: true,
    },

    //  FIXED
    occupation_status: {
      type: DataTypes.ENUM("working", "not_working", "student", "retired"),
      allowNull: true,
    },

    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: true,
        isBeforeToday(value) {
          if (value && new Date(value) > new Date()) {
            throw new Error("Date of birth cannot be in the future");
          }
        },
      },
    },

    father_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    father_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    youtube: DataTypes.STRING,
    instagram: DataTypes.STRING,
    facebook: DataTypes.STRING,
    twitter: DataTypes.STRING,
    github: DataTypes.STRING,
    website: DataTypes.STRING,
    whatsapp: DataTypes.STRING,
  },
  {
    tableName: "user_details",
    timestamps: true,
  },
);
export default UserDetails;
