import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // Adjust based on your DB config

import Blog from './Blog.js';

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
        notEmpty: true 
      },
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true, // Initially allow null for backward compatibility
      validate: { 
        len: [1, 100],
        notEmpty: true 
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
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    mobile_otp: {
      type: DataTypes.STRING(6),
      allowNull: true,
    },
    otp_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    
    // NEW: Customer ID with location codes
    customer_id: {
      type: DataTypes.STRING(50), // Will store the abbreviated customer ID
      allowNull: true,
      unique: true,
    },
    
    // NEW: Location code fields (stored as codes in database)
    country_code: {
      type: DataTypes.STRING(3), // 3 digit country code
      allowNull: true,
    },
    state_code: {
      type: DataTypes.STRING(2), // 2 digit state code
      allowNull: true,
    },
    district_code: {
      type: DataTypes.STRING(2), // 2 digit district code
      allowNull: true,
    },
    block_code: {
      type: DataTypes.STRING(2), // 2 digit block code
      allowNull: true,
    },
    village_code: {
      type: DataTypes.STRING(2), // 2 digit village code
      allowNull: true,
    },
    
    password: {
      type: DataTypes.STRING,
      allowNull: false,
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
        fields: ['email'],
        name: 'email_unique'
      },
      {
        unique: true,
        fields: ['username'],
        name: 'username_unique'
      },
      {
        unique: true,
        fields: ['mobile_number'],
        name: 'mobile_unique',
        where: {
          mobile_number: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      },
      {
        unique: true,
        fields: ['customer_id'],
        name: 'customer_id_unique',
        where: {
          customer_id: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      }
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
      }
    }
  }
);

// Instance method to get full name
User.prototype.getFullName = function() {
  if (this.first_name && this.last_name) {
    return `${this.first_name} ${this.last_name}`;
  }
  return this.fullname || '';
};

// Instance method to split existing fullname into first and last name
User.prototype.splitFullName = function() {
  if (this.fullname && !this.first_name && !this.last_name) {
    const nameParts = this.fullname.trim().split(' ');
    if (nameParts.length >= 2) {
      this.first_name = nameParts[0];
      this.last_name = nameParts.slice(1).join(' '); // Handle middle names
    } else {
      this.first_name = this.fullname;
      this.last_name = '';
    }
  }
  return { first_name: this.first_name, last_name: this.last_name };
};

// Static method to migrate existing users
User.migrateFullNamesToSeparateFields = async function() {
  try {
    const usersWithFullNameOnly = await User.findAll({
      where: {
        fullname: {
          [sequelize.Sequelize.Op.ne]: null
        },
        first_name: null,
        last_name: null
      }
    });

    console.log(`Found ${usersWithFullNameOnly.length} users to migrate`);

    for (const user of usersWithFullNameOnly) {
      const nameParts = user.fullname.trim().split(' ');
      const first_name = nameParts[0] || '';
      const last_name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      await user.update({
        first_name,
        last_name
      });

      console.log(`Migrated user ${user.user_id}: ${user.fullname} -> ${first_name} ${last_name}`);
    }

    return usersWithFullNameOnly.length;
  } catch (error) {
    console.error('Error migrating fullnames:', error);
    throw error;
  }
};

export default User;