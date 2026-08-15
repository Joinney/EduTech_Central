/* eslint-disable react/prop-types */
import React from "react";
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
  Download
} from "lucide-react";
import { formatStatusBadge } from "../constants";

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
  onUpdateCourseStatus
}) {
  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Sub-tabs điều hướng */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        {[
          { id: "course_list", label: `Danh sách khóa & Lớp (${courses.length})`, icon: BookOpenCheck },
          { id: "curriculum", label: "Cấu trúc bài giảng chi tiết", icon: Layers },
          { id: "resources", label: "Kho học liệu & Tệp đính kèm", icon: Database }
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => onSwitchSubTab(st.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

      {/* Switch Phân Loại Lớp Học */}
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
            <span>Khóa Kỹ Năng / Tự Do - Cần Duyệt ({externalCourses.length})</span>
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

          {subTabContent === "course_list" && courseCategoryTab === "external" && (
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

      {/* Sub-tab 1: Danh sách khóa học & Lớp */}
      {subTabContent === "course_list" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className={`${courseCategoryTab === "external" ? "xl:col-span-8" : "xl:col-span-12"} space-y-3`}>
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
                        selectedCourse?.id === c.id ? "bg-orange-50/60" : "hover:bg-slate-50"
                      }`}
                    >
                      <td className="p-3.5">
                        <span className="font-mono text-[10px] text-orange-600 font-bold block">{c.code}</span>
                        <span className="font-bold text-slate-900">{c.title}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">{c.teacher_name || c.teacherName || "Chưa phân công"}</td>
                      <td className="p-3.5 text-slate-500">{c.schoolName || "EduTech"}</td>
                      <td className="p-3.5 text-slate-500">
                        {c.lessons?.length || 0} bài • {c.assignments?.length || 0} bài tập • {c.quizzes?.length || 0} thi
                      </td>
                      <td className="p-3.5">{formatStatusBadge(c.status || "APPROVED", c.type)}</td>
                      <td className="p-3.5 text-right">
                        {c.type === "school" ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateCourseStatus(c.id, c.status === "APPROVED" ? "PAUSED" : "APPROVED");
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
                      <td colSpan={6} className="p-8 text-center text-slate-400">Không tìm thấy khóa học nào phù hợp.</td>
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
                    <p className="text-slate-500">Khóa học: <strong className="text-slate-900">{selectedCourse.title}</strong></p>
                    <p className="text-slate-500">Giảng viên: <strong className="text-slate-800">{selectedCourse.teacher_name || selectedCourse.teacherName || "Chưa gán"}</strong></p>
                    <p className="text-slate-500">Chuyên đề: <strong className="text-slate-800">{selectedCourse.subject}</strong></p>
                    <p className="text-slate-500">Đơn vị: <strong className="text-slate-800">{selectedCourse.schoolName}</strong></p>
                    <div className="flex items-center space-x-2 pt-1">
                      <span className="text-slate-500">Trạng thái:</span>
                      {formatStatusBadge(selectedCourse.status || "APPROVED", selectedCourse.type)}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <span className="font-bold text-slate-700 block uppercase text-[10px]">Ý kiến / Ghi chú phản hồi đến Giảng viên</span>
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
                      onClick={() => onUpdateCourseStatus(selectedCourse.id, "APPROVED")}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Phê Duyệt Khóa Học (APPROVED)</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onUpdateCourseStatus(selectedCourse.id, "NEEDS_REVISION")}
                        className="py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl border border-amber-200 flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Yêu Cầu Sửa</span>
                      </button>
                      <button
                        onClick={() => onUpdateCourseStatus(selectedCourse.id, "REJECTED")}
                        className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Từ Chối</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-slate-400 py-8">Chọn một khóa học bên trái để kiểm duyệt.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 2: Cấu trúc bài giảng */}
      {subTabContent === "curriculum" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Cấu Trúc Chương Mục & Bài Giảng:{" "}
                <span className={courseCategoryTab === "external" ? "text-orange-600" : "text-blue-600"}>
                  {courseCategoryTab === "external" ? "Khóa Kỹ Năng / Tự Do" : "Lớp Trường Học Chính Quy"}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Hiển thị toàn bộ cây bài học theo từng lớp được đăng tải trong hệ thống.</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-xl">Tổng: {filteredCourses.length} Lớp</span>
          </div>

          <div className="space-y-3">
            {filteredCourses.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-orange-600 px-2 py-0.5 bg-orange-50 rounded-md">{c.code}</span>
                      <h4 className="font-extrabold text-sm text-slate-900">{c.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Đơn vị: <strong>{c.schoolName}</strong> • Giảng viên: <strong>{c.teacher_name || c.teacherName || "Chưa gán"}</strong>
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 shrink-0">
                    {c.lessons?.length || 0} Bài Giảng
                  </span>
                </div>

                {(c.lessons || []).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {c.lessons.map((l, i) => (
                      <div
                        key={l.id}
                        className="p-3 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl flex items-center justify-between transition-colors text-xs"
                      >
                        <div className="flex items-center space-x-2.5 truncate pr-2">
                          <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <div className="truncate">
                            <h5 className="font-bold text-slate-900 truncate">{l.title}</h5>
                            <span className="text-[10px] text-slate-400">Thời lượng: {l.duration || "30 phút"}</span>
                          </div>
                        </div>
                        {(l.fileUrl || l.file_url) && (
                          <span className="p-1 text-blue-600 bg-blue-50 rounded" title="Có tệp tài liệu">
                            <Paperclip className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl text-xs">Chưa có bài giảng nào trong lớp này.</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tab 3: Kho tài nguyên & Học liệu */}
      {subTabContent === "resources" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Kho Học Liệu & Tài Nguyên Đính Kèm:{" "}
                <span className={courseCategoryTab === "external" ? "text-orange-600" : "text-blue-600"}>
                  {courseCategoryTab === "external" ? "Khóa Kỹ Năng / Tự Do" : "Lớp Trường Học Chính Quy"}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Tài liệu, Slide bài giảng, Đề bài tập và Đề thi trắc nghiệm gom nhóm theo từng lớp.</p>
            </div>
          </div>

          <div className="space-y-4">
            {filteredCourses.map((c) => {
              const lessonFiles = (c.lessons || []).filter((l) => l.fileUrl || l.file_url).map((l) => ({
                type: "Bài Giảng",
                title: l.title,
                fileName: l.fileName || l.file_name || l.title,
                fileUrl: l.fileUrl || l.file_url,
                color: "blue"
              }));

              const assignmentFiles = (c.assignments || []).filter((a) => a.fileUrl || a.file_url).map((a) => ({
                type: "Đề Bài Tập",
                title: a.title,
                fileName: a.fileName || a.file_name || a.title,
                fileUrl: a.fileUrl || a.file_url,
                color: "orange"
              }));

              const quizFiles = (c.quizzes || []).filter((q) => q.fileUrl || q.file_url).map((q) => ({
                type: "Đề Kiểm Tra",
                title: q.title,
                fileName: q.fileName || q.file_name || q.title,
                fileUrl: q.fileUrl || q.file_url,
                color: "rose"
              }));

              const allClassFiles = [...lessonFiles, ...assignmentFiles, ...quizFiles];

              return (
                <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold text-orange-600 px-2 py-0.5 bg-orange-50 rounded-md">{c.code}</span>
                      <h4 className="font-extrabold text-sm text-slate-900">{c.title}</h4>
                      <span className="text-[11px] text-slate-400">({c.schoolName})</span>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      {allClassFiles.length} Tệp Tài Liệu
                    </span>
                  </div>

                  {allClassFiles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {allClassFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/80 rounded-xl flex items-center justify-between transition-all"
                        >
                          <div className="flex items-start space-x-2.5 truncate pr-2">
                            <div
                              className={`p-2 rounded-lg shrink-0 ${
                                file.color === "blue"
                                  ? "bg-blue-100 text-blue-700"
                                  : file.color === "orange"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate text-xs">
                              <h5 className="font-bold text-slate-900 truncate">{file.fileName}</h5>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                Loại: <span className="font-semibold">{file.type}</span> • Thuộc: {file.title}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                              title="Xem trực tiếp"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              title="Tải về máy"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl text-xs">Lớp này hiện chưa có tệp tài liệu nào được đính kèm.</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}