const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * PUT /api/v1/student/onboarding
 * Cập nhật hồ sơ học sinh & Tự động đồng bộ dữ liệu Trường học vào bảng `schools`
 */
exports.updateStudentOnboarding = async (req, res) => {
  try {
    const {
      userId,
      educationLevel,
      schoolId,
      schoolName,
      gradeLevel,
      fieldOfInterest,
    } = req.body;

    const parsedUserId = Number(userId);

    // 1. Kiểm tra ID người dùng hợp lệ
    if (!parsedUserId || isNaN(parsedUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Thông tin ID người dùng (userId) không hợp lệ!',
      });
    }

    // 2. Thực thi Transaction để đảm bảo tính nhất quán dữ liệu giữa 3 bảng
    const result = await prisma.$transaction(async (tx) => {
      // 2.1 Kiểm tra xem User có tồn tại không
      const existingUser = await tx.user.findUnique({
        where: { id: parsedUserId },
      });

      if (!existingUser) {
        throw new Error('Người dùng không tồn tại trong hệ thống!');
      }

      let targetSchoolId = null;

      // 2.2 Trường hợp 1: Nếu Frontend truyền schoolId dạng số chuẩn từ CSDL Postgres
      if (schoolId && !isNaN(Number(schoolId))) {
        targetSchoolId = Number(schoolId);
      } 
      // 2.3 Trường hợp 2: Nếu trường học lấy từ OpenStreetMap hoặc người dùng tự nhập tay tên trường
      else if (schoolName && schoolName.trim() !== '') {
        const cleanSchoolName = schoolName.trim();

        // Tìm trong bảng `schools` xem tên trường đã tồn tại chưa
        let existingSchool = await tx.school.findFirst({
          where: {
            schoolName: {
              equals: cleanSchoolName,
              mode: 'insensitive', // Tìm kiếm không phân biệt chữ hoa/thường
            },
          },
        });

        // Nếu chưa có trong DB -> Tự động thêm mới trường này vào bảng `schools`
        if (!existingSchool) {
          existingSchool = await tx.school.create({
            data: {
              schoolName: cleanSchoolName,
              level: educationLevel || 'high_school',
              provinceName: 'Việt Nam',
            },
          });
        }

        // Lấy ID thực tế từ bảng schools
        targetSchoolId = existingSchool.id;
      }

      // 2.4 Cập nhật/Tạo mới bảng student_profiles
      const studentProfile = await tx.studentProfile.upsert({
        where: {
          userId: parsedUserId,
        },
        update: {
          educationLevel,
          schoolId: targetSchoolId,
          schoolName: schoolName ? schoolName.trim() : null,
          gradeLevel,
          fieldOfInterest: fieldOfInterest || 'Chưa xác định',
          updatedAt: new Date(),
        },
        create: {
          userId: parsedUserId,
          educationLevel,
          schoolId: targetSchoolId,
          schoolName: schoolName ? schoolName.trim() : null,
          gradeLevel,
          fieldOfInterest: fieldOfInterest || 'Chưa xác định',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // 2.5 Đánh dấu tài khoản đã hoàn tất Onboarding
      const updatedUser = await tx.user.update({
        where: { id: parsedUserId },
        data: {
          isOnboarded: true,
          updatedAt: new Date(),
        },
      });

      return { studentProfile, updatedUser };
    });

    // 3. Phản hồi kết quả về cho Client
    return res.status(200).json({
      success: true,
      message: 'Hoàn tất cập nhật hồ sơ học sinh!',
      data: {
        ...result.updatedUser,
        studentProfile: result.studentProfile,
      },
    });
  } catch (error) {
    console.error('Lỗi updateStudentOnboarding:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi hệ thống khi cập nhật hồ sơ học sinh!',
    });
  }
};