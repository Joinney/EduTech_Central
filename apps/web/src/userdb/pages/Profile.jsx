import React, { useState, useEffect } from "react"
import { 
  User, 
  Mail, 
  Camera, 
  Sparkles, 
  Save, 
  ShieldCheck, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  Clock, 
  Phone, 
  BookOpen, 
  Building2,
  Users,
  Briefcase,
  Loader2
} from "lucide-react"

const API_AUTH_URL = import.meta.env.VITE_API_AUTH_URL || "http://localhost:8001/api/v1"

export default function Profile() {
  const [role, setRole] = useState("student")
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    avatar: "",
    phone: "",
    // Học sinh (Động từ DB)
    classRoom: "",
    studentId: "",
    // Giảng viên (Động từ DB)
    teacherId: "",
    workplace: "",
    specialization: "",
    degree: "",
    bio: ""
  })

  // Gọi API /auth/me để lấy dữ liệu thực tế từ CSDL
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${API_AUTH_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const result = await res.json()

        if (res.ok && result.success) {
          const userData = result.data
          const userRole = (userData.role || "student").toLowerCase()
          setRole(userRole)

          const studentProf = userData.studentProfile || {}
          const teacherProf = userData.teacherProfile || {}

          const formattedId = String(userData.id).padStart(4, '0')

          setFormData({
            fullName: userData.fullName || "",
            email: userData.email || "",
            avatar: userData.avatar || "",
            phone: userData.phone || "Chưa cập nhật",
            // Đọc đúng cột trong DB
            classRoom: studentProf.gradeLevel || "Chưa cập nhật",
            studentId: userData.studentCode || studentProf.studentCode || `ETC-2026-${formattedId}`,
            teacherId: userData.teacherCode || teacherProf.teacherCode || `GV-2026-${formattedId}`,
            workplace: teacherProf.workplace || "Chưa cập nhật",
            specialization: teacherProf.specialization || "Chưa cập nhật",
            degree: teacherProf.degree || "Chưa cập nhật",
            bio: teacherProf.bio || userData.bio || ""
          })
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu người dùng:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const isTeacher = role === "teacher" || role === "instructor"

  const getInitials = (name) => {
    if (!name) return isTeacher ? "GV" : "EC"
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return parts.map((p) => p[0]).join("").substring(0, 3).toUpperCase()
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
      const userId = storedUser.id || storedUser.id_users

      const response = await fetch(`${API_AUTH_URL}/auth/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          avatar: formData.avatar,
          phone: formData.phone
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Cập nhật hồ sơ thất bại")
      }

      const updatedUser = {
        ...storedUser,
        ...result.data
      }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      
      window.dispatchEvent(new Event("storage"))
      window.dispatchEvent(new CustomEvent("user-profile-updated"))

    } catch (err) {
      console.error("Lỗi lưu dữ liệu:", err)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* 1. Header Banner Profile - Tải dữ liệu động */}
      <div 
        className={`relative rounded-3xl p-6 md:p-8 text-white overflow-hidden shadow-xl transition-colors ${
          isTeacher 
            ? "bg-gradient-to-r from-slate-900 via-orange-950 to-amber-900 border border-orange-500/20" 
            : "bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900"
        }`}
      >
        <div 
          className={`absolute -right-10 -bottom-10 w-64 h-64 rounded-full blur-3xl pointer-events-none ${
            isTeacher ? "bg-orange-500/15" : "bg-blue-500/10"
          }`} 
        />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            
            {/* Avatar & Nút Tải ảnh */}
            <div className="relative group">
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white/20 bg-slate-800 shadow-2xl overflow-hidden flex items-center justify-center shrink-0">
                {formData.avatar ? (
                  <img
                    src={formData.avatar}
                    alt={formData.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none"
                      if (e.target.nextSibling) e.target.nextSibling.style.display = "flex"
                    }}
                  />
                ) : null}

                <div
                  className={`w-full h-full font-black text-2xl items-center justify-center text-white ${
                    formData.avatar ? "hidden" : "flex"
                  } ${
                    isTeacher 
                      ? "bg-gradient-to-br from-orange-500 to-amber-500" 
                      : "bg-gradient-to-br from-blue-600 to-cyan-500"
                  }`}
                >
                  {getInitials(formData.fullName)}
                </div>
              </div>

              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-1 right-1 p-2 text-white rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110 active:scale-95 border-2 border-white ${
                  isTeacher ? "bg-orange-600 hover:bg-orange-700" : "bg-orange-500 hover:bg-orange-600"
                }`}
                title="Tải ảnh mới từ máy tính"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Tên & Mã động */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <h1 className="text-xl md:text-2xl font-black text-white">
                  {formData.fullName || (isTeacher ? "Giảng viên EduTech" : "Học viên EduTech")}
                </h1>
                <span className={`p-1 rounded-full border ${
                  isTeacher ? "bg-orange-500/20 text-amber-300 border-amber-400/30" : "bg-blue-500/20 text-cyan-300 border-cyan-400/30"
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>

              {/* Dòng mã thông tin chuẩn từ CSDL */}
              <p className={`text-xs font-medium ${isTeacher ? "text-orange-200" : "text-blue-200"}`}>
                {isTeacher ? (
                  <>Mã giảng viên: <span className="font-bold text-white">{formData.teacherId}</span> • Nơi công tác: <span className="font-bold text-amber-300">{formData.workplace}</span></>
                ) : (
                  <>Mã học viên: <span className="font-bold text-white">{formData.studentId}</span> • Lớp: <span className="font-bold text-amber-300">{formData.classRoom}</span></>
                )}
              </p>

              <div className="pt-1 flex flex-wrap justify-center md:justify-start gap-2">
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Tài khoản Đã xác thực</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-3 h-3" />
                  <span>{isTeacher ? "Giảng viên Chuẩn EduTech" : "Học viên Pro Active"}</span>
                </span>
              </div>
            </div>

          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-300 border border-amber-400/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-[10px] uppercase tracking-wider font-extrabold ${isTeacher ? "text-orange-200" : "text-blue-200"}`}>
                {isTeacher ? "Đánh giá Giảng dạy" : "Điểm rèn luyện"}
              </p>
              <p className="text-lg font-black text-amber-300">
                {isTeacher ? "4.9 / 5.0 ⭐" : "1,250 Points"}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Thống kê & Form cập nhật */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              {isTeacher ? (
                <>
                  <Briefcase className="w-4 h-4 text-orange-600" />
                  <span>Tổng quan giảng dạy</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>Tổng quan học tập</span>
                </>
              )}
            </h3>

            <div className="space-y-3">
              {isTeacher ? (
                <>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Khóa học phụ trách</p>
                        <p className="text-[10px] text-slate-500 font-medium">Hệ thống EduTech</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-orange-600">4 Khóa</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Tổng số Học viên</p>
                        <p className="text-[10px] text-slate-500 font-medium">Đang theo học</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-emerald-600">342 Học viên</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Môn học đang ký</p>
                        <p className="text-[10px] text-slate-500 font-medium">Khóa học 2026</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-blue-600">8 Môn</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Thời lượng học</p>
                        <p className="text-[10px] text-slate-500 font-medium">Tính theo giờ</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-emerald-600">142 Giờ</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={`rounded-3xl p-5 border space-y-2 ${
            isTeacher ? "bg-gradient-to-br from-orange-50 to-amber-50/50 border-orange-200" : "bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-100"
          }`}>
            <div className={`flex items-center space-x-2 font-extrabold text-xs ${isTeacher ? "text-orange-700" : "text-blue-700"}`}>
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
              <span>Ghi chú hệ thống AI</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Nhấn vào nút **Camera màu cam** trên khung ảnh đại diện để chọn ảnh từ máy tính. Hệ thống sẽ tự động tối ưu và lưu vào CSDL.
            </p>
          </div>
        </div>

        {/* Form chỉnh sửa */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900">Chi tiết thông tin cá nhân</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cập nhật thông tin cá nhân và {isTeacher ? "đơn vị giảng dạy" : "lớp học"} của bạn.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Họ và tên */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {isTeacher ? "Họ và tên Giảng viên" : "Họ và tên Học viên"}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition ${
                      isTeacher ? "focus:ring-orange-500/20 focus:border-orange-500" : "focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Số điện thoại */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 transition ${
                      isTeacher ? "focus:ring-orange-500/20 focus:border-orange-500" : "focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  />
                </div>
              </div>

              {/* Các trường riêng cho Giảng viên */}
              {isTeacher && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Nơi công tác / Trường giảng dạy
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={formData.workplace}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Chuyên môn giảng dạy
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={formData.specialization}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Giới thiệu ngắn */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Giới thiệu ngắn
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 transition resize-none ${
                    isTeacher ? "focus:ring-orange-500/20 focus:border-orange-500" : "focus:ring-blue-500/20 focus:border-blue-500"
                  }`}
                />
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer ${
                  isTeacher 
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/20" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                }`}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu thay đổi hồ sơ</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  )
}