/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import {
  ArrowLeft,
  Calendar,
  Clock,
  GraduationCap,
  CheckCircle2,
  FileText,
  Download,
  BookOpen,
  Share2,
  Bookmark,
  PlusCircle,
  Award,
  Video,
  ChevronDown,
  ChevronUp,
  Star,
  ShieldCheck,
  Building,
  Mail,
  HelpCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Loader2
} from "lucide-react"

import { courseService } from "../../../../api/course.api"

const DEFAULT_TEACHER_IMG = "/thekhoahoc/thaygiao.png"

// 🎯 Khung bài học mẫu
const generateSampleChapters = (subjectName = "Học phần") => [
  {
    id: "c1",
    title: `Chương 1: Tổng quan nền tảng & Kiến thức cốt lõi môn ${subjectName}`,
    duration: "6 Tiết",
    lessons: [
      { name: "Khái niệm mở đầu và định hướng nghiên cứu", type: "theory", duration: "45p" },
      { name: "Phương pháp luận và các công cụ thực hành chính", type: "theory", duration: "60p" },
      { name: "Bài thực hành 01: Thiết lập môi trường & bài tập căn bản", type: "lab", duration: "90p" }
    ]
  },
  {
    id: "c2",
    title: `Chương 2: Kỹ thuật phân tích & Mô hình ứng dụng chuyên sâu`,
    duration: "9 Tiết",
    lessons: [
      { name: "Các thuật toán và định lý trọng tâm", type: "theory", duration: "90p" },
      { name: "Xây dựng sơ đồ tư duy và phân tích ca điển hình (Case Study)", type: "theory", duration: "60p" },
      { name: "Bài thực hành 02: Giải quyết bài toán thực tế", type: "lab", duration: "120p" }
    ]
  },
  {
    id: "c3",
    title: `Chương 3: Tối ưu hóa hiệu năng & Thực chiến chuyên đề`,
    duration: "12 Tiết",
    lessons: [
      { name: "Nguyên lý thiết kế hệ thống & kiểm thử chất lượng", type: "theory", duration: "90p" },
      { name: "Bài thực hành 03: Tối ưu dữ liệu và xử lý tình huống nâng cao", type: "lab", duration: "120p" }
    ]
  },
  {
    id: "c4",
    title: `Chương 4: Đồ án tổng kết học phần & Hướng dẫn báo cáo`,
    duration: "8 Tiết",
    lessons: [
      { name: "Tổng hợp kiến thức và tiêu chuẩn đánh giá cuối kỳ", type: "theory", duration: "60p" },
      { name: "Bảo vệ đồ án / Báo cáo kết quả nghiên cứu", type: "lab", duration: "120p" }
    ]
  }
]

// 🎯 Giáo trình tài liệu mẫu
const generateSampleMaterials = (subjectName = "Mon_Hoc") => [
  { id: "m1", name: `Giao_Trinh_Chuan_${subjectName.replace(/\s+/g, "_")}.pdf`, size: "14.2 MB", type: "PDF", downloads: 840 },
  { id: "m2", name: `Slide_Bai_Giang_Tong_Hop_Toan_Tap.pdf`, size: "8.6 MB", type: "PDF", downloads: 620 },
  { id: "m3", name: `Bo_De_Cuong_On_Tap_Va_Cau_Hoi_Thi.pdf`, size: "3.4 MB", type: "PDF", downloads: 512 },
  { id: "m4", name: `Huong_Dan_Lam_Do_An_Thuc_Hanh.pdf`, size: "1.8 MB", type: "PDF", downloads: 310 }
]

