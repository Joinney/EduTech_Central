/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import {
  Upload,
  Plus,
  Sparkles,
  Folder,
  ChevronRight,
  FileText,
  PlayCircle,
  Box,
  Users,
  FileCode2,
  Pencil,
  UserPlus,
  CloudUpload,
  ArrowRight,
  Download,
  Eye,
  Search,
  Filter,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  X,
  Share2,
  ShieldAlert,
  ChevronLeft,
} from "lucide-react";

import { courseService } from "../../../../api/course.api";
import api from "../../../../api/axios"; // Import axios instance của bạn

// 🛡️ Tích hợp thư viện đọc PDF bảo mật
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Cấu hình Worker cho react-pdf (Dùng CDN chuẩn .mjs để không bị NGINX chặn)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function Library() {
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");

  // States cho tính năng Upload Studocu
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    subject: "Toán Học",
    category: "Đề thi",
    file: null,
  });

  // States cho tính năng Secure PDF Viewer (Bảo mật)
  const [securePreviewUrl, setSecurePreviewUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [viewCount, setViewCount] = useState(0); // State lưu số lượt xem của tài liệu đang mở

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // 🎯 1. TẢI TOÀN BỘ KHÓA HỌC, HỌC LIỆU & TÀI LIỆU CHIA SẺ
  const fetchLibraryData = async () => {
    setIsLoading(true);
    try {
      const rawCourses = await courseService.getAllCourses().catch(() => []);
      const coursesList = Array.isArray(rawCourses)
        ? rawCourses
        : rawCourses?.data || [];
      setCourses(coursesList);

      const allMaterialsList = [];

      // A. Lấy bài giảng & bài tập
      await Promise.all(
        coursesList.map(async (course) => {
          const cId = course.id || course.id_course;
          try {
            const lessonsRes = await courseService.getLessonsByCourse(cId);
            const lessons = Array.isArray(lessonsRes)
              ? lessonsRes
              : lessonsRes?.data || [];
            lessons.forEach((l, idx) => {
              const fileUrl =
                l.fileUrl || l.file_url || l.videoUrl || l.video_url;
              const isVideo =
                fileUrl &&
                (fileUrl.includes("youtube") ||
                  fileUrl.includes("video") ||
                  fileUrl.endsWith(".mp4"));
              if (fileUrl || l.content) {
                allMaterialsList.push({
                  id: `lesson-${l.id || idx}`,
                  title: l.title || `Bài học ${idx + 1}`,
                  courseName: course.title,
                  courseSubject: course.subject || "Chính quy",
                  teacherName:
                    course.teacher_name || course.teacherName || "Giảng viên",
                  type: isVideo ? "video" : "pdf",
                  fileUrl: fileUrl || "#",
                  fileName:
                    l.fileName ||
                    l.file_name ||
                    (isVideo ? "Video bài giảng" : "Tài liệu học tập PDF"),
                  date:
                    l.duration || l.created_at
                      ? new Date(l.duration || l.created_at).toLocaleDateString(
                          "vi-VN",
                        )
                      : "Gần đây",
                  description:
                    l.content || l.description || "Tài liệu học tập chính khóa",
                });
              }
            });
          } catch (_) {}
          try {
            const assignmentsRes =
              await courseService.getAssignmentsByCourse(cId);
            const assignments = Array.isArray(assignmentsRes)
              ? assignmentsRes
              : assignmentsRes?.data || [];
            assignments.forEach((a, idx) => {
              if (a.fileUrl || a.file_url || a.description) {
                allMaterialsList.push({
                  id: `assign-${a.id || idx}`,
                  title: a.title || `Bài tập ${idx + 1}`,
                  courseName: course.title,
                  courseSubject: course.subject || "Chính quy",
                  teacherName:
                    course.teacher_name || course.teacherName || "Giảng viên",
                  type: "assignment",
                  fileUrl: a.fileUrl || a.file_url || "#",
                  fileName: a.fileName || a.file_name || "Đề bài & Hướng dẫn",
                  date:
                    a.dueDate || a.due_date
                      ? new Date(a.dueDate || a.due_date).toLocaleDateString(
                          "vi-VN",
                        )
                      : "Hạn nộp mở",
                  description: a.description || "Tài liệu và bài tập thực hành",
                });
              }
            });
          } catch (_) {}
        }),
      );

      // B. Gọi API Lấy Danh sách Tài Liệu Cộng Đồng (Gọi thẳng port 8002)
      try {
        const sharedRes = await api.get(
          "http://localhost:8002/api/v1/shared-documents",
        );
        const sharedDocs = sharedRes.data?.data || [];
        sharedDocs.forEach((doc) => {
          allMaterialsList.push({
            id: `shared-${doc.id}`,
            title: doc.title,
            courseName: `Danh mục: ${doc.category}`,
            courseSubject: doc.subject,
            teacherName: doc.student_name + " (Học viên)", // Hiển thị tên người chia sẻ
            type: "shared", // Type mới cho Studocu Clone
            fileUrl: doc.file_url,
            fileName: "Tài liệu chia sẻ cộng đồng",
            date: new Date(doc.created_at).toLocaleDateString("vi-VN"),
            description: doc.description || "Tài liệu do cộng đồng chia sẻ.",
          });
        });
      } catch (error) {
        console.error("Lỗi lấy tài liệu chia sẻ:", error);
      }

      setMaterials(allMaterialsList);
    } catch (err) {
      console.error("Lỗi khi tải kho học liệu:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, []);

  // 🎯 2. LỌC HỌC LIỆU
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        item.title.toLowerCase().includes(term) ||
        item.courseName.toLowerCase().includes(term) ||
        item.fileName.toLowerCase().includes(term);

      const matchType = selectedType === "all" || item.type === selectedType;
      const matchSubject =
        selectedSubject === "all" ||
        item.courseSubject.toLowerCase() === selectedSubject.toLowerCase();

      return matchSearch && matchType && matchSubject;
    });
  }, [materials, searchTerm, selectedType, selectedSubject]);

  const stats = useMemo(() => {
    const pdfCount = materials.filter((m) => m.type === "pdf").length;
    const videoCount = materials.filter((m) => m.type === "video").length;
    const assignCount = materials.filter((m) => m.type === "assignment").length;
    const sharedCount = materials.filter((m) => m.type === "shared").length;
    return {
      pdfCount,
      videoCount,
      assignCount,
      sharedCount,
      total: materials.length,
    };
  }, [materials]);

  const availableSubjects = useMemo(() => {
    const subjects = new Set(courses.map((c) => c.subject).filter(Boolean));
    materials.forEach((m) => {
      if (m.type === "shared" && m.courseSubject) subjects.add(m.courseSubject);
    });
    return Array.from(subjects);
  }, [courses, materials]);

  // 🎯 3. XỬ LÝ UPLOAD TÀI LIỆU CHIA SẺ
  const handleUploadSharedDoc = async (e) => {
    e.preventDefault();
    if (!uploadData.file || !uploadData.title)
      return alert("Vui lòng nhập đủ thông tin và chọn file PDF!");

    setIsUploading(true);
    try {
      // 3.1 Upload file lên Cloudinary từ Frontend (Dùng /auto/upload)
      const formData = new FormData();
      formData.append("file", uploadData.file);
      formData.append("upload_preset", "edutech_preset");

      const cloudinaryRes = await fetch(
        "https://api.cloudinary.com/v1_1/z9ax76tw/auto/upload",
        {
          method: "POST",
          body: formData,
        },
      );
      const cloudData = await cloudinaryRes.json();

      if (!cloudData.secure_url) throw new Error("Upload Cloudinary thất bại");

      // 3.2 Gọi API lưu vào Database (Gọi thẳng Port 8002)
      const payload = {
        student_id: currentUser.id_users || currentUser.id || 1,
        student_name: currentUser.full_name || "Học viên Ẩn danh",
        title: uploadData.title,
        file_url: cloudData.secure_url,
        subject: uploadData.subject,
        category: uploadData.category,
      };

      await api.post("http://localhost:8002/api/v1/shared-documents", payload);
      alert("Đã gửi tài liệu thành công! Vui lòng chờ kiểm duyệt.");
      setIsUploadModalOpen(false);
      setUploadData({
        title: "",
        subject: "Toán Học",
        category: "Đề thi",
        file: null,
      });
      fetchLibraryData();
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi khi upload. Vui lòng thử lại!");
    } finally {
      setIsUploading(false);
    }
  };

  // 🎯 4. XỬ LÝ MỞ TÀI LIỆU & ĐẾM LƯỢT XEM
  const handleOpenViewer = (item) => {
    if (item.type === "shared") {
      setSecurePreviewUrl(item.fileUrl); // Mở Trình đọc bảo mật
      setViewCount(0); // Reset số đếm về 0 khi mới mở

      const docId = item.id.replace(/[^a-zA-Z0-9]/g, "_");

      // Giả lập API trễ 300ms
      setTimeout(() => {
        // 1. Key lưu TỔNG SỐ VIEW
        const totalViewsKey = `edutech_total_views_${docId}`;
        // 2. Key đánh dấu TRẠNG THÁI ĐÃ XEM của máy này
        const hasViewedKey = `edutech_has_viewed_${docId}`;

        let currentViews = parseInt(localStorage.getItem(totalViewsKey));

        // Nếu file này chưa ai xem, khởi tạo một con số ngẫu nhiên cho "uy tín"
        if (isNaN(currentViews)) {
          currentViews = Math.floor(Math.random() * 100) + 50;
        }

        // 🛡️ BỘ LỌC CHỐNG SPAM SPAM VIEW
        const hasViewed = localStorage.getItem(hasViewedKey);

        if (!hasViewed) {
          // Nếu CHƯA XEM -> Cộng 1 view
          currentViews += 1;
          localStorage.setItem(totalViewsKey, currentViews.toString());
          // Đóng dấu cờ: Đã xem!
          localStorage.setItem(hasViewedKey, "true");
        } else {
          // Nếu ĐÃ XEM -> Bỏ qua không cộng thêm, chỉ lưu số cũ để backup
          localStorage.setItem(totalViewsKey, currentViews.toString());
        }

        // Hiệu ứng Odometer: Chạy số nhảy tạch tạch trong 1.5 giây
        const endValue = currentViews;
        const duration = 1500;
        let startTimestamp = null;

        const step = (timestamp) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          setViewCount(Math.floor(progress * endValue));
          if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
      }, 300);
    } else {
      window.open(item.fileUrl, "_blank");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 font-sans relative">
      {/* 1. Page Header + Top Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Kho Học Liệu & Thư Viện</span>
            <span className="px-2.5 py-0.5 text-xs font-black bg-blue-100 text-blue-700 rounded-full">
              {stats.total} Tài nguyên
            </span>
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Tra cứu và chia sẻ tài liệu học tập cùng cộng đồng.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchLibraryData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
            title="Làm mới thư viện"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>

          {/* Nút Upload Tài liệu chia sẻ */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-emerald-500/20 cursor-pointer"
          >
            <CloudUpload className="w-4 h-4" />
            <span>Chia Sẻ Tài Liệu</span>
          </button>

          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent("open-ai-chat"));

              const aiWidgetBtn = document.getElementById(
                "edutech-ai-widget-btn",
              );
              if (aiWidgetBtn) aiWidgetBtn.click();
            }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span className="hidden sm:inline">Trợ Lý AI</span>
          </button>
        </div>
      </div>

      {/* 2. Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thanh Tìm Kiếm & Bộ Lọc */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm tài liệu, video, tên bài giảng..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Tất cả bộ môn</option>
                {availableSubjects.map((s, idx) => (
                  <option key={idx} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Tabs phân loại tài nguyên */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 no-scrollbar">
              {[
                { id: "all", label: `Tất cả (${stats.total})` },
                { id: "pdf", label: `Chính quy (${stats.pdfCount})` },
                { id: "video", label: `Video (${stats.videoCount})` },
                { id: "assignment", label: `Bài tập (${stats.assignCount})` },
                { id: "shared", label: `Cộng đồng (${stats.sharedCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedType === tab.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Danh Sách Tài Liệu */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                Danh Mục Tài Liệu
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Hiển thị {filteredMaterials.length} tài nguyên
              </span>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-xs font-medium">Đang tải dữ liệu...</p>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-xs space-y-1">
                <p className="font-bold text-slate-600">
                  Không tìm thấy tài liệu phù hợp.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMaterials.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                      item.type === "shared"
                        ? "border-emerald-100 bg-emerald-50/30 hover:border-emerald-300"
                        : "border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                          item.type === "video"
                            ? "bg-blue-100 text-blue-600"
                            : item.type === "assignment"
                              ? "bg-purple-100 text-purple-600"
                              : item.type === "shared"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.type === "video" ? (
                          <PlayCircle className="w-5 h-5" />
                        ) : item.type === "shared" ? (
                          <Share2 className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-xs text-slate-900 truncate group-hover:text-blue-600 transition">
                            {item.title}
                          </h4>
                          {item.type === "shared" && (
                            <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black uppercase rounded shadow-sm">
                              Cộng đồng
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate">
                          {item.courseSubject} •{" "}
                          {item.type === "shared" ? "Bởi: " : "GV: "}{" "}
                          {item.teacherName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                        {item.date}
                      </span>

                      {item.fileUrl && item.fileUrl !== "#" && (
                        <>
                          {/* 🛡️ Nút Mở xem & Gọi bộ đếm View */}
                          <button
                            onClick={() => handleOpenViewer(item)}
                            className={`p-2 rounded-xl transition cursor-pointer ${
                              item.type === "shared"
                                ? "text-emerald-600 bg-emerald-100 hover:bg-emerald-200"
                                : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            }`}
                            title="Mở xem tài liệu"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Ẩn nút Tải Xuống đối với tài liệu Chia sẻ */}
                          {item.type !== "shared" && (
                            <a
                              href={item.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
                              title="Tải về máy"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-900 font-black text-sm">
                <Folder className="w-5 h-5 text-blue-600" />
                <span>Phân Loại Học Liệu</span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {stats.total} tệp
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* 1. Nút Tài liệu Chính quy */}
              <button
                onClick={() => setSelectedType("pdf")}
                className="w-full p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer text-left bg-slate-50/60 hover:bg-slate-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-800">
                      Tài liệu Chính quy
                    </h5>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {stats.pdfCount} tệp bài giảng
                    </p>
                  </div>
                </div>
              </button>

              {/* 2. Nút Video Bài giảng */}
              <button
                onClick={() => setSelectedType("video")}
                className="w-full p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer text-left bg-blue-50/30 border-blue-100 hover:bg-blue-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-blue-800">
                      Video Bài Giảng
                    </h5>
                    <p className="text-[10px] text-blue-600/80 font-medium">
                      {stats.videoCount} tệp video
                    </p>
                  </div>
                </div>
              </button>

              {/* 3. Nút Bài tập Thực hành*/}
              <button
                onClick={() => setSelectedType("assignment")}
                className="w-full p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer text-left bg-purple-50/30 border-purple-100 hover:bg-purple-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Pencil className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-purple-800">
                      Bài tập Thực hành
                    </h5>
                    <p className="text-[10px] text-purple-600/80 font-medium">
                      {stats.assignCount} tệp bài tập
                    </p>
                  </div>
                </div>
              </button>

              {/* 4. Nút Cộng đồng Chia sẻ */}
              <button
                onClick={() => setSelectedType("shared")}
                className="w-full p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer text-left bg-emerald-50/30 border-emerald-100 hover:bg-emerald-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-emerald-800">
                      Cộng đồng Chia sẻ
                    </h5>
                    <p className="text-[10px] text-emerald-600/80 font-medium">
                      {stats.sharedCount} tệp đóng góp
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MODAL UPLOAD TÀI LIỆU CHIA SẺ */}
      {/* ============================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-emerald-600 flex items-center justify-between text-white">
              <h2 className="font-bold text-sm">Chia Sẻ Tài Liệu Cộng Đồng</h2>
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
                  Tên tài liệu / Ghi chú
                </label>
                <input
                  type="text"
                  required
                  value={uploadData.title}
                  onChange={(e) =>
                    setUploadData({ ...uploadData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  placeholder="VD: Đề cương Ôn tập Hóa học 12..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Môn học
                  </label>
                  <select
                    value={uploadData.subject}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    <option>Toán Học</option>
                    <option>Ngữ Văn</option>
                    <option>Hóa Học</option>
                    <option>Vật Lý</option>
                    <option>Tiếng Anh</option>
                    <option>Lập Trình</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Danh mục
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) =>
                      setUploadData({ ...uploadData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  >
                    <option>Đề thi & Kiểm tra</option>
                    <option>Ghi chép lớp học</option>
                    <option>Bài tập về nhà</option>
                    <option>Tiểu luận</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  File PDF
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf"
                  onChange={(e) =>
                    setUploadData({ ...uploadData, file: e.target.files[0] })
                  }
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center space-x-2 disabled:opacity-50"
                >
                  {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>
                    {isUploading ? "Đang đẩy lên..." : "Xác nhận Đăng"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODAL TRÌNH ĐỌC PDF BẢO MẬT (CHỐNG DOWNLOAD/COPY) */}
      {/* ============================================================== */}
      {securePreviewUrl && (
        <div
          className="fixed inset-0 z-[100] bg-slate-900/95 flex flex-col backdrop-blur-md"
          onContextMenu={(e) => e.preventDefault()} // Chống Click chuột phải
        >
          {/* Thanh công cụ bảo mật */}
          <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0">
            <div className="flex items-center space-x-3 text-emerald-400">
              <ShieldAlert className="w-5 h-5" />
              <span className="text-xs font-bold tracking-wider uppercase">
                Chế độ bảo mật bản quyền
              </span>

              {/* Nơi hiển thị View Counter siêu ngầu */}
              <div className="ml-4 md:ml-8 px-3 py-1.5 bg-slate-800/80 rounded-full flex items-center space-x-2 border border-slate-700 shadow-inner">
                <Eye className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-black text-white min-w-[20px] text-center">
                  {viewCount}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  lượt xem
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {numPages && (
                <div className="flex items-center space-x-3 bg-slate-800 px-3 py-1.5 rounded-lg text-white text-xs font-bold">
                  <button
                    disabled={pageNumber <= 1}
                    onClick={() => setPageNumber((prev) => prev - 1)}
                    className="disabled:opacity-30 hover:text-emerald-400 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>
                    Trang {pageNumber} / {numPages}
                  </span>
                  <button
                    disabled={pageNumber >= numPages}
                    onClick={() => setPageNumber((prev) => prev + 1)}
                    className="disabled:opacity-30 hover:text-emerald-400 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  setSecurePreviewUrl(null);
                  setPageNumber(1);
                  setNumPages(null);
                }}
                className="p-2 bg-slate-800 hover:bg-red-500 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Vùng Render PDF chống Select Text */}
          <div className="flex-1 overflow-auto flex justify-center p-4 sm:p-8 select-none pointer-events-none">
            <div className="bg-white shadow-2xl pointer-events-auto">
              <Document
                file={securePreviewUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={
                  <div className="p-20 text-slate-400 flex flex-col items-center">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" /> Đang tải
                    dữ liệu mã hóa...
                  </div>
                }
                error={
                  <div className="p-20 text-red-500">
                    Lỗi tải file. Vui lòng thử lại.
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={false} // Chống bôi đen text
                  renderAnnotationLayer={false} // Chống click link ẩn
                  className="max-w-full"
                  width={Math.min(window.innerWidth * 0.9, 900)} // Responsive size
                />
              </Document>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
