/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Folder,
  FileText,
  CloudUpload,
  Eye,
  Search,
  Loader2,
  RefreshCw,
  X,
  AlertTriangle,
  User,
  Calendar,
  BookOpen,
  Globe,
  Lock,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Layers,
} from "lucide-react";

// Thư viện đọc PDF
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

function PdfCardItem({ item, role, isTeacher }) {
  const [cardPages, setCardPages] = useState(null);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/${role}/documents/${item.rawId || item.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="relative bg-slate-50 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group w-full h-[380px] cursor-pointer flex flex-col items-center justify-center p-2.5"
    >
      {/* 1. KHUNG HIỂN THỊ PDF TRANG 1 */}
      <div className="w-full h-full bg-white rounded-xl shadow-xs border border-slate-100 flex items-center justify-center overflow-hidden">
        {item.fileUrl && !item.fileUrl.toLowerCase().endsWith(".docx") ? (
          <Document
            file={item.fileUrl}
            onLoadSuccess={({ numPages }) => setCardPages(numPages)}
            loading={
              <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                <Loader2 className={`w-6 h-6 animate-spin ${isTeacher ? "text-orange-600" : "text-blue-600"}`} />
                <span>Đang kết xuất...</span>
              </div>
            }
            error={
              <div className="p-4 text-center text-xs text-slate-400">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-1" />
                <span>Tài liệu PDF</span>
              </div>
            }
          >
            <Page
              pageNumber={1}
              height={360}
              devicePixelRatio={Math.min(window.devicePixelRatio || 1, 2)}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="pointer-events-none drop-shadow-xs"
            />
          </Document>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400 text-xs p-4 text-center">
            <FileText className="w-12 h-12 text-slate-300" />
            <span className="font-bold text-slate-500 line-clamp-2">{item.title}</span>
          </div>
        )}
      </div>

      {/* Badges góc trên: Chỉ hiển thị khi Riêng tư hoặc Chờ duyệt */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 z-10 pointer-events-none">
        {item.isPublic === false && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-600/90 text-white text-[10px] font-bold rounded-md shadow-xs">
            <Lock className="w-3 h-3" /> Riêng tư
          </span>
        )}

        {!item.isApproved && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/90 text-white text-[10px] font-bold rounded-md shadow-xs">
            <Clock className="w-3 h-3" /> Chờ duyệt
          </span>
        )}
      </div>

      <span className="absolute top-4 right-4 px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded uppercase shadow-sm z-10 pointer-events-none">
        {item.fileUrl?.toLowerCase().endsWith(".docx") ? "DOCX" : "PDF"}
      </span>

      {/* 2. DẢI THÔNG TIN HOVER TRƯỢT LÊN */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-xs pt-12 pb-3.5 px-4 text-slate-800 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex flex-col justify-end gap-1.5 z-20 pointer-events-none border-t border-slate-100/30">
        <div className="space-y-0.5">
          <span className={`inline-block px-2 py-0.5 text-[9px] font-extrabold uppercase rounded tracking-wide ${
            isTeacher ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"
          }`}>
            {item.category || "Tài liệu"}
          </span>
          <h4
            className="font-black text-xs text-slate-900 line-clamp-1"
            title={item.title}
          >
            {item.title}
          </h4>
        </div>

        <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-200/60 pt-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 truncate max-w-[65%]">
              <User className={`w-3 h-3 shrink-0 ${isTeacher ? "text-orange-600" : "text-blue-600"}`} />
              <strong className="text-slate-800 truncate">{item.author}</strong>
            </span>
            <span className="flex items-center gap-1 text-slate-500 shrink-0">
              <Calendar className="w-3 h-3 text-slate-400" />
              {item.date}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            <span>{cardPages ? `${cardPages} trang` : "Tài liệu"}</span>
            <span className={`flex items-center gap-1 font-bold ${isTeacher ? "text-orange-700" : "text-blue-700"}`}>
              <Eye className="w-3 h-3" />
              {item.views || 0} lượt xem
            </span>
          </div>
        </div>

        <button
          type="button"
          className={`w-full mt-1 py-1.5 text-white font-bold text-[11px] rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 ${
            isTeacher ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Đọc tài liệu</span>
        </button>
      </div>
    </div>
  );
}

export default function Library() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role")?.toLowerCase() || "student";
  const isTeacher = role === "teacher";

  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  // State upload
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    subject: "Toán Học",
    category: "",
    categoryId: null,
    is_public: true,
    file: null,
  });

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const currentUserId =
    currentUser.id_users ||
    currentUser.id ||
    currentUser.student_id ||
    currentUser.userId ||
    currentUser._id;

  const currentUserName =
    currentUser.full_name ||
    currentUser.fullName ||
    currentUser.name ||
    currentUser.username ||
    "";

  // URL API dùng trực tiếp giống DocumentCategories
  const baseUrl = import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1";

  // 1. Tải danh mục tài liệu qua fetch
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${baseUrl}/document-categories`);
      if (res.ok) {
        const json = await res.json();
        const list = json.data || json || [];
        setCategories(Array.isArray(list) ? list : []);
        if (list.length > 0 && !uploadData.category) {
          setUploadData((prev) => ({
            ...prev,
            category: list[0].name,
            categoryId: list[0].id,
          }));
        }
      }
    } catch (err) {
      console.warn("Không thể tải danh mục tài liệu:", err);
    }
  };

  // 2. Tải danh sách tài liệu cá nhân qua fetch
  const fetchLibraryData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${baseUrl}/shared-documents?all=true`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rawList = json.data || json || [];
      const sharedDocs = Array.isArray(rawList) ? rawList : [];

      const myOnlyDocs = sharedDocs
        .filter((doc) => {
          const docStudentId =
            doc.student_id || doc.studentId || doc.id_users || doc.userId;

          const matchId =
            Boolean(currentUserId && docStudentId) &&
            String(docStudentId) === String(currentUserId);

          const docStudentName = doc.student_name || doc.studentName;
          const matchName =
            Boolean(currentUserName && docStudentName) &&
            docStudentName.trim().toLowerCase() === currentUserName.trim().toLowerCase();

          return matchId || matchName;
        })
        .map((doc, idx) => ({
          id: `shared-${doc.id || doc._id || idx}`,
          rawId: doc.id || doc._id,
          title: doc.title || "Tài liệu không tên",
          courseSubject: doc.subject || "Chung",
          category: doc.category || doc.category_rel?.name || "Tài liệu",
          categoryId: doc.category_id,
          fileUrl: doc.file_url || doc.fileUrl || doc.url,
          author: doc.student_name || doc.studentName || currentUserName || "Tôi",
          date: doc.created_at
            ? new Date(doc.created_at).toLocaleDateString("vi-VN")
            : "Gần đây",
          views: doc.views || 0,
          downloads: doc.downloads || 0,
          isPublic: doc.is_public ?? true,
          isApproved: doc.is_approved ?? false,
        }));

      setMaterials(myOnlyDocs);
    } catch (error) {
      console.error("Lỗi tải tài liệu:", error);
      setErrorMessage(
        "Không thể kết nối máy chủ dịch vụ tài liệu."
      );
      setMaterials([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [baseUrl]);

  useEffect(() => {
    fetchLibraryData();
  }, [currentUserId, currentUserName, baseUrl]);

  // Bộ lọc
  const filteredMaterials = useMemo(() => {
    return materials
      .filter((item) => {
        const term = searchTerm.toLowerCase();
        const matchSearch =
          item.title.toLowerCase().includes(term) ||
          (item.courseSubject && item.courseSubject.toLowerCase().includes(term));

        const matchCategory =
          selectedCategory === "all" ||
          item.category === selectedCategory ||
          String(item.categoryId) === String(selectedCategory);

        const matchSubject =
          selectedSubject === "all" ||
          item.courseSubject.toLowerCase() === selectedSubject.toLowerCase();

        return matchSearch && matchCategory && matchSubject;
      })
      .sort((a, b) => {
        if (sortBy === "popular") return (b.downloads || 0) - (a.downloads || 0);
        if (sortBy === "views") return (b.views || 0) - (a.views || 0);
        return 0;
      });
  }, [materials, searchTerm, selectedCategory, selectedSubject, sortBy]);

  const availableSubjects = useMemo(() => {
    const subjects = new Set(
      materials.map((m) => m.courseSubject).filter(Boolean)
    );
    return Array.from(subjects);
  }, [materials]);

  // Upload tài liệu mới qua fetch
  const handleUploadSharedDoc = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.title) {
      alert("Vui lòng nhập đầy đủ tiêu đề và chọn tệp PDF!");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadData.file);
      formData.append("upload_preset", "edutech_preset");

      const cloudinaryRes = await fetch(
        "https://api.cloudinary.com/v1_1/z9ax76tw/auto/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const cloudData = await cloudinaryRes.json();
      if (!cloudData.secure_url) throw new Error("Upload Cloudinary thất bại");

      const payload = {
        student_id: Number(currentUserId),
        student_name: currentUserName || "Học viên",
        title: uploadData.title,
        file_url: cloudData.secure_url,
        subject: uploadData.subject,
        category: uploadData.category,
        category_id: uploadData.categoryId ? Number(uploadData.categoryId) : undefined,
        is_public: uploadData.is_public,
      };

      const saveRes = await fetch(`${baseUrl}/shared-documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!saveRes.ok) throw new Error("Lưu tài liệu thất bại");

      alert("Đã đăng tải tài liệu thành công!");
      setIsUploadModalOpen(false);
      setUploadData({
        title: "",
        subject: "Toán Học",
        category: categories[0]?.name || "Đề thi & Kiểm tra",
        categoryId: categories[0]?.id || null,
        is_public: true,
        file: null,
      });
      fetchLibraryData();
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi upload tài liệu!");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* 1. Banner Header đồng bộ với DocumentCategories */}
      <div
        className={`p-6 md:p-8 rounded-3xl border shadow-2xs ${
          isTeacher
            ? "bg-gradient-to-r from-orange-500/10 via-amber-50/40 to-white border-orange-200/70"
            : "bg-gradient-to-r from-blue-600/10 via-indigo-50/40 to-white border-blue-200/70"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Kho học liệu cá nhân</span>
              <span>/</span>
              <span className={isTeacher ? "text-orange-600" : "text-blue-600"}>
                {materials.length} tệp đã đăng
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Tài Liệu Của Tôi
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Quản lý tài liệu học tập, theo dõi lượt xem và điều chỉnh quyền truy cập riêng tư hoặc công khai.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={fetchLibraryData}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition cursor-pointer shadow-2xs"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className={`flex items-center space-x-2 px-4 py-2.5 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                isTeacher ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <CloudUpload className="w-4 h-4" />
              <span>Tải Lên File Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Thanh tìm kiếm, phân môn, sắp xếp & Tab danh mục */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm tài liệu theo tên hoặc môn học..."
                  className={`w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 ${
                    isTeacher ? "focus:ring-orange-500/20 focus:border-orange-500" : "focus:ring-blue-500/20 focus:border-blue-500"
                  }`}
                />
              </div>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full sm:w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Tất cả môn học</option>
                {availableSubjects.map((s, idx) => (
                  <option key={idx} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-36 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer outline-none"
                >
                  <option value="popular">Tải nhiều nhất</option>
                  <option value="views">Lượt xem nhiều</option>
                </select>
              </div>
            </div>

            {/* Thanh Tab Danh Mục */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 no-scrollbar">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === "all"
                    ? isTeacher
                      ? "bg-orange-600 text-white shadow-xs"
                      : "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60"
                }`}
              >
                Tất cả
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.name
                      ? isTeacher
                        ? "bg-orange-600 text-white shadow-xs"
                        : "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-extrabold text-sm text-slate-900">
                Danh Sách Tệp Đã Đăng
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Hiển thị {filteredMaterials.length} tài liệu
              </span>
            </div>

            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
                <Loader2 className={`w-8 h-8 animate-spin ${isTeacher ? "text-orange-600" : "text-blue-600"}`} />
                <p className="text-xs font-bold text-slate-400">Đang nạp dữ liệu và kết xuất tài liệu...</p>
              </div>
            ) : errorMessage ? (
              <div className="py-10 px-6 text-center bg-red-50 border border-red-200 rounded-3xl space-y-2">
                <AlertTriangle className="w-6 h-6 text-red-500 mx-auto" />
                <p className="text-xs font-bold text-red-800">{errorMessage}</p>
                <button
                  onClick={fetchLibraryData}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Thử lại
                </button>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-3">
                <Layers className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-sm">Không tìm thấy tài liệu phù hợp</h3>
                <p className="text-xs text-slate-500">Hãy thử đổi từ khóa tìm kiếm hoặc đăng tải tệp mới vào kho.</p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className={`mt-2 px-4 py-2 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm ${
                    isTeacher ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Tải lên tệp mới
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredMaterials.map((item) => (
                  <PdfCardItem
                    key={item.id}
                    item={item}
                    role={role}
                    isTeacher={isTeacher}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Thống kê cá nhân */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-900 font-black text-sm">
                <Folder className={`w-5 h-5 ${isTeacher ? "text-orange-600" : "text-blue-600"}`} />
                <span>Thống Kê Cá Nhân</span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {materials.length} tệp
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-100 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Công khai</span>
                </div>
                <span className="text-xl font-black text-blue-900 mt-2">
                  {materials.filter((m) => m.isPublic).length}
                </span>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Riêng tư</span>
                </div>
                <span className="text-xl font-black text-amber-900 mt-2">
                  {materials.filter((m) => !m.isPublic).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Upload */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100">
            <div className={`px-6 py-4 flex items-center justify-between text-white ${
              isTeacher ? "bg-orange-600" : "bg-blue-600"
            }`}>
              <h2 className="font-bold text-sm">Tải Lên Tài Liệu Mới</h2>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSharedDoc} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Tên tài liệu / Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={uploadData.title}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, title: e.target.value })
                  }
                  className={`w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 ${
                    isTeacher ? "focus:ring-orange-500/20 focus:border-orange-500" : "focus:ring-blue-500/20 focus:border-blue-500"
                  }`}
                  placeholder="VD: Đề thi thử Toán Giữa kỳ 1..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Môn học</label>
                  <select
                    value={uploadData.subject}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none cursor-pointer"
                  >
                    <option>Toán Học</option>
                    <option>Ngữ Văn</option>
                    <option>Hóa Học</option>
                    <option>Vật Lý</option>
                    <option>Tiếng Anh</option>
                    <option>Sinh Học</option>
                    <option>Lịch Sử & Địa Lý</option>
                    <option>Tin Học</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Danh mục</label>
                  <select
                    value={uploadData.categoryId || ""}
                    onChange={(e) => {
                      const selectedId = Number(e.target.value);
                      const targetCat = categories.find((c) => c.id === selectedId);
                      setUploadData({
                        ...uploadData,
                        categoryId: selectedId,
                        category: targetCat ? targetCat.name : "",
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none cursor-pointer"
                  >
                    {categories.length === 0 && (
                      <option value="">Đang tải danh mục...</option>
                    )}
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tùy chọn Quyền truy cập: Public / Private */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700">
                  Quyền xem tài liệu
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadData({ ...uploadData, is_public: true })}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition text-left ${
                      uploadData.is_public
                        ? isTeacher
                          ? "bg-orange-50 border-orange-500 text-orange-800 ring-2 ring-orange-500/20"
                          : "bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Globe className={`w-4 h-4 shrink-0 ${isTeacher ? "text-orange-600" : "text-blue-600"}`} />
                    <div>
                      <p className="text-[11px] font-bold">Công khai</p>
                      <p className="text-[9px] text-slate-500">Mọi người cùng xem</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadData({ ...uploadData, is_public: false })}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition text-left ${
                      !uploadData.is_public
                        ? "bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold">Riêng tư</p>
                      <p className="text-[9px] text-slate-500">Chỉ mình tôi xem</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Tệp PDF <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf"
                  onChange={(e) =>
                    setUploadData({ ...uploadData, file: e.target.files[0] })
                  }
                  className={`w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold cursor-pointer ${
                    isTeacher
                      ? "file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                      : "file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  }`}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition flex items-center space-x-2 disabled:opacity-50 cursor-pointer ${
                    isTeacher ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isUploading ? "Đang đẩy lên..." : "Tải Lên"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}