import React from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  GraduationCap, 
  Library, 
  BookOpen, 
  Video, 
  Bookmark, 
  Sparkles,
  ChevronRight,
  Award
} from "lucide-react"

export default function Sidebar() {
  const location = useLocation()

  const navItems = [
    { name: "Bảng điều khiển", path: "/user/dashboard", icon: LayoutDashboard },
    { name: "Chương trình & Khối lớp", path: "/user/programs", icon: GraduationCap },
    { name: "Kho Học liệu & Thư viện số", path: "/user/library", icon: Library },
    { name: "Môn học của tôi", path: "/user/courses", icon: BookOpen },
    { name: "Video Edu & Bài giảng", path: "/user/videos", icon: Video },
    { name: "Tủ sách & Bộ sưu tập", path: "/user/bookshelf", icon: Bookmark },
  ]

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between text-slate-700 select-none shrink-0 p-4 transition-all">
      <div className="space-y-6">
        
        {/* Profile Info - Thẻ Thông tin Học sinh Võ Duy Toàn */}
        <div className="relative group p-3 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 border border-slate-200/60 shadow-sm flex items-center space-x-3 transition-all hover:border-blue-200">
          <div className="relative shrink-0">
            {/* Avatar viết tắt VDT dạng Gradient */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-500/20 border-2 border-white">
              VDT
            </div>
            {/* Chấm trạng thái Hoạt động */}
            <span className="w-3 h-3 bg-emerald-500 border-2 border-white rounded-full absolute bottom-0 right-0 shadow-sm" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-slate-900 truncate leading-tight">
              Võ Duy Toàn
            </h4>
            <p className="text-[10px] text-blue-600 font-extrabold truncate mt-0.5">
              Học viên Pro Active
            </p>
          </div>
        </div>

        {/* Dynamic Navigation Section */}
        <div className="space-y-2">
          {/* Section Heading */}
          <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span>Menu Học Viên</span>
            <Award className="w-3 h-3 text-amber-500" />
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || (item.path === "/user/dashboard" && location.pathname === "/")
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600 group-hover:scale-110"
                    }`} />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {/* Arrow Indicator */}
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-200 ${
                    isActive ? "opacity-100 translate-x-0 text-white/80" : "group-hover:opacity-100 group-hover:translate-x-0 text-slate-400"
                  }`} />
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* AI Assistant Widget at the bottom */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50/50 to-amber-50/30 border border-blue-100/80 space-y-2">
          <div className="flex items-center space-x-2 text-blue-700 font-extrabold text-xs">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
            <span>Trợ lý Học tập AI</span>
          </div>
          <p className="text-[10px] text-slate-600 font-medium leading-relaxed">
            Chào Toàn, AI luôn sẵn sàng hỗ trợ bạn giải bài tập và tóm tắt kiến thức 24/7.
          </p>
        </div>
      </div>
    </aside>
  )
}