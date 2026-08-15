import React, { useState, useEffect } from "react"
import { 
  Video, 
  Calendar, 
  FileText, 
  AlertCircle, 
  Plus, 
  ChevronDown, 
  Building2, 
  X, 
  Loader2,
  BookOpen,
  GraduationCap,
  Sparkles,
  School,
  Radio,
  ArrowRight,
  Search
} from "lucide-react"
import { courseService } from "../../../../api/course.api"
import StudentCourseDetail from "./StudentCourseDetail"

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [filterType, setFilterType] = useState("all") // "all" | "school" | "external"
  const [searchTerm, setSearchTerm] = useState("")

  // Modal State
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [joinError, setJoinError] = useState("")

  // Lấy thông tin sinh viên đang đăng nhập
  const storedUser = localStorage.getItem("user")
  const currentUser = storedUser ? JSON.parse(storedUser) : { id: 999, name: "Học viên" }
  const studentId = currentUser.id || currentUser.id_users || 999

  useEffect(() => {
    fetchMyCourses()
  }, [])

  const fetchMyCourses = async () => {
    try {
      setIsLoading(true)
      const data = await courseService.getStudentJoinedCourses(studentId, currentUser.email)
      const courseList = Array.isArray(data) ? data : data?.data || []
      setCourses(courseList)
    } catch (error) {
      console.error("Lỗi khi tải môn học:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinCourse = async (e) => {
    e.preventDefault()
    setJoinError("")
    if (!joinCode.trim()) return

    try {
      // 1. Tìm lớp khớp với mã Code
      const matchedCourse = await courseService.joinCourseByCode(joinCode.trim().toUpperCase())

      // 2. Gửi thông tin sinh viên thật xuống Service
      const fallbackName =
        currentUser.displayName ||
        currentUser.fullName ||
        currentUser.name ||
        currentUser.username ||
        currentUser.email?.split("@")[0] ||
        "Học viên"

      await courseService.joinCourse(matchedCourse.id, {
        student_id: studentId,
        student_name: fallbackName,
        student_email: currentUser.email || "student@gmail.com",
        avatar_url: currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random`
      })

      alert(`Đăng ký thành công lớp: ${matchedCourse.title}!`)
      setIsJoinModalOpen(false)
      setJoinCode("")

      // 3. Tải lại danh sách lớp
      fetchMyCourses()
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || error.message || "Không thể tham gia lớp học. Vui lòng thử lại."
      setJoinError(errorMsg)
    }
  }

  // Lọc theo loại lớp & từ khóa tìm kiếm
  const filteredCourses = courses.filter((c) => {
    const matchType =
      filterType === "all" ||
      (filterType === "school" && c.type === "school") ||
      (filterType === "external" && c.type !== "school")

    const matchSearch =
      (c.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.schoolName || "").toLowerCase().includes(searchTerm.toLowerCase())

    return matchType && matchSearch
  })

  if (selectedCourse) {
    return <StudentCourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)} />
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* ================= HEADER & THANH ĐIỀU HƯỚNG ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Học Viện & Không Gian Đào Tạo</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Môn Học Của Tôi</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Quản lý và theo dõi tiến độ các môn học chính quy và khóa kỹ năng trong học kỳ.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tham Gia Lớp Mới</span>
          </button>
        </div>
      </div>

      {/* ================= BỘ LỌC TABS & TÌM KIẾM ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              filterType === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Tất Cả ({courses.length})
          </button>
          <button
            onClick={() => setFilterType("school")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 ${
              filterType === "school" ? "bg-blue-600 text-white shadow-xs" : "text-blue-700 hover:bg-blue-50"
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>Chính Quy ({courses.filter((c) => c.type === "school").length})</span>
          </button>
          <button
            onClick={() => setFilterType("external")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1.5 ${
              filterType === "external" ? "bg-purple-600 text-white shadow-xs" : "text-purple-700 hover:bg-purple-50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kỹ Năng ({courses.filter((c) => c.type !== "school").length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo môn, tên lớp, trường..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {/* ================= LƯỚI THẺ MÔN HỌC ĐỒNG BỘ ================= */}
      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-medium">Đang đồng bộ dữ liệu lớp học của bạn...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isSchool = course.type === "school"
            const isLive = course.meetIsActive || course.meet_is_active

            return (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
              >
                <div>
                  {/* Ảnh Bìa Khóa Học */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Huy hiệu loại lớp */}
                    <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg shadow-sm flex items-center gap-1 ${
                          isSchool ? "bg-blue-600 text-white" : "bg-purple-600 text-white"
                        }`}
                      >
                        {isSchool ? <School className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                        <span>{isSchool ? "Chính Quy" : "Tự Do"}</span>
                      </span>
                      <span className="px-2 py-1 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg">
                        {course.subject}
                      </span>
                    </div>

                    {/* Huy hiệu Đang Live */}
                    {isLive && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-rose-600 text-white text-[10px] font-bold rounded-lg flex items-center space-x-1 shadow-sm animate-pulse">
                        <Radio className="w-3 h-3" />
                        <span>Đang Live</span>
                      </div>
                    )}

                    {/* Tên Trường ở đáy ảnh */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center space-x-1.5 text-white/90 text-xs font-semibold">
                      <Building2 className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      <span className="truncate">{course.schoolName || "EduTech Academy"}</span>
                    </div>
                  </div>

                  {/* Thân thẻ */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {course.title}
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">👨‍🏫 Giảng viên:</span>
                        <strong className="text-slate-800 font-bold">
                          {course.teacher_name || course.teacherName || "Giảng viên bộ môn"}
                        </strong>
                      </div>

                      <div className="flex items-center space-x-2 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{course.schedule || "Lịch học linh hoạt"}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-slate-400 text-[11px] pt-1">
                        <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                        <span>{course.lessons?.length || 0} Bài học có sẵn</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chân thẻ: Nút vào học */}
                <div className="p-5 pt-0">
                  <button className="w-full py-2.5 bg-slate-50 group-hover:bg-blue-600 border border-slate-200 group-hover:border-blue-600 text-slate-700 group-hover:text-white font-extrabold rounded-2xl text-xs transition-all duration-300 flex items-center justify-center space-x-1.5 shadow-2xs group-hover:shadow-md group-hover:shadow-blue-500/20 cursor-pointer">
                    <span>Vào Không Gian Học</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Thẻ Thêm Môn Học Mới Bằng Mã Code */}
          <div
            onClick={() => setIsJoinModalOpen(true)}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-8 bg-slate-50/60 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center text-center space-y-3.5 min-h-[360px] cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-2xs group-hover:border-blue-400 group-hover:bg-blue-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-all duration-300">
              <Plus className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                Tham Gia Khóa Mới
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1 max-w-[220px]">
                Nhập mã Code được cấp để mở khóa môn học tự do.
              </p>
            </div>
            <span className="px-3 py-1 bg-white group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-700 font-bold text-xs rounded-xl border border-slate-200 group-hover:border-blue-200 transition-colors">
              + Nhập Mã Lớp
            </span>
          </div>
        </div>
      )}

      {/* ================= MODAL JOIN LỚP HỌC ================= */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-blue-200" />
                <h3 className="font-extrabold text-sm">Tham Gia Khóa Học Mới</h3>
              </div>
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleJoinCourse} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Mã lớp học (Class Code)
                </label>
                <input
                  type="text"
                  required
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="VD: EDU-4A2B"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black tracking-widest uppercase focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-center outline-none transition-all"
                />
              </div>

              {joinError && (
                <div className="flex items-start space-x-1.5 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl font-medium border border-rose-100">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{joinError}</span>
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer active:scale-95"
                >
                  Xác Nhận Tham Gia
                </button>
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}