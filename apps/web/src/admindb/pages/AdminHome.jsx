import React from "react"
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Plus
} from "lucide-react"

export default function AdminHome() {
  const stats = [
    { label: "Tổng Học Viên", value: "2,450", change: "+12% tháng này", icon: GraduationCap, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
    { label: "Giảng Viên Đang Dạy", value: "148", change: "+5 giảng viên mới", icon: Users, color: "text-orange-500", bg: "bg-orange-50 border-orange-100" },
    { label: "Lớp & Khóa Học", value: "320", change: "+18 khóa mới", icon: BookOpen, color: "text-sky-600", bg: "bg-sky-50 border-sky-100" },
    { label: "Doanh Thu Nền Tảng", value: "128,500,000 đ", change: "+24% so với quý trước", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" }
  ]

  const pendingApprovals = [
    { id: 1, title: "Lập trình Node.js & Microservices", teacher: "ThS. Trần Hoàng Nam", type: "Khóa học mở", date: "11/08/2026", status: "pending" },
    { id: 2, title: "Toán Nâng Cao Khối 11", teacher: "Cô Lê Thị Hoa", type: "Lớp Trường Chuyên", date: "10/08/2026", status: "pending" },
    { id: 3, title: "IELTS Speaking Masterclass", teacher: "Thầy John Đặng", type: "Khóa học mở", date: "09/08/2026", status: "pending" }
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Banner Chào Admin Tông Xanh Dương - Bạc - Trắng */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-500/15">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-orange-500 text-white text-[10px] font-black uppercase rounded-lg shadow-xs">
              EduTech Central Control
            </span>
            <span className="text-xs text-blue-100 font-medium">Bản cập nhật 2026</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Trung Tâm Quản Trị Hệ Thống</h1>
          <p className="text-xs text-blue-100 max-w-xl">
            Theo dõi lưu lượng người dùng, kiểm duyệt khóa học và giám sát doanh thu trên toàn nền tảng EduTech.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/30 transition-all cursor-pointer flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Thêm Quản Trị Viên</span>
          </button>
        </div>
      </div>

      {/* 4 Cards Thống Kê Chính */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3 hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <div className={`w-10 h-10 rounded-xl border ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">{stat.value}</h3>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Yêu cầu duyệt & Tình trạng dịch vụ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Yêu cầu Duyệt Khóa Học Mới</h3>
              <p className="text-xs text-slate-500">Giảng viên gửi yêu cầu phát hành lớp công khai</p>
            </div>
            <span className="px-2.5 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-xl border border-orange-200">
              {pendingApprovals.length} Yêu cầu
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingApprovals.map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{item.teacher}</span>
                    <span>•</span>
                    <span>{item.type}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors cursor-pointer border border-blue-100">
                    Duyệt
                  </button>
                  <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors cursor-pointer">
                    Xem
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Dịch Vụ Hạ Tầng (Services)</h3>
          
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex justify-between items-center">
              <div>
                <h5 className="font-bold text-slate-700">Auth Microservice</h5>
                <p className="text-[10px] text-slate-400">Port 8001 • Node.js / Prisma</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-extrabold rounded text-[10px] border border-emerald-200">
                Online
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex justify-between items-center">
              <div>
                <h5 className="font-bold text-slate-700">Database Supabase</h5>
                <p className="text-[10px] text-slate-400">AWS ap-southeast-1 Pooler</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-extrabold rounded text-[10px] border border-emerald-200">
                Connected
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex justify-between items-center">
              <div>
                <h5 className="font-bold text-slate-700">Nginx Web Server</h5>
                <p className="text-[10px] text-slate-400">Alpine Linux Container</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-extrabold rounded text-[10px] border border-emerald-200">
                Running
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}