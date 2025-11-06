const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/users.controller');
const {authenticate, isAdmin, isSelfOrAdmin } = require('../middlewares/auth.middleware');

// הגדרת Multer להעלאת תמונות פרופיל
// בפרודקשן: התמונות נשמרות בתיקיית uploads בשרת
// נתיב: אפשר להשתמש ב-UPLOADS_PATH או ברירת מחדל: __dirname/../uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // אפשר להשתמש במשתנה סביבה לפרודקשן, או ברירת מחדל
    const uploadPath = process.env.UPLOADS_PATH || path.join(__dirname, '../uploads');
    console.log('📁 Upload destination:', uploadPath);
    
    // וודא שהתיקייה קיימת (עובד גם בפרודקשן)
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log('✅ Created uploads directory:', uploadPath);
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // הסר תווים מיוחדים ושמור רק אותיות באנגלית, מספרים ונקודות
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = 'profile-' + uniqueSuffix + '-' + safeName;
    console.log('📝 Generated filename:', filename);
    console.log('📝 Original filename:', file.originalname);
    cb(null, filename);
  }
});
// ולידציה לקבצי תמונה
const fileFilter = (req, file, cb) => {
  console.log('🔍 File filter called for:', file.originalname);
  console.log('📁 File mimetype:', file.mimetype);
  
  // בדוק אם הקובץ הוא תמונה
  if (file.mimetype.startsWith('image/')) {
    console.log('✅ File accepted:', file.originalname);
    cb(null, true);
  } else {
    console.log('❌ File rejected:', file.originalname, '- not an image');
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // מגביל ל-5MB
  }
});

// Route to get the current authenticated user
router.get('/me', authenticate, userController.getMe);

// Route to get all users (Admin only)
router.get('/', authenticate, isAdmin, userController.getAllUsers);

// Route to get all users for team display (authenticated users)
router.get('/team', authenticate, userController.getAllUsers);

// Route to get birthdays
router.get('/birthdays/all', userController.getAllBirthday);

// Route to get users with profile images
router.get('/with-images', userController.getUsersWithProfileImages);

// Route to search users with profile images
router.get('/with-images/search', userController.searchUsersWithProfileImages);

// Route to get recent users with profile images
router.get('/with-images/recent', userController.getRecentUsersWithProfileImages);

// Route to get users with profile images by role
router.get('/with-images/role/:role', userController.getUsersWithProfileImagesByRole);

// Route to get users with profile images by manager
router.get('/with-images/manager/:managerId', userController.getUsersWithProfileImagesByManager);

// Route to get users with profile images by birth month
router.get('/with-images/birth-month/:month', userController.getUsersWithProfileImagesByBirthMonth);

// Route to get users with profile images by date range
router.get('/with-images/date-range', userController.getUsersWithProfileImagesByDateRange);

// Route to get users with profile images by update date range
router.get('/with-images/update-date-range', userController.getUsersWithProfileImagesByUpdateDateRange);

// Route to get users with profile images by email domain
router.get('/with-images/email-domain/:domain', userController.getUsersWithProfileImagesByEmailDomain);

// Route to get user by name (for debugging)
router.get('/by-name/:name', userController.getUserByName);

// Route to get user profile image directly (smart API) - custom auth handling
router.get('/profile-image/:userId', userController.getUserProfileImageDirect);

// Route to get organizational structure - REMOVED (function not implemented)
// router.get('/organizational-structure', userController.getOrganizationalStructure);

// Route to update employee organizational details - REMOVED (function not implemented)
// router.put('/:id/organizational-details', isSelfOrAdmin, userController.updateEmployeeOrganizationalDetails);

// Route to get user profile image
router.get('/:id/profile-image', userController.getUserProfileImage);

router.get('/:id', userController.getUserById);

// Route to create user (Admin only) - supports optional image
router.post('/', authenticate, isAdmin, upload.single('image'), (req, res, next) => {
  console.log('🔍 POST /users middleware - Request received');
  console.log('📝 Headers:', req.headers);
  console.log('📝 Body before processing:', req.body);
  console.log('📝 File:', req.file);
  next();
}, userController.createUserWithImage);

// Route to update user (admin or self) - supports optional image
router.put('/:id', authenticate, isSelfOrAdmin, upload.single('image'), userController.updateUserWithImage);

// Route to delete user profile image only
router.delete('/:id/profile-image', authenticate, isSelfOrAdmin, userController.deleteUserProfileImage);
router.delete('/:id', authenticate, isAdmin, userController.deleteUser);

// טיפול בשגיאות Multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: 'File upload error' });
  }
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: 'Only image files are allowed!' });
  }
  next(error);
});

module.exports = router;
