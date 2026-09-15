/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react"
import { paymentApi } from "../../../../api/payment.api"

export default function PaymentResult() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState("loading") // "loading" | "success" | "failed"
  const [transactionData, setTransactionData] = useState(null)

  const courseBaseUrl = import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1"

  useEffect(() => {
    const verify = async () => {
      const params = {}
      for (const [key, value] of searchParams.entries()) {
        params[key] = value
      }

      if (Object.keys(params).length === 0) {
        setStatus("failed")
        return
      }

      try {
        const res = await paymentApi.verifyCallback(params)
        if (res.status === "SUCCESS") {
          setStatus("success")
          setTransactionData(res.data)

          // 🎯 FALLBACK ĐẢM BẢO 100%: Kích hoạt enroll sang course-service ngay từ client
          if (res.data?.course_id && res.data?.user_id) {
            fetch(`${courseBaseUrl}/courses/${res.data.course_id}/join`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                student_id: res.data.user_id,
                student_name: res.data.user_name || "Học viên",
                email: res.data.user_email || ""
              })
            }).catch(e => console.warn("Enroll fallback warning:", e))
          }
        } else {
          setStatus("failed")
        }
      } catch (err) {
        console.error("Lỗi xác thực VNPay:", err)
        setStatus("failed")
      }
    }

    verify()
  }, [searchParams])

  const handleGoToCourse = () => {
  if (transactionData?.course_id) {
    navigate(`/student/courses/${transactionData.course_id}/learn`)
  } else {
    navigate("/student/courses")
  }
}

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 text-center space-y-6">
        {status === "loading" && (
          <div className="space-y-4 py-8">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <h2 className="text-base font-extrabold text-slate-800">Đang đối soát giao dịch VNPay...</h2>
            <p className="text-xs text-slate-400">Vui lòng không đóng trình duyệt trong giây lát.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Thanh Toán Thành Công!</h2>
              <p className="text-xs text-slate-500">Khóa học đã được mở khóa và thêm vào danh sách học tập của bạn.</p>
            </div>

            {transactionData && (
              <div className="p-4 bg-slate-50 rounded-2xl border text-xs text-left space-y-2">
                <div className="flex justify-between"><span className="text-slate-400">Mã giao dịch:</span><strong>{transactionData.txn_ref}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Khóa học:</span><strong className="text-blue-600">{transactionData.course_title}</strong></div>
                <div className="flex justify-between"><span className="text-slate-400">Số tiền:</span><strong className="text-emerald-600">{Number(transactionData.amount).toLocaleString("vi-VN")} đ</strong></div>
              </div>
            )}

            <button
              onClick={handleGoToCourse}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md cursor-pointer transition active:scale-95"
            >
              <span>Vào Học Khóa Này Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === "failed" && (
          <div className="space-y-5">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-md shadow-rose-500/20">
              <XCircle className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">Giao Dịch Bị Hủy Hoặc Thất Bại</h2>
              <p className="text-xs text-slate-500">Chưa trừ tiền tài khoản hoặc bạn đã hủy giao dịch trên cổng VNPay.</p>
            </div>

            <button
              onClick={() => navigate("/student/courses")}
              className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl text-xs cursor-pointer"
            >
              Quay Lại Danh Sách Khóa Học
            </button>
          </div>
        )}
      </div>
    </div>
  )
}