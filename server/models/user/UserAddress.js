import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";

const UserAddress = sequelize.define(
  "UserAddress",
  {
    address_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    type: DataTypes.ENUM("personal", "work", "office"),

    label: DataTypes.STRING,

    street: DataTypes.STRING,
    city: DataTypes.STRING,

    //  KEEP (for now, backward compatibility)
    state: DataTypes.STRING,
    country: DataTypes.STRING,

    zip_code: DataTypes.STRING,

    // relation codes (REAL SOURCE OF TRUTH)
    country_code: DataTypes.STRING(3),
    state_code: DataTypes.STRING(2),
    district_code: DataTypes.STRING(4),

    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "user_addresses",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["user_id", "type"],
        name: "unique_user_address_type",
      },
      { fields: ["user_id"] },
      { fields: ["city"] },
      { fields: ["state"] },
    ],
  },
);

export default UserAddress;
