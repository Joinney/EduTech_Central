import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home.jsx"
import Login from "./pages/auth/Login.jsx"
import Register from "./pages/auth/Register.jsx"

import UserLayout from "./userdb/layouts/UserLayout.jsx"
import UserHome from "./userdb/pages/studentpage/UserHome.jsx"
import Programs from "./userdb/pages/studentpage/Chuongtrinhkhoilop/Programs.jsx"
import Library from "./userdb/pages/studentpage/Khohoclieu/Library.jsx"
import Courses from "./userdb/pages/studentpage/Monhoccuatoi/Courses.jsx"
import Videos from "./userdb/pages/studentpage/VideoEdu/Videos.jsx"
import Profile from "./userdb/pages/studentpage/Profile.jsx"

// Import ProtectedRoute từ đúng thư mục src/userdb/components/ProtectedRoute.jsx
import ProtectedRoute from "./userdb/components/ProtectedRoute.jsx"

// Component hỗ trợ điều hướng mặc định theo vai trò khi vào trang / hoặc đường dẫn không tồn tại
const DashboardRedirect = () => {
  const role = (localStorage.getItem("role") || "student").toLowerCase()

  if (role === "teacher") {
    return <Navigate to="/teacher/dashboard" replace />
  }
  return <Navigate to="/student/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Các trang công khai */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ================= ROUTE DÀNH CHO STUDENT ================= */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/student" element={<UserLayout />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<UserHome />} />
          <Route path="programs" element={<Programs />} />
          <Route path="library" element={<Library />} />
          <Route path="courses" element={<Courses />} />
          <Route path="videos" element={<Videos />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bookshelf" element={<UserHome />} />
        </Route>
      </Route>

      {/* ================= ROUTE DÀNH CHO TEACHER ================= */}
      <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
        <Route path="/teacher" element={<UserLayout />}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<UserHome />} /> {/* Tùy chỉnh component riêng từ folder teacherpage sau này */}
          <Route path="programs" element={<Programs />} />
          <Route path="library" element={<Library />} />
          <Route path="courses" element={<Courses />} />
          <Route path="videos" element={<Videos />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bookshelf" element={<UserHome />} />
        </Route>
      </Route>

      {/* Điều hướng mặc định dựa trên vai trò người dùng */}
      <Route path="*" element={<DashboardRedirect />} />
    </Routes>
  )
}