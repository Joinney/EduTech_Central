import React, { useState, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { 
  Search, 
  Bell, 
  ShieldCheck, 
  User, 
  LogOut, 
  ChevronDown, 
  Settings 
} from "lucide-react"
import { authApi } from "../../api/axios"

export default function AdminHeader() {
  const navigate = useNavigate()
  const [isOpenMenu, setIsOpenMenu] = useState(false)
  const menuRef = useRef(null)

  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const adminName = user.fullName || "Quản Trị Viên"
  const adminEmail = user.email || "admin@edutech.com"

  const getInitials = (name) => {
    if (!name) return "AD"
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpenMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await authApi.post("/auth/logout")
    } catch (error) {
      console.warn("⚠️ Không thể gọi API logout ở server:", error)
    } finally {
      localStorage.removeItem("adminToken")
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      localStorage.removeItem("role")
      navigate("/admin/login")
    }
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 select-none relative z-30">
      
      {/* Search Global */}
      <div className="relative w-72 md:w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm ID người dùng, email, lớp học..."
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
        />
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center space-x-4">
        
        {/* Nút Thông báo */}
        <button 
          className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" 
          title="Thông báo hệ thống"
        >
          <Bell className="w-4 h-4 text-slate-600" />
          <span className="w-2 h-2 bg-orange-500 rounded-full absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        {/* Dropdown Profile Admin */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsOpenMenu(!isOpenMenu)}
            className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-500/20 ring-2 ring-blue-100">
              {getInitials(adminName)}
            </div>
            <div className="hidden sm:block text-left">
              <h4 className="text-xs font-black text-slate-800 leading-tight flex items-center gap-1">
                {adminName}
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpenMenu ? "rotate-180" : ""}`} />
              </h4>
              <span className="text-[10px] font-bold text-orange-500 block">{adminEmail}</span>
            </div>
          </button>

          {/* Menu thả xuống */}
          {isOpenMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl">
                <div className="flex items-center space-x-2 text-blue-900 font-extrabold text-xs">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  <span>Tài Khoản Administrator</span>
                </div>
                <p className="text-[11px] font-medium text-slate-500 mt-1 truncate">
                  {adminEmail}
                </p>
              </div>

              <div className="p-1 space-y-0.5 text-xs font-semibold text-slate-700">
                <Link
                  to="/admin/profile"
                  onClick={() => setIsOpenMenu(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Thông tin cá nhân</span>
                </Link>

                <Link
                  to="/admin/settings"
                  onClick={() => setIsOpenMenu(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Cài đặt hệ thống</span>
                </Link>
              </div>

              <div className="my-1 border-t border-slate-100" />

              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-xs font-bold cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất khỏi hệ thống</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  )
}