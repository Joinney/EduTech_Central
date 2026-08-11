const authService = require('../services/auth.service');

// Đăng ký
exports.register = async (req, res) => {
  try {
    const data = await authService.registerUser(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const data = await authService.loginUser(req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

// Đăng xuất
exports.logout = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.id_users || req.user?.sub;
    
    if (userId) {
      await authService.logoutUser(userId);
    }

    res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cấp Access Token mới từ Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const data = await authService.refreshAccessToken(refreshToken);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }
};

// Lấy thông tin user hiện tại
exports.getMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.id_users || req.user?.sub;
    const data = await authService.getUserProfile(userId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

// Cập nhật Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id || req.user?.id_users;
    const data = await authService.updateUserProfile(userId, req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Onboarding Học sinh
exports.studentOnboarding = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id || req.user?.id_users;
    const data = await authService.updateStudentOnboarding(userId, req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Onboarding Giảng viên
exports.teacherOnboarding = async (req, res) => {
  try {
    const userId = req.body.userId || req.user?.id || req.user?.id_users;
    const data = await authService.saveTeacherOnboarding({ ...req.body, userId });
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};