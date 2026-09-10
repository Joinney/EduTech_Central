/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
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
const DEFAULT_LOGO_IMG = "/thekhoahoc/logo.png"

export default function CourseDetailPage({ onBack }) {
  const { id: paramId } = useParams()
  const navigate = useNavigate()
  const courseId = paramId || 1

  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
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

  // 🎯 TẢI DỮ LIỆU ĐỒNG BỘ TỪ BACKEND
  useEffect(() => {
    const fetchFullCourseData = async () => {
      setIsLoading(true)
      try {
        // 1. Lấy chi tiết khóa học
        let cData = null
        try {
          const res = await courseService.getCourseById(courseId)
          cData = res?.data || res
        } catch (_) {
          // Fallback nếu không có getCourseById thì lấy qua getAllCourses
          const allRes = await courseService.getAllCourses().catch(() => [])
          const allList = Array.isArray(allRes) ? allRes : (allRes?.data || [])
          cData = allList.find(item => String(item.id || item.id_course) === String(courseId)) || allList[0]
        }

        if (cData) {
          // Nhận diện ảnh dáng người thực tế của giảng viên
          const realUploadedImg = 
            (cData.thumbnail && !cData.thumbnail.includes("unsplash.com") && !cData.thumbnail.includes("thekhoahoc")) 
              ? cData.thumbnail 
              : (cData.teacher_img || cData.teacherImg || cData.teacher_avatar)

          const isUIAvatar = realUploadedImg && realUploadedImg.includes("ui-avatars.com")
          const cleanTeacherImg = (realUploadedImg && !isUIAvatar) ? realUploadedImg : DEFAULT_TEACHER_IMG

          setCourse({
            id: cData.id || cData.id_course,
            courseName: cData.title || "Khóa Học Đào Tạo",
            subject: cData.subject || "Chuyên ngành",
            code: cData.code || `ED-${cData.id || "2026"}`,
            credits: cData.credits || 3,
            grade: cData.schoolName || cData.school_name || cData.grade || "Đại học",
            rating: 4.9,
            ratingCount: 128,
            schedule: cData.schedule || "Linh hoạt",
            timeDetail: cData.schedule?.includes("(") ? cData.schedule.split("(")[1]?.replace(")", "") : "19:30 - 21:00",
            room: cData.room || "Phòng học trực tuyến / Meet",
            profileProgress: 90,
            price: cData.price || 0,
            description: cData.description || "Học phần đào tạo bài bản với nội dung kiến thức chuyên sâu và bài tập ứng dụng thực hành thực tế.",
            teacher: {
              name: cData.teacher_name || cData.teacherName || "Giảng viên phụ trách",
              title: "Giảng viên chuyên môn",
              department: cData.schoolName || cData.school_name || "Khoa Đào tạo",
              email: cData.teacher_email || "giangvien@edutech.vn",
              room: "Văn phòng Bộ môn",
              avatar: cleanTeacherImg,
              experience: "Nhiều năm kinh nghiệm giảng dạy và phát triển các giải pháp công nghệ đào tạo trực tuyến."
            }
          })
        }

        // 2. Lấy danh sách bài giảng (Lessons)
        try {
          const lessonRes = await courseService.getLessonsByCourse(courseId)
          const lessonList = Array.isArray(lessonRes) ? lessonRes : (lessonRes?.data || [])
          setLessons(lessonList)

          // Rút trích tài liệu học tập thực tế từ bài giảng
          const extractedDocs = []
          lessonList.forEach((l, idx) => {
            if (l.fileUrl || l.file_url) {
              extractedDocs.push({
                id: `mat-${l.id || idx}`,
                name: l.fileName || l.file_name || l.title || `Tài liệu bài học ${idx + 1}`,
                size: l.fileSize || "3.5 MB",
                type: (l.fileUrl || l.file_url).endsWith(".zip") ? "ZIP" : "PDF",
                downloads: Math.floor(Math.random() * 500) + 120,
                url: l.fileUrl || l.file_url
              })
            }
          })

          // Nếu chưa có file upload thì cấp tài liệu mẫu
          if (extractedDocs.length === 0) {
            setMaterials([
              { id: "m1", name: `Giao_Trinh_${cData?.title || "Mon_Hoc"}.pdf`, size: "14.2 MB", type: "PDF", downloads: 840 },
              { id: "m2", name: "Slide_Bai_Giang_Tong_Hop.pdf", size: "8.6 MB", type: "PDF", downloads: 620 }
            ])
          } else {
            setMaterials(extractedDocs)
          }

        } catch (_) {}

      } catch (err) {
        console.error("Lỗi khi tải thông tin khóa học:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFullCourseData()
  }, [courseId])

  const toggleChapter = (id) => {
    setOpenChapters((prev) => ({ ...prev, [id]: !prev[id] }))
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
        <p className="text-xs font-bold text-slate-500">Đang đồng bộ dữ liệu khóa học...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center font-sans space-y-4">
        <p className="text-sm font-bold text-slate-600">Không tìm thấy thông tin khóa học.</p>
        <button onClick={handleGoBack} className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold">
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

      {/* Toast Notifier */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
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

      {/* Stage Hero Banner */}
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

          {/* Right Floating Card */}
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
              <span className="text-slate-500 font-medium">Tổng bài học</span>
              <span className="font-bold text-slate-900">{lessons.length || 12} Tiết</span>
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

      {/* Main Container Grid */}
      <main className="detail-body-grid">
        <div>
          {/* Nav Tabs */}
          <div className="modern-tab-shelf">
            <button
              className={`modern-tab-btn ${activeTab === "curriculum" ? "active" : ""}`}
              onClick={() => setActiveTab("curriculum")}
            >
              Khung bài học ({lessons.length || 4} Bài học)
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

          {/* TAB 1: CURRICULUM */}
          {activeTab === "curriculum" && (
            <div>
              {/* Highlights Box */}
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

              {/* Danh sách bài học */}
              <div className="space-y-3">
                {lessons.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl text-xs">
                    Chưa có bài học nào được đăng tải cho môn học này.
                  </div>
                ) : (
                  lessons.map((ls, idx) => (
                    <div key={ls.id || idx} className="lesson-row-card shadow-2xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <div className="truncate">
                          <h5 className="font-extrabold text-sm text-slate-900 truncate">{ls.title || `Bài học ${idx + 1}`}</h5>
                          <p className="text-[11px] text-slate-500 font-medium truncate">{ls.content || "Nội dung học phần lý thuyết và bài tập"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-blue-100 text-blue-800">
                          {ls.videoUrl ? "Video" : "Lý thuyết"}
                        </span>
                        {ls.fileUrl && (
                          <a href={ls.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition">
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MATERIALS */}
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

          {/* TAB 3: REVIEWS */}
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

        {/* Cột Phải: Giảng Viên & Trợ Giúp */}
        <aside>
          {/* Card Giảng Viên */}
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

          {/* Card Hỗ Trợ Đăng Ký */}
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

      {/* Modal Xác Nhận Đăng Ký */}
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