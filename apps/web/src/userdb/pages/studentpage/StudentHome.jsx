import React, { useState, useEffect, useRef } from "react"
import { 
  Search, 
  ArrowRight, 
  Bell, 
  BookMarked, 
  PlusCircle, 
  FileText, 
  Download, 
  ThumbsUp, 
  X, 
  CheckCircle2, 
  FileCheck 
} from "lucide-react"

// Danh sách dữ liệu khóa học chuẩn
const INITIAL_COURSES = [
  {
    id: 1,
    courseName: "Trí Tuệ Nhân Tạo AI",
    teacherName: "Nguyễn Tất Thành",
    subject: "Trí Tuệ Nhân Tạo",
    grade: "CNTT K15",
    schedule: "Thứ 2 - 4 - 6",
    profileProgress: 90,
    notificationCount: 1,
    teacherImg: "/thekhoahoc/thaygiao.png",
    logoImg: "/thekhoahoc/logo.png"
  },
  {
    id: 2,
    courseName: "Học Máy Nâng Cao",
    teacherName: "Trần Quang Minh",
    subject: "Học Máy Nâng Cao",
    grade: "CNTT K15",
    schedule: "Thứ 3 - 5 - 7",
    profileProgress: 85,
    notificationCount: 2,
    teacherImg: "/thekhoahoc/thaygiao.png",
    logoImg: "/thekhoahoc/logo.png"
  },
  {
    id: 3,
    courseName: "Xử Lý Ngôn Ngữ Tự Nhiên",
    teacherName: "Lê Thu Thủy",
    subject: "Xử Lý Ngôn Ngữ",
    grade: "CNTT K15",
    schedule: "Sáng Thứ Bảy",
    profileProgress: 95,
    notificationCount: 1,
    teacherImg: "/thekhoahoc/thaygiao.png",
    logoImg: "/thekhoahoc/logo.png"
  }
]

// Danh sách tài liệu PDF
const INITIAL_DOCS = [
  { id: 1, title: "Tiểu Luận Nhóm 10", pages: 47, rating: "Pas encore d'évaluation", tag: "ĐH", color: "text-red-600 bg-red-100" },
  { id: 2, title: "- Tiểu Luận PLĐC", pages: 61, rating: "Pas encore d'évaluation", tag: "UB", color: "text-blue-700 bg-blue-100" },
  { id: 3, title: "Tiểu Luận Pháp Luật Đại Cương", pages: 25, rating: "Pas encore d'évaluation", tag: "PL", color: "text-sky-600 bg-sky-100" },
  { id: 4, title: "430206 - Nguyễn Tuấn Anh", pages: 16, rating: "Pas encore d'évaluation", tag: "NTA", color: "text-slate-800 bg-slate-200" },
  { id: 5, title: "Tiểu Luận PLDC", pages: 22, rating: "Pas encore d'évaluation", tag: "TM", color: "text-amber-700 bg-amber-100" },
  { id: 6, title: "Luật HNGĐ", pages: 205, rating: "100% (1)", tag: "HNGĐ", color: "text-emerald-700 bg-emerald-100", isLiked: true }
]

function CardCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    let animationFrameId
    let width, height

    function resizeCanvas() {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth || 300
      height = canvas.height = canvas.offsetHeight || 210
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 }
    const card = canvas.closest(".card-container")

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.targetX = e.clientX - rect.left
      mouse.targetY = e.clientY - rect.top
    }
    if (card) card.addEventListener("mousemove", handleMouseMove)

    const spheres = [
      { originX: width * 0.12, originY: height * 0.25, z: 1.2, r: width * 0.045, isBlue: true, angle: 0, speed: 0.018, orbitRadius: 6, pulse: 0 },
      { originX: width * 0.65, originY: height * 0.20, z: 1.3, r: width * 0.048, isBlue: false, angle: Math.PI / 2, speed: 0.015, orbitRadius: 7, pulse: 1 },
      { originX: width * 0.85, originY: height * 0.75, z: 1.3, r: width * 0.05, isBlue: false, angle: (Math.PI * 3) / 2, speed: 0.016, orbitRadius: 8, pulse: 3 }
    ]

    const nodes = []
    const nodeColors = ["#1e3a8a", "#38bdf8", "#ea580c", "#ffaa00", "#c0c0c0"]
    for (let i = 0; i < 35; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.8 + 0.2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        baseR: Math.random() * 2 + 1,
        color: nodeColors[Math.floor(Math.random() * nodeColors.length)],
        glow: Math.random() * Math.PI * 2
      })
    }

    function render() {
      mouse.x += (mouse.targetX - mouse.x) * 0.08
      mouse.y += (mouse.targetY - mouse.y) * 0.08
      ctx.clearRect(0, 0, width, height)

      spheres.forEach((s) => {
        s.angle += s.speed
        s.pulse += 0.02
        const px = s.originX + Math.cos(s.angle) * s.orbitRadius + (mouse.x - width / 2) * 0.015 * s.z
        const py = s.originY + Math.sin(s.angle) * s.orbitRadius + (mouse.y - height / 2) * 0.015 * s.z
        const currentR = s.r + Math.sin(s.pulse) * 2

        ctx.beginPath()
        ctx.arc(px, py, Math.max(1, currentR), 0, Math.PI * 2)
        const grad = ctx.createRadialGradient(px - currentR * 0.3, py - currentR * 0.3, currentR * 0.05, px, py, currentR)
        grad.addColorStop(0, "#ffffff")
        grad.addColorStop(1, s.isBlue ? "#1e3a8a" : "#ea580c")
        ctx.fillStyle = grad
        ctx.fill()
      })

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        n.x += n.vx
        n.y += n.vy
        n.glow += 0.03
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1

        const nx = n.x + (mouse.x - width / 2) * 0.01 * n.z
        const ny = n.y + (mouse.y - height / 2) * 0.01 * n.z

        ctx.beginPath()
        ctx.arc(nx, ny, n.baseR, 0, Math.PI * 2)
        ctx.fillStyle = n.color
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resizeCanvas)
      if (card) card.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="card-canvas" />
}

