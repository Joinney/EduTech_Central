const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực Access Token (JWT)
 */
const verifyToken = (req, res, next) => {
  let token;

  // Lấy token từ Authorization Header (Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Trường hợp thiếu Token
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Không tìm thấy Token xác thực' 
    });
  }

  try {
    // Giải mã Token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'super_secret_jwt_key_edutech_2026'
    );

    // Gán dữ liệu user đã giải mã vào req.user
    req.user = decoded;
    next();
  } catch (error) {
    // Xử lý riêng trường hợp Token hết hạn để Frontend gọi Refresh Token
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        code: 'TOKEN_EXPIRED', 
        message: 'Unauthorized: Token đã hết hạn' 
      });
    }

    // Các lỗi Token không hợp lệ khác
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized: Token không hợp lệ hoặc đã bị thay đổi' 
    });
  }
};

/**
 * Middleware kiểm tra quyền Quản trị viên (Admin)
 */
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role?.toLowerCase() !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden: Bạn không có quyền truy cập chức năng Admin' 
    });
  }
  next();
};

/**
 * Middleware phân quyền động theo nhiều vai trò
 * Ví dụ sử dụng: authorizeRoles('admin', 'teacher')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role?.toLowerCase())) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Tài khoản cần quyền [${roles.join(', ')}] để thực hiện thao tác này` 
      });
    }
    next();
  };
};

module.exports = { 
  protect: verifyToken, 
  verifyToken, 
  verifyAdmin, 
  authorizeRoles 
};