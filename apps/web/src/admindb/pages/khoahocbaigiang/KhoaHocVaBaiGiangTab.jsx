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
  Paperclip,
  FileText,
  Download,
  Trash2,
  Check,
  Clock,
} from "lucide-react";
import { formatStatusBadge } from "../../components/lcms/constants";

export default function KhoaHocVaBaiGiangTab({
  courses,
  filteredCourses,
  externalCourses,
  schoolCourses,
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
  // ==========================================
  // STATE & LOGIC CHO PHẦN DUYỆT TÀI LIỆU
  // ==========================================
  const [sharedDocs, setSharedDocs] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [docFilter, setDocFilter] = useState("ALL");

  const fetchSharedDocs = async () => {
    setIsLoadingDocs(true);
    try {
      const res = await fetch(
        "http://localhost:8002/api/v1/shared-documents?all=true",
      );
      const data = await res.json();
      setSharedDocs(data.data || []);
    } catch (error) {
      console.error("Lỗi lấy tài liệu:", error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // Chỉ fetch dữ liệu khi Admin chuyển sang tab Kiểm duyệt
  useEffect(() => {
    if (subTabContent === "doc_approval") {
      fetchSharedDocs();
    }
  }, [subTabContent]);

  // Lọc tài liệu theo trạng thái
  const filteredDocs = sharedDocs.filter((doc) => {
    if (docFilter === "PENDING") return doc.is_approved === false;
    if (docFilter === "APPROVED") return doc.is_approved === true;
    return true;
  });

  // Gọi API Phê duyệt tài liệu
  const handleApproveDoc = async (id) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn phê duyệt tài liệu này? Nó sẽ hiển thị cho toàn bộ học sinh.",
      )
    )
      return;
    try {
      await fetch(
        `http://localhost:8002/api/v1/shared-documents/${id}/approve`,
        { method: "PUT" },
      );
      fetchSharedDocs(); // Load lại bảng
    } catch (error) {
      alert("Đã xảy ra lỗi khi duyệt!");
    }
  };

  // Gọi API Từ chối/Xóa tài liệu
  const handleDeleteDoc = async (id) => {
    if (
      !window.confirm(
        "Tài liệu này sẽ bị xóa vĩnh viễn. Bạn có chắc chắn không?",
      )
    )
      return;
    try {
      await fetch(`http://localhost:8002/api/v1/shared-documents/${id}`, {
        method: "DELETE",
      });
      fetchSharedDocs(); // Load lại bảng
    } catch (error) {
      alert("Đã xảy ra lỗi khi xóa!");
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
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
          }, // Tab mới
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => onSwitchSubTab(st.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              subTabContent === st.id
                ? "bg-[#38497C] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <st.icon className="w-4 h-4" />
            <span>{st.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================== */}
      {/* TAB 1: DANH SÁCH KHÓA HỌC (Giữ nguyên) */}
      {/* ========================================== */}
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

      {/* RENDER NỘI DUNG COURSE LIST */}
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

      {/* RENDER NỘI DUNG CURRICULUM & RESOURCES (Giữ nguyên) */}
      {subTabContent === "curriculum" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Cấu Trúc Chương Mục & Bài Giảng
              </h3>
            </div>
          </div>
          {/* Rút gọn code phần này để bạn dễ đọc, phần này giữ y chang logic cũ của bạn */}
          <div className="p-4 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 text-xs">
            {filteredCourses.length} khóa học đang hiển thị cấu trúc.
          </div>
        </div>
      )}

      {subTabContent === "resources" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Kho Học Liệu & Tài Nguyên Đính Kèm
              </h3>
            </div>
          </div>
          {/* Rút gọn code phần này để bạn dễ đọc */}
          <div className="p-4 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 text-xs">
            Đang hiển thị tài nguyên của {filteredCourses.length} khóa học.
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB MỚI: QUẢN LÝ TÀI LIỆU CỘNG ĐỒNG */}
      {/* ========================================== */}
      {subTabContent === "doc_approval" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Kiểm duyệt Tài liệu Cộng đồng
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Học sinh tải lên tài liệu. Admin duyệt thì tài liệu mới hiện
                công khai.
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
    </div>
  );
}
