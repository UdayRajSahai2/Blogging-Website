'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the incorrect constraint
    await queryInterface.removeConstraint('likes', 'unique_like_per_user');
    
    // Add the correct composite constraint
    await queryInterface.addConstraint('likes', {
      fields: ['blog_id', 'user_id'],
      type: 'unique',
      name: 'unique_user_like_per_blog'
    });
  },

  async down(queryInterface, Sequelize) {
    // For rollback
    await queryInterface.removeConstraint('likes', 'unique_user_like_per_blog');
    await queryInterface.addConstraint('likes', {
      fields: ['user_id'],
      type: 'unique',
      name: 'unique_like_per_user'
    });
  }
};
