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

// 🟢 ĐĂNG KÝ (Lưu User + Phone + Role, isOnboarded mặc định là true)
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

  // Tạo User mới trong DB (isOnboarded nhận giá trị default true từ Prisma schema)
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

// 🟢 ĐĂNG NHẬP (Lưu Refresh Token đã mã hóa vào DB)
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

  // Hash và lưu Refresh Token mới vào DB
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

// 🟢 ĐĂNG XUẤT (Set refreshToken = null trong DB)
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

// 🟢 LẤY PROFILE
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

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    isOnboarded: user.isOnboarded,
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

// auth.service.js

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
        data: { isOnboarded: true }, // 🟢 Đổi thành true khi hoàn tất
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
        studentProfile // 🟢 Kèm studentProfile vào user
      },
      studentProfile
    };
  } catch (error) {
    console.error("❌ Lỗi Prisma Transaction Onboarding:", error);
    throw new Error("Lỗi cơ sở dữ liệu khi lưu thông tin học sinh: " + error.message);
  }
};