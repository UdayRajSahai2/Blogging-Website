//server\models\user\User.js
import { DataTypes, Op } from "sequelize";
import sequelize from "../../config/db.config.js"; // Adjust based on your DB config
//Sequelize.col() column projection with aliasing to flatten joined attributes.
import { toTitleCase } from "../../utils/format.utils.js";

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    system_role: {
      type: DataTypes.ENUM("user", "admin", "super_admin"),
      allowNull: false,
      defaultValue: "user",
    },
    // NEW: Split name fields
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100],
        notEmpty: true,
      },
      set(value) {
        this.setDataValue("first_name", toTitleCase(value));
      },
    },

    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100],
        notEmpty: true,
      },
      set(value) {
        this.setDataValue("last_name", toTitleCase(value));
      },
    },

    // LEGACY: Keep fullname for backward compatibility (will be deprecated)
    fullname: {
      type: DataTypes.STRING,
      allowNull: true, // Changed to allow null since we're moving to first_name/last_name
      validate: {
        len: [3, 255],
      },
      set(value) {
        this.setDataValue("fullname", toTitleCase(value));
      },
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },

    mobile_number: {
      type: DataTypes.STRING(15),
      allowNull: true,
      validate: {
        is: /^[+]?[1-9]\d{1,14}$/,
      },
      unique: true,
    },

    temp_mobile_number: {
      type: DataTypes.STRING(15),
      allowNull: true,
      validate: {
        is: /^[+]?[1-9]\d{1,14}$/,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
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
    //CC SC DC BC VC :- 3 2 2 2 3 digits
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
      defaultValue: true, // Users can choose to share their location
    },
    display_location: {
      type: DataTypes.STRING,
    },

    current_city: {
      type: DataTypes.STRING,
    },

    current_state: {
      type: DataTypes.STRING,
    },

    current_country: {
      type: DataTypes.STRING,
    },
    // NEW: Profile ID for hierarchical profession categorization
    profile_id: {
      type: DataTypes.STRING(10), // Format: CC-SC-SSC (Category-SubCategory-SubSubCategory)
      allowNull: true,
      comment:
        'Format: 2-digit category + 2-digit subcategory + 2-digit sub-subcategory (e.g., "01-02-03" for Doctor-Cardiologist-Interventional)',
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
      type: DataTypes.TEXT,
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

    // Account Info
    total_posts: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_reads: { type: DataTypes.INTEGER, defaultValue: 0 },

    google_auth: { type: DataTypes.BOOLEAN, defaultValue: false },

    is_onboarding_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    approval_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    timestamps: true,
    tableName: "users",
    indexes: [
      // ONLY SMART GEO INDEX
      {
        fields: ["country_code", "state_code", "district_code"],
        name: "geo_hierarchy_idx",
      },

      // ONLY PROFESSION FILTER INDEX
      {
        fields: ["profession_id", "is_location_public"],
        name: "profession_visibility_idx",
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
