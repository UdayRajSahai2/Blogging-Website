'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Helper function to safely add column if it doesn't exist
    const safeAddColumn = async (tableName, columnName, options) => {
      const tableDescription = await queryInterface.describeTable(tableName);
      if (!tableDescription[columnName]) {
        await queryInterface.addColumn(tableName, columnName, options);
        console.log(`✅ Added column ${columnName}`);
      } else {
        console.log(`ℹ️ Column ${columnName} already exists - skipping`);
      }
    };

    // Helper function to safely add index if it doesn't exist
    const safeAddIndex = async (tableName, indexName, fields, options = {}) => {
      const indexes = await queryInterface.showIndex(tableName);
      const indexExists = indexes.some(index => index.name === indexName);
      
      if (!indexExists) {
        await queryInterface.addIndex(tableName, fields, { ...options, name: indexName });
        console.log(`✅ Added index ${indexName}`);
      } else {
        console.log(`ℹ️ Index ${indexName} already exists - skipping`);
      }
    };

    // Add all new columns safely
    await safeAddColumn('users', 'first_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await safeAddColumn('users', 'last_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await safeAddColumn('users', 'mobile_number', {
      type: Sequelize.STRING(15),
      allowNull: true,
    });

    await safeAddColumn('users', 'email_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await safeAddColumn('users', 'mobile_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await safeAddColumn('users', 'email_otp', {
      type: Sequelize.STRING(6),
      allowNull: true,
    });

    await safeAddColumn('users', 'mobile_otp', {
      type: Sequelize.STRING(6),
      allowNull: true,
    });

    await safeAddColumn('users', 'otp_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await safeAddColumn('users', 'customer_id', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });

    await safeAddColumn('users', 'country_code', {
      type: Sequelize.STRING(3),
      allowNull: true,
    });

    await safeAddColumn('users', 'state_code', {
      type: Sequelize.STRING(2),
      allowNull: true,
    });

    await safeAddColumn('users', 'district_code', {
      type: Sequelize.STRING(2),
      allowNull: true,
    });

    await safeAddColumn('users', 'block_code', {
      type: Sequelize.STRING(2),
      allowNull: true,
    });

    await safeAddColumn('users', 'village_code', {
      type: Sequelize.STRING(2),
      allowNull: true,
    });

    // Add unique constraints separately (MySQL handles this differently)
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      MODIFY mobile_number VARCHAR(15) UNIQUE,
      MODIFY customer_id VARCHAR(50) UNIQUE
    `).catch(err => {
      console.log('ℹ️ Unique constraints may already exist - continuing');
    });

    // Add indexes safely
    await safeAddIndex('users', 'mobile_unique', ['mobile_number'], {
      unique: true,
      where: {
        mobile_number: {
          [Sequelize.Op.ne]: null
        }
      }
    });

    await safeAddIndex('users', 'customer_id_unique', ['customer_id'], {
      unique: true,
      where: {
        customer_id: {
          [Sequelize.Op.ne]: null
        }
      }
    });

    // Migrate existing fullname data to first_name and last_name
    const [users] = await queryInterface.sequelize.query(
      `SELECT user_id, fullname FROM users WHERE fullname IS NOT NULL AND fullname != ''`
    );

    console.log(`ℹ️ Found ${users.length} users to migrate name data`);

    for (const user of users) {
      try {
        const nameParts = user.fullname.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        await queryInterface.sequelize.query(
          `UPDATE users SET first_name = ?, last_name = ? WHERE user_id = ?`,
          {
            replacements: [firstName, lastName, user.user_id]
          }
        );
      } catch (error) {
        console.error(`❌ Error migrating user ${user.user_id}:`, error.message);
      }
    }

    // Set email_verified to true for existing users
    await queryInterface.sequelize.query(
      `UPDATE users SET email_verified = true WHERE email_verified IS NULL OR email_verified = false`
    ).catch(err => {
      console.log('ℹ️ Error setting email_verified - may already be set');
    });

    console.log(`✅ Migration completed successfully`);
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes first
    await queryInterface.removeIndex('users', 'mobile_unique')
      .catch(err => console.log('ℹ️ mobile_unique index may not exist'));
    await queryInterface.removeIndex('users', 'customer_id_unique')
      .catch(err => console.log('ℹ️ customer_id_unique index may not exist'));

    // Remove columns with error handling
    const columnsToRemove = [
      'first_name', 'last_name', 'mobile_number', 'email_verified',
      'mobile_verified', 'email_otp', 'mobile_otp', 'otp_expires_at',
      'customer_id', 'country_code', 'state_code', 'district_code',
      'block_code', 'village_code'
    ];
    
    for (const column of columnsToRemove) {
      try {
        await queryInterface.removeColumn('users', column);
        console.log(`✅ Removed column ${column}`);
      } catch (error) {
        console.log(`ℹ️ Column ${column} may not exist - skipping`);
      }
    }
  }
};