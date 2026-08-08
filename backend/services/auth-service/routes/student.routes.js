const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');

// PUT /api/v1/student/onboarding
router.put('/onboarding', studentController.updateStudentOnboarding);

module.exports = router;