const express = require('express');
const router = express.Router();
const wishesController = require('../controllers/wishes.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Get all birthday wishes
router.get('/birthday', authenticate, wishesController.getBirthdayWishes);

// Create a new wish
router.post('/', authenticate, wishesController.createWish);

// Get wishes for specific honor
router.get('/honor/:honorId', authenticate, wishesController.getWishesForHonor);

module.exports = router;
// אולי
//להוסיף איחולים למישהו ספציפי להוקרה ספציפית