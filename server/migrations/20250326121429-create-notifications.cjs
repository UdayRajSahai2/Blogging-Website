"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Notifications", {
      notification_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: Sequelize.ENUM(
          "like",
          "comment",
          "reply",
          "new_follower",
          "blog_published"
        ),
        allowNull: false,
      },
      notification_for: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      blog_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Blogs",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      comment_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Comments",
          key: "comment_id",
        },
        onDelete: "CASCADE",
      },
      seen: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

    // Add indexes with unique names to avoid conflicts
    await queryInterface.addConstraint("Notifications", {
      fields: ["notification_for"],
      type: "foreign key",
      name: "fk_notification_for_user",
      references: {
        table: "Users",
        field: "user_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("Notifications", {
      fields: ["user"],
      type: "foreign key",
      name: "fk_notification_user",
      references: {
        table: "Users",
        field: "user_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add performance indexes
    await queryInterface.addIndex("Notifications", ["notification_for", "seen"], {
      name: "idx_notifications_user_seen_status",
    });

    await queryInterface.addIndex("Notifications", ["seen"], {
      name: "idx_notifications_seen",
    });

    await queryInterface.addIndex("Notifications", ["createdAt"], {
      name: "idx_notifications_created_at",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first to avoid errors
    await queryInterface.removeIndex(
      "Notifications",
      "idx_notifications_user_seen_status"
    );
    await queryInterface.removeIndex("Notifications", "idx_notifications_seen");
    await queryInterface.removeIndex(
      "Notifications",
      "idx_notifications_created_at"
    );
    
    // Then drop the table
    await queryInterface.dropTable("Notifications");
  },
};