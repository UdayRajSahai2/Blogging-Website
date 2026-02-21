import { DataTypes } from "sequelize";
import sequelize from "../config/db.config.js"; // Adjust based on your DB config

import Blog from "./Blog.js";

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // NEW: Split name fields
    first_name: {
      type: DataTypes.STRING,
      allowNull: true, // Initially allow null for backward compatibility
      validate: {
        len: [1, 100],
        notEmpty: true,
      },
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true, // Initially allow null for backward compatibility
      validate: {
        len: [1, 100],
        notEmpty: true,
      },
    },

    // LEGACY: Keep fullname for backward compatibility (will be deprecated)
    fullname: {
      type: DataTypes.STRING,
      allowNull: true, // Changed to allow null since we're moving to first_name/last_name
      validate: { len: [3, 255] },
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },

    // NEW: Mobile number field
    mobile_number: {
      type: DataTypes.STRING(15), // International format can be up to 15 digits
      allowNull: true, // Initially allow null for backward compatibility
      validate: {
        is: /^[+]?[1-9]\d{1,14}$/, // International mobile number format
      },
      unique: true,
    },

    // NEW: OTP verification fields
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    mobile_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_otp: {
      type: DataTypes.STRING(255), // bcrypt-safe
      allowNull: true,
    },

    mobile_otp: {
      type: DataTypes.STRING(255), // future-proof for hashed SMS OTP
      allowNull: true,
    },

    otp_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    reset_token_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // NEW: Customer ID with location codes
    customer_id: {
      type: DataTypes.STRING(50), // Will store the abbreviated customer ID
      allowNull: true,
      unique: true,
    },

    // Location code fields (denormalized for performance, linked to location tables)
    // These store codes that reference the normalized location tables
    country_code: {
      type: DataTypes.STRING(3), // 3 digit country code (e.g., 'IND')
      allowNull: true,
      comment: "References countries.country_code for fast access",
    },
    state_code: {
      type: DataTypes.STRING(2), // 2 digit state code (e.g., '29')
      allowNull: true,
      comment: "References states.state_code for fast access",
    },
    district_code: {
      type: DataTypes.STRING(4), // 4 digit district code (e.g., '2901')
      allowNull: true,
      comment: "References districts.district_code for fast access",
    },
    block_code: {
      type: DataTypes.STRING(6), // 6 digit block code (e.g., '290101')
      allowNull: true,
      comment: "References blocks.block_code for fast access",
    },
    village_code: {
      type: DataTypes.STRING(6), // 6 digit village code (e.g., '290101001')
      allowNull: true,
      comment: "References villages.village_code for fast access",
    },

    // NEW: Live Location Tracking for "Near Me" functionality
    current_latitude: {
      type: DataTypes.DECIMAL(10, 8), // Precision for GPS coordinates
      allowNull: true,
    },
    current_longitude: {
      type: DataTypes.DECIMAL(11, 8), // Precision for GPS coordinates
      allowNull: true,
    },
    location_updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_location_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Users can choose to share their location
    },

    // NEW: Profile ID for hierarchical profession categorization
    profile_id: {
      type: DataTypes.STRING(10), // Format: CC-SC-SSC (Category-SubCategory-SubSubCategory)
      allowNull: true,
      comment:
        'Format: 2-digit category + 2-digit subcategory + 2-digit sub-subcategory (e.g., "01-02-03" for Doctor-Cardiologist-Interventional)',
    },

    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profession_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Professions",
        key: "profession_id",
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { len: [3, 50] },
    },
    bio: {
      type: DataTypes.STRING(200),
      defaultValue: "",
    },
    profile_img: {
      type: DataTypes.STRING,
      defaultValue: function () {
        const profile_imgs_name_list = [
          "Garfield",
          "Tinkerbell",
          "Annie",
          "Loki",
          "Cleo",
          "Angel",
          "Bob",
          "Mia",
          "Coco",
          "Gracie",
          "Bear",
          "Bella",
          "Abby",
          "Harley",
          "Cali",
          "Leo",
          "Luna",
          "Jack",
          "Felix",
          "Kiki",
        ];
        const profile_imgs_collections_list = [
          "notionists-neutral",
          "adventurer-neutral",
          "fun-emoji",
        ];
        return `https://api.dicebear.com/6.x/${
          profile_imgs_collections_list[
            Math.floor(Math.random() * profile_imgs_collections_list.length)
          ]
        }/svg?seed=${
          profile_imgs_name_list[
            Math.floor(Math.random() * profile_imgs_name_list.length)
          ]
        }`;
      },
    },

    // Personal Address
    personal_street: { type: DataTypes.STRING, defaultValue: "" },
    personal_city: { type: DataTypes.STRING, defaultValue: "" },
    personal_state: { type: DataTypes.STRING, defaultValue: "" },
    personal_country: { type: DataTypes.STRING, defaultValue: "" },
    personal_zip_code: { type: DataTypes.STRING, defaultValue: "" },

    // Professional Address
    professional_street: { type: DataTypes.STRING, defaultValue: "" },
    professional_city: { type: DataTypes.STRING, defaultValue: "" },
    professional_state: { type: DataTypes.STRING, defaultValue: "" },
    professional_country: { type: DataTypes.STRING, defaultValue: "" },
    professional_zip_code: { type: DataTypes.STRING, defaultValue: "" },

    // Social Links
    youtube: { type: DataTypes.STRING, defaultValue: "" },
    instagram: { type: DataTypes.STRING, defaultValue: "" },
    facebook: { type: DataTypes.STRING, defaultValue: "" },
    twitter: { type: DataTypes.STRING, defaultValue: "" },
    github: { type: DataTypes.STRING, defaultValue: "" },
    website: { type: DataTypes.STRING, defaultValue: "" },

    // Account Info
    total_posts: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_reads: { type: DataTypes.INTEGER, defaultValue: 0 },

    google_auth: { type: DataTypes.BOOLEAN, defaultValue: false },

    // Blogs (MySQL does not support MongoDB's `ObjectId`)
    blogs: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    timestamps: true,
    tableName: "users",
    indexes: [
      {
        unique: true,
        fields: ["email"],
        name: "email_unique",
      },
      {
        unique: true,
        fields: ["username"],
        name: "username_unique",
      },
      {
        unique: true,
        fields: ["mobile_number"],
        name: "mobile_unique",
        where: {
          mobile_number: {
            [sequelize.Sequelize.Op.ne]: null,
          },
        },
      },
      {
        unique: true,
        fields: ["customer_id"],
        name: "customer_id_unique",
        where: {
          customer_id: {
            [sequelize.Sequelize.Op.ne]: null,
          },
        },
      },
      // NEW: Indexes for location-based queries
      {
        fields: ["current_latitude", "current_longitude"],
        name: "location_coordinates_idx",
      },
      {
        fields: ["is_location_public"],
        name: "location_public_idx",
      },
      {
        fields: ["profile_id"],
        name: "profile_id_idx",
      },
      {
        fields: ["profession_id", "is_location_public"],
        name: "profession_location_idx",
      },
      // Location code indexes for fast filtering
      {
        fields: ["country_code"],
        name: "user_country_code_idx",
      },
      {
        fields: ["state_code"],
        name: "user_state_code_idx",
      },
      {
        fields: ["district_code"],
        name: "user_district_code_idx",
      },
      {
        fields: ["block_code"],
        name: "user_block_code_idx",
      },
      {
        fields: ["village_code"],
        name: "user_village_code_idx",
      },
      // Composite indexes for location-based queries
      {
        fields: ["country_code", "state_code"],
        name: "user_country_state_idx",
      },
      {
        fields: ["state_code", "district_code"],
        name: "user_state_district_idx",
      },
      {
        fields: ["district_code", "block_code"],
        name: "user_district_block_idx",
      },
    ],
    hooks: {
      // Hook to automatically generate fullname from first_name and last_name
      beforeCreate: (user, options) => {
        if (user.first_name && user.last_name && !user.fullname) {
          user.fullname = `${user.first_name} ${user.last_name}`;
        }
      },
      beforeUpdate: (user, options) => {
        if (user.first_name && user.last_name) {
          user.fullname = `${user.first_name} ${user.last_name}`;
        }
      },
    },
  },
);

export default User;
