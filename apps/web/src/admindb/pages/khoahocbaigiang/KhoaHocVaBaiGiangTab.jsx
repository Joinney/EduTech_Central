/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import {
  BookOpenCheck,
  Layers,
  Database,
  Globe,
  School,
  Search,
  CheckCircle2,
  Edit3,
  XCircle,
  Eye,
  Trash2,
  Check,
  Clock,
  Video,
  Play,
  X,
  FileText,
  Download,
  BookOpen,
  FolderOpen,
  Paperclip,
} from "lucide-react";
import { formatStatusBadge } from "../../components/lcms/constants";

export default function KhoaHocVaBaiGiangTab({
  courses = [],
  filteredCourses = [],
  externalCourses = [],
  schoolCourses = [],
  subTabContent,
  onSwitchSubTab,
  courseCategoryTab,
  setCourseCategoryTab,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  selectedCourse,
  setSelectedCourse,
  adminNote,
  setAdminNote,
  onUpdateCourseStatus,
}) {
  const baseUrl =
    import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1";

  // ==========================================
  // STATE CHO PHẦN DUYỆT TÀI LIỆU
  // ==========================================
  const [sharedDocs, setSharedDocs] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [docFilter, setDocFilter] = useState("ALL");

  const fetchSharedDocs = async () => {
    setIsLoadingDocs(true);
    try {
      const res = await fetch(`${baseUrl}/shared-documents?all=true`);
      const data = await res.json();
      setSharedDocs(data.data || []);
    } catch (error) {
      console.error("Lỗi lấy tài liệu:", error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // ==========================================
  // STATE CHO PHẦN DUYỆT VIDEO BÀI GIẢNG
  // ==========================================
  const [videos, setVideos] = useState([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [videoFilter, setVideoFilter] = useState("PENDING");
  const [previewingVideo, setPreviewingVideo] = useState(null);

  const fetchVideos = async () => {
    setIsLoadingVideos(true);
    try {
      const res = await fetch(`${baseUrl}/videos?all=true`);
      const data = await res.json();
      setVideos(data.data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách video:", error);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  // ==========================================
  // STATE CHO TAB CẤU TRÚC & HỌC LIỆU
  // ==========================================
  const [selectedCurriculumId, setSelectedCurriculumId] = useState(null);
  const [selectedResourceId, setSelectedResourceId] = useState(null);

  useEffect(() => {
    if (filteredCourses.length > 0) {
      if (!selectedCurriculumId) setSelectedCurriculumId(filteredCourses[0].id);
      if (!selectedResourceId) setSelectedResourceId(filteredCourses[0].id);
    }
  }, [filteredCourses]);

  useEffect(() => {
    if (subTabContent === "doc_approval") {
      fetchSharedDocs();
    } else if (subTabContent === "video_approval") {
      fetchVideos();
    }
  }, [subTabContent]);

  // Lọc tài liệu theo trạng thái
  const filteredDocs = sharedDocs.filter((doc) => {
    if (docFilter === "PENDING") return doc.is_approved === false;
    if (docFilter === "APPROVED") return doc.is_approved === true;
    return true;
  });

  // Lọc video theo trạng thái
  const filteredVideos = videos.filter((vid) => {
    if (videoFilter === "PENDING") return vid.is_approved === false;
    if (videoFilter === "APPROVED") return vid.is_approved === true;
    return true;
  });

  // Xử lý duyệt tài liệu
  const handleApproveDoc = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn phê duyệt tài liệu này?")) return;
    try {
      await fetch(`${baseUrl}/shared-documents/${id}/approve`, {
        method: "PUT",
      });
      fetchSharedDocs();
    } catch (error) {
      alert("Đã xảy ra lỗi khi duyệt tài liệu!");
    }
  };

  // Xử lý xóa tài liệu
  const handleDeleteDoc = async (id) => {
    if (!window.confirm("Tài liệu này sẽ bị xóa vĩnh viễn. Bạn chắc chắn chứ?"))
      return;
    try {
      await fetch(`${baseUrl}/shared-documents/${id}`, { method: "DELETE" });
      fetchSharedDocs();
    } catch (error) {
      alert("Đã xảy ra lỗi khi xóa tài liệu!");
    }
  };

  // Xử lý duyệt Video
  const handleApproveVideo = async (id) => {
    if (
      !window.confirm(
        "Phê duyệt video này? Video sẽ xuất hiện ngay trên trang Video Edu của học sinh.",
      )
    )
      return;
    try {
      const res = await fetch(`${baseUrl}/videos/${id}/approve`, {
        method: "PUT",
      });
      if (res.ok) {
        fetchVideos();
      } else {
        alert("Lỗi khi duyệt video!");
      }
    } catch (error) {
      alert("Đã xảy ra lỗi kết nối khi duyệt video!");
    }
  };

  // Xử lý xóa Video
  const handleDeleteVideo = async (id) => {
    if (!window.confirm("Xóa video bài giảng này vĩnh viễn?")) return;
    try {
      const res = await fetch(`${baseUrl}/videos/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchVideos();
      } else {
        alert("Lỗi khi xóa video!");
      }
    } catch (error) {
      alert("Đã xảy ra lỗi kết nối khi xóa video!");
    }
  };

  const activeCurriculumCourse =
    filteredCourses.find((c) => c.id === selectedCurriculumId) ||
    filteredCourses[0];

  const activeResourceCourse =
    filteredCourses.find((c) => c.id === selectedResourceId) ||
    filteredCourses[0];

  return (
    <div className="space-y-4 animate-fadeIn font-sans">
      {/* Sub-tabs điều hướng */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          {
            id: "course_list",
            label: `Danh sách khóa & Lớp (${courses.length})`,
            icon: BookOpenCheck,
          },
          {
            id: "curriculum",
            label: "Cấu trúc bài giảng chi tiết",
            icon: Layers,
          },
          {
            id: "resources",
            label: "Kho học liệu & Tệp đính kèm",
            icon: Database,
          },
          {
            id: "doc_approval",
            label: "Kiểm duyệt tài liệu",
            icon: CheckCircle2,
          },
          {
            id: "video_approval",
            label: `Kiểm duyệt Video Edu (${videos.filter((v) => !v.is_approved).length} chờ)`,
            icon: Video,
          },
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => onSwitchSubTab(st.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              subTabContent === st.id
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <st.icon className="w-4 h-4" />
            <span>{st.label}</span>
          </button>
        ))}
      </div>

      {/* THANH LỌC CHUNG CHO CÁC TAB KHÓA HỌC */}
      {(subTabContent === "course_list" ||
        subTabContent === "curriculum" ||
        subTabContent === "resources") && (
        <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
          <div className="flex items-center space-x-1.5 w-full sm:w-auto">
            <button
              onClick={() => {
                setCourseCategoryTab("external");
                setStatusFilter("ALL");
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                courseCategoryTab === "external"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Khóa Kỹ Năng / Tự Do ({externalCourses.length})</span>
            </button>

            <button
              onClick={() => {
                setCourseCategoryTab("school");
                setStatusFilter("ALL");
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                courseCategoryTab === "school"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <School className="w-4 h-4" />
              <span>Lớp Trường Học Chính Quy ({schoolCourses.length})</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo tên khóa, mã lớp, trường..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>

            {subTabContent === "course_list" &&
              courseCategoryTab === "external" && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ kiểm duyệt (PENDING)</option>
                  <option value="APPROVED">Đã phê duyệt (APPROVED)</option>
                  <option value="NEEDS_REVISION">Yêu cầu chỉnh sửa</option>
                  <option value="REJECTED">Bị từ chối</option>
                </select>
              )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 1: DANH SÁCH KHÓA HỌC */}
      {/* ========================================== */}
      {subTabContent === "course_list" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div
            className={`${courseCategoryTab === "external" ? "xl:col-span-8" : "xl:col-span-12"} space-y-3`}
          >
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Mã / Tên Khóa Học</th>
                    <th className="p-3.5">Giảng Viên</th>
                    <th className="p-3.5">Đơn Vị / Trường</th>
                    <th className="p-3.5">Nội Dung</th>
                    <th className="p-3.5">Trạng Thái</th>
                    <th className="p-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredCourses.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCourse(c)}
                      className={`cursor-pointer transition-colors ${
                        selectedCourse?.id === c.id
                          ? "bg-orange-50/60"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="p-3.5">
                        <span className="font-mono text-[10px] text-orange-600 font-bold block">
                          {c.code}
                        </span>
                        <span className="font-bold text-slate-900">
                          {c.title}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">
                        {c.teacher_name || c.teacherName || "Chưa phân công"}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {c.schoolName || "EduTech"}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {c.lessons?.length || 0} bài •{" "}
                        {c.assignments?.length || 0} bài tập •{" "}
                        {c.quizzes?.length || 0} thi
                      </td>
                      <td className="p-3.5">
                        {formatStatusBadge(c.status || "APPROVED", c.type)}
                      </td>
                      <td className="p-3.5 text-right">
                        {c.type === "school" ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateCourseStatus(
                                c.id,
                                c.status === "APPROVED" ? "PAUSED" : "APPROVED",
                              );
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                          >
                            {c.status === "APPROVED" ? "Tạm Đóng" : "Mở Lại"}
                          </button>
                        ) : (
                          <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 cursor-pointer">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredCourses.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-slate-400"
                      >
                        Không tìm thấy khóa học nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {courseCategoryTab === "external" && (
            <div className="xl:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              {selectedCourse ? (
                <>
                  <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                    <span>Kiểm Duyệt Khóa Tự Do</span>
                    <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold font-mono uppercase">
                      {selectedCourse.code}
                    </span>
                  </h3>
                  <div className="space-y-2">
                    <p className="text-slate-500">
                      Khóa học:{" "}
                      <strong className="text-slate-900">
                        {selectedCourse.title}
                      </strong>
                    </p>
                    <p className="text-slate-500">
                      Giảng viên:{" "}
                      <strong className="text-slate-800">
                        {selectedCourse.teacher_name ||
                          selectedCourse.teacherName ||
                          "Chưa gán"}
                      </strong>
                    </p>
                    <p className="text-slate-500">
                      Chuyên đề:{" "}
                      <strong className="text-slate-800">
                        {selectedCourse.subject}
                      </strong>
                    </p>
                    <p className="text-slate-500">
                      Đơn vị:{" "}
                      <strong className="text-slate-800">
                        {selectedCourse.schoolName}
                      </strong>
                    </p>
                    <div className="flex items-center space-x-2 pt-1">
                      <span className="text-slate-500">Trạng thái:</span>
                      {formatStatusBadge(
                        selectedCourse.status || "APPROVED",
                        selectedCourse.type,
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <span className="font-bold text-slate-700 block uppercase text-[10px]">
                      Ý kiến / Ghi chú phản hồi đến Giảng viên
                    </span>
                    <textarea
                      rows="3"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Nhập lý do phê duyệt, từ chối hoặc yêu cầu sửa đổi..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs resize-none outline-none focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() =>
                        onUpdateCourseStatus(selectedCourse.id, "APPROVED")
                      }
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Phê Duyệt Khóa Học (APPROVED)</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() =>
                          onUpdateCourseStatus(
                            selectedCourse.id,
                            "NEEDS_REVISION",
                          )
                        }
                        className="py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl border border-amber-200 flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Yêu Cầu Sửa</span>
                      </button>
                      <button
                        onClick={() =>
                          onUpdateCourseStatus(selectedCourse.id, "REJECTED")
                        }
                        className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Từ Chối</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-slate-400 py-8">
                  Chọn một khóa học bên trái để kiểm duyệt.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: CẤU TRÚC BÀI GIẢNG CHI TIẾT (ĐÃ KHÔI PHỤC) */}
      {/* ========================================== */}
      {subTabContent === "curriculum" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Cột trái: Chọn khóa học */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <BookOpen className="w-4 h-4 text-orange-600" />
              <span>Chọn Khóa Học ({filteredCourses.length})</span>
            </h4>
            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredCourses.map((c) => {
                const isSelected =
                  (activeCurriculumCourse?.id || "") === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCurriculumId(c.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-orange-50/80 border-orange-300 shadow-2xs"
                        : "bg-slate-50/50 hover:bg-slate-100/80 border-slate-200/70"
                    }`}
                  >
                    <span className="font-mono text-[10px] text-orange-600 font-bold block">
                      {c.code}
                    </span>
                    <h5 className="font-bold text-xs text-slate-900 line-clamp-1">
                      {c.title}
                    </h5>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>
                        {c.teacher_name || c.teacherName || "Giảng viên"}
                      </span>
                      <span className="font-semibold text-slate-600">
                        {c.lessons?.length || 0} bài học
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Hiển thị các bài học */}
          <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            {activeCurriculumCourse ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-orange-600">
                      {activeCurriculumCourse.code} •{" "}
                      {activeCurriculumCourse.subject || "Chuyên đề"}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 mt-0.5">
                      {activeCurriculumCourse.title}
                    </h3>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold self-start">
                    Tổng: {activeCurriculumCourse.lessons?.length || 0} bài học
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeCurriculumCourse.lessons &&
                  activeCurriculumCourse.lessons.length > 0 ? (
                    activeCurriculumCourse.lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id || idx}
                        className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 hover:border-orange-200 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-slate-900 truncate">
                              {lesson.title}
                            </h5>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {lesson.description ||
                                "Nội dung bài học chuẩn định dạng LCMS"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {lesson.video_url && (
                            <span className="p-1 px-2 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold flex items-center gap-1">
                              <Video className="w-3 h-3" /> Video
                            </span>
                          )}
                          {lesson.document_url && (
                            <span className="p-1 px-2 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold flex items-center gap-1">
                              <FileText className="w-3 h-3" /> PDF
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Khóa học này hiện chưa có bài học nào được tạo.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Vui lòng chọn khóa học để xem cấu trúc bài giảng.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: KHO HỌC LIỆU & TỆP ĐÍNH KÈM (ĐÃ KHÔI PHỤC) */}
      {/* ========================================== */}
      {subTabContent === "resources" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Cột trái: Chọn khóa học */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FolderOpen className="w-4 h-4 text-orange-600" />
              <span>Khóa Học & Tài Nguyên ({filteredCourses.length})</span>
            </h4>
            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredCourses.map((c) => {
                const isSelected =
                  (activeResourceCourse?.id || "") === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedResourceId(c.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-orange-50/80 border-orange-300 shadow-2xs"
                        : "bg-slate-50/50 hover:bg-slate-100/80 border-slate-200/70"
                    }`}
                  >
                    <span className="font-mono text-[10px] text-orange-600 font-bold block">
                      {c.code}
                    </span>
                    <h5 className="font-bold text-xs text-slate-900 line-clamp-1">
                      {c.title}
                    </h5>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{c.schoolName || "EduTech"}</span>
                      <span className="font-semibold text-slate-600">
                        {c.resources?.length || 0} tệp
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Danh sách tệp đính kèm */}
          <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            {activeResourceCourse ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-orange-600">
                      Tệp đính kèm bài giảng
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 mt-0.5">
                      {activeResourceCourse.title}
                    </h3>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold self-start">
                    {activeResourceCourse.resources?.length || 0} tài liệu đính
                    kèm
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activeResourceCourse.resources &&
                  activeResourceCourse.resources.length > 0 ? (
                    activeResourceCourse.resources.map((res, idx) => (
                      <div
                        key={res.id || idx}
                        className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 hover:border-orange-200 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                            <Paperclip className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-slate-900 truncate">
                              {res.name ||
                                res.title ||
                                `Tài liệu bài học #${idx + 1}`}
                            </h5>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {res.file_size || "Tài liệu học tập chính quy"}
                            </span>
                          </div>
                        </div>

                        {res.file_url && (
                          <a
                            href={res.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white border border-slate-200 hover:bg-orange-50 hover:text-orange-600 rounded-lg text-slate-600 transition cursor-pointer"
                            title="Tải xuống tài liệu"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Khóa học này chưa được giảng viên đính kèm thêm tài nguyên
                      nào.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Vui lòng chọn khóa học để xem tài nguyên.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: QUẢN LÝ TÀI LIỆU CỘNG ĐỒNG */}
      {/* ========================================== */}
      {subTabContent === "doc_approval" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Kiểm duyệt Tài liệu Cộng đồng
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tài liệu học sinh tải lên cần được phê duyệt trước khi công khai.
              </p>
            </div>
            <select
              value={docFilter}
              onChange={(e) => setDocFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="PENDING">🔴 Chờ kiểm duyệt</option>
              <option value="APPROVED">🟢 Đã phê duyệt</option>
              <option value="ALL">📋 Tất cả tài liệu</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Tên Tài Liệu</th>
                  <th className="p-4">Môn Học / Danh mục</th>
                  <th className="p-4">Người Đăng</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {isLoadingDocs ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Không có tài liệu nào trong danh sách này.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4">
                        <span className="font-bold text-slate-900">
                          {doc.title}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(doc.created_at).toLocaleString("vi-VN")}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="block text-slate-800">
                          {doc.subject}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {doc.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-blue-600">
                          {doc.student_name}
                        </span>
                      </td>
                      <td className="p-4">
                        {doc.is_approved ? (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold">
                            Đã Duyệt
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-md text-[10px] font-bold">
                            Chờ Duyệt
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="Xem trước tài liệu"
                          >
                            <Eye className="w-4 h-4" />
                          </a>

                          {!doc.is_approved && (
                            <button
                              onClick={() => handleApproveDoc(doc.id)}
                              className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                              title="Phê duyệt"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-colors cursor-pointer"
                            title="Xóa/Từ chối"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 5: KIỂM DUYỆT VIDEO EDU BÀI GIẢNG */}
      {/* ========================================== */}
      {subTabContent === "video_approval" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-orange-600" />
                Kiểm duyệt Video Bài giảng Giảng viên
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Các video do giảng viên tải lên qua Cloudinary cần được duyệt
                trước khi xuất hiện trên portal học viên.
              </p>
            </div>
            <select
              value={videoFilter}
              onChange={(e) => setVideoFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="PENDING">🔴 Chờ kiểm duyệt</option>
              <option value="APPROVED">🟢 Đã phê duyệt</option>
              <option value="ALL">📋 Tất cả video</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Thumbnail / Tiêu đề Video</th>
                  <th className="p-4">Môn Học</th>
                  <th className="p-4">Giảng Viên Đăng</th>
                  <th className="p-4">Thời Lượng</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {isLoadingVideos ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Đang tải danh sách video bài giảng...
                    </td>
                  </tr>
                ) : filteredVideos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Không có video nào trong danh sách này.
                    </td>
                  </tr>
                ) : (
                  filteredVideos.map((vid) => (
                    <tr
                      key={vid.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setPreviewingVideo(vid)}
                            className="relative w-20 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0 cursor-pointer group"
                          >
                            <img
                              src={
                                vid.thumbnail_url ||
                                "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&q=80"
                              }
                              alt={vid.title}
                              className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition">
                              <Play className="w-4 h-4 text-white fill-white" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate max-w-xs md:max-w-md">
                              {vid.title}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block truncate max-w-xs">
                              {vid.description || "Không có mô tả"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-700 font-bold rounded text-[11px] border border-orange-100">
                          {vid.subject || "Chung"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-slate-800 block">
                          {vid.teacher_name || "Giảng viên"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ID: #{vid.teacher_id}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-mono text-[11px]">
                        {vid.duration || "15:00"}
                      </td>
                      <td className="p-4">
                        {vid.is_approved ? (
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold">
                            Đã Duyệt
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-md text-[10px] font-bold">
                            Chờ Duyệt
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setPreviewingVideo(vid)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="Xem video"
                          >
                            <Play className="w-4 h-4" />
                          </button>

                          {!vid.is_approved && (
                            <button
                              onClick={() => handleApproveVideo(vid.id)}
                              className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors cursor-pointer"
                              title="Phê duyệt video"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteVideo(vid.id)}
                            className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg transition-colors cursor-pointer"
                            title="Xóa/Từ chối"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POPUP XEM TRƯỚC VIDEO (MODAL PREVIEW) */}
      {previewingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full border border-slate-700 flex flex-col">
            <div className="px-5 py-3.5 bg-slate-950 flex items-center justify-between border-b border-slate-800 text-white">
              <div className="truncate pr-4">
                <span className="text-[10px] uppercase font-bold text-orange-400 block">
                  {previewingVideo.subject} • {previewingVideo.teacher_name}
                </span>
                <h4 className="text-sm font-black truncate">
                  {previewingVideo.title}
                </h4>
              </div>
              <button
                onClick={() => setPreviewingVideo(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black flex items-center justify-center">
              <video
                src={previewingVideo.video_url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-4 bg-slate-900 flex items-center justify-between gap-3 text-xs text-slate-300">
              <p className="line-clamp-2 text-slate-400 flex-1">
                {previewingVideo.description || "Không có mô tả chi tiết."}
              </p>
              {!previewingVideo.is_approved && (
                <button
                  onClick={() => {
                    handleApproveVideo(previewingVideo.id);
                    setPreviewingVideo(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Duyệt Video Này</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}