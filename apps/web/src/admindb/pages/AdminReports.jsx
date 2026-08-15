import React, { useState } from "react";
import { 
  SlidersHorizontal, 
  FileText, 
  Table, 
  TrendingUp, 
  Wallet,
  AlertCircle,
  AlertTriangle,
  Info,
  Star,
  ChevronDown,
  ArrowRight
} from "lucide-react";

export default function AdminReports() {
  const [chartPeriod, setChartPeriod] = useState("Tháng");

  // Dữ liệu Top Giảng viên
  const topInstructors = [
    { name: "Trần Hoàng Nam", subject: "Lập trình", rating: 4.9, trend: "+12%", avatar: "TN", color: "bg-[#38497C] text-white", trendColor: "text-emerald-600 bg-emerald-50" },
    { name: "John Đặng", subject: "Ngoại ngữ", rating: 4.8, trend: "+8%", avatar: "JD", color: "bg-orange-500 text-white", trendColor: "text-emerald-600 bg-emerald-50" },
    { name: "Lê Thị Hoa", subject: "Toán học", rating: 4.8, trend: "+2%", avatar: "LH", color: "bg-slate-200 text-slate-600", trendColor: "text-slate-600 bg-slate-100" },
  ];

  // Dữ liệu Báo cáo hoàn thành khóa học
  const courseCompletion = [
    { title: "ReactJS Basic to Advanced", instructor: "ThS. Trần Hoàng Nam", progress: 85, trend: "+5.2%" },
    { title: "UI/UX Design Fundamentals", instructor: "TS. Vũ Đức Minh", progress: 72, trend: "+2.1%" },
    { title: "English for IT Professionals", instructor: "Thầy John Đặng", progress: 94, trend: "+8.4%" },
  ];

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen font-sans space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Báo cáo & Cảnh báo</h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi hiệu suất hệ thống, doanh thu và các vấn đề cần xử lý.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 transition-colors rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2 border border-slate-200 shadow-sm">
            <SlidersHorizontal className="w-4 h-4" />
            <span>Tạo báo cáo tùy chỉnh</span>
          </button>
          <button className="px-4 py-2 bg-white hover:bg-slate-50 transition-colors rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2 border border-slate-200 shadow-sm">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Xuất PDF</span>
          </button>
          <button className="px-4 py-2 bg-[#FF8C00] hover:bg-[#e67e00] transition-colors rounded-lg text-sm font-medium text-white flex items-center gap-2 shadow-md">
            <Table className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* TOP GRID: CHART & ALERTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Doanh thu nền tảng (Chart) */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-base font-bold text-slate-800">Doanh thu nền tảng</h2>
              <p className="text-xs text-slate-500 mt-1">So sánh 6 tháng gần nhất (VNĐ)</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#38497C]"></div>Năm nay</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-slate-300"></div>Năm trước</span>
              </div>
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button 
                  onClick={() => setChartPeriod("Tháng")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${chartPeriod === "Tháng" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >Tháng</button>
                <button 
                  onClick={() => setChartPeriod("Quý")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${chartPeriod === "Quý" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >Quý</button>
              </div>
            </div>
          </div>
          
          {/* Fake SVG Chart */}
          <div className="flex-1 relative w-full min-h-[250px] flex flex-col justify-end">
            <svg viewBox="0 0 600 200" className="w-full h-full absolute inset-0 preserve-3d" preserveAspectRatio="none">
              {/* Background gradient for Năm nay */}
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38497C" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#38497C" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,150 C50,150 80,120 120,120 C180,120 220,50 240,50 C300,50 340,40 360,40 C420,40 450,-20 480,-20 C540,-20 580,-80 600,-80 L600,200 L0,200 Z" fill="url(#blueGradient)" transform="translate(0, 80) scale(1, 0.6)" />
              
              {/* Năm trước (Dashed gray line) */}
              <path d="M0,180 C50,180 80,160 120,160 C180,160 220,110 240,110 C300,110 340,100 360,100 C420,100 450,40 480,40 C540,40 580,0 600,0" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6,6" />
              
              {/* Năm nay (Solid blue line) */}
              <path d="M0,150 C50,150 80,120 120,120 C180,120 220,50 240,50 C300,50 340,40 360,40 C420,40 450,-20 480,-20 C540,-20 580,-80 600,-80" fill="none" stroke="#38497C" strokeWidth="3" />
              
              {/* Data points */}
              <circle cx="120" cy="120" r="4" fill="white" stroke="#38497C" strokeWidth="2" />
              <circle cx="240" cy="50" r="4" fill="white" stroke="#38497C" strokeWidth="2" />
              <circle cx="360" cy="40" r="4" fill="white" stroke="#38497C" strokeWidth="2" />
              <circle cx="480" cy="-20" r="4" fill="white" stroke="#38497C" strokeWidth="2" />
              <circle cx="600" cy="-80" r="4" fill="white" stroke="#38497C" strokeWidth="2" />
            </svg>
            
            {/* X-Axis Labels */}
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-2 z-10 mt-auto pt-4 border-t border-slate-100 border-dashed">
              <span>Th 3</span>
              <span>Th 4</span>
              <span>Th 5</span>
              <span>Th 6</span>
              <span>Th 7</span>
              <span className="text-[#38497C] font-bold">Th 8</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REVENUE CARD & ALERTS */}
        <div className="space-y-6">
          
          {/* Total Revenue Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng doanh thu (Tháng)</h3>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#38497C]">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-slate-800">128,500,000 đ</h2>
            <div className="flex items-center space-x-1.5 text-xs font-semibold mt-3">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-500">+24%</span>
              <span className="text-slate-500">so với tháng trước</span>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex-1">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <AlertCircle className="w-5 h-5" />
                <h3>Cảnh báo hệ thống</h3>
              </div>
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">3 Mới</span>
            </div>

            <div className="space-y-3">
              {/* Alert 1 */}
              <div className="border-l-[3px] border-red-500 bg-red-50/50 rounded-r-xl p-3">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs">
                   <AlertCircle fill="currentColor" className="text-white w-3.5 h-3.5 rounded-full bg-red-500" />
                    Quá tải Server Database
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">10 phút trước</span>
                </div>
                <p className="text-[11px] text-slate-600 pl-5 leading-relaxed">
                  CPU của Supabase cluster đạt 95% trong 5 phút. Yêu cầu kiểm tra các query chậm.
                </p>
              </div>
              
              {/* Alert 2 */}
              <div className="border-l-[3px] border-orange-500 bg-orange-50/50 rounded-r-xl p-3">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-1.5 text-orange-600 font-bold text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Phát hiện Spam Review
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">2 giờ trước</span>
                </div>
                <p className="text-[11px] text-slate-600 pl-5 leading-relaxed">
                  Khóa học "ReactJS Basic" nhận 50 đánh giá 1 sao từ các IP khả nghi.
                </p>
              </div>

              {/* Alert 3 */}
              <div className="border-l-[3px] border-[#38497C] bg-slate-50 rounded-r-xl p-3">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-1.5 text-[#38497C] font-bold text-xs">
                    <Info fill="currentColor" className="text-white w-3.5 h-3.5 rounded-full bg-[#38497C]" />
                    Backup hoàn tất
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">02:00 AM</span>
                </div>
                <p className="text-[11px] text-slate-600 pl-5 leading-relaxed">
                  Hệ thống đã tự động sao lưu dữ liệu ngày 12/08 thành công.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM GRID: TOP INSTRUCTORS & COMPLETION REPORT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Top 5 Instructors */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800">Top 5 Giảng viên</h2>
          <p className="text-xs text-slate-500 mt-1 mb-5">Hiệu suất cao nhất tháng này</p>
          
          <div className="space-y-4">
            {topInstructors.map((inst, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${inst.color}`}>
                    {inst.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{inst.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{inst.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-xs font-bold text-slate-800">
                    {inst.rating} <Star className="w-3 h-3 text-orange-400 fill-current" />
                  </div>
                  <div className={`mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${inst.trendColor}`}>
                    {inst.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Completion Report */}
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Báo cáo Hoàn thành Khóa học</h2>
              <p className="text-xs text-slate-500 mt-1">Thống kê tỷ lệ học viên hoàn thành chứng chỉ theo từng khóa.</p>
            </div>
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                Tất cả danh mục <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
              <thead className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
                <tr>
                  <th className="pb-3 pr-4">Khóa học</th>
                  <th className="pb-3 px-4">Giảng viên</th>
                  <th className="pb-3 px-4">Hoàn thành</th>
                  <th className="pb-3 pl-4 text-right">Xu hướng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {courseCompletion.map((course, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pr-4 font-bold text-slate-800 text-xs">{course.title}</td>
                    <td className="py-4 px-4 text-xs font-medium text-slate-600">{course.instructor}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#38497C] rounded-full" style={{ width: `${course.progress}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-700">{course.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-xs font-bold text-emerald-500">
                        <TrendingUp className="w-3 h-3" /> {course.trend}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-right">
            <button className="text-xs font-bold text-[#38497C] hover:text-blue-700 flex items-center gap-1.5 ml-auto">
              Xem toàn bộ danh sách <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}