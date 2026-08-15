/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  School,
  Calendar,
  UserCheck,
  AlertCircle,
  Clock,
  BookOpen,
  Users,
  Sparkles,
  CheckCircle2,
  Loader2,
  Building2,
  GraduationCap,
  Layers,
  Mail,
  Award,
  ChevronDown,
  ShieldCheck,
  Briefcase
} from "lucide-react";
import { SCHOOL_OPTIONS, SUBJECT_OPTIONS } from "../components/lcms/constants";
import { courseApi } from "../../api/axios";
import { courseService } from "../../api/course.api";

const TIME_SLOTS = [
  "Tiết 1 - 3 (07:30 - 09:45)",
  "Tiết 4 - 6 (10:00 - 12:15)",
  "Tiết 7 - 9 (13:30 - 15:45)",
  "Tiết 10 - 12 (16:00 - 18:15)",
  "Ca Tối (19:30 - 21:00)"
];

const DAYS_OF_WEEK = [
  "Thứ 2, Thứ 4, Thứ 6",
  "Thứ 3, Thứ 5, Thứ 7",
  "Thứ 2, Thứ 5",
  "Thứ 3, Thứ 6",
  "Thứ 7, Chủ Nhật"
];

const PRESET_THUMBNAILS = [
  { id: 1, label: "Khoa học Tự nhiên", url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop" },
  { id: 2, label: "Toán & Thống kê", url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop" },
  { id: 3, label: "Ngoại ngữ & Văn học", url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop" },
  { id: 4, label: "Tin học & Lập trình", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop" }
];

export default function AdminCreateSchoolCourse() {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [qualifiedTeachers, setQualifiedTeachers] = useState([]);
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "Toán Học 12A1 - Ôn Thi THPT Quốc Gia",
    subject: "Toán Học",
    schoolName: "THPT Chuyên Lê Hồng Phong (TP.HCM)",
    grade: "Lớp 12",
    teacher_id: 1,
    teacher_name: "Thầy Phan Thuận",
    maxStudents: 45,
    days_of_week: "Thứ 2, Thứ 4, Thứ 6",
    time_slot: "Tiết 1 - 3 (07:30 - 09:45)",
    thumbnail: PRESET_THUMBNAILS[1].url,
    description: "Chương trình đào tạo chính quy theo chuẩn Bộ GD&ĐT kết hợp luyện đề nâng cao."
  });

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsTeacherDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tự động quét giáo viên chuyên môn & kiểm tra lịch bận/rảnh
  const fetchQualifiedTeachers = async (subject, days, slot) => {
    try {
      setIsLoadingTeachers(true);
      const res = await courseApi.get("/teachers/qualified", {
        params: {
          subject: subject,
          day_of_week: days,
          time_slot: slot
        }
      });
      const list = res.data?.data || [];
      setQualifiedTeachers(list);

      if (list.length > 0) {
        const currentValid = list.find((t) => t.teacher_id === Number(formData.teacher_id));
        if (!currentValid) {
          setFormData((prev) => ({
            ...prev,
            teacher_id: list[0].teacher_id,
            teacher_name: list[0].teacher_name
          }));
        }
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách giáo viên:", err);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  useEffect(() => {
    fetchQualifiedTeachers(formData.subject, formData.days_of_week, formData.time_slot);
  }, [formData.subject, formData.days_of_week, formData.time_slot]);

  // Thông tin chi tiết giáo viên đang được chọn
  const selectedTeacher = qualifiedTeachers.find((t) => t.teacher_id === Number(formData.teacher_id));
  const isTeacherConflicted = selectedTeacher ? !selectedTeacher.is_available : false;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isTeacherConflicted) {
      alert(`⚠️ ${selectedTeacher.conflictMsg || "Giáo viên đã bị trùng lịch dạy!"} Vui lòng chọn giáo viên khác hoặc đổi khung giờ.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const scheduleString = `${formData.days_of_week} • ${formData.time_slot}`;

      const payload = {
        teacher_id: Number(formData.teacher_id),
        teacher_name: formData.teacher_name,
        type: "school",
        title: formData.title,
        code: `EDU-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        subject: formData.subject,
        schoolName: formData.schoolName,
        grade: formData.grade,
        maxStudents: Number(formData.maxStudents) || 45,
        schedule: scheduleString,
        days_of_week: formData.days_of_week,
        time_slot: formData.time_slot,
        thumbnail: formData.thumbnail,
        description: formData.description,
        status: "APPROVED",
        is_published: true
      };

      await courseService.createCourse(payload);
      alert("🎉 Bổ nhiệm giáo viên và tạo lớp chính quy thành công!");
      navigate("/admin/courses?tab=content&sub=course_list");
    } catch (err) {
      console.error("Lỗi tạo lớp chính quy:", err);
      alert(err.response?.data?.error || "Lỗi khi tạo lớp học chính quy!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen font-sans space-y-6 animate-fadeIn">
      {/* Header điều hướng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => navigate("/admin/courses")}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-slate-600 transition-all cursor-pointer"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">
              <School className="w-4 h-4" />
              <span>Phân Hệ Quản Trị Đào Tạo Chính Quy</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Khởi Tạo Lớp & Bổ Nhiệm Giảng Viên
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => navigate("/admin/courses")}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isTeacherConflicted || qualifiedTeachers.length === 0}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl text-white shadow-md transition-all flex items-center space-x-1.5 cursor-pointer ${
              isTeacherConflicted || qualifiedTeachers.length === 0
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 active:scale-95"
            }`}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isSubmitting ? "Đang xử lý..." : "Xác Nhận & Cấp Lớp"}</span>
          </button>
        </div>
      </div>

      {/* Bố cục 2 Cột */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI: FORM CẤU HÌNH (8 Cột) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 xl:col-span-8 space-y-5">
          {/* 1. Thông tin lớp học */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>1. Thông Tin Lớp Học & Đơn Vị Đào Tạo</span>
            </h3>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Tên Lớp Học Chính Quy *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="VD: Toán Học 12A1 / Hóa Học 10C2..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Trường Học / Cơ Sở *
                </label>
                <select
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {SCHOOL_OPTIONS.map((sch, i) => (
                    <option key={i} value={sch}>{sch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Môn Học / Chuyên Môn *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-800 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {SUBJECT_OPTIONS.map((sub, i) => (
                    <option key={i} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Khối Lớp
                </label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="VD: Lớp 12 / Khối 10"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Sĩ Số Tối Đa
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Lịch dạy & Bổ nhiệm Giáo viên (Custom Dropdown + Profile Card) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>2. Thời Khóa Biểu & Bổ Nhiệm Giảng Viên</span>
            </h3>

            {/* Khung giờ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Ngày Học Trong Tuần *
                </label>
                <select
                  value={formData.days_of_week}
                  onChange={(e) => setFormData({ ...formData, days_of_week: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {DAYS_OF_WEEK.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Khung Giờ / Ca Học *
                </label>
                <select
                  value={formData.time_slot}
                  onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {TIME_SLOTS.map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bổ nhiệm Giáo viên (Custom Dropdown kèm Avatar) */}
            <div className="space-y-3" ref={dropdownRef}>
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Chọn Giảng Viên Phụ Trách Môn {formData.subject} *</span>
                </label>
                {isLoadingTeachers && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />}
              </div>

              {qualifiedTeachers.length > 0 ? (
                <div className="relative">
                  {/* Nút trigger dropdown */}
                  <button
                    type="button"
                    onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
                    className={`w-full p-3 bg-white border-2 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      isTeacherConflicted
                        ? "border-rose-300 bg-rose-50/50"
                        : "border-slate-200 hover:border-blue-500 focus:border-blue-600 shadow-sm"
                    }`}
                  >
                    {selectedTeacher ? (
                      <div className="flex items-center space-x-3 truncate">
                        <img
                          src={selectedTeacher.avatar}
                          alt={selectedTeacher.teacher_name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="truncate text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900">{selectedTeacher.teacher_name}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                selectedTeacher.is_available
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {selectedTeacher.is_available ? "🟢 Trống lịch" : "🔴 Trùng lịch"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{selectedTeacher.email || "Giảng viên cơ hữu"}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">Chọn giảng viên...</span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isTeacherDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Menu danh sách giảng viên */}
                  {isTeacherDropdownOpen && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-100">
                      {qualifiedTeachers.map((t) => (
                        <div
                          key={t.teacher_id}
                          onClick={() => {
                            setFormData({
                              ...formData,
                              teacher_id: t.teacher_id,
                              teacher_name: t.teacher_name
                            });
                            setIsTeacherDropdownOpen(false);
                          }}
                          className={`p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${
                            t.teacher_id === Number(formData.teacher_id) ? "bg-blue-50/70" : ""
                          }`}
                        >
                          <div className="flex items-center space-x-3 truncate">
                            <img
                              src={t.avatar}
                              alt={t.teacher_name}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div className="truncate text-xs">
                              <p className="font-bold text-slate-900">{t.teacher_name}</p>
                              <p className="text-[10px] text-slate-500 truncate">{t.email}</p>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              t.is_available ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {t.is_available ? "Trống lịch" : "Trùng lịch"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Chưa có giảng viên nào được cấp chuyên môn môn <strong>{formData.subject}</strong>.</span>
                </div>
              )}

              {/* 🌟 PROFILE CARD CHI TIẾT CỦA GIẢNG VIÊN ĐƯỢC CHỌN */}
              {selectedTeacher && (
                <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 rounded-2xl space-y-3 animate-fadeIn">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={selectedTeacher.avatar}
                        alt={selectedTeacher.teacher_name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900">{selectedTeacher.teacher_name}</h4>
                          <span className="p-0.5 bg-blue-100 text-blue-700 rounded-md" title="Giảng viên đã xác thực">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{selectedTeacher.email || "giangvien@edutech.vn"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          selectedTeacher.is_available
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {selectedTeacher.is_available ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn Sàng Giảng Dạy
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5" /> Trùng Khung Giờ
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Chi tiết chuyên môn & các lớp phụ trách */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Chuyên môn được cấp phép:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(selectedTeacher.all_subjects || [formData.subject]).map((sub, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              sub === formData.subject
                                ? "bg-blue-600 text-white"
                                : "bg-white border border-slate-200 text-slate-700"
                            }`}
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Khối lượng giảng dạy:
                      </span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        Đang phụ trách {selectedTeacher.total_courses || 0} lớp học
                      </span>
                    </div>
                  </div>

                  {/* Cảnh báo nếu bận lịch */}
                  {isTeacherConflicted && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center space-x-2 text-[11px]">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span><strong>Chi tiết xung đột:</strong> {selectedTeacher.conflictMsg}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. Ảnh bìa & Mô tả */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>3. Ảnh Bìa & Mô Tả Chương Trình</span>
            </h3>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Chọn Ảnh Bìa Mẫu Phù Hợp:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRESET_THUMBNAILS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => setFormData({ ...formData, thumbnail: preset.url })}
                    className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all aspect-video group ${
                      formData.thumbnail === preset.url
                        ? "border-blue-600 shadow-md ring-2 ring-blue-500/20"
                        : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 p-1 text-center">
                      <span className="text-[10px] font-bold text-white block truncate">{preset.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Mô Tả Lớp Học
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none resize-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </form>

        {/* CỘT PHẢI: LIVE PREVIEW THẺ LỚP HỌC (4 Cột) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>Xem Trước Thẻ Lớp Học</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                Chính Quy (Mở)
              </span>
            </div>

            {/* Thẻ mô phỏng giao diện hiển thị */}
            <div className="rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm bg-white group">
              <div className="relative h-36 overflow-hidden">
                <img
                  src={formData.thumbnail}
                  alt="Preview Thumbnail"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-md shadow-sm">
                    {formData.subject}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
                    {formData.grade}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-mono font-bold rounded">
                  EDU-XXXX
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug">
                  {formData.title || "Tên lớp học chính quy..."}
                </h4>

                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{formData.schoolName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTeacher?.avatar && (
                      <img
                        src={selectedTeacher.avatar}
                        alt="Avatar"
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    )}
                    <span className="font-semibold text-slate-800">{formData.teacher_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-blue-600 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{formData.days_of_week} ({formData.time_slot.split("(")[0].trim()})</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Sĩ số: <strong>0/{formData.maxStudents} HS</strong></span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng mở
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-2xl text-[11px] text-blue-900 leading-relaxed">
              💡 <strong>Lưu ý:</strong> Sau khi khởi tạo, lớp sẽ tự động ở trạng thái <strong>Đang Mở</strong>. Admin có thể sang Tab <em>"Quản Lý Lớp Học & Học Viên"</em> để tiến hành Import danh sách học sinh từ Excel vào lớp này.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}