'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Blogs');
    
    // Add publishedAt column if it doesn't exist
    if (!tableInfo.publishedAt) {
      await queryInterface.addColumn('Blogs', 'publishedAt', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    // Ensure blog_id is unique (but not necessarily primary key)
    if (!tableInfo.blog_id.unique) {
      await queryInterface.changeColumn('Blogs', 'blog_id', {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      });
    }

    // Ensure author foreign key constraint exists
    const foreignKeys = await queryInterface.getForeignKeyReferencesForTable('Blogs');
    const hasAuthorFK = foreignKeys.some(fk => fk.columnName === 'author');
    
    if (!hasAuthorFK) {
      await queryInterface.addConstraint('Blogs', {
        fields: ['author'],
        type: 'foreign key',
        name: 'blogs_author_fkey',
        references: {
          table: 'Users',
          field: 'user_id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }

    // If you really need blog_id as primary key, you'll need to:
    // 1. First remove the auto-increment column
    // 2. Then make blog_id primary
    // But this is dangerous with existing data!
  },

  async down(queryInterface, Sequelize) {
    // Remove the publishedAt column
    await queryInterface.removeColumn('Blogs', 'publishedAt');
    
    // Remove the unique constraint if needed
    await queryInterface.removeIndex('Blogs', 'blog_id', {
      unique: true
    });
  }
};