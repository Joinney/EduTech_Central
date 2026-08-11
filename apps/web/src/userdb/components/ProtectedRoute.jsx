import React from "react"
import { Navigate, Outlet } from "react-router-dom"

export default function ProtectedRoute({ allowedRoles }) {
  // 🟢 1. Lấy token (Hỗ trợ cả adminToken lẫn token thông thường)
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
  const rawRole = localStorage.getItem("role") || ""

  // 🟢 2. Chuẩn hóa role về chữ thường & quy đổi instructor thành teacher
  let userRole = rawRole.toLowerCase().trim()
  if (userRole === "instructor") {
    userRole = "teacher"
  }

  // 🟢 3. XỬ LÝ KHI CHƯA ĐĂNG NHẬP (!token)
  if (!token) {
    // Nếu route này dành riêng cho Admin -> Chuyển về trang Đăng nhập Admin
    if (allowedRoles && allowedRoles.map(r => r.toLowerCase()).includes("admin")) {
      return <Navigate to="/admin/login" replace />
    }
    // Các route khác -> Chuyển về trang Đăng nhập thường
    return <Navigate to="/login" replace />
  }

  // 🟢 4. XỬ LÝ KHI ĐÃ ĐĂNG NHẬP NHƯNG KHÔNG ĐỦ QUYỀN
  if (allowedRoles && Array.isArray(allowedRoles)) {
    const normalizedAllowedRoles = allowedRoles.map((r) => r.toLowerCase())

    const hasPermission =
      normalizedAllowedRoles.includes(userRole) ||
      (userRole === "teacher" && normalizedAllowedRoles.includes("instructor"))

    if (!hasPermission) {
      // Điều hướng về đúng Dashboard tương ứng với vai trò hiện tại
      if (userRole === "admin") return <Navigate to="/admin/dashboard" replace />
      if (userRole === "teacher") return <Navigate to="/teacher/dashboard" replace />
      return <Navigate to="/student/dashboard" replace />
    }
  }

  // 🟢 5. Đúng quyền -> Cho phép render Route con
  return <Outlet />
}