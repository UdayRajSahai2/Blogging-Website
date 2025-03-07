import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Profession = sequelize.define("Profession", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  parent_id: { type: DataTypes.INTEGER, allowNull: true }, // For category, subcategory, sub-subcategory
},{ tableName: "Professions" });

export default Profession;
