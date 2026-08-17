/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Receipt, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  CreditCard, 
  Building2, 
  Calendar, 
  RefreshCw,
  Loader2,
  Tag,
  ShieldCheck
} from "lucide-react"
import { paymentApi } from "../../../api/payment.api"

export default function StudentTransactions() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("user")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }, [])

  const studentId = currentUser?.id || currentUser?.id_users || 1
  const studentName = currentUser?.displayName || currentUser?.fullName || currentUser?.name || "Học viên"

  const fetchMyTransactions = async () => {
    try {
      setIsLoading(true)
      const data = await paymentApi.getMyTransactions(studentId)
      setTransactions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Lỗi khi tải lịch sử thanh toán của học sinh:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (studentId) {
      fetchMyTransactions()
    }
  }, [studentId])

  const filteredList = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        (t.txn_ref || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.course_title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.bank_code || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchStatus = statusFilter === "all" || t.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [transactions, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const successList = transactions.filter((t) => t.status === "SUCCESS")
    const totalSpent = successList.reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
    return {
      totalCourses: successList.length,
      totalSpent
    }
  }, [transactions])

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 animate-fadeIn font-sans pb-16">
      {/* Header & Thẻ thống kê */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
              <Receipt className="w-4 h-4" />
              <span>Hóa Đơn & Lịch Sử Giao Dịch</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Lịch Sử Thanh Toán Học Phí
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Theo dõi tất cả hóa đơn thanh toán khóa học tự do qua cổng VNPay của bạn ({studentName}).
            </p>
          </div>

          <button
            onClick={fetchMyTransactions}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer self-start sm:self-auto"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Thống kê nhanh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Tổng Học Phí Đã Thanh Toán
              </span>
              <p className="text-2xl font-black text-emerald-900 mt-1">
                {stats.totalSpent.toLocaleString("vi-VN")} đ
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                Khóa Học Đã Mở Khóa
              </span>
              <p className="text-2xl font-black text-blue-900 mt-1">
                {stats.totalCourses} Khóa học
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Bảng danh sách hóa đơn */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên khóa học, mã giao dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="SUCCESS">Thành công (SUCCESS)</option>
            <option value="PENDING">Đang chờ (PENDING)</option>
            <option value="FAILED">Thất bại / Đã hủy (FAILED)</option>
          </select>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-xs font-medium">Đang tải lịch sử giao dịch...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <th className="py-3.5 px-4 font-bold rounded-l-xl">Mã Giao Dịch</th>
                  <th className="py-3.5 px-4 font-bold">Khóa Học</th>
                  <th className="py-3.5 px-4 font-bold text-right">Số Tiền (VNĐ)</th>
                  <th className="py-3.5 px-4 font-bold text-center">Ngân Hàng</th>
                  <th className="py-3.5 px-4 font-bold text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 font-bold text-right">Thời Gian</th>
                  <th className="py-3.5 px-4 font-bold text-center rounded-r-xl">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((tx, idx) => {
                  const isSuccess = tx.status === "SUCCESS"
                  const isPending = tx.status === "PENDING"

                  return (
                    <tr key={tx.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-blue-600">
                        {tx.txn_ref}
                      </td>

                      <td className="py-4 px-4">
                        <strong className="text-slate-900 block font-bold text-xs">
                          {tx.course_title}
                        </strong>
                        <span className="text-[11px] text-slate-400">Mã lớp: #{tx.course_id}</span>
                      </td>

                      <td className="py-4 px-4 text-right font-black text-slate-900">
                        {Number(tx.amount).toLocaleString("vi-VN")} đ
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 bg-slate-100 font-mono font-bold text-[10px] rounded-lg text-slate-700">
                          {tx.bank_code || "NCB"}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        {isSuccess ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đã thanh toán</span>
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800 animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>Chờ xử lý</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800">
                            <XCircle className="w-3 h-3" />
                            <span>Thất bại</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right text-slate-500 font-medium">
                        {new Date(tx.created_at).toLocaleString("vi-VN")}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {isSuccess && (
                          <button
                            onClick={() => navigate("/student/courses")}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] transition-all flex items-center space-x-1 mx-auto cursor-pointer shadow-xs active:scale-95"
                          >
                            <span>Vào học</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredList.length === 0 && (
              <div className="py-14 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-xs">
                Chưa có lịch sử giao dịch nào.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}