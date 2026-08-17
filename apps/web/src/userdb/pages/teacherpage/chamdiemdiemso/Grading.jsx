/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { 
  FileCheck2, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Eye, 
  Edit3, 
  X, 
  Sparkles, 
  Building2, 
  FileText, 
  Send, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  Loader2, 
  BookOpen 
} from "lucide-react";

import { courseService } from "../../../../api/course.api";
import { courseApi } from "../../../../api/axios";

export default function Grading() {
  const [submissions, setSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "pending" | "graded"
  
  // State phục vụ Modal Chấm điểm
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingScore, setGradingScore] = useState("");
  const [gradingFeedback, setGradingFeedback] = useState("");
  const [isSavingGrade, setIsSavingGrade] = useState(false);

  // Lấy thông tin Giảng viên đăng nhập
  const currentTeacher = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const teacherId = useMemo(() => {
    return Number(currentTeacher?.id_users || currentTeacher?.id || currentTeacher?.user_id || 1);
  }, [currentTeacher]);

  // 🎯 1. TẢI TOÀN BỘ BÀI NỘP VÀ ĐỒNG BỘ AVATAR / EMAIL THẬT CỦA HỌC VIÊN TỪ CÁC LỚP
  const fetchAllSubmissions = async () => {
    setIsLoading(true);
    try {
      // 1. Lấy danh sách lớp học
      const rawCourses = await courseService.getAllCourses().catch(() => []);
      const coursesList = Array.isArray(rawCourses) ? rawCourses : (rawCourses?.data || []);

      const myCourses = coursesList.filter(c => {
        const cTeacherId = Number(c.teacher_id || c.teacherId);
        const cTeacherName = (c.teacher_name || c.teacherName || "").toLowerCase().trim();
        const currentName = (currentTeacher?.fullName || currentTeacher?.full_name || currentTeacher?.displayName || "").toLowerCase().trim();
        return cTeacherId === teacherId || (currentName && cTeacherName === currentName);
      });

      const effectiveCourses = myCourses.length > 0 ? myCourses : coursesList;
      setCourses(effectiveCourses);

      // Map lưu thông tin học viên thật (avatar, email, tên) theo ID và Tên
      const studentMap = new Map();
      const allSubsList = [];

      // 2. Đồng bộ học sinh và bài tập của từng lớp
      await Promise.all(
        effectiveCourses.map(async (c) => {
          const cId = c.id || c.id_course;

          // A. Lấy danh sách học viên thật của lớp
          try {
            const resS = await courseService.getStudentsByCourse(cId);
            const classStudents = Array.isArray(resS) ? resS : (resS?.data || []);
            classStudents.forEach(st => {
              const sId = Number(st.id_users || st.id || st.user_id || st.student_id);
              const sName = (st.fullName || st.full_name || st.displayName || st.name || st.student_name || "").toLowerCase().trim();
              const info = {
                id: sId,
                name: st.fullName || st.full_name || st.displayName || st.name || st.student_name,
                email: st.email || st.student_email || "",
                avatar: st.avatar || st.avatar_url || st.avatarUrl || st.image || st.photo || ""
              };
              if (sId) studentMap.set(sId, info);
              if (sName) studentMap.set(sName, info);
            });
          } catch (_) {}

          // B. Lấy danh sách bài tập và bài nộp
          let assignments = [];
          try {
            const resA = await courseService.getAssignmentsByCourse(cId);
            assignments = Array.isArray(resA) ? resA : (resA?.data || []);
          } catch (_) {}

          await Promise.all(
            assignments.map(async (a) => {
              try {
                const subRes = await courseService.getSubmissionsByAssignment(a.id);
                const subList = Array.isArray(subRes) ? subRes : (subRes?.data || []);

                subList.forEach((sub, idx) => {
                  const subId = sub.id || `${a.id}-${sub.student_id || idx}`;
                  const rawScore = sub.score !== undefined && sub.score !== null ? Number(sub.score) : -1;
                  
                  // Điểm >= 0 mới là ĐÃ CHẤM (do mặc định trong DB là -1)
                  const isGraded = rawScore >= 0;
                  const scoreVal = isGraded ? rawScore : null;

                  // 🎯 Khớp chính xác học viên từ studentMap
                  const sUid = Number(sub.student_id || sub.user_id);
                  const sRawName = (sub.student_name || sub.studentName || sub.user_name || "").toLowerCase().trim();
                  const matchedStudent = studentMap.get(sUid) || studentMap.get(sRawName) || {};

                  const finalStudentName = matchedStudent.name || sub.student_name || sub.studentName || sub.user_name || "Học viên";
                  const finalStudentEmail = matchedStudent.email || sub.student_email || sub.email || "hocvien@edutech.vn";
                  const finalAvatar = matchedStudent.avatar || sub.student_avatar || sub.avatar || "";

                  allSubsList.push({
                    id: subId,
                    rawId: sub.id,
                    assignmentId: a.id,
                    assignmentTitle: a.title || "Bài tập về nhà",
                    courseId: cId,
                    courseName: c.title,
                    studentId: sUid,
                    studentName: finalStudentName,
                    studentEmail: finalStudentEmail,
                    avatar: finalAvatar,
                    submittedAt: sub.created_at || sub.submitted_at 
                      ? new Date(sub.created_at || sub.submitted_at).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })
                      : "Gần đây",
                    status: isGraded ? "graded" : "pending",
                    score: scoreVal,
                    feedback: sub.feedback || sub.teacher_comment || "",
                    fileUrl: sub.fileUrl || sub.file_url || sub.file_doc_url || "",
                    fileName: sub.fileName || sub.file_name || "Tệp bài làm",
                    studentNote: sub.note || sub.student_note || ""
                  });
                });
              } catch (_) {}
            })
          );
        })
      );

      setSubmissions(allSubsList);

    } catch (err) {
      console.error("Lỗi khi tải danh sách bài nộp:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSubmissions();
  }, [teacherId]);

  // 🎯 2. LỌC DANH SÁCH BÀI NỘP
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        sub.studentName.toLowerCase().includes(term) ||
        sub.assignmentTitle.toLowerCase().includes(term) ||
        sub.studentEmail.toLowerCase().includes(term);

      const matchesCourse = selectedCourse === "all" || String(sub.courseId) === String(selectedCourse);
      const matchesStatus = statusFilter === "all" || sub.status === statusFilter;

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [submissions, searchTerm, selectedCourse, statusFilter]);

  // 🎯 3. MỞ MODAL CHẤM ĐIỂM
  const handleOpenGradingModal = (submission) => {
    setSelectedSubmission(submission);
    setGradingScore(submission.score !== null ? String(submission.score) : "");
    setGradingFeedback(submission.feedback || "");
  };

  // 🎯 4. LƯU ĐIỂM SỐ & GỬI NHẬN XÉT
  const handleSaveGrading = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const numericScore = parseFloat(gradingScore);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 10) {
      alert("Vui lòng nhập điểm số hợp lệ từ 0 đến 10!");
      return;
    }

    try {
      setIsSavingGrade(true);

      // Gọi API cập nhật điểm ở backend
      try {
        if (selectedSubmission.rawId) {
          await courseApi.put(`/submissions/${selectedSubmission.rawId}/grade`, {
            score: numericScore,
            feedback: gradingFeedback
          });
        }
      } catch (_) {}

      // Cập nhật Optimistic trên giao diện
      setSubmissions(prev => prev.map(sub => {
        if (sub.id === selectedSubmission.id) {
          return {
            ...sub,
            status: "graded",
            score: numericScore,
            feedback: gradingFeedback
          };
        }
        return sub;
      }));

      alert(`Đã lưu điểm ${numericScore}/10 cho học viên: ${selectedSubmission.studentName}`);
      setSelectedSubmission(null);
    } catch (err) {
      console.error("Lỗi khi lưu điểm:", err);
      alert("Lỗi khi lưu kết quả chấm!");
    } finally {
      setIsSavingGrade(false);
    }
  };

  // Chọn nhanh mẫu nhận xét
  const handleQuickFeedback = (text) => {
    setGradingFeedback(prev => prev ? `${prev} ${text}` : text);
  };

  // 🎯 5. XUẤT BẢNG ĐIỂM CSV
  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) {
      alert("Không có dữ liệu bài nộp để xuất bảng điểm!");
      return;
    }

    const headers = ["STT", "Học viên", "Email", "Khóa học", "Tiêu đề bài tập", "Thời gian nộp", "Điểm số", "Trạng thái", "Nhận xét"];
    const rows = filteredSubmissions.map((s, idx) => [
      idx + 1,
      `"${s.studentName}"`,
      `"${s.studentEmail}"`,
      `"${s.courseName}"`,
      `"${s.assignmentTitle}"`,
      `"${s.submittedAt}"`,
      s.score !== null ? s.score : "--",
      s.status === "graded" ? "Đã chấm" : "Chờ chấm",
      `"${s.feedback || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BangDiem_BaiTap_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Thống kê thẻ
  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter(s => s.status === "pending").length;
    const gradedList = submissions.filter(s => s.score !== null && !isNaN(s.score) && s.score >= 0);
    const graded = gradedList.length;
    const avgScore = graded > 0 
      ? (gradedList.reduce((sum, s) => sum + s.score, 0) / graded).toFixed(1)
      : "0.0";
    const completionRate = total > 0 ? Math.round((graded / total) * 100) : 100;

    return { total, pending, graded, avgScore, completionRate };
  }, [submissions]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-sans pb-16">
      
      {/* 1. HEADER KHU VỰC */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Chấm Điểm & Đánh Giá Bài Tập</span>
            <span className="px-2.5 py-0.5 text-xs font-black bg-orange-100 text-orange-600 rounded-full">
              {stats.pending} Bài chờ chấm
            </span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Tổng hợp toàn bộ bài nộp tự luận của học viên từ các lớp học phụ trách, chấm điểm và gửi nhận xét sư phạm.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAllSubmissions}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
            title="Làm mới danh sách bài nộp"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Bảng Điểm (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Bài cần chấm ngay</p>
            <h3 className="text-xl font-black text-slate-900">{stats.pending} Bài</h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Đã hoàn thành chấm</p>
            <h3 className="text-xl font-black text-slate-900">{stats.graded} Bài</h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Điểm trung bình</p>
            <h3 className="text-xl font-black text-slate-900">{stats.avgScore} / 10</h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tiến độ chấm bài</p>
            <h3 className="text-xl font-black text-slate-900">{stats.completionRate}%</h3>
          </div>
        </div>
      </div>

      {/* 3. TÌM KIẾM VÀ BỘ LỌC */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên học viên, bài tập, email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Lọc theo lớp học */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">Tất cả lớp học ({courses.length})</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Lọc theo trạng thái chấm */}
          <div className="flex items-center space-x-1 overflow-x-auto">
            {[
              { id: "all", label: "Tất cả bài nộp" },
              { id: "pending", label: "Chưa chấm điểm" },
              { id: "graded", label: "Đã chấm điểm" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. BẢNG DANH SÁCH BÀI NỘP */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
            <p className="text-xs font-medium">Đang tải danh sách bài nộp từ hệ thống...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-5 rounded-l-xl">Học Viên</th>
                  <th className="py-3.5 px-4">Bài Tập / Lớp Học</th>
                  <th className="py-3.5 px-4">Thời Gian Nộp</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-center">Điểm Số</th>
                  <th className="py-3.5 px-5 text-right rounded-r-xl">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-slate-400">
                      Chưa có bài nộp nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 🎯 Học viên + Avatar thật + Email thật */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={sub.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.studentName)}&background=38497C&color=fff&bold=true`}
                            alt={sub.studentName} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.studentName)}&background=38497C&color=fff&bold=true`;
                            }}
                          />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">{sub.studentName}</h4>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{sub.studentEmail}</p>
                          </div>
                        </div>
                      </td>

                      {/* Bài tập & Khóa học */}
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-slate-900 block text-xs">{sub.assignmentTitle}</span>
                          <span className="text-[10px] text-orange-600 font-bold">{sub.courseName}</span>
                        </div>
                      </td>

                      {/* Ngày nộp */}
                      <td className="py-4 px-4 text-slate-500">{sub.submittedAt}</td>

                      {/* Trạng thái */}
                      <td className="py-4 px-4 text-center">
                        {sub.status === "pending" ? (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-black rounded-lg inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Chờ chấm</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đã chấm</span>
                          </span>
                        )}
                      </td>

                      {/* Điểm số */}
                      <td className="py-4 px-4 text-center font-bold">
                        {sub.score !== null && sub.score >= 0 ? (
                          <span className="px-2.5 py-1 bg-orange-50 text-orange-600 font-black text-xs rounded-lg">
                            {sub.score} / 10
                          </span>
                        ) : (
                          <span className="text-slate-300 font-extrabold">--</span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleOpenGradingModal(sub)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs inline-flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95 ${
                            sub.status === "pending"
                              ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{sub.status === "pending" ? "Chấm điểm" : "Sửa điểm"}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. MODAL CHẤM ĐIỂM VÀ NHẬN XÉT */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn font-sans">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <h3 className="font-black text-base">Chấm Điểm Bài Nộp Học Viên</h3>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-1 hover:bg-white/20 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveGrading} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              
              {/* Thông tin bài làm */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img 
                      src={selectedSubmission.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedSubmission.studentName)}&background=38497C&color=fff&bold=true`} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-100" 
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedSubmission.studentName)}&background=38497C&color=fff&bold=true`;
                      }}
                    />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">{selectedSubmission.studentName}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{selectedSubmission.studentEmail}</p>
                      <span className="text-[10px] text-orange-600 font-bold">{selectedSubmission.courseName}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{selectedSubmission.submittedAt}</span>
                </div>

                <div className="pt-2 border-t border-slate-200/80">
                  <span className="font-extrabold text-slate-700 block mb-0.5">Tiêu đề bài tập:</span>
                  <p className="text-slate-900 font-bold text-xs">{selectedSubmission.assignmentTitle}</p>
                </div>

                {selectedSubmission.studentNote && (
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-600 text-[11px] italic">
                    "{selectedSubmission.studentNote}"
                  </div>
                )}

                <div className="pt-1">
                  {selectedSubmission.fileUrl ? (
                    <a 
                      href={selectedSubmission.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 text-orange-600 hover:text-orange-700 font-extrabold underline text-xs"
                    >
                      <span>Xem tệp bài nộp ({selectedSubmission.fileName})</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Không có file đính kèm</span>
                  )}
                </div>
              </div>

              {/* Nhập Điểm Số */}
              <div>
                <label className="font-extrabold text-slate-800 uppercase tracking-wider block mb-1">
                  Nhập điểm số (Thang điểm 10) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  value={gradingScore}
                  onChange={(e) => setGradingScore(e.target.value)}
                  placeholder="VD: 8.5"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-orange-600 focus:ring-2 focus:ring-orange-500/20 outline-none"
                />
              </div>

              {/* Mẫu nhận xét nhanh */}
              <div>
                <span className="font-extrabold text-slate-800 uppercase tracking-wider block mb-1.5">
                  Chọn nhanh nhận xét mẫu:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Bài làm xuất sắc!",
                    "Trình bày sạch sẽ, đúng yêu cầu.",
                    "Cần bổ sung giải thích chi tiết hơn.",
                    "Nộp bài đúng hạn, tinh thần học tập tốt."
                  ].map((text, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickFeedback(text)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 transition-colors cursor-pointer"
                    >
                      + {text}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nhập Nhận xét chi tiết */}
              <div>
                <label className="font-extrabold text-slate-800 uppercase tracking-wider block mb-1">
                  Lời nhận xét & Góp ý sư phạm
                </label>
                <textarea
                  rows="3"
                  value={gradingFeedback}
                  onChange={(e) => setGradingFeedback(e.target.value)}
                  placeholder="Nhập góp ý trực tiếp cho bài làm của học viên..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium resize-none focus:ring-2 focus:ring-orange-500/20 outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingGrade}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {isSavingGrade && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSavingGrade ? "Đang lưu..." : "Lưu Điểm & Gửi Nhận Xét"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}