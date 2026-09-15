import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Video,
  PlusCircle,
  Users,
  FileCheck,
  BarChart3,
  Calendar,
  ArrowUpRight,
  FolderPlus,
  Search,
  BookMarked,
  FileText,
  Globe,
  ArrowRight,
  Settings,
  BookOpen,
} from "lucide-react";

// Import Modal Onboarding dành riêng cho Giảng viên
import WelcomeTeacherModal from "../../components/WelcomeTeacherModal.jsx";

// Component Canvas hạt phân tử AI tông màu Hổ Phách / Cam dành cho Giảng viên
function TeacherParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const particleCount = 40;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1.5,
        alpha: Math.random() * 0.5 + 0.5,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 237, 213, ${p.alpha})`; // Hạt màu cam nhạt
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#ffedd5";
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

export default function TeacherHome() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role")?.toLowerCase() || "teacher";

  const [user, setUser] = useState(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  // --- STATES TÌM KIẾM ---
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [allData, setAllData] = useState({
    courses: [],
    documents: [],
    videos: [],
  });
  const searchContainerRef = useRef(null);

  const baseUrl =
    import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1";

  // Kiểm tra cờ is_onboarded khi Giảng viên vào Dashboard
  useEffect(() => {
    const loadUserData = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Đọc cả 2 kiểu tên cờ isOnboarded và is_onboarded
          const isOnboarded =
            parsedUser.isOnboarded ?? parsedUser.is_onboarded ?? false;

          // Nếu CHƯA onboard -> Bật Modal Giảng viên
          if (!isOnboarded) {
            setShowTeacherModal(true);
          }
        } catch (e) {
          console.error("Lỗi đọc dữ liệu người dùng:", e);
        }
      }
    };

    loadUserData();

    window.addEventListener("storage", loadUserData);
    return () => window.removeEventListener("storage", loadUserData);
  }, []);

  // --- FETCH DỮ LIỆU ĐỂ TÌM KIẾM (CHẠY NGẦM) ---
  useEffect(() => {
    const fetchAllDataForSearch = async () => {
      try {
        const [courseRes, docRes, videoRes] = await Promise.all([
          fetch(`${baseUrl}/courses`).catch(() => ({ json: () => [] })),
          fetch(`${baseUrl}/shared-documents?all=true`).catch(() => ({
            json: () => [],
          })),
          fetch(`${baseUrl}/videos`).catch(() => ({ json: () => [] })),
        ]);

        const courseData = await courseRes.json();
        const docData = await docRes.json();
        const videoData = await videoRes.json();

        let rawCourses = Array.isArray(courseData)
          ? courseData
          : courseData?.data || [];
        let rawDocs = Array.isArray(docData) ? docData : docData?.data || [];
        let rawVideos = Array.isArray(videoData)
          ? videoData
          : videoData?.data || [];

        // Lọc bỏ video bị nhầm vào mảng khóa học/tài liệu
        rawCourses = rawCourses.filter(
          (c) =>
            String(c.type || "").toLowerCase() !== "video" &&
            String(c.category || "").toLowerCase() !== "video",
        );
        rawDocs = rawDocs.filter(
          (d) =>
            String(d.type || "").toLowerCase() !== "video" &&
            String(d.category || "").toLowerCase() !== "video",
        );

        // Chuẩn hóa dữ liệu Video thật
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

        setAllData({
          courses: rawCourses,
          documents: rawDocs,
          videos: formattedVideos,
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu search ẩn:", error);
      }
    };
    fetchAllDataForSearch();
  }, [baseUrl]);

  // --- XỬ LÝ GÕ TÌM KIẾM (AUTOCOMPLETE BAO QUÁT HƠN) ---
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

    const matchedCourses = allData.courses
      .filter(
        (c) =>
          c.title?.toLowerCase().includes(kw) ||
          c.subject?.toLowerCase().includes(kw),
      )
      .slice(0, 3)
      .map((c) => ({
        isGlobal: false,
        type: "course",
        text: c.title,
        value: c.title,
        id: c.id || c.id_course,
      }));

    const matchedDocs = allData.documents
      .filter(
        (d) =>
          d.title?.toLowerCase().includes(kw) ||
          d.faculty?.toLowerCase().includes(kw),
      )
      .slice(0, 3)
      .map((d) => ({
        isGlobal: false,
        type: "document",
        text: d.title,
        value: d.title,
        id: d.id,
      }));

    const matchedVideos = allData.videos
      .filter(
        (v) =>
          v.title?.toLowerCase().includes(kw) ||
          v.author?.toLowerCase().includes(kw),
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
      "Giáo án mẫu",
      "Bài giảng tương tác",
      "Trí tuệ nhân tạo (AI) trong giáo dục",
      "Ma trận đề thi",
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
  }, [searchKeyword, allData]);

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

  const handleSearchSubmit = (keywordStr = searchKeyword) => {
    if (!keywordStr.trim()) return;
    setShowSuggestions(false);
    navigate(`/${role}/search?query=${encodeURIComponent(keywordStr)}`);
  };

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
      navigate(`/${role}/videos/${item.id}`);
    }
  };

  const handleOnboardingComplete = (updatedUser) => {
    setUser(updatedUser);
    setShowTeacherModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* CSS CHO DROPDOWN TÌM KIẾM */}
      <style>{`
        .search-wrapper-relative {
          position: relative; width: 100%; z-index: 50;
        }
        .pill-search-bar {
          position: relative; width: 100%; background: #ffffff;
          border: 2px solid #fdba74; border-radius: 50px; display: flex; align-items: center;
          padding: 6px 10px 6px 20px; box-shadow: 0 4px 15px rgba(234, 88, 12, 0.1); transition: all 0.25s ease;
        }
        .pill-search-bar.has-dropdown {
          border-bottom-left-radius: 16px;
          border-bottom-right-radius: 16px;
        }
        .pill-search-bar:focus-within { border-color: #ea580c; box-shadow: 0 8px 25px rgba(234, 88, 12, 0.2); transform: scale(1.01); }
        .pill-search-bar input { flex: 1; border: none; outline: none; font-size: 14px; font-weight: 600; color: #0f172a; background: transparent; }
        
        .search-suggestions-dropdown {
          position: absolute; top: calc(100% + 4px); left: 0; width: 100%;
          background: #ffffff; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          overflow: hidden; border: 1px solid #fed7aa; display: flex; flex-direction: column;
          animation: slideDown 0.2s ease-out forwards;
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        
        .suggestion-item {
          padding: 12px 20px; display: flex; align-items: center; gap: 12px;
          font-size: 14px; color: #334155; font-weight: 500; cursor: pointer;
          border-bottom: 1px solid #fff7ed; transition: background 0.2s;
        }
        .suggestion-item:last-child { border-bottom: none; }
        .suggestion-item:hover { background: #fff7ed; color: #ea580c; }
        .suggestion-item.global-item { color: #ea580c; font-weight: 700; background: #fff7ed; }
        .suggestion-item.global-item:hover { background: #ffedd5; }
        
        .search-btn {
          background: #ea580c; color: #ffffff; border: none; padding: 8px 18px; border-radius: 40px;
          font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
          cursor: pointer; transition: background 0.2s; display: flex; align-items: center; gap: 6px;
        }
        .search-btn:hover { background: #c2410c; }
      `}</style>

      {/* ================= MODAL ONBOARDING DÀNH CHO GIẢNG VIÊN ================= */}
      <WelcomeTeacherModal
        isOpen={showTeacherModal}
        user={user}
        onComplete={handleOnboardingComplete}
      />

      {/* ================= KHUNG TÌM KIẾM TRUNG TÂM DÀNH CHO GIẢNG VIÊN ================= */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Thư viện Khóa học & Học liệu số
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tìm kiếm giáo án, tài liệu tham khảo, video hướng dẫn nghiệp vụ sư
            phạm
          </p>
        </div>

        <div
          className="max-w-3xl mx-auto search-wrapper-relative"
          ref={searchContainerRef}
        >
          <div
            className={`pill-search-bar ${showSuggestions && suggestions.length > 0 ? "has-dropdown" : ""}`}
          >
            <Search className="w-5 h-5 text-orange-400 mr-3 shrink-0" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearchSubmit();
              }}
              placeholder="Nhập tên bài giảng, khóa học, chủ đề..."
            />
            <button className="search-btn" onClick={() => handleSearchSubmit()}>
              <span>Tìm kiếm</span>
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
                    <Globe className="w-4 h-4 shrink-0 text-orange-600" />
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

        <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-medium text-slate-500">
          <span>Gợi ý:</span>
          {["Giáo án STEM", "Phương pháp giảng dạy", "Tâm lý học đường"].map(
            (tag) => (
              <button
                key={tag}
                onClick={() => handleSearchSubmit(tag)}
                className="px-3 py-1 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-full transition cursor-pointer border border-orange-100"
              >
                {tag}
              </button>
            ),
          )}
        </div>
      </div>

      {/* ================= THANH TẠO LỚP HỌC & GIẢNG DẠY TRỰC TUYẾN ================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">
              Phòng giảng dạy & Workshop trực tuyến
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Khởi tạo buổi học Meet/Zoom trực tiếp hoặc mở phòng tư vấn 1:1.
            </p>
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

      {/* ================= HÀNG 1: BANNER TỔNG QUAN GIẢNG DẠY ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Banner Trợ lý Giảng dạy AI */}
        <div className="lg:col-span-2 relative rounded-3xl p-6 border border-orange-200 shadow-md overflow-hidden flex flex-col justify-between bg-gradient-to-br from-[#ea580c] via-[#f97316] to-[#f59e0b] text-white">
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10 pointer-events-none z-0" />
          <TeacherParticleCanvas />

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
            <p className="text-[11px] text-slate-500 font-medium">
              Đang theo học trong 4 lớp của bạn.
            </p>
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
              <span className="text-xs font-bold text-slate-400">
                / 5.0 (128 nhận xét)
              </span>
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
            <h3 className="font-bold text-base text-slate-800">
              Các Lớp học & Khóa học đang phụ trách
            </h3>
            <a
              href="#all-courses"
              className="text-xs font-bold text-orange-600 hover:underline"
            >
              Quản lý tất cả
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lớp 1 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="bg-orange-100 text-orange-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Khối 12 - Chuyên sâu
                </span>
                <span className="text-xs font-bold text-slate-400">
                  86 Học viên
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  Luyện thi Toán THPT Quốc Gia 2026
                </h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Tiến độ bài giảng: Module 8/12
                </p>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  onClick={() => navigate(`/${role}/courses/1`)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Xem giáo án
                </button>
                <button className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" /> Quản lý
                </button>
              </div>
            </div>

            {/* Lớp 2 */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="bg-blue-100 text-blue-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Lập trình Web
                </span>
                <span className="text-xs font-bold text-slate-400">
                  120 Học viên
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  Fullstack ReactJS & Node.js 4.0
                </h4>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Tiến độ bài giảng: Module 3/10
                </p>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  onClick={() => navigate(`/${role}/courses/2`)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Xem giáo án
                </button>
                <button className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" /> Quản lý
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
              <p className="text-[10px] text-slate-500">
                Phòng Google Meet • 42 Học viên đăng ký
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <div className="flex justify-between text-[11px] font-extrabold text-slate-500">
                <span>21:15 - 22:15</span>
                <span>TƯ VẤN 1:1</span>
              </div>
              <h5 className="font-bold text-xs text-slate-800">
                Giải đáp thắc mắc Đồ án Cuối khóa
              </h5>
              <p className="text-[10px] text-slate-500">
                Phòng Zoom • Học viên Nguyễn Văn B
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
