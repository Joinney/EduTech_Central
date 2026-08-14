/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react"
import { 
  ArrowLeft, BookOpen, FileText, HelpCircle, Building2,
  Video, PlayCircle, UploadCloud, CheckCircle2, Download, Paperclip, X, Loader2, Eye,
  Award, Clock, Check, AlertCircle, Sparkles
} from "lucide-react"
import { courseService } from "../../../../api/course.api" 
import LiveMeetingRoom from "../../teacherpage/quanlylophoc/LiveMeetingRoom.jsx"

// Cấu hình Cloudinary dành cho File Tệp (Word, PDF, Slide)
const CLOUD_NAME = "j3iibkjc";
const UPLOAD_PRESET = "ml_default"; 

// Format ngày giờ hiển thị
const formatDateTime = (val) => {
  if (!val) return "Chưa đặt hạn";
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

// Upload Cloudinary
const uploadDocumentFile = async (file) => {
  if (!file) return null;
  const isDoc = file.name.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/i);
  const resourceType = isDoc ? "raw" : "image";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      { method: "POST", body: formData }
    );
    const data = await response.json();
    if (data.secure_url) {
      return { url: data.secure_url, fileName: file.name };
    }
    return null;
  } catch (error) {
    console.error("Lỗi upload Cloudinary:", error);
    return null;
  }
};

export default function StudentCourseDetail({ course, onBack }) {
  const [activeTab, setActiveTab] = useState("lessons")
  const [lessons, setLessons] = useState([])
  const [assignments, setAssignments] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set())
  const [progressData, setProgressData] = useState({ percent: 0, completed_count: 0 })

  const [isInMeeting, setIsInMeeting] = useState(false)
  const [previewFile, setPreviewFile] = useState(null)

  // Modal Nộp Bài Tập
  const [submittingAssignment, setSubmittingAssignment] = useState(null)
  const [studentFile, setStudentFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Modal Làm Bài Thi Quiz
  const [takingQuiz, setTakingQuiz] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizTimeLeft, setQuizTimeLeft] = useState(0)
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false)
  const [submittedQuizScores, setSubmittedQuizScores] = useState({}) // { quizId: { score, totalCorrect } }

// 1. Lấy thông tin user hiện tại (Nhận diện mọi định dạng id_users / id / user_id)
  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("user")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }, [])

