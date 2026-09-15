import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  BookMarked,
  FileText,
  Loader2,
  AlertCircle,
  ChevronRight,
  Download,
  Video,
  Play,
  Globe,
} from "lucide-react";

// DATA MẪU CHO VIDEO (Dùng tạm trong lúc chờ BE Go cung cấp API Video)
const DUMMY_VIDEOS = [
  {
    id: "v-1",
    title: "Mẹo giải nhanh bài toán Quy hoạch động trong 60s",
    author: "Thầy Thành AI",
    duration: "0:58",
    views: "12.4k",
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "v-2",
    title: "Phân biệt Năng lực Pháp luật & Năng lực Hành vi",
    author: "Khoa Luật Kinh Tế",
    duration: "1:15",
    views: "8.9k",
    thumbnail:
      "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "v-3",
    title: "Hướng dẫn cài đặt Docker Compose cho dự án Microservices",
    author: "Kỹ Thuật Phần Mềm",
    duration: "15:20",
    views: "5.1k",
    thumbnail:
      "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=500&auto=format&fit=crop&q=60",
  },
  {
    id: "v-4",
    title: "Lộ trình tự học Machine Learning năm 2026",
    author: "AI Lab",
    duration: "12:05",
    views: "22.3k",
    thumbnail:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&auto=format&fit=crop&q=60",
  },
];

