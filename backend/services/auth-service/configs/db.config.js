const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('[auth-service] Connected to PostgreSQL via Prisma');
  } catch (error) {
    console.error('[auth-service] Database connection error:', error);
  }
};

module.exports = prisma;
module.exports.connectDB = connectDB;