import React from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home.jsx"
import Login from "./pages/auth/Login.jsx"
import Register from "./pages/auth/Register.jsx"

import UserLayout from "./userdb/layouts/UserLayout.jsx"
import UserHome from "./userdb/pages/UserHome.jsx"
import Programs from "./userdb/pages/Chuongtrinhkhoilop/Programs.jsx"
import Library from "./userdb/pages/Khohoclieu/Library.jsx"
import Courses from "./userdb/pages/Monhoccuatoi/Courses.jsx"
import Videos from "./userdb/pages/VideoEdu/Videos.jsx" // Import Videos
export default function App() {
  return (
    <Routes>
      {/* Các trang công khai (Không có Sidebar/Header) */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Các trang của Học viên (Luôn hiển thị Header, Sidebar, Footer) */}
      <Route path="/user" element={<UserLayout />}>
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route path="dashboard" element={<UserHome />} />
        <Route path="programs" element={<Programs />} />
        <Route path="library" element={<Library />} />
        <Route path="courses" element={<Courses />} />
        <Route path="videos" element={<Videos />} />
        {/* Các trang chưa tạo component riêng tạm thời dùng UserHome */}
        <Route path="bookshelf" element={<UserHome />} />
      </Route>

      {/* Điều hướng nếu gõ sai đường dẫn */}
      <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
    </Routes>
  )
}