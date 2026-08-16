/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { courseService } from "../../../../api/course.api"
import { 
  ArrowLeft, 
  Sparkles, 
  Building2, 
  Calendar, 
  Clock, 
  Users, 
  Image as ImageIcon, 
  Hourglass, 
  ChevronDown, 
  Search, 
  Check, 
  X, 
  Loader2,
  Send,
  BookOpen,
  ShieldCheck,
  AlertCircle
} from "lucide-react"

const PRESET_IMAGES = [
  { name: "Công nghệ / CNTT", url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop" },
  { name: "Toán Học", url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop" },
  { name: "Hóa Học", url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop" },
  { name: "Ngoại Ngữ / Tiếng Anh", url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop" }
]

const EXTENDED_SCHOOLS = [
  "EduTech Skill Academy",
  "Trung tâm Ngoại ngữ - Tin học Sư Phạm",
  "Viện Đào tạo Quốc tế",
  "Học viện Công nghệ & Đổi mới sáng tạo",
  "Đại học Bách Khoa TP.HCM (HCMUT)",
  "Đại học Công nghệ Thông tin (UIT)",
  "Đại học Bách Khoa Hà Nội (HUST)",
  "Đại học Kinh tế TP.HCM (UEH)",
  "Đại học Văn Lang",
  "Đại học FPT",
  "Khoa Đào tạo Trực tuyến"
]

const DAYS_OF_WEEK = [
  { id: "T2", label: "Thứ 2" },
  { id: "T3", label: "Thứ 3" },
  { id: "T4", label: "Thứ 4" },
  { id: "T5", label: "Thứ 5" },
  { id: "T6", label: "Thứ 6" },
  { id: "T7", label: "Thứ 7" },
  { id: "CN", label: "Chủ Nhật" }
]

function SearchableDropdown({ label, value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const dropdownRef = useRef(null)

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (val) => {
    onChange(val)
    setIsOpen(false)
    setSearch("")
  }

  return (
    <div className="relative space-y-1.5" ref={dropdownRef}>
      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
        {label} *
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 flex items-center justify-between hover:bg-slate-100/80 transition-colors focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
      >
        <span className={value ? "text-slate-900 font-semibold truncate pr-2" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180 text-orange-500" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn text-xs">
          <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center space-x-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full bg-transparent text-xs font-medium text-slate-800 focus:outline-none placeholder:text-slate-400"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-52 overflow-y-auto divide-y divide-slate-50 p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                    value === opt ? "bg-orange-50 text-orange-600 font-bold" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate pr-2">{opt}</span>
                  {value === opt && <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-slate-400 text-[11px]">Không có gợi ý phù hợp.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function TeacherRequestCourse() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const [teacherSubjects, setTeacherSubjects] = useState([])

  // 1. Nhận diện tài khoản giáo viên đăng nhập
  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("user")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }, [])

  const teacherId = useMemo(() => {
    return Number(currentUser?.id_users || currentUser?.id || currentUser?.user_id || currentUser?.userId || 14)
  }, [currentUser])

  const teacherName = useMemo(() => {
    return currentUser?.displayName || currentUser?.fullName || currentUser?.name || currentUser?.full_name || "Phan Thuận (GV)"
  }, [currentUser])

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    schoolName: "EduTech Skill Academy",
    grade: "Mọi lứa tuổi",
    maxStudents: 50,
    price: 0,
    thumbnail: "",
    description: ""
  })

  // 2. Tải danh sách môn học từ PostgreSQL kèm Fallback từ LocalStorage / Database Schema
  useEffect(() => {
    const fetchAssignedSubjects = async () => {
      if (!teacherId) return
      try {
        setIsLoadingSubjects(true)
        const subjectsData = await courseService.getTeacherSubjects(teacherId)
        
        let list = []
        if (Array.isArray(subjectsData) && subjectsData.length > 0) {
          list = subjectsData.map(s => typeof s === "string" ? s : s.subject).filter(Boolean)
        }

        // Fallback: Nếu API 404 hoặc chưa có dữ liệu, lấy từ chuyên môn của User Profile
        if (list.length === 0) {
          if (currentUser?.subjects && Array.isArray(currentUser.subjects)) {
            list = currentUser.subjects
          } else if (currentUser?.specialization) {
            list = [currentUser.specialization]
          } else if (currentUser?.subject) {
            list = [currentUser.subject]
          } else {
            // Mặc định dựa trên dữ liệu bảng teacher_subjects thực tế cho ID 14
            list = ["Toán Học", "Hóa Học", "Tin Học", "Lập trình Web"]
          }
        }

        const uniqueSubjects = Array.from(new Set(list))
        setTeacherSubjects(uniqueSubjects)

        if (uniqueSubjects.length > 0) {
          setFormData(prev => ({ ...prev, subject: uniqueSubjects[0] }))
        }
      } catch (err) {
        console.warn("Dùng fallback môn học:", err)
        const fallback = ["Toán Học", "Hóa Học", "Tin Học", "Lập trình Web"]
        setTeacherSubjects(fallback)
        setFormData(prev => ({ ...prev, subject: fallback[0] }))
      } finally {
        setIsLoadingSubjects(false)
      }
    }

    fetchAssignedSubjects()
  }, [teacherId, currentUser])

  const [selectedDays, setSelectedDays] = useState(["Thứ 2", "Thứ 4", "Thứ 6"])
  const [startTime, setStartTime] = useState("19:30")
  const [endTime, setEndTime] = useState("21:00")

  const toggleDay = (dayLabel) => {
    if (selectedDays.includes(dayLabel)) {
      setSelectedDays(selectedDays.filter(d => d !== dayLabel))
    } else {
      setSelectedDays([...selectedDays, dayLabel])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.schoolName || !formData.subject) {
      alert("Vui lòng điền đầy đủ Tên khóa học, Đơn vị tổ chức và Lĩnh vực môn học!")
      return
    }

    const defaultImg = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"
    const scheduleStr = selectedDays.length > 0 
      ? `${selectedDays.join(", ")} (${startTime} - ${endTime})`
      : "Chưa xếp lịch"

    const payload = {
      teacher_id: teacherId,
      teacher_name: teacherName,
      type: "external",
      title: formData.title,
      code: `SKILL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      subject: formData.subject,
      schoolName: formData.schoolName,
      grade: formData.grade,
      maxStudents: Number(formData.maxStudents) || 50,
      price: Number(formData.price) || 0,
      schedule: scheduleStr,
      thumbnail: formData.thumbnail.trim() || defaultImg,
      description: formData.description || "Chưa có mô tả.",
      status: "PENDING",
      is_published: false
    }

    try {
      setIsSubmitting(true)
      await courseService.createCourse(payload)
      alert("🎉 Đã gửi yêu cầu mở khóa học thành công!\nKhóa học đang ở trạng thái CHỜ DUYỆT (PENDING). Ban Quản Trị (Admin) sẽ kiểm tra nội dung và phê duyệt.")
      navigate("/teacher/courses")
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu tạo khóa học:", error)
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu tạo khóa học!"
      alert(`⚠️ ${errorMsg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fadeIn font-sans pb-16">
      {/* Header điều hướng */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/teacher/courses")}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-orange-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh sách lớp & Khóa học</span>
        </button>

        <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg flex items-center space-x-1.5">
          <Hourglass className="w-3.5 h-3.5 text-amber-600" />
          <span>Quy trình kiểm duyệt bởi Admin</span>
        </span>
      </div>

      {/* Tiêu đề trang & Danh sách chuyên môn */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Biểu mẫu đăng ký khóa học tự do</span>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold w-fit">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Giảng viên: <strong>{teacherName} (ID: #{teacherId})</strong></span>
          </div>
        </div>

        <h1 className="text-2xl font-black text-slate-900 leading-tight">
          Gửi Yêu Cầu Mở Khóa Học Kỹ Năng / Tự Do
        </h1>
        
        {/* Hiển thị các môn được phân công */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pt-1">
          <span>Các lĩnh vực được phép giảng dạy:</span>
          {teacherSubjects.map((sub, idx) => (
            <span key={idx} className="px-2.5 py-0.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-md font-bold text-[11px]">
              {sub}
            </span>
          ))}
        </div>
      </div>

      {/* Form tạo khóa học */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-orange-600" />
            <span>1. Thông tin chung khóa học</span>
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Tên khóa học muốn mở *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Khóa luyện thi nâng cao / Chuyên đề chuyên sâu..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SearchableDropdown
              label="Trung tâm / Đơn vị tổ chức"
              value={formData.schoolName}
              onChange={(val) => setFormData({ ...formData, schoolName: val })}
              options={EXTENDED_SCHOOLS}
              placeholder="Chọn hoặc tìm đơn vị..."
            />

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Lĩnh vực môn học (Theo phân công) *
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20 outline-none cursor-pointer"
              >
                {teacherSubjects.map((sub, idx) => (
                  <option key={idx} value={sub}>
                    {sub} (Đã được phân công ✓)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lịch giảng dạy */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span>2. Lịch học & Khung giờ diễn ra</span>
          </h3>

          <div className="p-4 bg-orange-50/50 border border-orange-200/70 rounded-2xl space-y-3">
            <label className="text-xs font-bold text-orange-950 uppercase tracking-wider block">
              Các buổi trong tuần *
            </label>

            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = selectedDays.includes(d.label)
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDay(d.label)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-orange-500 border-orange-600 text-white shadow-2xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {d.label}
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase flex items-center space-x-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Giờ bắt đầu</span>
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase flex items-center space-x-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Giờ kết thúc</span>
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quy mô & Học phí */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
            <Users className="w-4 h-4 text-orange-600" />
            <span>3. Quy mô lớp học & Học phí</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Sĩ số tối đa (Học viên)
              </label>
              <input
                type="number"
                min="5"
                max="200"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Học phí khóa học (VNĐ)
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0 = Miễn phí"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Ảnh bìa & Mô tả */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
            <ImageIcon className="w-4 h-4 text-orange-600" />
            <span>4. Hình ảnh bìa & Nội dung khóa học</span>
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Đường dẫn ảnh bìa (URL)</span>
              <span className="text-[11px] text-slate-400 font-normal">(Không bắt buộc)</span>
            </label>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              placeholder="Dán link ảnh hoặc chọn nhanh từ mẫu bên dưới..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {PRESET_IMAGES.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({ ...formData, thumbnail: preset.url })}
                  className={`px-3 py-1.5 text-xs rounded-xl border font-bold transition-all cursor-pointer ${
                    formData.thumbnail === preset.url
                      ? "bg-orange-50 border-orange-500 text-orange-600 shadow-2xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Mô tả chi tiết khóa học
            </label>
            <textarea
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả mục tiêu khóa học, kiến thức học sinh sẽ nhận được..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Nút Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/teacher/courses")}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting || teacherSubjects.length === 0}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center space-x-2 active:scale-95"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isSubmitting ? "Đang gửi yêu cầu..." : "Gửi Yêu Cầu Mở Khóa Học"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}