import React, { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { 
  Search, 
  Bot, 
  GraduationCap, 
  Star, 
  Bell, 
  Settings,
  LogOut,
  User as UserIcon
} from "lucide-react"

export default function Header() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    // Hàm đọc dữ liệu người dùng mới nhất từ localStorage
    const loadUserData = () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          console.error("Lỗi đọc dữ liệu người dùng tại Header:", e)
        }
      }
    }

    loadUserData()

    // 1. Lắng nghe sự kiện storage chuẩn (cho các tab khác)
    window.addEventListener("storage", loadUserData)

    // 2. Lắng nghe Custom Event "user-profile-updated" (cho cùng 1 tab)
    window.addEventListener("user-profile-updated", loadUserData)

    // Xử lý đóng Dropdown menu khi click ra ngoài
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("storage", loadUserData)
      window.removeEventListener("user-profile-updated", loadUserData)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Xử lý Đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const fullName = user?.fullName || user?.full_name || "Học viên"
  const email = user?.email || ""
  const avatarUrl = user?.avatar || ""

  // Tạo chữ viết tắt họ tên (VD: Võ Duy Toàn -> VDT)
  const getInitials = (name) => {
    if (!name) return "EC"
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return parts.map(p => p[0]).join("").substring(0, 3).toUpperCase()
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      
      {/* 1. Logo EduTech Central */}
      <Link to="/user/dashboard" className="flex items-center space-x-2.5 shrink-0 group py-1">
        <img
          src="/edutechcentral.png"
          alt="EduTech Central Logo"
          className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
        />
      </Link>

      {/* 2. Thanh tìm kiếm trung tâm */}
      <div className="flex-1 max-w-xl mx-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm bài giảng, PDF, video, SCORM..."
            className="w-full pl-11 pr-4 py-2 bg-slate-100/80 border border-transparent rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>
      </div>

      {/* 3. Cụm Tiện ích & Thông tin góc phải */}
      <div className="flex items-center space-x-3 shrink-0">
        
        {/* Nút Trợ lý AI */}
        <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-xs font-bold transition cursor-pointer">
          <Bot className="w-4 h-4" />
          <span>Trợ lý AI</span>
        </button>

        {/* Badge Lớp học */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
          <GraduationCap className="w-4 h-4 text-slate-600" />
          <span>Lớp 12A1</span>
        </div>

        {/* Badge Điểm thưởng */}
        <div className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-50 border border-amber-200/80 text-amber-600 rounded-full text-xs font-extrabold">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          <span>1,250 Points</span>
        </div>

        {/* Icon Thông báo (Bell) */}
        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition relative cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1.5 right-1.5 border border-white" />
        </button>

        {/* Icon Cài đặt */}
        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition cursor-pointer">
          <Settings className="w-4 h-4" />
        </button>

        {/* Vạch ngăn cách */}
        <div className="h-5 w-[1px] bg-slate-200 my-auto mx-1" />

        {/* Avatar & Dropdown Đăng xuất */}
        <div className="relative pl-1" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="focus:outline-none cursor-pointer flex items-center"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                title={fullName}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm hover:ring-2 hover:ring-blue-500 transition"
                onError={(e) => {
                  e.target.style.display = "none"
                  if (e.target.nextSibling) e.target.nextSibling.style.display = "flex"
                }}
              />
            ) : null}

            <div
              title={fullName}
              className={`w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-[10px] items-center justify-center border border-slate-200 shadow-sm hover:ring-2 hover:ring-blue-500 transition ${
                avatarUrl ? "hidden" : "flex"
              }`}
            >
              {getInitials(fullName)}
            </div>
          </button>

          {/* Menu Dropdown khi click vào Avatar */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-extrabold text-slate-900 truncate">{fullName}</p>
                {email && <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">{email}</p>}
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false)
                    navigate("/user/profile")
                  }}
                  className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Trang cá nhân</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  )
}