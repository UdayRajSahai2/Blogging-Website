import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const BalanceSnapshot = sequelize.define("BalanceSnapshot", {
  snapshot_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 2000, max: 3000 },
  },
  balance_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ["year"], name: "balance_year_idx" },
    { fields: ["date"], name: "balance_date_idx" },
  ],
});

export default BalanceSnapshot;


