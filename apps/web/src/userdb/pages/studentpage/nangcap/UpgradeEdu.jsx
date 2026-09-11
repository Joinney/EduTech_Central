/* eslint-disable no-unused-vars */
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Crown,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from "lucide-react"

export default function UpgradeEdu() {
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState("yearly")
  const [selectedPlan, setSelectedPlan] = useState("pro")

  const plans = [
    {
      id: "free",
      name: "Tài Khoản Cơ Bản",
      tagline: "Dành cho học sinh làm quen",
      priceMonthly: "0",
      priceYearly: "0",
      period: "Miễn phí vĩnh viễn",
      badge: "Mặc định",
      badgeColor: "bg-slate-100 text-slate-600",
      border: "border-slate-200",
      buttonText: "Đang sử dụng",
      buttonDisabled: true,
      buttonStyle: "bg-slate-100 text-slate-400 cursor-not-allowed",
      features: [
        { text: "Đọc thử 2 trang đầu tài liệu", highlight: false },
        { text: "Làm bài tập & trắc nghiệm online", highlight: false },
        { text: "Hỏi đáp AI cơ bản (10 câu/ngày)", highlight: false },
        { text: "Không hỗ trợ tải tệp PDF gốc", highlight: false, disabled: true }
      ]
    },
    {
      id: "pro",
      name: "EduTech Pro Student",
      tagline: "Dành cho học sinh ôn thi bứt phá",
      priceMonthly: "59.000",
      priceYearly: "49.000",
      unit: "đ/th",
      period: billingCycle === "yearly" ? "588.000đ/năm (-20%)" : "Thanh toán từng tháng",
      badge: "Phổ biến nhất",
      badgeColor: "bg-orange-500 text-white shadow-xs",
      border: "border-orange-500 ring-2 ring-orange-500/20 shadow-md",
      isPopular: true,
      buttonText: "Nâng cấp Pro",
      buttonDisabled: false,
      buttonStyle: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-xs shadow-orange-500/30",
      features: [
        { text: "Mở khóa 100% kho tài liệu & đề thi", highlight: true },
        { text: "Tải xuống không giới hạn PDF & DOCX", highlight: true },
        { text: "Gia sư AI 24/7 không giới hạn", highlight: true },
        { text: "Tặng 500 Points học tập mỗi tháng", highlight: false }
      ]
    },
    {
      id: "vip",
      name: "EduTech VIP Academic",
      tagline: "Dành cho nhóm sinh viên nghiên cứu",
      priceMonthly: "129.000",
      priceYearly: "99.000",
      unit: "đ/th",
      period: billingCycle === "yearly" ? "1.188.000đ/năm (-25%)" : "Thanh toán từng tháng",
      badge: "Cao cấp nhất",
      badgeColor: "bg-purple-600 text-white shadow-xs",
      border: "border-purple-200 hover:border-purple-300",
      buttonText: "Sở hữu VIP",
      buttonDisabled: false,
      buttonStyle: "bg-slate-900 hover:bg-slate-800 text-white shadow-xs",
      features: [
        { text: "Toàn bộ đặc quyền của gói Pro", highlight: false },
        { text: "Kho luận văn & đề tài mẫu cao cấp", highlight: true },
        { text: "Trích dẫn chuẩn APA tự động qua AI", highlight: true },
        { text: "Tặng 1.500 Points học tập mỗi tháng", highlight: false }
      ]
    }
  ]

  return (
    <div className="w-full h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-b from-orange-50/40 via-white to-slate-50 flex flex-col justify-center px-4 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto w-full space-y-4">
        
        {/* HEADER GỌN GÀNG */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 border border-orange-200/80 text-orange-700 text-[11px] font-black uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
            <span>Nâng Cấp Tài Khoản EduTech</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Mở Khóa Toàn Diện <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Kho Tri Thức & Trợ Lý AI</span>
          </h1>

          <p className="text-xs text-slate-500 max-w-xl mx-auto line-clamp-1">
            Xem không giới hạn tài liệu học thuật, loại bỏ làm mờ và tải đề thi gốc tức thì.
          </p>

          {/* TOGGLE CHU KỲ GỌN */}
          <div className="pt-1 flex items-center justify-center">
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200/80 flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  billingCycle === "monthly" 
                    ? "bg-white text-slate-900 shadow-2xs" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Gói theo tháng
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === "yearly" 
                    ? "bg-orange-500 text-white shadow-2xs" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span>Gói theo năm</span>
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                  billingCycle === "yearly" ? "bg-white text-orange-600" : "bg-orange-100 text-orange-600"
                }`}>
                  -20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 THẺ GIÁ THIẾT KẾ VỪA KHÍT MÀN HÌNH */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch pt-2">
          {plans.map((plan) => {
            const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`bg-white rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 relative shadow-2xs cursor-pointer ${plan.border} ${
                  selectedPlan === plan.id ? "ring-2 ring-orange-500 scale-[1.01]" : "hover:border-slate-300"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider block ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="space-y-0.5">
                    <h3 className="text-base font-black text-slate-900">{plan.name}</h3>
                    <p className="text-[11px] text-slate-500 truncate">{plan.tagline}</p>
                  </div>

                  {/* Giá */}
                  <div className="py-3.5 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">{price}</span>
                      {plan.unit && <span className="text-xs font-bold text-slate-500">{plan.unit}</span>}
                    </div>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{plan.period}</p>
                  </div>

                  {/* Danh sách quyền lợi */}
                  <div className="py-3.5 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                      Đặc quyền:
                    </span>
                    <ul className="space-y-2">
                      {plan.features.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                            item.disabled 
                              ? "text-slate-300" 
                              : item.highlight 
                                ? "text-orange-500" 
                                : "text-emerald-500"
                          }`} />
                          <span className={`truncate ${item.disabled ? "text-slate-400 line-through" : item.highlight ? "font-bold text-slate-900" : "text-slate-600"}`}>
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Nút bấm */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={plan.buttonDisabled}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!plan.buttonDisabled) {
                        alert(`Đang chuyển hướng thanh toán VNPay gói ${plan.name}...`)
                      }
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer ${plan.buttonStyle}`}
                  >
                    <span>{plan.buttonText}</span>
                    {!plan.buttonDisabled && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>

              </div>
            )
          })}
        </div>

        {/* FOOTER CAM KẾT GỌN */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-500 pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Thanh toán an toàn qua cổng VNPay • Kích hoạt tài khoản ngay tức thì</span>
        </div>

      </div>
    </div>
  )
}