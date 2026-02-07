import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Profession = sequelize.define("Profession", {
  profession_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  parent_id: { type: DataTypes.INTEGER, allowNull: true }, // For category, subcategory, sub-subcategory
  level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // 0: category, 1: subcategory, 2: sub-subcategory
  code: { type: DataTypes.STRING(10), allowNull: true }, // Optional: short code for profession
}, {
  tableName: "Professions",
  indexes: [
    {
      unique: true,
      fields: ['name', 'parent_id'],
      name: 'unique_profession_per_parent'
    }
  ]
});


export default Profession;
