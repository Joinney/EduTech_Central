/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Play,
  Video,
  Globe,
} from "lucide-react";

import { courseService } from "../../../api/course.api";

// Import components con đã tách ra
import CardCanvas from "../../components/context/home/CardCanvas";
import PdfCoverPreview from "../../components/context/home/PdfCoverPreview";
// Bạn có thể xóa file VerticalVideoModal nếu không dùng nữa
import VerticalVideoModal from "../../components/context/home/VerticalVideoModal";

const DEFAULT_TEACHER_IMG = "/thekhoahoc/thaygiao.png";
const DEFAULT_LOGO_IMG = "/thekhoahoc/logo.png";
const COURSES_PER_PAGE = 6;
const DOCS_PER_PAGE = 4;

const PRESET_SCHOOL_LOGOS = {
  bka: "https://bka.hcmut.edu.vn/assets/images/logo/logo-bka.png",
  hcmut:
    "https://upload.wikimedia.org/wikipedia/vi/thumb/9/91/FC_B%C3%A1ch_Khoa_logo.png/200px-FC_B%C3%A1ch_Khoa_logo.png",
  hust: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Logo_Hust.png/200px-Logo_Hust.png",
  uit: "https://upload.wikimedia.org/wikipedia/vi/thumb/e/e0/Logo_UIT.svg/200px-Logo_UIT.svg.png",
  fpt: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/FPT_logo_2010.svg/200px-FPT_logo_2010.svg.png",
  vanlang:
    "https://upload.wikimedia.org/wikipedia/vi/thumb/0/07/Logo_V%C4%83n_Lang.svg/200px-Logo_V%C4%83n_Lang.svg.png",
};

const resolveSchoolLogo = (schoolName = "", customLogo = "") => {
  if (customLogo && !customLogo.includes("/thekhoahoc/logo.png"))
    return customLogo;
  const nameLower = schoolName.toLowerCase();
  if (nameLower.includes("bka") || nameLower.includes("alumni"))
    return PRESET_SCHOOL_LOGOS.bka;
  if (nameLower.includes("hà nội") || nameLower.includes("hust"))
    return PRESET_SCHOOL_LOGOS.hust;
  if (nameLower.includes("bách khoa") || nameLower.includes("hcmut"))
    return PRESET_SCHOOL_LOGOS.hcmut;
  if (nameLower.includes("thông tin") || nameLower.includes("uit"))
    return PRESET_SCHOOL_LOGOS.uit;
  if (nameLower.includes("fpt")) return PRESET_SCHOOL_LOGOS.fpt;
  if (nameLower.includes("văn lang")) return PRESET_SCHOOL_LOGOS.vanlang;
  return DEFAULT_LOGO_IMG;
};

