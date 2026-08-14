/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react"
import { 
  ArrowLeft, BookOpen, FileText, HelpCircle, Building2,
  Video, PlayCircle, UploadCloud, CheckCircle2, Download, Paperclip, X, Loader2, Eye
} from "lucide-react"
import { courseService } from "../../../../api/course.api" 

// Cấu hình Cloudinary MỚI dành riêng cho File Tệp (Word, PDF, Slide)
const CLOUD_NAME = "j3iibkjc";
const UPLOAD_PRESET = "ml_default"; 

// Hàm Upload Cloudinary thông minh phân loại file raw / image
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
    console.error("Lỗi upload Cloudinary Document:", error);
    return null;
  }
};

export default function StudentCourseDetail({ course, onBack }) {
  const [activeTab, setActiveTab] = useState("lessons")
  const [lessons, setLessons] = useState([])
  const [assignments, setAssignments] = useState([])
  const [quizzes, setQuizzes] = useState([])

  // State lưu file đang xem trực tiếp (Embedded Viewer)
  const [previewFile, setPreviewFile] = useState(null) // { url: "...", name: "..." }

  // Modal Nộp Bài Tập
  const [submittingAssignment, setSubmittingAssignment] = useState(null)
  const [studentFile, setStudentFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Kéo dữ liệu thực từ Backend
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const [resL, resA, resQ] = await Promise.all([
          courseService.getLessonsByCourse(course.id),
          courseService.getAssignmentsByCourse(course.id),
          courseService.getQuizzesByCourse(course.id)
        ]);
        
        setLessons(resL.data || resL || []);
        setAssignments(resA.data || resA || []);
        setQuizzes(resQ.data || resQ || []);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết lớp học:", error);
      }
    };
    
    if (course?.id) fetchCourseDetails();
  }, [course?.id]);

  // Xử lý sự kiện học sinh bấm nút Nộp Bài
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!studentFile) {
      alert("Vui lòng đính kèm tệp bài làm (Word/PDF)!");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 1. Đẩy file bài làm lên Cloudinary mới
      const uploadRes = await uploadDocumentFile(studentFile);
      
      if (uploadRes) {
        // 2. Lấy thông tin tài khoản thật từ LocalStorage
        const storedUser = localStorage.getItem("user");
        const currentUser = storedUser ? JSON.parse(storedUser) : {
          id: 999,
          name: "Học sinh Ẩn danh",
          email: "student@gmail.com"
        };
        const studentName = currentUser.displayName || currentUser.fullName || currentUser.name || currentUser.username || currentUser.email?.split('@')[0] || "Học sinh Ẩn danh";

        // 3. Gửi thông tin nộp bài về cho Golang
        const baseUrl = import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1";
        const response = await fetch(`${baseUrl}/assignments/${submittingAssignment.id}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: currentUser.id,
            student_name: studentName,
            fileUrl: uploadRes.url,
            fileName: uploadRes.fileName,
          }),
        });

        if (response.ok) {
          alert("🎉 Nộp bài tập thành công! Giáo viên đã nhận được file của bạn.");
          setSubmittingAssignment(null);
          setStudentFile(null);
        } else {
          alert("Có lỗi xảy ra trong lúc gửi dữ liệu, vui lòng thử lại.");
        }
      }
    } catch (err) {
      console.error("Lỗi nộp bài:", err);
      alert("Lỗi kết nối đến máy chủ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Quay lại */}
      <button onClick={onBack} className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-sm cursor-pointer">
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại Môn học của tôi</span>
      </button>

      {/* Thông tin Lớp học */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-md">
                {course.subject}
              </span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Giảng viên: <strong className="text-slate-700">{course.teacher_name || course.teacherName || "Giáo viên"}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">{course.title}</h1>
          </div>
          
          <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer">
            <Video className="w-4 h-4" />
            <span>Tham Gia Phòng Học Live</span>
          </button>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>
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

      {/* TAB 1: BÀI GIẢNG */}
      {activeTab === "lessons" && (
        <div className="space-y-3">
          {lessons.map((lesson, idx) => (
            <div key={lesson.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{lesson.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 mb-1">Thời lượng: {lesson.duration}</p>
                  
                  {/* Hiển thị Slide PDF đính kèm nếu có */}
                  {(lesson.fileUrl || lesson.file_url) && (
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setPreviewFile({
                          url: lesson.fileUrl || lesson.file_url,
                          name: lesson.fileName || lesson.file_name || lesson.title
                        })}
                        className="inline-flex items-center space-x-1 text-xs text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem tài liệu trực tiếp</span>
                      </button>

                      <a 
                        href={lesson.fileUrl || lesson.file_url} 
                        target="_blank" 
                        rel="noreferrer"
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
                <button className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer">
                  <PlayCircle className="w-4 h-4" />
                  <span>Học ngay</span>
                </button>
              </div>
            </div>
          ))}
          {lessons.length === 0 && <div className="text-center p-8 text-xs text-slate-400">Giảng viên chưa tải bài giảng nào.</div>}
        </div>
      )}

      {/* TAB 2: BÀI TẬP VỀ NHÀ */}
      {activeTab === "assignments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map(item => (
            <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                
                {/* Đề bài đính kèm */}
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
                        <Eye className="w-3 h-3" />
                        <span>Xem</span>
                      </button>

                      <a href={item.fileUrl || item.file_url} target="_blank" rel="noreferrer" className="p-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 border border-slate-100">
                <span>Hạn nộp: <strong className="text-slate-800">{item.dueDate || item.due_date}</strong></span>
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

      {/* TAB 3: BÀI KIỂM TRA */}
      {activeTab === "quizzes" && (
        <div className="space-y-3">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">{quiz.title}</h4>
                <p className="text-[11px] text-slate-500">Thời gian: {quiz.duration} • {quiz.totalQuestions || quiz.total_questions} câu trắc nghiệm</p>
                
                {/* Đề thi đính kèm */}
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
              <button className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                <span>Làm Bài Thi</span>
              </button>
            </div>
          ))}
          {quizzes.length === 0 && <div className="text-center p-8 text-xs text-slate-400">Chưa có bài kiểm tra nào.</div>}
        </div>
      )}

      {/* ================= MODAL NỘP BÀI LÀM (STUDENT) ================= */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-blue-200" />
                <h3 className="font-extrabold text-sm">Nộp Bài Tập: {submittingAssignment.title}</h3>
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
                  <span className="text-[11px] font-bold text-red-600">Hạn chót: {submittingAssignment.dueDate || submittingAssignment.due_date}</span>
                  <span className="text-[11px] font-bold text-blue-800">Điểm tối đa: {submittingAssignment.maxScore || submittingAssignment.max_score}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1.5 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Đính kèm tệp bài làm của bạn (Word/PDF)</span>
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

      {/* ================= MODAL XEM TRỰC TIẾP TÀI LIỆU (EMBEDDED VIEWER) ================= */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-5xl h-[90vh] bg-white rounded-3xl shadow-2xl border flex flex-col overflow-hidden">
            
            {/* Header Modal Viewer */}
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

            {/* Frame nhúng nội dung tài liệu */}
            <div className="flex-1 bg-slate-100 relative overflow-hidden">
              {(() => {
                const url = previewFile.url.toLowerCase();
                const isPdf = url.includes(".pdf");
                const isOffice = url.match(/\.(xlsx|xls|docx|doc|pptx|ppt)$/i);

                if (isPdf) {
                  /* 🚀 1. FILE PDF: Trình duyệt đọc trực tiếp */
                  return (
                    <iframe
                      src={previewFile.url}
                      className="w-full h-full border-0"
                      title={previewFile.name}
                    />
                  );
                }

                if (isOffice) {
                  /* 🚀 2. FILE EXCEL / WORD / PPT: Dùng Microsoft Office Web Viewer */
                  return (
                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewFile.url)}`}
                      title={previewFile.name}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  );
                }

                /* 🚀 3. DỰ PHÒNG: Google Docs Viewer cho các định dạng khác */
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