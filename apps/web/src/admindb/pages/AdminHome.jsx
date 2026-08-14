import React from "react";
import { 
  Plus, 
  TrendingUp,
  Activity,
  Database,
  Server,
  CheckCircle2,
  Eye,
  MoreVertical,
  Monitor,
  UserCheck,
  MonitorPlay,
  DollarSign,
  ChevronDown,
  Star,
  Clock,
  MessageSquare,
  FileText
} from "lucide-react";

export default function AdminHome() {
  // 1. DỮ LIỆU MÔ PHỎNG THỐNG KÊ
  const statsData = [
    { title: "Tổng học viên", subtitle: "So với tháng trước", value: "2,450", trend: "+12.5%", isUp: true, icon: Monitor, color: "text-blue-500", bgColor: "bg-blue-50", border: "border-blue-500" },
    { title: "Giảng viên đang dạy", subtitle: "Thống kê chính thức toàn sàn", value: "148", trend: "+5.2%", isUp: true, icon: UserCheck, color: "text-orange-500", bgColor: "bg-orange-50", border: "border-orange-500" },
    { title: "Lớp & khóa học mở", subtitle: "6 yêu cầu chờ duyệt", value: "320", trend: "+8.4%", isUp: true, icon: MonitorPlay, color: "text-purple-500", bgColor: "bg-purple-50", border: "border-purple-500" },
    { title: "Doanh Thu Nền Tảng", subtitle: "VNĐ / Trong 30 ngày qua", value: "128.5M", trend: "+24.1%", isUp: true, icon: DollarSign, color: "text-emerald-500", bgColor: "bg-emerald-50", border: "border-emerald-500" },
  ];

  // 2. DỮ LIỆU BẢNG KHÓA HỌC
  const recentCourses = [
    { name: "ReactJS Masterclass 2026", instructor: "Nguyễn Văn A", category: "Lập Trình Web", price: "1,250,000", status: "Đang hoạt động", statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { name: "Tiếng Anh Giao Tiếp Cơ Bản", instructor: "Trần Thị B", category: "Ngoại Ngữ", price: "850,000", status: "Chờ duyệt", statusColor: "text-blue-600 bg-blue-50 border-blue-200" },
    { name: "Phân Tích Dữ Liệu với Python", instructor: "Lê Văn C", category: "Data Science", price: "1,500,000", status: "Đang hoạt động", statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { name: "Thiết Kế Đồ Họa Cho Người Mới", instructor: "Phạm Thị D", category: "Thiết Kế", price: "950,000", status: "Tạm dừng", statusColor: "text-orange-600 bg-orange-50 border-orange-200" },
  ];

  // 3. DỮ LIỆU PHẢN HỒI
  const feedbacks = [
    { name: "Minh Hằng", initial: "M", color: "bg-blue-200 text-blue-700", text: "Khóa học rất hay và bổ ích, giảng viên nhiệt tình. Nền tảng học tập mượt mà!" },
    { name: "Tuấn Tú", img: "https://placehold.co/100x100/orange/white?text=TT", text: "Giao diện dễ sử dụng, nhưng thỉnh thoảng video load hơi chậm vào buổi tối." },
    { name: "Bảo Ngọc", img: "https://placehold.co/100x100/blue/white?text=BN", text: "Nội dung thực tế, áp dụng được ngay vào công việc. Sẽ giới thiệu cho bạn bè." },
  ];

  // 4. BOTTOM GRID DATA
  const pendingCourses = [
    { title: "Lập trình Node.js & Microservices", instructor: "ThS. Trần Hoàng Nam", date: "11/08/2026" },
    { title: "Toán Nâng Cao Khối 11", instructor: "Cô Lê Thị Hoa", date: "10/08/2026" },
    { title: "IELTS Speaking Masterclass", instructor: "Thầy John Đặng", date: "09/08/2026" },
  ];

  const activities = [
    { user: "Học viên Vừa đăng ký khóa học", target: "UI/UX Foundation", time: "2 phút trước", icon: MonitorPlay, color: "text-blue-500 bg-blue-100" },
    { user: "Hướng dẫn viên đã duyệt thành công", target: "ReactJS Master", time: "15 phút trước", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-100" },
    { user: "Lê Thảo", target: "đăng tải 5 video giảng dạy mới", time: "1 giờ trước", img: "https://placehold.co/100x100/purple/white?text=LT" },
    { user: "Quản Trị Viên", target: "thêm mã giảm giá mùa hè", time: "3 giờ trước", initial: "AD", color: "text-orange-700 bg-orange-400" },
  ];

  const systemServices = [
    { name: "Auth Microservice", desc: "Port 3001 • Node.js / Prisma", status: "Online", statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
    { name: "Database Supabase", desc: "AWS ap-southeast-1 Pooler", status: "Connected", statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
    { name: "Nginx Web Server", desc: "Alpine Linux Container", status: "Running", statusColor: "text-emerald-600 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
    { name: "Mail Server", desc: "Port 2525 SMTP Worker", status: "Error", statusColor: "text-red-600 bg-red-50 border-red-200", dot: "bg-red-500" },
  ];

  return (
    <div className="p-4 md:p-6 bg-[#F4F7FE] min-h-screen space-y-6 font-sans">
      
      {/* 1. HERO BANNER */}
      <div className="bg-[#304068] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center text-white shadow-lg">
        <div className="space-y-3 w-full md:w-2/3">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/10 border border-white/20 rounded-full">
              EDUTECH CENTRAL CONTROL
            </span>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live System</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Trung Tâm Quản Trị Hệ Thống</h1>
          <p className="text-sm text-blue-100/70 font-medium max-w-2xl leading-relaxed">
            Giám sát lưu lượng người dùng thời gian thực, kiểm duyệt nội dung khóa học và tối ưu hóa doanh thu trên toàn hệ sinh thái EduTech.
          </p>
        </div>
        <div className="mt-6 md:mt-0 flex flex-col items-end space-y-3">
          <button className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 transition-colors rounded-xl text-white text-sm font-bold flex items-center space-x-2 shadow-lg shadow-orange-500/20">
            <Plus className="w-4 h-4" />
            <span>Thêm Quản Trị Viên</span>
          </button>
          <div className="flex items-center space-x-4 text-xs font-medium text-white/60">
            <span className="flex items-center space-x-1.5"><Database className="w-3.5 h-3.5" /> <span>EU-Central-1</span></span>
            <span className="flex items-center space-x-1.5"><Server className="w-3.5 h-3.5" /> <span>App Group 2</span></span>
          </div>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, idx) => (
          <div key={idx} className={`bg-white rounded-2xl p-5 shadow-sm border-t-4 ${stat.border}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase">{stat.title}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{stat.subtitle}</p>
              </div>
              <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-black text-slate-800">{stat.value}</h2>
              <div className={`flex items-center space-x-1 text-xs font-bold ${stat.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.isUp ? <TrendingUp className="w-3.5 h-3.5" /> : null}
                <span>{stat.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Dự Báo Doanh Thu (6 Tháng)</h3>
              <p className="text-xs text-slate-500 mt-1">Dựa trên mô hình AI dự báo xu hướng đăng ký</p>
            </div>
            <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
          </div>
          
          {/* Fake Chart Graphics */}
          <div className="h-48 w-full relative flex items-end">
            <div className="absolute inset-0 flex">
              <div className="w-[60%] h-full bg-blue-50/50 rounded-tl-lg"></div>
              <div className="w-[40%] h-full bg-orange-50/50 rounded-tr-lg"></div>
            </div>
            <svg viewBox="0 0 100 40" className="w-full h-full absolute inset-0 z-10 preserve-3d" preserveAspectRatio="none">
              <path d="M0,30 L20,28 L40,22 L60,15 L80,10 L100,5" fill="none" stroke="#6366F1" strokeWidth="1.5" />
              <path d="M60,15 L100,5" fill="none" stroke="#F97316" strokeWidth="1.5" strokeDasharray="2,2" />
              {/* Dots */}
              <circle cx="20" cy="28" r="1.5" fill="white" stroke="#6366F1" strokeWidth="1" />
              <circle cx="40" cy="22" r="1.5" fill="white" stroke="#6366F1" strokeWidth="1" />
              <circle cx="60" cy="15" r="2" fill="white" stroke="#F97316" strokeWidth="1.5" />
              <circle cx="80" cy="10" r="1.5" fill="white" stroke="#F97316" strokeWidth="1" />
            </svg>
            <div className="absolute top-2 left-1/4 flex space-x-4 text-[10px] font-medium text-slate-500 bg-white/80 px-3 py-1 rounded-full shadow-sm z-20">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-indigo-500 mr-1.5"></span>Doanh thu thực tế</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-400 mr-1.5"></span>Dự báo (AI Forecast)</span>
            </div>
            <div className="w-full flex justify-between text-[10px] text-slate-400 mt-2 absolute -bottom-5 z-20">
              <span>Tháng 2</span><span>Tháng 3</span><span>Tháng 4</span><span>Tháng 5</span><span>Tháng 6 / Dự báo</span><span>Tháng 7 (Dự báo)</span>
            </div>
          </div>
        </div>

        {/* Bubble Map Placeholder */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Phân Bố Học Viên</h3>
              <p className="text-xs text-slate-500 mt-1">Lượng active user theo khu vực địa lý</p>
            </div>
            <div className="px-2 py-1 flex items-center space-x-1 border border-slate-200 rounded text-xs font-medium text-slate-600">
              <span>Toàn quốc</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
          <div className="flex-1 bg-slate-50 rounded-xl relative overflow-hidden flex items-center justify-center min-h-[160px]">
            {/* Fake Map Dots */}
            <div className="absolute w-8 h-8 bg-blue-200/50 rounded-full flex items-center justify-center bottom-6 left-1/2 -ml-4">
              <div className="w-4 h-4 bg-[#38497C] rounded-full"></div>
            </div>
            <div className="absolute w-6 h-6 bg-orange-200/50 rounded-full flex items-center justify-center top-6 left-1/3">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            </div>
            <div className="absolute w-4 h-4 bg-purple-200/50 rounded-full flex items-center justify-center right-1/4 bottom-1/3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
            
            {/* Legend */}
            <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-slate-100 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-[9px] font-bold text-slate-600"><span className="w-2 h-2 bg-orange-500 rounded-full"></span><span>Miền Bắc: 35%</span></div>
              <div className="flex items-center space-x-1.5 text-[9px] font-bold text-slate-600"><span className="w-2 h-2 bg-purple-500 rounded-full"></span><span>Miền Trung: 15%</span></div>
              <div className="flex items-center space-x-1.5 text-[9px] font-bold text-slate-600"><span className="w-2 h-2 bg-[#38497C] rounded-full"></span><span>Miền Nam: 50%</span></div>
            </div>
          </div>
        </div>

      </div>

      {/* 4. BAR CHART */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Thống kê lưu lượng truy cập</h3>
            <p className="text-xs text-slate-500 mt-1">Lượt truy cập theo các ngày trong tuần</p>
          </div>
          <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
        </div>
        <div className="h-48 w-full flex items-end justify-between px-4 pb-6 relative border-b border-slate-100 mt-8">
          {/* Y Axis Labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-slate-400 pb-6">
            <span>25,000</span><span>20,000</span><span>15,000</span><span>10,000</span><span>5,000</span><span>0</span>
          </div>
          {/* Bars */}
          <div className="w-[10%] ml-8 h-[45%] bg-[#38497C] rounded-t-sm hover:bg-blue-500 transition-colors relative group"><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">Thứ 2</span></div>
          <div className="w-[10%] h-[50%] bg-[#38497C] rounded-t-sm hover:bg-blue-500 transition-colors relative group"><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">Thứ 3</span></div>
          <div className="w-[10%] h-[55%] bg-[#38497C] rounded-t-sm hover:bg-blue-500 transition-colors relative group"><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">Thứ 4</span></div>
          <div className="w-[10%] h-[48%] bg-[#38497C] rounded-t-sm hover:bg-blue-500 transition-colors relative group"><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">Thứ 5</span></div>
          <div className="w-[10%] h-[60%] bg-[#38497C] rounded-t-sm hover:bg-blue-500 transition-colors relative group"><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">Thứ 6</span></div>
          <div className="w-[10%] h-[80%] bg-[#38497C] rounded-t-sm hover:bg-blue-500 transition-colors relative group"><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">Thứ 7</span></div>
          <div className="w-[10%] h-[95%] bg-[#38497C] rounded-t-sm hover:bg-blue-500 transition-colors relative group"><span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">Chủ nhật</span></div>
        </div>
      </div>

      {/* 5. DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 flex justify-between items-center border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Danh sách Khóa học mới nhất</h3>
          <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">Xem tất cả</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-100 font-bold uppercase">
              <tr>
                <th className="px-5 py-3">Tên Khóa Học</th>
                <th className="px-5 py-3">Giảng Viên</th>
                <th className="px-5 py-3">Danh Mục</th>
                <th className="px-5 py-3">Giá (VND)</th>
                <th className="px-5 py-3">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {recentCourses.map((course, idx) => (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors last:border-none">
                  <td className="px-5 py-4 font-bold text-slate-800">{course.name}</td>
                  <td className="px-5 py-4 font-medium">{course.instructor}</td>
                  <td className="px-5 py-4 text-slate-500">{course.category}</td>
                  <td className="px-5 py-4 font-semibold">{course.price}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md border ${course.statusColor}`}>
                      {course.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. FEEDBACKS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-bold text-slate-800">Phản hồi từ học viên</h3>
          <span className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">Xem thêm phản hồi</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {feedbacks.map((fb, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
              <div className="flex items-center space-x-3">
                {fb.img ? (
                  <img src={fb.img} alt={fb.name} className="w-10 h-10 rounded-full" />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${fb.color}`}>
                    {fb.initial}
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{fb.name}</h4>
                  <div className="flex space-x-0.5 mt-0.5">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-3 h-3 fill-orange-400 text-orange-400" />)}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">"{fb.text}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7. BOTTOM GRID (3 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DUYỆT KHÓA HỌC */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">Duyệt Khóa Học</h2>
            <span className="px-2 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-lg border border-orange-100">
              3 Yêu cầu
            </span>
          </div>
          <div className="p-5 space-y-3">
            {pendingCourses.map((course, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-slate-100">
                <div className="mb-2 sm:mb-0">
                  <h4 className="text-[13px] font-bold text-slate-800">{course.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{course.instructor}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{course.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 bg-blue-50 text-[#1658E4] hover:bg-[#1658E4] hover:text-white transition-colors text-[11px] font-bold rounded flex items-center">
                    Duyệt
                  </button>
                  <button className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-[11px] font-bold rounded flex items-center">
                    Xem
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HOẠT ĐỘNG GẦN ĐÂY */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Hoạt Động Gần Đây</h2>
          </div>
          <div className="p-5">
            <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-2">
              {activities.map((act, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-3 top-0">
                    {act.img ? (
                      <img src={act.img} alt="Avatar" className="w-6 h-6 rounded-full border-2 border-white shadow-sm" />
                    ) : act.initial ? (
                      <div className={`w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-bold ${act.color}`}>{act.initial}</div>
                    ) : (
                      <div className={`w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${act.color}`}>
                        <act.icon className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[12px] text-slate-600">
                      <span className="font-bold text-slate-800">{act.user}</span> {act.target.startsWith('đ') || act.target.startsWith('t') ? '' : ''}
                      <span className={act.target.startsWith('đ') || act.target.startsWith('t') ? '' : 'font-bold text-blue-600'}> {act.target}</span>
                    </p>
                    <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{act.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HẠ TẦNG (SERVICES) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">Hạ Tầng (Services)</h2>
            <span className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">Xem log</span>
          </div>
          <div className="p-5 space-y-3">
            {systemServices.map((service, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30">
                <div>
                  <h4 className="text-[12px] font-bold text-slate-800">{service.name}</h4>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">{service.desc}</p>
                </div>
                <div className={`flex items-center space-x-1.5 px-2 py-1 border rounded ${service.statusColor}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${service.dot} ${service.status === 'Error' ? '' : 'animate-pulse'}`}></span>
                  <span className="text-[9px] font-bold uppercase tracking-wider">{service.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}