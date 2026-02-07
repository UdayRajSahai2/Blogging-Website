'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'district_code', {
      type: Sequelize.STRING(4),
      allowNull: true,
    });
    await queryInterface.changeColumn('users', 'block_code', {
      type: Sequelize.STRING(6),
      allowNull: true,
    });
    await queryInterface.changeColumn('users', 'village_code', {
      type: Sequelize.STRING(6),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'district_code', {
      type: Sequelize.STRING(2),
      allowNull: true,
    });
    await queryInterface.changeColumn('users', 'block_code', {
      type: Sequelize.STRING(2),
      allowNull: true,
    });
    await queryInterface.changeColumn('users', 'village_code', {
      type: Sequelize.STRING(2),
      allowNull: true,
    });
  }
};
