import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"

// ================= PUBLIC PAGES =================
import Home from "./pages/Home.jsx"
import Login from "./pages/auth/Login.jsx"
import Register from "./pages/auth/Register.jsx"
import AdminLogin from "./admindb/pages/AdminLogin.jsx"

// ================= LAYOUTS & AUTH GUARD =================
import UserLayout from "./userdb/layouts/UserLayout.jsx"
import AdminLayout from "./admindb/layouts/AdminLayout.jsx"
import ProtectedRoute from "./userdb/components/ProtectedRoute.jsx"

// ================= STUDENT PAGES =================
import StudentHome from "./userdb/pages/studentpage/StudentHome.jsx"
import Programs from "./userdb/pages/studentpage/Chuongtrinhkhoilop/Programs.jsx"
import Library from "./userdb/pages/studentpage/Khohoclieu/Library.jsx"
import StudentCourses from "./userdb/pages/studentpage/Monhoccuatoi/Courses.jsx"
import Videos from "./userdb/pages/studentpage/VideoEdu/Videos.jsx"

// ================= TEACHER PAGES =================
import TeacherHome from "./userdb/pages/teacherpage/TeacherHome.jsx"
import CourseManagement from "./userdb/pages/teacherpage/quanlylophoc/CourseManagement.jsx"
import QuizBank from "./userdb/pages/teacherpage/nganhangdethi/QuizBank.jsx"
import Grading from "./userdb/pages/teacherpage/chamdiemdiemso/Grading.jsx"
import StudentList from "./userdb/pages/teacherpage/danhsachhocvien/StudentList.jsx"
import Schedule from "./userdb/pages/teacherpage/lichdaymeet/Schedule.jsx"

// ================= ADMIN PAGES =================
import AdminHome from "./admindb/pages/AdminHome.jsx"

// ================= SHARED PAGES =================
import Profile from "./userdb/pages/Profile.jsx"

// ================= 🟢 ĐIỀU HƯỚNG MẶC ĐỊNH ĐÃ FIX LỖI =================
const DashboardRedirect = () => {
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
  const role = localStorage.getItem("role")?.toLowerCase()

  // Nếu CHƯA ĐĂNG NHẬP -> Trả về trang chủ hoặc trang đăng nhập
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Nếu ĐÃ ĐĂNG NHẬP -> Chuyển về đúng Dashboard theo Role
  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />
  }
  if (role === "teacher") {
    return <Navigate to="/teacher/dashboard" replace />
  }
  return <Navigate to="/student/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      {/* 🟢 1. CÁC TRANG CÔNG KHAI (Không bị khóa bởi Auth) */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* 🟢 2. ROUTE DÀNH CHO ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminHome />} />
          <Route path="users" element={<AdminHome />} />
          <Route path="courses" element={<AdminHome />} />
          <Route path="reports" element={<AdminHome />} />
          <Route path="settings" element={<AdminHome />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* 🟢 3. ROUTE DÀNH CHO TEACHER */}
      <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
        <Route path="/teacher" element={<UserLayout />}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherHome />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="quizzes" element={<QuizBank />} />
          <Route path="grading" element={<Grading />} />
          <Route path="students" element={<StudentList />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="library" element={<Library />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* 🟢 4. ROUTE DÀNH CHO STUDENT */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/student" element={<UserLayout />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentHome />} />
          <Route path="programs" element={<Programs />} />
          <Route path="library" element={<Library />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="videos" element={<Videos />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bookshelf" element={<StudentHome />} />
        </Route>
      </Route>

      {/* 🟢 5. BẮT ROUTE KHÔNG TỒN TẠI */}
      <Route path="*" element={<DashboardRedirect />} />
    </Routes>
  )
}