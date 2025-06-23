'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Likes', {
      like_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      blog_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Blogs',
          key: 'blog_id'
        }
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add unique constraint
    await queryInterface.addConstraint('Likes', {
      fields: ['blog_id', 'user_id'],
      type: 'unique',
      name: 'unique_like'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Likes');
  }
};
