// server/models/user/UserAcademic.js
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";

/* =========================
   INDIA LEVEL → TITLE MAP
========================= */
const LEVEL_TITLES = {
  School: [
    "class 1",
    "class 2",
    "class 3",
    "class 4",
    "class 5",
    "class 6",
    "class 7",
    "class 8",
    "class 9",
    "class 10",
    "class 11",
    "class 12",
  ],

  ITI: ["iti electrician", "iti fitter", "iti welder", "iti mechanic"],

  Diploma: [
    "diploma in engineering",
    "diploma in polytechnic",
    "diploma in computer science",
    "diploma in mechanical",
    "diploma in civil",
    "diploma in electrical",
  ],

  UG: [
    "b.tech",
    "b.e",
    "b.sc",
    "b.com",
    "ba",
    "bba",
    "bca",
    "b.arch",
    "b.pharm",
    "mbbs",
    "llb",
  ],

  PG: ["m.tech", "m.e", "m.sc", "m.com", "ma", "mba", "mca", "m.pharm", "llm"],

  PhD: ["phd"],

  PostDoc: ["postdoc", "postdoctoral"],
};

/* =========================
   HELPERS
========================= */
const normalize = (val) => (val ? val.toString().trim().toLowerCase() : null);

/* =========================
   MODEL
========================= */
const UserAcademic = sequelize.define(
  "UserAcademic",
  {
    academic_id: {
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
      onDelete: "CASCADE",
    },

    level: {
      type: DataTypes.ENUM(
        "School",
        "ITI",
        "Diploma",
        "UG",
        "PG",
        "PhD",
        "PostDoc",
      ),
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      set(value) {
        let val = normalize(value);

        const match = val?.match(/\d+/);
        if (match) {
          const num = parseInt(match[0]);
          if (num >= 1 && num <= 12) {
            val = `class ${num}`;
          }
        }

        this.setDataValue("title", val);
      },
    },

    field_of_study: {
      type: DataTypes.STRING(150),
      allowNull: true,
      set(value) {
        this.setDataValue("field_of_study", normalize(value));
      },
    },

    institute_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      set(value) {
        this.setDataValue("institute_name", normalize(value));
      },
    },

    university_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      set(value) {
        this.setDataValue("university_name", normalize(value));
      },
    },

    start_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1950,
        max: new Date().getFullYear() + 10,
      },
    },

    end_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1950,
        max: new Date().getFullYear() + 10,
      },
    },

    /* ===== Grade ===== */
    grade_value: {
      type: DataTypes.STRING(20),
      allowNull: true,
      set(value) {
        this.setDataValue("grade_value", normalize(value));
      },
    },

    grade_type: {
      type: DataTypes.ENUM("%", "cgpa", "grade"),
      allowNull: true,
    },

    /* ===== Location ===== */
    city: {
      type: DataTypes.STRING(120),
      allowNull: true,
      set(value) {
        this.setDataValue("city", normalize(value));
      },
    },

    state: {
      type: DataTypes.STRING(120),
      allowNull: true,
      set(value) {
        this.setDataValue("state", normalize(value));
      },
    },

    country: {
      type: DataTypes.STRING(120),
      allowNull: true,
      defaultValue: "India",
      set(value) {
        this.setDataValue("country", normalize(value) || "India");
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    is_current: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },

  {
    tableName: "user_academics",
    timestamps: true,
    paranoid: true,

    indexes: [
      {
        name: "uniq_academic_record", //  ADD THIS
        unique: true,
        fields: [
          "user_id",
          "level",
          "title",
          "institute_name",
          "end_year",
          "deletedAt",
        ],
      },
    ],

    validate: {
      /* =========================
         YEAR VALIDATION
      ========================= */
      validYearRange() {
        if (this.start_year && this.end_year) {
          if (this.start_year > this.end_year) {
            throw new Error("Start year cannot be greater than end year");
          }
        }
      },

      /* =========================
         GRADE VALIDATION
      ========================= */
      validGrade() {
        if (this.grade_value && !this.grade_type) {
          throw new Error("Grade type is required when grade value exists");
        }
      },

      /* =========================
         LEVEL → TITLE VALIDATION
      ========================= */
      validTitleForLevel() {
        if (!this.level || !this.title) return;

        const allowed = LEVEL_TITLES[this.level];

        if (!allowed) return; // skip if not defined

        const title = this.title;

        const isValid = allowed.includes(title);

        // allow custom titles but prevent garbage
        if (!isValid && title.length < 3) {
          throw new Error(
            `Invalid title "${this.title}" for level "${this.level}"`,
          );
        }
      },
      validSchoolTitle() {
        if (this.level === "School") {
          const valid = /^class (1[0-2]|[1-9])$/.test(this.title);

          if (!valid) {
            throw new Error("Invalid class. Use Class 1–12 only.");
          }
        }
      },
    },

    defaultScope: {
      order: [["end_year", "DESC"]],
    },
  },
);

export default UserAcademic;
