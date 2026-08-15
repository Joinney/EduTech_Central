import React, { useState, useEffect, useRef } from "react"
import { 
  Sparkles, 
  Video, 
  PlusCircle,
  FileText, 
  Layers, 
  Network, 
  ShoppingBag, 
  Eye, 
  Download, 
  PlayCircle, 
  ThumbsUp, 
  MessageSquare,
  Bookmark,
  Filter,
  Radio
} from "lucide-react"

// 🟢 Import Modals & Widgets
import WelcomeStudentModal from "../../components/WelcomeStudentModal.jsx"
import LichHocWidget from "../../../components/LichHocWidget.jsx"
import { courseService } from "../../../api/course.api.js"

const API_AUTH_URL = import.meta.env.VITE_API_AUTH_URL || "http://localhost:8001/api/v1"

// Component Canvas hạt phân tử AI
function ParticleCanvas() {
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

    const particleCount = 45
    const particles = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
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
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`
        ctx.shadowBlur = 6
        ctx.shadowColor = "#ffffff"
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
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 * (1 - dist / 110)})`
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

export default function StudentHome() {
  const [user, setUser] = useState(null)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [myCourses, setMyCourses] = useState([])

  // 1. Đồng bộ profile từ Server
  useEffect(() => {
    const fetchLatestProfile = async () => {
      const token = localStorage.getItem("token")
      if (!token) return

      try {
        const res = await fetch(`${API_AUTH_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const result = await res.json()

        if (res.ok && result.success) {
          const latestUser = result.data?.user || result.data
          localStorage.setItem("user", JSON.stringify(latestUser))
          window.dispatchEvent(new Event("user-profile-updated"))
        }
      } catch (err) {
        console.error("Không thể tự động đồng bộ profile từ Server:", err)
      }
    }

    fetchLatestProfile()
  }, [])

  // 2. Lấy dữ liệu khóa học thật của học sinh
  const fetchStudentCourses = async (studentId, studentEmail) => {
    try {
      const res = await courseService.getStudentJoinedCourses(studentId, studentEmail)
      const courses = Array.isArray(res) ? res : res?.data || []
      setMyCourses(courses)
    } catch (err) {
      console.error("Lỗi lấy danh sách khóa học:", err)
    }
  }

  // 3. Lắng nghe trạng thái đăng nhập
  useEffect(() => {
    const loadUserData = () => {
      const storedUser = localStorage.getItem("user")

      if (storedUser) {
        try {
          let parsedUser = JSON.parse(storedUser)
          while (parsedUser && (parsedUser.user || parsedUser.data)) {
            parsedUser = parsedUser.user || parsedUser.data
          }

          setUser(parsedUser)

          const onboardedStatus = parsedUser?.isOnboarded ?? parsedUser?.is_onboarded
          if (onboardedStatus !== true) {
            setShowWelcomeModal(true)
          } else {
            setShowWelcomeModal(false)
          }

          if (parsedUser?.id_users || parsedUser?.id) {
            fetchStudentCourses(parsedUser.id_users || parsedUser.id, parsedUser.email)
          }
        } catch (e) {
          console.error("Lỗi parse JSON user:", e)
          setShowWelcomeModal(true)
        }
      } else {
        setShowWelcomeModal(true)
      }
    }

    loadUserData()

    window.addEventListener("storage", loadUserData)
    window.addEventListener("user-profile-updated", loadUserData)

    return () => {
      window.removeEventListener("storage", loadUserData)
      window.removeEventListener("user-profile-updated", loadUserData)
    }
  }, [])

  const handleOnboardingComplete = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
    localStorage.setItem("isJustRegistered", "false")

    window.dispatchEvent(new Event("user-profile-updated"))
    setShowWelcomeModal(false)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 relative">
      
      {/* 🟢 MODAL ONBOARDING CHÀO MỪNG */}
      <WelcomeStudentModal
        isOpen={showWelcomeModal}
        user={user}
        onComplete={handleOnboardingComplete}
      />

      {/* 📅 WIDGET CUỐN LỊCH HỌC TẬP THỰC TẾ (GÓC TRÁI DƯỚI) */}
      <LichHocWidget courses={myCourses} />

      {/* ================= THANH TẠO & THAM GIA MEET ================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">Lớp học trực tuyến & Cuộc họp</h3>
            <p className="text-xs font-medium text-slate-500">Tạo phòng học Google Meet/Zoom mới hoặc tham gia bằng mã phòng.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0">
          <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 cursor-pointer">
            <PlusCircle className="w-4 h-4" />
            <span>Tạo cuộc họp mới</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer">
            <Video className="w-4 h-4 text-blue-600" />
            <span>Tham gia cuộc họp</span>
          </button>
        </div>
      </div>

      {/* ================= HÀNG 1: LỘ TRÌNH AI ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative rounded-3xl p-6 border border-slate-300/60 shadow-md overflow-hidden flex flex-col justify-between bg-gradient-to-br from-[#c8d3e0] via-[#b6c4d4] to-[#9eb0c3]">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-blue-200/20 pointer-events-none z-0" />
          <ParticleCanvas />

          <div className="relative z-10 flex items-center space-x-2 text-[#0a2540] font-black text-xl mb-5">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0" />
            <span className="tracking-tight">Lộ trình AI đề xuất</span>
          </div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-xs flex flex-col justify-between border border-white/60">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block mb-2">
                  Bài học tiếp theo
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 mb-2 leading-snug">
                  Cấu trúc dữ liệu nâng cao
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mb-6">
                  Hoàn thành 65% - Module 4
                </p>
              </div>
              <button className="w-full py-2.5 bg-[#0062d2] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer">
                Tiếp tục học
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-xs flex flex-col justify-between border border-white/40">
              <div>
                <span className="text-[10px] font-extrabold text-[#8a5d28] uppercase tracking-wider block mb-2">
                  Ôn tập (Đề xuất)
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 mb-2 leading-snug">
                  Thuật toán tối ưu
                </h4>
                <p className="text-[11px] text-slate-600 font-medium mb-6 leading-relaxed">
                  Dựa trên kết quả bài kiểm tra Python
                </p>
              </div>
              <button className="w-full py-2.5 bg-white/90 border-2 border-[#0062d2] hover:bg-blue-50 text-[#0062d2] rounded-xl text-xs font-bold transition shadow-xs cursor-pointer">
                Luyện tập ngay
              </button>
            </div>

            <div className="bg-[#d5ceca]/60 backdrop-blur-md p-5 rounded-2xl shadow-xs flex flex-col justify-between border border-white/30">
              <div>
                <span className="text-[10px] font-extrabold text-[#703b0d] uppercase tracking-wider block mb-2">
                  Kỹ năng thiếu
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 mb-2 leading-snug">
                  Big Data cơ bản
                </h4>
                <p className="text-[11px] text-slate-700 font-medium mb-6">
                  Lấp đầy khoảng trống kiến thức
                </p>
              </div>
              <button className="w-full py-2.5 bg-[#ff8c00] hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer">
                Bắt đầu
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                🌐
              </span>
              <span>Chỉ số tập trung AI</span>
            </div>
            
            <div className="h-14 flex items-end justify-between space-x-2 px-1 pt-2">
              <div className="w-full bg-blue-100 rounded-t h-[35%]" />
              <div className="w-full bg-blue-200 rounded-t h-[55%]" />
              <div className="w-full bg-blue-300 rounded-t h-[80%]" />
              <div className="w-full bg-blue-500 rounded-t h-[45%]" />
              <div className="w-full bg-blue-600 rounded-t h-[100%]" />
            </div>

            <p className="text-[11px] text-slate-500 leading-tight pt-1">
              Mức độ tập trung trung bình tuần này: <strong className="text-blue-600 font-bold">82%</strong>.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                <span className="text-base">🔥</span>
                <span>Chuỗi ngày học tập</span>
              </div>
              <span className="text-xl font-black text-amber-500">12</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 py-1">
              <div className="h-6 rounded bg-blue-100" />
              <div className="h-6 rounded bg-blue-200" />
              <div className="h-6 rounded bg-blue-300" />
              <div className="h-6 rounded bg-blue-600" />
              <div className="h-6 rounded bg-blue-600" />
              <div className="h-6 rounded bg-blue-300" />
              <div className="h-6 rounded bg-blue-400" />
            </div>

            <p className="text-[11px] text-slate-500 leading-tight">
              Bạn đang trong top 5% học viên chăm chỉ nhất tuần này!
            </p>
          </div>
        </div>
      </div>

      {/* ================= HÀNG 2: MÔN HỌC THỰC TẾ ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <span>Học kỳ hiện tại (Môn học chính quy)</span>
              <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                {myCourses.length} Môn
              </span>
            </h3>
            <a href="#view-all" className="text-xs font-bold text-blue-600 hover:underline">Xem tất cả</a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myCourses.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between group">
                <div className="relative h-40 bg-slate-100">
                  <img 
                    src={c.thumbnail || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=80"} 
                    alt={c.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs uppercase">
                    {c.type === "school" ? "Chính Quy" : "Tự Do"}
                  </span>
                  {(c.meetIsActive || c.meet_is_active) && (
                    <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1 shadow-xs animate-pulse">
                      <Radio className="w-3 h-3" />
                      <span>Đang Live</span>
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                      {c.subject || "MÔN HỌC"} - {c.grade || "KHỐI 12"}
                    </span>
                    <h4 className="font-bold text-sm text-slate-800 mt-0.5 line-clamp-1">
                      {c.title}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    👨‍🏫 {c.teacher_name || c.teacherName || "Giảng viên bộ môn"}
                  </p>

                  <div className="grid grid-cols-3 gap-1 pt-1">
                    <button className="flex items-center justify-center space-x-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[9px] font-bold text-slate-700 transition">
                      <FileText className="w-3 h-3 text-slate-500" />
                      <span>TÓM TẮT AI</span>
                    </button>
                    <button className="flex items-center justify-center space-x-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[9px] font-bold text-slate-700 transition">
                      <Layers className="w-3 h-3 text-slate-500" />
                      <span>FLASHCARDS</span>
                    </button>
                    <button className="flex items-center justify-center space-x-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[9px] font-bold text-slate-700 transition">
                      <Network className="w-3 h-3 text-slate-500" />
                      <span>SƠ ĐỒ TƯ DUY</span>
                    </button>
                  </div>

                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                    Vào Học Ngay
                  </button>
                </div>
              </div>
            ))}

            {myCourses.length === 0 && (
              <div className="col-span-2 p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                Bạn chưa được phân bổ vào lớp học chính quy nào.
              </div>
            )}
          </div>
        </div>

        {/* Cột Bộ lọc */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 h-fit">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Bộ lọc học liệu</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Loại File</label>
              <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500">
                <option>Tất cả (All)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Khối / Môn học</label>
              <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500">
                <option>Tất cả khối lớp</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Năm học</label>
              <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500">
                <option>2026-2027</option>
              </select>
            </div>

            <button className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition mt-2 cursor-pointer">
              Áp dụng bộ lọc
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}