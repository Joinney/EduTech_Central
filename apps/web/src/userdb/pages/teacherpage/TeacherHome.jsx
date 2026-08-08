import React, { useState, useEffect, useRef } from "react"
import { 
  Sparkles, 
  Video, 
  PlusCircle, 
  Users, 
  BookOpen, 
  FileCheck, 
  Clock, 
  BarChart3, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  FolderPlus,
  MessageSquare
} from "lucide-react"

// Import Modal Onboarding dành riêng cho Giảng viên
import WelcomeTeacherModal from "../../components/WelcomeTeacherModal.jsx"

// Component Canvas hạt phân tử AI tông màu Hổ Phách / Cam dành cho Giảng viên
function TeacherParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    let animationFrameId

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const particleCount = 40
    const particles = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1.5,
        alpha: Math.random() * 0.5 + 0.5
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 237, 213, ${p.alpha})` // Hạt màu cam nhạt
        ctx.shadowBlur = 6
        ctx.shadowColor = "#ffedd5"
        ctx.fill()
        ctx.shadowBlur = 0

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 110) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * (1 - dist / 110)})`
            ctx.lineWidth = 0.75
            ctx.stroke()
          }
        }
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  )
}

export default function TeacherHome() {
  const [user, setUser] = useState(null)
  const [showTeacherModal, setShowTeacherModal] = useState(false)

  // Kiểm tra cờ is_onboarded khi Giảng viên vào Dashboard
  useEffect(() => {
    const loadUserData = () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)

          // Nếu chưa thực hiện onboarding (is_onboarded = false hoặc undefined)
          if (!parsedUser.is_onboarded) {
            setShowTeacherModal(true)
          }
        } catch (e) {
          console.error("Lỗi đọc dữ liệu người dùng:", e)
        }
      }
    }

    loadUserData()

    window.addEventListener("storage", loadUserData)
    return () => window.removeEventListener("storage", loadUserData)
  }, [])

  const handleOnboardingComplete = (updatedUser) => {
    setUser(updatedUser)
    setShowTeacherModal(false)
  }

  const teacherName = user?.fullName || user?.full_name || "Thầy/Cô"

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* ================= MODAL ONBOARDING DÀNH CHO GIẢNG VIÊN ================= */}
      <WelcomeTeacherModal
        isOpen={showTeacherModal}
        user={user}
        onComplete={handleOnboardingComplete}
      />

      {/* ================= THANH TẠO LỚP HỌC & GIẢNG DẠY TRỰC TUYẾN ================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">Phòng giảng dạy & Workshop trực tuyến</h3>
            <p className="text-xs font-medium text-slate-500">Khởi tạo buổi học Meet/Zoom trực tiếp hoặc mở phòng tư vấn 1:1.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0">
          <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white rounded-xl text-xs font-bold transition shadow-md shadow-orange-500/20 cursor-pointer">
            <PlusCircle className="w-4 h-4" />
            <span>Mở lớp giảng dạy mới</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer">
            <FolderPlus className="w-4 h-4 text-orange-600" />
            <span>Tạo bài giảng AI</span>
          </button>
        </div>
      </div>

      {/* ================= HÀNG 1: BANNER TỔNG QUAN GIẢNG DẠY (NỀN TÔNG CAM) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Banner Trợ lý Giảng dạy AI */}
        <div className="lg:col-span-2 relative rounded-3xl p-6 border border-orange-200 shadow-md overflow-hidden flex flex-col justify-between bg-gradient-to-br from-[#ea580c] via-[#f97316] to-[#f59e0b] text-white">
          
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none z-0" />
          <TeacherParticleCanvas />

          {/* Watermark 4 góc */}
          <span className="absolute top-3 left-4 text-[9px] font-bold text-white/30 pointer-events-none tracking-tight z-0">
            Bảng quản lý Giảng viên - EduTech Central
          </span>
          <span className="absolute top-3 right-4 text-[9px] font-bold text-white/30 pointer-events-none tracking-tight z-0">
            Bảng quản lý Giảng viên - EduTech Central
          </span>

          <div className="relative z-10 flex items-center space-x-2 font-black text-xl mb-5">
            <Sparkles className="w-5 h-5 text-amber-200 fill-amber-300 shrink-0" />
            <span className="tracking-tight">Trung tâm Trợ lý Sư phạm AI</span>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Card 1: Soạn giáo án */}
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-sm text-slate-800 flex flex-col justify-between border border-white/80">
              <div>
                <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider block mb-1">
                  Công cụ AI
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 mb-1 leading-snug">
                  Soạn đề thi & Giáo án
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mb-4">
                  Tự động sinh 50+ câu hỏi trắc nghiệm theo ma trận.
                </p>
              </div>
              <button className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                Tạo đề ngay
              </button>
            </div>

            {/* Card 2: Chấm bài tự động */}
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-sm text-slate-800 flex flex-col justify-between border border-white/60">
              <div>
                <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block mb-1">
                  Chấm điểm AI
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 mb-1 leading-snug">
                  Chấm tự luận & Code
                </h4>
                <p className="text-[11px] text-slate-600 font-medium mb-4">
                  Còn 18 bài tập học viên đang chờ phản hồi.
                </p>
              </div>
              <button className="w-full py-2 bg-white border-2 border-orange-500 hover:bg-orange-50 text-orange-600 rounded-xl text-xs font-bold transition cursor-pointer">
                Chấm bài (18)
              </button>
            </div>

            {/* Card 3: Phân tích học viên */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm text-slate-800 flex flex-col justify-between border border-white/40">
              <div>
                <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block mb-1">
                  Báo cáo Lớp
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 mb-1 leading-snug">
                  Phân tích kỹ năng
                </h4>
                <p className="text-[11px] text-slate-600 font-medium mb-4">
                  Phát hiện 5 học viên cần hỗ trợ lấy lại căn bản.
                </p>
              </div>
              <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                Xem chi tiết
              </button>
            </div>

          </div>
        </div>

        {/* Thống kê nhanh bên phải */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tổng số Học viên
              </span>
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900">342</span>
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                +14% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Đang theo học trong 4 lớp của bạn.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Đánh giá Giảng dạy
              </span>
              <BarChart3 className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-amber-500">4.9</span>
              <span className="text-xs font-bold text-slate-400">/ 5.0 (128 nhận xét)</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-[98%]" />
            </div>
          </div>
        </div>

      </div>

      {/* ================= HÀNG 2: LỊCH GIẢNG DẠY HÔM NAY + LỚP HỌC ĐANG QUẢN LÝ ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Danh sách Khóa học đang phụ trách */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-slate-800">Các Lớp học & Khóa học đang phụ trách</h3>
            <a href="#all-courses" className="text-xs font-bold text-orange-600 hover:underline">Quản lý tất cả</a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Lớp 1 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="bg-orange-100 text-orange-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Khối 12 - Chuyên sâu
                </span>
                <span className="text-xs font-bold text-slate-400">86 Học viên</span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  Luyện thi Toán THPT Quốc Gia 2026
                </h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">Tiến độ bài giảng: Module 8/12</p>
              </div>

              <div className="pt-2 flex space-x-2">
                <button className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                  Vào lớp học
                </button>
                <button className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer">
                  Sửa giáo án
                </button>
              </div>
            </div>

            {/* Lớp 2 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="bg-blue-100 text-blue-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Lập trình Web
                </span>
                <span className="text-xs font-bold text-slate-400">120 Học viên</span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  Fullstack ReactJS & Node.js 4.0
                </h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">Tiến độ bài giảng: Module 3/10</p>
              </div>

              <div className="pt-2 flex space-x-2">
                <button className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                  Vào lớp học
                </button>
                <button className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer">
                  Sửa giáo án
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Cột Lịch dạy hôm nay */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span>Lịch dạy hôm nay</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-orange-50/60 border border-orange-100 rounded-xl space-y-1">
              <div className="flex justify-between text-[11px] font-extrabold text-orange-700">
                <span>19:30 - 21:00</span>
                <span>TRỰC TUYẾN</span>
              </div>
              <h5 className="font-bold text-xs text-slate-800">
                Toán 12: Chuyên đề Đạo hàm & Tiệm cận
              </h5>
              <p className="text-[10px] text-slate-500">Phòng Google Meet • 42 Học viên đăng ký</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <div className="flex justify-between text-[11px] font-extrabold text-slate-500">
                <span>21:15 - 22:15</span>
                <span>TƯ VẤN 1:1</span>
              </div>
              <h5 className="font-bold text-xs text-slate-800">
                Giải đáp thắc mắc Đồ án Cuối khóa
              </h5>
              <p className="text-[10px] text-slate-500">Phòng Zoom • Học viên Nguyễn Văn B</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}