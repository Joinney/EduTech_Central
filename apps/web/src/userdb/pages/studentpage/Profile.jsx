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
  Loader2
} from "lucide-react"

const API_AUTH_URL = import.meta.env.VITE_API_AUTH_URL || "http://localhost:8001/api/v1"

export default function Profile() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    avatar: "",
    phone: "0987 654 321",
    classRoom: "12A1",
    studentId: "ETC-2026-8899",
    bio: "Đam mê lập trình web, công nghệ AI và mong muốn chinh phục các chứng chỉ CNTT quốc tế."
  })

  const [isSaving, setIsSaving] = useState(false)

  // Đọc thông tin học viên từ localStorage khi vào trang
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setFormData((prev) => ({
          ...prev,
          fullName: user.fullName || user.full_name || "",
          email: user.email || "",
          avatar: user.avatar || "",
          phone: user.phone || prev.phone,
          classRoom: user.classRoom || prev.classRoom,
          bio: user.bio || prev.bio
        }))
      } catch (e) {
        console.error("Lỗi nạp thông tin học viên:", e)
      }
    }
  }, [])

  // Tạo chữ viết tắt từ tên người dùng
  const getInitials = (name) => {
    if (!name) return "EC"
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return parts.map((p) => p[0]).join("").substring(0, 3).toUpperCase()
  }

  // Xử lý chọn ảnh từ thiết bị -> Chuyển thành Base64 để xem trước và sẵn sàng đẩy lên Cloudinary
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

  // Xử lý Lưu thông tin cá nhân & Tự động đẩy ảnh lên Cloudinary
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
      const userId = storedUser.id

      if (!userId) {
        throw new Error("Không tìm thấy ID người dùng")
      }

      const response = await fetch(`${API_AUTH_URL}/auth/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          avatar: formData.avatar
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Tải ảnh thất bại")
      }

      // Cập nhật localStorage với dữ liệu Cloudinary trả về từ server
      const updatedUser = {
        ...storedUser,
        ...result.data,
        phone: formData.phone,
        classRoom: formData.classRoom,
        bio: formData.bio
      }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setFormData((prev) => ({ ...prev, avatar: result.data.avatar }))

      // Đồng bộ tức thì cho Header & Sidebar
      window.dispatchEvent(new Event("storage"))
      window.dispatchEvent(new CustomEvent("user-profile-updated"))

    } catch (err) {
      console.error("Lỗi lưu dữ liệu:", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      
      {/* 1. Header Banner Profile */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-6 md:p-8 text-white overflow-hidden shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
          
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            {/* Khung Ảnh đại diện / Avatar */}
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
                  className={`w-full h-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white font-black text-2xl items-center justify-center ${
                    formData.avatar ? "hidden" : "flex"
                  }`}
                >
                  {getInitials(formData.fullName)}
                </div>
              </div>

              {/* Nút bấm tải ảnh từ máy tính */}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-1 right-1 p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110 active:scale-95 border-2 border-white"
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

            {/* Tên & Thông tin tóm tắt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <h1 className="text-xl md:text-2xl font-black text-white">
                  {formData.fullName || "Học viên EduTech"}
                </h1>
                <span className="p-1 bg-blue-500/20 text-cyan-300 rounded-full border border-cyan-400/30">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <p className="text-xs text-blue-200 font-medium">
                Mã học viên: <span className="font-bold text-white">{formData.studentId}</span> • Lớp: <span className="font-bold text-amber-300">{formData.classRoom}</span>
              </p>
              <div className="pt-1 flex flex-wrap justify-center md:justify-start gap-2">
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Tài khoản Đã xác thực</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Sparkles className="w-3 h-3" />
                  <span>Học viên Pro Active</span>
                </span>
              </div>
            </div>
          </div>

          {/* Huy hiệu thành tích tóm tắt */}
          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10">
            <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-300 border border-amber-400/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-blue-200">Điểm rèn luyện</p>
              <p className="text-lg font-black text-amber-300">1,250 Points</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Nội dung Form chỉnh sửa & Thống kê */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột trái: Thẻ học tập & Tiến độ */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Tổng quan học tập</span>
            </h3>

            <div className="space-y-3">
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
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-3xl p-5 border border-blue-100 space-y-2">
            <div className="flex items-center space-x-2 text-blue-700 font-extrabold text-xs">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
              <span>Ghi chú hệ thống AI</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Nhấn vào nút **Camera màu cam** trên khung ảnh đại diện để chọn ảnh từ máy tính. Hệ thống sẽ tự động tối ưu và lưu vào tài khoản của bạn.
            </p>
          </div>
        </div>

        {/* Cột phải: Form cập nhật thông tin cá nhân */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900">Chi tiết thông tin cá nhân</h3>
              <p className="text-xs text-slate-500 mt-0.5">Cập nhật họ tên và thông tin liên lạc của bạn.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Họ và tên */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Họ và tên học viên
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              </div>

              {/* Email (Readonly) */}
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Giới thiệu bản thân */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Giới thiệu ngắn
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                  placeholder="Viết một vài dòng giới thiệu về mục tiêu học tập..."
                />
              </div>

            </div>

            {/* Nút submit */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
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