"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Blogs", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      blog_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      banner: {
        type: Sequelize.STRING,
      },
      des: {
        type: Sequelize.STRING(200),
      },
      content: {
        type: Sequelize.JSON,
      },
      tags: {
        type: Sequelize.JSON,
      },
      author: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
      },
      activity: {
        type: Sequelize.JSON,
      },
      draft: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Blogs");
  },
};
