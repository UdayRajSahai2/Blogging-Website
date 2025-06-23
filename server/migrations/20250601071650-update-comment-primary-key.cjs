'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop the existing table and recreate it with correct schema
    await queryInterface.dropTable('Comments');
    
    await queryInterface.createTable('Comments', {
      comment_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      blog_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Blogs',
          key: 'blog_id',
        },
      },
      blog_author: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comment: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      children: {
        type: Sequelize.JSON,
      },
      commented_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id',
        },
      },
      isReply: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      parent_comment_id: {
        type: Sequelize.STRING,
        references: {
          model: 'Comments',
          key: 'comment_id',
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Comments');
  }
};