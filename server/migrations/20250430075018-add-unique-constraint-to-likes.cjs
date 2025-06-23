'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if constraint already exists (optional safety check)
    const constraints = await queryInterface.showConstraint('Likes');
    const constraintExists = constraints.some(c => c.constraintName === 'unique_like');
    
    if (!constraintExists) {
      await queryInterface.addConstraint('Likes', {
        fields: ['blog_id', 'user_id'],
        type: 'unique',
        name: 'unique_like'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Likes', 'unique_like');
  }
};