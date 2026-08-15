/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react"
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
  ChevronRight,
  ChevronDown,
  FolderTree,
  Database,
  Layers,
  GraduationCap,
  TrendingUp,
  MessageSquare,
  Radio,
  Video,
  Clock,
  HelpCircle,
  FileCheck,
  BarChart3,
  Sparkles
} from "lucide-react"

export default function AdminSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Quản lý trạng thái mở/đóng của 4 menu cha LCMS
  const [openMenus, setOpenMenus] = useState({
    content: true,
    students: true,
    live: false,
    assessment: false
  })

  // Tự động mở nhóm menu cha tương ứng khi người dùng truy cập qua URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const currentTab = searchParams.get("tab")
    if (currentTab && openMenus[currentTab] !== undefined) {
      setOpenMenus((prev) => ({ ...prev, [currentTab]: true }))
    }
  }, [location.search])

  const toggleMenu = (key) => {
    if (isCollapsed) setIsCollapsed(false)
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // 4 TRỤ CỘT LCMS CORE & CÁC TAB CON ĐỒNG BỘ CHUẨN XÁC
  const lcmsGroups = [
    {
      id: "content",
      title: "Khóa Học & Bài Giảng",
      icon: FolderTree,
      subItems: [
        { name: "Danh sách khóa học", tab: "content", sub: "course_list", icon: BookOpenCheck },
        { name: "Cấu trúc chương mục", tab: "content", sub: "curriculum", icon: Layers },
        { name: "Ngân hàng tài nguyên", tab: "content", sub: "resources", icon: Database },
      ]
    },
    {
      id: "students",
      title: "Lớp Học & Học Viên",
      icon: GraduationCap,
      subItems: [
        { name: "Danh sách học viên", tab: "students", sub: "student_list", icon: Users },
        { name: "Tiến độ học tập", tab: "students", sub: "progress", icon: TrendingUp },
        { name: "Diễn đàn / Thảo luận", tab: "students", sub: "discussion", icon: MessageSquare }, // 👈 Đồng bộ chính xác với StudentsTab.jsx
      ]
    },
    {
      id: "live",
      title: "Dạy Online & Lịch Live",
      icon: Radio,
      subItems: [
        { name: "Lịch dạy trực tuyến", tab: "live", sub: "schedule", icon: Clock },
        { name: "Tích hợp phòng ảo", tab: "live", sub: "virtual_room", icon: Video },
        { name: "Điểm danh online", tab: "live", sub: "attendance", icon: UserCircle },
      ]
    },
    {
      id: "assessment",
      title: "Đánh Giá & Khảo Thí",
      icon: FileCheck,
      subItems: [
        { name: "Kho ngân hàng câu hỏi", tab: "assessment", sub: "question_bank", icon: HelpCircle },
        { name: "Quản lý bài kiểm tra", tab: "assessment", sub: "quiz_mgmt", icon: FileCheck },
        { name: "Chấm điểm & Báo cáo", tab: "assessment", sub: "grading", icon: BarChart3 },
      ]
    }
  ]

  const handleLogout = () => {
    localStorage.clear()
    navigate("/admin/login")
  }

  // Kiểm tra tab con có đang active hay không
  const isSubItemActive = (tab, sub) => {
    if (location.pathname !== "/admin/courses") return false
    const searchParams = new URLSearchParams(location.search)
    const currentTab = searchParams.get("tab") || "content"
    const currentSub = searchParams.get("sub") || "course_list"
    return currentTab === tab && currentSub === sub
  }

  return (
    <aside 
      className={`bg-[#38497C] text-white flex flex-col justify-between shrink-0 select-none min-h-screen relative overflow-visible transition-all duration-300 z-50 ${
        isCollapsed ? "w-20 p-3" : "w-72 p-4"
      }`}
    >
      {/* Nút Thu gọn/Mở rộng Sidebar */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-orange-500 text-white rounded-full p-1 shadow-md z-50 hover:bg-orange-600 transition-all cursor-pointer"
        title={isCollapsed ? "Mở rộng thanh điều hướng" : "Thu gọn"}
      >
        {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
      </button>

      {/* Hiệu ứng ánh sáng nền phía trên */}
      <div className="absolute top-0 left-0 w-full h-48 bg-white/10 blur-[80px] pointer-events-none" />

      <div className="space-y-4 relative z-10 overflow-y-auto max-h-[calc(100vh-100px)] pr-1 custom-scrollbar">
        
        {/* LOGO TRANG */}
        <Link 
          to="/admin/dashboard"
          className={`group flex items-center justify-center transition-all duration-300 ${
            isCollapsed ? "py-2 h-14" : "py-3 min-h-[70px]"
          }`}
        >
          <img
            src={isCollapsed ? "/edutechcentralogo.png" : "/edutechcentral.png"}
            alt="EduTech Central Logo"
            className={`object-contain transition-all duration-300 group-hover:scale-105 shrink-0 ${
              isCollapsed ? "w-10 h-10" : "h-12 w-auto max-w-[200px]"
            }`}
          />
        </Link>

        {/* CÁC TRANG QUẢN TRỊ CHUNG */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 text-[10px] font-extrabold text-blue-200/60 uppercase tracking-wider mb-1.5">
              Tổng quan
            </div>
          )}

          <Link
            to="/admin/dashboard"
            title={isCollapsed ? "Bảng điều khiển" : ""}
            className={`group flex items-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              location.pathname === "/admin/dashboard"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "text-blue-100/70 hover:bg-white/10 hover:text-white"
            } ${isCollapsed ? "justify-center" : "space-x-3"}`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Bảng điều khiển</span>}
          </Link>

          <Link
            to="/admin/users"
            title={isCollapsed ? "Quản lý người dùng" : ""}
            className={`group flex items-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              location.pathname === "/admin/users"
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                : "text-blue-100/70 hover:bg-white/10 hover:text-white"
            } ${isCollapsed ? "justify-center" : "space-x-3"}`}
          >
            <Users className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Quản lý người dùng</span>}
          </Link>
        </div>

        {/* ================= 4 TRỤ CỘT LCMS CORE ================= */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          {!isCollapsed && (
            <div className="px-3 text-[10px] font-extrabold text-orange-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Hệ thống LCMS Core</span>
            </div>
          )}

          {lcmsGroups.map((group) => {
            const GroupIcon = group.icon
            const isOpen = openMenus[group.id]

            return (
              <div key={group.id} className="space-y-1">
                {/* Nút Nhóm Cha */}
                <button
                  type="button"
                  onClick={() => toggleMenu(group.id)}
                  title={isCollapsed ? group.title : ""}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isOpen ? "bg-white/15 text-white" : "text-blue-100/80 hover:bg-white/10 hover:text-white"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <div className={`flex items-center ${isCollapsed ? "" : "space-x-2.5 truncate"}`}>
                    <GroupIcon className="w-4 h-4 shrink-0 text-orange-400" />
                    {!isCollapsed && <span className="truncate text-left">{group.title}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown className={`w-3.5 h-3.5 text-blue-200 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  )}
                </button>

                {/* Danh sách các Tab con */}
                {!isCollapsed && isOpen && (
                  <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-orange-500/40 ml-4 animate-fadeIn">
                    {group.subItems.map((sub) => {
                      const SubIcon = sub.icon
                      const active = isSubItemActive(sub.tab, sub.sub)
                      const targetUrl = `/admin/courses?tab=${sub.tab}&sub=${sub.sub}`

                      return (
                        <Link
                          key={sub.sub}
                          to={targetUrl}
                          className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                            active
                              ? "bg-orange-500 text-white shadow-sm font-bold"
                              : "text-blue-100/70 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <SubIcon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-white" : "text-blue-200/60"}`} />
                          <span className="truncate">{sub.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CÁC MỤC HỆ THỐNG KHÁC */}
        <div className="space-y-1 pt-2 border-t border-white/10">
          <Link
            to="/admin/reports"
            title={isCollapsed ? "Báo cáo & Cảnh báo" : ""}
            className={`group flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              location.pathname === "/admin/reports"
                ? "bg-orange-500 text-white font-bold"
                : "text-blue-100/70 hover:bg-white/10 hover:text-white"
            } ${isCollapsed ? "justify-center" : "space-x-3"}`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Báo cáo & Cảnh báo</span>}
          </Link>

          <Link
            to="/admin/settings"
            title={isCollapsed ? "Cấu hình hệ thống" : ""}
            className={`group flex items-center px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              location.pathname === "/admin/settings"
                ? "bg-orange-500 text-white font-bold"
                : "text-blue-100/70 hover:bg-white/10 hover:text-white"
            } ${isCollapsed ? "justify-center" : "space-x-3"}`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Cấu hình hệ thống</span>}
          </Link>
        </div>

      </div>

      {/* NÚT ĐĂNG XUẤT */}
      <div className="pt-3 border-t border-white/10 relative z-10 mt-auto">
        <button
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? "Đăng xuất" : ""}
          className={`w-full flex items-center rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer ${
            isCollapsed ? "justify-center py-2.5" : "px-3 py-2.5 space-x-3"
          }`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  )
}