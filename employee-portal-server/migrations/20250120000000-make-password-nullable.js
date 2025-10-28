'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Make password column nullable
    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert password column to not nullable
    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING(255),
      allowNull: false
    });
  }
};