export default function StudentHome() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role")?.toLowerCase() || "student";

  const [searchKeyword, setSearchKeyword] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchContainerRef = useRef(null);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [essayFilter, setEssayFilter] = useState("all");

  const [courses, setCourses] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [videos, setVideos] = useState([]); // ĐÃ THÊM: State chứa Video thật
  const [isLoading, setIsLoading] = useState(true);

  const [currentCoursePage, setCurrentCoursePage] = useState(1);
  const coursesSectionRef = useRef(null);

  const [currentDocPage, setCurrentDocPage] = useState(1);
  const docsSectionRef = useRef(null);

  const [isExpandedDocs, setIsExpandedDocs] = useState(false);

  const baseUrl =
    import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1";

  // --- FETCH API: TẢI DATA THẬT CHO KHÓA HỌC, TÀI LIỆU VÀ VIDEO ---
  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        // 1. TẢI KHÓA HỌC (Giữ nguyên logic dùng courseService cũ của bạn để không bị mất data)
        const rawCourses = await courseService.getAllCourses().catch(() => []);
        let coursesList = Array.isArray(rawCourses)
          ? rawCourses
          : rawCourses?.data || [];

        // LỌC BỎ VIDEO KHỎI TRANG CHỦ & TÌM KIẾM
        coursesList = coursesList.filter((c) => {
          const cType = String(c.type || "").toLowerCase();
          const cCat = String(c.category || "").toLowerCase();
          return cType !== "video" && cCat !== "video";
        });

        if (coursesList.length > 0) {
          const externalCourses = coursesList.filter(
            (c) => c.type === "external" || !c.type || c.type === "skill",
          );
          const targetList =
            externalCourses.length > 0 ? externalCourses : coursesList;

          const formattedCourses = targetList.map((c) => {
            const realUploadedImg =
              c.thumbnail &&
              !c.thumbnail.includes("unsplash.com") &&
              !c.thumbnail.includes("thekhoahoc")
                ? c.thumbnail
                : c.teacher_img || c.teacherImg || c.teacher_avatar;
            const isUIAvatar =
              realUploadedImg && realUploadedImg.includes("ui-avatars.com");
            const cleanTeacherImg =
              realUploadedImg && !isUIAvatar
                ? realUploadedImg
                : DEFAULT_TEACHER_IMG;
            const schoolName =
              c.schoolName || c.school_name || c.grade || "Trường đào tạo";
            const cleanSchoolLogo = resolveSchoolLogo(
              schoolName,
              c.school_logo || c.schoolLogo,
            );

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
              logoImg: cleanSchoolLogo,
            };
          });
          setCourses(formattedCourses);
        }

        // 2. TẢI TÀI LIỆU VÀ VIDEO (Gọi chung Promise.all cho lẹ)
        const [docRes, videoRes] = await Promise.all([
          fetch(`${baseUrl}/shared-documents?all=true`).catch(() => ({
            ok: false,
          })),
          fetch(`${baseUrl}/videos`).catch(() => ({ ok: false })), // Đã sửa tên route thành /videos chuẩn xác!
        ]);

        // Xử lý Tài liệu
        if (docRes.ok) {
          const docJson = await docRes.json();
          let rawDocs = Array.isArray(docJson) ? docJson : docJson?.data || [];
          rawDocs = rawDocs.filter((d) => {
            const dType = String(d.type || "").toLowerCase();
            const dCat = String(d.category || "").toLowerCase();
            return dType !== "video" && dCat !== "video";
          });

          const formattedDocs = rawDocs.map((item) => ({
            id: item.id,
            title: item.title,
            desc:
              item.description || "Tài liệu học tập được chia sẻ công khai.",
            author: item.student_name || "Thành viên EduTech",
            faculty:
              item.subject ||
              item.category_rel?.name ||
              item.category ||
              "Học thuật",
            pages: item.pages || 15,
            fileUrl: item.file_url,
            downloads: item.downloads || 0,
            likes: item.views ? Math.floor(item.views / 2) + 5 : 12,
            date: item.created_at
              ? new Date(item.created_at).toLocaleDateString("vi-VN")
              : "Gần đây",
          }));
          setDocuments(formattedDocs);
        }

        // Xử lý Video Thật
        if (videoRes.ok) {
          const videoJson = await videoRes.json();
          const rawVideos = Array.isArray(videoJson)
            ? videoJson
            : videoJson?.data || [];
          const formattedVideos = rawVideos.map((v) => ({
            id: v.id,
            title: v.title || v.video_title || "Video bài giảng",
            author: v.teacher_name || v.author || "Giảng viên",
            duration: v.duration || "10:00",
            views: v.views || 0,
            thumbnail:
              v.thumbnail ||
              "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=500&auto=format&fit=crop&q=60",
          }));
          setVideos(formattedVideos);
        }
      } catch (error) {
        console.error("Lỗi nạp dữ liệu trang chủ:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeData();
  }, [baseUrl]);

  // --- LOGIC TẠO GỢI Ý TÌM KIẾM CẬP NHẬT ---
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setSuggestions([]);
      return;
    }
    const kw = searchKeyword.trim().toLowerCase();

    const globalSearchItem = {
      isGlobal: true,
      type: "global",
      text: `Tìm kiếm toàn hệ thống cho "${searchKeyword.trim()}"`,
      value: searchKeyword.trim(),
    };

    const matchedCourses = courses
      .filter(
        (c) =>
          c.courseName.toLowerCase().includes(kw) ||
          c.subject.toLowerCase().includes(kw),
      )
      .slice(0, 3)
      .map((c) => ({
        isGlobal: false,
        type: "course",
        text: c.courseName,
        value: c.courseName,
        id: c.id,
      }));

    const matchedDocs = documents
      .filter(
        (d) =>
          d.title.toLowerCase().includes(kw) ||
          d.faculty.toLowerCase().includes(kw),
      )
      .slice(0, 3)
      .map((d) => ({
        isGlobal: false,
        type: "document",
        text: d.title,
        value: d.title,
        id: d.id,
      }));

    // Cập nhật: Thêm Video thật vào gợi ý tìm kiếm
    const matchedVideos = videos
      .filter(
        (v) =>
          v.title.toLowerCase().includes(kw) ||
          v.author.toLowerCase().includes(kw),
      )
      .slice(0, 3)
      .map((v) => ({
        isGlobal: false,
        type: "video",
        text: v.title,
        value: v.title,
        id: v.id,
      }));

    const staticKeywords = [
      "Tiểu luận chuyên ngành",
      "Báo cáo thực tập",
      "Trí tuệ nhân tạo (AI)",
      "Đề cương ôn thi",
    ];
    const matchedStatic = staticKeywords
      .filter((k) => k.toLowerCase().includes(kw))
      .map((k) => ({ isGlobal: false, type: "static", text: k, value: k }));

    setSuggestions(
      [
        globalSearchItem,
        ...matchedCourses,
        ...matchedDocs,
        ...matchedVideos,
        ...matchedStatic,
      ].slice(0, 7),
    );
  }, [searchKeyword, courses, documents, videos]);

  // Click ra ngoài để đóng Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // --- HÀM CHUYỂN HƯỚNG SANG TRANG SEARCH / TRANG CHI TIẾT ---
  const handleSuggestionClick = (item) => {
    setShowSuggestions(false);
    setSearchKeyword(item.value || item.text);

    if (item.isGlobal || item.type === "static") {
      navigate(`/${role}/search?query=${encodeURIComponent(item.value)}`);
    } else if (item.type === "course") {
      navigate(`/${role}/courses/${item.id}`);
    } else if (item.type === "document") {
      navigate(`/${role}/documents/${item.id}`);
    } else if (item.type === "video") {
      navigate(`/${role}/videos/${item.id}`); // Điều hướng trực tiếp tới trang Video bài giảng
    }
  };

  const handleSearchSubmit = (keyword = searchKeyword) => {
    if (!keyword.trim()) return;
    setShowSuggestions(false);
    navigate(`/${role}/search?query=${encodeURIComponent(keyword)}`);
  };

  const handleRegisterCourse = (courseId, teacherName) => {
    triggerToast(`Đã gửi yêu cầu đăng ký lớp của GV: ${teacherName}`);
  };

  const handleDownload = (e, filename, url) => {
    e.stopPropagation();
    triggerToast(`Đang mở tệp: ${filename}`);
    if (url) window.open(url, "_blank");
  };

  const filteredCourses = courses;
  const totalCoursePages =
    Math.ceil(filteredCourses.length / COURSES_PER_PAGE) || 1;

  const paginatedCourses = useMemo(() => {
    const startIdx = (currentCoursePage - 1) * COURSES_PER_PAGE;
    return filteredCourses.slice(startIdx, startIdx + COURSES_PER_PAGE);
  }, [filteredCourses, currentCoursePage]);

  const handleCoursePageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= totalCoursePages &&
      newPage !== currentCoursePage
    ) {
      setCurrentCoursePage(newPage);
      coursesSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const filteredDocuments = useMemo(() => {
    let list = [...documents];
    if (essayFilter === "popular") {
      list = list.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    }
    return list;
  }, [documents, essayFilter]);

  const totalDocPages =
    Math.ceil(filteredDocuments.length / DOCS_PER_PAGE) || 1;

  const paginatedDocuments = useMemo(() => {
    const startIdx = (currentDocPage - 1) * DOCS_PER_PAGE;
    return filteredDocuments.slice(startIdx, startIdx + DOCS_PER_PAGE);
  }, [filteredDocuments, currentDocPage]);

  const handleDocPageChange = (newPage) => {
    if (
      newPage >= 1 &&
      newPage <= totalDocPages &&
      newPage !== currentDocPage
    ) {
      setCurrentDocPage(newPage);
      docsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="home-root-wrapper">
      <style>{`
        .home-root-wrapper {
          width: 100%; min-height: 100%; padding: 0 0 50px 0; box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .home-wireframe-grid { display: grid; grid-template-columns: 1fr 310px; gap: 20px; align-items: start; width: 100%; }
        .home-left-col { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
        .home-right-col { display: flex; flex-direction: column; gap: 20px; }

        .search-hero-box {
          position: relative; background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0284c7 100%);
          border: 2px solid #cbd5e1; border-radius: 16px; min-height: 200px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 24px; box-shadow: 0 8px 24px rgba(30, 58, 138, 0.12); overflow: visible;
        }
        .search-hero-box::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px);
          background-size: 20px 20px; pointer-events: none;
        }
        .search-hero-title {
          position: relative; color: #ffffff; font-size: 20px; font-weight: 800;
          text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px; text-align: center;
        }
        
       .search-wrapper-relative {
        position: relative; width: 100%; max-width: 680px; z-index: 20;
        }
        .pill-search-bar {
          position: relative; width: 100%; background: #ffffff;
          border: 3px solid #38bdf8; border-radius: 50px; display: flex; align-items: center;
          padding: 6px 10px 6px 22px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25); transition: all 0.25s ease;
        }
        .pill-search-bar.has-dropdown {
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
        }
        .pill-search-bar:focus-within { border-color: #f59e0b; box-shadow: 0 12px 35px rgba(245, 158, 11, 0.35); transform: scale(1.01); }
        .pill-search-bar input { flex: 1; border: none; outline: none; font-size: 14px; font-weight: 600; color: #0f172a; background: transparent; }
        
        .search-suggestions-dropdown {
          position: absolute; top: calc(100% + 4px); left: 0; width: 100%;
          background: #ffffff; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          overflow: hidden; border: 1px solid #e2e8f0; display: flex; flex-direction: column;
          animation: slideDown 0.2s ease-out forwards;
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        
        .suggestion-item {
          padding: 12px 20px; display: flex; align-items: center; gap: 12px;
          font-size: 14px; color: #334155; font-weight: 500; cursor: pointer;
          border-bottom: 1px solid #f1f5f9; transition: background 0.2s;
        }
        .suggestion-item:last-child { border-bottom: none; }
        .suggestion-item:hover { background: #f8fafc; color: #1e3a8a; }
        .suggestion-item.global-item { color: #0284c7; font-weight: 700; background: #f0f9ff; }
        .suggestion-item.global-item:hover { background: #e0f2fe; }

        .search-btn {
          background: #1e3a8a; color: #ffffff; border: none; padding: 9px 20px; border-radius: 40px;
          font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
          cursor: pointer; transition: background 0.2s; display: flex; align-items: center; gap: 6px;
        }
        .search-btn:hover { background: #0284c7; }
        .quick-tags { position: relative; display: flex; align-items: center; gap: 8px; margin-top: 12px; font-size: 12px; color: #e2e8f0; flex-wrap: wrap; justify-content: center; }
        .tag-pill { background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); color: #ffffff; padding: 3px 10px; border-radius: 20px; cursor: pointer; transition: all 0.2s; }
        .tag-pill:hover { background: #ffffff; color: #1e3a8a; }

        .courses-section { display: flex; flex-direction: column; gap: 12px; }
        .section-header-bar { display: flex; justify-content: space-between; align-items: center; }
        .section-header-bar h3 {
          font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-header-bar h3::before { content: ''; width: 4px; height: 18px; background: #1e3a8a; border-radius: 2px; display: inline-block; }
        .three-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .card-wrapper { position: relative; width: 100%; container-type: inline-size; display: flex; flex-direction: column; }

        .school-logo-corner {
          position: absolute; top: 2cqw; right: 5cqw; z-index: 10; height: 9cqw; max-height: 40px;
          max-width: 50%; display: flex; align-items: center; justify-content: flex-end; pointer-events: none;
        }
        .school-logo-img { height: 100%; width: auto; max-width: 100%; object-fit: contain; display: block; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12)); }
        .card-container {
          position: relative; width: 100%; aspect-ratio: 900 / 520; background-image: url('/thekhoahoc/khung.png');
          background-color: #ffffff; background-size: 100% 100%; background-repeat: no-repeat; background-position: center;
          border-radius: 3cqw; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #cbd5e1; transition: all 0.3s ease;
        }
        .card-container:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(30, 58, 138, 0.12); border-color: #1e3a8a; }
        .card-canvas { position: absolute; top: -8cqw; left: -8cqw; width: calc(100% + 16cqw); height: calc(100% + 16cqw); z-index: 5; pointer-events: none; opacity: 0; transition: opacity 0.3s ease; }
        .card-container:hover .card-canvas { opacity: 1; }
        
        .teacher-image-zone {
          position: absolute; left: 1%; bottom: 4%; width: 33%; height: 92%; z-index: 2;
          display: flex; align-items: flex-end; justify-content: center; overflow: hidden;
        }
        .teacher-img { width: 100%; height: 100%; object-fit: contain; object-position: bottom center; filter: drop-shadow(0 8px 12px rgba(0,0,0,0.15)); }
        .content-box {
          position: absolute; top: 18%; left: 32%; width: 55%; height: 75%; z-index: 3;
          display: flex; flex-direction: column; justify-content: space-between;
        }
        .info-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 2px; }
        .info-header h2 { color: #1e3a8a; font-size: 2.5cqw; font-weight: 800; text-transform: uppercase; }
        .notification-badge { position: relative; color: #1e3a8a; font-size: 2.6cqw; }
        .notification-badge .count {
          position: absolute; top: -4px; right: -6px; background: #ef4444; color: white;
          font-size: 1.6cqw; width: 2cqw; height: 2cqw; min-width: 13px; min-height: 13px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;
        }
        .info-list { display: flex; flex-direction: column; gap: 2px; }
        .info-item { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 1px; font-size: 2cqw; line-height: 1.25; }
        .info-label { font-weight: 700; color: #334155; }
        .info-value { color: #64748b; font-weight: 500; }
        
        .progress-container { margin-top: 1px; }
        .progress-label { display: flex; justify-content: flex-end; font-size: 1.7cqw; color: #64748b; margin-bottom: 1px; font-weight: 600; }
        .progress-bar { width: 100%; height: 4px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: #1e3a8a; }
        .action-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 2px; }
        .card-btn {
          width: 100%; padding: 1cqw 0.5cqw; border: none; border-radius: 5px; font-size: 1.8cqw;
          font-weight: 700; color: #ffffff; display: flex; align-items: center; justify-content: center;
          gap: 4px; text-transform: uppercase; cursor: pointer; white-space: nowrap; transition: background 0.2s;
        }
        .btn-detail { background-color: #1e3a8a; }
        .btn-detail:hover { background-color: #1d4ed8; }
        .btn-register { background-color: #ea580c; }
        .btn-register:hover { background-color: #c2410c; }

        .essays-section { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 20px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02); }
        .two-columns-essay-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .essay-card-box {
          background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px;
          display: flex; gap: 14px; cursor: pointer; transition: all 0.25s ease; position: relative;
        }
        .essay-card-box:hover { border-color: #38bdf8; box-shadow: 0 8px 20px rgba(30, 58, 138, 0.09); transform: translateY(-2px); background: #f8fafc; }
        .essay-details { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; }
        .essay-title-text {
          font-size: 13px; font-weight: 800; color: #0f172a; line-height: 1.35; margin-bottom: 4px;
          display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .essay-desc-text {
          font-size: 11px; color: #64748b; line-height: 1.4; margin-bottom: 8px;
          display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .essay-meta-row { display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #64748b; }

        .pdf-panel { background: #ffffff; border: 2px solid #e2e8f0; border-radius: 16px; padding: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; }
        .pdf-panel-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-bottom: 12px; }
        .pdf-panel-title { font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.3px; display: flex; align-items: center; gap: 6px; }
        .pdf-pill-badge { background: #0f172a; color: #ffffff; font-size: 9px; font-weight: 900; padding: 2px 6px; border-radius: 4px; }
        .doc-list { display: flex; flex-direction: column; gap: 10px; list-style: none; padding-right: 2px; }
        .doc-item {
          display: flex; align-items: flex-start; gap: 10px; padding: 8px; background: #ffffff;
          border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s ease;
        }
        .doc-item:hover { transform: translateX(2px); box-shadow: 0 4px 14px rgba(30, 58, 138, 0.08); border-color: #38bdf8; background: #f8fafc; }
        .doc-info { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between; height: 60px; padding: 1px 0; }
        .doc-rating { font-size: 10px; color: #64748b; font-weight: 500; display: flex; align-items: center; gap: 3px; }
        .doc-rating.active { color: #059669; font-weight: 700; }
        .doc-info h4 {
          font-size: 12px; font-weight: 800; color: #0f172a; line-height: 1.25; margin: 1px 0;
          display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .doc-footer-meta { display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #64748b; font-weight: 600; }
        .download-btn { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 2px 4px; border-radius: 4px; transition: color 0.2s; }
        .download-btn:hover { color: #1e3a8a; }

        .vertical-video-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .vertical-video-card {
          position: relative; aspect-ratio: 9 / 14; border-radius: 12px; overflow: hidden;
          cursor: pointer; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transition: all 0.25s ease; background: #0f172a;
        }
        .vertical-video-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); border-color: #f97316; }
        .vertical-video-thumb { width: 100%; height: 100%; object-fit: cover; opacity: 0.82; transition: opacity 0.2s; }
        .vertical-video-card:hover .vertical-video-thumb { opacity: 0.95; }
        .vertical-video-overlay {
          position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%);
          display: flex; flex-direction: column; justify-content: space-between; padding: 8px; color: #ffffff;
        }
        .play-float-badge {
          width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.9);
          color: #ea580c; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .video-meta-tag { font-size: 8px; background: rgba(15, 23, 42, 0.7); padding: 1px 4px; border-radius: 4px; font-weight: bold; }

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
          {/* SEARCH HERO */}
          <section className="search-hero-box">
            <h2 className="search-hero-title">
              Diễn Đàn Chia Sẻ Khóa Học & Tiểu Luận Học Thuật
            </h2>

            {/* WRAPPER SEARCH (GỘP THANH TÌM KIẾM VÀ DROPDOWN) */}
            <div className="search-wrapper-relative" ref={searchContainerRef}>
              <div
                className={`pill-search-bar ${showSuggestions && suggestions.length > 0 ? "has-dropdown" : ""}`}
              >
                <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearchSubmit();
                  }}
                  placeholder="Tìm tiểu luận, đề cương ôn thi, khóa học, video..."
                />
                <button
                  className="search-btn"
                  onClick={() => handleSearchSubmit()}
                >
                  <span>TÌM KIẾM</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* DROPDOWN MENU GỢI Ý */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="search-suggestions-dropdown">
                  {suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className={`suggestion-item ${sug.isGlobal ? "global-item" : ""}`}
                      onClick={() => handleSuggestionClick(sug)}
                    >
                      {sug.isGlobal && (
                        <Globe className="w-4 h-4 shrink-0 text-sky-600" />
                      )}
                      {sug.type === "course" && (
                        <BookMarked className="w-4 h-4 shrink-0 text-blue-500" />
                      )}
                      {sug.type === "document" && (
                        <FileText className="w-4 h-4 shrink-0 text-orange-500" />
                      )}
                      {sug.type === "video" && (
                        <Video className="w-4 h-4 shrink-0 text-red-500" />
                      )}
                      {sug.type === "static" && (
                        <Search className="w-4 h-4 shrink-0 text-slate-400" />
                      )}

                      <div className="flex flex-col">
                        <span className="truncate">{sug.text}</span>
                        {!sug.isGlobal && sug.type !== "static" && (
                          <span className="text-[10px] text-slate-400 font-bold uppercase leading-none mt-1">
                            {sug.type === "course"
                              ? "Khóa học"
                              : sug.type === "document"
                                ? "Tài liệu PDF"
                                : "Video bài giảng"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="quick-tags">
              <span>Từ khóa hot:</span>
              <span
                className="tag-pill"
                onClick={() => handleSearchSubmit("Tiểu Luận Pháp Luật")}
              >
                Tiểu Luận Pháp Luật
              </span>
              <span
                className="tag-pill"
                onClick={() => handleSearchSubmit("Trí Tuệ Nhân Tạo")}
              >
                Trí Tuệ Nhân Tạo
              </span>
              <span
                className="tag-pill"
                onClick={() => handleSearchSubmit("Học Máy")}
              >
                Học Máy Nâng Cao
              </span>
              <span
                className="tag-pill"
                onClick={() => handleSearchSubmit("Đề thi")}
              >
                Đề thi & Kiểm tra
              </span>
            </div>
          </section>

          {/* SECTION KHÓA HỌC MỞ RỘNG */}
          <section className="courses-section" ref={coursesSectionRef}>
            <div className="section-header-bar">
              <h3>CÁC KHÓA HỌC MỞ RỘNG</h3>
              <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1.5">
                {isLoading && (
                  <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                )}
                {filteredCourses.length} Khóa học mở rộng
              </span>
            </div>

            <div className="three-cards-grid">
              {paginatedCourses.map((c) => (
                <div
                  key={c.id}
                  className="card-wrapper"
                  data-course={c.courseName}
                  data-teacher={c.teacherName}
                >
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
                          <span className="count">
                            {c.notificationCount || 1}
                          </span>
                        </div>
                      </div>

                      <div className="info-list">
                        <div className="info-item">
                          <span className="info-label">HỌ TÊN:</span>
                          <span
                            className="info-value truncate w-24 text-right"
                            title={c.teacherName}
                          >
                            {c.teacherName}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">MÔN HỌC:</span>
                          <span
                            className="info-value truncate w-24 text-right"
                            title={c.subject}
                          >
                            {c.subject}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">KHỐI LỚP:</span>
                          <span
                            className="info-value truncate w-24 text-right"
                            title={c.grade}
                          >
                            {c.grade}
                          </span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">LỊCH HẸN:</span>
                          <span className="info-value truncate w-24 text-right">
                            {c.schedule}
                          </span>
                        </div>
                      </div>

                      <div className="progress-container">
                        <div className="progress-label">
                          Hồ sơ: {c.profileProgress || 90}%
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${c.profileProgress || 90}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="action-buttons">
                        <button
                          className="card-btn btn-detail"
                          onClick={() => navigate(`/${role}/courses/${c.id}`)}
                        >
                          <BookMarked className="w-[2cqw] h-[2cqw]" /> Xem chi
                          tiết
                        </button>
                        <button
                          className="card-btn btn-register"
                          onClick={() =>
                            handleRegisterCourse(c.id, c.teacherName)
                          }
                        >
                          <PlusCircle className="w-[2cqw] h-[2cqw]" /> Đăng ký
                          môn
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredCourses.length === 0 && !isLoading && (
                <div className="col-span-full py-12 text-center text-slate-400 bg-white border border-slate-200 border-dashed rounded-3xl text-sm font-semibold">
                  Không tìm thấy khóa học mở rộng nào.
                </div>
              )}
            </div>

            {/* BỘ PHÂN TRANG KHÓA HỌC */}
            {filteredCourses.length > COURSES_PER_PAGE && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 mt-1 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="text-xs font-medium text-slate-500">
                  Hiển thị{" "}
                  <strong className="text-slate-800 font-bold">
                    {(currentCoursePage - 1) * COURSES_PER_PAGE + 1}
                  </strong>{" "}
                  -{" "}
                  <strong className="text-slate-800 font-bold">
                    {Math.min(
                      currentCoursePage * COURSES_PER_PAGE,
                      filteredCourses.length,
                    )}
                  </strong>{" "}
                  trên tổng{" "}
                  <strong className="text-blue-900 font-bold">
                    {filteredCourses.length}
                  </strong>{" "}
                  khóa học
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleCoursePageChange(currentCoursePage - 1)
                    }
                    disabled={currentCoursePage === 1}
                    className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      currentCoursePage === 1
                        ? "text-slate-300 bg-slate-50 cursor-not-allowed border border-slate-100"
                        : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:text-blue-900 shadow-2xs"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Trước</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalCoursePages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalCoursePages ||
                        (pageNum >= currentCoursePage - 1 &&
                          pageNum <= currentCoursePage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handleCoursePageChange(pageNum)}
                            className={`w-8 h-8 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                              currentCoursePage === pageNum
                                ? "bg-blue-900 text-white shadow-md shadow-blue-900/20 font-black"
                                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentCoursePage - 2 ||
                        pageNum === currentCoursePage + 2
                      ) {
                        return (
                          <span
                            key={pageNum}
                            className="px-1 text-slate-400 font-bold text-xs"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleCoursePageChange(currentCoursePage + 1)
                    }
                    disabled={currentCoursePage === totalCoursePages}
                    className={`p-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      currentCoursePage === totalCoursePages
                        ? "text-slate-300 bg-slate-50 cursor-not-allowed border border-slate-100"
                        : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:text-blue-900 shadow-2xs"
                    }`}
                  >
                    <span className="hidden sm:inline">Sau</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* SECTION TIỂU LUẬN & BÁO CÁO HỌC THUẬT */}
          <section className="essays-section" ref={docsSectionRef}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-900" />
                  <span>Kho Tài Liệu PDF / Báo Cáo Học Thuật</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tài liệu tham khảo chọn lọc từ hệ thống bài giảng
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                <button
                  onClick={() => setEssayFilter("all")}
                  className={`px-3 py-1 rounded-lg transition ${essayFilter === "all" ? "bg-white text-blue-900 shadow-xs" : "hover:text-slate-900"}`}
                >
                  Tất cả ({filteredDocuments.length})
                </button>
                <button
                  onClick={() => setEssayFilter("popular")}
                  className={`px-3 py-1 rounded-lg transition ${essayFilter === "popular" ? "bg-white text-blue-900 shadow-xs" : "hover:text-slate-900"}`}
                >
                  Tải nhiều nhất
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-slate-400 flex flex-col items-center">
                <Loader2 className="w-7 h-7 animate-spin text-blue-900 mb-2" />
                <span className="text-xs font-medium">
                  Đang tải tài liệu PDF...
                </span>
              </div>
            ) : (
              <>
                <div className="two-columns-essay-grid">
                  {paginatedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="essay-card-box"
                      onClick={() => navigate(`/${role}/documents/${doc.id}`)}
                    >
                      <PdfCoverPreview
                        fileUrl={doc.fileUrl}
                        width={82}
                        height={114}
                        title={doc.title}
                      />

                      <div className="essay-details">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                            <span className="text-sky-700 font-bold">
                              {doc.faculty}
                            </span>
                            <span>{doc.date}</span>
                          </div>
                          <h4 className="essay-title-text" title={doc.title}>
                            {doc.title}
                          </h4>
                          <p className="essay-desc-text">{doc.desc}</p>
                        </div>

                        <div className="essay-meta-row">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700 truncate max-w-[120px]">
                              {doc.author}
                            </span>
                            <span>•</span>
                            <span>{doc.pages} trang</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 font-bold text-emerald-600">
                              <Download className="w-3 h-3" /> {doc.downloads}
                            </span>
                            <button
                              type="button"
                              className="p-1 hover:text-blue-900 rounded transition"
                              onClick={(e) =>
                                handleDownload(
                                  e,
                                  `${doc.title}.pdf`,
                                  doc.fileUrl,
                                )
                              }
                              title="Tải nhanh"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-400 hover:text-blue-900" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredDocuments.length === 0 && !isLoading && (
                    <div className="col-span-full py-10 text-center text-slate-400 text-xs font-semibold">
                      Chưa có tài liệu nào trên hệ thống.
                    </div>
                  )}
                </div>

                {/* BỘ PHÂN TRANG CHO KHO TÀI LIỆU */}
                {filteredDocuments.length > DOCS_PER_PAGE && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
                    <div className="text-xs font-medium text-slate-500">
                      Hiển thị{" "}
                      <strong className="text-slate-800 font-bold">
                        {(currentDocPage - 1) * DOCS_PER_PAGE + 1}
                      </strong>{" "}
                      -{" "}
                      <strong className="text-slate-800 font-bold">
                        {Math.min(
                          currentDocPage * DOCS_PER_PAGE,
                          filteredDocuments.length,
                        )}
                      </strong>{" "}
                      trên tổng{" "}
                      <strong className="text-blue-900 font-bold">
                        {filteredDocuments.length}
                      </strong>{" "}
                      tài liệu
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleDocPageChange(currentDocPage - 1)}
                        disabled={currentDocPage === 1}
                        className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          currentDocPage === 1
                            ? "text-slate-300 bg-slate-50 cursor-not-allowed border border-slate-100"
                            : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:text-blue-900 shadow-2xs"
                        }`}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Trước</span>
                      </button>

                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalDocPages }).map((_, idx) => {
                          const pageNum = idx + 1;
                          if (
                            pageNum === 1 ||
                            pageNum === totalDocPages ||
                            (pageNum >= currentDocPage - 1 &&
                              pageNum <= currentDocPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNum}
                                type="button"
                                onClick={() => handleDocPageChange(pageNum)}
                                className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                                  currentDocPage === pageNum
                                    ? "bg-blue-900 text-white shadow-xs font-black"
                                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          } else if (
                            pageNum === currentDocPage - 2 ||
                            pageNum === currentDocPage + 2
                          ) {
                            return (
                              <span
                                key={pageNum}
                                className="px-1 text-slate-400 font-bold text-xs"
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDocPageChange(currentDocPage + 1)}
                        disabled={currentDocPage === totalDocPages}
                        className={`p-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                          currentDocPage === totalDocPages
                            ? "text-slate-300 bg-slate-50 cursor-not-allowed border border-slate-100"
                            : "text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:text-blue-900 shadow-2xs"
                        }`}
                      >
                        <span>Sau</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* CỘT PHẢI */}
        <div className="home-right-col">
          {/* 1. TÀI LIỆU ĐỀ XUẤT */}
          <section className="pdf-panel">
            <div className="pdf-panel-header">
              <div>
                <h3 className="pdf-panel-title">
                  <FileText className="w-4 h-4 text-red-500" />
                  <span>Tài liệu đề xuất</span>
                </h3>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    marginTop: "2px",
                  }}
                >
                  Gợi ý học tập
                </p>
              </div>
              <span className="pdf-pill-badge">PDF HUB</span>
            </div>

            <ul className="doc-list" style={{ maxHeight: "none" }}>
              {(isExpandedDocs
                ? filteredDocuments.slice(0, 8)
                : filteredDocuments.slice(0, 2)
              ).map((doc) => (
                <li
                  key={doc.id}
                  className="doc-item"
                  onClick={() => navigate(`/${role}/documents/${doc.id}`)}
                >
                  <PdfCoverPreview
                    fileUrl={doc.fileUrl}
                    width={44}
                    height={60}
                    title={doc.title}
                  />

                  <div className="doc-info">
                    <span className="doc-rating active">
                      <ThumbsUp className="w-3 h-3" /> {doc.likes} lượt thích
                    </span>
                    <h4 title={doc.title}>{doc.title}</h4>
                    <div className="doc-footer-meta">
                      <span>{doc.pages} trang</span>
                      <button
                        type="button"
                        className="download-btn"
                        onClick={(e) =>
                          handleDownload(e, `${doc.title}.pdf`, doc.fileUrl)
                        }
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}

              {filteredDocuments.length === 0 && !isLoading && (
                <div className="text-center text-xs text-slate-400 py-4">
                  Chưa có tài liệu đề xuất.
                </div>
              )}
            </ul>

            {filteredDocuments.length > 2 && (
              <button
                type="button"
                onClick={() => setIsExpandedDocs(!isExpandedDocs)}
                className="w-full mt-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>
                  {isExpandedDocs
                    ? "Thu gọn"
                    : `Xem thêm (${filteredDocuments.length - 2} tài liệu)`}
                </span>
              </button>
            )}
          </section>

          {/* 2. VIDEO DỌC SHORTS */}
          <section className="pdf-panel">
            <div className="pdf-panel-header">
              <div>
                <h3 className="pdf-panel-title">
                  <Video className="w-4 h-4 text-orange-500" />
                  <span>Video Học Nhanh</span>
                </h3>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    marginTop: "2px",
                  }}
                >
                  Clip bài giảng 9:16
                </p>
              </div>
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 900,
                  background: "#ea580c",
                  color: "white",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                SHORTS
              </span>
            </div>

            <div className="vertical-video-grid">
              {videos.slice(0, 2).map((vid) => (
                <div
                  key={vid.id}
                  className="vertical-video-card group"
                  onClick={() => navigate(`/${role}/videos/${vid.id}`)}
                >
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="vertical-video-thumb"
                  />

                  <div className="vertical-video-overlay">
                    <div className="flex justify-between items-start">
                      <span className="video-meta-tag">{vid.duration}</span>
                      <div className="play-float-badge group-hover:scale-110 transition-transform">
                        <Play className="w-3 h-3 fill-orange-600 ml-0.5" />
                      </div>
                    </div>

                    <div>
                      <h5 className="text-[11px] font-bold line-clamp-2 leading-tight mb-1 text-white">
                        {vid.title}
                      </h5>
                      <div className="flex items-center justify-between text-[9px] text-slate-300">
                        <span className="truncate max-w-[65px]">
                          {vid.author}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Eye className="w-2.5 h-2.5" /> {vid.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate(`/${role}/videos`)}
              className="w-full mt-3 py-1.5 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3 h-3 fill-orange-700" />
              <span>Xem thêm video khác</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
