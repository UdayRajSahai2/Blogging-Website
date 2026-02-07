'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add bank account and transfer status fields to Donations table
    await queryInterface.addColumn('Donations', 'bank_account', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.addColumn('Donations', 'transfer_status', {
      type: Sequelize.ENUM('pending', 'transferred', 'failed'),
      defaultValue: 'pending',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Donations', 'bank_account');
    await queryInterface.removeColumn('Donations', 'transfer_status');
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_Donations_transfer_status\";");
  }
};
