import React, { useState } from "react";
import { School, X, Loader2 } from "lucide-react";
import { SCHOOL_OPTIONS, SUBJECT_OPTIONS } from "../constants";
import { courseService } from "../../../../api/course.api";

export default function CreateSchoolCourseModal({ isOpen, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "Toán Học",
    schoolName: "THPT Chuyên Lê Hồng Phong (TP.HCM)",
    grade: "Lớp 12",
    teacher_name: "Thầy Phan Thuận",
    maxStudents: 45,
    schedule: "Thứ 2, Thứ 4, Thứ 6 (Tiết 1 - 3)",
    description: "Lớp học chính quy theo chương trình chuẩn của Bộ Giáo Dục & Đào Tạo."
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        teacher_id: 1,
        teacher_name: formData.teacher_name,
        type: "school",
        title: formData.title,
        code: `EDU-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        subject: formData.subject,
        schoolName: formData.schoolName,
        grade: formData.grade,
        maxStudents: Number(formData.maxStudents) || 45,
        schedule: formData.schedule,
        thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop",
        description: formData.description,
        status: "APPROVED",
        is_published: true
      };

      await courseService.createCourse(payload);
      alert("🎉 Tạo lớp trường học chính quy thành công!");
      onClose();
      onSuccess();
    } catch (err) {
      console.error("Lỗi tạo lớp chính quy:", err);
      alert("Lỗi khi tạo lớp học chính quy!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border overflow-hidden relative max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <School className="w-5 h-5 text-blue-200" />
            <h3 className="font-extrabold text-sm">Tạo Lớp Học Trường Học Chính Quy</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed text-[11px]">
            ℹ️ <strong>Lưu ý:</strong> Lớp học chính quy do Admin trực tiếp khởi tạo sẽ tự động ở trạng thái{" "}
            <strong>Đang Mở (APPROVED)</strong> và có hiệu lực ngay lập tức cho học sinh đăng ký.
          </div>

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
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Môn Học *</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
              >
                {SUBJECT_OPTIONS.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Giảng Viên Phụ Trách</label>
              <input
                type="text"
                required
                value={formData.teacher_name}
                onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
                placeholder="VD: Thầy Phan Thuận"
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
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Thời Khóa Biểu (TKB)</label>
            <input
              type="text"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              placeholder="VD: Thứ 2, Thứ 4, Thứ 6 (Tiết 1 - 3)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
            />
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
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center space-x-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? "Đang tạo..." : "Khởi Tạo Lớp Chính Quy"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}