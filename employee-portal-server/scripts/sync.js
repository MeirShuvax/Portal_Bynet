// scripts/sync.js
require('dotenv').config();
const { exec } = require('child_process');

// יצירת מסד אם לא קיים
const mysql = require('mysql2/promise');

async function createDatabaseIfNotExists() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
  console.log(`✅ Database '${process.env.DB_NAME}' is ready.`);
  await connection.end();
}

async function runMigrations() {
  exec('npx sequelize-cli db:migrate', (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Migration failed:', stderr);
      process.exit(1);
    } else {
      console.log('✅ Database migrated successfully:');
      console.log(stdout);
    }
  });
}

createDatabaseIfNotExists().then(runMigrations);
