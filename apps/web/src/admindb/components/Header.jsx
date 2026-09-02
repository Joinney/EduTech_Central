import React, { useState, useRef, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { 
  Search, 
  Bell, 
  ShieldCheck, 
  User, 
  LogOut, 
  ChevronDown, 
  Settings,
  CheckCheck,
  Info,
  AlertTriangle,
  UserPlus,
  BookOpen
} from "lucide-react"
import { authApi } from "../../api/axios"

export default function AdminHeader() {
  const navigate = useNavigate()
  const [isOpenMenu, setIsOpenMenu] = useState(false)
  const [isOpenNotif, setIsOpenNotif] = useState(false)
  
  const menuRef = useRef(null)
  const notifRef = useRef(null)

  // Danh sách thông báo mẫu (có thể thay bằng API gọi về từ backend)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "user",
      title: "Học viên mới đăng ký",
      message: "Nguyễn Văn A vừa tạo tài khoản thành công.",
      time: "5 phút trước",
      unread: true
    },
    {
      id: 2,
      type: "course",
      title: "Khóa học chờ duyệt",
      message: "Khóa học 'Lập trình React nâng cao' đang chờ kiểm duyệt nội dung.",
      time: "30 phút trước",
      unread: true
    },
    {
      id: 3,
      type: "warning",
      title: "Cảnh báo bảo mật",
      message: "Phát hiện 3 lượt đăng nhập thất bại liên tiếp từ IP lạ.",
      time: "2 giờ trước",
      unread: false
    }
  ])

  const unreadCount = notifications.filter(n => n.unread).length

  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const adminName = user.fullName || "Quản Trị Viên"
  const adminEmail = user.email || "admin@edutech.com"

  const getInitials = (name) => {
    if (!name) return "AD"
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpenMenu(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsOpenNotif(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, unread: false })))
  }

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

  // Chọn icon theo loại thông báo
  const renderNotifIcon = (type) => {
    switch (type) {
      case "user":
        return <UserPlus className="w-4 h-4 text-blue-600" />
      case "course":
        return <BookOpen className="w-4 h-4 text-emerald-600" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />
      default:
        return <Info className="w-4 h-4 text-indigo-600" />
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
        
        {/* Dropdown Thông báo */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => {
              setIsOpenNotif(!isOpenNotif)
              setIsOpenMenu(false)
            }}
            className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
              isOpenNotif ? "bg-slate-100 text-blue-600" : "text-slate-500 hover:bg-slate-100"
            }`} 
            title="Thông báo hệ thống"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            {unreadCount > 0 && (
              <span className="w-2 h-2 bg-orange-500 rounded-full absolute top-1.5 right-1.5 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Bảng Popup Thông Báo */}
          {isOpenNotif && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
              
              {/* Header của Popup */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-800">Thông báo</h3>
                  {unreadCount > 0 && (
                    <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>

              {/* Danh sách thông báo */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div 
                      key={item.id}
                      className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                        item.unread ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                        {renderNotifIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-800 truncate">{item.title}</h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium line-clamp-2 mt-0.5 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                      {item.unread && (
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 self-center" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 font-medium">
                    Không có thông báo nào
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
                <Link
                  to="/admin/notifications"
                  onClick={() => setIsOpenNotif(false)}
                  className="text-[11px] font-bold text-slate-600 hover:text-blue-600 transition-colors block py-1"
                >
                  Xem tất cả thông báo
                </Link>
              </div>

            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Dropdown Profile Admin */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => {
              setIsOpenMenu(!isOpenMenu)
              setIsOpenNotif(false)
            }}
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

          {/* Menu thả xuống Profile */}
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