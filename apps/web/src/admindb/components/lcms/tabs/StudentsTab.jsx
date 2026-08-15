import React from "react";
import { Users, TrendingUp, Download } from "lucide-react";

export default function StudentsTab({
  courses,
  subTabStudent,
  onSwitchSubTab,
  onOpenImportModal
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          {[
            { id: "student_list", label: "Quản Lý Danh Sách Học Viên Theo Lớp", icon: Users },
            { id: "progress", label: "Tiến Độ Học Tập Trực Tiếp", icon: TrendingUp }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => onSwitchSubTab(st.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                subTabStudent === st.id
                  ? "bg-[#38497C] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <st.icon className="w-4 h-4" />
              <span>{st.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {courses.map((c) => (
            <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md ${
                        c.type === "school" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {c.type === "school" ? "Lớp Chính Quy (Excel)" : "Khóa Kỹ Năng (Tự Do)"}
                    </span>
                    <span className="font-mono text-xs font-bold text-orange-600 px-1.5 py-0.5 bg-orange-50 rounded">
                      {c.code}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900">{c.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Trường: <strong>{c.schoolName}</strong> • Giảng viên:{" "}
                    <strong>{c.teacher_name || c.teacherName}</strong> • Sĩ số:{" "}
                    <strong className="text-blue-600">
                      {c.studentsCount || 0}/{c.maxStudents} Học viên
                    </strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {c.type === "school" ? (
                    <button
                      type="button"
                      onClick={() => onOpenImportModal(c)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>📥 Import DS Học Sinh (Excel)</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                      Mã tham gia: <strong className="text-orange-600 font-mono">{c.code}</strong>
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-500">
                {c.type === "school"
                  ? "📌 Lớp chính quy: Danh sách học sinh được phân bổ trực tiếp từ file Excel do Trường/Sở gửi về."
                  : "🔓 Khóa tự do: Học sinh tự nhập mã lớp để tham gia."}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}