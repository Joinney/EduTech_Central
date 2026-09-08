/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Search, 
  ArrowRight, 
  Bell, 
  BookMarked, 
  PlusCircle, 
  FileText, 
  Download, 
  ThumbsUp, 
  CheckCircle2, 
  FileCheck,
  Loader2
} from "lucide-react"

import { courseService } from "../../../api/course.api"

const DEFAULT_TEACHER_IMG = "/thekhoahoc/thaygiao.png";
const DEFAULT_LOGO_IMG = "/thekhoahoc/logo.png";

// Map logo có sẵn chữ trường (đảm bảo hiển thị không bị lỗi hotlink)
const PRESET_SCHOOL_LOGOS = {
  bka: "https://bka.hcmut.edu.vn/assets/images/logo/logo-bka.png",
  hcmut: "https://upload.wikimedia.org/wikipedia/vi/thumb/9/91/FC_B%C3%A1ch_Khoa_logo.png/200px-FC_B%C3%A1ch_Khoa_logo.png",
  hust: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Logo_Hust.png/200px-Logo_Hust.png",
  uit: "https://upload.wikimedia.org/wikipedia/vi/thumb/e/e0/Logo_UIT.svg/200px-Logo_UIT.svg.png",
  fpt: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/200px-FPT_logo_2010.svg.png",
  vanlang: "https://upload.wikimedia.org/wikipedia/vi/thumb/0/07/Logo_V%C4%83n_Lang.svg/200px-Logo_V%C4%83n_Lang.svg.png"
};

const resolveSchoolLogo = (schoolName = "", customLogo = "") => {
  if (customLogo && !customLogo.includes("/thekhoahoc/logo.png")) {
    return customLogo;
  }
  const nameLower = schoolName.toLowerCase();
  if (nameLower.includes("bka") || nameLower.includes("alumni")) return PRESET_SCHOOL_LOGOS.bka;
  if (nameLower.includes("hà nội") || nameLower.includes("hust")) return PRESET_SCHOOL_LOGOS.hust;
  if (nameLower.includes("bách khoa") || nameLower.includes("hcmut")) return PRESET_SCHOOL_LOGOS.hcmut;
  if (nameLower.includes("thông tin") || nameLower.includes("uit")) return PRESET_SCHOOL_LOGOS.uit;
  if (nameLower.includes("fpt")) return PRESET_SCHOOL_LOGOS.fpt;
  if (nameLower.includes("văn lang")) return PRESET_SCHOOL_LOGOS.vanlang;
  return DEFAULT_LOGO_IMG;
};

const INITIAL_COURSES = [
  { id: 1, courseName: "Trí Tuệ Nhân Tạo AI", teacherName: "Nguyễn Tất Thành", subject: "Trí Tuệ Nhân Tạo", grade: "Đại học Bách Khoa", schedule: "Thứ 2 - 4 - 6", profileProgress: 90, notificationCount: 1, teacherImg: DEFAULT_TEACHER_IMG, logoImg: PRESET_SCHOOL_LOGOS.bka },
  { id: 2, courseName: "Học Máy Nâng Cao", teacherName: "Trần Quang Minh", subject: "Học Máy", grade: "Đại học FPT", schedule: "Thứ 3 - 5 - 7", profileProgress: 85, notificationCount: 2, teacherImg: DEFAULT_TEACHER_IMG, logoImg: PRESET_SCHOOL_LOGOS.fpt }
];

