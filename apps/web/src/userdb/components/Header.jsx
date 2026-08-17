/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { 
  Search, 
  Bot, 
  GraduationCap, 
  Star, 
  Settings,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Receipt,
  CreditCard
} from "lucide-react"

import api from "../../api/axios.js"

export default function Header() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const loadUserData = () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          console.error("Lỗi đọc dữ liệu người dùng tại Header:", e)
        }
      } else {
        setUser(null)
      }
    }

    loadUserData()
    window.addEventListener("storage", loadUserData)
    window.addEventListener("user-profile-updated", loadUserData)

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      window.removeEventListener("storage", loadUserData)
      window.removeEventListener("user-profile-updated", loadUserData)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout")
    } catch (err) {
      console.warn("Lỗi gọi API đăng xuất:", err)
    } finally {
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")
      localStorage.removeItem("role")
      window.dispatchEvent(new Event("user-profile-updated"))
      setShowDropdown(false)
      navigate("/login")
    }
  }

  const role = (user?.role || localStorage.getItem("role") || "student").toLowerCase()
  const isTeacher = role === "teacher" || role === "instructor"
  
  const dashboardPath = isTeacher ? "/teacher/dashboard" : "/student/dashboard"
  const profilePath = isTeacher ? "/teacher/profile" : "/student/profile"

  const fullName = user?.fullName || user?.full_name || user?.name || (isTeacher ? "Giảng viên" : "Học viên")
  const email = user?.email || ""
  const avatarUrl = user?.avatar || ""

  const getInitials = (name) => {
    if (!name) return isTeacher ? "GV" : "EC"
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return parts.map(p => p[0]).join("").substring(0, 3).toUpperCase()
  }

  const theme = {
    primary: isTeacher ? "orange" : "blue",
    bgLight: isTeacher ? "bg-orange-50" : "bg-blue-50",
    textPrimary: isTeacher ? "text-orange-600" : "text-blue-600",
    hoverBg: isTeacher ? "hover:bg-orange-100" : "hover:bg-blue-100",
    gradient: isTeacher ? "from-orange-500 to-amber-500" : "from-blue-600 to-cyan-500"
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <Link to={dashboardPath} className="flex items-center space-x-2.5 shrink-0 group py-1">
        <img
          src="/edutechcentral.png"
          alt="EduTech Central Logo"
          className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
        />
      </Link>

      <div className="flex-1 max-w-xl mx-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm bài giảng, PDF, video, SCORM..."
            className="w-full pl-11 pr-4 py-2 bg-slate-100/80 border border-transparent rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        {/* Nút Trợ lý AI */}
        <button type="button" className={`flex items-center space-x-1.5 px-3 py-1.5 ${theme.bgLight} ${theme.hoverBg} ${theme.textPrimary} rounded-full text-xs font-bold transition cursor-pointer`}>
          <Bot className="w-4 h-4" />
          <span>Trợ lý AI</span>
        </button>

        {/* Badge Cấp học / Vai trò */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
          <GraduationCap className="w-4 h-4 text-slate-600" />
          <span>{isTeacher ? "Giảng viên" : "Lớp 12A1"}</span>
        </div>

        {/* Điểm học tập */}
        {!isTeacher && (
          <div className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-50 border border-amber-200/80 text-amber-600 rounded-full text-xs font-extrabold">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>1,250 Points</span>
          </div>
        )}

        <div className="h-5 w-[1px] bg-slate-200 my-auto mx-1" />

        {/* Dropdown Avatar */}
        <div className="relative pl-1" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="focus:outline-none cursor-pointer flex items-center"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm hover:ring-2 hover:ring-orange-500 transition"
              />
            ) : (
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.gradient} text-white font-black text-[10px] flex items-center justify-center border border-slate-200 shadow-sm hover:ring-2 hover:ring-orange-500 transition`}>
                {getInitials(fullName)}
              </div>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-extrabold text-slate-900 truncate">{fullName}</p>
                {email && <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">{email}</p>}
                <span className={`inline-block mt-1 text-[10px] ${isTeacher ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"} font-bold px-2 py-0.5 rounded-md`}>
                  {isTeacher ? "Tài khoản Giảng viên" : "Tài khoản Học viên"}
                </span>
              </div>

              <div className="py-1">
                <button onClick={() => { setShowDropdown(false); navigate(dashboardPath) }} className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  <span>Bảng điều khiển</span>
                </button>

                <button onClick={() => { setShowDropdown(false); navigate(profilePath) }} className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Trang cá nhân</span>
                </button>

                {/* 🎯 NÚT LỊCH SỬ GIAO DỊCH DÀNH CHO HỌC SINH */}
                {!isTeacher && (
                  <button 
                    onClick={() => { setShowDropdown(false); navigate("/student/transactions") }} 
                    className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-blue-500" />
                    <span>Lịch sử thanh toán (VNPay)</span>
                  </button>
                )}

                <button onClick={handleLogout} className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border-t border-slate-100 mt-1 transition cursor-pointer">
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}