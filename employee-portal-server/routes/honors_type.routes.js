const express = require('express');
const router = express.Router();
const honorsTypeController = require('../controllers/honors_type.controller');
const { isAdmin } = require('../middlewares/auth.middleware');

// All users can see types
router.get('/', honorsTypeController.getAllHonorsTypes);

// Only admin can create, update, delete
router.post('/', isAdmin, honorsTypeController.createHonorsType);
router.put('/:id', isAdmin, honorsTypeController.updateHonorsType);
router.delete('/:id', isAdmin, honorsTypeController.deleteHonorsType);

module.exports = router;
