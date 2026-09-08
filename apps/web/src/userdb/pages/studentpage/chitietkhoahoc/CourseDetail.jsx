import React, { useState } from "react"
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
  Sparkles
} from "lucide-react"

const COURSE_DATA = {
  id: 1,
  courseName: "Trí Tuệ Nhân Tạo AI & Machine Learning",
  subject: "Trí Tuệ Nhân Tạo",
  code: "CS402",
  credits: 3,
  grade: "CNTT K15",
  rating: 4.9,
  ratingCount: 128,
  schedule: "Thứ 2 - 4 - 6",
  timeDetail: "07:30 - 09:30",
  room: "A2-304 (Giảng đường công nghệ)",
  profileProgress: 90,
  totalLessons: 45,
  teacher: {
    name: "TS. Nguyễn Tất Thành",
    title: "Trưởng Bộ môn Trí tuệ Nhân tạo",
    department: "Khoa Công Nghệ Thông Tin",
    email: "thanh.nt@university.edu.vn",
    room: "P.302 - Toà C1",
    avatar: "/thekhoahoc/thaygiao.png",
    experience: "12 năm nghiên cứu AI, Deep Learning và Cố vấn giải pháp AI cho các tập đoàn viễn thông."
  },
  description:
    "Học phần đào tạo chuyên sâu về hệ thống tác tử thông minh, thuật toán tìm kiếm kinh điển, Machine Learning cơ bản và mạng nơ-ron học sâu (Deep Learning). Sinh viên được rèn luyện kỹ năng giải quyết bài toán thị giác máy tính và NLP trên nền tảng Python & PyTorch.",
  highlights: [
    "Hơn 70% thời lượng thực hành Lab thực chiến trên Kaggle / Colab",
    "Đồ án cuối kỳ phát triển mô hình ứng dụng thực tiễn",
    "Chứng chỉ hoàn thành môn kèm bảng điểm tích lũy học phần",
    "Được ưu tiên tham gia các Lab nghiên cứu AI của trường"
  ],
  chapters: [
    {
      id: "c1",
      title: "Chương 1: Tổng quan về AI & Tác tử thông minh",
      duration: "6 Giờ",
      lessons: [
        { name: "Lịch sử phát triển và Turing Test", type: "theory", duration: "45p" },
        { name: "Môi trường bài toán & Kiến trúc Agent", type: "theory", duration: "60p" },
        { name: "Lab 01: Thiết lập môi trường Python, Numpy & OpenCV", type: "lab", duration: "90p" }
      ]
    },
    {
      id: "c2",
      title: "Chương 2: Thuật toán tìm kiếm & Không gian trạng thái",
      duration: "9 Giờ",
      lessons: [
        { name: "Tìm kiếm mù (Uninformed): BFS, DFS, UCS", type: "theory", duration: "90p" },
        { name: "Tìm kiếm Heuristic: A* và Greedy Search", type: "theory", duration: "90p" },
        { name: "Đối kháng trong trò chơi: Minimax & Cắt tỉa Alpha-Beta", type: "theory", duration: "60p" },
        { name: "Lab 02: Giải bài toán 8-Puzzle & Pacman bằng thuật toán A*", type: "lab", duration: "120p" }
      ]
    },
    {
      id: "c3",
      title: "Chương 3: Machine Learning & Khai phá dữ liệu",
      duration: "15 Giờ",
      lessons: [
        { name: "Hồi quy tuyến tính & Logistic Regression", type: "theory", duration: "90p" },
        { name: "Decision Trees, Random Forest & SVM", type: "theory", duration: "120p" },
        { name: "Phân cụm dữ liệu Unsupervised: K-Means & PCA", type: "theory", duration: "90p" },
        { name: "Lab 03: Xây dựng hệ thống dự đoán giá nhà và phân loại gian lận thẻ", type: "lab", duration: "180p" }
      ]
    },
    {
      id: "c4",
      title: "Chương 4: Deep Learning & Mạng nơ-ron tích chập (CNN)",
      duration: "15 Giờ",
      lessons: [
        { name: "Mô hình Perceptron & Thuật toán Lan truyền ngược", type: "theory", duration: "120p" },
        { name: "Kiến trúc mạng CNN cho xử lý hình ảnh", type: "theory", duration: "120p" },
        { name: "Tổng quan NLP & Cơ chế Attention căn bản", type: "theory", duration: "90p" },
        { name: "Lab 04: Huấn luyện nhận diện chữ số viết tay MNIST với PyTorch", type: "lab", duration: "180p" }
      ]
    }
  ],
  materials: [
    { id: "m1", name: "Giao_Trinh_Tri_Tue_Nhan_Tao_Chuan.pdf", size: "14.2 MB", type: "PDF", downloads: 840 },
    { id: "m2", name: "Slide_Bai_Giang_Chuong_1_den_4.pdf", size: "8.6 MB", type: "PDF", downloads: 620 },
    { id: "m3", name: "Bai_Tap_Thuc_Hanh_Python_Lab.zip", size: "32.1 MB", type: "ZIP", downloads: 512 },
    { id: "m4", name: "Huong_Dan_Nop_Do_An_Cuoi_Ky.pdf", size: "1.2 MB", type: "PDF", downloads: 310 }
  ],
  reviews: [
    {
      name: "Nguyễn Vũ Hoàng",
      class: "CNTT K14",
      score: 5,
      date: "2 tuần trước",
      comment: "Thầy Thành giảng dạy cực kỳ chi tiết và dễ hiểu, phần Lab thực hành rất sát với phỏng vấn doanh nghiệp AI hiện nay!"
    },
    {
      name: "Trần Minh Thư",
      class: "Khoa học Dữ liệu K15",
      score: 5,
      date: "1 tháng trước",
      comment: "Khóa học chất lượng cao, đề tài cuối kỳ thử thách nhưng học được rất nhiều kỹ năng xử lý dữ liệu thực tế."
    }
  ]
}

