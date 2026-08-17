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
  DollarSign 
} from "lucide-react"
import { paymentApi } from "../../api/payment.api"

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        const data = await paymentApi.getAllTransactions()
        setTransactions(data || [])
      } catch (err) {
        console.error("Lỗi tải lịch sử giao dịch:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTransactions()
  }, [])

  const filteredList = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch = (t.txn_ref || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.user_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.course_title || "").toLowerCase().includes(searchTerm.toLowerCase())
      if (statusFilter === "all") return matchSearch
      return matchSearch && t.status === statusFilter
    })
  }, [transactions, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const totalTx = transactions.length
    const successList = transactions.filter(t => t.status === "SUCCESS")
    const totalRevenue = successList.reduce((acc, t) => acc + (Number(t.amount) || 0), 0)
    const successRate = totalTx > 0 ? Math.round((successList.length / totalTx) * 100) : 0

    return { totalTx, totalRevenue, successCount: successList.length, successRate }
  }, [transactions])

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      {/* Header & Thống Kê */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Lịch Sử Giao Dịch & Cổng Thanh Toán VNPay</h1>
          <p className="text-xs text-slate-500 mt-0.5">Quản lý giao dịch thu học phí các khóa học kỹ năng tự do trên toàn hệ thống.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 uppercase">Tổng Doanh Thu Đã Thu</span>
            <p className="text-2xl font-black text-emerald-900">{stats.totalRevenue.toLocaleString("vi-VN")} đ</p>
          </div>
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-blue-700 uppercase">Giao Dịch Thành Công</span>
            <p className="text-2xl font-black text-blue-900">{stats.successCount} / {stats.totalTx}</p>
          </div>
          <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-purple-700 uppercase">Tỷ Lệ Thanh Toán Hoàn Tất</span>
            <p className="text-2xl font-black text-purple-900">{stats.successRate}%</p>
          </div>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã GD, tên học viên, khóa học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công (SUCCESS)</option>
              <option value="PENDING">Đang chờ (PENDING)</option>
              <option value="FAILED">Thất bại / Hủy (FAILED)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="py-3 px-4 font-bold rounded-l-xl">Mã GD</th>
                <th className="py-3 px-4 font-bold">Học sinh</th>
                <th className="py-3 px-4 font-bold">Khóa học</th>
                <th className="py-3 px-4 font-bold text-right">Số tiền</th>
                <th className="py-3 px-4 font-bold text-center">Trạng thái</th>
                <th className="py-3 px-4 font-bold text-right rounded-r-xl">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((tx, idx) => (
                <tr key={tx.id || idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{tx.txn_ref}</td>
                  <td className="py-3.5 px-4">
                    <strong className="text-slate-900 block">{tx.user_name}</strong>
                    <span className="text-[11px] text-slate-400">{tx.user_email || `ID #${tx.user_id}`}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{tx.course_title}</td>
                  <td className="py-3.5 px-4 text-right font-black text-slate-900">
                    {Number(tx.amount).toLocaleString("vi-VN")} đ
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {tx.status === "SUCCESS" ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Thành công
                      </span>
                    ) : tx.status === "PENDING" ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        Đang chờ
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                        Thất bại
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500">
                    {new Date(tx.created_at).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}