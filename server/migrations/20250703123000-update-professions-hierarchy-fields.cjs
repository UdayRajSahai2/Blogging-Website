"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add 'level' field
    await queryInterface.addColumn("Professions", "level", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "0: category, 1: subcategory, 2: sub-subcategory"
    });

    // Add 'code' field
    await queryInterface.addColumn("Professions", "code", {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: "Short code for profession (e.g., DR for Doctor)"
    });

    // Add unique index on (name, parent_id)
    await queryInterface.addIndex("Professions", ["name", "parent_id"], {
      unique: true,
      name: "unique_profession_per_parent"
    });

    console.log("✅ Added 'level', 'code' fields and unique index to Professions table");
  },

  async down(queryInterface, Sequelize) {
    // Remove unique index
    await queryInterface.removeIndex("Professions", "unique_profession_per_parent");
    // Remove columns
    await queryInterface.removeColumn("Professions", "level");
    await queryInterface.removeColumn("Professions", "code");
    console.log("✅ Removed 'level', 'code' fields and unique index from Professions table");
  }
}; 