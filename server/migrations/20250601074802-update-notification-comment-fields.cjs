'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, let's check if the table exists and what columns it has
    const tableDescription = await queryInterface.describeTable('Notifications');
    console.log('Current Notifications table structure:', tableDescription);

    // Change comment_id from INTEGER to STRING
    if (tableDescription.comment_id) {
      await queryInterface.changeColumn('Notifications', 'comment_id', {
        type: Sequelize.STRING,
        allowNull: true,
      });
      console.log('Updated comment_id column to STRING');
    }

    // Change reply from INTEGER to STRING
    if (tableDescription.reply) {
      await queryInterface.changeColumn('Notifications', 'reply', {
        type: Sequelize.STRING,
        allowNull: true,
      });
      console.log('Updated reply column to STRING');
    }

    // Change replied_on_comment from INTEGER to STRING
    if (tableDescription.replied_on_comment) {
      await queryInterface.changeColumn('Notifications', 'replied_on_comment', {
        type: Sequelize.STRING,
        allowNull: true,
      });
      console.log('Updated replied_on_comment column to STRING');
    }

    console.log('Migration completed successfully!');
  },

  async down(queryInterface, Sequelize) {
    // Revert changes - WARNING: This might cause data loss if you have string data
    console.log('WARNING: Rolling back might cause data loss!');
    
    await queryInterface.changeColumn('Notifications', 'comment_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn('Notifications', 'reply', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.changeColumn('Notifications', 'replied_on_comment', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    console.log('Migration rolled back successfully!');
  }
};