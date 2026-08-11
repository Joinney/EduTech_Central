const authService = require('../services/auth.service');

// Lấy danh sách toàn bộ người dùng
exports.getUsers = async (req, res) => {
  try {
    const users = await authService.getAllUsers();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Xóa người dùng theo ID
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await authService.deleteUser(userId);
    res.status(200).json({ success: true, message: 'Đã xóa người dùng thành công' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};