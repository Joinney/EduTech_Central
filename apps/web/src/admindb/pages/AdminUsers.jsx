import React from "react";
import { 
  Download, 
  Megaphone, 
  UserPlus, 
  Users, 
  Filter, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from "lucide-react";

export default function AdminUsers() {
  // Dữ liệu mô phỏng theo đúng hình ảnh
  const usersData = [
    { 
      id: 1, 
      name: "Trần Hoàng Nam", 
      email: "nam.tran@edutech.vn", 
      role: "Giảng viên", 
      status: "Hoạt động", 
      statusColor: "text-emerald-600 bg-emerald-50",
      dotColor: "bg-emerald-500",
      joinDate: "12/05/2023", 
      lastActive: "2 giờ trước", 
      ip: "192.168.1.1 (Web)",
      avatar: "HN",
      avatarColor: "bg-blue-200 text-blue-700"
    },
    { 
      id: 2, 
      name: "Nguyễn Thị Mai", 
      email: "mai.nguyen@gmail.com", 
      role: "Học viên", 
      status: "Hoạt động", 
      statusColor: "text-emerald-600 bg-emerald-50",
      dotColor: "bg-emerald-500",
      joinDate: "20/08/2023", 
      lastActive: "Hôm qua, 15:30", 
      ip: "14.248.xxx (App)",
      img: "https://i.pravatar.cc/150?u=mai"
    },
    { 
      id: 3, 
      name: "Lê Văn Đức", 
      email: "duc.le.99@yahoo.com", 
      role: "Học viên", 
      status: "Đã khóa", 
      statusColor: "text-red-600 bg-red-50",
      dotColor: "bg-red-500",
      joinDate: "05/01/2024", 
      lastActive: "3 ngày trước", 
      ip: "115.79.xxx (Web)",
      avatar: "LD",
      avatarColor: "bg-slate-200 text-slate-600"
    },
    { 
      id: 4, 
      name: "Cô Lê Thị Hoa", 
      email: "hoa.le@math.edu.vn", 
      role: "Giảng viên", 
      status: "Hoạt động", 
      statusColor: "text-emerald-600 bg-emerald-50",
      dotColor: "bg-emerald-500",
      joinDate: "15/02/2022", 
      lastActive: "Vừa xong", 
      ip: "192.168.1.5 (Web)",
      avatar: "TH",
      avatarColor: "bg-orange-200 text-orange-700"
    },
  ];

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen font-sans space-y-6">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Quản lý người dùng</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý danh sách, phân quyền và trạng thái tài khoản hệ thống.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 transition-colors rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2 border border-slate-200 shadow-sm">
            <Download className="w-4 h-4" />
            <span>Xuất danh sách</span>
          </button>
          <button className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 transition-colors rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2 border border-slate-200 shadow-sm">
            <Megaphone className="w-4 h-4" />
            <span>Gửi thông báo hàng loạt</span>
          </button>
          <button className="px-4 py-2.5 bg-[#FF8C00] hover:bg-[#e67e00] transition-colors rounded-lg text-sm font-medium text-white flex items-center gap-2 shadow-md">
            <UserPlus className="w-4 h-4" />
            <span>Thêm người dùng mới</span>
          </button>
        </div>
      </div>

      {/* 2. STATS & FILTERS GRID */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Total Users Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm min-w-[280px]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">TỔNG NGƯỜI DÙNG</h3>
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <h2 className="text-4xl font-bold text-slate-800">2,598</h2>
            <div className="flex items-center space-x-1.5 text-sm font-bold text-emerald-500 mt-3">
              <TrendingUp className="w-4 h-4" />
              <span>+12% <span className="font-medium text-slate-500">tháng này</span></span>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex-1">
          <div className="flex items-center gap-2 mb-4 text-slate-600">
            <Filter className="w-4 h-4" />
            <h3 className="text-sm font-semibold">Bộ lọc tìm kiếm nâng cao</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Vai trò */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Vai trò</label>
              <div className="relative">
                <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-2.5 outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                  <option>Tất cả vai trò</option>
                  <option>Học viên</option>
                  <option>Giảng viên</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            {/* Trạng thái */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Trạng thái</label>
              <div className="relative">
                <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-2.5 outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                  <option>Tất cả trạng thái</option>
                  <option>Hoạt động</option>
                  <option>Đã khóa</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            {/* Sắp xếp theo */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Sắp xếp theo</label>
              <div className="relative">
                <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-2.5 outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                  <option>Ngày tham gia (Mới nhất)</option>
                  <option>Ngày tham gia (Cũ nhất)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            {/* Thời gian hoạt động */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Thời gian hoạt động</label>
              <div className="relative">
                <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-2.5 outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                  <option>Tất cả</option>
                  <option>Hôm nay</option>
                  <option>Tuần này</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            {/* Thiết bị đăng nhập */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Thiết bị đăng nhập</label>
              <div className="relative">
                <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-2.5 outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                  <option>Tất cả thiết bị</option>
                  <option>Web</option>
                  <option>App (Mobile)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            {/* Xác thực */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1.5">Xác thực</label>
              <div className="relative">
                <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-2.5 outline-none focus:border-indigo-500 transition-colors cursor-pointer">
                  <option>Tất cả</option>
                  <option>Đã xác thực email</option>
                  <option>Chưa xác thực</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. USERS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Người dùng</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Vai trò (Phân quyền nhanh)</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Ngày tham gia</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Hoạt động cuối</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersData.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Cột 1: Thông tin người dùng */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.img ? (
                        <img src={user.img} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${user.avatarColor}`}>
                          {user.avatar}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Cột 2: Vai trò */}
                  <td className="px-6 py-4">
                    <div className="relative inline-block w-[120px]">
                      <select 
                        defaultValue={user.role}
                        className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-2 outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="Học viên">Học viên</option>
                        <option value="Giảng viên">Giảng viên</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>

                  {/* Cột 3: Trạng thái */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${user.statusColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.dotColor}`}></span>
                      {user.status}
                    </span>
                  </td>

                  {/* Cột 4: Ngày tham gia */}
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {user.joinDate}
                  </td>

                  {/* Cột 5: Hoạt động cuối */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-700">{user.lastActive}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">IP: {user.ip}</p>
                  </td>

                  {/* Cột 6: Thao tác */}
                  <td className="px-6 py-4 text-right">
                    {/* Chừa trống phần thao tác hoặc thêm icon 3 chấm tuỳ ý */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white rounded-b-2xl">
          <p className="text-sm text-slate-500">
            Hiển thị <span className="font-bold text-slate-700">1</span> đến <span className="font-bold text-slate-700">10</span> của <span className="font-bold text-slate-700">2,598</span> kết quả
          </p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors">
              3
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-slate-400">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors">
              260
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}