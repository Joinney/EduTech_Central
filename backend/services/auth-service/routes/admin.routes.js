const express = require('express');
const router = express.Router();

// Đảm bảo tên file khớp 100% với file thực tế trong folder controllers
const adminController = require('../controllers/admincontroller'); 
const { verifyToken, verifyAdmin } = require('../middlewares/auth.middleware');

// Các đường dẫn bảo mật dành riêng cho Admin
router.get('/users', verifyToken, verifyAdmin, adminController.getUsers);
router.delete('/users/:userId', verifyToken, verifyAdmin, adminController.deleteUser);

module.exports = router;