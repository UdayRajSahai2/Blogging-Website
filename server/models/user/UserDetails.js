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

    user_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [
          ["student", "professional", "working_student", "retired", "open"],
        ],
      },
    },

    employment_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [["employed", "not_working", "self_employed", "retired"]],
      },
    },

    education_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: [["student", "not_student"]],
      },
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

    alternate_mobile_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    father_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    father_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    blood_group: {
      type: DataTypes.ENUM("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"),
      allowNull: true,
    },

    // Social Links
    linkedin: DataTypes.STRING,
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
