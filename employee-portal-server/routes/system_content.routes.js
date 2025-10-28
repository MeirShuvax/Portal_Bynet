const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const systemContentController = require('../controllers/system_content.controller');

// הגדרת אחסון Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// העלאת קובץ (תמונה) או הוספת קישור
router.post('/', upload.single('file'), systemContentController.createSystemContent);

// שליפת כל תכני המערכת
router.get('/', systemContentController.getAllSystemContents);
// שליפת כל התמונות בלבד
router.get('/images', systemContentController.getAllImages);
// שליפת כל הקישורים בלבד
router.get('/links', systemContentController.getAllLinks);

module.exports = router; 