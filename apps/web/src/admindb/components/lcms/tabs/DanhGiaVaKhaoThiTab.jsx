/* eslint-disable react/prop-types */
import React from "react";
import { HelpCircle, FileCheck, BarChart3, Clock, Award } from "lucide-react";

export default function DanhGiaVaKhaoThiTab({
  courses,
  subTabAssess,
  onSwitchSubTab
}) {
  const assignmentsList = courses.flatMap((c) =>
    (c.assignments || []).map((a) => ({ ...a, courseTitle: c.title, courseCode: c.code }))
  );

  const quizzesList = courses.flatMap((c) =>
    (c.quizzes || []).map((q) => ({ ...q, courseTitle: c.title, courseCode: c.code }))
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Thanh chuyển Sub-tab */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 flex-wrap gap-2">
        {[
          { id: "question_bank", label: "Tổng hợp bài tập tự luận", icon: HelpCircle, count: assignmentsList.length },
          { id: "quiz_mgmt", label: "Bài kiểm tra trắc nghiệm", icon: FileCheck, count: quizzesList.length },
          { id: "grading", label: "Chấm điểm & Báo cáo khảo thí", icon: BarChart3 }
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
            {st.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                subTabAssess === st.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {st.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 1. Sub-tab: Bài tập tự luận */}
      {(subTabAssess === "question_bank" || !subTabAssess) && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">Danh sách bài tập tự luận ({assignmentsList.length} bài)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignmentsList.map((a, idx) => (
              <div key={a.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <h5 className="font-bold text-slate-900 text-sm">{a.title}</h5>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold shrink-0">
                    Thang {a.maxScore || a.max_score || 10}đ
                  </span>
                </div>
                <p className="text-slate-500">Thuộc lớp: <strong>{a.courseTitle}</strong></p>
                <div className="flex items-center justify-between pt-1 text-slate-500 text-[11px]">
                  <span>Hạn nộp: <strong className="text-rose-600 font-bold">{a.dueDate || a.due_date || "Chưa đặt hạn"}</strong></span>
                  <span className="text-slate-400">Đã nộp: <strong>{a.submittedCount || 0} bài</strong></span>
                </div>
              </div>
            ))}

            {assignmentsList.length === 0 && (
              <div className="col-span-2 py-12 text-center text-slate-400">
                Chưa có bài tập tự luận nào được tạo trong các lớp.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Sub-tab: Bài kiểm tra trắc nghiệm */}
      {subTabAssess === "quiz_mgmt" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">Danh sách bài kiểm tra & Đề thi trắc nghiệm ({quizzesList.length} đề)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzesList.map((q, idx) => (
              <div key={q.id || idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:border-purple-300 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <h5 className="font-bold text-slate-900 text-sm">{q.title}</h5>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold shrink-0">
                    {q.totalQuestions || q.total_questions || 10} Câu hỏi
                  </span>
                </div>
                <p className="text-slate-500">Thuộc lớp: <strong>{q.courseTitle}</strong></p>
                <div className="flex items-center justify-between pt-1 text-slate-500 text-[11px]">
                  <span>Thời lượng: <strong className="text-purple-600 font-bold">{q.duration || "45 phút"}</strong></span>
                  <span>Điểm đạt: <strong className="text-emerald-600 font-bold">{q.passScore || q.pass_score || 5}đ</strong></span>
                </div>
              </div>
            ))}

            {quizzesList.length === 0 && (
              <div className="col-span-2 py-12 text-center text-slate-400">
                Chưa có đề kiểm tra trắc nghiệm nào được tạo trong các lớp.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Sub-tab: Chấm điểm & Báo cáo */}
      {subTabAssess === "grading" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900">Tổng quan kết quả khảo thí & Chấm điểm</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl">
              <span className="text-[10px] font-bold text-blue-600 uppercase">Tổng bài tự luận</span>
              <p className="text-2xl font-black text-blue-900 mt-1">{assignmentsList.length}</p>
            </div>
            <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl">
              <span className="text-[10px] font-bold text-purple-600 uppercase">Tổng đề trắc nghiệm</span>
              <p className="text-2xl font-black text-purple-900 mt-1">{quizzesList.length}</p>
            </div>
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Tỷ lệ nộp bài trung bình</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">87.5%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}