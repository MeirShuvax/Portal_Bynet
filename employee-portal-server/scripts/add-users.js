const { User } = require('../models');
require('dotenv').config({ path: './config.env' });

async function addUsers() {
  try {
    console.log('🔄 Adding users to database...');

    // List of users to add
    const users = [
      {
        full_name: 'Meir Shalom',
        email: 'meirs@bynet.co.il',
        role: 'admin',
        birth_date: '1990-01-01'
      },
      {
        full_name: 'Meir Shuvax',
        email: 'Meir.Shuvax@bynetdcs.co.il',
        role: 'user',
        birth_date: '1985-05-15'
      },
      {
        full_name: 'Meir Yirsh',
        email: 'meyirsh@std.jmc.ac.il',
        role: 'user',
        birth_date: '1992-03-20'
      }
    ];

    for (const userData of users) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: userData.email } });
        
        if (existingUser) {
          console.log(`✅ User ${userData.email} already exists`);
        } else {
          // Create new user
          const newUser = await User.create(userData);
          console.log(`✅ Created user: ${newUser.full_name} (${newUser.email})`);
        }
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('✅ User addition completed');
  } catch (error) {
    console.error('❌ Error in addUsers:', error);
  } finally {
    process.exit(0);
  }
}

addUsers();
