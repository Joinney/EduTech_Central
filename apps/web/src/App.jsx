import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"

// ================= PUBLIC PAGES =================
import Home from "./pages/Home.jsx"
import Login from "./pages/auth/Login.jsx"
import Register from "./pages/auth/Register.jsx"

// ================= LAYOUT =================
import UserLayout from "./userdb/layouts/UserLayout.jsx"
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

// ================= SHARED PAGES =================
// Dùng chung trang Profile cho cả Student và Teacher
import Profile from "./userdb/pages/Profile.jsx"

// ================= ĐIỀU HƯỚNG MẶC ĐỊNH =================
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
      {/* 🟢 CÁC TRANG CÔNG KHAI */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 🟢 ROUTE DÀNH CHO HỌC VIÊN (STUDENT) */}
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

      {/* 🟢 ROUTE DÀNH CHO GIẢNG VIÊN (TEACHER) */}
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

      {/* 🟢 ĐIỀU HƯỚNG KHI NHẬP SAI ĐƯỜNG DẪN */}
      <Route path="*" element={<DashboardRedirect />} />
    </Routes>
  )
}