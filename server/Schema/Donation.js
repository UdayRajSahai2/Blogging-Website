import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Donation = sequelize.define("Donation", {
  donation_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  donor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Donors",
      key: "donor_id",
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Users",
      key: "user_id",
    },
    comment: "Redundant for fast querying by user",
  },
  customer_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  purpose: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    validate: { min: 0 },
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
  payment_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Razorpay payment ID',
  },
  payment_signature: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Razorpay payment signature',
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  bank_account: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Bank account where payment was received',
  },
  transfer_status: {
    type: DataTypes.ENUM('pending', 'transferred', 'failed'),
    defaultValue: 'pending',
    comment: 'Status of transfer to bank account',
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ["donor_id"], name: "donation_donor_idx" },
    { fields: ["user_id"], name: "donation_user_idx" },
    { fields: ["year"], name: "donation_year_idx" },
    { fields: ["date"], name: "donation_date_idx" },
  ],
});

export default Donation;


