import React from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { 
  LayoutDashboard, 
  Users, 
  BookOpenCheck, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  ChevronRight,
  ShieldCheck
} from "lucide-react"

export default function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const adminNavItems = [
    { name: "Bảng Điều Khiển Admin", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Quản Lý Người Dùng", path: "/admin/users", icon: Users },
    { name: "Kiểm Duyệt Khóa Học", path: "/admin/courses", icon: BookOpenCheck },
    { name: "Báo Cáo & Cảnh Báo", path: "/admin/reports", icon: ShieldAlert },
    { name: "Cấu Hình Hệ Thống", path: "/admin/settings", icon: Settings },
  ]

  const handleLogout = () => {
    localStorage.clear()
    navigate("/admin/login")
  }

  return (
    <aside className="w-64 bg-slate-50 text-slate-700 flex flex-col justify-between shrink-0 p-4 select-none min-h-screen border-r border-slate-200">
      <div className="space-y-6">
        
        {/* Profile Admin Header Sáng */}
        <div className="p-3 bg-white rounded-2xl border border-slate-200/80 flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-md shadow-blue-500/20 shrink-0">
            AD
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-slate-800 truncate leading-tight">
              {user.fullName || "Quản Trị Viên"}
            </h4>
            <p className="text-[10px] font-extrabold text-orange-500 truncate mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-orange-500" />
              Administrator
            </p>
          </div>
        </div>

        {/* Navigation Sáng */}
        <div className="space-y-1.5">
          <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
            Hệ Thống Quản Trị
          </div>

          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                      : "text-slate-600 hover:bg-slate-200/60 hover:text-blue-600"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600 group-hover:scale-110"
                    }`} />
                    <span className="truncate">{item.name}</span>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all ${
                    isActive ? "opacity-100 translate-x-0 text-white/80" : "group-hover:opacity-100 group-hover:translate-x-0 text-slate-400"
                  }`} />
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Logout Button Sáng */}
      <div className="pt-3 border-t border-slate-200 space-y-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Đăng xuất Admin</span>
        </button>
      </div>
    </aside>
  )
}