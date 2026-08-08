const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Route cập nhật thông tin học viên & avatar
router.put('/profile/:userId', updateProfile);

module.exports = router;