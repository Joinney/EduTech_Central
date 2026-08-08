import React, { useState } from "react"
import { Sparkles, Award, Building2, BookOpen, Clock, FileText, Loader2 } from "lucide-react"

const API_AUTH_URL = import.meta.env.VITE_API_AUTH_URL || "http://localhost:8001/api/v1"

const degreeOptions = [
  "Cử nhân",
  "Kỹ sư",
  "Thạc sĩ",
  "Tiến sĩ",
  "Phó Giáo sư / Giáo sư",
  "Chứng chỉ Sư phạm / Khác"
]

export default function WelcomeTeacherModal({ isOpen, user, onComplete }) {
  const [degree, setDegree] = useState("Cử nhân")
  const [workplace, setWorkplace] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [yearsOfExperience, setYearsOfExperience] = useState(1)
  const [bio, setBio] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!workplace.trim()) {
      setErrorMsg("Vui lòng nhập nơi công tác / trường giảng dạy!")
      return
    }
    if (!specialization.trim()) {
      setErrorMsg("Vui lòng nhập chuyên môn giảng dạy chính!")
      return
    }

    setLoading(true)
    setErrorMsg("")

    try {
      const response = await fetch(`${API_AUTH_URL}/teacher/onboarding`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          userId: user.id_users || user.id,
          degree,
          workplace: workplace.trim(),
          specialization: specialization.trim(),
          yearsOfExperience: Number(yearsOfExperience),
          bio: bio.trim()
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Cập nhật hồ sơ giảng viên thất bại!")
      }

      const updatedUser = { ...user, ...result.data, is_onboarded: true }
      localStorage.setItem("user", JSON.stringify(updatedUser))

      onComplete(updatedUser)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Header Màu Cam Chuyên Biệt Cho Teacher */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-5 text-white text-center shrink-0 relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md mb-2 border border-white/30">
            <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
          </div>
          <h3 className="text-lg md:text-xl font-black tracking-tight">
            Chào mừng Thầy/Cô đến với EduTech Central!
          </h3>
          <p className="text-xs text-orange-100 font-medium mt-0.5">
            Hoàn tất hồ sơ giảng dạy để bắt đầu quản lý bài giảng và tạo lớp học.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 text-center">
              {errorMsg}
            </div>
          )}

          {/* 1. Bằng cấp / Học vị */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-orange-600" />
              <span>Học vị / Bằng cấp cao nhất</span>
            </label>
            <select
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
            >
              {degreeOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          {/* 2. Nơi công tác */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-orange-600" />
              <span>Nơi công tác / Trường giảng dạy <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              value={workplace}
              onChange={(e) => setWorkplace(e.target.value)}
              placeholder="VD: Trường THPT Chuyên Lê Hồng Phong, Đại học Bách Khoa..."
              className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              required
            />
          </div>

          {/* 3. Chuyên môn chính */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-orange-600" />
              <span>Chuyên môn giảng dạy chính <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="VD: Lập trình ReactJS, Toán THPT, Tiếng Anh IELTS..."
              className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              required
            />
          </div>

          {/* 4. Số năm kinh nghiệm */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-600" />
              <span>Kinh nghiệm giảng dạy (Năm)</span>
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* 5. Giới thiệu bản thân ngắn */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-orange-600" />
              <span>Giới thiệu bản thân ngắn <span className="text-slate-400 font-normal">(Không bắt buộc)</span></span>
            </label>
            <textarea
              rows="2"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Mô tả phong cách giảng dạy hoặc mục tiêu khóa học..."
              className="block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
            />
          </div>

          <div className="pt-2 shrink-0">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl shadow-md text-xs font-black text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Vào Bảng Quản Lý Giảng Viên</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}