import React from "react"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import AdminCreateSchoolCourse from "./admindb/pages/AdminCreateSchoolCourse"

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
import Bookshelf from "./userdb/pages/studentpage/Tusach/Bookshelf.jsx"
import ExamRoom from "./userdb/pages/studentpage/Monhoccuatoi/ExamRoom.jsx"

// ================= TEACHER PAGES =================
import TeacherHome from "./userdb/pages/teacherpage/TeacherHome.jsx"
import CourseManagement from "./userdb/pages/teacherpage/quanlylophoc/CourseManagement.jsx"
import TeacherRequestCourse from "./userdb/pages/teacherpage/quanlylophoc/TeacherRequestCourse.jsx"
import QuizBank from "./userdb/pages/teacherpage/nganhangdethi/QuizBank.jsx"
import Grading from "./userdb/pages/teacherpage/chamdiemdiemso/Grading.jsx"
import StudentList from "./userdb/pages/teacherpage/danhsachhocvien/StudentList.jsx"
import Schedule from "./userdb/pages/teacherpage/lichdaymeet/Schedule.jsx"
import TeacherExamSubmissions from "./userdb/pages/teacherpage/quanlylophoc/TeacherExamSubmissions.jsx"

// ================= ADMIN PAGES =================
import AdminHome from "./admindb/pages/AdminHome.jsx"
import AdminUsers from "./admindb/pages/AdminUsers.jsx" 
import AdminCourses from "./admindb/pages/AdminCourses.jsx" 
import AdminReports from "./admindb/pages/AdminReports.jsx"
import AdminSettings from "./admindb/pages/AdminSettings.jsx"

// ================= SHARED PAGES =================
import Profile from "./userdb/pages/Profile.jsx"

// ================= 🟢 ĐIỀU HƯỚNG MẶC ĐỊNH =================
const DashboardRedirect = () => {
  const location = useLocation()
  const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
  const role = localStorage.getItem("role")?.toLowerCase()

  if (!token) {
    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/login" replace />
    }
    return <Navigate to="/login" replace />
  }

  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />
  }
  if (role === "teacher" || role === "instructor") {
    return <Navigate to="/teacher/dashboard" replace />
  }
  return <Navigate to="/student/dashboard" replace />
}

export default function App() {
  return (
    <Routes>
      {/* 🟢 1. CÁC TRANG CÔNG KHAI */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* 🟢 2. CÁC TRANG TOÀN MÀN HÌNH ĐỘC LẬP (Không dính Sidebar/Navbar) */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/student/exam/:examId" element={<ExamRoom />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
        <Route path="/teacher/exam/:examId" element={<TeacherExamSubmissions />} />
      </Route>

      {/* 🟢 3. ROUTE DÀNH CHO ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminHome />} />
          <Route path="users" element={<AdminUsers />} /> 
          <Route path="courses" element={<AdminCourses />} /> 
          <Route path="courses/create-school" element={<AdminCreateSchoolCourse />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* 🟢 4. ROUTE DÀNH CHO TEACHER */}
      <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
        <Route path="/teacher" element={<UserLayout />}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherHome />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="courses/request" element={<TeacherRequestCourse />} />
          <Route path="quizzes" element={<QuizBank />} />
          <Route path="grading" element={<Grading />} />
          <Route path="students" element={<StudentList />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="library" element={<Library />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* 🟢 5. ROUTE DÀNH CHO STUDENT */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route path="/student" element={<UserLayout />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentHome />} />
          <Route path="programs" element={<Programs />} />
          <Route path="library" element={<Library />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="videos" element={<Videos />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bookshelf" element={<Bookshelf />} />
        </Route>
      </Route>

      {/* 🟢 6. BẮT ROUTE KHÔNG TỒN TẠI */}
      <Route path="*" element={<DashboardRedirect />} />
    </Routes>
  )
}