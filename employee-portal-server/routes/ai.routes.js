const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Initialize a new AI session for the authenticated user
router.post('/init', authenticate, aiController.initSession);

// Ask a question to the AI assistant
router.post('/ask', authenticate, aiController.ask);
router.get('/history', authenticate, aiController.getConversationHistory);


module.exports = router; 