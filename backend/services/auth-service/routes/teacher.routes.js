const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');

// PUT /api/v1/teacher/onboarding
router.put('/onboarding', teacherController.teacherOnboarding);

module.exports = router;