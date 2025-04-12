"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Users", [
      {
        fullname: "John Doe",
        email: "john@example.com",
        password: "hashed_password", // Use bcrypt to hash passwords
        username: "johndoe",
        profile_img: "https://example.com/profile.jpg",
        google_auth: false,
        profession_id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
