import React, { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { 
  Home as HomeIcon,
  LayoutDashboard, 
  GraduationCap, 
  Library, 
  BookOpen, 
  Video, 
  Bookmark, 
  Sparkles,
  ChevronRight,
  ChevronDown,
  Award,
  Users,
  FolderPlus,
  LogOut,
  ShieldCheck,
  FileCheck2,
  HelpCircle,
  CalendarDays,
  Tags,
  FolderTree
} from "lucide-react"

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [role, setRole] = useState("student")
  
  // Quản lý đóng/mở submenu (mặc định mở cả 2 danh mục để luôn thấy list)
  const [openSubmenu, setOpenSubmenu] = useState({
    "Danh mục khóa học": true,
    "Danh mục tài liệu": true
  })
  
  // Quản lý xem thêm / thu gọn khi danh sách dài
  const [expandedSubmenus, setExpandedSubmenus] = useState({})

  useEffect(() => {
    const loadUserData = () => {
      const storedUser = localStorage.getItem("user")
      const storedRole = localStorage.getItem("role")

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
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
    window.addEventListener("storage", loadUserData)
    return () => window.removeEventListener("storage", loadUserData)
  }, [])

  const fullName = user?.fullName || user?.full_name || (role === "teacher" ? "Giảng viên EduTech" : "Học viên EduTech")
  const avatarUrl = user?.avatar || ""

  const getInitials = (name) => {
    if (!name) return "EC"
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return parts.map(p => p[0]).join("").substring(0, 3).toUpperCase()
  }

  // 1. List các mục con của Danh mục khóa học
  const courseCategories = [
    { name: "Toán học & Giải tích", path: `/${role}/courses/category/toan-hoc` },
    { name: "Tin học & Lập trình", path: `/${role}/courses/category/tin-hoc` },
    { name: "Tiếng Anh & Ngoại ngữ", path: `/${role}/courses/category/tieng-anh` },
    { name: "Vật lý đại cương", path: `/${role}/courses/category/vat-ly` },
    { name: "Hóa học & Sinh học", path: `/${role}/courses/category/khoa-hoc-tu-nhien` },
    { name: "Toán cao cấp & Đại số", path: `/${role}/courses/category/toan-cao-cap` },
    { name: "Triết học & Pháp luật", path: `/${role}/courses/category/dai-cuong` },
    { name: "Kinh tế vi mô & vĩ mô", path: `/${role}/courses/category/kinh-te` }
  ]

  // 2. List các mục con của Danh mục tài liệu
  const docCategories = [
    { name: "Giáo trình & Bài giảng chuẩn", path: `/${role}/docs/giao-trinh` },
    { name: "Đề thi & Đáp án chi tiết", path: `/${role}/docs/de-thi` },
    { name: "Sách & Ebook tham khảo", path: `/${role}/docs/ebooks` },
    { name: "Bài báo & Đề tài nghiên cứu", path: `/${role}/docs/nghien-cuu` },
    { name: "Slide & Tóm tắt kiến thức", path: `/${role}/docs/slide` }
  ]

  // Menu học viên
  const studentNavItems = [
    { name: "Trang chủ", path: `/${role}/home`, icon: HomeIcon },
    { name: "Bảng điều khiển", path: `/${role}/dashboard`, icon: LayoutDashboard },
    { name: "Chương trình & Khối lớp", path: `/${role}/programs`, icon: GraduationCap },
    { name: "Kho Học liệu & Thư viện", path: `/${role}/library`, icon: Library },
    { 
      name: "Danh mục khóa học", 
      icon: Tags, 
      children: courseCategories 
    },
    { 
      name: "Danh mục tài liệu", 
      icon: FolderTree, 
      children: docCategories 
    },
    { name: "Môn học của tôi", path: `/${role}/courses`, icon: BookOpen },
    { name: "Video Edu & Bài giảng", path: `/${role}/videos`, icon: Video },
    { name: "Tủ sách & Bộ sưu tập", path: `/${role}/bookshelf`, icon: Bookmark },
  ]

  // Menu giảng viên
  const teacherNavItems = [
    { name: "Trang chủ", path: `/${role}/home`, icon: HomeIcon },
    { name: "Bảng quản lý Giảng viên", path: `/${role}/dashboard`, icon: LayoutDashboard },
    { name: "Quản lý Lớp & Khóa học", path: `/${role}/courses`, icon: FolderPlus },
    { 
      name: "Danh mục khóa học", 
      icon: Tags, 
      children: courseCategories 
    },
    { 
      name: "Danh mục tài liệu", 
      icon: FolderTree, 
      children: docCategories 
    },
    { name: "Ngân hàng Đề & Bài kiểm tra", path: `/${role}/quizzes`, icon: HelpCircle },
    { name: "Chấm điểm & Đánh giá", path: `/${role}/grading`, icon: FileCheck2 },
    { name: "Danh sách Học viên", path: `/${role}/students`, icon: Users },
    { name: "Lịch dạy & Tương tác", path: `/${role}/schedule`, icon: CalendarDays },
    { name: "Kho Học liệu & Slide", path: `/${role}/library`, icon: Library },
  ]

  const navItems = role === "teacher" ? teacherNavItems : studentNavItems
  const isTeacher = role === "teacher"

  const toggleSubmenu = (name) => {
    setOpenSubmenu(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  const toggleExpandSubmenu = (name) => {
    setExpandedSubmenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("role")
    navigate("/login")
  }

  const ITEM_LIMIT = 5

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between text-slate-700 select-none shrink-0 p-4 transition-all">
      <div className="space-y-4">
        
        {/* Profile Header */}
        <Link
          to={`/${role}/profile`}
          className={`relative group p-3 rounded-2xl border shadow-xs flex items-center space-x-3 transition-all cursor-pointer block ${
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
                className="w-10 h-10 rounded-full object-cover shadow-xs border-2 border-white"
                onError={(e) => {
                  e.target.style.display = "none"
                  if (e.target.nextSibling) e.target.nextSibling.style.display = "flex"
                }}
              />
            ) : null}

            <div
              className={`w-10 h-10 rounded-full text-white font-black text-xs items-center justify-center shadow-xs border-2 border-white ${
                avatarUrl ? "hidden" : "flex"
              } ${
                isTeacher 
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/20" 
                  : "bg-gradient-to-r from-blue-600 to-cyan-500 shadow-blue-500/20"
              }`}
            >
              {getInitials(fullName)}
            </div>

            <span className="w-3 h-3 bg-emerald-500 border-2 border-white rounded-full absolute bottom-0 right-0 shadow-xs" />
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

        {/* Dynamic Navigation */}
        <div className="space-y-1.5">
          <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center justify-between pb-1">
            <span>{isTeacher ? "Menu Quản Lý" : "Menu Học Tập"}</span>
            {isTeacher ? (
              <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
            ) : (
              <Award className="w-3.5 h-3.5 text-amber-500" />
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const hasChildren = Boolean(item.children && item.children.length > 0)
              const isChildActive = hasChildren && item.children.some(c => location.pathname === c.path)
              const isActive = (!hasChildren && location.pathname === item.path) || isChildActive
              const isOpen = Boolean(openSubmenu[item.name])
              const isExpanded = Boolean(expandedSubmenus[item.name])

              const visibleChildren = hasChildren 
                ? (isExpanded ? item.children : item.children.slice(0, ITEM_LIMIT))
                : []

              return (
                <div key={item.name} className="relative">
                  {hasChildren ? (
                    // Nút bấm mở/đóng danh mục có list con
                    <button
                      type="button"
                      onClick={() => toggleSubmenu(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isChildActive
                          ? isTeacher
                            ? "bg-orange-50 text-orange-600 border border-orange-200/60"
                            : "bg-blue-50 text-blue-600 border border-blue-200/60"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                          isChildActive
                            ? isTeacher ? "text-orange-600" : "text-blue-600"
                            : "text-slate-500"
                        }`} />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  ) : (
                    // Tab điều hướng thông thường
                    <Link
                      to={item.path}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? isTeacher
                            ? "bg-orange-500 text-white shadow-xs shadow-orange-500/25"
                            : "bg-blue-600 text-white shadow-xs shadow-blue-500/25"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
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
                  )}

                  {/* List xổ dọc hiển thị các danh mục con */}
                  {hasChildren && isOpen && (
                    <div className="mt-1 ml-4 pl-2 border-l-2 border-slate-100 space-y-0.5 animate-in fade-in duration-200">
                      {visibleChildren.map((sub) => {
                        const isSubActive = location.pathname === sub.path
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className={`block px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                              isSubActive
                                ? isTeacher ? "text-orange-600 bg-orange-50 font-bold" : "text-blue-600 bg-blue-50 font-bold"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        )
                      })}

                      {/* Nút Xem thêm / Thu gọn khi danh sách > 5 mục */}
                      {item.children.length > ITEM_LIMIT && (
                        <button
                          type="button"
                          onClick={() => toggleExpandSubmenu(item.name)}
                          className={`w-full text-left px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-colors ${
                            isTeacher 
                              ? "text-orange-500 hover:text-orange-700" 
                              : "text-blue-600 hover:text-blue-800"
                          }`}
                        >
                          {isExpanded 
                            ? "− Thu gọn" 
                            : `+ Xem thêm (${item.children.length - ITEM_LIMIT})`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Widget AI & Logout */}
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
            <span>{isTeacher ? "Trợ lý Trợ giảng AI" : "Trợ lý Học tập AI"}</span>
          </div>
          <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
            {isTeacher 
              ? "Hỗ trợ Thầy/Cô tạo ngân hàng đề thi & gợi ý giáo án." 
              : "Sẵn sàng hỗ trợ bạn giải bài tập 24/7."}
          </p>
        </div>

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