const INITIAL_ESSAYS = [
  { id: 101, title: "Tiểu Luận Nhóm 10 - Pháp Luật Đại Cương", desc: "Nghiên cứu về quy định sở hữu tài sản & quyền định đoạt.", author: "Nhóm 10", faculty: "Khoa Luật", pages: 47, downloads: "1.4k", likes: 312, tag: "ĐH", color: "text-red-600 bg-red-100", date: "15/10/2026" },
  { id: 102, title: "Tiểu Luận PLĐC: Trách Nhiệm Dân Sự", desc: "Phân tích các chế định trách nhiệm do vi phạm nghĩa vụ hợp đồng.", author: "Ủy Ban Học Tập", faculty: "Luật Kinh Tế", pages: 61, downloads: "980", likes: 188, tag: "UB", color: "text-blue-700 bg-blue-100", date: "02/11/2026" }
];

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
  const navigate = useNavigate()
  const [searchKeyword, setSearchKeyword] = useState("")
  const [toastMessage, setToastMessage] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [essayFilter, setEssayFilter] = useState("all")
  
  const [courses, setCourses] = useState([])
  const [essays, setEssays] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const rawCourses = await courseService.getAllCourses().catch(() => []);
        const coursesList = Array.isArray(rawCourses) ? rawCourses : (rawCourses?.data || []);

        if (coursesList.length > 0) {
          // Lọc chỉ lấy các khóa học mở rộng
          const externalCourses = coursesList.filter(c => c.type === "external" || !c.type || c.type === "skill");
          const targetList = externalCourses.length > 0 ? externalCourses : coursesList;

          const formattedCourses = targetList.map(c => {
            const realUploadedImg = 
              (c.thumbnail && !c.thumbnail.includes("unsplash.com") && !c.thumbnail.includes("thekhoahoc")) 
                ? c.thumbnail 
                : (c.teacher_img || c.teacherImg || c.teacher_avatar);

            const isUIAvatar = realUploadedImg && realUploadedImg.includes("ui-avatars.com");
            const cleanTeacherImg = (realUploadedImg && !isUIAvatar) ? realUploadedImg : DEFAULT_TEACHER_IMG;

            const schoolName = c.schoolName || c.school_name || c.grade || "Trường đào tạo";
            const cleanSchoolLogo = resolveSchoolLogo(schoolName, c.school_logo || c.schoolLogo);

            return {
              id: c.id || c.id_course,
              courseName: c.title,
              teacherName: c.teacher_name || c.teacherName || "Giảng viên",
              subject: c.subject || "Chuyên môn",
              grade: schoolName,
              schedule: c.schedule || "Linh hoạt",
              profileProgress: Math.floor(Math.random() * 20) + 80,
              notificationCount: Math.floor(Math.random() * 3) + 1,
              teacherImg: cleanTeacherImg,
              logoImg: cleanSchoolLogo
            };
          });
          setCourses(formattedCourses);

          const allDocs = [];
          const colors = [
            "text-red-600 bg-red-100", "text-blue-700 bg-blue-100", 
            "text-sky-600 bg-sky-100", "text-amber-700 bg-amber-100", 
            "text-emerald-700 bg-emerald-100"
          ];

          await Promise.all(
            coursesList.slice(0, 6).map(async (c, cIdx) => {
              const cId = c.id || c.id_course;
              try {
                const lessonsRes = await courseService.getLessonsByCourse(cId);
                const lessons = Array.isArray(lessonsRes) ? lessonsRes : (lessonsRes?.data || []);
                
                lessons.forEach((l, lIdx) => {
                  if (l.fileUrl || l.file_url) {
                    allDocs.push({
                      id: `doc-${cId}-${lIdx}`,
                      title: l.title || `Tài liệu môn ${c.title}`,
                      desc: l.content || l.description || "Tài liệu học tập được chia sẻ công khai.",
                      author: c.teacher_name || "Giảng viên",
                      faculty: c.subject || "Chuyên ngành",
                      pages: Math.floor(Math.random() * 40) + 10,
                      fileUrl: l.fileUrl || l.file_url,
                      downloads: `${Math.floor(Math.random() * 900) + 100}`,
                      likes: Math.floor(Math.random() * 300) + 20,
                      tag: (c.subject || "TL").substring(0, 2).toUpperCase(),
                      color: colors[(cIdx + lIdx) % colors.length],
                      date: new Date(l.created_at || Date.now()).toLocaleDateString("vi-VN")
                    });
                  }
                });
              } catch (_) {}
            })
          );
          setEssays(allDocs.length > 0 ? allDocs : INITIAL_ESSAYS);
        } else {
          setCourses(INITIAL_COURSES);
          setEssays(INITIAL_ESSAYS);
        }

      } catch (error) {
        console.error("Lỗi tải data trang chủ:", error);
        setCourses(INITIAL_COURSES);
        setEssays(INITIAL_ESSAYS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleRegisterCourse = (courseId, teacherName) => {
    triggerToast(`Đã gửi yêu cầu đăng ký lớp của GV: ${teacherName}`);
  }

  const handleDownload = (e, filename, url) => {
    e.stopPropagation()
    triggerToast(`Đang tải tệp tin: ${filename}`)
    if (url) {
      window.open(url, '_blank');
    }
  }

  const filteredCourses = useMemo(() => courses.filter(
    (c) =>
      c.courseName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchKeyword.toLowerCase())
  ), [courses, searchKeyword]);

  const filteredEssays = useMemo(() => {
    let list = essays.filter(
      (d) =>
        d.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        d.desc.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        d.author.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    if (essayFilter === "popular") {
      list = [...list].sort((a, b) => b.likes - a.likes);
    }
    return list;
  }, [essays, searchKeyword, essayFilter]);

  return (
    <div className="home-root-wrapper">
      <style>{`
        .home-root-wrapper {
          width: 100%;
          min-height: 100%;
          padding: 0 0 50px 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .home-wireframe-grid {
          display: grid;
          grid-template-columns: 1fr 310px;
          gap: 20px;
          align-items: start;
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

        .search-hero-box {
          position: relative;
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0284c7 100%);
          border: 2px solid #cbd5e1;
          border-radius: 16px;
          min-height: 200px;
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
          margin-bottom: 14px;
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
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          background: transparent;
        }
        .search-btn {
          background: #1e3a8a;
          color: #ffffff;
          border: none;
          padding: 9px 20px;
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
          font-size: 15px;
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

        /* 🎯 CHỈ HIỂN THỊ LOGO TRƯỜNG, ĐẶT ĐÚNG GÓC TRÊN BÊN PHẢI */
        .school-logo-corner {
          position: absolute;
          top: 2cqw;
          right: 5cqw;
          z-index: 10;
          height: 9cqw;
          max-height: 40px;
          max-width: 50%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          pointer-events: none;
        }

        .school-logo-img {
          height: 100%;
          width: auto;
          max-width: 100%;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12));
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
          left: 1%;
          bottom: 4%;
          width: 33%;
          height: 92%;
          z-index: 2;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: hidden;
        }
        .teacher-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: bottom center;
          filter: drop-shadow(0 8px 12px rgba(0,0,0,0.15));
        }

        .content-box {
          position: absolute;
          top: 18%;
          left: 32%;
          width: 55%;
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
        .info-label { font-weight: 700; color: #334155; }
        .info-value { color: #64748b; font-weight: 500; }
        
        .progress-container { margin-top: 1px; }
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

        .essays-section {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
        }
        .two-columns-essay-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .essay-card-box {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          gap: 14px;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
        }
        .essay-card-box:hover {
          border-color: #38bdf8;
          box-shadow: 0 8px 20px rgba(30, 58, 138, 0.09);
          transform: translateY(-2px);
          background: #f8fafc;
        }
        .essay-cover-mockup {
          width: 82px;
          height: 114px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          flex-shrink: 0;
          position: relative;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 4px;
          overflow: hidden;
        }
        .essay-cover-mockup::after {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 4px;
          background: rgba(15, 23, 42, 0.15);
        }
        .cover-badge-top {
          position: absolute;
          top: 3px; right: 3px;
          background: #dc2626; color: white;
          font-size: 7px; font-weight: 900;
          padding: 1px 3px; border-radius: 2px;
        }
        .cover-inner-body {
          width: 100%; height: 100%;
          border: 1px dashed #e2e8f0;
          border-radius: 4px; padding: 4px 2px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
        }
        .cover-logo-icon {
          width: 20px; height: 20px;
          border-radius: 50%; font-size: 7px;
          font-weight: 800; display: flex;
          align-items: center; justify-content: center;
          margin-bottom: 4px;
        }
        .cover-preview-lines {
          width: 70%; height: 1.5px;
          background: #94a3b8; margin: 1.5px 0;
        }
        .cover-title-text {
          font-size: 6.5px; font-weight: 800;
          color: #1e293b; line-height: 1.1;
          margin-top: 3px; max-width: 90%;
        }
        .essay-details {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column;
          justify-content: space-between;
        }
        .essay-title-text {
          font-size: 13px; font-weight: 800;
          color: #0f172a; line-height: 1.35;
          margin-bottom: 4px; display: -webkit-box;
          -webkit-line-clamp: 2; line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .essay-desc-text {
          font-size: 11px; color: #64748b;
          line-height: 1.4; margin-bottom: 8px;
          display: -webkit-box; -webkit-line-clamp: 2;
          line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .essay-meta-row {
          display: flex; align-items: center;
          justify-content: space-between;
          padding-top: 8px; border-top: 1px solid #f1f5f9;
          font-size: 11px; color: #64748b;
        }

        .pdf-panel {
          background: #ffffff; border: 2px solid #e2e8f0;
          border-radius: 16px; padding: 14px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          display: flex; flex-direction: column;
        }
        .pdf-panel-header {
          display: flex; justify-content: space-between;
          align-items: center; border-bottom: 2px solid #f1f5f9;
          padding-bottom: 10px; margin-bottom: 12px;
        }
        .pdf-panel-title {
          font-size: 14px; font-weight: 800;
          color: #0f172a; text-transform: uppercase;
          letter-spacing: 0.3px; display: flex;
          align-items: center; gap: 6px;
        }
        .pdf-pill-badge {
          background: #0f172a; color: #ffffff;
          font-size: 9px; font-weight: 900;
          padding: 2px 6px; border-radius: 4px;
        }
        .doc-list {
          display: flex; flex-direction: column; gap: 10px;
          list-style: none; overflow-y: auto;
          max-height: 480px; padding-right: 2px;
        }
        .doc-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 8px; background: #ffffff;
          border: 1px solid #e2e8f0; border-radius: 8px;
          cursor: pointer; transition: all 0.2s ease;
        }
        .doc-item:hover {
          transform: translateX(2px); box-shadow: 0 4px 14px rgba(30, 58, 138, 0.08);
          border-color: #38bdf8; background: #f8fafc;
        }
        .doc-cover-thumb {
          position: relative; width: 44px; height: 60px;
          background: #ffffff; border: 1px solid #cbd5e1;
          border-radius: 4px; flex-shrink: 0;
          display: flex; flex-direction: column;
          justify-content: space-between; padding: 2px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.08); overflow: hidden;
        }
        .doc-badge-pdf {
          position: absolute; top: 1px; left: 1px;
          background: #0f172a; color: #ffffff;
          font-size: 6px; font-weight: 900;
          padding: 1px 2px; border-radius: 2px; z-index: 2;
        }
        .doc-cover-inner {
          width: 100%; height: 100%; border: 1px solid #e2e8f0;
          border-radius: 2px; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 2px;
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
        }
        .doc-cover-logo {
          width: 12px; height: 12px; border-radius: 50%;
          background: #fee2e2; color: #dc2626;
          font-size: 5px; font-weight: 800; display: flex;
          align-items: center; justify-content: center; margin-bottom: 2px;
        }
        .doc-cover-lines { width: 75%; height: 1px; background: #94a3b8; margin: 1px 0; }
        .doc-cover-text { font-size: 4.5px; font-weight: 800; color: #1e293b; line-height: 1.1; margin-top: 1px; }
        .doc-info {
          flex: 1; min-width: 0; display: flex; flex-direction: column;
          justify-content: space-between; height: 60px; padding: 1px 0;
        }
        .doc-rating { font-size: 10px; color: #64748b; font-weight: 500; display: flex; align-items: center; gap: 3px; }
        .doc-rating.active { color: #059669; font-weight: 700; }
        .doc-info h4 {
          font-size: 12px; font-weight: 800; color: #0f172a; line-height: 1.25;
          margin: 1px 0; display: -webkit-box; -webkit-line-clamp: 2;
          line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .doc-footer-meta { display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #64748b; font-weight: 600; }
        .download-btn { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 2px 4px; border-radius: 4px; transition: color 0.2s; }
        .download-btn:hover { color: #1e3a8a; }
        .pdf-quick-list { display: flex; flex-direction: column; gap: 8px; }
        .pdf-quick-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 10px; background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 8px; transition: all 0.2s ease; cursor: pointer;
        }
        .pdf-quick-item:hover {
          border-color: #38bdf8; background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }
        .pdf-quick-meta { display: flex; align-items: center; gap: 8px; }
        .pdf-quick-icon {
          width: 28px; height: 28px; border-radius: 6px; background: #e0f2fe;
          color: #0369a1; display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800;
        }
        .pdf-quick-details h5 {
          font-size: 11px; font-weight: 700; color: #1e293b; max-width: 160px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .pdf-quick-details span { font-size: 9px; color: #64748b; }

        @media (max-width: 1200px) {
          .home-wireframe-grid { grid-template-columns: 1fr; }
          .three-cards-grid { grid-template-columns: repeat(2, 1fr); }
          .two-columns-essay-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .three-cards-grid { grid-template-columns: 1fr; }
          .two-columns-essay-grid { grid-template-columns: 1fr; }
          .pill-search-bar { flex-direction: column; border-radius: 16px; padding: 12px; gap: 10px; }
          .search-btn { width: 100%; justify-content: center; }
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
          <section className="search-hero-box">
            <h2 className="search-hero-title">Diễn Đàn Chia Sẻ Khóa Học & Tiểu Luận Học Thuật</h2>
            
            <div className="pill-search-bar">
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
              <input 
                type="text" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm tiểu luận, đề cương ôn thi, khóa học, giáo trình PDF..." 
              />
              <button className="search-btn" onClick={() => triggerToast(`Tìm kiếm: ${searchKeyword || "Tất cả"}`)}>
                <span>TÌM KIẾM</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="quick-tags">
              <span>Từ khóa hot:</span>
              <span className="tag-pill" onClick={() => setSearchKeyword("Tiểu Luận")}>Tiểu Luận Pháp Luật</span>
              <span className="tag-pill" onClick={() => setSearchKeyword("Trí Tuệ Nhân Tạo")}>Trí Tuệ Nhân Tạo</span>
              <span className="tag-pill" onClick={() => setSearchKeyword("Học Máy")}>Học Máy Nâng Cao</span>
              <span className="tag-pill" onClick={() => setSearchKeyword("HNGĐ")}>Luật HNGĐ</span>
              <span className="tag-pill" onClick={() => setSearchKeyword("")}>Tất cả</span>
            </div>
          </section>

          <section className="courses-section">
            <div className="section-header-bar">
              <h3>CÁC KHÓA HỌC MỞ RỘNG</h3>
              <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1.5">
                {isLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                {filteredCourses.length} Khóa học mở rộng
              </span>
            </div>

            <div className="three-cards-grid">
              {filteredCourses.map((c) => (
                <div key={c.id} className="card-wrapper" data-course={c.courseName} data-teacher={c.teacherName}>
                  
                  {/* 🎯 LOGO GÓC TRÊN BÊN PHẢI (CHỈ HIỂN THỊ ẢNH LOGO, KHÔNG KÈM TEXT) */}
                  <div className="school-logo-corner">
                    <img 
                      src={c.logoImg} 
                      alt="Logo trường" 
                      className="school-logo-img" 
                      onError={(e) => { 
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_LOGO_IMG; 
                      }}
                    />
                  </div>

                  <div 
                    className="card-container" 
                    style={{ backgroundImage: 'url("/thekhoahoc/khung.png")' }}
                  >
                    <CardCanvas />

                    {/* ẢNH GIÁO VIÊN ĐỨNG DÁNG TOÀN THÂN */}
                    <div className="teacher-image-zone">
                      <img 
                        src={c.teacherImg} 
                        alt={c.teacherName} 
                        className="teacher-img" 
                        onError={(e) => { 
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_TEACHER_IMG; 
                        }}
                      />
                    </div>

                    <div className="content-box">
                      <div className="info-header">
                        <h2>THÔNG TIN CHI TIẾT</h2>
                        <div className="notification-badge">
                          <Bell className="w-[2.6cqw] h-[2.6cqw]" />
                          <span className="count">{c.notificationCount || 1}</span>
                        </div>
                      </div>

                      <div className="info-list">
                        <div className="info-item">
                          <span className="info-label">HỌ TÊN:</span>
                          <span className="info-value truncate w-24 text-right" title={c.teacherName}>{c.teacherName}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">MÔN HỌC:</span>
                          <span className="info-value truncate w-24 text-right" title={c.subject}>{c.subject}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">KHỐI LỚP:</span>
                          <span className="info-value truncate w-24 text-right" title={c.grade}>{c.grade}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">LỊCH HẸN:</span>
                          <span className="info-value truncate w-24 text-right">{c.schedule}</span>
                        </div>
                      </div>

                      <div className="progress-container">
                        <div className="progress-label">Hồ sơ: {c.profileProgress || 90}%</div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${c.profileProgress || 90}%` }}></div>
                        </div>
                      </div>

                      <div className="action-buttons">
                        <button 
                          className="card-btn btn-detail" 
                          onClick={() => navigate(`/student/courses/${c.id}`)}
                        >
                          <BookMarked className="w-[2cqw] h-[2cqw]" /> Xem chi tiết
                        </button>
                        <button 
                          className="card-btn btn-register" 
                          onClick={() => handleRegisterCourse(c.id, c.teacherName)}
                        >
                          <PlusCircle className="w-[2cqw] h-[2cqw]" /> Đăng ký môn
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredCourses.length === 0 && !isLoading && (
                <div className="col-span-full py-12 text-center text-slate-400 bg-white border border-slate-200 border-dashed rounded-3xl text-sm font-semibold">
                  Không tìm thấy khóa học mở rộng nào phù hợp.
                </div>
              )}
            </div>
          </section>

          <section className="essays-section">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-900" />
                  <span>Kho Tài Liệu PDF / Báo Cáo Học Thuật</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Tài liệu tham khảo được chia sẻ trực tiếp từ hệ thống bài giảng</p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                <button 
                  onClick={() => setEssayFilter("all")}
                  className={`px-3 py-1 rounded-lg transition ${essayFilter === 'all' ? 'bg-white text-blue-900 shadow-xs' : 'hover:text-slate-900'}`}
                >
                  Tất cả ({filteredEssays.length})
                </button>
                <button 
                  onClick={() => setEssayFilter("popular")}
                  className={`px-3 py-1 rounded-lg transition ${essayFilter === 'popular' ? 'bg-white text-blue-900 shadow-xs' : 'hover:text-slate-900'}`}
                >
                  Tải nhiều nhất
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="py-10 text-center text-slate-400 flex flex-col items-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
                <span className="text-xs font-medium">Đang tải tài liệu từ máy chủ...</span>
              </div>
            ) : (
              <div className="two-columns-essay-grid">
                {filteredEssays.map((essay) => (
                  <div 
                    key={essay.id} 
                    className="essay-card-box"
                    onClick={() => essay.fileUrl ? window.open(essay.fileUrl, "_blank") : navigate(`/student/documents/${essay.id}`)}
                  >
                    <div className="essay-cover-mockup">
                      <span className="cover-badge-top">PDF</span>
                      <div className="cover-inner-body">
                        <div className={`cover-logo-icon ${essay.color}`}>{essay.tag}</div>
                        <div className="cover-preview-lines"></div>
                        <div className="cover-preview-lines"></div>
                        <div className="cover-preview-lines" style={{ width: '50%' }}></div>
                        <div className="cover-title-text truncate">{essay.faculty}</div>
                      </div>
                    </div>

                    <div className="essay-details">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                          <span className="text-sky-700 font-bold">{essay.faculty}</span>
                          <span>{essay.date}</span>
                        </div>
                        <h4 className="essay-title-text" title={essay.title}>
                          {essay.title}
                        </h4>
                        <p className="essay-desc-text">
                          {essay.desc}
                        </p>
                      </div>

                      <div className="essay-meta-row">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-700">{essay.author}</span>
                          <span>•</span>
                          <span>{essay.pages} trang</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-bold text-emerald-600">
                            <Download className="w-3 h-3" /> {essay.downloads}
                          </span>
                          <button
                            className="p-1 hover:text-blue-900 rounded transition"
                            onClick={(e) => handleDownload(e, `${essay.title}.pdf`, essay.fileUrl)}
                            title="Tải nhanh"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-400 hover:text-blue-900" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="home-right-col">
          <section className="pdf-panel">
            <div className="pdf-panel-header">
              <div>
                <h3 className="pdf-panel-title">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span>Tài liệu đề xuất</span>
                </h3>
                <p style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>Bạn có thể quan tâm</p>
              </div>
              <span className="pdf-pill-badge">PDF HUB</span>
            </div>

            <ul className="doc-list">
              {filteredEssays.slice(0, 5).map((doc) => (
                <li 
                  key={doc.id} 
                  className="doc-item" 
                  onClick={() => doc.fileUrl ? window.open(doc.fileUrl, "_blank") : navigate(`/student/documents/${doc.id}`)}
                >
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
                    <span className="doc-rating active"><ThumbsUp className="w-3 h-3" /> {doc.likes} lượt thích</span>
                    <h4>{doc.title}</h4>
                    <div className="doc-footer-meta">
                      <span>{doc.pages} pages</span>
                      <button 
                        className="download-btn" 
                        onClick={(e) => handleDownload(e, `${doc.title}.pdf`, doc.fileUrl)}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              {filteredEssays.length === 0 && !isLoading && (
                <div className="text-center text-xs text-slate-400 py-4">Chưa có tài liệu đề xuất.</div>
              )}
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
                { id: 1, name: "Mau_Bia_Tieu_Luan_Chuan.pdf", meta: "0.8 MB • 3 Trang" },
                { id: 2, name: "De_Cuong_Tri_Tue_Nhan_Tao.pdf", meta: "2.4 MB • 15 Trang" }
              ].map((item) => (
                <div 
                  key={item.id} 
                  className="pdf-quick-item" 
                  onClick={() => triggerToast(`Đang mở: ${item.name}`)}
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
                    onClick={(e) => handleDownload(e, item.name)}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}