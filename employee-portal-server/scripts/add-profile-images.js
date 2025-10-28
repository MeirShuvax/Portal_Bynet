const { User } = require('../models');
const sequelize = require('../config/database');

async function addProfileImages() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // רשימת תמונות קיימות בתיקיית uploads
    const existingImages = [
      '/uploads/profile-1753688488449-890913013-רד_בינת.jpg',
      '/uploads/1753359834739-934951819-BYNAT_DATA_026.jpg',
      '/uploads/1753358823202-495372694-קפה_ריבר.jpg',
      '/uploads/1753358484719-392275711-BYNAT_DATA.jpg'
    ];

    // קבל את כל המשתמשים
    const users = await User.findAll();
    console.log(`Found ${users.length} users`);

    // הוסף תמונות פרופיל למשתמשים
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const imageIndex = i % existingImages.length;
      const profileImage = existingImages[imageIndex];
      
      await user.update({ profile_image: profileImage });
      console.log(`✅ Added profile image to ${user.full_name}: ${profileImage}`);
    }

    console.log('✅ All users updated with profile images');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addProfileImages(); 