const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// שליפה – 30 הודעות אחרונות עם אפשרות טעינה אחורה
router.get('/', authenticate, chatController.getChatMessages);

// שליחה – הודעה חדשה לצ'אט הקבוצתי
router.post('/', authenticate, chatController.sendMessage);

module.exports = router; 