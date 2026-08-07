const { prisma } = require('../configs/db.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

exports.registerUser = async ({ fullName, email, password, role }) => {
  const userExists = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (userExists) {
    throw new Error('Email đã tồn tại trên hệ thống');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await prisma.user.create({
    data: {
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role ? role.toUpperCase() : 'STUDENT'
    }
  });

  const token = generateToken(newUser);
  return { id: newUser.id, fullName: newUser.fullName, email: newUser.email, role: newUser.role, token };
};

exports.loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user || !user.password) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Email hoặc mật khẩu không chính xác');
  }

  const token = generateToken(user);
  return { id: user.id, fullName: user.fullName, email: user.email, role: user.role, avatar: user.avatar, token };
};

exports.getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, email: true, role: true, avatar: true, isActive: true, createdAt: true }
  });

  if (!user) throw new Error('Không tìm thấy người dùng');
  return user;
};
