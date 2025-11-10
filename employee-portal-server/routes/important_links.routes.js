const express = require('express');
const router = express.Router();
const {
  getAllLinks,
  createLink,
  updateLink,
  deleteLink
} = require('../controllers/system_content.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// שליפת כל הקישורים (כולם יכולים)
router.get('/', getAllLinks);

// יצירת קישור חדש - מנהל בלבד
router.post('/', authenticate, isAdmin, createLink);

// עדכון קישור קיים - מנהל בלבד
router.put('/:id', authenticate, isAdmin, updateLink);

// מחיקת קישור - מנהל בלבד
router.delete('/:id', authenticate, isAdmin, deleteLink);

module.exports = router;