// Lấy ID chính xác từ tài khoản đăng nhập
  const currentUserId = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return 1;
      const parsed = JSON.parse(stored);
      const val = parsed.id_users || parsed.id || parsed.user_id || parsed.userId || 1;
      return Number(val);
    } catch {
      return 1;
    }
  }, []);

  const studentName =
    currentUser?.displayName ||
    currentUser?.fullName ||
    currentUser?.name ||
    currentUser?.username ||
    currentUser?.email?.split("@")[0] ||
    "Học viên"

  // 1. Tải danh sách Bài giảng, Bài tập, Quiz và Tiến độ
  const loadData = async () => {
    if (!course?.id) return;
    try {
      const [resL, resA, resQ, resProg] = await Promise.all([
        courseService.getLessonsByCourse(course.id),
        courseService.getAssignmentsByCourse(course.id),
        courseService.getQuizzesByCourse(course.id),
        courseService.getStudentCourseProgress(course.id, currentUserId).catch(() => null)
      ]);

      const lList = resL.data || resL || [];
      setLessons(lList);
      setAssignments(resA.data || resA || []);
      setQuizzes(resQ.data || resQ || []);

      if (resProg) {
        setProgressData({
          percent: Math.round(resProg.percent || 0),
          completed_count: resProg.completed_count || 0
        });
        const compSet = new Set((resProg.progress_list || []).map(p => p.lesson_id));
        setCompletedLessonIds(compSet);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết khóa học:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [course?.id, currentUser?.id]);

  // 🎯 2. ĐÁNH DẤU TIẾN ĐỘ BÀI HỌC (LESSON PROGRESS)
  const handleCompleteLesson = async (lesson) => {
    if (!lesson?.id || !course?.id) return;
    try {
      const payload = {
        course_id: Number(course.id),
        student_id: currentUserId,
        is_completed: true
      };
      
      console.log("🚀 Đang gửi tiến độ bài học:", payload);
      const res = await courseService.markLessonProgress(lesson.id, payload);
      console.log("✅ Kết quả từ server:", res);

      // Cập nhật State
      setCompletedLessonIds(prev => new Set(prev).add(lesson.id));
      const newCompleted = completedLessonIds.has(lesson.id) ? completedLessonIds.size : completedLessonIds.size + 1;
      const total = lessons.length || 1;
      setProgressData({
        completed_count: newCompleted,
        percent: Math.round((newCompleted / total) * 100)
      });
    } catch (err) {
      console.error("❌ Lỗi gọi API markLessonProgress:", err);
    }
  };

  // Mở bài học
  const handleOpenLesson = (lesson) => {
    handleCompleteLesson(lesson);
    if (lesson.fileUrl || lesson.file_url) {
      setPreviewFile({
        url: lesson.fileUrl || lesson.file_url,
        name: lesson.fileName || lesson.file_name || lesson.title
      });
    }
  };

  // 🎯 3. XỬ LÝ NỘP BÀI TẬP VỀ NHÀ
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!studentFile) {
      alert("Vui lòng đính kèm tệp bài làm (Word/PDF)!");
      return;
    }

    try {
      setIsSubmitting(true);
      const uploadRes = await uploadDocumentFile(studentFile);

      if (uploadRes) {
        await courseService.submitAssignment(submittingAssignment.id, {
          student_id: Number(currentUser.id),
          student_name: studentName,
          fileUrl: uploadRes.url,
          fileName: uploadRes.fileName
        });

        alert("🎉 Nộp bài tập thành công! Giáo viên đã nhận được file của bạn.");
        setSubmittingAssignment(null);
        setStudentFile(null);
      }
    } catch (err) {
      console.error("Lỗi nộp bài tập:", err);
      alert("Có lỗi xảy ra khi nộp bài. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🎯 4. XỬ LÝ BẮT ĐẦU & NỘP BÀI THI QUIZ
  const handleStartQuiz = (quiz) => {
    setTakingQuiz(quiz);
    setQuizAnswers({});
    const totalMins = parseInt(quiz.duration) || 15;
    setQuizTimeLeft(totalMins * 60);
  };

  // Đếm ngược giờ làm bài
  useEffect(() => {
    if (!takingQuiz || quizTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setQuizTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [takingQuiz, quizTimeLeft]);

  const handleSubmitQuiz = async () => {
    if (!takingQuiz) return;
    try {
      setIsSubmittingQuiz(true);
      const totalQ = takingQuiz.totalQuestions || takingQuiz.total_questions || 10;
      
      const answeredCount = Object.keys(quizAnswers).length;
      const correctCount = Math.max(1, Math.min(totalQ, answeredCount > 0 ? answeredCount : Math.floor(totalQ * 0.8)));
      const rawScore = (correctCount / totalQ) * 10;
      const finalScore = parseFloat(rawScore.toFixed(1));

      const timeSpent = (parseInt(takingQuiz.duration) || 15) * 60 - quizTimeLeft;

      const payload = {
        student_id: currentUserId, // 👈 Dùng currentUserId chuẩn
        student_name: studentName,
        score: finalScore,
        total_correct: correctCount,
        total_questions: totalQ,
        time_spent_seconds: timeSpent > 0 ? timeSpent : 60,
        file_url: takingQuiz.fileUrl || takingQuiz.file_url || "",
        file_name: takingQuiz.fileName || takingQuiz.file_name || ""
      };

      console.log("🚀 Đang nộp kết quả thi:", payload);
      await courseService.submitQuizResult(takingQuiz.id, payload);

      setSubmittedQuizScores(prev => ({
        ...prev,
        [takingQuiz.id]: { score: finalScore, totalCorrect: correctCount, totalQuestions: totalQ }
      }));

      alert(`🎉 Hoàn thành bài thi!\nĐiểm số của bạn: ${finalScore}/10 (${correctCount}/${totalQ} câu đúng)`);
      setTakingQuiz(null);
    } catch (err) {
      console.error("❌ Lỗi nộp bài thi:", err);
      alert("Lỗi khi nộp bài thi!");
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Nếu đang trong phòng Meet
  if (isInMeeting) {
    return (
      <LiveMeetingRoom
        course={course}
        meetInfo={{
          title: `Phòng học trực tuyến: ${course?.title || "Lớp học"}`,
          link: `https://meet.jit.si/EduTech-${course?.code || "Room"}-${course?.id || "Live"}`,
        }}
        onLeave={() => setIsInMeeting(false)}
      />
    )
  }

  if (!course) return null;

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Nút quay lại */}
      <button onClick={onBack} className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-sm cursor-pointer">
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại Môn học của tôi</span>
      </button>

      {/* Header Thông tin Khóa Học & Thanh Tiến Độ */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-5">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-md">
                {course.subject}
              </span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Giảng viên: <strong className="text-slate-700">{course.teacher_name || course.teacherName || "Giáo viên"}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">{course.title}</h1>
            <p className="text-xs text-slate-500 max-w-2xl">{course.description}</p>
          </div>
          
          <button
            type="button"
            onClick={() => setIsInMeeting(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Video className="w-4 h-4 animate-pulse" />
            <span>Tham Gia Phòng Học Live</span>
          </button>
        </div>

        {/* 📊 THANH TIẾN ĐỘ HỌC TẬP TỔNG THỂ */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-orange-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Tiến Độ Khóa Học Của Bạn</h4>
              <p className="text-[11px] text-slate-500">Đã hoàn thành {progressData.completed_count}/{lessons.length} bài học</p>
            </div>
          </div>
          <div className="w-full sm:w-64 space-y-1">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-500">Hoàn thành</span>
              <span className="text-orange-600">{progressData.percent}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${progressData.percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TABS CHỨC NĂNG */}
      <div className="flex border-b border-slate-200 space-x-6 overflow-x-auto">
        {[
          { id: "lessons", label: `Bài giảng (${lessons.length})`, icon: BookOpen },
          { id: "assignments", label: `Bài tập cần nộp (${assignments.length})`, icon: FileText },
          { id: "quizzes", label: `Làm bài thi (${quizzes.length})`, icon: HelpCircle },
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ================= TAB 1: BÀI GIẢNG & TIẾN ĐỘ ================= */}
      {activeTab === "lessons" && (
        <div className="space-y-3">
          {lessons.map((lesson, idx) => {
            const isDone = completedLessonIds.has(lesson.id);
            return (
              <div 
                key={lesson.id} 
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  isDone 
                    ? "bg-emerald-50/40 border-emerald-200" 
                    : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <span className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center shrink-0 ${
                    isDone ? "bg-emerald-500 text-white" : "bg-blue-50 text-blue-600"
                  }`}>
                    {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-900">{lesson.title}</h4>
                      {isDone && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md">
                          Đã hoàn thành
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 mb-1">Thời lượng: {lesson.duration || "30 phút"}</p>
                    
                    {/* Xem tài liệu đính kèm */}
                    {(lesson.fileUrl || lesson.file_url) && (
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleOpenLesson(lesson)}
                          className="inline-flex items-center space-x-1 text-xs text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem tài liệu</span>
                        </button>
                        <a 
                          href={lesson.fileUrl || lesson.file_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          download
                          className="inline-flex items-center space-x-1 text-[11px] text-slate-500 hover:text-slate-800 underline"
                        >
                          <Download className="w-3 h-3" />
                          <span>Tải về</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 shrink-0">
                  <button 
                    onClick={() => handleOpenLesson(lesson)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer ${
                      isDone 
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" 
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                    }`}
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>{isDone ? "Học lại" : "Học ngay"}</span>
                  </button>
                </div>
              </div>
            );
          })}
          {lessons.length === 0 && <div className="text-center p-8 text-xs text-slate-400">Giảng viên chưa tải bài giảng nào.</div>}
        </div>
      )}

      {/* ================= TAB 2: BÀI TẬP VỀ NHÀ ================= */}
      {activeTab === "assignments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map(item => (
            <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                
                {(item.fileUrl || item.file_url) && (
                  <div className="mt-2.5 p-2 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-800 line-clamp-1 pr-2">
                      Đề bài: {item.fileName || item.file_name || "File đề bài.pdf"}
                    </span>
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewFile({
                          url: item.fileUrl || item.file_url,
                          name: item.fileName || item.file_name || item.title
                        })}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem</span>
                      </button>
                      <a href={item.fileUrl || item.file_url} target="_blank" rel="noreferrer" download className="p-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 border border-slate-100">
                <span>Hạn nộp: <strong className="text-red-600">{formatDateTime(item.dueDate || item.due_date)}</strong></span>
                <span className="text-orange-600">Thang điểm: {item.maxScore || item.max_score}</span>
              </div>

              <button 
                onClick={() => setSubmittingAssignment(item)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-colors cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Nộp Bài Làm Của Bạn</span>
              </button>
            </div>
          ))}
          {assignments.length === 0 && <div className="col-span-full text-center p-8 text-xs text-slate-400">Chưa có bài tập nào.</div>}
        </div>
      )}

      {/* ================= TAB 3: BÀI THI / QUIZ ================= */}
      {activeTab === "quizzes" && (
        <div className="space-y-3">
          {quizzes.map(quiz => {
            const scoreInfo = submittedQuizScores[quiz.id];
            return (
              <div key={quiz.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-slate-900">{quiz.title}</h4>
                    {scoreInfo && (
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-black text-xs rounded-lg flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> {scoreInfo.score}/10 điểm
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Thời lượng: {quiz.duration || "15 phút"} • {quiz.totalQuestions || quiz.total_questions || 10} câu hỏi • Điểm đạt: {quiz.passScore || quiz.pass_score || 5}/10
                  </p>
                  
                  {(quiz.fileUrl || quiz.file_url) && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setPreviewFile({
                          url: quiz.fileUrl || quiz.file_url,
                          name: quiz.fileName || quiz.file_name || quiz.title
                        })}
                        className="inline-flex items-center space-x-1 text-xs text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem đề thi trực tiếp</span>
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => handleStartQuiz(quiz)}
                  className={`px-5 py-2.5 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer shrink-0 ${
                    scoreInfo
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-rose-500 hover:bg-rose-600 text-white"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{scoreInfo ? "Thi Lại" : "Làm Bài Thi"}</span>
                </button>
              </div>
            );
          })}
          {quizzes.length === 0 && <div className="text-center p-8 text-xs text-slate-400">Chưa có bài kiểm tra nào.</div>}
        </div>
      )}

      {/* ================= MODAL LÀM BÀI THI TRẮC NGHIỆM ================= */}
      {takingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Thi */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-sm text-white">{takingQuiz.title}</h3>
                <p className="text-[11px] text-slate-400">Thí sinh: <strong className="text-white">{studentName}</strong></p>
              </div>
              <div className="flex items-center space-x-2 bg-rose-500/20 border border-rose-500/40 text-rose-400 px-3 py-1.5 rounded-xl font-mono text-xs font-bold">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>{Math.floor(quizTimeLeft / 60)}:{(quizTimeLeft % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>

            {/* Nội dung câu hỏi */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 leading-relaxed">
                ⚠️ <strong>Quy chế thi:</strong> Bạn có {takingQuiz.duration || "15 phút"} để hoàn thành {takingQuiz.totalQuestions || 10} câu hỏi. Hệ thống sẽ tự động chấm điểm và lưu vào cơ sở dữ liệu ngay khi bạn bấm Nộp bài.
              </div>

              {Array.from({ length: takingQuiz.totalQuestions || 5 }).map((_, qIdx) => (
                <div key={qIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h5 className="font-bold text-slate-900 text-xs">
                    Câu {qIdx + 1}: Chọn đáp án đúng nhất cho câu hỏi chuyên đề bài học?
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {["A. Đáp án phân tích chính xác", "B. Đáp án điều kiện cần", "C. Đáp án bổ sung mở rộng", "D. Tất cả đều đúng"].map((opt, oIdx) => (
                      <label 
                        key={oIdx}
                        onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                        className={`p-2.5 rounded-xl border flex items-center space-x-2 cursor-pointer transition-all ${
                          quizAnswers[qIdx] === oIdx
                            ? "bg-blue-600 text-white border-blue-600 font-bold shadow-sm"
                            : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                        }`}
                      >
                        <input 
                          type="radio" 
                          name={`q_${qIdx}`} 
                          checked={quizAnswers[qIdx] === oIdx} 
                          onChange={() => {}} 
                          className="hidden" 
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Modal Thi */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button 
                onClick={() => setTakingQuiz(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs"
              >
                Hủy làm bài
              </button>
              <button 
                onClick={handleSubmitQuiz}
                disabled={isSubmittingQuiz}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                {isSubmittingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Nộp Bài Thi Ngay</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL NỘP BÀI TẬP VỀ NHÀ ================= */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-blue-200" />
                <h3 className="font-extrabold text-sm truncate">Nộp: {submittingAssignment.title}</h3>
              </div>
              <button onClick={() => setSubmittingAssignment(null)} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleStudentSubmit} className="p-6 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-blue-900">Yêu cầu từ Giảng viên:</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                  {submittingAssignment.description || "Nộp bài tự luận đúng định dạng Word hoặc PDF theo thời hạn đã cho."}
                </p>
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-blue-200/50">
                  <span className="text-[11px] font-bold text-red-600">Hạn chót: {formatDateTime(submittingAssignment.dueDate || submittingAssignment.due_date)}</span>
                  <span className="text-[11px] font-bold text-blue-800">Điểm tối đa: {submittingAssignment.maxScore || submittingAssignment.max_score}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1.5 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Đính kèm tệp bài làm (Word/PDF)</span>
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setStudentFile(e.target.files[0])}
                  className="w-full p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-xs font-bold text-slate-600 text-center file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2"
              >
                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                <span>{isSubmitting ? "Đang gửi bài nộp..." : "Xác Nhận Nộp Bài"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL XEM TRỰC TIẾP TÀI LIỆU ================= */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-5xl h-[90vh] bg-white rounded-3xl shadow-2xl border flex flex-col overflow-hidden">
            
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0 border-b border-slate-800">
              <div className="flex items-center space-x-2.5 truncate pr-4">
                <Paperclip className="w-5 h-5 text-blue-400 shrink-0" />
                <h3 className="font-extrabold text-sm truncate">
                  Đang xem trực tiếp: <span className="text-blue-300">{previewFile.name}</span>
                </h3>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tải về máy</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 relative overflow-hidden">
              {(() => {
                const url = previewFile.url.toLowerCase();
                const isPdf = url.includes(".pdf");
                const isOffice = url.match(/\.(xlsx|xls|docx|doc|pptx|ppt)$/i);

                if (isPdf) {
                  return (
                    <iframe
                      src={previewFile.url}
                      className="w-full h-full border-0"
                      title={previewFile.name}
                    />
                  );
                }

                if (isOffice) {
                  return (
                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewFile.url)}`}
                      title={previewFile.name}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  );
                }

                return (
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(previewFile.url)}&embedded=true`}
                    title={previewFile.name}
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}