import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home.jsx"
import Login from "./pages/auth/Login.jsx"
import Register from "./pages/auth/Register.jsx"

import UserLayout from "./userdb/layouts/UserLayout.jsx"
import StudentHome from "./userdb/pages/studentpage/StudentHome.jsx"
import TeacherHome from "./userdb/pages/teacherpage/TeacherHome.jsx"

import Programs from "./userdb/pages/studentpage/Chuongtrinhkhoilop/Programs.jsx"
import Library from "./userdb/pages/studentpage/Khohoclieu/Library.jsx"
import Courses from "./userdb/pages/studentpage/Monhoccuatoi/Courses.jsx"
import Videos from "./userdb/pages/studentpage/VideoEdu/Videos.jsx"

// 🟢 Đường dẫn trỏ tới Profile.jsx đã được di chuyển ra ngoài
import Profile from "./userdb/pages/Profile.jsx"

import ProtectedRoute from "./userdb/components/ProtectedRoute.jsx"

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
          <Route path="dashboard" element={<StudentHome />} />
          <Route path="programs" element={<Programs />} />
          <Route path="library" element={<Library />} />
          <Route path="courses" element={<Courses />} />
          <Route path="videos" element={<Videos />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bookshelf" element={<StudentHome />} />
        </Route>
      </Route>

      {/* ================= ROUTE DÀNH CHO TEACHER ================= */}
      <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
        <Route path="/teacher" element={<UserLayout />}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherHome />} />
          <Route path="programs" element={<Programs />} />
          <Route path="library" element={<Library />} />
          <Route path="courses" element={<Courses />} />
          <Route path="videos" element={<Videos />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bookshelf" element={<TeacherHome />} />
        </Route>
      </Route>

      <Route path="*" element={<DashboardRedirect />} />
    </Routes>
  )
}