const authService = require('../services/auth.service');

exports.teacherOnboarding = async (req, res) => {
  try {
    const { userId, degree, workplace, specialization, yearsOfExperience, bio, schoolId } = req.body;

    const data = await authService.saveTeacherOnboarding({
      userId: userId || req.user?.id,
      degree,
      workplace,
      specialization,
      yearsOfExperience,
      bio,
      schoolId
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật hồ sơ giảng viên thành công!',
      data
    });
  } catch (error) {
    console.error('Lỗi teacherOnboarding:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Cập nhật hồ sơ giảng viên thất bại!'
    });
  }
};