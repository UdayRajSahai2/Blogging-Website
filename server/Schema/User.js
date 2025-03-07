import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // Adjust based on your DB config

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: [3, 255] },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profession_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "Professions",
        key: "id",
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
      type: DataTypes.JSON, // Alternatively, create a separate Blog model and use associations
      defaultValue: [],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt
    tableName: "users",
  }
);

export default User;
