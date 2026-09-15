import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  BookMarked,
  FileText,
  Loader2,
  AlertCircle,
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
  FileCheck,
} from "lucide-react";

export default function TeacherSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("query") || "";
  const role = localStorage.getItem("role")?.toLowerCase() || "teacher";

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

        const formattedVideos = rawVideos.map((v) => ({
          id: v.id,
          title: v.title || v.video_title || "Video bài giảng",
          author: v.teacher_name || v.author || "Giảng viên",
          duration: v.duration || "10:00",
          views: v.views || 0,
          thumbnail:
            v.thumbnail ||
            "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=500&auto=format&fit=crop&q=60",
          created_at: v.created_at,
        }));

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
  }, [baseUrl, keyword]);

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
    else if (item.itemType === "video") navigate(`/${role}/videos/${item.id}`);
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
          v.author?.toLowerCase().includes(kw),
      );
    }

    if (filters.categories.length > 0) {
      courses = courses.filter((c) =>
        filters.categories.some((cat) =>
          String(c.subject || "")
            .toLowerCase()
            .includes(cat.toLowerCase()),
        ),
      );
      documents = documents.filter((d) =>
        filters.categories.some((cat) =>
          String(d.faculty || d.category || "")
            .toLowerCase()
            .includes(cat.toLowerCase()),
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
    <div className="min-h-screen bg-orange-50/30 pb-20 font-sans">
      {/* ================= HEADER TÌM KIẾM (MÀU CAM TỐI GIẢN) ================= */}
      <div className="bg-white border-b border-orange-100 pt-10 pb-8 px-4 relative overflow-hidden">
        {/* Background Họa tiết sư phạm */}
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <GraduationCap className="w-64 h-64 text-orange-900 rotate-12" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-2 tracking-tight">
            Kho{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              Học liệu & Giáo án
            </span>
          </h1>
          <p className="text-sm text-slate-500 mb-8">
            Tìm kiếm giáo trình, tài liệu tham khảo và video nghiệp vụ sư phạm
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
              <SearchIcon className="w-6 h-6 absolute left-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                value={localSearchInput}
                onChange={handleInputChange}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                className="w-full pl-14 pr-32 py-4 bg-white border-2 border-slate-200 rounded-full text-base font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 hover:border-orange-300 shadow-sm transition-all"
                placeholder="Nhập tên giáo án, khóa học, chủ đề..."
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90 text-white font-bold text-sm rounded-full transition-all cursor-pointer shadow-md shadow-orange-500/20"
              >
                Tìm kiếm
              </button>
            </form>

            {/* DROPDOWN GỢI Ý TÌM KIẾM */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-orange-100 rounded-2xl shadow-[0_20px_60px_-15px_rgba(234,88,12,0.15)] overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-200">
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSuggestionClick(item)}
                    className="flex items-center gap-4 p-4 hover:bg-orange-50 cursor-pointer border-b border-orange-50/50 last:border-0 transition-colors group"
                  >
                    <div
                      className={`p-2.5 rounded-xl transition-colors ${
                        item.itemType === "course"
                          ? "bg-orange-100 text-orange-600"
                          : item.itemType === "document"
                            ? "bg-amber-100 text-amber-600"
                            : item.itemType === "video"
                              ? "bg-red-100 text-red-600"
                              : "bg-slate-100 text-slate-600"
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
                        className={`text-sm truncate ${item.itemType === "global" ? "font-black text-orange-600" : "font-bold text-slate-700 group-hover:text-orange-600 transition-colors"}`}
                      >
                        {item.title}
                      </p>
                      {!item.itemType.includes("global") && (
                        <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                          {item.itemType === "course"
                            ? `Khóa học • ${item.teacher_name || "Trường đào tạo"}`
                            : item.itemType === "document"
                              ? `Giáo án/Tài liệu • ${item.student_name || "Hệ thống"}`
                              : `Video nghiệp vụ • ${item.author}`}
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
        {/* ================= THANH LỌC NÂNG CAO ================= */}
        <div
          ref={filterBarRef}
          className="flex flex-wrap items-center gap-2.5 mb-8 border-b border-orange-100 pb-4 relative z-30"
        >
          <div className="flex items-center gap-1.5 text-orange-500 font-bold text-sm mr-1 hidden md:flex">
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
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all shadow-sm ${activeTab !== "all" || openFilterDropdown === "type" ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-orange-200 text-slate-700 hover:bg-orange-50"}`}
            >
              <Layers className="w-4 h-4" />
              {activeTab === "all"
                ? "Tất cả học liệu"
                : activeTab === "courses"
                  ? "Khóa học"
                  : activeTab === "documents"
                    ? "Giáo án & PDF"
                    : "Video"}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${openFilterDropdown === "type" ? "rotate-180" : ""}`}
              />
            </button>

            {openFilterDropdown === "type" && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-orange-100 rounded-xl shadow-xl overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-100 z-50">
                {[
                  {
                    id: "all",
                    label: "Tất cả học liệu",
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
                    label: "Giáo án & PDF",
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
                    className={`w-full text-left flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === opt.id ? "bg-orange-50 text-orange-700 font-bold" : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <opt.icon
                        className={`w-4 h-4 ${activeTab === opt.id ? "text-orange-600" : "text-slate-400"}`}
                      />
                      {opt.label}
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 bg-white border border-orange-100 rounded text-orange-600">
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
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${openFilterDropdown === "category" || filters.categories.length > 0 ? "bg-orange-50 border-orange-300 text-orange-600" : "bg-white border-slate-200 text-slate-700 hover:bg-orange-50"}`}
            >
              Chuyên ngành{" "}
              {filters.categories.length > 0 &&
                `(${filters.categories.length})`}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${openFilterDropdown === "category" ? "rotate-180" : ""}`}
              />
            </button>

            {openFilterDropdown === "category" && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-orange-100 rounded-xl shadow-xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-100 z-50">
                <div className="max-h-60 overflow-y-auto px-2 custom-scrollbar">
                  {availableCategories.length === 0 ? (
                    <p className="p-3 text-xs text-center text-slate-400">
                      Không có chuyên ngành nào
                    </p>
                  ) : (
                    availableCategories.map((cat) => (
                      <label
                        key={cat}
                        className="flex items-center gap-3 p-2 hover:bg-orange-50 rounded-lg cursor-pointer group transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(cat)}
                          onChange={() => handleCategoryToggle(cat)}
                          className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
                        />
                        <span className="text-sm font-medium text-slate-700 group-hover:text-orange-700">
                          {cat}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <div className="border-t border-orange-50 p-2 mt-2 flex justify-between gap-2 bg-slate-50/50">
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
                    className="px-4 py-1.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm transition-colors"
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${openFilterDropdown === "length" || filters.length !== "" ? "bg-orange-50 border-orange-300 text-orange-600" : "bg-white border-slate-200 text-slate-700 hover:bg-orange-50"}`}
              >
                Độ dài {filters.length && "(1)"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${openFilterDropdown === "length" ? "rotate-180" : ""}`}
                />
              </button>

              {openFilterDropdown === "length" && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-orange-100 rounded-xl shadow-xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-100 z-50">
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
                        className="flex items-center gap-3 p-2 hover:bg-orange-50 rounded-lg cursor-pointer group transition-colors"
                      >
                        <input
                          type="radio"
                          name="length_filter"
                          checked={filters.length === opt.val}
                          onChange={() =>
                            setFilters((p) => ({ ...p, length: opt.val }))
                          }
                          className="w-4 h-4 border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500 shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700 group-hover:text-orange-700 leading-tight">
                            {opt.label}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                            {opt.desc}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="border-t border-orange-50 p-2 mt-2 flex justify-between gap-2 bg-slate-50/50">
                    <button
                      onClick={() => setFilters((p) => ({ ...p, length: "" }))}
                      className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-md transition-colors"
                    >
                      Xóa
                    </button>
                    <button
                      onClick={() => setOpenFilterDropdown(null)}
                      className="px-4 py-1.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm transition-colors"
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
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${openFilterDropdown === "date" || filters.date !== "" ? "bg-orange-50 border-orange-300 text-orange-600" : "bg-white border-slate-200 text-slate-700 hover:bg-orange-50"}`}
            >
              Ngày đăng tải {filters.date && "(1)"}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${openFilterDropdown === "date" ? "rotate-180" : ""}`}
              />
            </button>

            {openFilterDropdown === "date" && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-orange-100 rounded-xl shadow-xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-100 z-50">
                <div className="px-2">
                  {[
                    { val: "week", label: "Tuần này" },
                    { val: "month", label: "Tháng này" },
                    { val: "year", label: "Năm nay" },
                  ].map((opt) => (
                    <label
                      key={opt.val}
                      className="flex items-center gap-3 p-2 hover:bg-orange-50 rounded-lg cursor-pointer group transition-colors"
                    >
                      <input
                        type="radio"
                        name="date_filter"
                        checked={filters.date === opt.val}
                        onChange={() =>
                          setFilters((p) => ({ ...p, date: opt.val }))
                        }
                        className="w-4 h-4 border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
                      />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-orange-700">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="border-t border-orange-50 p-2 mt-2 flex justify-between gap-2 bg-slate-50/50">
                  <button
                    onClick={() => setFilters((p) => ({ ...p, date: "" }))}
                    className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-md transition-colors"
                  >
                    Xóa
                  </button>
                  <button
                    onClick={() => setOpenFilterDropdown(null)}
                    className="px-4 py-1.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-sm transition-colors"
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
              className="ml-auto flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <X className="w-4 h-4" /> Xóa bộ lọc
            </button>
          )}
        </div>

        {/* ================= HIỂN THỊ KẾT QUẢ ================= */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            <p className="text-sm font-bold text-slate-500">
              Đang quét kho dữ liệu...
            </p>
          </div>
        ) : totalResults === 0 ? (
          <div className="py-24 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-white border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <SearchIcon className="w-10 h-10 text-orange-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">
              Không tìm thấy tài liệu
            </h3>
            <p className="text-slate-500">
              Rất tiếc, không có giáo án hay khóa học nào khớp với điều kiện của
              bạn.
              <br />
              Hãy thử mở rộng bộ lọc hoặc dùng từ khóa khác.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-6 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition-colors"
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
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">
                      Khóa học & Chuyên đề
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-700 text-xs font-black">
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
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer group hover:-translate-y-1.5 hover:shadow-xl hover:shadow-orange-900/5 transition-all duration-300 flex flex-col"
                      >
                        <div className="relative aspect-video bg-slate-50 overflow-hidden border-b border-slate-100">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                              <GraduationCap className="w-10 h-10" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 px-2 py-1 bg-white/95 backdrop-blur-sm rounded text-[10px] font-black text-slate-700 shadow-sm border border-slate-200/50">
                            {course.grade || "Cơ bản"}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <h4 className="font-bold text-slate-800 leading-snug line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                            {course.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-auto text-xs text-slate-500 font-medium">
                            <UserCircle2 className="w-4 h-4" />
                            <span className="truncate">
                              {course.teacher_name || "Giảng viên EduTech"}
                            </span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="px-2 py-1 rounded bg-orange-50 text-orange-700 border border-orange-100 text-[10px] font-bold uppercase tracking-wider truncate max-w-[120px]">
                              {course.subject || "Chuyên ngành"}
                            </span>
                            <span className="text-xs font-black text-orange-600 group-hover:underline">
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
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">
                      Giáo án & Tài liệu
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs font-black">
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
                        <div className="w-14 h-16 bg-gradient-to-br from-amber-50 to-orange-50 text-orange-500 rounded-xl flex flex-col items-center justify-center shrink-0 border border-orange-100 group-hover:scale-105 transition-transform shadow-sm">
                          <FileCheck className="w-6 h-6 mb-1 opacity-80" />
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
                              {doc.student_name || "Kho dữ liệu"}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full shrink-0"></span>
                            <span>{doc.pages || 15} trang</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full shrink-0 hidden sm:block"></span>
                            <span className="hidden sm:block text-slate-400">
                              {doc.date || "Gần đây"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <button className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white transition-all shadow-sm">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {/* 3. LƯỚI VIDEO */}
            {(activeTab === "all" || activeTab === "videos") &&
              filteredResults.videos.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                  <div className="flex items-center gap-3 mb-6">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">
                      Video Hướng dẫn
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-700 text-xs font-black">
                      {filteredResults.videos.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredResults.videos.map((vid) => (
                      <div
                        key={vid.id}
                        onClick={() => navigate(`/${role}/videos/${vid.id}`)}
                        className="cursor-pointer group flex flex-col"
                      >
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 mb-3 shadow-md group-hover:shadow-xl group-hover:shadow-red-900/10 transition-shadow border border-slate-200">
                          <img
                            src={vid.thumbnail}
                            alt={vid.title}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                              <Play className="w-5 h-5 fill-red-600 text-red-600 ml-1" />
                            </div>
                          </div>
                          <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded border border-white/10 tracking-wider">
                            {vid.duration}
                          </span>
                        </div>
                        <div className="pr-4 flex-1 flex flex-col">
                          <h4 className="text-sm font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors leading-tight">
                            {vid.title}
                          </h4>
                          <div className="mt-auto flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <span className="font-bold text-slate-600">
                              {vid.author}
                            </span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full shrink-0"></span>
                            <span>{vid.views} lượt xem</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
