/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Award, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Download, 
  Loader2,
  FileText,
  Eye,
  X,
  Sparkles,
  TrendingUp,
  Filter,
  Check,
  Calendar,
  Layers,
  ArrowUpDown,
  MinusCircle,
  Radio
} from "lucide-react"
import { quizApi } from "../../../../api/quiz.api"
import { courseService } from "../../../../api/course.api"

const formatQuestionTitle = (qText, idx) => {
  if (!qText) return `Câu ${idx + 1}:`;
  const cleanText = qText.replace(/^(câu\s*\d+|bài\s*\d+)[\:\.]\s*/i, "").trim();
  return `Câu ${idx + 1}: ${cleanText}`;
};

export default function TeacherExamSubmissions() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [courseStudents, setCourseStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]); // 👈 Danh sách đang làm bài
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [showViolationDetails, setShowViolationDetails] = useState(false);

  // Modal xem chi tiết đối chiếu bài làm
  const [selectedSubmissionDetail, setSelectedSubmissionDetail] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  // 1. Tải dữ liệu đề thi, bài đã nộp và phiên đang làm bài
  useEffect(() => {
    const fetchData = async () => {
      if (!examId) return;
      try {
        setIsLoading(true);
        const [examData, subsResult] = await Promise.all([
          quizApi.getExamFullDetail(examId).catch(() => null),
          quizApi.getAllSubmissions(examId).catch(() => ({ submissions: [], activeSessions: [] }))
        ]);

        setExam(examData);
        setSubmissions(subsResult.submissions || []);
        setActiveSessions(subsResult.activeSessions || []);

        // Tải danh sách cả lớp từ course-service
        if (examData?.course_id) {
          const studentsData = await courseService.getStudentsByCourse(examData.course_id).catch(() => []);
          setCourseStudents(Array.isArray(studentsData) ? studentsData : studentsData?.data || []);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu bài làm:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [examId]);

  // 2. Xếp loại học lực
  const getGradeCategory = (score) => {
    if (score >= 9.0) return { label: "Xuất sắc", color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    if (score >= 8.0) return { label: "Giỏi", color: "bg-blue-100 text-blue-800 border-blue-200" };
    if (score >= 6.5) return { label: "Khá", color: "bg-cyan-100 text-cyan-800 border-cyan-200" };
    if (score >= 5.0) return { label: "Trung bình", color: "bg-amber-100 text-amber-800 border-amber-200" };
    return { label: "Chưa đạt", color: "bg-rose-100 text-rose-800 border-rose-200" };
  };

  // 3. 🎯 Ghép nối danh sách CẢ LỚP với ĐÃ NỘP BÀI / ĐANG LÀM BÀI / CHƯA LÀM BÀI
  const fullClassList = useMemo(() => {
    const subMap = new Map();
    submissions.forEach((sub) => {
      subMap.set(Number(sub.student_id), sub);
    });

    const sessionMap = new Map();
    activeSessions.forEach((sess) => {
      sessionMap.set(Number(sess.student_id), sess);
    });

    if (courseStudents.length > 0) {
      return courseStudents.map((st) => {
        const studentId = Number(st.id_users || st.id || st.student_id || st.user_id);
        const sub = subMap.get(studentId);
        const session = sessionMap.get(studentId);

        let status = "not_started"; // "submitted" | "in_progress" | "not_started"
        if (sub) {
          status = "submitted";
        } else if (session) {
          status = "in_progress"; // 👈 Đang làm bài thời gian thực
        }

        return {
          student_id: studentId,
          student_name: st.displayName || st.fullName || st.name || sub?.student_name || session?.student_name || st.email?.split("@")[0] || "Học viên",
          email: st.email || "",
          avatar_url: st.avatar_url || st.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.displayName || st.name || "HV")}&background=random`,
          status,
          submission: sub || null,
          session: session || null,
          score: sub ? sub.score : null,
          time_spent_secs: sub ? sub.time_spent_secs : null,
          submitted_at: sub ? sub.submitted_at || sub.created_at : null,
          violations_count: sub ? sub.violations_count : (session?.violations_count || 0),
          total_correct: sub ? sub.total_correct : null,
          in_progress_count: session ? Object.keys(session.answers || {}).length : 0
        };
      });
    }

    // Fallback
    return submissions.map((sub) => ({
      student_id: sub.student_id,
      student_name: sub.student_name,
      email: "",
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.student_name || "HV")}&background=random`,
      status: "submitted",
      submission: sub,
      session: null,
      score: sub.score,
      time_spent_secs: sub.time_spent_secs,
      submitted_at: sub.submitted_at || sub.created_at,
      violations_count: sub.violations_count,
      total_correct: sub.total_correct,
      in_progress_count: 0
    }));
  }, [courseStudents, submissions, activeSessions]);

  // 4. Lọc & Sắp xếp dữ liệu
  const processedList = useMemo(() => {
    let result = fullClassList.filter((item) => {
      const matchSearch = (item.student_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(item.student_id || "").includes(searchTerm) ||
                          (item.email || "").toLowerCase().includes(searchTerm.toLowerCase());

      if (filterStatus === "submitted") return matchSearch && item.status === "submitted";
      if (filterStatus === "in_progress") return matchSearch && item.status === "in_progress";
      if (filterStatus === "not_started") return matchSearch && item.status === "not_started";
      if (filterStatus === "pass") return matchSearch && item.status === "submitted" && (item.score || 0) >= (exam?.pass_score || 5.0);
      if (filterStatus === "fail") return matchSearch && item.status === "submitted" && (item.score || 0) < (exam?.pass_score || 5.0);

      return matchSearch;
    });

    return result.sort((a, b) => {
      if (sortBy === "score_desc") return (b.score ?? -1) - (a.score ?? -1);
      if (sortBy === "score_asc") return (a.score ?? 99) - (b.score ?? 99);
      if (sortBy === "name_asc") return (a.student_name || "").localeCompare(b.student_name || "");
      if (sortBy === "time_desc") {
        if (!a.submitted_at) return 1;
        if (!b.submitted_at) return -1;
        return new Date(b.submitted_at) - new Date(a.submitted_at);
      }
      return 0;
    });
  }, [fullClassList, searchTerm, filterStatus, sortBy, exam]);

  // 5. Thống kê bài thi
  const stats = useMemo(() => {
    const totalStudents = fullClassList.length;
    const submittedCount = fullClassList.filter((s) => s.status === "submitted").length;
    const inProgressCount = fullClassList.filter((s) => s.status === "in_progress").length;
    const notStartedCount = fullClassList.filter((s) => s.status === "not_started").length;

    const submittedSubs = fullClassList.filter((s) => s.status === "submitted" && s.score !== null);
    const passCount = submittedSubs.filter((s) => (s.score || 0) >= (exam?.pass_score || 5.0)).length;
    const failCount = submittedSubs.length - passCount;

    const sumScore = submittedSubs.reduce((acc, s) => acc + (s.score || 0), 0);
    const avgScore = submittedSubs.length > 0 ? (sumScore / submittedSubs.length).toFixed(1) : "0.0";
    const passRate = submittedSubs.length > 0 ? Math.round((passCount / submittedSubs.length) * 100) : 0;

    return {
      totalStudents,
      submittedCount,
      inProgressCount,
      notStartedCount,
      passCount,
      failCount,
      avgScore,
      passRate
    };
  }, [fullClassList, exam]);

  // 6. Xuất báo cáo bảng điểm CSV
  const handleExportCSV = () => {
    if (fullClassList.length === 0) {
      alert("Chưa có dữ liệu để xuất file!");
      return;
    }

    const headers = ["STT", "Mã sinh viên", "Họ và tên", "Email", "Trạng thái", "Điểm số", "Số câu đúng", "Thời gian làm bài", "Thoát tab", "Ngày nộp"];
    const rows = fullClassList.map((st, idx) => [
      idx + 1,
      st.student_id,
      `"${st.student_name}"`,
      `"${st.email}"`,
      st.status === "submitted" ? "Đã nộp bài" : st.status === "in_progress" ? "Đang làm bài" : "Chưa làm bài",
      st.score !== null ? st.score : "--",
      st.total_correct !== null ? st.total_correct : "--",
      st.time_spent_secs ? `"${Math.floor(st.time_spent_secs / 60)}p ${st.time_spent_secs % 60}s"` : "--",
      st.violations_count || 0,
      st.submitted_at ? `"${new Date(st.submitted_at).toLocaleString("vi-VN")}"` : "--"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BangDiem_${exam?.title || "BaiThi"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-sm font-medium text-slate-500">Đang tải danh sách cả lớp & kết quả khảo thí...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Điều Hướng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-orange-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Chi tiết môn học</span>
        </button>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Bảng Điểm (Excel/CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowViolationDetails(!showViolationDetails)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-2xs ${
              showViolationDetails
                ? "bg-rose-600 text-white shadow-rose-500/20"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{showViolationDetails ? "Đang hiện kiểm tra thoát trang" : "Kiểm tra thoát trang"}</span>
          </button>
        </div>
      </div>

      {/* Thẻ Thông Tin Đề Thi */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                exam?.type === "QUIZ" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
              }`}>
                {exam?.type === "QUIZ" ? "Trắc nghiệm tự động" : "Tự luận"}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Môn: <strong className="text-slate-700">{exam?.course_title || "Khóa học"}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight">{exam?.title}</h1>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>Thời lượng: <strong>{exam?.duration_mins || 15} phút</strong></span>
            <span>•</span>
            <span>Điểm chuẩn: <strong className="text-emerald-600">{exam?.pass_score || 5.0}/10đ</strong></span>
          </div>
        </div>

        {/* 4 Thẻ Thống Kê Tổng Quan */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          <div className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sĩ số cả lớp</span>
            <p className="text-2xl font-black text-slate-900">{stats.totalStudents} sinh viên</p>
            <span className="text-[10px] text-slate-500">
              <strong className="text-emerald-600">{stats.submittedCount} đã nộp</strong> • <strong className="text-amber-600">{stats.inProgressCount} đang làm</strong> • {stats.notStartedCount} chưa làm
            </span>
          </div>
          <div className="p-4 bg-blue-50/60 border border-blue-200/70 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Điểm trung bình lớp</span>
            <p className="text-2xl font-black text-blue-900">{stats.avgScore} <span className="text-sm font-bold text-blue-600">/10</span></p>
            <span className="text-[10px] text-blue-600 font-medium">Tính trên các bài đã nộp</span>
          </div>
          <div className="p-4 bg-emerald-50/60 border border-emerald-200/70 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Tỉ lệ đạt chuẩn (≥ 5đ)</span>
            <p className="text-2xl font-black text-emerald-900">{stats.passRate}%</p>
            <span className="text-[10px] text-emerald-700 font-medium">{stats.passCount} đạt / {stats.failCount} chưa đạt</span>
          </div>
          <div className="p-4 bg-purple-50/60 border border-purple-200/70 rounded-2xl space-y-1">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Tiến độ hoàn thành</span>
            <p className="text-2xl font-black text-purple-900">
              {stats.totalStudents > 0 ? Math.round((stats.submittedCount / stats.totalStudents) * 100) : 0}%
            </p>
            <span className="text-[10px] text-purple-600 font-medium">Đã kết thúc bài thi</span>
          </div>
        </div>
      </div>

      {/* Bảng Danh Sách Cả Lớp */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
        {/* Thanh Tìm Kiếm, Bộ Lọc Trạng Thái & Sắp Xếp */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, email hoặc mã sinh viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Lọc Trạng Thái */}
            <div className="flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Tất cả sinh viên ({fullClassList.length})</option>
                <option value="submitted">Đã nộp bài ({stats.submittedCount})</option>
                <option value="in_progress">Đang làm bài ({stats.inProgressCount})</option>
                <option value="not_started">Chưa làm bài ({stats.notStartedCount})</option>
                <option value="pass">Đạt chuẩn (≥ 5đ)</option>
                <option value="fail">Chưa đạt (&lt; 5đ)</option>
              </select>
            </div>

            {/* Sắp xếp */}
            <div className="flex items-center space-x-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="default">Mặc định danh sách lớp</option>
                <option value="time_desc">Mới nộp gần nhất</option>
                <option value="score_desc">Điểm: Cao đến Thấp</option>
                <option value="score_asc">Điểm: Thấp đến Cao</option>
                <option value="name_asc">Tên sinh viên (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bảng Dữ Liệu */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-200/80">
                <th className="py-3.5 px-4 font-bold rounded-l-xl">STT</th>
                <th className="py-3.5 px-4 font-bold">Sinh viên</th>
                <th className="py-3.5 px-4 font-bold text-center">Trạng thái</th>
                <th className="py-3.5 px-4 font-bold">Thời gian làm</th>
                <th className="py-3.5 px-4 font-bold">Thời điểm nộp</th>
                {showViolationDetails && (
                  <th className="py-3.5 px-4 font-bold text-rose-600 text-center">Thoát trang</th>
                )}
                <th className="py-3.5 px-4 font-bold text-right">Điểm số</th>
                <th className="py-3.5 px-4 font-bold text-center rounded-r-xl">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {processedList.map((item, idx) => {
                const isSubmitted = item.status === "submitted";
                const isInProgress = item.status === "in_progress";
                const isPass = isSubmitted && (item.score || 0) >= (exam?.pass_score || 5.0);

                return (
                  <tr key={item.student_id || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-400">{idx + 1}</td>
                    
                    {/* Cột Sinh Viên */}
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.avatar_url}
                          alt={item.student_name}
                          className="w-9 h-9 rounded-full border border-slate-200 object-cover shrink-0"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.student_name || "HV")}&background=random`;
                          }}
                        />
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{item.student_name}</h4>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {item.email ? item.email : `Mã SV: #${item.student_id}`}
                          </span>
                          {item.submission?.essay_file_url && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => setPreviewFile({ url: item.submission.essay_file_url, name: `Bài tự luận - ${item.student_name}` })}
                                className="text-blue-600 font-bold hover:underline inline-flex items-center space-x-1"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Xem tệp bài nộp</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Cột Trạng Thái (Đã nộp / Đang làm / Chưa làm) */}
                    <td className="py-4 px-4 text-center">
                      {isSubmitted ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Đã nộp bài</span>
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[11px] bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                          <Radio className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                          <span>Đang làm bài ({item.in_progress_count}/{exam?.questions?.length || 5} câu)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full font-bold text-[11px] bg-slate-100 text-slate-500 border border-slate-200">
                          <MinusCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Chưa làm bài</span>
                        </span>
                      )}
                    </td>

                    {/* Thời gian làm bài */}
                    <td className="py-4 px-4 font-medium text-slate-600">
                      {isSubmitted && item.time_spent_secs
                        ? `${Math.floor(item.time_spent_secs / 60)}p ${item.time_spent_secs % 60}s`
                        : isInProgress
                        ? <span className="text-amber-700 font-bold">Đang tính giờ...</span>
                        : "--"}
                    </td>

                    {/* Ngày giờ nộp */}
                    <td className="py-4 px-4 text-slate-500">
                      {item.submitted_at
                        ? new Date(item.submitted_at).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric"
                          })
                        : isInProgress
                        ? <span className="text-amber-600 font-medium">Chưa bấm nộp</span>
                        : "--"}
                    </td>

                    {/* Cột Cảnh báo thoát trang */}
                    {showViolationDetails && (
                      <td className="py-4 px-4 text-center">
                        {item.violations_count > 0 ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[11px] rounded-lg">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>{item.violations_count} lần</span>
                          </span>
                        ) : isSubmitted || isInProgress ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-600 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>0 lần</span>
                          </span>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>
                    )}

                    {/* Điểm số */}
                    <td className="py-4 px-4 text-right">
                      {isSubmitted ? (
                        <div className="inline-flex flex-col items-end">
                          <span className={`px-3 py-1.5 rounded-xl font-black text-xs ${
                            isPass
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {item.score}/10 Điểm
                          </span>
                          {item.total_correct !== null && (
                            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                              ({item.total_correct}/{exam?.questions?.length || exam?.total_questions || 10} câu đúng)
                            </span>
                          )}
                        </div>
                      ) : isInProgress ? (
                        <span className="text-amber-600 font-bold text-xs">Đang chấm điểm...</span>
                      ) : (
                        <span className="text-slate-300 font-bold text-xs">Chưa có điểm</span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="py-4 px-4 text-center">
                      {isSubmitted ? (
                        <button
                          type="button"
                          onClick={() => setSelectedSubmissionDetail(item.submission)}
                          className="p-2 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition cursor-pointer"
                          title="Xem chi tiết đối chiếu bài làm"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-300">--</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {processedList.length === 0 && (
            <div className="py-16 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-xs">
              {searchTerm ? "Không tìm thấy sinh viên nào phù hợp với từ khóa." : "Chưa có sinh viên nào trong danh sách lớp."}
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL XEM CHI TIẾT ĐỐI CHIẾU BÀI LÀM ================= */}
      {selectedSubmissionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center shrink-0 border-b border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md text-[10px] font-black uppercase">
                  Chi tiết bài làm
                </span>
                <h3 className="font-extrabold text-base text-white mt-1">
                  Sinh viên: {selectedSubmissionDetail.student_name} (Mã: #{selectedSubmissionDetail.student_id})
                </h3>
              </div>
              <button onClick={() => setSelectedSubmissionDetail(null)} className="p-1.5 hover:bg-white/10 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
              {/* Thống kê nhanh bài làm */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border">
                  <span className="text-slate-400 font-medium">Kết quả chấm điểm</span>
                  <h4 className="text-lg font-black text-slate-900 mt-0.5">
                    {selectedSubmissionDetail.score}/10đ ({selectedSubmissionDetail.total_correct || 0} câu đúng)
                  </h4>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border">
                  <span className="text-slate-400 font-medium">Thời gian hoàn thành</span>
                  <h4 className="text-lg font-black text-blue-600 mt-0.5">
                    {Math.floor((selectedSubmissionDetail.time_spent_secs || 60) / 60)} phút {(selectedSubmissionDetail.time_spent_secs || 60) % 60} giây
                  </h4>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border">
                  <span className="text-slate-400 font-medium">Lịch sử thoát tab</span>
                  <h4 className="text-lg font-black text-rose-600 mt-0.5">
                    {selectedSubmissionDetail.violations_count || 0} lần ghi nhận
                  </h4>
                </div>
              </div>

              {/* Nhật ký vi phạm chuyển tab chi tiết */}
              {selectedSubmissionDetail.violation_logs && selectedSubmissionDetail.violation_logs.length > 0 && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                  <h4 className="font-extrabold text-rose-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Chi tiết nhật ký thoát trang của thí sinh</span>
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedSubmissionDetail.violation_logs.map((v, vIdx) => (
                      <div key={vIdx} className="text-[11px] text-rose-700 flex justify-between">
                        <span>• {v.warning_msg || "Chuyển sang ứng dụng/cửa sổ khác"}</span>
                        <span className="font-mono text-rose-500">{new Date(v.timestamp).toLocaleTimeString("vi-VN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Đối chiếu từng câu hỏi trắc nghiệm */}
              {exam?.questions && exam.questions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-black text-slate-900 text-sm">Đối chiếu câu hỏi & Đáp án sinh viên đã chọn</h4>
                  {exam.questions.map((q, qIdx) => {
                    const studentChoice = selectedSubmissionDetail.answers?.[String(qIdx)];
                    const hasAnswered = studentChoice !== undefined && studentChoice !== null;
                    const isCorrect = hasAnswered && Number(studentChoice) === Number(q.correct_ans);

                    return (
                      <div
                        key={qIdx}
                        className={`p-4 rounded-2xl border space-y-3 transition-all ${
                          !hasAnswered
                            ? "bg-slate-50/80 border-slate-200"
                            : isCorrect
                            ? "bg-emerald-50/30 border-emerald-300"
                            : "bg-rose-50/30 border-rose-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-extrabold text-slate-900 text-xs">
                            {formatQuestionTitle(q.question, qIdx)}
                          </h5>

                          {!hasAnswered ? (
                            <span className="px-2.5 py-0.5 rounded font-black text-[10px] uppercase bg-slate-200 text-slate-600 border border-slate-300 flex items-center gap-1">
                              <MinusCircle className="w-3 h-3" />
                              <span>Chưa trả lời</span>
                            </span>
                          ) : isCorrect ? (
                            <span className="px-2.5 py-0.5 rounded font-black text-[10px] uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>Đúng ✓</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded font-black text-[10px] uppercase bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                              <X className="w-3 h-3 stroke-[3]" />
                              <span>Sai (Chọn: {String.fromCharCode(65 + studentChoice)})</span>
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(q.options || []).map((opt, oIdx) => {
                            const isChosenByStudent = hasAnswered && studentChoice === oIdx;
                            const isTheCorrectAnswer = q.correct_ans === oIdx;

                            return (
                              <div
                                key={oIdx}
                                className={`p-2.5 rounded-xl border font-medium flex items-center justify-between transition-all ${
                                  isTheCorrectAnswer
                                    ? "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-400"
                                    : isChosenByStudent
                                    ? "bg-rose-50 border-rose-400 text-rose-900 font-bold line-through"
                                    : "bg-white border-slate-200 text-slate-600 opacity-60"
                                }`}
                              >
                                <span>{opt}</span>
                                {isTheCorrectAnswer && (
                                  <span className="flex items-center space-x-1 text-[10px] text-emerald-700 font-black">
                                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                    <span>Đáp án đúng</span>
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button onClick={() => setSelectedSubmissionDetail(null)} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer">
                Đóng Báo Cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem Tệp Tự Luận Đính Kèm */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-5xl h-[90vh] bg-white rounded-3xl shadow-2xl border flex flex-col overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0 border-b border-slate-800">
              <h3 className="font-extrabold text-sm truncate">{previewFile.name}</h3>
              <button type="button" onClick={() => setPreviewFile(null)} className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 relative overflow-hidden">
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(previewFile.url)}&embedded=true`}
                title={previewFile.name}
                className="w-full h-full border-0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}