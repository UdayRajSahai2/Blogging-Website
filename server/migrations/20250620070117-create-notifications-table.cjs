'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      notification_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: Sequelize.ENUM("like", "comment", "reply"),
        allowNull: false,
      },
      blog: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Blogs',
          key: 'blog_id'
        }
      },
      notification_for: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id'
        }
      },
      user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id'
        }
      },
      comment_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'Comments',
          key: 'comment_id'
        }
      },
      reply: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'Comments',
          key: 'comment_id'
        }
      },
      replied_on_comment: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'Comments',
          key: 'comment_id'
        }
      },
      seen: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

    // Add indexes for better performance
    await queryInterface.addIndex('Notifications', ['notification_for']);
    await queryInterface.addIndex('Notifications', ['user']);
    await queryInterface.addIndex('Notifications', ['blog']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Notifications');
  }
};