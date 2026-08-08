const authService = require('../services/auth.service');

exports.register = async (req, res) => {
  try {
    const data = await authService.registerUser(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const data = await authService.loginUser(req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const data = await authService.getUserProfile(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

// Cập nhật Hồ sơ (Họ tên & Avatar Cloudinary)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;
    const data = await authService.updateUserProfile(userId, req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};