'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    for (const table of tables) {
      // We should not touch the SequelizeMeta table which tracks migrations.
      if (table.toLowerCase() === 'sequelizemeta') {
        continue;
      }

      const tableDescription = await queryInterface.describeTable(table);

      if (!tableDescription.createdAt) {
        await queryInterface.addColumn(table, 'createdAt', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        });
      }

      if (!tableDescription.updatedAt) {
        await queryInterface.addColumn(table, 'updatedAt', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    for (const table of tables) {
      if (table.toLowerCase() === 'sequelizemeta') {
        continue;
      }
      try {
        await queryInterface.removeColumn(table, 'createdAt');
        await queryInterface.removeColumn(table, 'updatedAt');
      } catch (e) {
        console.log(`Could not remove timestamp columns from ${table}`, e);
      }
    }
  }
}; 