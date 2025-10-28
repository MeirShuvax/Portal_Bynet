'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('wishes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      honor_id: { type: Sequelize.INTEGER, allowNull: false },
      from_user_id: { type: Sequelize.INTEGER, allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('wishes');
  }
};