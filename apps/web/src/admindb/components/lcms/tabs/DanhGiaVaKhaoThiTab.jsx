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
  Sparkles, 
  Search, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ChevronRight,
  BookOpen,
  RefreshCw
} from "lucide-react";
import { quizApi } from "../../../../api/quiz.api";
import { courseService } from "../../../../api/course.api";

const formatDateTime = (val) => {
  if (!val) return "Chưa cập nhật";
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
  // Danh sách đề thi trắc nghiệm tổng hợp
  const [examsList, setExamsList] = useState([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");

  // Modal xem danh sách bài nộp & điểm số
  const [viewingExam, setViewingExam] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [isLoadingSubs, setIsLoadingSubs] = useState(false);
  const [showViolationDetails, setShowViolationDetails] = useState(false);
  const [searchStudentTerm, setSearchStudentTerm] = useState("");

  // Modal chi tiết câu trả lời của 1 học sinh cụ thể
  const [selectedSubmissionDetail, setSelectedSubmissionDetail] = useState(null);

  // Modal bài nộp tự luận
  const [viewingAssignment, setViewingAssignment] = useState(null);
  const [assignSubsList, setAssignSubsList] = useState([]);
  const [isLoadingAssignSubs, setIsLoadingAssignSubs] = useState(false);

  // 🎯 1. TẢI TẤT CẢ ĐỀ THI TỪ CẢ 2 SOURCE (course-service & quiz-service)
  const fetchAllExams = async () => {
    if (!courses || courses.length === 0) return;
    setIsLoadingExams(true);
    try {
      const allExams = [];

      // A. Lấy từ course.quizzes có sẵn trong data lớp học
      courses.forEach((c) => {
        if (c.quizzes && Array.isArray(c.quizzes)) {
          c.quizzes.forEach((q) => {
            allExams.push({
              ...q,
              id: q.id || q._id,
              courseTitle: c.title,
              courseCode: c.code,
              courseId: c.id,
              students: c.students || []
            });
          });
        }
      });

      // B. Gọi API kiểm tra bổ sung từ quiz-service & course-service
      const apiPromises = courses.map(async (c) => {
        let list = [];
        try {
          if (quizApi?.getExamsByCourse) {
            const res = await quizApi.getExamsByCourse(c.id);
            const data = Array.isArray(res) ? res : (res?.data || []);
            list = [...list, ...data];
          }
        } catch (_) {}

        try {
          if (courseService?.getQuizzesByCourse) {
            const res = await courseService.getQuizzesByCourse(c.id);
            const data = Array.isArray(res) ? res : (res?.data || []);
            list = [...list, ...data];
          }
        } catch (_) {}

        return list.map((e) => ({
          ...e,
          id: e.id || e._id || e.quiz_id,
          courseTitle: c.title,
          courseCode: c.code,
          courseId: c.id,
          students: c.students || []
        }));
      });

      const fetchedResults = await Promise.all(apiPromises);
      const combined = [...allExams, ...fetchedResults.flat()];

      // Lọc trùng ID
      const uniqueExams = Array.from(
        new Map(combined.map((item) => [String(item.id || item._id), item])).values()
      );

      setExamsList(uniqueExams);
    } catch (err) {
      console.error("Lỗi khi tải danh sách đề thi:", err);
    } finally {
      setIsLoadingExams(false);
    }
  };

  useEffect(() => {
    fetchAllExams();
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

  // Bộ lọc theo lớp
  const filteredAssignments = useMemo(() => {
    if (selectedCourseFilter === "all") return assignmentsList;
    return assignmentsList.filter((a) => String(a.courseId) === String(selectedCourseFilter));
  }, [assignmentsList, selectedCourseFilter]);

  const filteredExams = useMemo(() => {
    if (selectedCourseFilter === "all") return examsList;
    return examsList.filter((e) => String(e.courseId || e.course_id) === String(selectedCourseFilter));
  }, [examsList, selectedCourseFilter]);

  // 🎯 2. LẤY BÀI LÀM & ĐIỂM SỐ THỰC TẾ CỦA ĐỀ THI
  const handleOpenExamSubmissions = async (exam) => {
    setViewingExam(exam);
    setShowViolationDetails(false);
    setSearchStudentTerm("");
    setSelectedSubmissionDetail(null);
    setIsLoadingSubs(true);

    const examId = exam._id || exam.id || exam.quiz_id;
    let subs = [];

    try {
      // 1. Thử gọi quizApi
      if (quizApi?.getAllSubmissions) {
        const res = await quizApi.getAllSubmissions(examId);
        subs = Array.isArray(res) ? res : (res?.data || res?.submissions || []);
      }
    } catch (_) {}

    if (subs.length === 0) {
      try {
        // 2. Thử gọi courseService
        if (courseService?.getQuizSubmissions) {
          const res = await courseService.getQuizSubmissions(examId);
          subs = Array.isArray(res) ? res : (res?.data || res?.submissions || []);
        }
      } catch (_) {}
    }

    if (subs.length === 0 && exam.submissions && Array.isArray(exam.submissions)) {
      subs = exam.submissions;
    }

    setSubmissionsList(subs);
    setIsLoadingSubs(false);
  };

  // Mở modal tự luận
  const handleOpenAssignmentSubmissions = async (assignment) => {
    setViewingAssignment(assignment);
    setIsLoadingAssignSubs(true);
    try {
      const res = await courseService.getSubmissionsByAssignment(assignment.id);
      const subs = Array.isArray(res) ? res : (res?.data || []);
      setAssignSubsList(subs);
    } catch (err) {
      console.error("Lỗi lấy bài nộp tự luận:", err);
      setAssignSubsList([]);
    } finally {
      setIsLoadingAssignSubs(false);
    }
  };

  const filteredSubmissions = useMemo(() => {
    return submissionsList.filter((s) => {
      const name = (s.student_name || s.name || s.user_name || "").toLowerCase();
      const email = (s.student_email || s.email || "").toLowerCase();
      const term = searchStudentTerm.toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [submissionsList, searchStudentTerm]);

  return (
    <div className="space-y-5 animate-fadeIn pb-8 font-sans">
      {/* Thanh Header Điều Hướng Sub-Tabs & Bộ Lọc Lớp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {[
            { id: "quiz_mgmt", label: "Khảo thí & Đề kiểm tra", icon: FileCheck, count: filteredExams.length },
            { id: "grading", label: "Chấm điểm & Báo cáo khảo thí", icon: BarChart3, count: filteredExams.length },
            { id: "question_bank", label: "Bài tập tự luận", icon: HelpCircle, count: filteredAssignments.length }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => onSwitchSubTab(st.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                (subTabAssess === st.id || (!subTabAssess && st.id === "quiz_mgmt"))
                  ? "bg-[#38497C] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <st.icon className="w-4 h-4" />
              <span>{st.label}</span>
              {st.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  (subTabAssess === st.id || (!subTabAssess && st.id === "quiz_mgmt"))
                    ? "bg-white/20 text-white" 
                    : "bg-slate-100 text-slate-600"
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

      {/* ================= 1. TAB: KHẢO THÍ & ĐỀ KIỂM TRA ================= */}
      {(subTabAssess === "quiz_mgmt" || !subTabAssess) && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Danh mục Đề thi & Khảo thí</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Bao gồm đề thi trắc nghiệm Word và bài kiểm tra online</p>
            </div>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 font-extrabold text-xs rounded-xl">
              {filteredExams.length} Đề thi
            </span>
          </div>

          {isLoadingExams ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-600" />
              <p>Đang đồng bộ danh sách đề thi...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExams.map((q, idx) => {
                const isQuiz = q.type === "QUIZ" || (q.questions && q.questions.length > 0);
                const qCount = q.questions?.length || q.total_questions || 10;
                
                return (
                  <div key={q.id || q._id || idx} className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3.5 hover:border-purple-300 transition-colors flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[10px] px-2.5 py-1 rounded-md font-black uppercase ${
                          isQuiz ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {isQuiz ? "Trắc nghiệm Online" : "Tự luận"}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-purple-600" />
                          <span>{q.duration_mins || 15} phút</span>
                        </span>
                      </div>

                      <h5 className="font-extrabold text-slate-900 text-sm leading-snug">{q.title}</h5>
                      <p className="text-slate-500">Lớp: <strong className="text-slate-700">{q.courseTitle}</strong></p>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1.5 text-[11px] text-slate-600">
                        <div className="flex justify-between">
                          <span>Số câu hỏi:</span>
                          <strong className="text-slate-900">{qCount} câu</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Điểm chuẩn đạt:</span>
                          <strong className="text-emerald-600">{q.pass_score || 5.0}/10 điểm</strong>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60">
                      <button
                        onClick={() => handleOpenExamSubmissions(q)}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-xs active:scale-95 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Xem Bài Làm & Bảng Điểm</span>
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

      {/* ================= 2. TAB: CHẤM ĐIỂM & BÁO CÁO KHẢO THÍ ================= */}
      {subTabAssess === "grading" && (
        <div className="space-y-5 text-xs">
          {/* Khung chỉ số tổng quan */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">Báo cáo & Tổng hợp kết quả khảo thí</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-purple-700 uppercase">Tổng số đề khảo thí</span>
                <p className="text-2xl font-black text-purple-950">{filteredExams.length}</p>
                <span className="text-[10px] text-purple-600">Đã kích hoạt trên hệ thống</span>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase">Bài tập tự luận</span>
                <p className="text-2xl font-black text-blue-950">{filteredAssignments.length}</p>
                <span className="text-[10px] text-blue-600">Bài tập giao theo lớp</span>
              </div>

              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase">Học viên tham gia</span>
                <p className="text-2xl font-black text-emerald-950">
                  {courses.reduce((acc, c) => acc + (c.students?.length || 0), 0)}
                </p>
                <span className="text-[10px] text-emerald-600">Tổng quy mô tất cả lớp</span>
              </div>
            </div>
          </div>

          {/* Bảng danh sách bài thi kèm nút xem bài nộp trực tiếp */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Bảng theo dõi điểm số theo từng bài thi</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Nhấp vào từng đề thi để tra cứu kết quả làm bài của học sinh</p>
              </div>
              <button
                onClick={fetchAllExams}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                title="Làm mới danh sách"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <th className="py-3.5 px-4 font-bold rounded-l-xl">Tên bài thi</th>
                    <th className="py-3.5 px-4 font-bold">Lớp học</th>
                    <th className="py-3.5 px-4 font-bold text-center">Thời lượng</th>
                    <th className="py-3.5 px-4 font-bold text-center">Số câu</th>
                    <th className="py-3.5 px-4 font-bold text-center">Điểm chuẩn</th>
                    <th className="py-3.5 px-4 font-bold text-center rounded-r-xl">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExams.map((ex, i) => (
                    <tr key={ex.id || ex._id || i} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 font-extrabold text-slate-900">{ex.title}</td>
                      <td className="py-4 px-4 font-medium text-slate-600">{ex.courseTitle}</td>
                      <td className="py-4 px-4 text-center font-semibold text-purple-700">
                        {ex.duration_mins || 15} phút
                      </td>
                      <td className="py-4 px-4 text-center text-slate-700">
                        {ex.questions?.length || ex.total_questions || 10} câu
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-emerald-600">
                        {ex.pass_score || 5.0}/10 đ
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleOpenExamSubmissions(ex)}
                          className="px-3.5 py-1.5 bg-[#38497C] hover:bg-slate-900 text-white font-bold rounded-xl text-xs inline-flex items-center space-x-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem Điểm & Bài Làm</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredExams.length === 0 && (
                <div className="py-14 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-xs">
                  Chưa có đề thi nào trong lớp học này.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. TAB: BÀI TẬP TỰ LUẬN ================= */}
      {subTabAssess === "question_bank" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 text-xs">
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
                  {a.description && (
                    <p className="text-slate-600 line-clamp-2 italic text-[11px]">{a.description}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Hạn nộp: <strong className="text-rose-600 font-bold">{formatDateTime(a.dueDate || a.due_date)}</strong></span>
                  <button
                    onClick={() => handleOpenAssignmentSubmissions(a)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem Bài Nộp ({a.submittedCount || a.submissions?.length || 0})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL XEM BÀI LÀM & ĐIỂM SỐ TRẮC NGHIỆM ================= */}
      {viewingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn font-sans">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0 border-b border-slate-800">
              <div>
                <h3 className="font-black text-base">{viewingExam.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lớp: {viewingExam.courseTitle} • Tổng cộng {submissionsList.length} lượt nộp bài
                </p>
              </div>

              <div className="flex items-center space-x-3">
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

                <button onClick={() => setViewingExam(null)} className="p-1.5 hover:bg-white/10 rounded-xl cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Nội dung Modal */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* 3 Thẻ thống kê */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border text-center">
                  <span className="text-slate-400 font-medium">Đã hoàn thành</span>
                  <h4 className="text-xl font-black text-slate-900 mt-0.5">{submissionsList.length} bài</h4>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border text-center">
                  <span className="text-slate-400 font-medium">Điểm trung bình</span>
                  <h4 className="text-xl font-black text-blue-600 mt-0.5">
                    {submissionsList.length > 0
                      ? (submissionsList.reduce((acc, c) => acc + (Number(c.score) || 0), 0) / submissionsList.length).toFixed(1)
                      : "0.0"}
                  </h4>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border text-center">
                  <span className="text-slate-400 font-medium">Tỷ lệ đạt (≥5đ)</span>
                  <h4 className="text-xl font-black text-emerald-600 mt-0.5">
                    {submissionsList.length > 0
                      ? `${Math.round((submissionsList.filter((s) => (Number(s.score) || 0) >= 5).length / submissionsList.length) * 100)}%`
                      : "0%"}
                  </h4>
                </div>
              </div>

              {/* Tìm kiếm học sinh */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên học sinh, email..."
                  value={searchStudentTerm}
                  onChange={(e) => setSearchStudentTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {isLoadingSubs ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  <p className="font-medium">Đang tải danh sách bài làm & điểm số...</p>
                </div>
              ) : filteredSubmissions.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  {filteredSubmissions.map((sub, idx) => {
                    const studentDisplayName = sub.student_name || sub.name || sub.user_name || "Học viên";
                    const studentAvatar = 
                      sub.student_avatar || 
                      sub.avatar || 
                      sub.avatar_url || 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(studentDisplayName)}&background=random`;

                    const minutesSpent = sub.time_spent_secs ? Math.floor(sub.time_spent_secs / 60) : null;
                    const secondsSpent = sub.time_spent_secs ? sub.time_spent_secs % 60 : null;

                    return (
                      <div key={sub.id || sub._id || idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-3.5">
                          <img
                            src={studentAvatar}
                            alt={studentDisplayName}
                            className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(studentDisplayName)}&background=random`;
                            }}
                          />
                          <div>
                            <h5 className="font-extrabold text-slate-900 text-sm">{studentDisplayName}</h5>
                            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                              <span>Nộp: {formatDateTime(sub.submitted_at || sub.created_at)}</span>
                              {minutesSpent !== null && (
                                <span>• Làm: {minutesSpent}p {secondsSpent}s</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {sub.total_correct !== undefined && (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-[11px]">
                              {sub.total_correct} câu đúng
                            </span>
                          )}

                          {showViolationDetails && Number(sub.violations_count) > 0 && (
                            <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                              <span>Thoát trang: {sub.violations_count} lần</span>
                            </span>
                          )}

                          <span className={`px-3.5 py-1.5 font-black rounded-xl text-xs ${
                            Number(sub.score) >= 5 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                          }`}>
                            {sub.score}/10 Điểm
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-xs space-y-1">
                  <p className="font-bold text-slate-600">Chưa có học sinh nào nộp bài thi này.</p>
                  <p className="text-slate-400">Danh sách sẽ tự động cập nhật khi học sinh hoàn thành bài làm.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button onClick={() => setViewingExam(null)} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XEM BÀI NỘP TỰ LUẬN ================= */}
      {viewingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn font-sans">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0 border-b border-slate-800">
              <div>
                <h3 className="font-black text-base">{viewingAssignment.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Danh sách bài tự luận đã nộp</p>
              </div>
              <button onClick={() => setViewingAssignment(null)} className="p-1.5 hover:bg-white/10 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {isLoadingAssignSubs ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  <p className="font-medium">Đang tải danh sách bài nộp...</p>
                </div>
              ) : assignSubsList.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  {assignSubsList.map((sub, idx) => {
                    const studentName = sub.student_name || sub.user_name || sub.name || "Học viên";
                    const studentAvatar = 
                      sub.student_avatar || 
                      sub.avatar || 
                      sub.avatar_url || 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=random`;

                    return (
                      <div key={sub.id || idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-3.5">
                          <img
                            src={studentAvatar}
                            alt={studentName}
                            className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0"
                          />
                          <div>
                            <h5 className="font-extrabold text-slate-900 text-sm">{studentName}</h5>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Nộp lúc: {formatDateTime(sub.submitted_at || sub.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {sub.file_url && (
                            <a
                              href={sub.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1"
                            >
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                              <span>File bài nộp</span>
                            </a>
                          )}

                          <span className={`px-3 py-1.5 rounded-xl font-black text-xs ${
                            sub.grade !== undefined && sub.grade !== null 
                              ? "bg-emerald-100 text-emerald-800" 
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {sub.grade !== undefined && sub.grade !== null ? `${sub.grade} Điểm` : "Chưa chấm"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-xs">
                  Chưa có học sinh nào nộp bài tập tự luận này.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button onClick={() => setViewingAssignment(null)} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}