const express = require('express');
const router = express.Router();
const { generateOrgChartImage } = require('../controllers/chartImage.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// נתיב ליצירת תמונה של העץ הארגוני - POST במקום GET
router.post('/organizational-chart/image', authenticate, generateOrgChartImage);

module.exports = router;
