'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // עדכן את כל העובדים שלא יש להם manager_id
    // בחר מנהל רנדומלי עבור כל עובד
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET manager_id = (
        SELECT id FROM users 
        WHERE role = 'admin' 
        ORDER BY RAND() 
        LIMIT 1
      )
      WHERE manager_id IS NULL 
      AND role != 'admin'
    `);

    // הוסף אילוץ NOT NULL לשדה manager_id (למעט מנהלים)
    await queryInterface.changeColumn('users', 'manager_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // נשאיר true כי מנהלים לא צריכים manager_id
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // הוסף אינדקס לשיפור ביצועים
    await queryInterface.addIndex('users', ['manager_id']);
  },

  async down(queryInterface, Sequelize) {
    // הסר את האינדקס
    await queryInterface.removeIndex('users', ['manager_id']);
    
    // החזר את השדה למצב הקודם
    await queryInterface.changeColumn('users', 'manager_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
}; 