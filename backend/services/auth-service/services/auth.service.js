const prisma = require('../configs/db.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../configs/cloudinary.config');

// Hàm tạo Access Token (ngắn hạn: 15m)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_edutech_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

// Hàm tạo Refresh Token (dài hạn: 7d)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_edutech_2026',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

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
      role
    }
  });

  // Tự động khởi tạo Profile + Mã định danh ngay khi Đăng ký
  const formattedId = String(newUser.id).padStart(4, '0');
  
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
        educationLevel: 'high_school' // Giá trị tạm thời
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

// 🟢 ĐĂNG NHẬP
exports.loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('Vui lòng nhập đầy đủ email và mật khẩu');
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() }
  });

  if (!user || !user.password) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

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
    console.warn('⚠️ ID không hợp lệ khi Logout:', userId);
    return false;
  }

  await prisma.user.update({
    where: { id },
    data: { refreshToken: null }
  });

  return true;
};

// 🟢 CẤP ACCESS TOKEN MỚI
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

// 🟢 LẤY PROFILE ĐỘNG TỪ CSDL
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

  // Tự động định dạng mã định danh theo ID thực tế nếu chưa có trong DB
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
    // Thông tin Học sinh động
    studentCode,
    gradeLevel: user.studentProfile?.gradeLevel || 'Chưa cập nhật',
    schoolName: user.studentProfile?.schoolName || 'Chưa cập nhật',
    // Thông tin Giảng viên động
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

// 🟢 CẬP NHẬT PROFILE & AVATAR
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

// 🟢 CẬP NHẬT ONBOARDING HỌC SINH
exports.updateStudentOnboarding = async (userId, data) => {
  const id = Number(userId);
  if (!id || isNaN(id)) {
    throw new Error(`ID người dùng không hợp lệ hoặc bị trống (Nhận được: ${userId})`);
  }

  const { educationLevel, schoolId, schoolName, gradeLevel, fieldOfInterest } = data;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new Error(`Không tìm thấy người dùng với ID: ${id} trong database`);
  }

  try {
    const [studentProfile, updatedUser] = await prisma.$transaction([
      prisma.studentProfile.upsert({
        where: { userId: id },
        update: {
          educationLevel,
          schoolId: schoolId ? Number(schoolId) : null,
          schoolName,
          gradeLevel,
          fieldOfInterest
        },
        create: {
          userId: id,
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

    return {
      user: {
        ...updatedUser,
        studentProfile
      },
      studentProfile
    };
  } catch (error) {
    console.error("❌ Lỗi Prisma Transaction Onboarding Student:", error);
    throw new Error("Lỗi cơ sở dữ liệu khi lưu thông tin học sinh: " + error.message);
  }
};

// 🟢 1. CẬP NHẬT ONBOARDING GIẢNG VIÊN (Tự động sinh teacherCode vào CSDL)
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

  // Tạo mã Giảng viên chuẩn dạng GV-2026-0013
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

    return {
      user: {
        ...updatedUser,
        teacherProfile
      },
      teacherProfile
    };
  } catch (error) {
    console.error("❌ Lỗi Prisma Transaction Onboarding Teacher:", error);
    throw new Error("Lỗi cơ sở dữ liệu khi lưu thông tin giảng viên: " + error.message);
  }
};

// 🟢 2. CẬP NHẬT ONBOARDING HỌC SINH (Tự động sinh studentCode vào CSDL)
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

  // Tạo mã Học viên chuẩn dạng ETC-2026-0013
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

    return {
      user: {
        ...updatedUser,
        studentProfile
      },
      studentProfile
    };
  } catch (error) {
    console.error("❌ Lỗi Prisma Transaction Onboarding Student:", error);
    throw new Error("Lỗi cơ sở dữ liệu khi lưu thông tin học sinh: " + error.message);
  }
};