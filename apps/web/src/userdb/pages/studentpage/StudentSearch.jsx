/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  BookMarked,
  FileText,
  Loader2,
  Download,
  Video,
  Play,
  Globe,
  UserCircle2,
  GraduationCap,
  Filter,
  ChevronDown,
  X,
  Layers,
  Clock,
  Eye,
  ShieldCheck,
} from "lucide-react";

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("query") || "";
  const role = localStorage.getItem("role")?.toLowerCase() || "student";

  const [localSearchInput, setLocalSearchInput] = useState(keyword);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchContainerRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [allData, setAllData] = useState({
    courses: [],
    documents: [],
    videos: [],
  });
  const [activeTab, setActiveTab] = useState("all");

  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);
  const filterBarRef = useRef(null);

  const [filters, setFilters] = useState({
    categories: [],
    length: "",
    date: "",
  });

  const baseUrl =
    import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1";

  const formatTeacherName = (name) => {
    if (!name || !name.trim()) return "GV. EduTech";
    const trimmed = name.trim();
    if (/^(gv\.|gv\s|giảng viên\s)/i.test(trimmed)) {
      return trimmed.replace(/^(gv\.|gv\s|giảng viên\s+)/i, "GV. ");
    }
    return `GV. ${trimmed}`;
  };

  // --- 1. CLICK OUTSIDE ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      )
        setShowSuggestions(false);
      if (filterBarRef.current && !filterBarRef.current.contains(event.target))
        setOpenFilterDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 2. LẤY DỮ LIỆU THẬT ---
  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        const [courseRes, docRes, videoRes] = await Promise.all([
          fetch(`${baseUrl}/courses`).catch(() => ({ json: () => [] })),
          fetch(`${baseUrl}/shared-documents?all=true`).catch(() => ({
            json: () => [],
          })),
          fetch(`${baseUrl}/videos?all=true`).catch(() => ({ json: () => [] })),
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

        // Chỉ hiển thị video đã duyệt với học viên
        const approvedVideos =
          role === "teacher" || role === "instructor" || role === "admin"
            ? rawVideos
            : rawVideos.filter((v) => v.is_approved !== false);

        const formattedVideos = approvedVideos.map((v) => {
          const teacherName = formatTeacherName(v.teacher_name || v.author);
          return {
            id: v.id,
            title: v.title || v.video_title || "Video bài giảng",
            author: teacherName,
            duration: v.duration || "Tự do",
            views: v.views || 0,
            subject: v.subject || "Chuyên đề",
            thumbnail:
              v.thumbnail_url ||
              v.thumbnail ||
              "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80",
            created_at: v.created_at,
          };
        });

        setAllData({
          courses: rawCourses,
          documents: rawDocs,
          videos: formattedVideos,
        });
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSearchResults();
    setLocalSearchInput(keyword);
  }, [baseUrl, keyword, role]);

  // --- 3. AUTOCOMPLETE KHI GÕ ---
  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocalSearchInput(val);
    if (!val.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const kw = val.toLowerCase();
    const matchedCourses = allData.courses
      .filter((c) => c.title?.toLowerCase().includes(kw))
      .map((c) => ({ ...c, itemType: "course" }));
    const matchedDocs = allData.documents
      .filter((d) => d.title?.toLowerCase().includes(kw))
      .map((d) => ({ ...d, itemType: "document" }));
    const matchedVideos = allData.videos
      .filter((v) => v.title?.toLowerCase().includes(kw))
      .map((v) => ({ ...v, itemType: "video" }));

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

  const executeSearch = (searchVal) => {
    if (searchVal.trim() !== "") {
      setShowSuggestions(false);
      navigate(`/${role}/search?query=${encodeURIComponent(searchVal)}`);
    }
  };

  const handleSuggestionClick = (item) => {
    setShowSuggestions(false);
    setLocalSearchInput(item.value || item.title);

    if (item.itemType === "global")
      navigate(`/${role}/search?query=${encodeURIComponent(item.value)}`);
    else if (item.itemType === "course")
      navigate(`/${role}/courses/${item.id || item.id_course}`);
    else if (item.itemType === "document")
      navigate(`/${role}/documents/${item.id}`);
    else if (item.itemType === "video") navigate(`/${role}/videos`);
  };

  // --- 4. TÍNH TOÁN BỘ LỌC ---
  const filteredResults = useMemo(() => {
    const kw = keyword.toLowerCase();
    let { courses, documents, videos } = allData;

    if (kw) {
      courses = courses.filter(
        (c) =>
          c.title?.toLowerCase().includes(kw) ||
          c.teacher_name?.toLowerCase().includes(kw) ||
          c.subject?.toLowerCase().includes(kw),
      );
      documents = documents.filter(
        (d) =>
          d.title?.toLowerCase().includes(kw) ||
          d.student_name?.toLowerCase().includes(kw) ||
          d.faculty?.toLowerCase().includes(kw),
      );
      videos = videos.filter(
        (v) =>
          v.title?.toLowerCase().includes(kw) ||
          v.author?.toLowerCase().includes(kw) ||
          v.subject?.toLowerCase().includes(kw),
      );
    }

    if (filters.categories.length > 0) {
      courses = courses.filter((c) =>
        filters.categories.some((cat) =>
          String(c.subject || "").toLowerCase().includes(cat.toLowerCase()),
        ),
      );
      documents = documents.filter((d) =>
        filters.categories.some((cat) =>
          String(d.faculty || d.category || "")
            .toLowerCase()
            .includes(cat.toLowerCase()),
        ),
      );
      videos = videos.filter((v) =>
        filters.categories.some((cat) =>
          String(v.subject || "").toLowerCase().includes(cat.toLowerCase()),
        ),
      );
    }

    if (filters.length) {
      documents = documents.filter((d) => {
        const pages = parseInt(d.pages) || 0;
        if (filters.length === "short") return pages <= 15;
        if (filters.length === "medium") return pages > 15 && pages <= 60;
        if (filters.length === "long") return pages > 60;
        return true;
      });

      videos = videos.filter((v) => {
        const timeParts = String(v.duration || "0:0")
          .split(":")
          .map(Number);
        let mins = 0;
        if (timeParts.length === 3) mins = timeParts[0] * 60 + timeParts[1];
        else if (timeParts.length === 2) mins = timeParts[0];

        if (filters.length === "short") return mins <= 10;
        if (filters.length === "medium") return mins > 10 && mins <= 45;
        if (filters.length === "long") return mins > 45;
        return true;
      });
    }

    if (filters.date) {
      const now = new Date();
      const isWithinDateRange = (item) => {
        if (!item.created_at) return true;
        const itemDate = new Date(item.created_at);
        if (isNaN(itemDate)) return true;

        const diffTime = Math.abs(now - itemDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (filters.date === "week") return diffDays <= 7;
        if (filters.date === "month") return diffDays <= 30;
        if (filters.date === "year") return diffDays <= 365;
        return true;
      };

      courses = courses.filter(isWithinDateRange);
      documents = documents.filter(isWithinDateRange);
      videos = videos.filter(isWithinDateRange);
    }

    return { courses, documents, videos };
  }, [allData, keyword, filters]);

  const availableCategories = useMemo(() => {
    const cats = new Set();
    allData.courses.forEach((c) => {
      if (c.subject && c.subject.trim() !== "") cats.add(c.subject.trim());
    });
    allData.documents.forEach((d) => {
      if (d.faculty && d.faculty.trim() !== "") cats.add(d.faculty.trim());
      else if (d.category && d.category.trim() !== "")
        cats.add(d.category.trim());
    });
    allData.videos.forEach((v) => {
      if (v.subject && v.subject.trim() !== "") cats.add(v.subject.trim());
    });
    return Array.from(cats).filter(Boolean).sort();
  }, [allData]);

  const handleCategoryToggle = (cat) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const clearAllFilters = () => {
    setFilters({ categories: [], length: "", date: "" });
    setActiveTab("all");
    setOpenFilterDropdown(null);
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.length !== "" ||
    filters.date !== "" ||
    activeTab !== "all";

  const totalResults =
    filteredResults.courses.length +
    filteredResults.documents.length +
    filteredResults.videos.length;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      {/* HEADER TÌM KIẾM */}
      <div className="bg-white border-b border-slate-200/80 pt-10 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight"></h1>
          <p className="text-sm text-slate-500 mb-8">
            Tìm kiếm hàng ngàn khóa học, tài liệu PDF và video bài giảng
          </p>

          <div
            ref={searchContainerRef}
            className="max-w-2xl mx-auto relative z-40"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSearch(localSearchInput);
              }}
              className="relative flex items-center group"
            >
              <SearchIcon className="w-6 h-6 absolute left-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                value={localSearchInput}
                onChange={handleInputChange}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                className="w-full pl-14 pr-32 py-4 bg-white border border-slate-300 rounded-full text-base font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all"
                placeholder="Nhập từ khóa tìm kiếm..."
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 bg-slate-900 hover:bg-blue-600 text-white font-bold text-sm rounded-full transition-colors cursor-pointer shadow-md shadow-blue-600/20"
              >
                Tìm kiếm
              </button>
            </form>

            {/* DROPDOWN GỢI Ý */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-200">
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSuggestionClick(item)}
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors group"
                  >
                    <div
                      className={`p-2.5 rounded-xl transition-colors ${
                        item.itemType === "course"
                          ? "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                          : item.itemType === "document"
                            ? "bg-orange-50 text-orange-500 group-hover:bg-orange-100"
                            : item.itemType === "video"
                              ? "bg-red-50 text-red-500 group-hover:bg-red-100"
                              : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      }`}
                    >
                      {item.itemType === "course" ? (
                        <GraduationCap className="w-5 h-5" />
                      ) : item.itemType === "document" ? (
                        <FileText className="w-5 h-5" />
                      ) : item.itemType === "video" ? (
                        <Video className="w-5 h-5" />
                      ) : (
                        <Globe className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p
                        className={`text-sm truncate ${item.itemType === "global" ? "font-black text-slate-900" : "font-bold text-slate-700 group-hover:text-blue-600 transition-colors"}`}
                      >
                        {item.title}
                      </p>
                      {!item.itemType.includes("global") && (
                        <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                          {item.itemType === "course"
                            ? `Khóa học • ${item.teacher_name || "GV EduTech"}`
                            : item.itemType === "document"
                              ? `Tài liệu PDF • ${item.student_name || "Thành viên"}`
                              : `Video bài giảng • ${item.author}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-6">
        {/* THANH LỌC NÂNG CAO */}
        <div
          ref={filterBarRef}
          className="flex flex-wrap items-center gap-2.5 mb-8 border-b border-slate-200/80 pb-4 relative z-30"
        >
          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-sm mr-1 hidden md:flex">
            <Filter className="w-4 h-4" /> BỘ LỌC:
          </div>

          {/* 1. LOẠI NỘI DUNG */}
          <div className="relative">
            <button
              onClick={() =>
                setOpenFilterDropdown(
                  openFilterDropdown === "type" ? null : "type",
                )
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all shadow-sm ${activeTab !== "all" || openFilterDropdown === "type" ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
            >
              <Layers className="w-4 h-4" />
              {activeTab === "all"
                ? "Tất cả loại hình"
                : activeTab === "courses"
                  ? "Khóa học"
                  : activeTab === "documents"
                    ? "Tài liệu PDF"
                    : "Video bài giảng"}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${openFilterDropdown === "type" ? "rotate-180" : ""}`}
              />
            </button>

            {openFilterDropdown === "type" && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-100 z-50">
                {[
                  {
                    id: "all",
                    label: "Tất cả loại hình",
                    icon: Globe,
                    count: totalResults,
                  },
                  {
                    id: "courses",
                    label: "Khóa học",
                    icon: GraduationCap,
                    count: filteredResults.courses.length,
                  },
                  {
                    id: "documents",
                    label: "Tài liệu PDF",
                    icon: FileText,
                    count: filteredResults.documents.length,
                  },
                  {
                    id: "videos",
                    label: "Video bài giảng",
                    icon: Video,
                    count: filteredResults.videos.length,
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setActiveTab(opt.id);
                      setOpenFilterDropdown(null);
                    }}
                    className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === opt.id ? "bg-slate-50 text-slate-900 font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <opt.icon
                        className={`w-4 h-4 ${activeTab === opt.id ? "text-slate-900" : "text-slate-400"}`}
                      />
                      {opt.label}
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
                      {opt.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          {/* 2. LỌC CHUYÊN NGÀNH */}
          <div className="relative">
            <button
              onClick={() =>
                setOpenFilterDropdown(
                  openFilterDropdown === "category" ? null : "category",
                )
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${openFilterDropdown === "category" || filters.categories.length > 0 ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
            >
              Chuyên ngành{" "}
              {filters.categories.length > 0 && `(${filters.categories.length})`}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${openFilterDropdown === "category" ? "rotate-180" : ""}`}
              />
            </button>

            {openFilterDropdown === "category" && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-100 z-50">
                <div className="max-h-60 overflow-y-auto px-2">
                  {availableCategories.length === 0 ? (
                    <p className="p-3 text-xs text-center text-slate-400">
                      Không có chuyên ngành nào
                    </p>
                  ) : (
                    availableCategories.map((cat) => (
                      <label
                        key={cat}
                        className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded-lg cursor-pointer group transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(cat)}
                          onChange={() => handleCategoryToggle(cat)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-800">
                          {cat}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <div className="border-t border-slate-100 p-2 mt-2 flex justify-between gap-2 bg-slate-50/50">
                  <button
                    onClick={() =>
                      setFilters((p) => ({ ...p, categories: [] }))
                    }
                    className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-md transition-colors"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={() => setOpenFilterDropdown(null)}
                    className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. LỌC ĐỘ DÀI */}
          {(activeTab === "all" ||
            activeTab === "documents" ||
            activeTab === "videos") && (
            <div className="relative">
              <button
                onClick={() =>
                  setOpenFilterDropdown(
                    openFilterDropdown === "length" ? null : "length",
                  )
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${openFilterDropdown === "length" || filters.length !== "" ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
              >
                Độ dài {filters.length && "(1)"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${openFilterDropdown === "length" ? "rotate-180" : ""}`}
                />
              </button>

              {openFilterDropdown === "length" && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-100 z-50">
                  <div className="px-2">
                    {[
                      {
                        val: "short",
                        label: "Ngắn",
                        desc:
                          activeTab === "videos"
                            ? "< 10 phút"
                            : activeTab === "documents"
                              ? "< 15 trang"
                              : "< 15 trang / 10 phút",
                      },
                      {
                        val: "medium",
                        label: "Trung bình",
                        desc:
                          activeTab === "videos"
                            ? "10 - 45 phút"
                            : activeTab === "documents"
                              ? "15 - 60 trang"
                              : "Cỡ vừa",
                      },
                      {
                        val: "long",
                        label: "Dài (Chuyên sâu)",
                        desc:
                          activeTab === "videos"
                            ? "> 45 phút"
                            : activeTab === "documents"
                              ? "> 60 trang"
                              : "> 60 trang / 45 phút",
                      },
                    ].map((opt) => (
                      <label
                        key={opt.val}
                        className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded-lg cursor-pointer group transition-colors"
                      >
                        <input
                          type="radio"
                          name="length_filter"
                          checked={filters.length === opt.val}
                          onChange={() =>
                            setFilters((p) => ({ ...p, length: opt.val }))
                          }
                          className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 group-hover:text-blue-800 leading-tight">
                            {opt.label}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                            {opt.desc}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 p-2 mt-2 flex justify-between gap-2 bg-slate-50/50">
                    <button
                      onClick={() => setFilters((p) => ({ ...p, length: "" }))}
                      className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-md transition-colors"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={() => setOpenFilterDropdown(null)}
                      className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. LỌC NGÀY ĐĂNG TẢI */}
          <div className="relative">
            <button
              onClick={() =>
                setOpenFilterDropdown(
                  openFilterDropdown === "date" ? null : "date",
                )
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${openFilterDropdown === "date" || filters.date !== "" ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
            >
              Ngày đăng tải {filters.date && "(1)"}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${openFilterDropdown === "date" ? "rotate-180" : ""}`}
              />
            </button>

            {openFilterDropdown === "date" && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-100 z-50">
                <div className="px-2">
                  {[
                    { val: "week", label: "Tuần này" },
                    { val: "month", label: "Tháng này" },
                    { val: "year", label: "Năm nay" },
                  ].map((opt) => (
                    <label
                      key={opt.val}
                      className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded-lg cursor-pointer group transition-colors"
                    >
                      <input
                        type="radio"
                        name="date_filter"
                        checked={filters.date === opt.val}
                        onChange={() =>
                          setFilters((p) => ({ ...p, date: opt.val }))
                        }
                        className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-blue-800">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="border-t border-slate-100 p-2 mt-2 flex justify-between gap-2 bg-slate-50/50">
                  <button
                    onClick={() => setFilters((p) => ({ ...p, date: "" }))}
                    className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-md transition-colors"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={() => setOpenFilterDropdown(null)}
                    className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* NÚT XÓA TẤT CẢ BỘ LỌC */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="ml-auto flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" /> Xóa bộ lọc
            </button>
          )}
        </div>

        {/* HIỂN THỊ KẾT QUẢ */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-sm font-bold text-slate-500">
              Đang đồng bộ cơ sở dữ liệu...
            </p>
          </div>
        ) : totalResults === 0 ? (
          <div className="py-24 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              Không tìm thấy kết quả
            </h3>
            <p className="text-slate-500">
              Rất tiếc, không có tài liệu nào khớp với bộ lọc hiện tại.
              <br />
              Vui lòng thử xóa bớt bộ lọc hoặc dùng từ khóa khác.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {/* 1. LƯỚI KHÓA HỌC */}
            {(activeTab === "all" || activeTab === "courses") &&
              filteredResults.courses.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Khóa học chuyên sâu
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-black">
                      {filteredResults.courses.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredResults.courses.map((course) => (
                      <div
                        key={course.id || course.id_course}
                        onClick={() =>
                          navigate(
                            `/${role}/courses/${course.id || course.id_course}`,
                          )
                        }
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer group hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col"
                      >
                        <div className="relative aspect-video bg-slate-100 overflow-hidden border-b border-slate-100">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-50">
                              <GraduationCap className="w-10 h-10" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 px-2 py-1 bg-white/95 backdrop-blur-sm rounded text-[10px] font-black text-slate-700 shadow-sm border border-slate-200/50">
                            {course.grade || "Cơ bản"}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h4 className="font-bold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                            {course.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-auto text-xs text-slate-500 font-medium">
                            <UserCircle2 className="w-4 h-4" />
                            <span className="truncate">
                              {course.teacher_name || "Giảng viên EduTech"}
                            </span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider truncate max-w-[120px]">
                              {course.subject || "Chuyên ngành"}
                            </span>
                            <span className="text-xs font-black text-blue-600 group-hover:underline">
                              Chi tiết
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {/* 2. LƯỚI TÀI LIỆU PDF */}
            {(activeTab === "all" || activeTab === "documents") &&
              filteredResults.documents.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Tài liệu học thuật
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-700 text-xs font-black">
                      {filteredResults.documents.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {filteredResults.documents.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => navigate(`/${role}/documents/${doc.id}`)}
                        className="bg-white border border-slate-200 px-5 py-4 rounded-2xl flex items-center gap-5 cursor-pointer group hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100/50 hover:-translate-y-0.5 transition-all duration-300"
                      >
                        <div className="w-14 h-16 bg-gradient-to-br from-red-50 to-orange-50 text-red-500 rounded-xl flex flex-col items-center justify-center shrink-0 border border-red-100 group-hover:scale-105 transition-transform shadow-sm">
                          <FileText className="w-6 h-6 mb-1 opacity-80" />
                          <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                            PDF
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-orange-600 transition-colors mb-1.5">
                            {doc.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                            <span className="truncate max-w-[150px] font-bold text-slate-600">
                              {doc.student_name || "Thành viên"}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full shrink-0"></span>
                            <span>{doc.pages || 15} trang</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full shrink-0"></span>
                            <span>
                              {doc.faculty || doc.category || "Học liệu"}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full shrink-0 hidden sm:block"></span>
                            <span className="hidden sm:block text-slate-400">
                              {doc.date || "Đã đăng gần đây"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center group-hover:bg-orange-600 group-hover:border-orange-600 group-hover:text-white transition-all shadow-sm">
                            <Download className="w-4 h-4" />
                          </button>
                          <span className="text-[10px] font-bold text-slate-400">
                            {doc.downloads || 0} lượt tải
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {/* 3. LƯỚI VIDEO BÀI GIẢNG DỌC (SHORTS/REELS 9:16) */}
            {(activeTab === "all" || activeTab === "videos") &&
              filteredResults.videos.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Video bài giảng ngắn
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-700 text-xs font-black">
                      {filteredResults.videos.length}
                    </span>
                  </div>

                  {/* Grid 5 cột chuẩn kích thước video dọc 9:16 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredResults.videos.map((vid) => {
                      const initialLetter = vid.author
                        ?.replace(/^GV\.\s*/, "")
                        .charAt(0) || "G";

                      return (
                        <div
                          key={vid.id}
                          onClick={() => navigate(`/${role}/videos`)}
                          className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:border-orange-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        >
                          {/* Khung video tỉ lệ dọc 9:16 */}
                          <div className="relative aspect-[9/16] w-full bg-slate-950 overflow-hidden">
                            <img
                              src={vid.thumbnail}
                              alt={vid.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                  "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&q=80";
                              }}
                            />

                            {/* Lớp phủ gradient & Nút phát video */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex items-center justify-center p-2.5">
                              <div className="w-11 h-11 bg-white/95 rounded-full flex items-center justify-center shadow-xl scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                                <Play className="w-4 h-4 fill-orange-600 text-orange-600 ml-0.5" />
                              </div>

                              {/* Môn học góc trên bên trái */}
                              <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md text-orange-400 text-[9px] font-black uppercase tracking-wider rounded">
                                {vid.subject}
                              </span>

                              {/* Thời lượng góc dưới bên phải */}
                              <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 text-slate-400" />
                                {vid.duration}
                              </span>
                            </div>
                          </div>

                          {/* Thông tin video & Avatar giảng viên */}
                          <div className="p-3 flex flex-col flex-1 justify-between gap-2.5">
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
                              {vid.title}
                            </h4>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black text-[9px] flex items-center justify-center shrink-0 shadow-2xs">
                                  {initialLetter}
                                </div>
                                <span className="text-[11px] font-bold text-slate-700 truncate">
                                  {vid.author}
                                </span>
                              </div>

                              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-0.5 shrink-0">
                                <Eye className="w-3 h-3 text-slate-400" />
                                {vid.views}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
          </div>
        )}
      </div>
    </div>
  );
}