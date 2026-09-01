/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { 
  Download, 
  Users, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Loader2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Mail, 
  Phone, 
  Trash2,
  AlertCircle
} from "lucide-react";

const API_AUTH_URL = import.meta.env.VITE_API_AUTH_URL || "http://localhost:8001/api/v1";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const getInitials = (name, role = "student") => {
    if (!name) return role === "teacher" ? "GV" : role === "admin" ? "AD" : "HV";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return parts.map(p => p[0]).join("").substring(0, 2).toUpperCase();
  };

  // 1. Tải danh sách người dùng
  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      const res = await fetch(`${API_AUTH_URL}/admin/users`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setUsers(Array.isArray(result.data) ? result.data : []);
      } else {
        setErrorMessage(result.message || "Không thể lấy danh sách người dùng từ hệ thống.");
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách người dùng:", err);
      setErrorMessage("Lỗi kết nối tới auth-service (Port 8001)!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Thay đổi vai trò
  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      await fetch(`${API_AUTH_URL}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });

      setUsers(prev => prev.map(u => 
        Number(u.id || u.id_users) === Number(userId) ? { ...u, role: newRole } : u
      ));
      alert(`Đã cập nhật quyền tài khoản thành: ${newRole.toUpperCase()}`);
    } catch (err) {
      console.error("Lỗi cập nhật vai trò:", err);
    }
  };

  // 3. Khóa / Mở khóa tài khoản
  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "LOCKED" || currentStatus === "inactive" ? "active" : "LOCKED";
    if (!window.confirm(newStatus === "LOCKED" ? "Xác nhận KHÓA tài khoản này?" : "MỞ KHÓA cho tài khoản này?")) return;

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      await fetch(`${API_AUTH_URL}/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });

      setUsers(prev => prev.map(u => 
        Number(u.id || u.id_users) === Number(userId) ? { ...u, status: newStatus } : u
      ));
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
    }
  };

  // 4. Xóa người dùng
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`XÓA VĨNH VIỄN tài khoản: ${userName} (#${userId})? Thao tác này không thể hoàn tác!`)) return;

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
      const res = await fetch(`${API_AUTH_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const result = await res.json();

      if (res.ok && result.success) {
        alert("Đã xóa người dùng thành công!");
        fetchUsers();
      } else {
        alert(result.message || "Xóa thất bại!");
      }
    } catch (err) {
      console.error("Lỗi xóa người dùng:", err);
      alert("Lỗi kết nối khi xóa tài khoản!");
    }
  };

  // 5. Lọc & Sắp xếp dữ liệu
  const filteredUsers = useMemo(() => {
    let result = users.filter((u) => {
      const name = u.fullName || u.full_name || "";
      const email = u.email || "";
      const phone = u.phone || "";
      const role = (u.role || "student").toLowerCase();
      const status = (u.status || "active").toLowerCase();

      const matchSearch = 
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phone.includes(searchTerm);

      const matchRole = roleFilter === "all" || role === roleFilter.toLowerCase();
      const matchStatus = statusFilter === "all" || 
        (statusFilter === "active" && status !== "locked" && status !== "inactive") ||
        (statusFilter === "locked" && (status === "locked" || status === "inactive"));

      return matchSearch && matchRole && matchStatus;
    });

    return result.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0);
      const dateB = new Date(b.createdAt || b.created_at || 0);
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [users, searchTerm, roleFilter, statusFilter, sortBy]);

  // Phân trang
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const stats = useMemo(() => {
    const total = users.length;
    const students = users.filter(u => (u.role || "").toLowerCase() === "student").length;
    const teachers = users.filter(u => ["teacher", "instructor"].includes((u.role || "").toLowerCase())).length;
    const locked = users.filter(u => ["locked", "inactive"].includes((u.status || "").toLowerCase())).length;
    return { total, students, teachers, locked };
  }, [users]);

  // Xuất file CSV
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      alert("Không có dữ liệu người dùng để xuất!");
      return;
    }

    const headers = ["Mã User", "Họ và tên", "Email", "Số điện thoại", "Vai trò", "Trạng thái", "Ngày tạo"];
    const rows = filteredUsers.map((u) => [
      u.id || u.id_users || "--",
      `"${u.fullName || u.full_name || "Học viên"}"`,
      `"${u.email || ""}"`,
      `"${u.phone || ""}"`,
      (u.role || "student").toUpperCase(),
      (u.status || "ACTIVE").toUpperCase(),
      `"${u.createdAt || u.created_at ? new Date(u.createdAt || u.created_at).toLocaleDateString("vi-VN") : "--"}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DanhSach_Users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 bg-[#F8F9FA] min-h-screen font-sans space-y-6 pb-16">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Cơ Sở Dữ Liệu PostgreSQL (public.users)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quản Lý Toàn Bộ Người Dùng</h1>
          <p className="text-xs text-slate-500 mt-0.5">Dữ liệu đọc trực tiếp từ bảng users trong database auth_service.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={fetchUsers}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button 
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 transition rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 border border-slate-200 shadow-2xs cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. STATS & BỘ LỌC TÌM KIẾM */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">TỔNG TÀI KHOẢN TRONG DB</h3>
              <p className="text-3xl font-black text-slate-900 mt-2">{stats.total} Người dùng</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
            <div className="p-2.5 bg-blue-50/60 rounded-xl text-center">
              <span className="text-slate-400 block font-medium">Học viên</span>
              <strong className="text-blue-700 font-bold text-sm">{stats.students}</strong>
            </div>
            <div className="p-2.5 bg-orange-50/60 rounded-xl text-center">
              <span className="text-slate-400 block font-medium">Giảng viên</span>
              <strong className="text-orange-700 font-bold text-sm">{stats.teachers}</strong>
            </div>
            <div className="p-2.5 bg-rose-50/60 rounded-xl text-center">
              <span className="text-slate-400 block font-medium">Bị khóa</span>
              <strong className="text-rose-700 font-bold text-sm">{stats.locked}</strong>
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-slate-700">
            <Filter className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Bộ lọc tìm kiếm nâng cao</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2 relative">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tìm kiếm</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tên, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Vai trò</label>
              <select 
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="student">Học viên (Student)</option>
                <option value="teacher">Giảng viên (Teacher)</option>
                <option value="admin">Quản trị viên (Admin)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Trạng thái</label>
              <select 
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="locked">Đã bị khóa</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BẢNG DANH SÁCH NGƯỜI DÙNG TỪ DATABASE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-xs font-medium">Đang tải danh sách người dùng...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200 font-bold">
                  <th className="py-3.5 px-5 rounded-l-xl">Người Dùng</th>
                  <th className="py-3.5 px-4">Liên Hệ</th>
                  <th className="py-3.5 px-4 text-center">Vai Trò</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Ngày Tạo</th>
                  <th className="py-3.5 px-5 text-center rounded-r-xl">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedUsers.map((u) => {
                  const userId = u.id || u.id_users;
                  const displayName = u.fullName || u.full_name || "Học viên";
                  const role = (u.role || "student").toLowerCase();
                  const isTeacher = role === "teacher" || role === "instructor";
                  const isAdmin = role === "admin";
                  const isLocked = u.status === "locked" || u.status === "inactive";
                  
                  // Lấy avatar thực tế từ cột avatar trong DB
                  const avatarUrl = u.avatar;

                  return (
                    <tr key={userId} className="hover:bg-slate-50/60 transition-colors">
                      {/* Cột 1: Hiển thị avatar thật từ URL Cloudinary/DB */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-10 h-10 rounded-full border border-slate-200 shadow-2xs overflow-hidden flex items-center justify-center shrink-0 bg-slate-100 relative">
                            {avatarUrl ? (
                              <img 
                                src={avatarUrl} 
                                alt={displayName} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  if (e.currentTarget.nextSibling) {
                                    e.currentTarget.nextSibling.style.display = "flex";
                                  }
                                }}
                              />
                            ) : null}

                            {/* Fallback khi không có avatar hoặc ảnh lỗi */}
                            <div 
                              className={`w-full h-full font-black text-xs items-center justify-center text-white ${
                                avatarUrl ? "hidden" : "flex"
                              } ${
                                isAdmin
                                  ? "bg-gradient-to-br from-purple-600 to-indigo-600"
                                  : isTeacher 
                                  ? "bg-gradient-to-br from-orange-500 to-amber-500" 
                                  : "bg-gradient-to-br from-blue-600 to-cyan-500"
                              }`}
                            >
                              {getInitials(displayName, role)}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{displayName}</h4>
                            <span className="text-[11px] text-slate-400 font-mono">ID: #{userId}</span>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Email & Số điện thoại */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px]">{u.email || "Chưa có email"}</span>
                          </div>
                          {u.phone && (
                            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
                              <Phone className="w-3 h-3 shrink-0" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* Cột 3: Vai trò */}
                      <td className="py-4 px-4 text-center">
                        <select
                          value={role}
                          onChange={(e) => handleRoleChange(userId, e.target.value)}
                          className={`text-xs font-extrabold rounded-xl px-3 py-1.5 border outline-none cursor-pointer transition ${
                            isAdmin
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : isTeacher
                              ? "bg-orange-50 text-orange-700 border-orange-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          <option value="student">Học viên (Student)</option>
                          <option value="teacher">Giảng viên (Teacher)</option>
                          <option value="admin">Quản trị viên (Admin)</option>
                        </select>
                      </td>

                      {/* Cột 4: Trạng thái */}
                      <td className="py-4 px-4 text-center">
                        {isLocked ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            <span>Đã khóa</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Hoạt động</span>
                          </span>
                        )}
                      </td>

                      {/* Cột 5: Ngày tạo */}
                      <td className="py-4 px-4 text-right text-slate-500 font-medium">
                        {u.createdAt || u.created_at ? new Date(u.createdAt || u.created_at).toLocaleDateString("vi-VN") : "--"}
                      </td>

                      {/* Cột 6: Thao tác */}
                      <td className="py-4 px-5 text-center flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleToggleStatus(userId, u.status)}
                          className={`p-2 rounded-xl transition cursor-pointer ${
                            isLocked ? "text-emerald-600 hover:bg-emerald-50" : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                          }`}
                          title={isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                        >
                          {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteUser(userId, displayName)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          title="Xóa người dùng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="py-16 text-center text-slate-400 bg-slate-50 text-xs space-y-1">
                <p className="font-bold text-slate-600">Không tìm thấy người dùng nào phù hợp với bộ lọc.</p>
                <p className="text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc bấm nút làm mới.</p>
              </div>
            )}
          </div>
        )}

        {/* 4. PHÂN TRANG */}
        {!isLoading && filteredUsers.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
            <p className="text-xs text-slate-500">
              Hiển thị <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-slate-800">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> trên <span className="font-bold text-slate-800">{filteredUsers.length}</span> người dùng
            </p>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition ${
                    currentPage === page
                      ? "bg-[#304068] text-white shadow-2xs"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}