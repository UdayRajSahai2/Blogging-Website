'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add publishedAt column safely
    const tableInfo = await queryInterface.describeTable('Blogs');
    if (!tableInfo.publishedAt) {
      await queryInterface.addColumn('Blogs', 'publishedAt', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    // 2. Ensure blog_id is unique (without changing primary key)
    if (!tableInfo.blog_id.unique) {
      await queryInterface.addIndex('Blogs', {
        fields: ['blog_id'],
        unique: true,
        name: 'blogs_blog_id_unique'
      });
    }

    // 3. Verify and fix foreign keys if needed
    try {
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
    } catch (error) {
      console.warn('Foreign key check failed:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    // Safely undo changes
    await queryInterface.removeColumn('Blogs', 'publishedAt');
    await queryInterface.removeIndex('Blogs', 'blogs_blog_id_unique');
  }
};