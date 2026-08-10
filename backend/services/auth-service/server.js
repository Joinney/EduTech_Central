const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./configs/db.config');

// Import các Routes
const authRoutes = require('./routes/auth.routes');
const schoolRoutes = require('./routes/school.routes');   // Endpoint: /api/v1/schools
const studentRoutes = require('./routes/student.routes'); // Endpoint: /api/v1/student
const teacherRoutes = require('./routes/teacher.routes'); // Endpoint: /api/v1/teacher

const app = express();

// 1. Cross-Origin Resource Sharing (CORS)
app.use(cors());

// 2. Body Parser (Tăng giới hạn dung lượng payload nhận dữ liệu Base64/Image từ Client)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Kết nối Database
connectDB();

// 4. Đăng ký API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/schools', schoolRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/v1/teacher', teacherRoutes);

// 5. Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

// 6. Middleware xử lý 404 - Bắt các Endpoint không tồn tại
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Đường dẫn [${req.method}] ${req.originalUrl} không tồn tại trên hệ thống!`
  });
});

// 7. Global Error Handler Middleware - Bắt tất cả lỗi 500
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi hệ thống nội bộ (Internal Server Error)!',
  });
});

// 8. Khởi chạy Server
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`🚀 [auth-service] Running on port ${PORT}`);
});