/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
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
  School,
  Globe,
  Loader2,
  Calendar,
  Hourglass,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MessageSquare
} from "lucide-react"

export default function CourseManagement() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [activeTypeTab, setActiveTypeTab] = useState("external")
  const [searchTerm, setSearchTerm] = useState("")

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

  const filteredCourses = courses.filter(c => {
    const matchesType = c.type === activeTypeTab
    const matchesSearch = 
      (c.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.schoolName || "").toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
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

        {/* Nút điều hướng sang trang tạo khóa học riêng */}
        <button
          onClick={() => navigate("/teacher/courses/request")}
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
                ? "bg-white text-orange-600 shadow-2xs"
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
                ? "bg-white text-orange-600 shadow-2xs"
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
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group cursor-pointer"
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
                  
                  {/* Badge Trạng Thái */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    {status === "APPROVED" && (
                      <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-md shadow-2xs flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Đang Mở</span>
                      </span>
                    )}
                    {status === "PENDING" && (
                      <span className="px-2.5 py-0.5 bg-amber-500 text-white text-[10px] font-black uppercase rounded-md shadow-2xs flex items-center space-x-1 animate-pulse">
                        <Hourglass className="w-3 h-3" />
                        <span>Chờ Duyệt</span>
                      </span>
                    )}
                    {status === "NEEDS_REVISION" && (
                      <span className="px-2.5 py-0.5 bg-orange-600 text-white text-[10px] font-black uppercase rounded-md shadow-2xs flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Cần Sửa Lại</span>
                      </span>
                    )}
                    {status === "REJECTED" && (
                      <span className="px-2.5 py-0.5 bg-rose-600 text-white text-[10px] font-black uppercase rounded-md shadow-2xs flex items-center space-x-1">
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
    </div>
  )
}