export default function CourseDetailPage({ onBack }) {
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // 🎯 Bóc tách ID an toàn tuyệt đối từ cả useParams, props và URL thực tế: /courses/:id
  const targetId = useMemo(() => {
    if (params?.id) return String(params.id).trim()
    // Quét trực tiếp pathname: ví dụ /student/courses/25 -> lấy 25
    const pathParts = location.pathname.split("/").filter(Boolean)
    const lastPart = pathParts[pathParts.length - 1]
    return lastPart && !isNaN(lastPart) ? String(lastPart).trim() : ""
  }, [params, location.pathname])

  const [course, setCourse] = useState(null)
  const [chapters, setChapters] = useState([])
  const [materials, setMaterials] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [activeTab, setActiveTab] = useState("curriculum")
  const [openChapters, setOpenChapters] = useState({ c1: true, c2: true })
  const [isRegistered, setIsRegistered] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [savedBookmark, setSavedBookmark] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(""), 3000)
  }

  useEffect(() => {
    const fetchFullCourseData = async () => {
      setIsLoading(true)
      try {
        let cData = null
        const baseUrl = import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1"

        // 1. Thử gọi API lấy trực tiếp theo ID
        if (targetId) {
          try {
            const directRes = await fetch(`${baseUrl}/courses/${targetId}`).then(r => r.ok ? r.json() : null)
            cData = directRes?.data || directRes
          } catch (_) {}
        }

        // 2. Nếu direct API không có, lấy qua getAllCourses và tìm đúng ID
        if (!cData || (!cData.id && !cData.id_course)) {
          const allRes = await courseService.getAllCourses().catch(() => [])
          const allList = Array.isArray(allRes) ? allRes : (allRes?.data || [])

          if (targetId) {
            cData = allList.find((item) => {
              const rawId = item.id ?? item.id_course ?? item.course_id
              return String(rawId).trim() === targetId
            })
          }

          // Fallback nếu không thấy ID chỉ định
          if (!cData && allList.length > 0) {
            cData = allList[0]
          }
        }

        // 3. Xử lý dữ liệu hiển thị
        if (cData) {
          const realUploadedImg = 
            (cData.thumbnail && !cData.thumbnail.includes("unsplash.com") && !cData.thumbnail.includes("thekhoahoc")) 
              ? cData.thumbnail 
              : (cData.teacher_img || cData.teacherImg || cData.teacher_avatar)

          const isUIAvatar = realUploadedImg && realUploadedImg.includes("ui-avatars.com")
          const cleanTeacherImg = (realUploadedImg && !isUIAvatar) ? realUploadedImg : DEFAULT_TEACHER_IMG

          const currentCourseTitle = cData.title || cData.courseName || "Khóa Học Đào Tạo"
          const currentSubject = cData.subject || "Chuyên môn"

          setCourse({
            id: cData.id || cData.id_course,
            courseName: currentCourseTitle,
            subject: currentSubject,
            code: cData.code || `SKILL-${cData.id || targetId || "2026"}`,
            credits: cData.credits || 3,
            grade: cData.schoolName || cData.school_name || cData.grade || "Cơ sở Đào tạo",
            rating: 4.9,
            ratingCount: 128,
            schedule: cData.schedule || "Linh hoạt",
            timeDetail: cData.schedule?.includes("(") ? cData.schedule.split("(")[1]?.replace(")", "") : "19:30 - 21:00",
            room: cData.room || "Phòng học trực tuyến / Live Meet",
            profileProgress: 90,
            price: Number(cData.price) || 0,
            description: cData.description && cData.description !== "Chưa có mô tả." 
              ? cData.description 
              : `Khóa học chuyên sâu về ${currentCourseTitle} thuộc chuyên môn ${currentSubject}. Sinh viên được cung cấp kiến thức nền tảng vững chắc kết hợp phương pháp luận thực chiến và hệ thống bài tập thực hành ứng dụng cao.`,
            teacher: {
              name: cData.teacher_name || cData.teacherName || "Giảng viên phụ trách",
              title: "Giảng viên chuyên môn",
              department: cData.schoolName || cData.school_name || "Khoa Đào tạo",
              email: cData.teacher_email || "giangvien@edutech.vn",
              room: "Văn phòng Bộ môn",
              avatar: cleanTeacherImg,
              experience: "Nhiều năm kinh nghiệm giảng dạy và phát triển các giải pháp công nghệ đào tạo thực tế."
            }
          })

          // 4. Lấy bài giảng thật hoặc mẫu
          try {
            const lessonRes = await courseService.getLessonsByCourse(cData.id || cData.id_course)
            const lessonList = Array.isArray(lessonRes) ? lessonRes : (lessonRes?.data || [])

            if (lessonList.length > 0) {
              setChapters([
                {
                  id: "c1",
                  title: `Nội dung bài học chính khóa (${lessonList.length} bài)`,
                  duration: `${lessonList.length * 2} Tiết`,
                  lessons: lessonList.map((ls, idx) => ({
                    name: ls.title || `Bài ${idx + 1}`,
                    type: ls.videoUrl ? "lab" : "theory",
                    duration: "45p"
                  }))
                },
                ...generateSampleChapters(currentSubject).slice(1)
              ])

              const docs = []
              lessonList.forEach((l, idx) => {
                if (l.fileUrl || l.file_url) {
                  docs.push({
                    id: `mat-${l.id || idx}`,
                    name: l.fileName || l.file_name || l.title || `Tài liệu bài học ${idx + 1}`,
                    size: "3.5 MB",
                    type: (l.fileUrl || l.file_url).endsWith(".zip") ? "ZIP" : "PDF",
                    downloads: 150,
                    url: l.fileUrl || l.file_url
                  })
                }
              })
              setMaterials(docs.length > 0 ? docs : generateSampleMaterials(currentCourseTitle))
            } else {
              setChapters(generateSampleChapters(currentSubject))
              setMaterials(generateSampleMaterials(currentCourseTitle))
            }
          } catch (_) {
            setChapters(generateSampleChapters(currentSubject))
            setMaterials(generateSampleMaterials(currentCourseTitle))
          }
        } else {
          setCourse(null)
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin khóa học:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFullCourseData()
  }, [targetId])

  const toggleChapter = (id) => {
    setOpenChapters((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleAllChapters = (expand) => {
    const nextState = {}
    chapters.forEach((c) => {
      nextState[c.id] = expand
    })
    setOpenChapters(nextState)
  }

  const confirmRegister = () => {
    setIsRegistered(true)
    setShowConfirmModal(false)
    triggerToast("Đăng ký môn học thành công! Đã thêm vào lịch học của bạn.")
  }

  const handleGoBack = () => {
    if (typeof onBack === "function") {
      onBack()
    } else {
      navigate(-1)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
        <p className="text-xs font-bold text-slate-500">
          Đang đồng bộ dữ liệu khóa học ID: #{targetId || "..."}
        </p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center font-sans space-y-4">
        <p className="text-sm font-bold text-slate-600">Không tìm thấy khóa học có mã #{targetId}.</p>
        <button onClick={handleGoBack} className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold cursor-pointer">
          Quay lại trang trước
        </button>
      </div>
    )
  }

  return (
    <div className="course-detail-universe">
      <style>{`
        .course-detail-universe {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0f172a;
        }
        .glass-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.8);
          padding: 12px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .back-interactive-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #1e3a8a;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .back-interactive-btn:hover {
          background: #e0e7ff;
          border-color: #1e3a8a;
          transform: translateX(-2px);
        }
        .header-tool-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .header-tool-btn:hover {
          background: #f8fafc;
          color: #1e3a8a;
          border-color: #93c5fd;
        }
        .detail-hero-stage {
          position: relative;
          background: radial-gradient(circle at 10% 20%, #1e3a8a 0%, #0f172a 75%, #020617 100%);
          color: #ffffff;
          padding: 48px 24px 56px;
          overflow: hidden;
        }
        .hero-pattern-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
        }
        .hero-light-glow {
          position: absolute;
          top: -80px;
          right: 20%;
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
        }
        .hero-center-box {
          max-width: 1240px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 40px;
          align-items: center;
        }
        .tag-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 9999px;
          background: rgba(56, 189, 248, 0.15);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #38bdf8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .hero-course-title {
          font-size: 32px;
          font-weight: 900;
          line-height: 1.2;
          letter-spacing: -0.6px;
          margin-bottom: 14px;
          background: linear-gradient(180deg, #ffffff 60%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-chips-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 12px;
          color: #cbd5e1;
        }
        .hero-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.08);
          padding: 6px 12px;
          border-radius: 8px;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glass-side-widget {
          background: #ffffff;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.35);
          border: 1px solid #e2e8f0;
          color: #0f172a;
        }
        .side-metric-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px dashed #e2e8f0;
          font-size: 13px;
        }
        .reg-sparkle-btn {
          width: 100%;
          margin-top: 18px;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 8px 18px rgba(234, 88, 12, 0.3);
          transition: all 0.25s ease;
        }
        .reg-sparkle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(234, 88, 12, 0.4);
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        }
        .reg-sparkle-btn.registered {
          background: #059669;
          box-shadow: none;
          cursor: default;
        }
        .detail-body-grid {
          max-width: 1240px;
          margin: 32px auto 60px;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 32px;
          align-items: start;
        }
        .modern-tab-shelf {
          display: flex;
          border-bottom: 2px solid #e2e8f0;
          gap: 28px;
          margin-bottom: 24px;
        }
        .modern-tab-btn {
          background: none;
          border: none;
          padding: 12px 4px;
          font-size: 14px;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          position: relative;
          transition: color 0.2s;
        }
        .modern-tab-btn.active {
          color: #1e3a8a;
        }
        .modern-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 3px;
          background: #1e3a8a;
          border-radius: 3px;
        }
        .chap-container {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 14px;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        .chap-head-bar {
          width: 100%;
          padding: 14px 18px;
          background: #ffffff;
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          text-align: left;
        }
        .lesson-list-wrap {
          border-top: 1px solid #f1f5f9;
          background: #fafafa;
          padding: 8px 14px;
        }
        .lesson-row-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 8px;
          margin: 6px 0;
          font-size: 13px;
        }
        .side-instructor-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
          margin-bottom: 20px;
        }
        .instructor-avatar-frame {
          width: 64px;
          height: 72px;
          border-radius: 14px;
          background: #f1f5f9;
          border: 2px solid #38bdf8;
          overflow: hidden;
          flex-shrink: 0;
        }
        .instructor-avatar-frame img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: bottom center;
        }
        @media (max-width: 960px) {
          .hero-center-box,
          .detail-body-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <header className="glass-nav">
        <button className="back-interactive-btn" onClick={handleGoBack}>
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            className={`header-tool-btn ${savedBookmark ? "text-amber-500 bg-amber-50 border-amber-300" : ""}`}
            onClick={() => {
              setSavedBookmark(!savedBookmark)
              triggerToast(savedBookmark ? "Đã gỡ khỏi danh sách lưu" : "Đã lưu vào danh sách yêu thích")
            }}
            title="Lưu khóa học"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            className="header-tool-btn"
            onClick={() => triggerToast("Đã sao chép liên kết khóa học vào bộ nhớ tạm")}
            title="Chia sẻ"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <section className="detail-hero-stage">
        <div className="hero-pattern-grid" />
        <div className="hero-light-glow" />

        <div className="hero-center-box">
          <div>
            <div className="tag-pill-badge">
              <Sparkles className="w-3 h-3" />
              <span>{course.code} • {course.grade}</span>
            </div>
            <h1 className="hero-course-title">{course.courseName}</h1>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed max-w-2xl font-normal">
              {course.description}
            </p>

            <div className="hero-chips-bar">
              <div className="hero-chip">
                <GraduationCap className="w-4 h-4 text-sky-400" />
                <span>Đơn vị: <strong>{course.grade}</strong></span>
              </div>
              <div className="hero-chip">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Lịch: <strong>{course.schedule}</strong></span>
              </div>
              <div className="hero-chip">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Khung giờ: <strong>{course.timeDetail}</strong></span>
              </div>
              <div className="hero-chip">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{course.rating} ({course.ratingCount} đánh giá)</span>
              </div>
            </div>
          </div>

          <div className="glass-side-widget">
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Thông tin tuyển sinh</span>
              <span className="text-xs text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold">
                {course.price > 0 ? `${course.price.toLocaleString("vi-VN")} đ` : "Miễn phí"}
              </span>
            </h3>

            <div className="side-metric-item">
              <span className="text-slate-500 font-medium">Số tín chỉ / Quy mô</span>
              <span className="font-bold text-slate-900">{course.credits} Tín chỉ</span>
            </div>
            <div className="side-metric-item">
              <span className="text-slate-500 font-medium">Địa điểm / Hình thức</span>
              <span className="font-bold text-slate-900">{course.room}</span>
            </div>
            <div className="side-metric-item">
              <span className="text-slate-500 font-medium">Tổng số chương</span>
              <span className="font-bold text-slate-900">{chapters.length} Chương</span>
            </div>
            <div className="side-metric-item">
              <span className="text-slate-500 font-medium">Tiến độ tuyển sinh</span>
              <span className="font-extrabold text-blue-900">{course.profileProgress}%</span>
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-900 h-full rounded-full" style={{ width: `${course.profileProgress}%` }} />
            </div>

            <button
              className={`reg-sparkle-btn ${isRegistered ? "registered" : ""}`}
              onClick={() => {
                if (!isRegistered) setShowConfirmModal(true)
              }}
            >
              {isRegistered ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> ĐÃ ĐĂNG KÝ HỌC PHẦN
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" /> ĐĂNG KÝ MÔN HỌC NGAY
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      <main className="detail-body-grid">
        <div>
          <div className="modern-tab-shelf">
            <button
              className={`modern-tab-btn ${activeTab === "curriculum" ? "active" : ""}`}
              onClick={() => setActiveTab("curriculum")}
            >
              Khung bài học ({chapters.length} Chương)
            </button>
            <button
              className={`modern-tab-btn ${activeTab === "materials" ? "active" : ""}`}
              onClick={() => setActiveTab("materials")}
            >
              Tài liệu & Giáo trình ({materials.length})
            </button>
            <button
              className={`modern-tab-btn ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Đánh giá & Phản hồi
            </button>
          </div>

          {activeTab === "curriculum" && (
            <div>
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 mb-6">
                <h4 className="font-extrabold text-sm text-blue-950 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-800" /> Điểm nổi bật của môn học
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-900">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-800 shrink-0" />
                    <span>Nội dung giảng dạy bám sát thực tiễn chương trình {course.grade}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-800 shrink-0" />
                    <span>Hệ thống bài tập thực hành kèm tài liệu tải về trực tiếp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-800 shrink-0" />
                    <span>Được cấp chứng chỉ hoàn thành học phần</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-800 shrink-0" />
                    <span>Hỗ trợ tương tác và giải đáp thắc mắc với Giảng viên</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-500">
                  Tổng thời lượng: 45 tiết chuẩn • {chapters.length} Chương học
                </span>
                <div className="flex gap-2">
                  <button
                    className="text-xs font-bold text-blue-900 hover:underline cursor-pointer"
                    onClick={() => toggleAllChapters(true)}
                  >
                    Mở tất cả
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    className="text-xs font-bold text-slate-500 hover:underline cursor-pointer"
                    onClick={() => toggleAllChapters(false)}
                  >
                    Thu gọn
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {chapters.map((chap) => {
                  const isOpen = !!openChapters[chap.id]
                  return (
                    <div key={chap.id} className="chap-container">
                      <button className="chap-head-bar" onClick={() => toggleChapter(chap.id)}>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-800 font-extrabold text-xs flex items-center justify-center">
                            {chap.id.toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900">{chap.title}</h4>
                            <span className="text-xs text-slate-500 font-medium">
                              {chap.lessons.length} bài học • {chap.duration}
                            </span>
                          </div>
                        </div>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>

                      {isOpen && (
                        <div className="lesson-list-wrap">
                          {chap.lessons.map((ls, idx) => (
                            <div key={idx} className="lesson-row-card">
                              <div className="flex items-center gap-2.5">
                                <BookOpen className="w-3.5 h-3.5 text-blue-800 shrink-0" />
                                <span className="font-semibold text-slate-800">{ls.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${ls.type === "theory" ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700"}`}>
                                  {ls.type === "theory" ? "Lý thuyết" : "Thực hành"}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">{ls.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === "materials" && (
            <div className="flex flex-col gap-3">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-sky-400 hover:shadow-xs transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {mat.type}
                    </div>
                    <div className="truncate">
                      <h5 className="font-bold text-sm text-slate-900 truncate">{mat.name}</h5>
                      <span className="text-xs text-slate-500">
                        {mat.size} • {mat.downloads} lượt tải về
                      </span>
                    </div>
                  </div>
                  <button
                    className="p-2.5 bg-slate-100 hover:bg-blue-900 hover:text-white text-slate-600 rounded-lg transition shrink-0 cursor-pointer"
                    onClick={() => {
                      if (mat.url) {
                        window.open(mat.url, "_blank")
                      }
                      triggerToast(`Đang tải tệp: ${mat.name}`)
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4 flex items-center gap-6">
                <div className="text-center border-r border-slate-200 pr-6">
                  <div className="text-4xl font-extrabold text-slate-900">{course.rating}</div>
                  <div className="flex gap-1 text-yellow-400 my-1 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">{course.ratingCount} lượt đánh giá</span>
                </div>
                <div className="flex-1 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span>5 Sao</span>
                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[90%]" />
                    </div>
                    <span>90%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>4 Sao</span>
                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[10%]" />
                    </div>
                    <span>10%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-sm text-slate-900">Học viên EduTech</span>
                      <span className="text-xs text-slate-500 ml-2">({course.grade})</span>
                    </div>
                    <span className="text-xs text-slate-400">Gần đây</span>
                  </div>
                  <div className="flex gap-1 text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Giảng viên giảng dạy rất chi tiết, nhiệt tình hỗ trợ học viên giải đáp các thắc mắc chuyên môn!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <aside>
          <div className="side-instructor-card">
            <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-4">
              Giảng viên phụ trách
            </h4>
            <div className="flex items-center gap-3.5 mb-3.5">
              <div className="instructor-avatar-frame">
                <img 
                  src={course.teacher.avatar} 
                  alt={course.teacher.name} 
                  onError={(e) => { e.currentTarget.src = DEFAULT_TEACHER_IMG }}
                />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{course.teacher.name}</h3>
                <p className="text-xs text-slate-500 font-semibold">{course.teacher.title}</p>
                <p className="text-[11px] text-blue-900 font-bold">{course.teacher.department}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {course.teacher.experience}
            </p>

            <div className="text-xs text-slate-600 border-t border-slate-100 pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.teacher.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.teacher.room}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <h5 className="font-extrabold text-xs text-slate-900 uppercase mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-800" /> Hỗ trợ sinh viên
            </h5>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Cần tư vấn xếp trùng lịch hoặc hướng dẫn thanh toán học phần? Liên hệ phòng Đào tạo.
            </p>
            <a
              href={`mailto:${course.teacher.email}`}
              className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
            >
              Gửi email tới Giảng viên phụ trách <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </aside>
      </main>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">
                Xác nhận đăng ký học phần?
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Bạn đang thực hiện đăng ký môn học <strong>{course.courseName}</strong> ({course.code}). Lịch học sẽ được tự động xếp vào thời khóa biểu cá nhân của bạn.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-left mb-5 space-y-1">
                <div><strong>Lịch học:</strong> {course.schedule} ({course.timeDetail})</div>
                <div><strong>Cơ sở:</strong> {course.grade}</div>
                <div><strong>Học phí:</strong> {course.price > 0 ? `${course.price.toLocaleString("vi-VN")} đ` : "Miễn phí"}</div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
                  onClick={confirmRegister}
                >
                  Xác nhận đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}