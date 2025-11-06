const { Op } = require('sequelize');
const { User } = require('../models');
const path = require('path');
const fs = require('fs');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    console.log('📋 getAllUsers called. User making request:', req.user ? req.user.full_name : 'No user');
    
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // לא להחזיר סיסמאות
      order: [['full_name', 'ASC']] // מיון לפי שם
    });
    
    console.log(`✅ Found ${users.length} users`);
    console.log('📤 Returning users with all details except password');
    
    // החזר את כל הפרטים חוץ מהסיסמה
    const usersWithoutPassword = users.map(user => {
      const userData = user.toJSON();
      delete userData.password;
      return userData;
    });
    
    res.json(usersWithoutPassword);
  } catch (err) {
    console.error('❌ Error in getAllUsers:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get users with profile images only
exports.getUsersWithProfileImages = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        profile_image: {
          [Op.not]: null
        }
      },
      attributes: ['id', 'full_name', 'profile_image', 'email'],
      order: [['full_name', 'ASC']]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get user profile image
exports.getUserProfileImage = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'full_name', 'profile_image']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.profile_image) {
      return res.status(404).json({ error: 'User has no profile image' });
    }
    
    res.json({
      id: user.id,
      full_name: user.full_name,
      profile_image: user.profile_image
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Search users with profile images
exports.searchUsersWithProfileImages = async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const users = await User.findAll({
      where: {
        [Op.and]: [
          {
            profile_image: {
              [Op.not]: null
            }
          },
          {
            [Op.or]: [
              {
                full_name: {
                  [Op.like]: `%${search}%`
                }
              },
              {
                email: {
                  [Op.like]: `%${search}%`
                }
              }
            ]
          }
        ]
      },
      attributes: ['id', 'full_name', 'profile_image', 'email'],
      order: [['full_name', 'ASC']]
    });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get recent users with profile images
exports.getRecentUsersWithProfileImages = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const users = await User.findAll({
      where: {
        profile_image: {
          [Op.not]: null
        }
      },
      attributes: ['id', 'full_name', 'profile_image', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get users with profile images by role
exports.getUsersWithProfileImagesByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    const users = await User.findAll({
      where: {
        [Op.and]: [
          {
            profile_image: {
              [Op.not]: null
            }
          },
          {
            role: role
          }
        ]
      },
      attributes: ['id', 'full_name', 'profile_image', 'email', 'role'],
      order: [['full_name', 'ASC']]
    });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get users with profile images by manager
exports.getUsersWithProfileImagesByManager = async (req, res) => {
  try {
    const { managerId } = req.params;
    
    const users = await User.findAll({
      where: {
        [Op.and]: [
          {
            profile_image: {
              [Op.not]: null
            }
          },
          {
            manager_id: managerId
          }
        ]
      },
      attributes: ['id', 'full_name', 'profile_image', 'email', 'manager_id'],
      order: [['full_name', 'ASC']]
    });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get users with profile images by birth month
exports.getUsersWithProfileImagesByBirthMonth = async (req, res) => {
  try {
    const { month } = req.params;
    
    const users = await User.findAll({
      where: {
        [Op.and]: [
          {
            profile_image: {
              [Op.not]: null
            }
          },
          {
            birth_date: {
              [Op.not]: null
            }
          }
        ]
      },
      attributes: ['id', 'full_name', 'profile_image', 'email', 'birth_date'],
      order: [['full_name', 'ASC']]
    });
    
    // סינון לפי חודש לידה
    const filteredUsers = users.filter(user => {
      if (!user.birth_date) return false;
      const birthMonth = new Date(user.birth_date).getMonth() + 1;
      return birthMonth === parseInt(month);
    });
    
    res.json(filteredUsers);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get users with profile images by creation date range
exports.getUsersWithProfileImagesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const users = await User.findAll({
      where: {
        [Op.and]: [
          {
            profile_image: {
              [Op.not]: null
            }
          },
          {
            createdAt: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          }
        ]
      },
      attributes: ['id', 'full_name', 'profile_image', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get users with profile images by update date range
exports.getUsersWithProfileImagesByUpdateDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const users = await User.findAll({
      where: {
        [Op.and]: [
          {
            profile_image: {
              [Op.not]: null
            }
          },
          {
            updatedAt: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          }
        ]
      },
      attributes: ['id', 'full_name', 'profile_image', 'email', 'updatedAt'],
      order: [['updatedAt', 'DESC']]
    });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get users with profile images by email domain
exports.getUsersWithProfileImagesByEmailDomain = async (req, res) => {
  try {
    const { domain } = req.params;
    
    const users = await User.findAll({
      where: {
        [Op.and]: [
          {
            profile_image: {
              [Op.not]: null
            }
          },
          {
            email: {
              [Op.like]: `%@${domain}`
            }
          }
        ]
      },
      attributes: ['id', 'full_name', 'profile_image', 'email'],
      order: [['full_name', 'ASC']]
    });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get users with profile images by name pattern
exports.getUsersWithProfileImagesByNamePattern = async (req, res) => {
  try {
    const { pattern } = req.params;
    
    const users = await User.findAll({
      where: {
        [Op.and]: [
          {
            profile_image: {
              [Op.not]: null
            }
          },
          {
            full_name: {
              [Op.like]: `%${pattern}%`
            }
          }
        ]
      },
      attributes: ['id', 'full_name', 'profile_image', 'email'],
      order: [['full_name', 'ASC']]
    });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] } // לא להחזיר סיסמה
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    console.log('🔍 getUserById - User data:', {
      id: user.id,
      full_name: user.full_name,
      profile_image: user.profile_image
    });
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Create a new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { full_name, email, password, role, manager_id, birth_date } = req.body;

    // בדיקה אם שדות חובה חסרים
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields: full_name, email or password' });
    }

    // בדיקה אם כבר קיים משתמש עם אותו אימייל
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const newUser = await User.create({
      full_name,
      email,
      password,
      role: role || 'viewer',
      manager_id,
      birth_date
    });

    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while creating user' });
  }
};

// Create a new user with profile image (admin only)
exports.createUserWithImage = async (req, res) => {
  try {
    console.log('🔍 createUserWithImage called');
    
    // בדיקה שהדאטאבייס מחובר
    const sequelize = require('../config/database');
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection OK');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return res.status(500).json({ error: 'Database connection failed' });
    }
    console.log('📝 Request body:', req.body);
    console.log('📝 Request body keys:', Object.keys(req.body));
    console.log('📝 Request body values:', Object.values(req.body));
    console.log('📁 Request file:', req.file);
    
    // בדיקה מפורטת של השדות
    const full_name = req.body.full_name ? req.body.full_name.trim() : null;
    const email = req.body.email ? req.body.email.trim().replace(/^"|"$/g, '') : null; // הסר גרשיים
    const password = req.body.password ? req.body.password.trim().replace(/^"|"$/g, '') : null; // הסר גרשיים
    const role = req.body.role ? req.body.role.trim().replace(/^"|"$/g, '') : null; // הסר גרשיים
    const manager_id = req.body.manager_id ? req.body.manager_id.trim().replace(/^"|"$/g, '') : null; // הסר גרשיים
    const birth_date = req.body.birth_date ? req.body.birth_date.trim().replace(/^"|"$/g, '') : null; // הסר גרשיים
    
    console.log('🔍 Extracted fields:');
    console.log('  - full_name:', full_name, '(type:', typeof full_name, ')');
    console.log('  - email:', email, '(type:', typeof email, ')');
    console.log('  - password:', password ? '***' : 'undefined', '(type:', typeof password, ')');
    console.log('  - role:', role, '(type:', typeof role, ')');
    console.log('  - manager_id:', manager_id, '(type:', typeof manager_id, ')');
    console.log('  - birth_date:', birth_date, '(type:', typeof birth_date, ')');
    
    let profile_image = null;
    
    // בדיקה אם שדות חובה חסרים
    if (!full_name || !email || !password) {
      console.error('❌ Missing required fields:');
      console.error('  - full_name:', full_name ? 'present' : 'missing');
      console.error('  - email:', email ? 'present' : 'missing');
      console.error('  - password:', password ? 'present' : 'missing');
      return res.status(400).json({ error: 'Missing required fields: full_name, email or password' });
    }

    // בדיקה שכל עובד חייב להיות תחת מנהל (חוץ ממנהלים)
    if (role !== 'admin' && !manager_id) {
      console.error('❌ Non-admin users must have a manager_id');
      return res.status(400).json({ 
        error: 'עובדים חייבים להיות תחת מנהל. אנא בחר מנהל מהרשימה.' 
      });
    }

    // בדיקה שהמנהל קיים במסד הנתונים
    if (manager_id) {
      const managerExists = await User.findByPk(manager_id);
      if (!managerExists) {
        console.error('❌ Manager not found:', manager_id);
        return res.status(400).json({ 
          error: 'המנהל שנבחר לא קיים במערכת' 
        });
      }
    }
    
    // בדיקה שהאימייל תקין
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format:', email);
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // בדיקה שהמודל User זמין
    if (!User) {
      console.error('❌ User model not available');
      return res.status(500).json({ error: 'User model not available' });
    }
    
    // בדיקה אם כבר קיים משתמש עם אותו אימייל
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.error('❌ User with email already exists:', email);
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // אם יש קובץ, שמור את הנתיב
    if (req.file) {
      profile_image = `/uploads/${req.file.filename}`;
      console.log('✅ Image uploaded:', profile_image);
    } else {
      console.log('ℹ️ No image uploaded');
    }

    const newUser = await User.create({
      full_name,
      email,
      password,
      role: role || 'viewer',
      manager_id,
      birth_date,
      profile_image
    });

    console.log('✅ User created successfully:', newUser.id);

    // החזר את המשתמש ללא הסיסמה
    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    console.log('📤 Returning user data:', userWithoutPassword);
    res.status(201).json(userWithoutPassword);
  } catch (err) {
    console.error('❌ Error in createUserWithImage:', err);
    console.error('❌ Error stack:', err.stack);
    console.error('❌ Error message:', err.message);
    
    // בדיקה אם זו שגיאת Sequelize
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: err.errors.map(e => e.message) 
      });
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }
    
    res.status(500).json({ 
      error: 'Server error while creating user',
      details: err.message 
    });
  }
};

// Update user (admin or self)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: 'Invalid update' });
  }
};

// Update user with optional image (admin or self)
exports.updateUserWithImage = async (req, res) => {
  try {
    console.log('🔍 updateUserWithImage called for user:', req.params.id);
    console.log('📝 Request body:', req.body);
    console.log('📁 Request file:', req.file);
    
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    // הכנת נתוני העדכון
    const updateData = { ...req.body };
    
    // אם יש קובץ תמונה חדש, מחק את הישן לפני שמירת החדש
    if (req.file) {
      // מחק תמונה ישנה אם קיימת
      if (user.profile_image) {
        try {
          const fs = require('fs');
          const path = require('path');
          const uploadsDir = process.env.UPLOADS_PATH || path.join(__dirname, '..', 'uploads');
          
          // ניקוי הנתיב - הסר /uploads/ אם יש, והשאר רק את שם הקובץ
          let oldImageFilename = user.profile_image;
          if (oldImageFilename.startsWith('/uploads/')) {
            oldImageFilename = oldImageFilename.replace('/uploads/', '');
          } else if (oldImageFilename.startsWith('/')) {
            oldImageFilename = oldImageFilename.substring(1);
          }
          
          const oldImagePath = path.join(uploadsDir, oldImageFilename);
          console.log('🔍 Checking for old image at:', oldImagePath);
          
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log('🗑️ Deleted old profile image:', oldImageFilename);
          }
        } catch (deleteError) {
          console.log('⚠️ Could not delete old image:', deleteError.message);
          // לא נכשל אם לא הצלחנו למחוק - נמשיך עם התמונה החדשה
        }
      }
      
      updateData.profile_image = `/${req.file.filename}`;
      console.log('✅ Image uploaded:', updateData.profile_image);
    } else {
      console.log('ℹ️ No image uploaded');
    }

    // עדכן את המשתמש
    await user.update(updateData);
    console.log('✅ User updated successfully');

    // החזר את המשתמש ללא הסיסמה
    const { password, ...userWithoutPassword } = user.toJSON();
    console.log('📤 Returning updated user data:', userWithoutPassword);
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('❌ Error in updateUserWithImage:', err);
    res.status(500).json({ error: 'Server error while updating user' });
  }
};

// Update user profile image (admin or self)
exports.updateUserProfileImage = async (req, res) => {
  try {
    console.log('🔍 updateUserProfileImage called for user:', req.params.id);
    console.log('📁 Request file:', req.file);
    
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.file) {
      // מחק תמונה ישנה אם קיימת
      if (user.profile_image) {
        try {
          const fs = require('fs');
          const path = require('path');
          const uploadsDir = process.env.UPLOADS_PATH || path.join(__dirname, '..', 'uploads');
          
          // ניקוי הנתיב - הסר /uploads/ אם יש, והשאר רק את שם הקובץ
          let oldImageFilename = user.profile_image;
          if (oldImageFilename.startsWith('/uploads/')) {
            oldImageFilename = oldImageFilename.replace('/uploads/', '');
          } else if (oldImageFilename.startsWith('/')) {
            oldImageFilename = oldImageFilename.substring(1);
          }
          
          const oldImagePath = path.join(uploadsDir, oldImageFilename);
          console.log('🔍 Checking for old image at:', oldImagePath);
          
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log('🗑️ Deleted old profile image:', oldImageFilename);
          }
        } catch (deleteError) {
          console.log('⚠️ Could not delete old image:', deleteError.message);
          // לא נכשל אם לא הצלחנו למחוק - נמשיך עם התמונה החדשה
        }
      }
      
      const profile_image = `/${req.file.filename}`;
      await user.update({ profile_image });
      
      console.log('✅ Profile image updated:', profile_image);
      
      // החזר את המשתמש ללא הסיסמה
      const { password, ...userWithoutPassword } = user.toJSON();
      console.log('📤 Returning updated user data:', userWithoutPassword);
      res.json(userWithoutPassword);
    } else {
      console.error('❌ No image file uploaded');
      res.status(400).json({ error: 'No image file uploaded' });
    }
  } catch (err) {
    console.error('❌ Error in updateUserProfileImage:', err);
    res.status(500).json({ error: 'Server error while updating profile image' });
  }
};

// Get user profile image directly (smart API endpoint)
exports.getUserProfileImageDirect = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🔍 Getting profile image for user ID:', userId);
    console.log('🔍 Token from query:', req.query.token);
    console.log('🔍 Token from header:', req.headers.authorization);
    
    // Check token from query parameter or header
    let token = req.query.token;
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.replace('Bearer ', '');
    }
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ error: 'Token required' });
    }
    
    // Verify token (simplified check)
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('✅ Token verified for user:', decoded.email);
    } catch (tokenError) {
      console.log('❌ Invalid token:', tokenError.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'full_name', 'profile_image']
    });
    
    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.profile_image) {
      console.log('❌ User has no profile image:', userId);
      return res.status(404).json({ error: 'User has no profile image' });
    }
    
    // Clean the image path
    let imagePath = user.profile_image;
    if (imagePath.startsWith('/uploads/')) {
      imagePath = imagePath.replace('/uploads/', '');
    } else if (imagePath.startsWith('/')) {
      imagePath = imagePath.substring(1);
    }
    
    const fullPath = path.join(__dirname, '..', 'uploads', imagePath);
    console.log('📁 Looking for image at:', fullPath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.log('❌ Image file not found:', fullPath);
      return res.status(404).json({ error: 'Image file not found' });
    }
    
    console.log('✅ Serving image for user:', user.full_name);
    res.sendFile(fullPath);
    
  } catch (err) {
    console.error('❌ Error in getUserProfileImageDirect:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get user by name (for debugging)
exports.getUserByName = async (req, res) => {
  try {
    const { name } = req.params;
    console.log('🔍 Searching for user by name:', name);
    
    const user = await User.findOne({
      where: {
        full_name: {
          [Op.like]: `%${name}%`
        }
      },
      attributes: ['id', 'full_name', 'profile_image', 'email']
    });
    
    if (!user) {
      console.log('❌ User not found with name:', name);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ Found user:', {
      id: user.id,
      full_name: user.full_name,
      profile_image: user.profile_image,
      email: user.email
    });
    
    res.json(user);
  } catch (err) {
    console.error('❌ Error in getUserByName:', err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Delete user profile image (admin or self)
exports.deleteUserProfileImage = async (req, res) => {
  try {
    console.log('🔍 deleteUserProfileImage called for user:', req.params.id);
    
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('📁 Current profile image:', user.profile_image);

    // מחק את התמונה מהדיסק אם היא קיימת
    if (user.profile_image) {
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '..', user.profile_image.replace('/uploads/', 'uploads/'));
      
      console.log('🗑️ Attempting to delete file:', imagePath);
      
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('✅ File deleted from disk');
      } else {
        console.log('ℹ️ File not found on disk');
      }
    }

    // מחק את הנתיב מהדאטאבייס
    await user.update({ profile_image: null });
    console.log('✅ Profile image removed from database');
    
    // החזר את המשתמש ללא הסיסמה
    const { password, ...userWithoutPassword } = user.toJSON();
    console.log('📤 Returning updated user data:', userWithoutPassword);
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('❌ Error in deleteUserProfileImage:', err);
    res.status(500).json({ error: 'Server error while deleting profile image' });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all birthdays within ±7 days
exports.getAllBirthday = async (req, res) => {
  try {
    const today = new Date();
    const lastWeek = new Date(today);
    const nextWeek = new Date(today);

    lastWeek.setDate(today.getDate() - 7);
    nextWeek.setDate(today.getDate() + 7);

    const todayMonthDay = (d) =>
      `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;

    const lastWeekMD = todayMonthDay(lastWeek);
    const nextWeekMD = todayMonthDay(nextWeek);

    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });

    const birthdayUsers = users.filter((user) => {
      if (!user.birth_date) return false;
      const birthMD = todayMonthDay(new Date(user.birth_date));
      return birthMD >= lastWeekMD && birthMD <= nextWeekMD;
    });

    res.json(
      birthdayUsers.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        birth_date: u.birth_date,
        profile_image: u.profile_image
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get the currently authenticated user's details
exports.getMe = async (req, res) => {
  try {
    // The user object is attached to the request by the authenticate middleware
    // But we need to get the full user from DB to get the actual role
    const userFromRequest = req.user;

    if (!userFromRequest) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    console.log('🔍 getMe - User ID from request:', userFromRequest.id);
    console.log('🔍 getMe - User email from request:', userFromRequest.email);
    
    // Get full user from database to get actual role
    const user = await User.findByPk(userFromRequest.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      console.error('❌ getMe - User not found in database for ID:', userFromRequest.id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ getMe - User found:', {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      roleType: typeof user.role
    });
    
    // Return all user details with actual role from database
    // Convert to plain object to ensure role is included
    const userData = user.toJSON();
    console.log('📤 getMe - Returning user data:', {
      id: userData.id,
      email: userData.email,
      role: userData.role
    });
    
    res.json(userData);

  } catch (error) {
    console.error('❌ Error fetching current user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
