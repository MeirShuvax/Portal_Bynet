// routes/honors.routes.js

const express = require('express');
const router = express.Router();
const honorsController = require('../controllers/honors.controller');
const { isAdmin } = require('../middlewares/auth.middleware');

// Get honor by ID
router.get('/:id', honorsController.getHonorById);

// Get all honors (active + inactive)
router.get('/', honorsController.getAllHonors);

// Get active honors by user ID
router.get('/by-user/:userId/active', honorsController.getHonorsByUserActive);

// Get inactive honors by user ID
router.get('/by-user/:userId/inactive', honorsController.getHonorsByUserInactive);

// Get active honors by type ID
router.get('/by-type/:typeId/active', honorsController.getHonorsByTypeActive);

// Get inactive honors by type ID
router.get('/by-type/:typeId/inactive', honorsController.getHonorsByTypeInactive);

// Get all active honors (for all users & types)
router.get('/active', honorsController.getActiveHonors);

// Get all inactive honors (for all users & types)
router.get('/inactive', honorsController.getInactiveHonors);

// Admin only: create, update, delete
router.post('/', isAdmin, honorsController.createHonor);
router.put('/:id', isAdmin, honorsController.updateHonor);
router.delete('/:id', isAdmin, honorsController.deleteHonor);

module.exports = router;