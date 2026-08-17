/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react"
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  School, 
  Users, 
  CheckCircle2, 
  CreditCard, 
  Calendar, 
  Building2, 
  ArrowRight,
  Loader2,
  Tag,
  Plus,
  Radio,
  X,
  AlertCircle,
  Unlock,
  GraduationCap,
  HelpCircle,
  Check
} from "lucide-react"

import { courseService } from "../../../../api/course.api"
import { paymentApi } from "../../../../api/payment.api"
import StudentCourseDetail from "./StudentCourseDetail.jsx"
import LichHocWidget from "../../../../components/LichHocWidget.jsx"

export default function Courses() {
  const [allCourses, setAllCourses] = useState([])
  const [joinedCourses, setJoinedCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [activeTab, setActiveTab] = useState("my_courses") // "my_courses" | "free_courses" | "paid_courses"
  const [searchTerm, setSearchTerm] = useState("")
  const [subTypeFilter, setSubTypeFilter] = useState("all") // "all" | "school" | "external"

  // Modal tham gia bằng mã lớp
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [joinError, setJoinError] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Nhận diện học sinh đang đăng nhập
  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("user")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }, [])

  const studentId = useMemo(() => {
    return Number(currentUser?.id_users || currentUser?.id || currentUser?.user_id || currentUser?.userId || 1)
  }, [currentUser])

  const studentName = useMemo(() => {
    return currentUser?.displayName || currentUser?.fullName || currentUser?.name || currentUser?.username || "Học viên"
  }, [currentUser])

  const studentEmail = useMemo(() => {
    return currentUser?.email || "student@gmail.com"
  }, [currentUser])

  // 1. Tải danh sách môn học của tôi và toàn bộ khóa học công khai
  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [allRes, myRes] = await Promise.all([
        courseService.getAllCourses().catch(() => []),
        courseService.getStudentJoinedCourses(studentId).catch(() => [])
      ])

      const allList = Array.isArray(allRes) ? allRes : (allRes?.data || [])
      const myList = Array.isArray(myRes) ? myRes : (myRes?.data || [])

      setAllCourses(allList)
      setJoinedCourses(myList)
    } catch (err) {
      console.error("Lỗi khi tải danh sách môn học:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [studentId])

  // Set ID các khóa học đã ghi danh
  const joinedCourseIds = useMemo(() => {
    return new Set(joinedCourses.map((c) => Number(c.id || c.course_id || c.id_course)))
  }, [joinedCourses])

  // 2. Lọc danh sách theo Tab và từ khóa tìm kiếm
  const displayCourses = useMemo(() => {
    return allCourses.filter((c) => {
      const isApproved = (c.status || "APPROVED") === "APPROVED"
      const matchSearch =
        (c.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.schoolName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.code || "").toLowerCase().includes(searchTerm.toLowerCase())

      if (!matchSearch) return false

      const courseId = Number(c.id || c.course_id || c.id_course)
      const price = Number(c.price || 0)

      if (activeTab === "my_courses") {
        const isJoined = joinedCourseIds.has(courseId)
        if (!isJoined) return false
        if (subTypeFilter === "school") return c.type === "school"
        if (subTypeFilter === "external") return c.type !== "school"
        return true
      }

      if (activeTab === "free_courses") {
        return isApproved && price === 0
      }

      if (activeTab === "paid_courses") {
        return isApproved && price > 0
      }

      return false
    })
  }, [allCourses, joinedCourseIds, activeTab, subTypeFilter, searchTerm])

  // 3. Xử lý tham gia bằng mã lớp (Code)
  const handleJoinByCode = async (e) => {
    e.preventDefault()
    setJoinError("")
    if (!joinCode.trim()) return

    try {
      setIsJoining(true)
      const matchedCourse = await courseService.joinCourseByCode(joinCode.trim().toUpperCase())

      await courseService.joinCourse(matchedCourse.id, {
        student_id: studentId,
        student_name: studentName,
        student_email: studentEmail,
        avatar_url: currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=random`
      })

      alert(`🎉 Đăng ký thành công khóa học: "${matchedCourse.title}"!`)
      setIsJoinModalOpen(false)
      setJoinCode("")
      fetchData()
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || "Mã lớp không hợp lệ hoặc không thể tham gia!"
      setJoinError(errorMsg)
    } finally {
      setIsJoining(false)
    }
  }

  // 4. Xử lý ghi danh lớp học miễn phí
  const handleJoinFreeCourse = async (course) => {
    try {
      await courseService.joinCourse(course.id, {
        student_id: studentId,
        student_name: studentName,
        student_email: studentEmail,
        avatar_url: currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=random`
      })
      alert(`🎉 Chúc mừng bạn đã ghi danh thành công khóa học "${course.title}"!`)
      fetchData()
    } catch (err) {
      console.error("Lỗi tham gia khóa học:", err)
      alert(err.response?.data?.error || "Không thể đăng ký lúc này!")
    }
  }

  // 5. Xử lý thanh toán lớp học có phí qua VNPay Sandbox
  const handlePayForCourse = async (course) => {
    try {
      setIsProcessingPayment(true)
      const res = await paymentApi.createPaymentUrl({
        user_id: Number(studentId),
        user_name: studentName,
        user_email: studentEmail,
        course_id: Number(course.id),
        course_title: course.title,
        amount: Number(course.price)
      })

      if (res?.payment_url) {
        window.location.href = res.payment_url
      } else {
        alert("Không nhận được URL thanh toán từ cổng VNPay!")
      }
    } catch (err) {
      console.error("Lỗi tạo thanh toán VNPay:", err)
      alert("Không thể khởi tạo thanh toán VNPay lúc này. Vui lòng thử lại!")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Nếu đang xem chi tiết khóa học
  if (selectedCourse) {
    return (
      <StudentCourseDetail 
        course={selectedCourse} 
        onBack={() => {
          setSelectedCourse(null)
          fetchData()
        }} 
      />
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-fadeIn font-sans">
      {/* Widget Lịch Học Nổi & Tự Động Phóng To */}
      <LichHocWidget courses={joinedCourses} />

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Học Viện & Không Gian Đào Tạo Trực Tuyến</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Khóa Học & Môn Học Của Tôi</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Theo dõi tiến độ lớp chính quy, khám phá các khóa kỹ năng tự do miễn phí và nâng cao.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setJoinError("")
              setJoinCode("")
              setIsJoinModalOpen(true)
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1.5 cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tham Gia Bằng Mã Lớp</span>
          </button>
        </div>
      </div>

      {/* ================= THANH TABS & TÌM KIẾM ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => setActiveTab("my_courses")}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === "my_courses"
                ? "bg-white text-blue-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Môn Học Của Tôi ({joinedCourses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("free_courses")}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === "free_courses"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            <Unlock className="w-4 h-4" />
            <span>Khóa Học Tự Do Miễn Phí</span>
          </button>

          <button
            onClick={() => setActiveTab("paid_courses")}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === "paid_courses"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-amber-700 hover:bg-amber-50"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Khóa Trả Phí (VNPay)</span>
          </button>
        </div>

        {/* Ô Tìm Kiếm */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên môn, giảng viên, trường..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {/* Bộ Lọc Con Phân Loại Chính Quy / Tự Do (Chỉ hiển thị ở Tab "Môn học của tôi") */}
      {activeTab === "my_courses" && (
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Lọc theo diện:</span>
          {[
            { id: "all", label: "Tất cả môn" },
            { id: "school", label: "Chính quy (Nhà trường)" },
            { id: "external", label: "Kỹ năng / Tự do" }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSubTypeFilter(st.id)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                subTypeFilter === st.id
                  ? "bg-[#38497C] text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      )}

      {/* ================= LƯỚI KHÓA HỌC ================= */}
      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xs font-medium">Đang đồng bộ dữ liệu khóa học...</span>
        </div>
      ) : displayCourses.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs space-y-2">
          <p className="font-bold text-slate-600 text-sm">Không tìm thấy khóa học nào trong mục này.</p>
          <p className="text-slate-400">
            {activeTab === "my_courses" 
              ? "Bạn chưa tham gia khóa học nào. Hãy khám phá các khóa tự do miễn phí hoặc nhập mã lớp để bắt đầu!" 
              : "Thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục khóa học khác."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCourses.map((course) => {
            const courseId = Number(course.id || course.course_id || course.id_course)
            const isSchool = course.type === "school"
            const isLive = course.meetIsActive || course.meet_is_active
            const isJoined = joinedCourseIds.has(courseId)
            const isPaid = Number(course.price || 0) > 0

            return (
              <div
                key={courseId}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Ảnh Bìa Khóa Học */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                    {/* Huy hiệu loại lớp & Học phí */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg shadow-xs flex items-center gap-1 ${
                          isSchool ? "bg-blue-600 text-white" : "bg-purple-600 text-white"
                        }`}
                      >
                        {isSchool ? <School className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                        <span>{isSchool ? "Chính Quy" : "Tự Do"}</span>
                      </span>

                      {isPaid ? (
                        <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-black uppercase rounded-lg shadow-xs flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          <span>{Number(course.price).toLocaleString("vi-VN")} đ</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-lg shadow-xs flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>Miễn Phí</span>
                        </span>
                      )}
                    </div>

                    {/* Huy hiệu Đang Live */}
                    {isLive && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-rose-600 text-white text-[10px] font-black rounded-lg flex items-center space-x-1 shadow-sm animate-pulse">
                        <Radio className="w-3 h-3" />
                        <span>Đang Live</span>
                      </div>
                    )}

                    {/* Tên Trường & Môn */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white/90 text-xs font-semibold">
                      <div className="flex items-center space-x-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span className="truncate">{course.schoolName || "EduTech Academy"}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-md shrink-0">
                        {course.subject}
                      </span>
                    </div>
                  </div>

                  {/* Thân Thẻ */}
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

                {/* Chân Thẻ: Nút Tác Vụ */}
                <div className="p-5 pt-0">
                  {isJoined ? (
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/20 cursor-pointer active:scale-95"
                    >
                      <span>Vào Không Gian Học</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : isPaid ? (
                    <button
                      onClick={() => handlePayForCourse(course)}
                      disabled={isProcessingPayment}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Thanh toán VNPay ({Number(course.price).toLocaleString("vi-VN")} đ)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinFreeCourse(course)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đăng Ký Học Miễn Phí</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ================= MODAL THAM GIA BẰNG MÃ LỚP ================= */}
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

            <form onSubmit={handleJoinByCode} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Mã lớp học (Class Code) *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="VD: SKILL-A1B2"
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
                  disabled={isJoining}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer active:scale-95 flex items-center justify-center space-x-1.5"
                >
                  {isJoining && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isJoining ? "Đang xác nhận..." : "Xác Nhận Tham Gia"}</span>
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