// In your migration file
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First add a temporary column
    await queryInterface.addColumn('Likes', 'temp_blog_id', {
      type: Sequelize.STRING
    });
    
    // Copy data from old column to new column
    await queryInterface.sequelize.query(`
      UPDATE Likes SET temp_blog_id = blog_id
    `);
    
    // Remove the old column
    await queryInterface.removeColumn('Likes', 'blog_id');
    
    // Add the new column with correct type
    await queryInterface.addColumn('Likes', 'blog_id', {
      type: Sequelize.STRING,
      allowNull: false,
      references: {
        model: 'Blogs',
        key: 'blog_id'
      }
    });
    
    // Copy data back
    await queryInterface.sequelize.query(`
      UPDATE Likes SET blog_id = temp_blog_id
    `);
    
    // Remove the temporary column
    await queryInterface.removeColumn('Likes', 'temp_blog_id');
    
    // Add the foreign key constraint
    await queryInterface.addConstraint('Likes', {
      fields: ['blog_id'],
      type: 'foreign key',
      name: 'likes_blog_id_fkey',
      references: {
        table: 'Blogs',
        field: 'blog_id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Similar steps to revert if needed
    await queryInterface.addColumn('Likes', 'temp_blog_id', {
      type: Sequelize.INTEGER
    });
    
    await queryInterface.sequelize.query(`
      UPDATE Likes SET temp_blog_id = blog_id
    `);
    
    await queryInterface.removeColumn('Likes', 'blog_id');
    
    await queryInterface.addColumn('Likes', 'blog_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
    
    await queryInterface.sequelize.query(`
      UPDATE Likes SET blog_id = temp_blog_id
    `);
    
    await queryInterface.removeColumn('Likes', 'temp_blog_id');
  }
};