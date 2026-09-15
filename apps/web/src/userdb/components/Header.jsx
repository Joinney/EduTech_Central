/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Bot,
  GraduationCap,
  Star,
  Settings,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Receipt,
  Crown,
  Sparkles,
  BookMarked,
  FileText,
  Video,
  Globe,
} from "lucide-react";

import api from "../../api/axios.js";

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // States cho Profile Dropdown
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // States cho Search Dropdown
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // Lưu trữ toàn bộ data thật từ Backend
  const [allData, setAllData] = useState({
    courses: [],
    documents: [],
    videos: [],
  });
  const searchContainerRef = useRef(null);

  const baseUrl =
    import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1";

  const role = (
    user?.role ||
    localStorage.getItem("role") ||
    "student"
  ).toLowerCase();
  const isTeacher = role === "teacher" || role === "instructor";

  const dashboardPath = isTeacher ? "/teacher/dashboard" : "/student/dashboard";
  const profilePath = isTeacher ? "/teacher/profile" : "/student/profile";
  const upgradePath = isTeacher ? "/teacher/upgrade" : "/student/upgrade";

  // --- 1. TẢI DỮ LIỆU NGƯỜI DÙNG & CLICK OUTSIDE ---
  useEffect(() => {
    const loadUserData = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Lỗi đọc dữ liệu người dùng tại Header:", e);
        }
      } else {
        setUser(null);
      }
    };

    loadUserData();
    window.addEventListener("storage", loadUserData);
    window.addEventListener("user-profile-updated", loadUserData);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setShowDropdown(false);
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      )
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("storage", loadUserData);
      window.removeEventListener("user-profile-updated", loadUserData);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- 2. TẢI DỮ LIỆU TÌM KIẾM NGẦM TỪ 3 API (CHỈ CHẠY 1 LẦN) ---
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

  // --- 3. XỬ LÝ GÕ TÌM KIẾM (AUTOCOMPLETE) ---
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);

    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const kw = val.toLowerCase();

    // Quét tìm trong cả 3 mảng dữ liệu thật
    const matchedCourses = allData.courses
      .filter(
        (c) =>
          c.title?.toLowerCase().includes(kw) ||
          c.subject?.toLowerCase().includes(kw),
      )
      .map((c) => ({ ...c, itemType: "course" }));
    const matchedDocs = allData.documents
      .filter(
        (d) =>
          d.title?.toLowerCase().includes(kw) ||
          d.faculty?.toLowerCase().includes(kw),
      )
      .map((d) => ({ ...d, itemType: "document" }));
    const matchedVideos = allData.videos
      .filter(
        (v) =>
          v.title?.toLowerCase().includes(kw) ||
          v.author?.toLowerCase().includes(kw),
      )
      .map((v) => ({ ...v, itemType: "video" }));

    // Gộp và lấy tối đa 7 gợi ý
    setSuggestions(
      [
        {
          itemType: "global",
          title: `Tìm toàn hệ thống cho "${val}"`,
          value: val,
        },
        ...matchedCourses,
        ...matchedDocs,
        ...matchedVideos,
      ].slice(0, 7),
    );
    setShowSuggestions(true);
  };

  // --- 4. ĐIỀU HƯỚNG TÌM KIẾM ---
  const executeSearch = (searchVal) => {
    if (searchVal.trim() !== "") {
      setShowSuggestions(false);
      navigate(`/${role}/search?query=${encodeURIComponent(searchVal)}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(searchInput);
  };

  const handleSuggestionClick = (item) => {
    setShowSuggestions(false);
    setSearchInput(item.value || item.title);

    if (item.itemType === "global")
      navigate(`/${role}/search?query=${encodeURIComponent(item.value)}`);
    else if (item.itemType === "course")
      navigate(`/${role}/courses/${item.id || item.id_course}`);
    else if (item.itemType === "document")
      navigate(`/${role}/documents/${item.id}`);
    else if (item.itemType === "video") navigate(`/${role}/videos/${item.id}`); // Trỏ về trang video thật
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Lỗi gọi API đăng xuất:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      window.dispatchEvent(new Event("user-profile-updated"));
      setShowDropdown(false);
      navigate("/login");
    }
  };

  const fullName =
    user?.fullName ||
    user?.full_name ||
    user?.name ||
    (isTeacher ? "Giảng viên" : "Học viên");
  const email = user?.email || "";
  const avatarUrl = user?.avatar || "";

  const getInitials = (name) => {
    if (!name) return isTeacher ? "GV" : "EC";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return parts
      .map((p) => p[0])
      .join("")
      .substring(0, 3)
      .toUpperCase();
  };

  const theme = {
    primary: isTeacher ? "orange" : "blue",
    bgLight: isTeacher ? "bg-orange-50" : "bg-blue-50",
    textPrimary: isTeacher ? "text-orange-600" : "text-blue-600",
    hoverBg: isTeacher ? "hover:bg-orange-100" : "hover:bg-blue-100",
    gradient: isTeacher
      ? "from-orange-500 to-amber-500"
      : "from-blue-600 to-cyan-500",
  };

  return (
    // THAY ĐỔI z-40 THÀNH z-[100] ĐỂ HEADER LUÔN NẰM TRÊN CÙNG
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-[100] shrink-0">
      <Link
        to={dashboardPath}
        className="flex items-center space-x-2.5 shrink-0 group py-1"
      >
        <img
          src="/edutechcentral.png"
          alt="EduTech Central Logo"
          className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
        />
      </Link>

      {/* ================= KHUNG TÌM KIẾM GLOBAL ================= */}
      <div className="flex-1 max-w-xl mx-6 hidden md:block">
        <div className="relative" ref={searchContainerRef}>
          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors z-10" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Tìm bài giảng, PDF, khóa học, video..."
              className={`w-full pl-11 pr-4 py-2 bg-slate-100/80 border text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all ${showSuggestions && suggestions.length > 0 ? "rounded-t-2xl border-blue-500 bg-white" : "rounded-full border-transparent"}`}
            />
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border-x border-b border-blue-500 rounded-b-2xl shadow-xl overflow-hidden z-[110] animate-in fade-in duration-200">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSuggestionClick(item)}
                  className="flex items-center gap-3 p-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors group"
                >
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      item.itemType === "course"
                        ? "bg-blue-50 text-blue-600"
                        : item.itemType === "document"
                          ? "bg-orange-50 text-orange-500"
                          : item.itemType === "video"
                            ? "bg-red-50 text-red-500"
                            : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.itemType === "course" ? (
                      <GraduationCap className="w-4 h-4" />
                    ) : item.itemType === "document" ? (
                      <FileText className="w-4 h-4" />
                    ) : item.itemType === "video" ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <Globe className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p
                      className={`text-xs truncate ${item.itemType === "global" ? "font-black text-slate-900" : "font-bold text-slate-700 group-hover:text-blue-600"}`}
                    >
                      {item.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("open-ai-chat"));
            const aiWidgetBtn = document.getElementById(
              "edutech-ai-widget-btn",
            );
            if (aiWidgetBtn) aiWidgetBtn.click();
          }}
          className={`flex items-center space-x-1.5 px-3 py-1.5 ${theme.bgLight} ${theme.hoverBg} ${theme.textPrimary} rounded-full text-xs font-bold transition cursor-pointer`}
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">Trợ lý AI</span>
        </button>

        <button
          type="button"
          onClick={() => navigate(upgradePath)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full text-xs font-black shadow-xs shadow-orange-500/25 transition cursor-pointer"
        >
          <Crown className="w-3.5 h-3.5 fill-white" />
          <span className="hidden sm:inline">Nâng cấp Edu</span>
        </button>

        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
          <GraduationCap className="w-4 h-4 text-slate-600" />
          <span>{isTeacher ? "Giảng viên" : "Lớp 12A1"}</span>
        </div>

        {!isTeacher && (
          <div className="hidden lg:flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-50 border border-amber-200/80 text-amber-600 rounded-full text-xs font-extrabold">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>1,250 Points</span>
          </div>
        )}

        <div className="h-5 w-[1px] bg-slate-200 my-auto mx-1" />

        {/* ================= PROFILE DROPDOWN ================= */}
        <div className="relative pl-1" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="focus:outline-none cursor-pointer flex items-center"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm hover:ring-2 hover:ring-blue-500 transition"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.gradient} text-white font-black text-[10px] flex items-center justify-center border border-slate-200 shadow-sm hover:ring-2 hover:ring-blue-500 transition`}
              >
                {getInitials(fullName)}
              </div>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-extrabold text-slate-900 truncate">
                  {fullName}
                </p>
                {email && (
                  <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">
                    {email}
                  </p>
                )}
                <span
                  className={`inline-block mt-1 text-[10px] ${isTeacher ? "bg-orange-50 text-orange-600" : "bg-blue-50 text-blue-600"} font-bold px-2 py-0.5 rounded-md`}
                >
                  {isTeacher ? "Tài khoản Giảng viên" : "Tài khoản Học viên"}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate(dashboardPath);
                  }}
                  className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  <span>Bảng điều khiển</span>
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate(profilePath);
                  }}
                  className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Trang cá nhân</span>
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate(upgradePath);
                  }}
                  className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-orange-600 hover:bg-orange-50 transition cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-orange-500 fill-orange-400" />
                  <span>Nâng cấp tài khoản Edu Pro</span>
                </button>
                {!isTeacher && (
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/student/transactions");
                    }}
                    className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-blue-500" />
                    <span>Lịch sử thanh toán (VNPay)</span>
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 border-t border-slate-100 mt-1 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
