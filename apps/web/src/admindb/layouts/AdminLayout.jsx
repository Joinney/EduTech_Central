import React from "react"
import { Outlet } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar.jsx"
import Header from "../components/Header.jsx"

export default function AdminLayout() {
  return (
    // Sử dụng h-screen và overflow-hidden để cố định layout tổng
    <div className="flex h-screen bg-[#F4F7FE] text-slate-800 font-sans overflow-hidden">
      
      {/* Sidebar nằm cố định bên trái */}
      <AdminSidebar />
      
      {/* Khu vực nội dung chính */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header nằm cố định phía trên */}
        <Header />
        
        {/* Phần Main chứa nội dung thay đổi (Outlet) */}
        {/* Chỉ phần này mới xuất hiện thanh cuộn (overflow-y-auto) */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth">
          <Outlet />
        </main>
        
      </div>
    </div>
  )
}