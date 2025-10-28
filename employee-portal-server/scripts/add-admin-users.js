require('dotenv').config({ path: './config.env' });
const sequelize = require('../config/database');
const { User } = require('../models');

const addAdminUsers = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to the database has been established successfully.');

    await sequelize.sync(); // Ensure models are synced

    const adminUsers = [
      {
        email: 'Meir.Shuvax@bynetdcs.co.il',
        full_name: 'Meir Shuvax',
        role: 'admin',
        password: null // No password for Microsoft authenticated users
      },
      {
        email: 'meirs@bynet.co.il',
        full_name: 'Meir Shalom',
        role: 'admin',
        password: null // No password for Microsoft authenticated users
      }
    ];

    console.log('🔄 Adding admin users...');

    for (const userData of adminUsers) {
      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: userData
      });
      
      if (created) {
        console.log(`✅ User ${user.email} created successfully.`);
      } else {
        // Update existing user to admin role
        if (user.role !== 'admin') {
          await user.update({ role: 'admin' });
          console.log(`✅ User ${user.email} updated to admin role.`);
        } else {
          console.log(`ℹ️  User ${user.email} already exists as admin.`);
        }
      }
    }

    console.log('🎉 Admin users added/updated successfully!');
    
    // Show all admin users
    const allAdmins = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id', 'email', 'full_name', 'role', 'createdAt']
    });
    
    console.log('\n📋 Current admin users:');
    allAdmins.forEach(admin => {
      console.log(`- ${admin.email} (${admin.full_name || 'No name'}) - ID: ${admin.id}`);
    });

  } catch (error) {
    console.error('❌ Error adding admin users:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
};

// Run the script
addAdminUsers();
