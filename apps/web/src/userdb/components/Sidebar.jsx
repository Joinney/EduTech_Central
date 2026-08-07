import React from "react"
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, BookOpen, Video, Award, BarChart2, Settings, LogOut, Sparkles } from "lucide-react"

export default function Sidebar() {
  const location = useLocation()
  const navItems = [
    { name: "Tổng quan", path: "/user/dashboard", icon: LayoutDashboard },
    { name: "Khóa học của tôi", path: "/user/courses", icon: BookOpen },
    { name: "Lớp học Live Meet", path: "/user/meet", icon: Video },
    { name: "Bài thi & Bài tập", path: "/user/exams", icon: Award },
    { name: "Phân tích AI", path: "/user/analytics", icon: BarChart2 },
  ]

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between min-h-screen text-slate-300 select-none shrink-0">
      <div className="p-6 border-b border-slate-800">
        <Link to="/user/dashboard" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20">
            EC
          </div>
          <div>
            <span className="font-black text-base text-white tracking-wide block">EduTech</span>
            <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase block -mt-1">
              User Dashboard
            </span>
          </div>
        </Link>
      </div>

      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-bold text-slate-500 uppercase px-3 mb-3 tracking-wider">
          Menu Học Viên
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/80"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          )
        })}

        <div className="pt-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/40 to-slate-800/80 border border-blue-500/30 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-extrabold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Trợ lý AI 4.0</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              Bạn có 100 AI credits miễn phí để phân tích tiến độ học tập.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-1">
        <Link
          to="/user/settings"
          className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
        >
          <Settings className="w-4 h-4" />
          <span>Cài đặt tài khoản</span>
        </Link>
        <Link
          to="/login"
          className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </Link>
      </div>
    </aside>
  )
}