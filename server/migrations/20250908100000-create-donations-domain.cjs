'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Donors table
    await queryInterface.createTable('Donors', {
      donor_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'user_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      customer_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true,
      },
      is_subscriber: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      subscription_type: {
        type: Sequelize.ENUM('one-time', 'repeated'),
        allowNull: false,
        defaultValue: 'one-time',
      },
      purpose: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      meta: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('Donors', ['user_id'], { name: 'donor_user_idx' });
    await queryInterface.addIndex('Donors', ['is_subscriber', 'subscription_type'], { name: 'donor_subscription_idx' });

    // Donations table
    await queryInterface.createTable('Donations', {
      donation_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      donor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Donors', key: 'donor_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'user_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      customer_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      purpose: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      payment_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      payment_signature: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      payment_status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed'),
        defaultValue: 'pending',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('Donations', ['donor_id'], { name: 'donation_donor_idx' });
    await queryInterface.addIndex('Donations', ['user_id'], { name: 'donation_user_idx' });
    await queryInterface.addIndex('Donations', ['year'], { name: 'donation_year_idx' });
    await queryInterface.addIndex('Donations', ['date'], { name: 'donation_date_idx' });

    // Expenditures table
    await queryInterface.createTable('Expenditures', {
      expenditure_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      initiative: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      invoice_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      by_whom: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      expense_details: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      evidence_copy_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('Expenditures', ['year'], { name: 'expenditure_year_idx' });
    await queryInterface.addIndex('Expenditures', ['date'], { name: 'expenditure_date_idx' });
    await queryInterface.addIndex('Expenditures', ['initiative'], { name: 'expenditure_initiative_idx' });

    // BalanceSnapshots table
    await queryInterface.createTable('BalanceSnapshots', {
      snapshot_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      balance_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('BalanceSnapshots', ['year'], { name: 'balance_year_idx' });
    await queryInterface.addIndex('BalanceSnapshots', ['date'], { name: 'balance_date_idx' });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BalanceSnapshots');
    await queryInterface.dropTable('Expenditures');
    await queryInterface.dropTable('Donations');
    await queryInterface.dropTable('Donors');
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS \"enum_Donors_subscription_type\";");
  }
};


