import React, { useState, useEffect } from "react";
import { School, X, Loader2, Calendar, UserCheck, AlertCircle, Clock } from "lucide-react";
import { SCHOOL_OPTIONS, SUBJECT_OPTIONS } from "../constants";
import { courseApi } from "../../../../api/axios";
import { courseService } from "../../../../api/course.api";

// Danh sách các khung giờ học chuẩn
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

export default function CreateSchoolCourseModal({ isOpen, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [qualifiedTeachers, setQualifiedTeachers] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    subject: "Toán Học",
    schoolName: "THPT Chuyên Lê Hồng Phong (TP.HCM)",
    grade: "Lớp 12",
    teacher_id: 1,
    teacher_name: "Phan Thuận",
    maxStudents: 45,
    days_of_week: "Thứ 2, Thứ 4, Thứ 6",
    time_slot: "Tiết 1 - 3 (07:30 - 09:45)",
    description: "Lớp học chính quy theo chương trình chuẩn của Bộ Giáo Dục & Đào Tạo."
  });

  // Tải danh sách giáo viên có chuyên môn & kiểm tra lịch dạy
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

      // Nếu giáo viên đang chọn không hợp lệ, tự động gán giáo viên đầu tiên trong danh sách
      if (list.length > 0) {
        const currentTeacherValid = list.find((t) => t.teacher_id === Number(formData.teacher_id));
        if (!currentTeacherValid) {
          setFormData((prev) => ({
            ...prev,
            teacher_id: list[0].teacher_id,
            teacher_name: list[0].teacher_name
          }));
        }
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách giáo viên chuyên môn:", err);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchQualifiedTeachers(formData.subject, formData.days_of_week, formData.time_slot);
    }
  }, [isOpen, formData.subject, formData.days_of_week, formData.time_slot]);

  if (!isOpen) return null;

  // Kiểm tra giáo viên đang chọn có bị trùng lịch không
  const selectedTeacherInfo = qualifiedTeachers.find((t) => t.teacher_id === Number(formData.teacher_id));
  const isTeacherConflicted = selectedTeacherInfo ? !selectedTeacherInfo.is_available : false;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isTeacherConflicted) {
      alert(`⚠️ ${selectedTeacherInfo.conflictMsg || "Giáo viên đã bị trùng lịch dạy!"} Vui lòng chọn giáo viên khác hoặc đổi khung giờ.`);
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
        thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop",
        description: formData.description,
        status: "APPROVED",
        is_published: true
      };

      await courseService.createCourse(payload);
      alert("🎉 Bổ nhiệm giáo viên và tạo lớp chính quy thành công!");
      onClose();
      onSuccess();
    } catch (err) {
      console.error("Lỗi tạo lớp chính quy:", err);
      alert(err.response?.data?.error || "Lỗi khi tạo lớp học chính quy!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <School className="w-5 h-5 text-blue-200" />
            <h3 className="font-extrabold text-sm">Bổ Nhiệm Giáo Viên & Tạo Lớp Chính Quy</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Tên Lớp Học *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Toán Học 12A1 / Hóa Học 10C2..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Trường / Sở GD *</label>
              <select
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
              >
                {SCHOOL_OPTIONS.map((sch, i) => (
                  <option key={i} value={sch}>{sch}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Môn Học / Chuyên Môn *</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-800 cursor-pointer"
              >
                {SUBJECT_OPTIONS.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 📅 THỜI KHÓA BIỂU DẠY (CẤU TRÚC ĐỂ CHỐNG TRÙNG LỊCH) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[10px]">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Xếp Lịch Học & Khung Giờ Giảng Dạy</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-1">Các ngày trong tuần:</label>
                <select
                  value={formData.days_of_week}
                  onChange={(e) => setFormData({ ...formData, days_of_week: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 cursor-pointer"
                >
                  {DAYS_OF_WEEK.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-1">Khung giờ / Tiết học:</label>
                <select
                  value={formData.time_slot}
                  onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 cursor-pointer"
                >
                  {TIME_SLOTS.map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 👨‍🏫 BỔ NHIỆM GIẢNG VIÊN (TỰ ĐỘNG LỌC ĐÚNG MÔN VÀ BÁO TRÙNG LỊCH) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Bổ Nhiệm Giảng Viên Phụ Trách ({formData.subject}) *</span>
              </label>
              {isLoadingTeachers && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
            </div>

            {qualifiedTeachers.length > 0 ? (
              <select
                value={formData.teacher_id}
                onChange={(e) => {
                  const selected = qualifiedTeachers.find((t) => t.teacher_id === Number(e.target.value));
                  setFormData({
                    ...formData,
                    teacher_id: Number(e.target.value),
                    teacher_name: selected?.teacher_name || ""
                  });
                }}
                className={`w-full px-3 py-2 border rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  isTeacherConflicted
                    ? "bg-rose-50 border-rose-300 text-rose-800"
                    : "bg-emerald-50/60 border-emerald-300 text-emerald-900"
                }`}
              >
                {qualifiedTeachers.map((t) => (
                  <option key={t.teacher_id} value={t.teacher_id}>
                    {t.teacher_name} {t.is_available ? "🟢 (Trống lịch)" : `🔴 (Trùng lịch: ${t.conflictMsg})`}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px]">
                ⚠️ Chưa tìm thấy giáo viên nào được cấp chứng chỉ/chuyên môn <strong>{formData.subject}</strong> trong hệ thống.
              </div>
            )}

            {/* Thông báo nếu giáo viên bị trùng lịch */}
            {isTeacherConflicted && selectedTeacherInfo && (
              <div className="mt-1.5 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center space-x-1.5 text-[11px]">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span><strong>Cảnh báo trùng lịch:</strong> {selectedTeacherInfo.conflictMsg}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Khối Lớp</label>
              <input
                type="text"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Sĩ Số Tối Đa</label>
              <input
                type="number"
                min="10"
                max="100"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Mô Tả Lớp Học</label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isTeacherConflicted || qualifiedTeachers.length === 0}
              className={`px-5 py-2 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer ${
                isTeacherConflicted || qualifiedTeachers.length === 0
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
              }`}
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? "Đang tạo..." : "Bổ Nhiệm & Khởi Tạo Lớp"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}