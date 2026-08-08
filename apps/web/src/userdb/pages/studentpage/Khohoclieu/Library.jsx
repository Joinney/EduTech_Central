import React from "react"
import { 
  Upload, 
  Plus, 
  Sparkles, 
  Folder, 
  ChevronRight, 
  FileText, 
  PlayCircle, 
  Box, 
  Users, 
  FileCode2, 
  Pencil, 
  UserPlus, 
  CloudUpload,
  ArrowRight
} from "lucide-react"

export default function Library() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* Page Header + Top Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản lý Khóa học & Học liệu AI
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Tổng quan hoạt động giảng dạy và quản lý tài nguyên học tập.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Tải tài liệu lên</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-blue-500/20 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Tạo khóa học mới</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Content (2/3) + Right Widgets (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Content Generator Banner */}
          <div className="relative rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden">
            <div className="space-y-2 max-w-md relative z-10">
              <div className="flex items-center space-x-2 font-extrabold text-base">
                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
                <span>AI Content Generator</span>
              </div>
              <p className="text-xs leading-relaxed font-medium text-blue-50">
                Tự động tạo dàn ý bài giảng, câu hỏi trắc nghiệm và tóm tắt tài liệu chỉ với vài từ khóa. Tiết kiệm 60% thời gian soạn bài.
              </p>
            </div>

            <button className="relative z-10 shrink-0 flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer self-start sm:self-center">
              <span>Soạn bài ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Khóa học đang giảng dạy */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">Khóa học đang giảng dạy</h3>
              <a href="#all" className="text-xs font-bold text-blue-600 hover:underline">
                Xem tất cả &gt;
              </a>
            </div>

            <div className="space-y-4">
              
              {/* Course Item 1 */}
              <div className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="relative w-full md:w-44 h-28 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                  <img 
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=80" 
                    alt="Web Frontend" 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    Lập trình
                  </span>
                </div>

                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-800 truncate">
                      Lập trình Web Frontend Nâng cao
                    </h4>
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded shrink-0">
                      ĐANG DIỄN RA
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 font-medium">
                    Khóa học chuyên sâu về ReactJS, state management và tối ưu hóa hiệu suất cho ứng dụng web.
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-slate-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>124 Học viên</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>8/12 Bài giảng</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition cursor-pointer">
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Item 2 */}
              <div className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="relative w-full md:w-44 h-28 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                  <img 
                    src="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=500&auto=format&fit=crop&q=80" 
                    alt="UI/UX Design" 
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    Thiết kế
                  </span>
                </div>

                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-800 truncate">
                      UI/UX Design Masterclass
                    </h4>
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded shrink-0">
                      BẢN NHÁP
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 font-medium">
                    Nắm vững quy trình thiết kế lấy người dùng làm trung tâm, từ wireframe đến prototype...
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-slate-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>-- Học viên</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>3/10 Bài giảng</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition cursor-pointer">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Kho Học liệu & Upload Box */}
        <div className="space-y-6">
          
          {/* Kho Học liệu Storage Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
                <Folder className="w-5 h-5 text-blue-600" />
                <span>Kho Học liệu</span>
              </div>
              <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Storage Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Dung lượng lưu trữ</span>
                <span className="text-blue-600">45GB / 100GB</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[45%]" />
              </div>
            </div>

            {/* Folder Items */}
            <div className="space-y-2 pt-2">
              
              {/* Item 1: PDF */}
              <div className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 transition flex items-center justify-between cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Tài liệu PDF</h5>
                    <p className="text-[10px] text-slate-400 font-medium">120 tệp • 1.2GB</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Item 2: Video */}
              <div className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 transition flex items-center justify-between cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Video Bài giảng</h5>
                    <p className="text-[10px] text-slate-400 font-medium">45 tệp • 42GB</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Item 3: SCORM */}
              <div className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 transition flex items-center justify-between cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-500 flex items-center justify-center shrink-0">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">Gói SCORM</h5>
                    <p className="text-[10px] text-slate-400 font-medium">12 tệp • 1.8GB</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>

            </div>
          </div>

          {/* Drag & Drop File Area */}
          <div className="border-2 border-dashed border-slate-200/80 hover:border-blue-400 rounded-2xl p-8 bg-white hover:bg-blue-50/20 transition text-center space-y-3 cursor-pointer group">
            <div className="w-12 h-12 bg-slate-100 group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 rounded-full flex items-center justify-center mx-auto transition">
              <CloudUpload className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-bold text-sm text-slate-800">Kéo thả tệp vào đây</h5>
              <p className="text-xs text-slate-400 font-medium mt-0.5">hoặc nhấn để duyệt tệp</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}