const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const systemContentController = require('../controllers/system_content.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// הגדרת אחסון Multer
// בפרודקשן: התמונות נשמרות בתיקיית uploads בשרת
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // אפשר להשתמש במשתנה סביבה לפרודקשן, או ברירת מחדל
    const uploadPath = process.env.UPLOADS_PATH || path.join(__dirname, '../uploads');
    
    // וודא שהתיקייה קיימת
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log('✅ Created uploads directory:', uploadPath);
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// העלאת קובץ (תמונה) או הוספת קישור - רק למנהלים
router.post('/', authenticate, isAdmin, upload.single('file'), systemContentController.createSystemContent);

// שליפת כל תכני המערכת - כולם יכולים לראות
router.get('/', systemContentController.getAllSystemContents);
// שליפת כל התמונות בלבד - כולם יכולים לראות
router.get('/images', systemContentController.getAllImages);
// שליפת כל הקישורים בלבד - כולם יכולים לראות
router.get('/links', systemContentController.getAllLinks);

// מחיקת תוכן מערכת - רק למנהלים
router.delete('/:id', authenticate, isAdmin, systemContentController.deleteSystemContent);

module.exports = router; 