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
  X
} from "lucide-react";

import { courseService } from "../../../../api/course.api";

export default function Library() {
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all"); // "all" | "pdf" | "video" | "assignment"
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [previewItem, setPreviewItem] = useState(null);

  // 🎯 1. TẢI TOÀN BỘ KHÓA HỌC & HỌC LIỆU THỰC TẾ
  const fetchLibraryData = async () => {
    setIsLoading(true);
    try {
      // 1. Lấy danh sách toàn bộ khóa học
      const rawCourses = await courseService.getAllCourses().catch(() => []);
      const coursesList = Array.isArray(rawCourses) ? rawCourses : (rawCourses?.data || []);
      setCourses(coursesList);

      const allMaterialsList = [];

      // 2. Lấy toàn bộ bài giảng (lessons) và bài tập (assignments) của từng khóa
      await Promise.all(
        coursesList.map(async (course) => {
          const cId = course.id || course.id_course;

          // A. Lấy bài giảng (lessons)
          try {
            const lessonsRes = await courseService.getLessonsByCourse(cId);
            const lessons = Array.isArray(lessonsRes) ? lessonsRes : (lessonsRes?.data || []);

            lessons.forEach((l, idx) => {
              const fileUrl = l.fileUrl || l.file_url || l.videoUrl || l.video_url;
              const isVideo = fileUrl && (fileUrl.includes("youtube") || fileUrl.includes("video") || fileUrl.endsWith(".mp4"));

              if (fileUrl || l.content) {
                allMaterialsList.push({
                  id: `lesson-${l.id || idx}`,
                  title: l.title || `Bài học ${idx + 1}`,
                  courseName: course.title,
                  courseSubject: course.subject || "Chính quy",
                  teacherName: course.teacher_name || course.teacherName || "Giảng viên",
                  type: isVideo ? "video" : "pdf",
                  fileUrl: fileUrl || "#",
                  fileName: l.fileName || l.file_name || (isVideo ? "Video bài giảng" : "Tài liệu học tập PDF"),
                  date: l.duration || l.created_at ? new Date(l.duration || l.created_at).toLocaleDateString("vi-VN") : "Gần đây",
                  description: l.content || l.description || "Tài liệu học tập chính khóa"
                });
              }
            });
          } catch (_) {}

          // B. Lấy tài liệu bài tập (assignments)
          try {
            const assignmentsRes = await courseService.getAssignmentsByCourse(cId);
            const assignments = Array.isArray(assignmentsRes) ? assignmentsRes : (assignmentsRes?.data || []);

            assignments.forEach((a, idx) => {
              if (a.fileUrl || a.file_url || a.description) {
                allMaterialsList.push({
                  id: `assign-${a.id || idx}`,
                  title: a.title || `Bài tập ${idx + 1}`,
                  courseName: course.title,
                  courseSubject: course.subject || "Chính quy",
                  teacherName: course.teacher_name || course.teacherName || "Giảng viên",
                  type: "assignment",
                  fileUrl: a.fileUrl || a.file_url || "#",
                  fileName: a.fileName || a.file_name || "Đề bài & Hướng dẫn",
                  date: a.dueDate || a.due_date ? new Date(a.dueDate || a.due_date).toLocaleDateString("vi-VN") : "Hạn nộp mở",
                  description: a.description || "Tài liệu và bài tập thực hành"
                });
              }
            });
          } catch (_) {}
        })
      );

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
      const matchSubject = selectedSubject === "all" || item.courseSubject.toLowerCase() === selectedSubject.toLowerCase();

      return matchSearch && matchType && matchSubject;
    });
  }, [materials, searchTerm, selectedType, selectedSubject]);

  // Thống kê phân loại
  const stats = useMemo(() => {
    const pdfCount = materials.filter(m => m.type === "pdf").length;
    const videoCount = materials.filter(m => m.type === "video").length;
    const assignCount = materials.filter(m => m.type === "assignment").length;
    return { pdfCount, videoCount, assignCount, total: materials.length };
  }, [materials]);

  // Danh sách môn học có sẵn
  const availableSubjects = useMemo(() => {
    return Array.from(new Set(courses.map(c => c.subject).filter(Boolean)));
  }, [courses]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 font-sans">
      
      {/* 1. Page Header + Top Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Kho Học Liệu & Thư Viện Bài Giảng</span>
            <span className="px-2.5 py-0.5 text-xs font-black bg-blue-100 text-blue-700 rounded-full">
              {stats.total} Tài nguyên
            </span>
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Tra cứu toàn bộ tài liệu PDF, Slide bài học, video giảng dạy và bài tập từ các khóa học đang tham gia.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchLibraryData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
            title="Làm mới thư viện"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <a
            href="#ai-assistant"
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Trợ Lý Tóm Tắt AI</span>
          </a>
        </div>
      </div>

      {/* 2. Main Grid: Left Content (2/3) + Right Widgets (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Content Generator Banner */}
          <div id="ai-assistant" className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden">
            <div className="space-y-2 max-w-md relative z-10">
              <div className="flex items-center space-x-2 font-extrabold text-base">
                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
                <span>Trợ lý Học Liệu & Hỏi Đáp AI</span>
              </div>
              <p className="text-xs leading-relaxed font-medium text-blue-50">
                Tự động tóm tắt tài liệu PDF dài, giải thích công thức phức tạp và tạo Flashcard ôn thi nhanh chóng từ bài giảng.
              </p>
            </div>

            <button 
              onClick={() => alert("Trợ lý AI đang kết nối vào kho bài giảng của bạn!")}
              className="relative z-10 shrink-0 flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer self-start sm:self-center active:scale-95"
            >
              <span>Học cùng AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Thanh Tìm Kiếm & Bộ Lọc Học Liệu */}
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
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Tabs phân loại tài nguyên */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pt-1">
              {[
                { id: "all", label: `Tất cả (${stats.total})` },
                { id: "pdf", label: `Tài liệu PDF / Slide (${stats.pdfCount})` },
                { id: "video", label: `Video bài giảng (${stats.videoCount})` },
                { id: "assignment", label: `Bài tập & Đề cương (${stats.assignCount})` }
              ].map(tab => (
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

          {/* Danh Sách Tài Liệu / Học Liệu Đang Có */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">Danh Mục Tài Liệu Mở</h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Hiển thị {filteredMaterials.length} tài nguyên
              </span>
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-xs font-medium">Đang tập hợp tài liệu từ các khóa học...</p>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-xs space-y-1">
                <p className="font-bold text-slate-600">Không tìm thấy tài liệu phù hợp.</p>
                <p className="text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc lọc theo bộ môn khác.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMaterials.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-white transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                        item.type === "video" 
                          ? "bg-blue-100 text-blue-600" 
                          : item.type === "assignment"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {item.type === "video" ? <PlayCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-extrabold text-xs text-slate-900 truncate group-hover:text-blue-600 transition">
                            {item.title}
                          </h4>
                          <span className="px-2 py-0.5 bg-slate-200/80 text-slate-700 text-[9px] font-black uppercase rounded">
                            {item.courseSubject}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate">
                          {item.courseName} • GV: {item.teacherName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                        {item.date}
                      </span>

                      {item.fileUrl && item.fileUrl !== "#" && (
                        <>
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                            title="Xem trực tiếp"
                          >
                            <Eye className="w-4 h-4" />
                          </a>

                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                            title="Tải về máy"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1/3): Thống Kê Dung Lượng & Danh Mục */}
        <div className="space-y-6">
          
          {/* Kho Học Liệu Storage Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-900 font-black text-sm">
                <Folder className="w-5 h-5 text-blue-600" />
                <span>Phân Loại Học Liệu</span>
              </div>
              <span className="text-xs font-bold text-slate-400">{stats.total} tệp</span>
            </div>

            {/* Folder Items */}
            <div className="space-y-2.5 pt-1">
              
              {/* Item 1: PDF */}
              <button 
                onClick={() => setSelectedType("pdf")}
                className={`w-full p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer text-left ${
                  selectedType === "pdf" ? "bg-blue-50/70 border-blue-300" : "bg-slate-50/60 border-slate-100 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-500 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-800">Tài liệu PDF & Slide</h5>
                    <p className="text-[10px] text-slate-400 font-medium">{stats.pdfCount} tệp bài giảng</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Item 2: Video */}
              <button 
                onClick={() => setSelectedType("video")}
                className={`w-full p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer text-left ${
                  selectedType === "video" ? "bg-blue-50/70 border-blue-300" : "bg-slate-50/60 border-slate-100 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                    <PlayCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-800">Video Bài Giảng</h5>
                    <p className="text-[10px] text-slate-400 font-medium">{stats.videoCount} video bài học</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Item 3: Bài tập */}
              <button 
                onClick={() => setSelectedType("assignment")}
                className={`w-full p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer text-left ${
                  selectedType === "assignment" ? "bg-blue-50/70 border-blue-300" : "bg-slate-50/60 border-slate-100 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-500 flex items-center justify-center shrink-0">
                    <Box className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-slate-800">Đề Bài & Hướng Dẫn</h5>
                    <p className="text-[10px] text-slate-400 font-medium">{stats.assignCount} tệp thực hành</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

            </div>
          </div>

          {/* Quick Learning Note Widget */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 text-white space-y-3 shadow-md">
            <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Ghi chú học tập thông minh</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              Bạn có thể tải tài liệu về để học ngoại tuyến hoặc sử dụng tính năng xem trực tiếp trên mọi thiết bị.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}