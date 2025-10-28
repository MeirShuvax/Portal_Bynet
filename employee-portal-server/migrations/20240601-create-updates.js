'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('updates', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      expiry_date: { type: Sequelize.DATE, allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_by: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('updates');
  }
}; 