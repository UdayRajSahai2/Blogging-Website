'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('Starting ultimate migration fix...');
    
    // 1. Completely remove any constraint attempts
    try {
      // List all constraints on the table
      const [constraints] = await queryInterface.sequelize.query(`
        SELECT CONSTRAINT_NAME 
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE TABLE_NAME = 'Reads'
        AND CONSTRAINT_TYPE = 'FOREIGN KEY'
      `);
      
      console.log('Found constraints:', constraints);

      // Remove any foreign key constraints found
      for (const constraint of constraints) {
        try {
          await queryInterface.removeConstraint(
            'Reads',
            constraint.CONSTRAINT_NAME
          );
          console.log(`Successfully removed constraint: ${constraint.CONSTRAINT_NAME}`);
        } catch (err) {
          console.log(`Note: Could not remove constraint ${constraint.CONSTRAINT_NAME} - may not exist`);
        }
      }
    } catch (err) {
      console.log('Initial constraint check failed - proceeding anyway:', err.message);
    }

    // 2. Change the column type without worrying about constraints
    try {
      await queryInterface.changeColumn('Reads', 'blog_id', {
        type: Sequelize.STRING,
        allowNull: false
      });
      console.log('Successfully changed blog_id to STRING type');
    } catch (err) {
      console.log('Column type change failed:', err.message);
      throw err; // Stop if we can't change the column type
    }

    // 3. Add new constraint with fresh name
    try {
      await queryInterface.addConstraint('Reads', {
        fields: ['blog_id'],
        type: 'foreign key',
        name: 'fk_reads_blog_id', // New, simple constraint name
        references: {
          table: 'Blogs',
          field: 'blog_id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      });
      console.log('Successfully added new foreign key constraint');
    } catch (err) {
      console.log('Could not add foreign key - continuing without it:', err.message);
    }

    console.log('Migration completed (with or without constraints)');
  },

  async down() {
    // No down migration - this is a one-way fix
    console.log('No down migration for this permanent fix');
  }
};