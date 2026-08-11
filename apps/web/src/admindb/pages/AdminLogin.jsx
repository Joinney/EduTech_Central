import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react"
import { authApi } from "../../api/axios"

export default function AdminLogin() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await authApi.post("/auth/login", formData)
      const responseData = res.data?.data || res.data
      const { token, refreshToken, user } = responseData

      if (user?.role?.toLowerCase() !== "admin") {
        throw new Error("Truy cập bị từ chối! Tài khoản này không có quyền Quản Trị Viên.")
      }

      localStorage.setItem("adminToken", token)
      localStorage.setItem("token", token)
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken)
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("role", user.role.toLowerCase())

      setIsLoading(false)
      navigate("/admin/dashboard")

    } catch (err) {
      setIsLoading(false)
      const message =
        err.response?.data?.message ||
        err.message ||
        "Email hoặc mật khẩu không chính xác!"
      setError(message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Glow Effects Xanh & Cam trên nền Bạc nhạt */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xl relative z-10 space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img 
              src="/edutechcentral.png" 
              alt="EduTech Central Logo" 
              className="h-16 w-auto object-contain" 
            />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Hệ Thống Quản Trị Admin
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Cổng đăng nhập bảo mật dành cho Quản Trị Viên
            </p>
          </div>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* Form Đăng Nhập */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-600 font-bold uppercase mb-1.5 text-[10px] tracking-wider">
              Email Quản Trị *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@edutech.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-bold uppercase mb-1.5 text-[10px] tracking-wider">
              Mật Khẩu Admin *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Hướng dẫn tài khoản mẫu */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-orange-600">🔑 Tài khoản Database Admin:</p>
            <p>• Email: <code className="text-blue-900 font-bold">admin@edutech.com</code></p>
            <p>• Mật khẩu: <code className="text-blue-900 font-bold">admin123</code></p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Đang kết nối Server API...</span>
            ) : (
              <>
                <span>Đăng Nhập Quản Trị</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center text-[10px] text-slate-400">
          © 2026 EduTech Central Admin Portal. All rights reserved.
        </div>

      </div>
    </div>
  )
}