import React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation()
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
  const rawRole = localStorage.getItem("role") || ""

  let userRole = rawRole.toLowerCase().trim()
  if (userRole === "instructor") {
    userRole = "teacher"
  }

  // 🟢 1. XỬ LÝ KHI CHƯA ĐĂNG NHẬP (!token)
  if (!token) {
    // Nếu đang cố vào đường dẫn chứa /admin hoặc route yêu cầu role admin -> Đẩy về /admin/login
    if (
      location.pathname.startsWith("/admin") ||
      (allowedRoles && allowedRoles.map((r) => r.toLowerCase()).includes("admin"))
    ) {
      return <Navigate to="/admin/login" replace />
    }
    // Các route khác -> Đẩy về /login thường
    return <Navigate to="/login" replace />
  }

  // 🟢 2. XỬ LÝ KHI ĐÃ ĐĂNG NHẬP NHƯNG KHÔNG ĐỦ QUYỀN (Role Mismatch)
  if (allowedRoles && Array.isArray(allowedRoles)) {
    const normalizedAllowedRoles = allowedRoles.map((r) => r.toLowerCase())

    const hasPermission =
      normalizedAllowedRoles.includes(userRole) ||
      (userRole === "teacher" && normalizedAllowedRoles.includes("instructor"))

    if (!hasPermission) {
      if (userRole === "admin") return <Navigate to="/admin/dashboard" replace />
      if (userRole === "teacher") return <Navigate to="/teacher/dashboard" replace />
      return <Navigate to="/student/dashboard" replace />
    }
  }

  // 🟢 3. Đúng quyền -> Cho phép render Route con
  return <Outlet />
}