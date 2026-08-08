const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/school.controller');

// GET /api/v1/schools/search
router.get('/search', schoolController.searchSchools);

module.exports = router;