export default function StudentHome() {
  const [searchKeyword, setSearchKeyword] = useState("")
  const [toastMessage, setToastMessage] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [modalDoc, setModalDoc] = useState(null)

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleDownload = (filename) => {
    triggerToast(`Đang tải tệp tin: ${filename}`)
  }

  const filteredCourses = INITIAL_COURSES.filter(
    (c) =>
      c.courseName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  const filteredDocs = INITIAL_DOCS.filter((d) =>
    d.title.toLowerCase().includes(searchKeyword.toLowerCase())
  )

  return (
    <div className="home-root-wrapper">
      <style>{`
        .home-root-wrapper {
          width: 100%;
          min-height: 100%;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
        }

        /* 🟢 Cột phải rút ngắn về 310px để mở rộng tối đa cho 3 thẻ khóa học */
        .home-wireframe-grid {
          display: grid;
          grid-template-columns: 1fr 310px;
          gap: 20px;
          align-items: stretch;
          width: 100%;
        }

        .home-left-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 0;
        }

        .home-right-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Search Hero Box */
        .search-hero-box {
          position: relative;
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0284c7 100%);
          border: 2px solid #cbd5e1;
          border-radius: 16px;
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-shadow: 0 8px 24px rgba(30, 58, 138, 0.12);
          overflow: hidden;
        }

        .search-hero-box::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
        }

        .search-hero-title {
          position: relative;
          color: #ffffff;
          font-size: 20px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 18px;
          text-align: center;
        }

        .pill-search-bar {
          position: relative;
          width: 100%;
          max-width: 680px;
          background: #ffffff;
          border: 3px solid #38bdf8;
          border-radius: 50px;
          display: flex;
          align-items: center;
          padding: 6px 10px 6px 22px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          transition: all 0.25s ease;
        }

        .pill-search-bar:focus-within {
          border-color: #f59e0b;
          box-shadow: 0 12px 35px rgba(245, 158, 11, 0.35);
          transform: scale(1.01);
        }

        .pill-search-bar input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          background: transparent;
        }

        .search-btn {
          background: #1e3a8a;
          color: #ffffff;
          border: none;
          padding: 9px 22px;
          border-radius: 40px;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .search-btn:hover {
          background: #0284c7;
        }

        .quick-tags {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          font-size: 12px;
          color: #e2e8f0;
          flex-wrap: wrap;
          justify-content: center;
        }

        .tag-pill {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          padding: 3px 10px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tag-pill:hover {
          background: #ffffff;
          color: #1e3a8a;
        }

        /* 4. Khóa học nổi bật */
        .courses-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-header-bar h3 {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-header-bar h3::before {
          content: '';
          width: 4px;
          height: 18px;
          background: #1e3a8a;
          border-radius: 2px;
          display: inline-block;
        }

        .course-count-tag {
          font-size: 12px;
          font-weight: 700;
          color: #1e3a8a;
          background: #dbeafe;
          padding: 3px 10px;
          border-radius: 12px;
        }

        .three-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .card-wrapper {
          position: relative;
          width: 100%;
          container-type: inline-size;
          display: flex;
          flex-direction: column;
        }

        .logo-container {
          position: absolute;
          top: 2cqw;
          right: 5cqw;
          z-index: 10;
        }

        .logo-img {
          height: 8cqw;
          max-height: 36px;
          width: auto;
          display: block;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
        }

        .card-container {
          position: relative;
          width: 100%;
          aspect-ratio: 900 / 520;
          background-image: url('/thekhoahoc/khung.png');
          background-color: #ffffff;
          background-size: 100% 100%;
          background-repeat: no-repeat;
          background-position: center;
          border-radius: 3cqw;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          border: 1px solid #cbd5e1;
          transition: all 0.3s ease;
        }

        .card-container:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(30, 58, 138, 0.12);
          border-color: #1e3a8a;
        }

        .card-canvas {
          position: absolute;
          top: -8cqw;
          left: -8cqw;
          width: calc(100% + 16cqw);
          height: calc(100% + 16cqw);
          z-index: 5;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .card-container:hover .card-canvas {
          opacity: 1;
        }

        .teacher-image-zone {
          position: absolute;
          left: -2%;
          bottom: 8%;
          width: 36%;
          height: 95%;
          z-index: 2;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .teacher-img {
          width: 100%;
          height: auto;
          max-height: 100%;
          object-fit: contain;
          filter: drop-shadow(0 8px 12px rgba(0,0,0,0.15));
        }

        /* 🟢 Tinh chỉnh content-box: Nâng top lên 18% và height 75% để bao trọn mọi thành phần */
        .content-box {
          position: absolute;
          top: 18%;
          left: 31%;
          width: 56%;
          height: 75%;
          z-index: 3;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #1e3a8a;
          padding-bottom: 2px;
        }

        .info-header h2 {
          color: #1e3a8a;
          font-size: 2.5cqw;
          font-weight: 800;
          text-transform: uppercase;
        }

        .notification-badge {
          position: relative;
          color: #1e3a8a;
          font-size: 2.6cqw;
        }

        .notification-badge .count {
          position: absolute;
          top: -4px;
          right: -6px;
          background: #ef4444;
          color: white;
          font-size: 1.6cqw;
          width: 2cqw;
          height: 2cqw;
          min-width: 13px;
          min-height: 13px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .info-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 1px;
          font-size: 2cqw;
          line-height: 1.25;
        }

        .info-label {
          font-weight: 700;
          color: #334155;
        }

        .info-value {
          color: #64748b;
          font-weight: 500;
        }

        .progress-container {
          margin-top: 1px;
        }

        .progress-label {
          display: flex;
          justify-content: flex-end;
          font-size: 1.7cqw;
          color: #64748b;
          margin-bottom: 1px;
          font-weight: 600;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #1e3a8a;
        }

        /* 🟢 Xếp 2 nút hàng ngang cạnh nhau để 100% nằm gọn bên trong thẻ */
        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5px;
          margin-top: 2px;
        }

        .card-btn {
          width: 100%;
          padding: 1cqw 0.5cqw;
          border: none;
          border-radius: 5px;
          font-size: 1.8cqw;
          font-weight: 700;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s;
        }

        .btn-detail { background-color: #1e3a8a; }
        .btn-detail:hover { background-color: #1d4ed8; }

        .btn-register { background-color: #ea580c; }
        .btn-register:hover { background-color: #c2410c; }

        /* 5. Cột phải: Panel PDF gọn gàng */
        .pdf-panel {
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 14px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
        }

        .pdf-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 10px;
          margin-bottom: 12px;
        }

        .pdf-panel-title {
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pdf-pill-badge {
          background: #0f172a;
          color: #ffffff;
          font-size: 9px;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .doc-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          list-style: none;
          overflow-y: auto;
          max-height: 520px;
          padding-right: 2px;
        }

        .doc-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .doc-item:hover {
          transform: translateX(2px);
          box-shadow: 0 4px 14px rgba(30, 58, 138, 0.08);
          border-color: #38bdf8;
          background: #f8fafc;
        }

        .doc-cover-thumb {
          position: relative;
          width: 44px;
          height: 60px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.08);
          overflow: hidden;
        }

        .doc-badge-pdf {
          position: absolute;
          top: 1px;
          left: 1px;
          background: #0f172a;
          color: #ffffff;
          font-size: 6px;
          font-weight: 900;
          padding: 1px 2px;
          border-radius: 2px;
          z-index: 2;
        }

        .doc-cover-inner {
          width: 100%;
          height: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 2px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2px;
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
        }

        .doc-cover-logo {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #fee2e2;
          color: #dc2626;
          font-size: 5px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2px;
        }

        .doc-cover-lines {
          width: 75%;
          height: 1px;
          background: #94a3b8;
          margin: 1px 0;
        }

        .doc-cover-text {
          font-size: 4.5px;
          font-weight: 800;
          color: #1e293b;
          line-height: 1.1;
          margin-top: 1px;
        }

        .doc-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 60px;
          padding: 1px 0;
        }

        .doc-rating {
          font-size: 10px;
          color: #64748b;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .doc-rating.active {
          color: #059669;
          font-weight: 700;
        }

        .doc-info h4 {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.25;
          margin: 1px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .doc-footer-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 10px;
          color: #64748b;
          font-weight: 600;
        }

        .download-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
          transition: color 0.2s;
        }

        .download-btn:hover {
          color: #1e3a8a;
        }

        .pdf-quick-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pdf-quick-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .pdf-quick-item:hover {
          border-color: #38bdf8;
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }

        .pdf-quick-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pdf-quick-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: #e0f2fe;
          color: #0369a1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
        }

        .pdf-quick-details h5 {
          font-size: 11px;
          font-weight: 700;
          color: #1e293b;
          max-width: 160px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pdf-quick-details span {
          font-size: 9px;
          color: #64748b;
        }

        @media (max-width: 1200px) {
          .home-wireframe-grid {
            grid-template-columns: 1fr;
          }
          .three-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .three-cards-grid {
            grid-template-columns: 1fr;
          }
          .pill-search-bar {
            flex-direction: column;
            border-radius: 16px;
            padding: 12px;
            gap: 10px;
          }
          .search-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="home-wireframe-grid">
        <div className="home-left-col">
          {/* 1. HỘP TÌM KIẾM HERO */}
          <section className="search-hero-box">
            <h2 className="search-hero-title">Hệ Thống Tra Cứu Khóa Học & Tài Liệu Trực Tuyến</h2>
            
            <div className="pill-search-bar">
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input 
                type="text" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="TÌM KIẾM khóa học, giảng viên, tiểu luận..." 
              />
              <button className="search-btn" onClick={() => triggerToast(`Tìm kiếm: ${searchKeyword || "Tất cả"}`)}>
                <span>TÌM KIẾM</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="quick-tags">
              <span>Gợi ý:</span>
              <span className="tag-pill" onClick={() => setSearchKeyword("Trí Tuệ Nhân Tạo")}>Trí Tuệ Nhân Tạo</span>
              <span className="tag-pill" onClick={() => setSearchKeyword("Học Máy")}>Học Máy</span>
              <span className="tag-pill" onClick={() => setSearchKeyword("Tiểu Luận")}>Tiểu Luận Pháp Luật</span>
              <span className="tag-pill" onClick={() => setSearchKeyword("HNGĐ")}>Luật HNGĐ</span>
              <span className="tag-pill" onClick={() => setSearchKeyword("")}>Tất cả</span>
            </div>
          </section>

          {/* 2. HÀNG 3 THẺ KHÓA HỌC */}
          <section className="courses-section">
            <div className="section-header-bar">
              <h3>CÁC THẺ KHÓA HỌC NỔI BẬT</h3>
              <span className="course-count-tag">{filteredCourses.length} Khóa học phù hợp</span>
            </div>

            <div className="three-cards-grid">
              {filteredCourses.map((c) => (
                <div key={c.id} className="card-wrapper" data-course={c.courseName} data-teacher={c.teacherName}>
                  
                  {/* Logo Container */}
                  <div className="logo-container">
                    <img src={c.logoImg} alt="Logo" className="logo-img" />
                  </div>

                  {/* Card Container với ảnh nền khung.png */}
                  <div 
                    className="card-container" 
                    style={{ backgroundImage: 'url("/thekhoahoc/khung.png")' }}
                  >
                    <CardCanvas />

                    {/* Vùng ảnh giảng viên */}
                    <div className="teacher-image-zone">
                      <img src={c.teacherImg} alt="Giảng viên" className="teacher-img" />
                    </div>

                    <div className="content-box">
                      <div className="info-header">
                        <h2>THÔNG TIN CHI TIẾT</h2>
                        <div className="notification-badge">
                          <Bell className="w-[2.6cqw] h-[2.6cqw]" />
                          <span className="count">{c.notificationCount}</span>
                        </div>
                      </div>

                      <div className="info-list">
                        <div className="info-item">
                          <span className="info-label">HỌ TÊN:</span>
                          <span className="info-value">{c.teacherName}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">MÔN HỌC:</span>
                          <span className="info-value">{c.subject}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">KHỐI LỚP:</span>
                          <span className="info-value">{c.grade}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">LỊCH HẸN:</span>
                          <span className="info-value">{c.schedule}</span>
                        </div>
                      </div>

                      <div className="progress-container">
                        <div className="progress-label">Hồ sơ: {c.profileProgress}%</div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${c.profileProgress}%` }}></div>
                        </div>
                      </div>

                      {/* Nút bấm đặt nằm ngang, lọt 100% bên trong khung */}
                      <div className="action-buttons">
                        <button className="card-btn btn-detail" onClick={() => triggerToast(`Xem chi tiết: ${c.teacherName}`)}>
                          <BookMarked className="w-[2cqw] h-[2cqw]" /> Xem chi tiết
                        </button>
                        <button className="card-btn btn-register" onClick={() => triggerToast(`Đăng ký môn: ${c.teacherName}`)}>
                          <PlusCircle className="w-[2cqw] h-[2cqw]" /> Đăng ký môn
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CỘT PHẢI: PDF ĐÃ ĐƯỢC THU NHỎ CHIỀU RỘNG */}
        <div className="home-right-col">
          <section className="pdf-panel">
            <div className="pdf-panel-header">
              <div>
                <h3 className="pdf-panel-title">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span>Tài liệu đề xuất</span>
                </h3>
                <p style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>Vous aimerez peut-être aussi</p>
              </div>
              <span className="pdf-pill-badge">PDF HUB</span>
            </div>

            <ul className="doc-list">
              {filteredDocs.map((doc) => (
                <li key={doc.id} className="doc-item" onClick={() => setModalDoc(doc)}>
                  <div className="doc-cover-thumb">
                    <span className="doc-badge-pdf">PDF</span>
                    <div className="doc-cover-inner">
                      <div className={`doc-cover-logo ${doc.color}`}>{doc.tag}</div>
                      <div className="doc-cover-lines"></div>
                      <div className="doc-cover-lines"></div>
                      <div className="doc-cover-text">{doc.title}</div>
                    </div>
                  </div>
                  <div className="doc-info">
                    {doc.isLiked ? (
                      <span className="doc-rating active"><ThumbsUp className="w-3 h-3" /> {doc.rating}</span>
                    ) : (
                      <span className="doc-rating">{doc.rating}</span>
                    )}
                    <h4>{doc.title}</h4>
                    <div className="doc-footer-meta">
                      <span>{doc.pages} pages</span>
                      <button 
                        className="download-btn" 
                        onClick={(e) => { 
                          e.stopPropagation()
                          handleDownload(`${doc.title}.pdf`) 
                        }}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="pdf-panel">
            <div className="pdf-panel-header">
              <h3 className="pdf-panel-title">
                <FileCheck className="w-4 h-4 text-sky-600" />
                <span>PDF: Tải Nhanh</span>
              </h3>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#0284c7" }}>Miễn phí</span>
            </div>

            <div className="pdf-quick-list">
              {[
                { name: "Mau_Bia_Tieu_Luan_Chuan.pdf", meta: "0.8 MB • 3 Trang" },
                { name: "De_Cuong_Tri_Tue_Nhan_Tao.pdf", meta: "2.4 MB • 15 Trang" }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="pdf-quick-item" 
                  onClick={() => setModalDoc({ title: item.name, pages: item.meta, rating: "Tải nhanh" })}
                >
                  <div className="pdf-quick-meta">
                    <div className="pdf-quick-icon"><FileText className="w-4 h-4" /></div>
                    <div className="pdf-quick-details">
                      <h5>{item.name}</h5>
                      <span>{item.meta}</span>
                    </div>
                  </div>
                  <button 
                    className="download-btn" 
                    onClick={(e) => { 
                      e.stopPropagation()
                      handleDownload(item.name) 
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* MODAL PREVIEW PDF */}
      {modalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded">PDF</span>
                <h4 className="text-sm font-bold truncate max-w-[320px]">Xem trước tài liệu</h4>
              </div>
              <button 
                type="button" 
                onClick={() => setModalDoc(null)} 
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-50 flex flex-col items-center text-center">
              <div className="w-20 h-28 bg-white border border-slate-300 rounded-lg shadow-md flex flex-col items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-red-500" />
                <span className="text-[10px] font-bold text-slate-500 mt-2">
                  {typeof modalDoc.pages === "number" ? `${modalDoc.pages} pages` : modalDoc.pages}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">{modalDoc.title}</h3>
              <p className="text-xs text-slate-500">Đánh giá: {modalDoc.rating}</p>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownload(`${modalDoc.title}.pdf`)
                  setModalDoc(null)
                }}
                className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition"
              >
                <Download className="w-4 h-4" /> Tải về máy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}