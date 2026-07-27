import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";
import { toTitleCase } from "../../utils/format.utils.js";

const Enrollment = sequelize.define(
  "Enrollment",
  {
    enrollment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    referrer_name: {
      type: DataTypes.STRING(100),
      set(value) {
        this.setDataValue("referrer_name", toTitleCase(value));
      },
    },

    referrer_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },

    referrer_mobile: {
      type: DataTypes.STRING(10),
    },

    enrollment_type: {
      type: DataTypes.ENUM("student", "referrer"),
      allowNull: false,
      defaultValue: "referrer",
    },

    referrer_district: {
      type: DataTypes.STRING(100),
      set(value) {
        this.setDataValue("referrer_district", toTitleCase(value));
      },
    },
  },
  {
    tableName: "enrollments",
  },
);

export default Enrollment;
