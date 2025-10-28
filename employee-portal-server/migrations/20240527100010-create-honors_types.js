'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('honors_types', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.TEXT }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('honors_types');
  }
};