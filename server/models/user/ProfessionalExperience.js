import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";

const ProfessionalExperience = sequelize.define(
  "ProfessionalExperience",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },

    profession_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // should be required
      references: {
        model: "Professions",
        key: "profession_id",
      },
    },

    employer_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    industry: {
      type: DataTypes.STRING,
    },

    employer_type: {
      type: DataTypes.ENUM(
        "Corporate",
        "Startup",
        "SME",
        "Govt",
        "NGO",
        "Self-employed",
        "Freelance",
      ),
    },

    designation: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    employment_type: {
      type: DataTypes.ENUM(
        "Full-time",
        "Part-time",
        "Contract",
        "Internship",
        "Temporary",
        "Consultant",
      ),
      allowNull: false,
    },

    experience_type: {
      type: DataTypes.ENUM(
        "employment",
        "practice",
        "consulting",
        "freelance",
        "training",
      ),
      defaultValue: "employment",
    },

    location_type: {
      type: DataTypes.ENUM("onsite", "remote", "hybrid"),
    },

    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: { isDate: true },
    },

    end_date: {
      type: DataTypes.DATEONLY,
      validate: { isDate: true },
    },

    is_current: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    city: {
      type: DataTypes.STRING,
    },

    state: {
      type: DataTypes.STRING,
    },

    country: {
      type: DataTypes.STRING,
    },

    roles_responsibilities: {
      type: DataTypes.TEXT,
    },

    achievements: {
      type: DataTypes.TEXT,
    },

    experience_document_url: {
      type: DataTypes.STRING,
      validate: { isUrl: true },
    },

    verification_status: {
      type: DataTypes.ENUM("pending", "verified", "rejected"),
      defaultValue: "pending",
    },

    verification_notes: {
      type: DataTypes.TEXT,
    },

    verified_by: {
      type: DataTypes.INTEGER,
    },

    verified_at: {
      type: DataTypes.DATE,
    },

    visibility: {
      type: DataTypes.ENUM("public", "private", "connections"),
      defaultValue: "public",
    },
  },
  {
    tableName: "professional_experiences",
    timestamps: true,
    paranoid: true, // soft delete (REMOVED is_active)

    indexes: [
      { fields: ["user_id"] },
      { fields: ["profession_id"] },
      { fields: ["is_current"] },
      { fields: ["user_id", "is_current"] },
    ],

    validate: {
      endDateAfterStart() {
        if (
          this.end_date &&
          this.start_date &&
          this.end_date < this.start_date
        ) {
          throw new Error("End date must be after start date");
        }
      },
    },
  },
);

export default ProfessionalExperience;
