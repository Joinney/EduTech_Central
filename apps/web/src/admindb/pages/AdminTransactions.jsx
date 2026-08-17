/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react"
import { 
  CreditCard, 
  Search, 
  Download, 
  Loader2, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  DollarSign,
  BookOpen,
  Calendar,
  Building2,
  Receipt,
  UserCheck,
  Tag,
  ArrowUpDown,
  RefreshCw
} from "lucide-react"
import { paymentApi } from "../../api/payment.api"

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [courseFilter, setCourseFilter] = useState("all")
  const [sortBy, setSortBy] = useState("time_desc")

  // Tải danh sách giao dịch từ payment-service (Port 8004)
  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const data = await paymentApi.getAllTransactions()
      setTransactions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Lỗi tải lịch sử giao dịch:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  // Danh sách các khóa học duy nhất để đưa vào Dropdown lọc
  const uniqueCourses = useMemo(() => {
    const map = new Map()
    transactions.forEach(t => {
      if (t.course_id && t.course_title) {
        map.set(Number(t.course_id), t.course_title)
      }
    })
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }))
  }, [transactions])

  // Lọc và sắp xếp dữ liệu
  const filteredList = useMemo(() => {
    let result = transactions.filter((t) => {
      const matchSearch = 
        (t.txn_ref || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.user_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.user_email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.course_title || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchStatus = statusFilter === "all" || t.status === statusFilter
      const matchCourse = courseFilter === "all" || Number(t.course_id) === Number(courseFilter)

      return matchSearch && matchStatus && matchCourse
    })

    return result.sort((a, b) => {
      if (sortBy === "amount_desc") return (Number(b.amount) || 0) - (Number(a.amount) || 0)
      if (sortBy === "amount_asc") return (Number(a.amount) || 0) - (Number(b.amount) || 0)
      if (sortBy === "time_asc") return new Date(a.created_at) - new Date(b.created_at)
      return new Date(b.created_at) - new Date(a.created_at)
    })
  }, [transactions, searchTerm, statusFilter, courseFilter, sortBy])

  // Thống kê doanh thu theo bộ lọc đang chọn
  const stats = useMemo(() => {
    const totalTx = filteredList.length
    const successList = filteredList.filter(t => t.status === "SUCCESS")
    const pendingList = filteredList.filter(t => t.status === "PENDING")
    const failedList = filteredList.filter(t => t.status === "FAILED")

    const totalRevenue = successList.reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
    const successRate = totalTx > 0 ? Math.round((successList.length / totalTx) * 100) : 0

    return { 
      totalTx, 
      totalRevenue, 
      successCount: successList.length, 
      pendingCount: pendingList.length,
      failedCount: failedList.length,
      successRate 
    }
  }, [filteredList])

  // Xuất file báo cáo tài chính CSV
  const handleExportCSV = () => {
    if (filteredList.length === 0) {
      alert("Không có dữ liệu giao dịch để xuất file!")
      return
    }

    const headers = ["STT", "Mã giao dịch VNPay", "Mã SV", "Tên sinh viên", "Email", "Khóa học", "Số tiền (VNĐ)", "Ngân hàng", "Trạng thái", "Thời gian"]
    const rows = filteredList.map((tx, idx) => [
      idx + 1,
      tx.txn_ref,
      tx.user_id,
      `"${tx.user_name}"`,
      `"${tx.user_email || ""}"`,
      `"${tx.course_title}"`,
      tx.amount,
      tx.bank_code || "NCB",
      tx.status === "SUCCESS" ? "Thành công" : tx.status === "PENDING" ? "Chờ xử lý" : "Thất bại",
      `"${new Date(tx.created_at).toLocaleString("vi-VN")}"`
    ])

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `BaoCao_DoanhThu_VNPay_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fadeIn font-sans pb-16">
      
      {/* 1. HEADER & THỐNG KÊ DOANH THU */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
              <Receipt className="w-4 h-4" />
              <span>Cổng Thanh Toán & Tài Chính Nền Tảng</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Quản Lý Giao Dịch & Thu Học Phí (VNPay)
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Theo dõi biến động dòng tiền, tỷ lệ chuyển đổi và quản lý đối soát học phí theo từng khóa học.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={fetchTransactions}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Báo Cáo Doanh Thu (Excel/CSV)</span>
            </button>
          </div>
        </div>

        {/* 4 Thẻ chỉ số tài chính */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Tổng Doanh Thu Thực Nhận</span>
            <p className="text-2xl font-black text-emerald-900">{stats.totalRevenue.toLocaleString("vi-VN")} đ</p>
            <span className="text-[10px] text-emerald-600 font-bold">Từ {stats.successCount} giao dịch thành công</span>
          </div>

          <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Tổng Số Giao Dịch</span>
            <p className="text-2xl font-black text-blue-900">{stats.totalTx} đơn</p>
            <span className="text-[10px] text-slate-500">{stats.pendingCount} đang chờ • {stats.failedCount} thất bại</span>
          </div>

          <div className="p-4 bg-purple-50/60 border border-purple-200/80 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Tỷ Lệ Hoàn Tất Đơn</span>
            <p className="text-2xl font-black text-purple-900">{stats.successRate}%</p>
            <span className="text-[10px] text-purple-600 font-medium">Hiệu suất chuyển đổi thanh toán</span>
          </div>

          <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Đơn Hàng Chờ Xử Lý</span>
            <p className="text-2xl font-black text-amber-900">{stats.pendingCount} đơn</p>
            <span className="text-[10px] text-amber-700 font-medium">Giao dịch chưa hoàn tất VNPay</span>
          </div>
        </div>
      </div>

      {/* 2. BẢNG DỮ LIỆU & BỘ LỌC ĐA CHIỀU */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
        
        {/* Thanh Tìm Kiếm & Lọc Theo Lớp / Trạng Thái / Sắp Xếp */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã GD, tên học viên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 🎯 LỌC THEO KHÓA HỌC / LỚP */}
            <div className="flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer max-w-[200px] truncate"
              >
                <option value="all">Tất cả lớp học ({uniqueCourses.length})</option>
                {uniqueCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc Trạng Thái */}
            <div className="flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="SUCCESS">Thành công (SUCCESS)</option>
                <option value="PENDING">Chờ xử lý (PENDING)</option>
                <option value="FAILED">Thất bại / Hủy (FAILED)</option>
              </select>
            </div>

            {/* Sắp Xếp */}
            <div className="flex items-center space-x-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="time_desc">Mới nhất trước</option>
                <option value="time_asc">Cũ nhất trước</option>
                <option value="amount_desc">Số tiền: Cao → Thấp</option>
                <option value="amount_asc">Số tiền: Thấp → Cao</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bảng Dữ Liệu Giao Dịch */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
            <p className="text-xs font-medium">Đang tải dữ liệu giao dịch...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80">
                  <th className="py-3.5 px-4 font-bold rounded-l-xl">Mã Giao Dịch</th>
                  <th className="py-3.5 px-4 font-bold">Học Viên Thanh Toán</th>
                  <th className="py-3.5 px-4 font-bold">Khóa Học Mở Khóa</th>
                  <th className="py-3.5 px-4 font-bold text-right">Số Tiền (VNĐ)</th>
                  <th className="py-3.5 px-4 font-bold text-center">Cổng / Bank</th>
                  <th className="py-3.5 px-4 font-bold text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 font-bold text-right rounded-r-xl">Thời Gian GD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((tx, idx) => {
                  const isSuccess = tx.status === "SUCCESS"
                  const isPending = tx.status === "PENDING"
                  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(tx.user_name || "HV")}&background=random`

                  return (
                    <tr key={tx.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      {/* Mã Giao Dịch */}
                      <td className="py-4 px-4 font-mono font-bold text-blue-600">
                        {tx.txn_ref}
                      </td>

                      {/* Cột Học Viên (Kèm Avatar thật) */}
<td className="py-4 px-4">
  <div className="flex items-center space-x-3">
    <img
      src={
        tx.user_avatar || 
        tx.avatar || 
        tx.avatar_url || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(tx.user_name || "HV")}&background=random`
      }
      alt={tx.user_name}
      className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0"
      onError={(e) => {
        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tx.user_name || "HV")}&background=random`;
      }}
    />
    <div>
      <h4 className="font-extrabold text-slate-900 text-sm leading-tight">
        {tx.user_name}
      </h4>
      <span className="text-[11px] text-slate-400 font-mono">
        {tx.user_email || `Mã SV: #${tx.user_id}`}
      </span>
    </div>
  </div>
</td>

                      {/* Khóa Học */}
                      <td className="py-4 px-4">
                        <div>
                          <strong className="text-slate-900 text-xs font-extrabold block">
                            {tx.course_title}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Mã lớp: #{tx.course_id}
                          </span>
                        </div>
                      </td>

                      {/* Số Tiền */}
                      <td className="py-4 px-4 text-right">
                        <span className="font-black text-sm text-slate-900">
                          {Number(tx.amount).toLocaleString("vi-VN")} đ
                        </span>
                      </td>

                      {/* Cổng / Ngân Hàng */}
                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-mono font-bold text-[10px] rounded-lg border border-slate-200">
                          {tx.bank_code || "VNPAYQR"}
                        </span>
                      </td>

                      {/* Trạng Thái */}
                      <td className="py-4 px-4 text-center">
                        {isSuccess ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Thành công</span>
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>Chờ xử lý</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            <span>Thất bại</span>
                          </span>
                        )}
                      </td>

                      {/* Thời Gian */}
                      <td className="py-4 px-4 text-right text-slate-500 font-medium">
                        {new Date(tx.created_at).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredList.length === 0 && (
              <div className="py-16 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-xs">
                {searchTerm || courseFilter !== "all" || statusFilter !== "all" 
                  ? "Không tìm thấy giao dịch nào phù hợp với bộ lọc hiện tại." 
                  : "Chưa có giao dịch thanh toán nào được ghi nhận trên hệ thống."}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}