export default function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("query") || "";
  const role = localStorage.getItem("role")?.toLowerCase() || "student";

  // State quản lý ô input tìm kiếm và Dropdown
  const [localSearchInput, setLocalSearchInput] = useState(keyword);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const searchContainerRef = useRef(null);

  // State quản lý dữ liệu hiển thị (kết quả tìm kiếm thực tế)
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'courses' | 'documents' | 'videos'

  // State lưu trữ TOÀN BỘ dữ liệu (để làm gợi ý Dropdown siêu tốc)
  const [allData, setAllData] = useState({
    courses: [],
    documents: [],
    videos: DUMMY_VIDEOS,
  });

  const baseUrl =
    import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1";

  // HÀM 1: CALL API LẤY DATA (Chạy 1 lần hoặc khi keyword đổi)
  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        const [courseRes, docRes] = await Promise.all([
          fetch(`${baseUrl}/courses`).catch(() => ({ json: () => [] })),
          fetch(`${baseUrl}/shared-documents?all=true`).catch(() => ({
            json: () => [],
          })),
        ]);

        const courseData = await courseRes.json();
        const docData = await docRes.json();

        const rawCourses = Array.isArray(courseData)
          ? courseData
          : courseData?.data || [];
        const rawDocs = Array.isArray(docData) ? docData : docData?.data || [];

        // Lưu lại toàn bộ data để Dropdown dùng
        setAllData({
          courses: rawCourses,
          documents: rawDocs,
          videos: DUMMY_VIDEOS,
        });

        if (!keyword.trim()) {
          setCourses([]);
          setDocuments([]);
          setVideos([]);
          setIsLoading(false);
          return;
        }

        const kw = keyword.toLowerCase();

        // 1. Lọc Khóa học
        const filteredCourses = rawCourses.filter(
          (c) =>
            c.title?.toLowerCase().includes(kw) ||
            c.teacher_name?.toLowerCase().includes(kw) ||
            c.subject?.toLowerCase().includes(kw),
        );

        // 2. Lọc Tài liệu
        const filteredDocs = rawDocs.filter(
          (d) =>
            d.title?.toLowerCase().includes(kw) ||
            d.description?.toLowerCase().includes(kw) ||
            d.student_name?.toLowerCase().includes(kw) ||
            d.category?.toLowerCase().includes(kw),
        );

        // 3. Lọc Video
        const filteredVideos = DUMMY_VIDEOS.filter(
          (v) =>
            v.title.toLowerCase().includes(kw) ||
            v.author.toLowerCase().includes(kw),
        );

        setCourses(filteredCourses);
        setDocuments(filteredDocs);
        setVideos(filteredVideos);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
    setLocalSearchInput(keyword);
  }, [keyword, baseUrl]);

  // HÀM 2: LOGIC TẠO GỢI Ý TÌM KIẾM (Quét realtime trên localSearchInput)
  useEffect(() => {
    if (!localSearchInput.trim()) {
      setSuggestions([]);
      return;
    }
    const kw = localSearchInput.trim().toLowerCase();

    const globalSearchItem = {
      isGlobal: true,
      type: "global",
      text: `Tìm kiếm toàn hệ thống cho "${localSearchInput.trim()}"`,
      value: localSearchInput.trim(),
    };

    const matchedCourses = allData.courses
      .filter(
        (c) =>
          c.title?.toLowerCase().includes(kw) ||
          c.subject?.toLowerCase().includes(kw),
      )
      .slice(0, 2)
      .map((c) => ({
        isGlobal: false,
        type: "course",
        text: c.title,
        value: c.title,
      }));

    const matchedDocs = allData.documents
      .filter((d) => d.title?.toLowerCase().includes(kw))
      .slice(0, 2)
      .map((d) => ({
        isGlobal: false,
        type: "document",
        text: d.title,
        value: d.title,
      }));

    const matchedVideos = allData.videos
      .filter((v) => v.title.toLowerCase().includes(kw))
      .slice(0, 2)
      .map((v) => ({
        isGlobal: false,
        type: "video",
        text: v.title,
        value: v.title,
      }));

    setSuggestions(
      [
        globalSearchItem,
        ...matchedCourses,
        ...matchedDocs,
        ...matchedVideos,
      ].slice(0, 7),
    );
  }, [localSearchInput, allData]);

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

  // Xử lý khi nhấn nút Tìm kiếm hoặc chọn Dropdown
  const executeSearch = (searchVal) => {
    if (searchVal.trim() !== "") {
      setShowSuggestions(false);
      navigate(`/${role}/search?query=${encodeURIComponent(searchVal)}`);
    }
  };

  const handleReSearch = (e) => {
    e.preventDefault();
    executeSearch(localSearchInput);
  };

  const totalResults = courses.length + documents.length + videos.length;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 font-sans pb-20">
      {/* KHAI BÁO CSS CHO DROPDOWN */}
      <style>{`
        .search-suggestions-dropdown {
          position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 50;
          background: #ffffff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          overflow: hidden; border: 1px solid #e2e8f0; display: flex; flex-direction: column;
          animation: slideDown 0.2s ease-out forwards; text-align: left;
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
      `}</style>

      {/* 1. Thanh tìm kiếm trung tâm */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm text-center">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">
          Kết quả tìm kiếm cho:{" "}
          <span className="text-blue-600">"{keyword}"</span>
        </h1>

        <div className="max-w-2xl mx-auto relative" ref={searchContainerRef}>
          <form
            onSubmit={handleReSearch}
            className="relative flex items-center"
          >
            <SearchIcon className="w-5 h-5 absolute left-4 text-slate-400" />
            <input
              type="text"
              value={localSearchInput}
              onChange={(e) => {
                setLocalSearchInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className={`w-full pl-12 pr-28 py-3.5 bg-slate-50 border-2 border-slate-200 text-sm font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition ${showSuggestions && suggestions.length > 0 ? "rounded-t-2xl" : "rounded-2xl"}`}
              placeholder="Tìm kiếm khóa học, tài liệu PDF, video bài giảng..."
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              TÌM KIẾM
            </button>
          </form>

          {/* DROPDOWN MENU */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions-dropdown">
              {suggestions.map((sug, idx) => (
                <div
                  key={idx}
                  className={`suggestion-item ${sug.isGlobal ? "global-item" : ""}`}
                  onClick={() => {
                    setLocalSearchInput(sug.value);
                    executeSearch(sug.value);
                  }}
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

                  <div className="flex flex-col">
                    <span className="truncate">{sug.text}</span>
                    {!sug.isGlobal && (
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
      </div>

      {/* 2. Tabs phân loại kết quả */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition ${activeTab === "all" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          Tất cả kết quả ({totalResults})
        </button>
        <button
          onClick={() => setActiveTab("courses")}
          className={`px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition flex items-center gap-2 ${activeTab === "courses" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <BookMarked className="w-4 h-4" /> Khóa học ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition flex items-center gap-2 ${activeTab === "documents" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <FileText className="w-4 h-4" /> Tài liệu PDF ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab("videos")}
          className={`px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition flex items-center gap-2 ${activeTab === "videos" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          <Video className="w-4 h-4" /> Video ({videos.length})
        </button>
      </div>

      {/* 3. Hiển thị Trạng thái */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-slate-500 font-medium">
            Đang quét toàn hệ thống...
          </p>
        </div>
      ) : totalResults === 0 ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-700">
            Không tìm thấy dữ liệu
          </h3>
          <p className="text-slate-500 max-w-md mx-auto">
            Hệ thống không tìm thấy khóa học, tài liệu hay video nào khớp với từ
            khóa <strong className="text-slate-800">"{keyword}"</strong>. Vui
            lòng thử lại với từ khóa khác.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* LƯỚI KHÓA HỌC */}
          {(activeTab === "all" || activeTab === "courses") &&
            courses.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-900 uppercase flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-blue-600" /> Khóa học
                    liên quan
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.id || course.id_course}
                      className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 transition group cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/${role}/courses/${course.id || course.id_course}`,
                        )
                      }
                    >
                      <div className="flex gap-4 items-start mb-4">
                        <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-100 overflow-hidden shrink-0 flex items-center justify-center">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookMarked className="w-8 h-8 text-blue-300" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition">
                            {course.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">
                            {course.teacher_name || "Giảng viên EduTech"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                          {course.subject || "Chuyên môn"}
                        </span>
                        <button className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:underline">
                          Xem chi tiết <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* LƯỚI VIDEO BÀI GIẢNG */}
          {(activeTab === "all" || activeTab === "videos") &&
            videos.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-900 uppercase flex items-center gap-2">
                    <Video className="w-5 h-5 text-red-500" /> Video bài giảng
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {videos.map((vid) => (
                    <div
                      key={vid.id}
                      className="bg-slate-900 rounded-xl overflow-hidden group cursor-pointer border border-slate-800 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 transition-all"
                    >
                      <div className="relative aspect-video">
                        <img
                          src={vid.thumbnail}
                          alt={vid.title}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition flex items-center justify-center">
                          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                            <Play className="w-4 h-4 fill-orange-600 ml-1" />
                          </div>
                        </div>
                        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {vid.duration}
                        </span>
                      </div>
                      <div className="p-3">
                        <h4 className="text-sm font-bold text-white line-clamp-2 mb-1 group-hover:text-orange-400 transition">
                          {vid.title}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {vid.author} • {vid.views} lượt xem
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* LƯỚI TÀI LIỆU */}
          {(activeTab === "all" || activeTab === "documents") &&
            documents.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-900 uppercase flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-500" /> Tài liệu
                    học thuật
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between hover:border-orange-300 hover:shadow-md transition cursor-pointer"
                      onClick={() => navigate(`/${role}/documents/${doc.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-14 bg-red-50 text-red-500 rounded-lg flex items-center justify-center shrink-0 border border-red-100">
                          <span className="text-xs font-black">PDF</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-orange-600 transition">
                            {doc.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {doc.student_name || "Thành viên"} •{" "}
                            {doc.pages || 15} trang
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Download className="w-3 h-3" /> {doc.downloads || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
        </div>
      )}
    </div>
  );
}
