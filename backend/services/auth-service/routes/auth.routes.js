const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Public Authentication Endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);
router.post('/refresh-token', authController.refreshToken);

// Protected User Endpoints
router.get('/me', verifyToken, authController.getMe);
router.put('/profile', verifyToken, authController.updateProfile);

// Protected Onboarding Endpoints
router.post('/onboarding/student', verifyToken, authController.studentOnboarding);
router.post('/onboarding/teacher', verifyToken, authController.teacherOnboarding);

module.exports = router;