'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      full_name: { type: Sequelize.STRING, allowNull: true },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: true },
      role: { type: Sequelize.ENUM('viewer', 'editor', 'admin'), defaultValue: 'viewer' },
      birth_date: { type: Sequelize.DATE },
      department: { type: Sequelize.STRING },
      manager_id: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    // הכנסת משתמשים התחלתיים
    await queryInterface.bulkInsert('users', [
      {
        full_name: 'Admin User',
        email: 'admin@example.com',
        password: '123456',
        role: 'admin',
        birth_date: '1990-01-01',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        full_name: 'Elad',
        email: 'elad@example.com',
        password: '123456',
        role: 'editor',
        birth_date: '1995-05-12',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        full_name: 'Orna',
        email: 'orna@example.com',
        password: '123456',
        role: 'viewer',
        birth_date: '1998-08-20',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        full_name: 'Meir Shuvax',
        email: 'Meir.Shuvax@bynetdcs.co.il',
        password: 'N/A',
        role: 'admin',
        birth_date: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        full_name: 'Meir Shalom',
        email: 'meirs@bynet.co.il',
        password: 'N/A',
        role: 'admin',
        birth_date: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};
