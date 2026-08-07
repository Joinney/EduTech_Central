import React from "react"
import { Link } from "react-router-dom"
import { 
  GraduationCap, 
  Globe, 
  Mail, 
  Share2, 
  MapPin, 
  Phone, 
  Bot 
} from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative bg-[#f3f4f6] text-slate-600 text-xs border-t border-slate-200/80 pt-10 pb-6 px-6 lg:px-12 mt-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ================= PHẦN TRÊN: 4 CỘT THÔNG TIN ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-200/80">
          
          {/* Cột 1: Thương hiệu Kinetic Academy */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-7 h-7 text-blue-600 fill-blue-600" />
              <span className="font-extrabold text-base text-blue-600 tracking-tight">
                Kinetic Academy
              </span>
            </div>
            <p className="text-slate-500 leading-relaxed font-medium">
              Empowering next-gen learners with AI-driven personalized education and modern learning tools.
            </p>
            {/* Các icon Mạng xã hội / Web */}
            <div className="flex items-center space-x-3 text-slate-600 pt-1">
              <button className="p-1.5 hover:text-blue-600 hover:bg-slate-200/60 rounded-full transition cursor-pointer">
                <Globe className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:text-blue-600 hover:bg-slate-200/60 rounded-full transition cursor-pointer">
                <Mail className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:text-blue-600 hover:bg-slate-200/60 rounded-full transition cursor-pointer">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cột 2: Truy cập nhanh */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 text-xs tracking-wider uppercase">
              Truy cập nhanh
            </h4>
            <ul className="space-y-2 font-medium text-slate-500">
              <li><Link to="/user/dashboard" className="hover:text-blue-600 transition">Bảng điều khiển</Link></li>
              <li><Link to="/user/courses" className="hover:text-blue-600 transition">Khóa học</Link></li>
              <li><Link to="/user/programs" className="hover:text-blue-600 transition">Khối lớp</Link></li>
              <li><Link to="/user/library" className="hover:text-blue-600 transition">Thư viện</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 text-xs tracking-wider uppercase">
              Hỗ trợ
            </h4>
            <ul className="space-y-2 font-medium text-slate-500">
              <li><a href="#help" className="hover:text-blue-600 transition">Trung tâm Trợ giúp</a></li>
              <li><a href="#terms" className="hover:text-blue-600 transition">Điều khoản Dịch vụ</a></li>
              <li><a href="#school" className="hover:text-blue-600 transition">Trường học</a></li>
              <li><a href="#cookies" className="hover:text-blue-600 transition">Chính sách Cookie</a></li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-800 text-xs tracking-wider uppercase">
              Liên hệ
            </h4>
            <ul className="space-y-2.5 font-medium text-slate-500">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Hà Nội, Việt Nam</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>contact@kinetic.edu.vn</span>
              </li>
            </ul>
          </div>

        </div>

        {/* ================= PHẦN DƯỚI: COPYRIGHT + NGÔN NGỮ ================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-medium text-slate-500">
          <div>
            © 2026 Kinetic Academy. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="hover:text-slate-800 transition cursor-pointer font-bold text-slate-700">Tiếng Việt</button>
            <button className="hover:text-slate-800 transition cursor-pointer">English</button>
            <button className="hover:text-slate-800 transition cursor-pointer">Khu vực bảo mật</button>
          </div>
        </div>

      </div>

      {/* ================= NÚT TRỢ LÝ HỌC TẬP AI NỔI GÓC PHẢI ================= */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-2">
        <div className="bg-amber-500 text-slate-900 font-extrabold text-[11px] px-3 py-1 rounded-md shadow-md">
          Trợ lý học tập AI
        </div>
        <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all hover:scale-105 cursor-pointer">
          <Bot className="w-6 h-6" />
        </button>
      </div>

    </footer>
  )
}