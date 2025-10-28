'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Chat', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      sender_id: { type: Sequelize.INTEGER, allowNull: false },
      recipient_id: { type: Sequelize.INTEGER },
      content: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('messages');
  }
};