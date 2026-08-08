import React from "react"
import { Navigate, Outlet } from "react-router-dom"

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role") || "student"

  // 1. Nếu chưa đăng nhập -> Chuyển hướng về trang Login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // 2. Nếu đăng nhập rồi nhưng truy cập route không đúng vai trò cho phép
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={`/${role}/dashboard`} replace />
  }

  // 3. Đúng quyền -> Cho phép render các Route con
  return <Outlet />
}