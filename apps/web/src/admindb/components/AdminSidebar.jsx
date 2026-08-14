import React, { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { 
  LayoutDashboard, 
  Users, 
  BookOpenCheck, 
  ShieldAlert, 
  Settings, 
  LogOut,
  UserCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

export default function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [isCollapsed, setIsCollapsed] = useState(false)

  const adminNavItems = [
    { name: "Bảng điều khiển", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Quản lý người dùng", path: "/admin/users", icon: Users },
    { name: "Kiểm duyệt khóa học", path: "/admin/courses", icon: BookOpenCheck },
    { name: "Báo cáo & Cảnh báo", path: "/admin/reports", icon: ShieldAlert },
    { name: "Cấu hình hệ thống", path: "/admin/settings", icon: Settings },
    { name: "Hồ sơ cá nhân", path: "/admin/profile", icon: UserCircle }, 
  ]

  const handleLogout = () => {
    localStorage.clear()
    navigate("/admin/login")
  }

  return (
    <aside 
      className={`bg-[#38497C] text-white flex flex-col justify-between shrink-0 select-none min-h-screen relative overflow-visible transition-all duration-300 z-50 ${
        isCollapsed ? "w-20 p-3" : "w-64 p-4"
      }`}
    >
      {/* Nút Thu gọn/Mở rộng */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-orange-500 text-white rounded-full p-1 shadow-md z-50 hover:bg-orange-600 transition-all cursor-pointer"
        title={isCollapsed ? "Mở rộng" : "Thu gọn"}
      >
        {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
      </button>

      {/* Hiệu ứng ánh sáng nền mờ */}
      <div className="absolute top-0 left-0 w-full h-48 bg-white/10 blur-[80px] pointer-events-none"></div>

      <div className="space-y-6 relative z-10">
        
        {/* KHU VỰC LOGO TRANG */}
        <Link 
          to="/admin/dashboard"
          className={`group flex items-center justify-center transition-all duration-300 ${
            isCollapsed ? "py-2 h-14" : "py-4 min-h-[80px]"
          }`}
        >
          {/* Tự động đổi Logo dựa trên trạng thái isCollapsed */}
          <img
            src={isCollapsed ? "/edutechcentralogo.png" : "/edutechcentral.png"}
            alt="EduTech Central Logo"
            className={`object-contain transition-all duration-300 group-hover:scale-105 shrink-0 ${
              isCollapsed ? "w-10 h-10" : "h-14 sm:h-16 w-auto max-w-[220px]"
            }`}
          />
        </Link>

        {/* Khu vực Menu Điều Hướng */}
        <div className="space-y-2 mt-2">
          {!isCollapsed ? (
            <div className="px-3 text-[11px] font-bold text-blue-200/60 uppercase tracking-wider mb-2">
              Hệ Thống Quản Trị
            </div>
          ) : (
            <div className="border-b border-blue-200/20 w-1/2 mx-auto mb-4"></div>
          )}

          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.name : ""} 
                  className={`group flex items-center px-3 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/30" 
                      : "text-blue-100/70 hover:bg-orange-500/90 hover:text-white" 
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <div className={`flex items-center ${isCollapsed ? "" : "space-x-3"}`}>
                    <Icon className={`w-5 h-5 shrink-0 transition-transform ${
                      isActive ? "text-white" : "text-blue-200/50 group-hover:text-white"
                    }`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Khu vực Nút Đăng Xuất (Màu đỏ) */}
      <div className="pt-4 border-t border-white/10 space-y-2 relative z-10 mt-auto">
        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? "Đăng xuất" : ""}
          className={`w-full flex items-center rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer ${
            isCollapsed ? "justify-center px-0 py-3" : "px-3 py-2.5 space-x-3"
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  )
}