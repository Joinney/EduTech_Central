/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react"
import CourseDetail from "./CourseDetail.jsx"
import { courseService } from "../../../../api/course.api" 
import { 
  Plus, 
  Search, 
  BookOpen, 
  Users, 
  Building2, 
  Eye, 
  Trash2, 
  X, 
  Sparkles,
  School,
  Globe,
  Image as ImageIcon,
  Loader2,
  Calendar,
  Clock,
  ShieldAlert,
  ChevronDown,
  Check,
  Hourglass,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MessageSquare
} from "lucide-react"

const PRESET_IMAGES = [
  { name: "Công nghệ / CNTT", url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop" },
  { name: "Toán Học", url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop" },
  { name: "Ngoại Ngữ / Tiếng Anh", url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop" },
  { name: "Khoa Học / Kỹ Năng", url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop" }
]

// Danh sách gợi ý Đơn vị / Trung tâm
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

// Danh sách gợi ý Môn học & Khóa kỹ năng
const EXTENDED_SUBJECTS = [
  "Lập trình Web (React / Vue / Go / Node.js)",
  "Lập trình Python & Phân tích Dữ liệu",
  "Lập trình Di động (Flutter / React Native)",
  "Cơ sở dữ liệu & SQL Server",
  "Trí Tuệ Nhân Tạo & Machine Learning",
  "Tiếng Anh Giao Tiếp Thực Chiến",
  "Luyện thi IELTS / TOEIC",
  "Tiếng Nhật (N5 - N3)",
  "Tiếng Trung Giao Tiếp",
  "Kỹ năng Thuyết trình & Làm việc nhóm",
  "Thiết Kế Đồ Họa (Photoshop / Figma)"
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

// Dropdown tìm kiếm thông minh
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
    <div className="relative space-y-1" ref={dropdownRef}>
      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
        {label} *
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 flex items-center justify-between hover:bg-slate-100/80 transition-colors focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
      >
        <span className={value ? "text-slate-900 font-semibold truncate pr-2" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-180 text-orange-500" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-fadeIn text-xs">
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center space-x-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm hoặc gõ để thêm..."
              className="w-full bg-transparent text-xs font-medium text-slate-800 focus:outline-none placeholder:text-slate-400"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto divide-y divide-slate-50 p-1">
            {search.trim() !== "" && !options.some(opt => opt.toLowerCase() === search.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={() => handleSelect(search.trim())}
                className="w-full text-left px-3 py-2 rounded-xl text-orange-600 font-bold bg-orange-50 hover:bg-orange-100 flex items-center justify-between cursor-pointer mb-1 transition-colors"
              >
                <span className="truncate">➕ Dùng tên mới: &quot;{search.trim()}&quot;</span>
              </button>
            )}

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
            ) : search.trim() === "" ? (
              <div className="p-3 text-center text-slate-400 text-[11px]">Không có gợi ý.</div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CourseManagement() {
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [activeTypeTab, setActiveTypeTab] = useState("external") // Mặc định mở Tab khóa tự do
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form tạo khóa học tự do
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

  // State Lịch học
  const [selectedDays, setSelectedDays] = useState(["Thứ 2", "Thứ 4", "Thứ 6"])
  const [startTime, setStartTime] = useState("19:30")
  const [endTime, setEndTime] = useState("21:00")

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setIsLoading(true)
      const storedUser = localStorage.getItem("user")
      const currentUser = storedUser ? JSON.parse(storedUser) : null
      const teacherId = currentUser?.id || currentUser?.id_users || null

      const data = await courseService.getAllCourses(teacherId)
      setCourses(data || [])
    } catch (error) {
      console.error("Lỗi khi tải danh sách lớp học:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDay = (dayLabel) => {
    if (selectedDays.includes(dayLabel)) {
      setSelectedDays(selectedDays.filter(d => d !== dayLabel))
    } else {
      setSelectedDays([...selectedDays, dayLabel])
    }
  }

  const filteredCourses = courses.filter(c => {
    const matchesType = c.type === activeTypeTab
    const matchesSearch = 
      (c.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.schoolName || "").toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  // 🚀 GỬI YÊU CẦU MỞ KHÓA HỌC TỰ DO (CHỜ ADMIN DUYỆT)
  const handleCreateCourse = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.schoolName || !formData.subject) {
      alert("Vui lòng điền đầy đủ Tên khóa học, Đơn vị/Trung tâm và Môn học!")
      return
    }

    const storedUser = localStorage.getItem("user")
    const currentUser = storedUser ? JSON.parse(storedUser) : null
    const teacherId = currentUser?.id || currentUser?.id_users || 1
    const teacherName = currentUser?.displayName || currentUser?.fullName || currentUser?.name || currentUser?.username || "Giảng viên"

    const defaultImg = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"

    const scheduleStr = selectedDays.length > 0 
      ? `${selectedDays.join(", ")} (${startTime} - ${endTime})`
      : "Chưa xếp lịch"

    const payload = {
      teacher_id: Number(teacherId),
      teacher_name: teacherName,
      type: "external", // 👈 LUÔN LÀ KHÓA TỰ DO
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
      status: "PENDING",       // 👈 LUÔN Ở TRẠNG THÁI CHỜ DUYỆT
      is_published: false      // 👈 CHƯA XUẤT BẢN CÔNG KHAI
    }

    try {
      setIsSubmitting(true)
      const newCourse = await courseService.createCourse(payload)
      setCourses([newCourse, ...courses])
      setIsModalOpen(false)
      
      // Reset form
      setFormData({
        title: "",
        subject: "",
        schoolName: "EduTech Skill Academy",
        grade: "Mọi lứa tuổi",
        maxStudents: 50,
        price: 0,
        thumbnail: "",
        description: ""
      })

      alert("🎉 Đã gửi yêu cầu mở khóa học thành công!\nKhóa học đang ở trạng thái CHỜ DUYỆT (PENDING). Ban Quản Trị (Admin) sẽ kiểm tra nội dung và phê duyệt trước khi công khai cho học sinh.")
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu tạo khóa học:", error)
      alert("Có lỗi xảy ra khi gửi yêu cầu tạo khóa học!")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCourse = async (id, e) => {
    e.stopPropagation()
    if (window.confirm("Thầy/Cô có chắc chắn muốn xóa khóa học này?")) {
      try {
        await courseService.deleteCourse(id)
        setCourses(courses.filter(c => c.id !== id))
      } catch (error) {
        console.error("Lỗi khi xóa lớp học:", error)
        alert("Không thể xóa lớp học lúc này.")
      }
    }
  }

  if (selectedCourse) {
    return <CourseDetail course={selectedCourse} onBack={() => {
      setSelectedCourse(null);
      fetchCourses();
    }} />
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans">
      
      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" />
            <span>Giảng Viên • Quản Lý Giảng Dạy</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Lớp & Khóa Học
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Xem danh sách lớp chính quy được phân công và tạo yêu cầu mở khóa học kỹ năng tự do.
          </p>
        </div>

        {/* Nút gửi yêu cầu tạo khóa học tự do */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Gửi Yêu Cầu Mở Khóa Tự Do</span>
        </button>
      </div>

      {/* ================= TABS & TÌM KIẾM ================= */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
        <div className="flex items-center space-x-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTypeTab("external")}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTypeTab === "external"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Khóa Kỹ Năng / Tự Do ({courses.filter(c => c.type === "external").length})</span>
          </button>

          <button
            onClick={() => setActiveTypeTab("school")}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTypeTab === "school"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <School className="w-4 h-4" />
            <span>Lớp Trường Học Chính Quy ({courses.filter(c => c.type === "school").length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên khóa, mã lớp..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      {/* ================= DANH SÁCH KHÓA HỌC ================= */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="text-xs font-medium">Đang tải danh sách khóa học...</span>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs space-y-2">
          <p className="font-semibold">Chưa có khóa học nào thuộc mục này.</p>
          {activeTypeTab === "external" && (
            <p className="text-[11px] text-slate-400">
              Hãy bấm nút <strong>&quot;Gửi Yêu Cầu Mở Khóa Tự Do&quot;</strong> ở trên để tạo nội dung khóa học mới.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => {
            const status = course.status || "APPROVED"
            return (
              <div 
                key={course.id} 
                onClick={() => setSelectedCourse(course)}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group cursor-pointer"
              >
                {/* Ảnh Thumbnail & Tag Trạng Thái */}
                <div className="relative h-40 overflow-hidden bg-slate-100">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  {/* Badge Trạng Thái Kiểm Duyệt Thực Tế */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    {status === "APPROVED" && (
                      <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-md shadow-sm flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Đang Mở (Approved)</span>
                      </span>
                    )}
                    {status === "PENDING" && (
                      <span className="px-2.5 py-0.5 bg-amber-500 text-white text-[10px] font-black uppercase rounded-md shadow-sm flex items-center space-x-1 animate-pulse">
                        <Hourglass className="w-3 h-3" />
                        <span>Chờ Admin Duyệt</span>
                      </span>
                    )}
                    {status === "NEEDS_REVISION" && (
                      <span className="px-2.5 py-0.5 bg-orange-600 text-white text-[10px] font-black uppercase rounded-md shadow-sm flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Cần Sửa Lại</span>
                      </span>
                    )}
                    {status === "REJECTED" && (
                      <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[10px] font-black uppercase rounded-md shadow-sm flex items-center space-x-1">
                        <XCircle className="w-3 h-3" />
                        <span>Bị Từ Chối</span>
                      </span>
                    )}
                  </div>

                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono font-bold rounded-md">
                    {course.code}
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">{course.subject}</p>
                    <h3 className="text-sm font-bold truncate leading-snug">{course.title}</h3>
                  </div>
                </div>

                {/* Thông tin chi tiết */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-semibold text-slate-700">{course.schoolName}</span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-600 font-medium">{course.schedule || "Chưa có lịch"}</span>
                    </div>

                    {/* Hiển thị Ý kiến từ Admin nếu có */}
                    {course.admin_note && (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start space-x-1.5 mt-2">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="leading-snug">
                          <strong>Ghi chú Admin:</strong> {course.admin_note}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-orange-500" />
                      <span className="font-bold">
                        {course.studentsCount || 0}/{course.maxStudents} HS
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors cursor-pointer">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Quản Lý Lớp</span>
                      </button>

                      <button 
                        onClick={(e) => handleDeleteCourse(course.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa khóa học"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ================= MODAL GỬI YÊU CẦU MỞ KHÓA TỰ DO ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <h3 className="font-extrabold text-sm">Gửi Yêu Cầu Mở Khóa Học Kỹ Năng / Tự Do</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              
              {/* Banner Lưu ý về Quy trình kiểm duyệt */}
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start space-x-2.5 text-amber-900">
                <Hourglass className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[11px] leading-relaxed">
                  <span className="font-bold">Quy trình kiểm duyệt bắt buộc:</span>
                  <p className="text-amber-800">
                    Khóa học sau khi gửi sẽ ở trạng thái <strong>Chờ Duyệt (PENDING)</strong>. Ban Quản Trị (Admin) sẽ kiểm tra chất lượng và nội dung trước khi cho phép học sinh đăng ký.
                  </p>
                </div>
              </div>

              {/* Tên Khóa Học */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Tên Khóa Học Kỹ Năng *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Lập trình Web Fullstack React & Go / Luyện thi IELTS 7.0+..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Dropdowns Đơn vị & Môn học */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SearchableDropdown
                  label="Trung tâm / Đơn vị tổ chức"
                  value={formData.schoolName}
                  onChange={(val) => setFormData({ ...formData, schoolName: val })}
                  options={EXTENDED_SCHOOLS}
                  placeholder="Chọn hoặc tìm đơn vị..."
                />

                <SearchableDropdown
                  label="Chủ đề / Chuyên đề"
                  value={formData.subject}
                  onChange={(val) => setFormData({ ...formData, subject: val })}
                  options={EXTENDED_SUBJECTS}
                  placeholder="Chọn chủ đề môn học..."
                />
              </div>

              {/* Lịch học trong tuần */}
              <div className="p-3.5 bg-orange-50/50 border border-orange-200/70 rounded-2xl space-y-2.5">
                <label className="text-[11px] font-bold text-orange-950 uppercase tracking-wider flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <span>Lịch giảng dạy dự kiến *</span>
                </label>

                <div className="flex flex-wrap gap-1.5">
                  {DAYS_OF_WEEK.map((d) => {
                    const isSelected = selectedDays.includes(d.label)
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDay(d.label)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-orange-500 border-orange-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {d.label}
                      </button>
                    )
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center space-x-1 mb-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Giờ bắt đầu</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center space-x-1 mb-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Giờ kết thúc</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Sĩ số & Học phí */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Sĩ số tối đa</label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Học phí (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0 = Miễn phí"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Hình ảnh bìa */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                    <span>Hình ảnh bìa (URL)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">(Không bắt buộc)</span>
                </label>

                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="Dán link ảnh hoặc chọn mẫu bên dưới"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />

                <div className="flex flex-wrap gap-1.5">
                  {PRESET_IMAGES.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, thumbnail: preset.url })}
                      className={`px-2 py-1 text-[10px] rounded-lg border font-bold transition-all cursor-pointer ${
                        formData.thumbnail === preset.url
                          ? "bg-orange-50 border-orange-500 text-orange-600"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mô tả */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Mô tả tóm tắt</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả mục tiêu, kiến thức đạt được sau khóa học..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 resize-none"
                />
              </div>

              {/* Nút Hành động */}
              <div className="pt-3 flex items-center justify-end space-x-2 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? "Đang gửi yêu cầu..." : "Gửi Yêu Cầu Mở Khóa"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}