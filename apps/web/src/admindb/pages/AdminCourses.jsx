import React, { useState } from "react";
import { 
  Code, 
  Sigma, 
  Globe, 
  ExternalLink, 
  Play, 
  CheckCircle2, 
  Edit3, 
  XCircle,
  Cpu,
  ChevronDown
} from "lucide-react";

export default function AdminCourses() {
  const [activeFilter, setActiveFilter] = useState("Chờ duyệt");

  const filters = [
    { name: "Chờ duyệt", count: 12 },
    { name: "Đang xem xét", count: 3 },
    { name: "Yêu cầu chỉnh sửa", count: 5 },
    { name: "Từ chối", count: 0 },
    { name: "Đã duyệt", count: 0 },
  ];

  const courses = [
    {
      id: 1,
      category: "LẬP TRÌNH",
      categoryColor: "text-orange-600 bg-orange-100",
      time: "11/08/2026 14:30",
      title: "Lập trình Node.js & Microservices Kiến...",
      instructor: "ThS. Trần Hoàng Nam",
      instructorAvatar: "HN",
      price: "1,200,000 đ",
      duration: "24 giờ",
      aiScore: "85/100",
      aiScoreColor: "text-orange-500",
      icon: Code,
      isActive: true, // Thẻ đang được chọn
    },
    {
      id: 2,
      category: "TOÁN HỌC",
      categoryColor: "text-yellow-600 bg-yellow-100",
      time: "10/08/2026 09:15",
      title: "Toán Nâng Cao Khối 11 - Luyện thi...",
      instructor: "Cô Lê Thị Hoa",
      instructorAvatar: "LH",
      price: "850,000 đ",
      duration: "32 giờ",
      aiScore: "92/100",
      aiScoreColor: "text-orange-500",
      icon: Sigma,
      isActive: false,
    },
    {
      id: 3,
      category: "NGOẠI NGỮ",
      categoryColor: "text-indigo-600 bg-indigo-100",
      time: "09/08/2026 16:45",
      title: "IELTS Speaking Masterclass 7.5+",
      instructor: "Thầy John Đặng",
      instructorAvatar: "JD",
      price: "1,500,000 đ",
      duration: "18 giờ",
      aiScore: "65/100",
      aiScoreColor: "text-red-500", // Điểm thấp màu đỏ
      icon: Globe,
      isActive: false,
    },
  ];

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1e293b]">Kiểm duyệt khóa học</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý và phê duyệt các khóa học mới từ giảng viên.</p>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* ================= LEFT COLUMN: COURSE LIST ================= */}
        <div className="xl:col-span-7 space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-2">Quy trình:</span>
            {filters.map((filter) => (
              <button
                key={filter.name}
                onClick={() => setActiveFilter(filter.name)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === filter.name
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
                }`}
              >
                {filter.name} {filter.count > 0 && `(${filter.count})`}
              </button>
            ))}
            
            <div className="ml-auto relative">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100">
                Mới nhất <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Course Cards List */}
          <div className="space-y-4">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className={`relative flex gap-4 p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
                  course.isActive 
                    ? "border-indigo-300 shadow-md shadow-indigo-100/50 ring-1 ring-indigo-300" 
                    : "border-slate-100 shadow-sm hover:border-slate-300"
                }`}
              >
                {/* Active Badge */}
                {course.isActive && (
                  <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    CHỜ DUYỆT
                  </div>
                )}

                {/* Thumbnail Placeholder */}
                <div className="w-32 h-24 shrink-0 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500">
                  <course.icon className="w-8 h-8 opacity-50" />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase ${course.categoryColor}`}>
                        {course.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Gửi lúc: {course.time}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-800 truncate pr-16">{course.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[8px] font-bold">
                        {course.instructorAvatar}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{course.instructor}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-3">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Giá</p>
                      <p className="text-sm font-bold text-slate-800">{course.price}</p>
                    </div>
                    <div className="border-l border-slate-200 pl-6">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Thời lượng</p>
                      <p className="text-sm font-bold text-slate-800">{course.duration}</p>
                    </div>
                    <div className="border-l border-slate-200 pl-6 flex items-center gap-1.5">
                      <Cpu className={`w-4 h-4 ${course.aiScoreColor}`} />
                      <span className={`text-sm font-bold ${course.aiScoreColor}`}>AI Score: {course.aiScore}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: PREVIEW & ACTIONS ================= */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Preview Panel */}
          <div className="bg-[#EAEBED] rounded-2xl p-5 border border-slate-200/60 shadow-sm relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800">Xem trước nội dung</h3>
              <ExternalLink className="w-4 h-4 text-slate-500 cursor-pointer hover:text-slate-800" />
            </div>

            {/* Video Player Mockup */}
            <div className="aspect-video bg-black rounded-xl relative overflow-hidden group cursor-pointer shadow-md mb-4">
              {/* Ảnh nền video giả lập */}
              <img 
                src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Video thumbnail" 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40 group-hover:bg-white/30 transition-colors">
                  <Play className="w-5 h-5 text-white ml-1" fill="currentColor" />
                </div>
              </div>
            </div>

            <div className="text-center">
              <h4 className="font-bold text-slate-800">Bài 1: Tổng quan về Microservices</h4>
              <div className="flex justify-center gap-3 mt-3">
                <button className="px-4 py-1.5 bg-white text-xs font-semibold text-slate-600 rounded-md shadow-sm border border-slate-200 hover:bg-slate-50">
                  Syllabus
                </button>
                <button className="px-4 py-1.5 bg-white text-xs font-semibold text-slate-600 rounded-md shadow-sm border border-slate-200 hover:bg-slate-50">
                  Tài liệu đính kèm
                </button>
              </div>
            </div>
          </div>

          {/* History & Actions Panel */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-5">Lịch sử & Hành động</h3>
            
            {/* Timeline */}
            <div className="relative pl-3 border-l-2 border-slate-100 space-y-6 mb-6">
              {/* Item 1 */}
              <div className="relative">
                <div className="absolute -left-[17px] top-1 w-3 h-3 bg-[#38497C] rounded-full ring-4 ring-white"></div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400">11/08/2026 14:30</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">Khóa học được gửi duyệt</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Bởi: ThS. Trần Hoàng Nam</p>
                </div>
              </div>
              
              {/* Item 2 */}
              <div className="relative">
                <div className="absolute -left-[17px] top-1 w-3 h-3 bg-[#FCD34D] rounded-full ring-4 ring-white"></div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400">12/08/2026 09:00</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">AI Đánh giá chất lượng</p>
                  <div className="mt-2 p-3 bg-slate-100 rounded-lg text-xs text-slate-600 leading-relaxed border border-slate-200/60">
                    Điểm: 85/100. Cấu trúc bài giảng tốt. Cần bổ sung thêm bài tập thực hành ở chương 3.
                  </div>
                </div>
              </div>
            </div>

            {/* Action Form */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Ghi chú kiểm duyệt (Nội bộ / Gửi Giảng viên)</label>
                <textarea 
                  rows={2}
                  className="w-full mt-1.5 p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:bg-white transition-colors resize-none"
                  placeholder="Nhập lý do từ chối hoặc yêu cầu chỉnh sửa..."
                ></textarea>
              </div>

              <button className="w-full py-2.5 bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-colors">
                <CheckCircle2 className="w-4 h-4" />
                Phê duyệt khóa học
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                  <Edit3 className="w-4 h-4" />
                  Yêu cầu sửa
                </button>
                <button className="py-2 bg-white hover:bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                  <XCircle className="w-4 h-4" />
                  Từ chối
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}