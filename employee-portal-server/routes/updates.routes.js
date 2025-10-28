const express = require('express');
const router = express.Router();
const updatesController = require('../controllers/updates.controller');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

// כל הקריאות דורשות התחברות
router.use(authenticate);

// קריאה לעדכונים הפעילים (ברירת מחדל)
router.get('/active', updatesController.getActiveUpdates);
// קריאה לכל העדכונים
router.get('/', updatesController.getAllUpdates);
// קריאה לעדכון בודד
router.get('/:id', updatesController.getUpdateById);
// יצירת עדכון (אדמין בלבד)
router.post('/', isAdmin, updatesController.createUpdate);
// עדכון עדכון (אדמין בלבד)
router.put('/:id', isAdmin, updatesController.updateUpdate);
// מחיקת עדכון (אדמין בלבד)
router.delete('/:id', isAdmin, updatesController.deleteUpdate);

module.exports = router; 