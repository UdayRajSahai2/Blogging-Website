import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js";

const Expenditure = sequelize.define(
  "Expenditure",
  {
    expenditure_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    initiative: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 2000,
        max: 3000,
      },
    },

    invoice_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    by_whom: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    expense_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    evidence_copy_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,

    indexes: [
      { fields: ["year"], name: "expenditure_year_idx" },
      { fields: ["date"], name: "expenditure_date_idx" },
      { fields: ["initiative"], name: "expenditure_initiative_idx" },
      { fields: ["invoice_number"], name: "expenditure_invoice_idx" },
      {
        fields: ["year", "initiative"],
        name: "expenditure_year_init_idx",
      },
    ],
  },
);

export default Expenditure;
