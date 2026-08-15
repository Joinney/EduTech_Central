/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { 
  HelpCircle, 
  FileCheck, 
  BarChart3, 
  Clock, 
  Award, 
  Calendar, 
  Users, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Loader2,
  Filter,
  FileText,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { quizApi } from "../../../../api/quiz.api";

// Hàm định dạng ngày giờ chuẩn hiển thị tiếng Việt
const formatDateTime = (val) => {
  if (!val) return "Chưa đặt lịch";
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }
  return val;
};

export default function DanhGiaVaKhaoThiTab({
  courses = [],
  subTabAssess,
  onSwitchSubTab
}) {
  // State lưu danh sách đề thi kéo từ quiz-service
  const [mongoExamsList, setMongoExamsList] = useState([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");

  // State Modal xem danh sách bài thi đã nộp
  const [viewingExamSubmissions, setViewingExamSubmissions] = useState(null);
  const [examSubmissionsList, setExamSubmissionsList] = useState([]);
  const [isLoadingExamSubs, setIsLoadingExamSubs] = useState(false);
  const [showViolationDetails, setShowViolationDetails] = useState(false); // Mặc định tắt giám sát

  // 1. Tải danh sách bài thi khảo thí từ tất cả các lớp
  useEffect(() => {
    const fetchAllCourseExams = async () => {
      if (!courses || courses.length === 0) return;
      setIsLoadingExams(true);
      try {
        const examsPromises = courses.map(async (c) => {
          const exams = await quizApi.getExamsByCourse(c.id).catch(() => []);
          return exams.map((e) => ({
            ...e,
            courseTitle: c.title,
            courseCode: c.code,
            courseId: c.id
          }));
        });
        const results = await Promise.all(examsPromises);
        setMongoExamsList(results.flat());
      } catch (err) {
        console.error("Lỗi khi tải danh sách đề thi:", err);
      } finally {
        setIsLoadingExams(false);
      }
    };

    fetchAllCourseExams();
  }, [courses]);

  // Danh sách bài tập tự luận (PostgreSQL)
  const assignmentsList = useMemo(() => {
    return courses.flatMap((c) =>
      (c.assignments || []).map((a) => ({
        ...a,
        courseTitle: c.title,
        courseCode: c.code,
        courseId: c.id
      }))
    );
  }, [courses]);

  // Bộ lọc danh sách theo lớp học đang chọn
  const filteredAssignments = useMemo(() => {
    if (selectedCourseFilter === "all") return assignmentsList;
    return assignmentsList.filter((a) => String(a.courseId) === String(selectedCourseFilter));
  }, [assignmentsList, selectedCourseFilter]);

  const filteredExams = useMemo(() => {
    if (selectedCourseFilter === "all") return mongoExamsList;
    return mongoExamsList.filter((e) => String(e.course_id || e.courseId) === String(selectedCourseFilter));
  }, [mongoExamsList, selectedCourseFilter]);

  // Mở modal xem danh sách học sinh nộp bài
  const handleOpenExamSubmissions = async (exam) => {
    setViewingExamSubmissions(exam);
    setShowViolationDetails(false);
    setIsLoadingExamSubs(true);
    try {
      const subs = await quizApi.getAllSubmissions(exam.id || exam._id);
      setExamSubmissionsList(subs || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách nộp bài:", err);
    } finally {
      setIsLoadingExamSubs(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-6">
      {/* Thanh Header Điều Hướng Sub-Tabs & Bộ Lọc Lớp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {[
            { id: "question_bank", label: "Tổng hợp bài tập tự luận", icon: HelpCircle, count: assignmentsList.length },
            { id: "quiz_mgmt", label: "Khảo thí & Đề kiểm tra", icon: FileCheck, count: mongoExamsList.length },
            { id: "grading", label: "Chấm điểm & Báo cáo khảo thí", icon: BarChart3 }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => onSwitchSubTab(st.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                subTabAssess === st.id
                  ? "bg-[#38497C] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <st.icon className="w-4 h-4" />
              <span>{st.label}</span>
              {st.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  subTabAssess === st.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {st.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bộ lọc theo lớp */}
        <div className="flex items-center space-x-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tất cả lớp học ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= 1. SUB-TAB: BÀI TẬP TỰ LUẬN ================= */}
      {(subTabAssess === "question_bank" || !subTabAssess) && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Danh sách bài tập tự luận</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Tổng hợp bài tập cần thu bài và chấm điểm theo lớp</p>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 font-extrabold text-xs rounded-xl">
              {filteredAssignments.length} bài tập
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((a, idx) => (
              <div key={a.id || idx} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 hover:border-blue-300 transition-colors flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h5 className="font-bold text-slate-900 text-sm leading-snug">{a.title}</h5>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-extrabold shrink-0">
                      Thang {a.maxScore || a.max_score || 10}đ
                    </span>
                  </div>
                  <p className="text-slate-500">Thuộc lớp: <strong className="text-slate-700">{a.courseTitle}</strong></p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Hạn nộp: <strong className="text-rose-600 font-bold">{formatDateTime(a.dueDate || a.due_date)}</strong></span>
                  <span className="px-2 py-0.5 bg-slate-200/60 rounded-md font-bold text-slate-700">
                    Đã nộp: {a.submittedCount || a.submissions?.length || 0} bài
                  </span>
                </div>
              </div>
            ))}

            {filteredAssignments.length === 0 && (
              <div className="col-span-2 py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-xs">
                Chưa có bài tập tự luận nào trong mục này.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 2. SUB-TAB: KHẢO THÍ & ĐỀ KIỂM TRA ================= */}
      {subTabAssess === "quiz_mgmt" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Danh mục Đề thi & Khảo thí</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Các đề thi trắc nghiệm bóc tách từ file Word và đề thi tự luận</p>
            </div>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 font-extrabold text-xs rounded-xl">
              {filteredExams.length} đề thi
            </span>
          </div>

          {isLoadingExams ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600" />
              <p>Đang tải danh sách đề thi...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExams.map((q, idx) => {
                const isQuiz = q.type === "QUIZ";
                return (
                  <div key={q.id || q._id || idx} className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3.5 hover:border-purple-300 transition-colors flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-black uppercase ${
                          isQuiz ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {isQuiz ? "Trắc nghiệm (Word)" : "Tự luận"}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-purple-600" />
                          <span>{q.duration_mins || 15} phút</span>
                        </span>
                      </div>

                      <h5 className="font-extrabold text-slate-900 text-sm leading-snug">{q.title}</h5>
                      <p className="text-slate-500">Lớp: <strong className="text-slate-700">{q.courseTitle}</strong></p>

                      <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 space-y-1 text-[11px] text-slate-500">
                        <div className="flex justify-between">
                          <span>Số lượng câu hỏi:</span>
                          <strong className="text-slate-800">{q.questions?.length || q.total_questions || 10} câu</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Điểm chuẩn đạt:</span>
                          <strong className="text-emerald-600">{q.pass_score || 5.0}/10 điểm</strong>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <button
                        onClick={() => handleOpenExamSubmissions(q)}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Xem Danh Sách Nộp Bài</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredExams.length === 0 && (
                <div className="col-span-2 py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-xs">
                  Chưa có đề thi nào trong danh mục này.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= 3. SUB-TAB: CHẤM ĐIỂM & BÁO CÁO ================= */}
      {subTabAssess === "grading" && (
        <div className="space-y-4 text-xs">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">Tổng quan kết quả khảo thí & Thống kê chất lượng</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase">Tổng bài tự luận giao</span>
                <p className="text-2xl font-black text-blue-900">{filteredAssignments.length}</p>
                <span className="text-[10px] text-slate-400">Được tạo qua PostgreSQL</span>
              </div>
              <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-purple-600 uppercase">Tổng đề thi khảo thí</span>
                <p className="text-2xl font-black text-purple-900">{filteredExams.length}</p>
                <span className="text-[10px] text-slate-400">Xử lý tự động qua quiz-service</span>
              </div>
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Sĩ số học viên tham gia</span>
                <p className="text-2xl font-black text-emerald-900">
                  {courses.reduce((acc, c) => acc + (c.students?.length || 0), 0)} học viên
                </p>
                <span className="text-[10px] text-emerald-700 font-medium">Trên toàn bộ {courses.length} lớp học</span>
              </div>
            </div>
          </div>

          {/* Danh sách đề thi cần theo dõi kết quả */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Danh sách bài thi có thể rà soát kết quả</h4>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {filteredExams.map((ex, i) => (
                <div key={ex.id || i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{ex.title}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Lớp: {ex.courseTitle} • Thời lượng: {ex.duration_mins || 15} phút</p>
                  </div>
                  <button
                    onClick={() => handleOpenExamSubmissions(ex)}
                    className="px-4 py-2 bg-slate-100 hover:bg-[#38497C] hover:text-white text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem Bài Làm & Điểm Số</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL DANH SÁCH BÀI LÀM & GIÁM SÁT THOÁT TRANG ================= */}
      {viewingExamSubmissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0 border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-base">{viewingExamSubmissions.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Lớp: {viewingExamSubmissions.courseTitle} • Danh sách học sinh đã hoàn thành</p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Nút bật/tắt giám sát thoát trang ngầm */}
                <button
                  type="button"
                  onClick={() => setShowViolationDetails(!showViolationDetails)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    showViolationDetails ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-300 hover:text-white"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{showViolationDetails ? "Đang hiện giám sát" : "Kiểm tra thoát trang"}</span>
                </button>

                <button onClick={() => setViewingExamSubmissions(null)} className="p-1.5 hover:bg-white/10 rounded-xl cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Thống kê bài thi */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border text-center">
                  <span className="text-slate-400 font-medium">Đã hoàn thành</span>
                  <h4 className="text-lg font-black text-slate-900 mt-0.5">{examSubmissionsList.length} bài</h4>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border text-center">
                  <span className="text-slate-400 font-medium">Điểm trung bình</span>
                  <h4 className="text-lg font-black text-blue-600 mt-0.5">
                    {examSubmissionsList.length > 0
                      ? (examSubmissionsList.reduce((acc, c) => acc + (c.score || 0), 0) / examSubmissionsList.length).toFixed(1)
                      : "0.0"}
                  </h4>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border text-center">
                  <span className="text-slate-400 font-medium">Tỷ lệ đạt chuẩn (≥5đ)</span>
                  <h4 className="text-lg font-black text-emerald-600 mt-0.5">
                    {examSubmissionsList.length > 0
                      ? `${Math.round((examSubmissionsList.filter((s) => (s.score || 0) >= 5).length / examSubmissionsList.length) * 100)}%`
                      : "0%"}
                  </h4>
                </div>
              </div>

              {isLoadingExamSubs ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                  <p>Đang tải danh sách bài làm...</p>
                </div>
              ) : examSubmissionsList.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  {examSubmissionsList.map((sub, idx) => (
                    <div key={sub.id || idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">{sub.student_name}</h5>
                          <p className="text-[11px] text-slate-400">
                            Nộp lúc: {new Date(sub.submitted_at || sub.created_at).toLocaleString("vi-VN")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Chỉ hiện số lần thoát trang khi giảng viên chủ động BẬT */}
                        {showViolationDetails && sub.violations_count > 0 && (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                            <span>Thoát trang: {sub.violations_count} lần</span>
                          </span>
                        )}

                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-black rounded-xl text-xs">
                          {sub.score}/10 Điểm
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-xs">
                  Chưa có học sinh nào nộp bài thi này.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button onClick={() => setViewingExamSubmissions(null)} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}