const prisma = require('../configs/db.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../configs/cloudinary.config');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'super_secret_jwt_key_edutech_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

exports.registerUser = async (data) => {
  const email = data.email ? data.email.toLowerCase().trim() : '';
  const fullName = data.fullName || data.full_name || '';
  const password = data.password;
  const avatar = data.avatar || '';

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
      avatar
    }
  });

  const token = generateToken(newUser);

  return {
    id: newUser.id,
    fullName: newUser.fullName,
    email: newUser.email,
    avatar: newUser.avatar,
    token
  };
};

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

  const token = generateToken(user);

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar,
    token
  };
};

exports.getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      fullName: true,
      email: true,
      avatar: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  return user;
};

// Cập nhật thông tin & Upload ảnh lên Cloudinary
exports.updateUserProfile = async (userId, data) => {
  const id = Number(userId);
  if (isNaN(id)) {
    throw new Error('ID người dùng không hợp lệ');
  }

  const { fullName, avatar } = data;

  const userExists = await prisma.user.findUnique({ where: { id } });
  if (!userExists) {
    throw new Error('Người dùng không tồn tại trong hệ thống');
  }

  let finalAvatarUrl = avatar;

  // Nếu client gửi dữ liệu ảnh dạng Base64 (data:image/...) -> Đẩy lên Cloudinary
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
      avatar: finalAvatarUrl !== undefined ? finalAvatarUrl : undefined
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      avatar: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return updatedUser;
};