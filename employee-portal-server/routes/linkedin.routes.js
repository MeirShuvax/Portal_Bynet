const express = require('express');
const router = express.Router();
const { getCompanyPosts } = require('../controllers/linkedin.controller');

router.get('/posts', getCompanyPosts);

module.exports = router;

