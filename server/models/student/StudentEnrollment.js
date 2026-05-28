import { DataTypes, Op } from "sequelize";
import sequelize from "../../config/db.config.js";
const StudentEnrollment = sequelize.define("StudentEnrollment", {
  enrollment_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  referrer_first_name: {
    type: DataTypes.STRING(50),
  },

  referrer_last_name: {
    type: DataTypes.STRING(50),
  },

  referrer_mobile: {
    type: DataTypes.STRING(10),
  },

  referrer_district: {
    type: DataTypes.STRING(100),
  },
});

export default StudentEnrollment;
