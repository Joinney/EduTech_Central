import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import Header from "../components/Header.jsx";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-[#F4F7FE] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar cố định */}
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header cố định */}
        <Header />
        
        {/* Khu vực nội dung có thể cuộn */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}