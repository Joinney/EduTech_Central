import React from "react"
import { 
  Video, 
  Calendar, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  ChevronDown 
} from "lucide-react"

export default function Courses() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* ================= HEADER TRANG & BỘ LỌC HỌC KỲ ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Môn học của tôi
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Quản lý và theo dõi tiến độ các môn học trong kỳ.
          </p>
        </div>

        {/* Dropdown Học kỳ */}
        <div className="relative">
          <select className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:border-blue-500 cursor-pointer">
            <option>Học kỳ 1 - 2023</option>
            <option>Học kỳ 2 - 2023</option>
            <option>Học kỳ 1 - 2024</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ================= LƯỚI DANH SÁCH MÔN HỌC ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ------------ MÔN TRỌNG TÂM (RỘNG 2 CỘT): TOÁN HỌC NÂNG CAO 12 ------------ */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          
          {/* Banner hình ảnh Toán học */}
          <div className="relative h-56 bg-slate-900 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80" 
              alt="Toán Học Nâng Cao 12" 
              className="w-full h-full object-cover opacity-60"
            />
            
            {/* Logo Watermark Kinetics */}
            <div className="absolute top-4 right-4 flex items-center space-x-1.5 text-white/80 font-extrabold text-xs">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Kinetic Academy</span>
            </div>

            {/* Tiêu đề & Badge trong Banner */}
            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">
                MÔN CHUYÊN
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Toán Học Nâng Cao 12
              </h2>
            </div>
          </div>

          {/* Nội dung bên dưới Banner */}
          <div className="p-6 space-y-6">
            
            {/* Thanh tiến độ */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500 uppercase text-[10px] tracking-wider">Tiến độ hoàn thành</span>
                <span className="text-blue-600">75%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[75%]" />
              </div>
            </div>

            {/* 2 Thẻ thống kê: Bài tập & Buổi học */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Box 1: Bài tập cần làm */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 space-y-2">
                <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Bài tập cần làm</span>
                </div>
                <div className="text-2xl font-black text-red-600">3</div>
              </div>

              {/* Box 2: Buổi học tiếp theo */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 space-y-2">
                <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Buổi học tiếp theo</span>
                </div>
                <div className="text-sm font-bold text-slate-800 pt-1">
                  14:00 - Hôm nay
                </div>
              </div>

            </div>

            {/* Nút Thao tác */}
            <div className="flex items-center space-x-3 pt-2">
              <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-md shadow-blue-500/20 cursor-pointer">
                <Video className="w-4 h-4" />
                <span>Vào lớp Meet</span>
              </button>
              <button className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer">
                Chi tiết
              </button>
            </div>

          </div>
        </div>

        {/* ------------ MÔN PHỤ 1: VẬT LÝ HIỆN ĐẠI ------------ */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="relative h-44 bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500&auto=format&fit=crop&q=80" 
                alt="Vật Lý Hiện Đại" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  MÔN CƠ BẢN
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Vật Lý Hiện Đại
                </h3>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400">Tiến độ</span>
                  <span className="text-slate-600">40%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-slate-600 h-full w-[40%]" />
                </div>
              </div>

              {/* Status Note */}
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Đã nộp bài tập tuần 4</span>
              </div>
            </div>
          </div>

          <div className="p-5 pt-0">
            <button className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 font-bold rounded-xl text-xs transition cursor-pointer">
              Tiếp tục học
            </button>
          </div>
        </div>

        {/* ------------ MÔN PHỤ 2: HÓA HỌC HỮU CƠ ------------ */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="relative h-44 bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=500&auto=format&fit=crop&q=80" 
                alt="Hóa Học Hữu Cơ" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  MÔN TỰ CHỌN
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Hóa Học Hữu Cơ
                </h3>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400">Tiến độ</span>
                  <span className="text-amber-800">90%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-800 h-full w-[90%]" />
                </div>
              </div>

              {/* Warning Note */}
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-red-600 pt-1">
                <AlertCircle className="w-4 h-4" />
                <span>1 bài tập quá hạn</span>
              </div>
            </div>
          </div>

          <div className="p-5 pt-0">
            <button className="w-full py-2.5 bg-[#964B00] hover:bg-[#7a3d00] text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer">
              Làm bài tập
            </button>
          </div>
        </div>

        {/* ------------ MÔN PHỤ 3: SINH HỌC TẾ BÀO ------------ */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="relative h-44 bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=500&auto=format&fit=crop&q=80" 
                alt="Sinh Học Tế Bào" 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  MÔN CƠ BẢN
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Sinh Học Tế Bào
                </h3>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-400">Tiến độ</span>
                  <span className="text-blue-600">10%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[10%]" />
                </div>
              </div>

              {/* Calendar Note */}
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 pt-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Bắt đầu tuần sau</span>
              </div>
            </div>
          </div>

          <div className="p-5 pt-0">
            <button className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer">
              Xem giáo trình
            </button>
          </div>
        </div>

        {/* ------------ THẺ ĐĂNG KÝ MÔN MỚI ------------ */}
        <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 bg-slate-50/50 hover:bg-blue-50/20 transition flex flex-col items-center justify-center text-center space-y-3 min-h-[360px] cursor-pointer group">
          <div className="w-12 h-12 rounded-full border-2 border-slate-300 group-hover:border-blue-500 text-slate-400 group-hover:text-blue-600 flex items-center justify-center transition">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-slate-800">
              Đăng ký môn mới
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-[200px]">
              Khám phá thêm các khóa học trong học kỳ này.
            </p>
          </div>
        </div>

      </div>

    </div>
  )
}