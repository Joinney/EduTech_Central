import React from "react"
import { Outlet } from "react-router-dom"
import AdminSidebar from "../components/AdminSidebar.jsx"
import Header from "../components/Header.jsx"

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-800 font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}