import React from "react"
import { Outlet } from "react-router-dom"
import Header from "../components/Header.jsx"
import Sidebar from "../components/Sidebar.jsx"
import Footer from "../components/Footer.jsx"

export default function UserLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
      {/* 1. Header trải rộng 100% ở trên cùng */}
      <Header />

      {/* 2. Thân trang: Sidebar (trái) + Content (phải) */}
      <div className="flex flex-1 min-w-0">
        {/* Sidebar không để min-h-screen nữa để tránh đè tràn xuống Footer */}
        <Sidebar />

        {/* Khu vực chứa nội dung chính */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* 3. Footer trải rộng 100% full-width ở dưới cùng, nằm dưới cả Sidebar và Main */}
      <Footer />
    </div>
  )
}