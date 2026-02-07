"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add live location tracking fields
    await queryInterface.addColumn("Users", "current_latitude", {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true,
      comment: "Current GPS latitude for location-based services"
    });

    await queryInterface.addColumn("Users", "current_longitude", {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
      comment: "Current GPS longitude for location-based services"
    });

    await queryInterface.addColumn("Users", "location_updated_at", {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "Timestamp when location was last updated"
    });

    await queryInterface.addColumn("Users", "is_location_public", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: "Whether user allows their location to be shared publicly"
    });

    // Add profile_id for hierarchical profession categorization
    await queryInterface.addColumn("Users", "profile_id", {
      type: Sequelize.STRING(10),
      allowNull: true,
      comment: "Hierarchical profession ID: CC-SC-SSC (Category-SubCategory-SubSubCategory)"
    });

    // Add indexes for performance
    await queryInterface.addIndex("Users", ["current_latitude", "current_longitude"], {
      name: "location_coordinates_idx"
    });

    await queryInterface.addIndex("Users", ["is_location_public"], {
      name: "location_public_idx"
    });

    await queryInterface.addIndex("Users", ["profile_id"], {
      name: "profile_id_idx"
    });

    await queryInterface.addIndex("Users", ["profession_id", "is_location_public"], {
      name: "profession_location_idx"
    });

    console.log("✅ Added location tracking and profile_id fields to Users table");
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    await queryInterface.removeIndex("Users", "location_coordinates_idx");
    await queryInterface.removeIndex("Users", "location_public_idx");
    await queryInterface.removeIndex("Users", "profile_id_idx");
    await queryInterface.removeIndex("Users", "profession_location_idx");

    // Remove columns
    await queryInterface.removeColumn("Users", "current_latitude");
    await queryInterface.removeColumn("Users", "current_longitude");
    await queryInterface.removeColumn("Users", "location_updated_at");
    await queryInterface.removeColumn("Users", "is_location_public");
    await queryInterface.removeColumn("Users", "profile_id");

    console.log("✅ Removed location tracking and profile_id fields from Users table");
  }
}; 