const prisma = require('../configs/db.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../configs/cloudinary.config');

// =========================================================================
// HELPER FUNCTIONS: HÀM TẠO JWT TOKENS
// =========================================================================

/**
 * Tạo Access Token ngắn hạn (Mặc định 15 phút)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_edutech_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

/**
 * Tạo Refresh Token dài hạn (Mặc định 7 ngày)
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_edutech_2026',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// =========================================================================
// AUTHENTICATION SERVICES
// =========================================================================

// 🟢 ĐĂNG KÝ NGUỜI DÙNG MỚI
exports.registerUser = async (data) => {
  const email = data.email ? data.email.toLowerCase().trim() : '';
  const fullName = data.fullName || data.full_name || '';
  const password = data.password;
  const avatar = data.avatar || '';
  const phone = data.phone || data.phoneNumber || null;
  const role = (data.role || 'student').toLowerCase();

  if (!email || !password) {
    throw new Error('Vui lòng cung cấp đầy đủ email và mật khẩu');
  }

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    throw new Error('Email đã tồn tại trên hệ thống');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      avatar,
      phone,
      role,
      isOnboarded: false // Đăng ký mới mặc định chưa onboarded
    }
  });

  const formattedId = String(newUser.id).padStart(4, '0');
  
  // Khởi tạo hồ sơ phụ thuộc vào vai trò người dùng
  if (role === 'teacher' || role === 'instructor') {
    await prisma.teacherProfile.create({
      data: {
        userId: newUser.id,
        teacherCode: `GV-2026-${formattedId}`
      }
    });
  } else {
    await prisma.studentProfile.create({
      data: {
        userId: newUser.id,
        studentCode: `ETC-2026-${formattedId}`,
        educationLevel: 'high_school'
      }
    });
  }

  const token = generateAccessToken(newUser);

  return {
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      phone: newUser.phone,
      avatar: newUser.avatar,
      role: newUser.role,
      isOnboarded: newUser.isOnboarded
    }
  };
};

// 🟢 ĐĂNG NHẬP NGUỜI DÙNG (KÈM CONSOLE LOG DEBUG CHI TIẾT)
exports.loginUser = async ({ email, password }) => {
  const cleanEmail = email ? email.toLowerCase().trim() : '';
  console.log(`🔍 [AUTH SERVICE] Yêu cầu đăng nhập email: "${cleanEmail}"`);

  if (!cleanEmail || !password) {
    throw new Error('Vui lòng nhập đầy đủ email và mật khẩu');
  }

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail }
  });

  if (!user) {
    console.warn(`❌ [AUTH SERVICE] Không tìm thấy tài khoản với email: "${cleanEmail}"`);
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  if (!user.password) {
    console.warn(`❌ [AUTH SERVICE] Tài khoản chưa thiết lập mật khẩu (Auth Provider ngoài): "${cleanEmail}"`);
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.warn(`❌ [AUTH SERVICE] Mật khẩu không chính xác (Bcrypt Mismatch) cho email: "${cleanEmail}"`);
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  console.log(`✅ [AUTH SERVICE] Đăng nhập thành công: User ID ${user.id} (${user.role})`);

  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefreshToken }
  });

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isOnboarded: user.isOnboarded
    }
  };
};

// 🟢 ĐĂNG XUẤT
exports.logoutUser = async (userId) => {
  const id = Number(userId);

  if (!id || isNaN(id)) {
    console.warn('⚠️ [AUTH SERVICE] ID không hợp lệ khi Logout:', userId);
    return false;
  }

  await prisma.user.update({
    where: { id },
    data: { refreshToken: null }
  });

  return true;
};

// 🟢 CẤP ACCESS TOKEN MỚI TỪ REFRESH TOKEN
exports.refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('Thiếu Refresh Token');
  }

  let decoded;
  try {
    decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_edutech_2026'
    );
  } catch (err) {
    throw new Error('Refresh Token không hợp lệ hoặc đã hết hạn');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || !user.refreshToken) {
    throw new Error('Tài khoản đã đăng xuất hoặc Token không khả dụng');
  }

  const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!isMatch) {
    throw new Error('Refresh Token không chính xác');
  }

  const newAccessToken = generateAccessToken(user);

  return { token: newAccessToken };
};

// =========================================================================
// PROFILE & ONBOARDING SERVICES
// =========================================================================

// 🟢 LẤY THÔNG TIN HỒ SƠ DỮ LIỆU ĐỘNG
exports.getUserProfile = async (userId) => {
  const id = Number(userId);
  if (isNaN(id)) {
    throw new Error('ID người dùng không hợp lệ');
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      studentProfile: true,
      teacherProfile: true
    }
  });

  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  const formattedId = String(user.id).padStart(4, '0');
  const studentCode = user.studentProfile?.studentCode || `ETC-2026-${formattedId}`;
  const teacherCode = user.teacherProfile?.teacherCode || `GV-2026-${formattedId}`;

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || 'Chưa cập nhật',
    avatar: user.avatar,
    role: user.role,
    isOnboarded: user.isOnboarded,
    studentCode,
    gradeLevel: user.studentProfile?.gradeLevel || 'Chưa cập nhật',
    schoolName: user.studentProfile?.schoolName || 'Chưa cập nhật',
    teacherCode,
    workplace: user.teacherProfile?.workplace || 'Chưa cập nhật',
    specialization: user.teacherProfile?.specialization || 'Chưa cập nhật',
    degree: user.teacherProfile?.degree || 'Chưa cập nhật',
    bio: user.teacherProfile?.bio || '',
    studentProfile: user.studentProfile,
    teacherProfile: user.teacherProfile,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

// 🟢 CẬP NHẬT THÔNG TIN CÁ NHÂN & AVATAR
exports.updateUserProfile = async (userId, data) => {
  const id = Number(userId);
  if (isNaN(id)) {
    throw new Error('ID người dùng không hợp lệ');
  }

  const { fullName, avatar, phone } = data;

  const userExists = await prisma.user.findUnique({ where: { id } });
  if (!userExists) {
    throw new Error('Người dùng không tồn tại trong hệ thống');
  }

  let finalAvatarUrl = avatar;

  if (avatar && avatar.startsWith('data:image/')) {
    const uploadResponse = await cloudinary.uploader.upload(avatar, {
      folder: 'edutech_avatars',
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    });
    finalAvatarUrl = uploadResponse.secure_url;
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      fullName: fullName !== undefined ? fullName : undefined,
      phone: phone !== undefined ? phone : undefined,
      avatar: finalAvatarUrl !== undefined ? finalAvatarUrl : undefined
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      isOnboarded: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return updatedUser;
};

// 🟢 LƯU THÔNG TIN ONBOARDING GIẢNG VIÊN
exports.saveTeacherOnboarding = async (data) => {
  const { userId, degree, workplace, specialization, yearsOfExperience, bio } = data;

  const id = Number(userId);
  if (!id || isNaN(id)) {
    throw new Error(`ID người dùng không hợp lệ (Nhận được: ${userId})`);
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error(`Không tìm thấy người dùng với ID: ${id}`);
  }

  const formattedId = String(id).padStart(4, '0');
  const generatedTeacherCode = `GV-2026-${formattedId}`;

  try {
    const [teacherProfile, updatedUser] = await prisma.$transaction([
      prisma.teacherProfile.upsert({
        where: { userId: id },
        update: {
          teacherCode: generatedTeacherCode,
          degree,
          workplace,
          specialization,
          yearsOfExperience: Number(yearsOfExperience) || 0,
          bio
        },
        create: {
          userId: id,
          teacherCode: generatedTeacherCode,
          degree,
          workplace,
          specialization,
          yearsOfExperience: Number(yearsOfExperience) || 0,
          bio
        }
      }),
      prisma.user.update({
        where: { id },
        data: { isOnboarded: true },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          isOnboarded: true,
          createdAt: true,
          updatedAt: true
        }
      })
    ]);

    return { user: { ...updatedUser, teacherProfile }, teacherProfile };
  } catch (error) {
    console.error("❌ Lỗi Prisma Transaction Onboarding Teacher:", error);
    throw new Error("Lỗi cơ sở dữ liệu khi lưu thông tin giảng viên: " + error.message);
  }
};

// 🟢 LƯU THÔNG TIN ONBOARDING HỌC SINH
exports.updateStudentOnboarding = async (userId, data) => {
  const id = Number(userId);
  if (!id || isNaN(id)) {
    throw new Error(`ID người dùng không hợp lệ (Nhận được: ${userId})`);
  }

  const { educationLevel, schoolId, schoolName, gradeLevel, fieldOfInterest } = data;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error(`Không tìm thấy người dùng với ID: ${id}`);
  }

  const formattedId = String(id).padStart(4, '0');
  const generatedStudentCode = `ETC-2026-${formattedId}`;

  try {
    const [studentProfile, updatedUser] = await prisma.$transaction([
      prisma.studentProfile.upsert({
        where: { userId: id },
        update: {
          studentCode: generatedStudentCode,
          educationLevel,
          schoolId: schoolId ? Number(schoolId) : null,
          schoolName,
          gradeLevel,
          fieldOfInterest
        },
        create: {
          userId: id,
          studentCode: generatedStudentCode,
          educationLevel,
          schoolId: schoolId ? Number(schoolId) : null,
          schoolName,
          gradeLevel,
          fieldOfInterest: fieldOfInterest || 'Chưa xác định'
        }
      }),
      prisma.user.update({
        where: { id },
        data: { isOnboarded: true },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatar: true,
          role: true,
          isOnboarded: true,
          createdAt: true,
          updatedAt: true
        }
      })
    ]);

    return { user: { ...updatedUser, studentProfile }, studentProfile };
  } catch (error) {
    console.error("❌ Lỗi Prisma Transaction Onboarding Student:", error);
    throw new Error("Lỗi cơ sở dữ liệu khi lưu thông tin học sinh: " + error.message);
  }
};

// =========================================================================
// ADMIN MANAGEMENT SERVICES
// =========================================================================

// 🟢 LẤY DANH SÁCH TOÀN BỘ NGUỜI DÙNG (DÀNH CHO ADMIN)
exports.getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      isOnboarded: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

// 🟢 XÓA AN TOÀN NGUỜI DÙNG BẰNG TRANSACTION (XÓA BẢNG CON TRƯỚC Tránh LỖI 500)
exports.deleteUser = async (userId) => {
  const id = Number(userId);
  if (!id || isNaN(id)) {
    throw new Error('ID người dùng không hợp lệ');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error('Người dùng không tồn tại trong hệ thống');
  }

  return await prisma.$transaction([
    prisma.studentProfile.deleteMany({ where: { userId: id } }),
    prisma.teacherProfile.deleteMany({ where: { userId: id } }),
    prisma.user.delete({ where: { id } })
  ]);
};