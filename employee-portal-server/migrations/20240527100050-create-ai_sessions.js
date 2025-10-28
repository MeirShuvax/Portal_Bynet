'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ai_sessions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false },
      assistant_id: { type: Sequelize.STRING, allowNull: false },
      thread_id: { type: Sequelize.STRING, allowNull: false },
      is_default: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_primary: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_temporary: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('ai_sessions');
  }
};