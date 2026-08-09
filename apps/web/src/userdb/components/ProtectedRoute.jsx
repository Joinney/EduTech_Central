import React from "react"
import { Navigate, Outlet } from "react-router-dom"

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token")
  const rawRole = localStorage.getItem("role") || "student"

  // 1. Chuẩn hóa role người dùng về chữ thường & chuyển "INSTRUCTOR" thành "teacher"
  let userRole = rawRole.toLowerCase()
  if (userRole === "instructor") {
    userRole = "teacher"
  }

  // 2. Chưa đăng nhập -> Chuyển hướng về trang Login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // 3. Kiểm tra quyền truy cập (Không phân biệt chữ HOA / chữ thường)
  if (allowedRoles && Array.isArray(allowedRoles)) {
    // Chuyển toàn bộ danh sách allowedRoles về chữ thường
    const normalizedAllowedRoles = allowedRoles.map((r) => r.toLowerCase())

    // Kiểm tra xem role của user có nằm trong danh sách allowedRoles hay không
    const hasPermission =
      normalizedAllowedRoles.includes(userRole) ||
      (userRole === "teacher" && normalizedAllowedRoles.includes("instructor"))

    if (!hasPermission) {
      // Không đúng quyền -> Chuyển về đúng trang Dashboard tương ứng với role
      return <Navigate to={`/${userRole}/dashboard`} replace />
    }
  }

  // 4. Đúng quyền -> Cho phép render các Route con (UserHome, Profile, Library, v.v.)
  return <Outlet />
}