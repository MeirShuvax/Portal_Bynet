const sequelize = require('../config/database');

async function addProfileImageColumn() {
  try {
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN profile_image VARCHAR(512) NULL
    `);
    console.log('✅ Successfully added profile_image column to users table');
  } catch (error) {
    console.error('❌ Error adding profile_image column:', error.message);
  } finally {
    await sequelize.close();
  }
}

addProfileImageColumn(); 