export default function CourseDetailPage({ onBack }) {
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

  const toggleChapter = (id) => {
    setOpenChapters((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleAllChapters = (expand) => {
    const nextState = {}
    COURSE_DATA.chapters.forEach((c) => {
      nextState[c.id] = expand
    })
    setOpenChapters(nextState)
  }

  const confirmRegister = () => {
    setIsRegistered(true)
    setShowConfirmModal(false)
    triggerToast("Đăng ký môn học thành công! Đã thêm vào lịch học tuần.")
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

        /* Top Header Navbar */
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

        /* Hero Banner with Modern Gradient & Tech Grid */
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
          font-size: 34px;
          font-weight: 800;
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
          gap: 14px;
          font-size: 13px;
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

        /* Hero Right Card Widget */
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

        .side-metric-item:last-of-type {
          border-bottom: none;
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

        /* Layout Main Body */
        .detail-body-grid {
          max-width: 1240px;
          margin: 32px auto 60px;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 32px;
          align-items: start;
        }

        /* Tabs Bar */
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

        /* Curriculum Chapter Component */
        .curriculum-action-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .chap-container {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 14px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .chap-container:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 14px rgba(0,0,0,0.03);
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

        .chap-head-bar:hover {
          background: #f8fafc;
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

        .lesson-type-badge {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .badge-theory {
          background: #e0f2fe;
          color: #0369a1;
        }

        .badge-lab {
          background: #fef3c7;
          color: #b45309;
        }

        /* Sidebar Cards */
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
          height: 64px;
          border-radius: 16px;
          background: #e2e8f0;
          border: 2px solid #38bdf8;
          overflow: hidden;
          flex-shrink: 0;
        }

        .instructor-avatar-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
        <button className="back-interactive-btn" onClick={onBack}>
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
              <span>{COURSE_DATA.code} • CHƯƠNG TRÌNH CHUẨN ĐẠI HỌC</span>
            </div>
            <h1 className="hero-course-title">{COURSE_DATA.courseName}</h1>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed max-w-2xl font-normal">
              {COURSE_DATA.description}
            </p>

            <div className="hero-chips-bar">
              <div className="hero-chip">
                <GraduationCap className="w-4 h-4 text-sky-400" />
                <span>Khối: <strong>{COURSE_DATA.grade}</strong></span>
              </div>
              <div className="hero-chip">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Lịch: <strong>{COURSE_DATA.schedule}</strong></span>
              </div>
              <div className="hero-chip">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Khung giờ: <strong>{COURSE_DATA.timeDetail}</strong></span>
              </div>
              <div className="hero-chip">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{COURSE_DATA.rating} ({COURSE_DATA.ratingCount} đánh giá)</span>
              </div>
            </div>
          </div>

          {/* Right Floating Card */}
          <div className="glass-side-widget">
            <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-900 mb-3 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Thông tin tuyển sinh</span>
              <span className="text-xs text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold">Kỳ 1</span>
            </h3>

            <div className="side-metric-item">
              <span className="text-slate-500 font-medium">Số tín chỉ</span>
              <span className="font-bold text-slate-900">{COURSE_DATA.credits} Tín chỉ</span>
            </div>
            <div className="side-metric-item">
              <span className="text-slate-500 font-medium">Phòng học</span>
              <span className="font-bold text-slate-900">{COURSE_DATA.room}</span>
            </div>
            <div className="side-metric-item">
              <span className="text-slate-500 font-medium">Tổng số tiết</span>
              <span className="font-bold text-slate-900">{COURSE_DATA.totalLessons} Tiết</span>
            </div>
            <div className="side-metric-item">
              <span className="text-slate-500 font-medium">Hoàn thiện hồ sơ</span>
              <span className="font-extrabold text-blue-900">{COURSE_DATA.profileProgress}%</span>
            </div>

            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-900 h-full rounded-full" style={{ width: `${COURSE_DATA.profileProgress}%` }} />
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
              Khung chương trình ({COURSE_DATA.chapters.length} Chương)
            </button>
            <button
              className={`modern-tab-btn ${activeTab === "materials" ? "active" : ""}`}
              onClick={() => setActiveTab("materials")}
            >
              Tài liệu & Giáo trình ({COURSE_DATA.materials.length})
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
                  {COURSE_DATA.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-800 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="curriculum-action-row">
                <span className="text-xs font-bold text-slate-500">
                  Tổng thời lượng: 45 tiết chuẩn • 4 Chương lớn
                </span>
                <div className="flex gap-2">
                  <button
                    className="text-xs font-bold text-blue-900 hover:underline"
                    onClick={() => toggleAllChapters(true)}
                  >
                    Mở tất cả
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    className="text-xs font-bold text-slate-500 hover:underline"
                    onClick={() => toggleAllChapters(false)}
                  >
                    Thu gọn
                  </button>
                </div>
              </div>

              {COURSE_DATA.chapters.map((chap) => {
                const isOpen = !!openChapters[chap.id]
                return (
                  <div key={chap.id} className="chap-container">
                    <button className="chap-head-bar" onClick={() => toggleChapter(chap.id)}>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center">
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
                              <span className={`lesson-type-badge ${ls.type === "theory" ? "badge-theory" : "badge-lab"}`}>
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
          )}

          {/* TAB 2: MATERIALS */}
          {activeTab === "materials" && (
            <div className="flex flex-col gap-3">
              {COURSE_DATA.materials.map((mat) => (
                <div
                  key={mat.id}
                  className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-sky-400 hover:shadow-xs transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                      {mat.type}
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-slate-900">{mat.name}</h5>
                      <span className="text-xs text-slate-500">
                        {mat.size} • {mat.downloads} lượt tải về
                      </span>
                    </div>
                  </div>
                  <button
                    className="p-2.5 bg-slate-100 hover:bg-blue-900 hover:text-white text-slate-600 rounded-lg transition"
                    onClick={() => triggerToast(`Đang tải tệp: ${mat.name}`)}
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
                  <div className="text-4xl font-extrabold text-slate-900">{COURSE_DATA.rating}</div>
                  <div className="flex gap-1 text-yellow-400 my-1 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">{COURSE_DATA.ratingCount} lượt đánh giá</span>
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
                {COURSE_DATA.reviews.map((rev, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-bold text-sm text-slate-900">{rev.name}</span>
                        <span className="text-xs text-slate-500 ml-2">({rev.class})</span>
                      </div>
                      <span className="text-xs text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex gap-1 text-yellow-400 mb-2">
                      {[...Array(rev.score)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
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
                <img src={COURSE_DATA.teacher.avatar} alt="Giảng viên" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{COURSE_DATA.teacher.name}</h3>
                <p className="text-xs text-slate-500 font-semibold">{COURSE_DATA.teacher.title}</p>
                <p className="text-[11px] text-blue-900 font-bold">{COURSE_DATA.teacher.department}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {COURSE_DATA.teacher.experience}
            </p>

            <div className="text-xs text-slate-600 border-t border-slate-100 pt-3 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{COURSE_DATA.teacher.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{COURSE_DATA.teacher.room}</span>
              </div>
            </div>
          </div>

          {/* Card Hỗ Trợ Đăng Ký */}
          <div className="bg-white border border-slate-200 rounded-16 p-4 shadow-2xs">
            <h5 className="font-extrabold text-xs text-slate-900 uppercase mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-800" /> Hỗ trợ sinh viên
            </h5>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Cần tư vấn xếp trùng lịch hoặc xin bảo lưu kết quả học phần? Liên hệ phòng Đào tạo.
            </p>
            <a
              href="mailto:daotao@university.edu.vn"
              className="text-xs font-bold text-blue-900 hover:underline flex items-center gap-1"
            >
              Gửi yêu cầu tới Phòng Đào Tạo <ExternalLink className="w-3 h-3" />
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
                Bạn đang thực hiện đăng ký môn học <strong>{COURSE_DATA.courseName}</strong> ({COURSE_DATA.code}). Lịch học sẽ được tự động xếp vào thời khóa biểu cá nhân của bạn.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-left mb-5 space-y-1">
                <div><strong>Lịch học:</strong> {COURSE_DATA.schedule} ({COURSE_DATA.timeDetail})</div>
                <div><strong>Địa điểm:</strong> {COURSE_DATA.room}</div>
                <div><strong>Tín chỉ tích lũy:</strong> {COURSE_DATA.credits} Tín chỉ</div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
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