'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove all duplicate indexes
    for (let i = 2; i <= 31; i++) {
      try {
        await queryInterface.removeIndex('users', `email_${i}`);
      } catch (e) { /* ignore if index doesn't exist */ }
      
      try {
        await queryInterface.removeIndex('users', `username_${i}`);
      } catch (e) { /* ignore if index doesn't exist */ }
    }
    
    // Add proper unique indexes if they don't exist
    const indexes = await queryInterface.showIndex('users');
    const hasEmailIndex = indexes.some(i => i.name === 'email_unique');
    const hasUsernameIndex = indexes.some(i => i.name === 'username_unique');

    if (!hasEmailIndex) {
      await queryInterface.addIndex('users', ['email'], {
        unique: true,
        name: 'email_unique'
      });
    }

    if (!hasUsernameIndex) {
      await queryInterface.addIndex('users', ['username'], {
        unique: true,
        name: 'username_unique'
      });
    }
  },

  down: async () => {
    // This migration cannot be safely reversed
  }
};
