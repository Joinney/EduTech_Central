import React from "react"
import { Link } from "react-router-dom"
import { 
  Search, 
  Bot, 
  GraduationCap, 
  Star, 
  Bell, 
  Settings 
} from "lucide-react"

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      
      {/* 1. Logo EduTech Central (Đã tăng kích thước) */}
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

        {/* Vạch ngăn cách ngắn */}
        <div className="h-5 w-[1px] bg-slate-200 my-auto mx-1" />

        {/* Avatar Võ Duy Toàn */}
        <div className="pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-[10px] flex items-center justify-center border border-slate-200 shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition">
            VDT
          </div>
        </div>

      </div>

    </header>
  )
}