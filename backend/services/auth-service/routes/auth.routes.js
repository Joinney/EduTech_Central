const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  refreshToken, 
  getMe, 
  updateProfile,
  studentOnboarding // 🟢 Import thêm hàm onboarding từ controller
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes (Cần Access Token)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile/:userId', protect, updateProfile);

// 🟢 Route cập nhật thông tin và chuyển isOnboarded thành false
router.put('/student/onboarding', protect, studentOnboarding);

module.exports = router;