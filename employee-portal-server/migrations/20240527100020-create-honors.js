'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('honors', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false },
      honors_type_id: { type: Sequelize.INTEGER, allowNull: false },
      display_until: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('honors');
  }
};