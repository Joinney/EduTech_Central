/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2, 
  Flag,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Bookmark,
  Send,
  CloudCheck,
  CloudSync
} from "lucide-react"
import { quizApi } from "../../../../api/quiz.api"

const cleanOptionText = (text) => {
  if (!text) return "";
  return text
    .replace(/\*+/g, "")
    .replace(/\[x\]/gi, "")
    .replace(/\(Đáp án chính xác\)/gi, "")
    .trim();
};

export default function ExamRoom() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Giám sát gian lận chạy ngầm
  const [violationsCount, setViolationsCount] = useState(0);
  const [violationLogs, setViolationLogs] = useState([]);

  // 🎯 Lấy thông tin người dùng từ localStorage (khớp bảng users)
  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const currentUserId = useMemo(() => {
    return Number(currentUser?.id_users || currentUser?.id || currentUser?.user_id || currentUser?.userId || 1);
  }, [currentUser]);

  const studentName = useMemo(() => {
    return (
      currentUser?.fullName ||
      currentUser?.full_name ||
      currentUser?.displayName ||
      currentUser?.name ||
      currentUser?.username ||
      currentUser?.email?.split("@")[0] ||
      "Học viên"
    );
  }, [currentUser]);

  // 🎯 Lấy chính xác avatar từ cột avatar của bảng users
  const studentAvatar = useMemo(() => {
    return currentUser?.avatar || currentUser?.avatar_url || "";
  }, [currentUser]);

  // 1. Khởi tạo hoặc khôi phục phiên từ Server
  useEffect(() => {
    const initOrResumeExam = async () => {
      if (!examId) return;
      try {
        setIsLoading(true);

        const res = await quizApi.startOrResumeSession(examId, currentUserId, studentName);
        
        if (res.is_expired) {
          alert("⏱ Thời gian làm bài của bạn đã kết thúc!");
          navigate(-1);
          return;
        }

        setExam(res.exam);
        setQuestions(res.exam?.questions || []);
        setTimeLeft(res.remaining_seconds);

        if (res.saved_answers) {
          setAnswers(res.saved_answers);
        }

        if (Array.isArray(res.saved_flagged)) {
          const flagMap = {};
          res.saved_flagged.forEach((idx) => {
            flagMap[idx] = true;
          });
          setFlaggedQuestions(flagMap);
        }

        if (res.violations_count) {
          setViolationsCount(res.violations_count);
        }
        if (res.violation_logs) {
          setViolationLogs(res.violation_logs);
        }

      } catch (err) {
        console.error("Lỗi khởi tạo phiên thi:", err);
        alert(err.response?.data?.error || "Không thể truy cập phòng thi!");
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };

    initOrResumeExam();
  }, [examId, currentUserId, studentName, navigate]);

  // 2. Tự động đồng bộ tiến độ lên Server
  const syncToServer = async (currentAnswers, currentFlagged, vCount, vLogs) => {
    try {
      setIsSyncing(true);
      const flaggedArray = Object.keys(currentFlagged)
        .filter((k) => currentFlagged[k])
        .map((k) => Number(k));

      await quizApi.saveSessionProgress(examId, {
        student_id: currentUserId,
        student_name: studentName,
        student_avatar: studentAvatar, // 👈 Gửi avatar khi sync tiến độ
        answers: currentAnswers,
        flagged_questions: flaggedArray,
        violations_count: vCount,
        violation_logs: vLogs
      });
    } catch (err) {
      console.warn("Lỗi tự động lưu:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // 3. Giám sát chuyển Tab ngầm
  useEffect(() => {
    if (!exam) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolationsCount((prev) => {
          const nextCount = prev + 1;
          const nextLogs = [
            ...violationLogs,
            { timestamp: new Date(), action: "TAB_SWITCH", warning_msg: "Chuyển sang tab khác" }
          ];
          setViolationLogs(nextLogs);
          syncToServer(answers, flaggedQuestions, nextCount, nextLogs);
          return nextCount;
        });
      }
    };

    const handleWindowBlur = () => {
      setViolationsCount((prev) => {
        const nextCount = prev + 1;
        const nextLogs = [
          ...violationLogs,
          { timestamp: new Date(), action: "WINDOW_BLUR", warning_msg: "Rời khỏi cửa sổ bài làm" }
        ];
        setViolationLogs(nextLogs);
        syncToServer(answers, flaggedQuestions, nextCount, nextLogs);
        return nextCount;
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [exam, answers, flaggedQuestions, violationLogs]);

  // 4. Đồng hồ đếm ngược
  useEffect(() => {
    if (!exam || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam, timeLeft]);

  // 5. Chọn / Xóa đáp án
  const handleSelectOption = (qIdxStr, oIdx) => {
    setAnswers((prev) => {
      const updated = { ...prev };
      if (updated[qIdxStr] === oIdx) {
        delete updated[qIdxStr];
      } else {
        updated[qIdxStr] = oIdx;
      }
      syncToServer(updated, flaggedQuestions, violationsCount, violationLogs);
      return updated;
    });
  };

  const handleToggleFlag = (qIdx) => {
    setFlaggedQuestions((prev) => {
      const updated = { ...prev, [qIdx]: !prev[qIdx] };
      syncToServer(answers, updated, violationsCount, violationLogs);
      return updated;
    });
  };

  const scrollToQuestion = (qIdx) => {
    const el = document.getElementById(`question-card-${qIdx}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const scrollToNextUnanswered = () => {
    const nextIdx = questions.findIndex((_, idx) => answers[String(idx)] === undefined);
    if (nextIdx !== -1) {
      scrollToQuestion(nextIdx);
    } else {
      alert("Bạn đã hoàn thành tất cả các câu hỏi!");
    }
  };

  // 🎯 6. Nộp bài thi (Đã bổ sung student_avatar)
  const handleSubmit = async (isAutoSubmit = false) => {
    if (!exam || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const totalMins = exam.duration_mins || 15;
      const timeSpent = totalMins * 60 - timeLeft;

      const payload = {
        student_id: currentUserId,
        student_name: studentName,
        student_avatar: studentAvatar, // 👈 Truyền đúng avatar từ bảng users
        answers: answers,
        violations_count: violationsCount,
        violation_logs: violationLogs,
        time_spent_secs: timeSpent > 0 ? timeSpent : 60,
        essay_file_url: ""
      };

      await quizApi.submitExam(examId, payload);

      if (isAutoSubmit) {
        alert("⏱ Đã hết thời gian làm bài! Hệ thống đã tự động thu bài của bạn.");
      } else {
        alert("🎉 Đã nộp bài thi thành công! Kết quả đã được ghi nhận.");
      }
      navigate(-1);
    } catch (err) {
      console.error("Lỗi nộp bài:", err);
      alert(err.response?.data?.error || "Có lỗi xảy ra khi nộp bài thi!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalQuestionsCount = questions.length || 1;
  const answeredCount = Object.keys(answers).length;
  const remainingCount = Math.max(0, questions.length - answeredCount);
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const progressPercent = Math.round((answeredCount / totalQuestionsCount) * 100);
  const isUrgentTime = timeLeft > 0 && timeLeft <= 300;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-3 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium text-slate-300">Đang khôi phục tiến độ từ Server & đồng bộ thời gian...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 animate-fadeIn font-sans">
      {/* HEADER CỐ ĐỊNH */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white px-4 sm:px-6 py-3 shadow-md flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (window.confirm("Rời khỏi phòng thi? Thời gian vẫn sẽ chạy tiếp tục trên máy chủ! Bạn có thể vào lại bất kỳ lúc nào trước khi hết giờ.")) {
                navigate(-1);
              }
            }}
            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
            title="Thoát tạm thời"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base leading-tight flex items-center gap-2">
              <span>{exam?.title}</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md font-bold flex items-center gap-1">
                <CloudCheck className="w-3 h-3" /> Đã lưu Server
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Thí sinh: <strong className="text-white">{studentName}</strong> • {questions.length} câu hỏi
            </p>
          </div>
        </div>

        {/* Đồng hồ đếm ngược */}
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-mono text-sm font-black transition-all ${
          isUrgentTime
            ? "bg-rose-500/20 border border-rose-500 text-rose-400 animate-pulse shadow-lg shadow-rose-500/20"
            : "bg-blue-600/20 border border-blue-500/30 text-blue-300 shadow-inner"
        }`}>
          <Clock className={`w-4 h-4 ${isUrgentTime ? "text-rose-400 animate-spin" : "text-blue-400"}`} />
          <span>
            {Math.floor(timeLeft / 60).toString().padStart(2, "0")}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>
      </header>

      {/* THÂN GIAO DIỆN 3 CỘT */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI: MA TRẬN SỐ CÂU */}
        <aside className="lg:col-span-3 lg:sticky lg:top-20 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-blue-600" />
                <span>Bảng câu hỏi</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500">
                {answeredCount}/{questions.length} câu
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 text-[10px] font-bold text-slate-500 pt-1">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Đã làm</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                <span>Xem lại</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200 shrink-0" />
                <span>Chưa làm</span>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-2 max-h-72 overflow-y-auto p-1">
              {questions.map((_, idx) => {
                const isAnswered = answers[String(idx)] !== undefined;
                const isFlagged = flaggedQuestions[idx];

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToQuestion(idx)}
                    className={`h-9 rounded-xl font-black text-xs transition-all relative flex items-center justify-center cursor-pointer active:scale-95 ${
                      isFlagged
                        ? "bg-amber-100 text-amber-900 border-2 border-amber-400 shadow-xs"
                        : isAnswered
                        ? "bg-emerald-500 text-white shadow-xs hover:bg-emerald-600"
                        : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={scrollToNextUnanswered}
              className="w-full py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Câu chưa làm tiếp theo</span>
            </button>
          </div>
        </aside>

        {/* CỘT GIỮA: NỘI DUNG CÂU HỎI */}
        <main className="lg:col-span-6 space-y-5 select-none">
          {isUrgentTime && (
            <div className="p-4 bg-rose-50 border-2 border-rose-400 rounded-3xl text-rose-800 flex items-center space-x-3 animate-pulse shadow-sm">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <div className="text-xs leading-relaxed">
                <strong className="font-black text-sm block">Thời gian sắp kết thúc!</strong>
                Còn chưa đầy 5 phút. Vui lòng rà soát lại và nhanh chóng chọn đáp án cho các câu còn trống.
              </div>
            </div>
          )}

          {questions.map((q, qIdx) => {
            const isFlagged = flaggedQuestions[qIdx];
            const isAnswered = answers[String(qIdx)] !== undefined;

            return (
              <div
                key={q.question_id || qIdx}
                id={`question-card-${qIdx}`}
                className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 scroll-mt-24 transition-all"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center">
                      {qIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {isAnswered ? "Đã trả lời ✓" : "Chưa chọn đáp án"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleFlag(qIdx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      isFlagged
                        ? "bg-amber-100 text-amber-800 border border-amber-300 font-black"
                        : "bg-slate-100 text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-amber-500 text-amber-600" : ""}`} />
                    <span>{isFlagged ? "Đang xem lại" : "Gắn cờ"}</span>
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-relaxed">
                  {q.question}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {(q.options || []).map((opt, oIdx) => {
                    const isSelected = answers[String(qIdx)] === oIdx;
                    return (
                      <div
                        key={oIdx}
                        onClick={() => handleSelectOption(String(qIdx), oIdx)}
                        className={`p-3.5 rounded-2xl border flex items-center space-x-3 cursor-pointer transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 font-bold shadow-xs ring-2 ring-blue-500/20"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100/80 border-slate-200 font-medium"
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-white text-blue-600" : "bg-white border border-slate-200 text-slate-700"
                        }`}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="text-xs sm:text-sm leading-relaxed">{cleanOptionText(opt)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </main>

        {/* CỘT PHẢI: TIẾN ĐỘ & NỘP BÀI */}
        <aside className="lg:col-span-3 lg:sticky lg:top-20 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Tiến độ bài làm</span>
              </h3>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-3xl font-black text-slate-900">{progressPercent}%</span>
                <span className="text-xs font-bold text-slate-400">
                  {answeredCount}/{questions.length} câu
                </span>
              </div>

              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mt-2 p-0.5 border border-slate-200/60">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Số câu đã làm:</span>
                <strong className="text-emerald-600 font-black">{answeredCount} câu</strong>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Số câu còn trống:</span>
                <strong className="text-rose-500 font-black">{remainingCount} câu</strong>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Số câu gắn cờ xem lại:</span>
                <strong className="text-amber-600 font-black">{flaggedCount} câu</strong>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  const confirmMsg = remainingCount > 0
                    ? `Bạn vẫn còn ${remainingCount} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài thi ngay?`
                    : "Bạn đã hoàn thành tất cả câu hỏi. Bạn có chắc muốn nộp bài?";
                  if (window.confirm(confirmMsg)) {
                    handleSubmit(false);
                  }
                }}
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isSubmitting ? "Đang gửi bài..." : "Nộp Bài & Kết Thúc"}</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}