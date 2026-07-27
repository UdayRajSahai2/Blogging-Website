// server/models/blog/BlogTaxonomy.js

import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";

const BlogTaxonomy = sequelize.define(
  "BlogTaxonomy",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    taxonomy_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    group_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    category: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    subcategory: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    sub_subcategory: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    purpose: {
      type: DataTypes.STRING(100),
      defaultValue: "Blogging",
    },

    related_domain: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    target_group: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "blog_taxonomies",

    timestamps: true,

    indexes: [
      { fields: ["taxonomy_id"] },
      { fields: ["group_id"] },

      {
        unique: true,
        fields: ["group_id", "taxonomy_id"],
      },

      { fields: ["category"] },
      { fields: ["subcategory"] },
      { fields: ["sub_subcategory"] },
      { fields: ["related_domain"] },
      { fields: ["target_group"] },
      { fields: ["is_active"] },
    ],
  },
);

export default BlogTaxonomy;
