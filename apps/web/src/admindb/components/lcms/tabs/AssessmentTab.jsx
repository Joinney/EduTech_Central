import React from "react";
import { HelpCircle, FileCheck } from "lucide-react";

export default function AssessmentTab({
  courses,
  subTabAssess,
  onSwitchSubTab
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        {[
          { id: "question_bank", label: "Tổng hợp bài tập tự luận", icon: HelpCircle },
          { id: "quiz_mgmt", label: "Bài kiểm tra trắc nghiệm", icon: FileCheck }
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => onSwitchSubTab(st.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTabAssess === st.id
                ? "bg-[#38497C] text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <st.icon className="w-4 h-4" />
            <span>{st.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="font-bold text-sm text-slate-900">Danh sách bài tập & Đề thi được phân bổ cho các lớp</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses
            .flatMap((c) => (c.assignments || []).map((a) => ({ ...a, courseTitle: c.title })))
            .map((a, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-slate-900">{a.title}</h5>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                    Thang {a.maxScore || 10}đ
                  </span>
                </div>
                <p className="text-slate-500">Thuộc lớp: <strong>{a.courseTitle}</strong></p>
                <p className="text-slate-500">Hạn nộp: <span className="text-rose-600 font-bold">{a.dueDate || "Chưa đặt"}</span></p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}