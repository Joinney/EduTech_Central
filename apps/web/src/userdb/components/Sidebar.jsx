import React, { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { 
  LayoutDashboard, 
  GraduationCap, 
  Library, 
  BookOpen, 
  Video, 
  Bookmark, 
  Sparkles,
  ChevronRight,
  Award,
  Users,
  FolderPlus,
  LogOut,
  ShieldCheck
} from "lucide-react"

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [role, setRole] = useState("student")

  // Đọc thông tin người dùng & vai trò từ localStorage
  useEffect(() => {
    const loadUserData = () => {
      const storedUser = localStorage.getItem("user")
      const storedRole = localStorage.getItem("role")

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          // Ưu tiên đọc role từ user object nếu có, không thì đọc từ key role
          const currentRole = parsedUser.role || storedRole || "student"
          setRole(currentRole.toLowerCase())
        } catch (e) {
          console.error("Lỗi đọc dữ liệu người dùng:", e)
        }
      } else if (storedRole) {
        setRole(storedRole.toLowerCase())
      }
    }

    loadUserData()

    // Lắng nghe thay đổi khi Profile hoặc Login cập nhật localStorage
    window.addEventListener("storage", loadUserData)
    return () => window.removeEventListener("storage", loadUserData)
  }, [])

  // Tên hiển thị mặc định
  const fullName = user?.fullName || user?.full_name || (role === "teacher" ? "Giảng viên EduTech" : "Học viên EduTech")
  const avatarUrl = user?.avatar || ""

  // Tạo chữ viết tắt từ tên người dùng
  const getInitials = (name) => {
    if (!name) return "EC"
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return parts.map(p => p[0]).join("").substring(0, 3).toUpperCase()
  }

  // Danh sách menu cho Học viên
  const studentNavItems = [
    { name: "Bảng điều khiển", path: `/${role}/dashboard`, icon: LayoutDashboard },
    { name: "Chương trình & Khối lớp", path: `/${role}/programs`, icon: GraduationCap },
    { name: "Kho Học liệu & Thư viện số", path: `/${role}/library`, icon: Library },
    { name: "Môn học của tôi", path: `/${role}/courses`, icon: BookOpen },
    { name: "Video Edu & Bài giảng", path: `/${role}/videos`, icon: Video },
    { name: "Tủ sách & Bộ sưu tập", path: `/${role}/bookshelf`, icon: Bookmark },
  ]

  // Danh sách menu cho Giảng viên
  const teacherNavItems = [
    { name: "Bảng quản lý Giảng viên", path: `/${role}/dashboard`, icon: LayoutDashboard },
    { name: "Quản lý Khóa học & Bài giảng", path: `/${role}/courses`, icon: FolderPlus },
    { name: "Kho Học liệu dùng chung", path: `/${role}/library`, icon: Library },
    { name: "Danh sách Học viên", path: `/${role}/students`, icon: Users },
    { name: "Video Đào tạo & Khóa học", path: `/${role}/videos`, icon: Video },
    { name: "Tài liệu & Giáo trình", path: `/${role}/bookshelf`, icon: Bookmark },
  ]

  // Lựa chọn danh sách hiển thị
  const navItems = role === "teacher" ? teacherNavItems : studentNavItems

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("role")
    navigate("/login")
  }

  const isTeacher = role === "teacher"

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between text-slate-700 select-none shrink-0 p-4 transition-all">
      <div className="space-y-5">
        
        {/* Profile Info - Link sang Trang cá nhân tương ứng với role */}
        <Link
          to={`/${role}/profile`}
          className={`relative group p-3 rounded-2xl border shadow-sm flex items-center space-x-3 transition-all cursor-pointer block ${
            isTeacher 
              ? "bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/20 border-slate-200/60 hover:border-orange-300" 
              : "bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 border-slate-200/60 hover:border-blue-300"
          }`}
        >
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-white"
                onError={(e) => {
                  e.target.style.display = "none"
                  if (e.target.nextSibling) e.target.nextSibling.style.display = "flex"
                }}
              />
            ) : null}

            {/* Avatar viết tắt khi không có ảnh */}
            <div
              className={`w-10 h-10 rounded-full text-white font-black text-xs items-center justify-center shadow-md border-2 border-white ${
                avatarUrl ? "hidden" : "flex"
              } ${
                isTeacher 
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/20" 
                  : "bg-gradient-to-r from-blue-600 to-cyan-500 shadow-blue-500/20"
              }`}
            >
              {getInitials(fullName)}
            </div>

            {/* Chấm online */}
            <span className="w-3 h-3 bg-emerald-500 border-2 border-white rounded-full absolute bottom-0 right-0 shadow-sm" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 
              className={`font-bold text-xs text-slate-900 truncate leading-tight transition-colors ${
                isTeacher ? "group-hover:text-orange-600" : "group-hover:text-blue-600"
              }`} 
              title={fullName}
            >
              {fullName}
            </h4>
            <p className={`text-[10px] font-extrabold truncate mt-0.5 ${
              isTeacher ? "text-orange-600" : "text-blue-600"
            }`}>
              {isTeacher ? "Giảng viên Chuẩn" : "Học viên Pro Active"}
            </p>
          </div>
        </Link>

        {/* Dynamic Navigation Section */}
        <div className="space-y-2">
          <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span>{isTeacher ? "Menu Giảng Viên" : "Menu Học Viên"}</span>
            {isTeacher ? (
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
            ) : (
              <Award className="w-3.5 h-3.5 text-amber-500" />
            )}
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || (item.path === `/${role}/dashboard` && location.pathname === "/")
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? isTeacher
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                        : "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isActive 
                        ? "text-white" 
                        : isTeacher
                          ? "text-slate-500 group-hover:text-orange-600 group-hover:scale-110"
                          : "text-slate-500 group-hover:text-blue-600 group-hover:scale-110"
                    }`} />
                    <span className="truncate">{item.name}</span>
                  </div>

                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-200 ${
                    isActive ? "opacity-100 translate-x-0 text-white/80" : "group-hover:opacity-100 group-hover:translate-x-0 text-slate-400"
                  }`} />
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Widget AI & Nút Đăng Xuất ở góc dưới */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className={`p-3 rounded-2xl border space-y-1.5 ${
          isTeacher 
            ? "bg-gradient-to-br from-orange-50 via-amber-50/40 to-slate-50/20 border-orange-100/80" 
            : "bg-gradient-to-br from-blue-50 via-indigo-50/50 to-amber-50/30 border-blue-100/80"
        }`}>
          <div className={`flex items-center space-x-2 font-extrabold text-xs ${
            isTeacher ? "text-orange-700" : "text-blue-700"
          }`}>
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
            <span>{isTeacher ? "Trợ lý Giảng dạy AI" : "Trợ lý Học tập AI"}</span>
          </div>
          <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
            {isTeacher 
              ? `Chào ${fullName.split(" ").pop()}, AI hỗ trợ soạn đề thi và gợi ý giáo án 24/7.` 
              : `Chào ${fullName.split(" ").pop()}, AI luôn sẵn sàng hỗ trợ bạn giải bài tập 24/7.`}
          </p>
        </div>

        {/* Nút Đăng xuất */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Đăng xuất hệ thống</span>
        </button>
      </div>
    </aside>
  )
}