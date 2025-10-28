require('dotenv').config({ path: './config.env' });
const sequelize = require('../config/database');
const { User } = require('../models');

const addUsers = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Add admin users
    const users = [
      {
        email: 'Meir.Shuvax@bynetdcs.co.il',
        full_name: 'Meir Shuvax',
        role: 'admin'
      },
      {
        email: 'meirs@bynet.co.il', 
        full_name: 'Meir Shalom',
        role: 'admin'
      }
    ];

    for (const userData of users) {
      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });
      
      if (created) {
        console.log(`Created: ${user.email}`);
      } else {
        console.log(`Exists: ${user.email}`);
      }
    }

    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
};

addUsers();
