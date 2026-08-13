import React, { useState, useEffect } from "react"
import { 
  Video, Calendar, FileText, AlertCircle, 
  Plus, ChevronDown, Building2, X, Loader2
} from "lucide-react"
import { courseService } from "../../../../api/course.api"
import StudentCourseDetail from "./StudentCourseDetail"

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  
  // Modal State
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [joinError, setJoinError] = useState("")

  // Lấy thông tin sinh viên thật đang đăng nhập
  const storedUser = localStorage.getItem("user")
  const currentUser = storedUser ? JSON.parse(storedUser) : { id: 999, name: "Học viên" }
  const studentId = currentUser.id || 999

  useEffect(() => {
    fetchMyCourses()
  }, [])

  const fetchMyCourses = async () => {
    try {
      setIsLoading(true)
      // 🚀 KÉO TRỰC TIẾP DANH SÁCH LỚP ĐÃ JOIN TỪ POSTGRES DB
      const data = await courseService.getStudentJoinedCourses(studentId)
      setCourses(data || [])
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

      // 2. Gửi thông tin sinh viên thật xuống Golang
      const fallbackName = currentUser.displayName || currentUser.fullName || currentUser.name || currentUser.username || currentUser.email?.split('@')[0] || "Học viên";
      
      await courseService.joinCourse(matchedCourse.id, {
        student_id: studentId,
        student_name: fallbackName,
        student_email: currentUser.email || "student@gmail.com",
        avatar_url: currentUser.avatar || `https://ui-avatars.com/api/?name=${fallbackName}&background=random`
      });

      alert(`Đăng ký thành công lớp: ${matchedCourse.title}!`)
      setIsJoinModalOpen(false)
      setJoinCode("")
      
      // 3. Tải lại danh sách lớp trực tiếp từ DB
      fetchMyCourses()
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || "Không thể tham gia lớp học. Vui lòng thử lại."
      setJoinError(errorMsg)
    }
  }

  if (selectedCourse) {
    return <StudentCourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)} />
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Môn học của tôi</h1>
          <p className="text-xs font-medium text-slate-500">Quản lý và theo dõi tiến độ các môn học trong kỳ.</p>
        </div>
      </div>

      {/* LƯỚI DANH SÁCH MÔN HỌC */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-xs font-medium">Đang tải dữ liệu lớp học...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          
          {courses.map((course, index) => (
            <div 
              key={course.id} 
              className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between group cursor-pointer hover:shadow-md transition-all ${index === 0 ? 'lg:col-span-2' : ''}`}
              onClick={() => setSelectedCourse(course)}
            >
              <div>
                <div className={`relative ${index === 0 ? 'h-56' : 'h-44'} bg-slate-900 overflow-hidden`}>
                  <img 
                    src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600"} 
                    alt={course.title} 
                    className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 flex items-center space-x-1.5 text-white/90 font-extrabold text-[10px] bg-slate-900/50 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <Building2 className="w-3 h-3" />
                    <span>{course.schoolName || "Chưa cập nhật"}</span>
                  </div>
                  <div className="absolute bottom-4 left-5 right-5 space-y-1.5">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${course.type === 'school' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
                      {course.subject}
                    </span>
                    <h2 className={`${index === 0 ? 'text-2xl' : 'text-lg'} font-black text-white tracking-tight truncate`}>
                      {course.title}
                    </h2>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{course.schedule || "Chưa có lịch"}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button className="w-full py-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-blue-600 font-bold rounded-xl text-xs transition cursor-pointer">
                  Vào không gian học
                </button>
              </div>
            </div>
          ))}

          {/* THẺ ĐĂNG KÝ MÔN MỚI */}
          <div 
            onClick={() => setIsJoinModalOpen(true)}
            className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 bg-slate-50/50 hover:bg-blue-50/20 transition flex flex-col items-center justify-center text-center space-y-3 min-h-[300px] cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full border-2 border-slate-300 group-hover:border-blue-500 text-slate-400 group-hover:text-blue-600 flex items-center justify-center transition">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-slate-800">Tham gia lớp mới</h4>
              <p className="text-xs text-slate-500 font-medium mt-1 max-w-[200px]">
                Nhập mã Code giáo viên cung cấp để vào lớp.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL JOIN LỚP */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border overflow-hidden">
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-sm">Tham Gia Lớp Học</h3>
              <button onClick={() => setIsJoinModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleJoinCourse} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">Mã lớp học (Class Code)</label>
                <input
                  type="text"
                  required
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="VD: CLASS-9A2B"
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold tracking-widest uppercase focus:ring-2 focus:ring-blue-500/20 text-center"
                />
              </div>

              {joinError && (
                <div className="flex items-center space-x-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{joinError}</span>
                </div>
              )}

              <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition shadow-md shadow-blue-500/20">
                Xác Nhận Tham Gia
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}