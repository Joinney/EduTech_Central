import React, { useState, useEffect } from "react"
import { 
  ArrowLeft, BookOpen, FileText, HelpCircle, Building2,
  Video, PlayCircle, UploadCloud, CheckCircle2
} from "lucide-react"
import { courseService } from "../../../../api/course.api" // Import courseService chuẩn

export default function StudentCourseDetail({ course, onBack }) {
  const [activeTab, setActiveTab] = useState("lessons")
  const [lessons, setLessons] = useState([])
  const [assignments, setAssignments] = useState([])
  const [quizzes, setQuizzes] = useState([])

  // Kéo dữ liệu thực từ Backend dùng Axios API
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const [resL, resA, resQ] = await Promise.all([
          courseService.getLessonsByCourse(course.id),
          courseService.getAssignmentsByCourse(course.id),
          courseService.getQuizzesByCourse(course.id)
        ]);
        
        // Vì Axios trả về thẳng data nên ta parse như sau:
        setLessons(resL.data || resL || []);
        setAssignments(resA.data || resA || []);
        setQuizzes(resQ.data || resQ || []);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết lớp học:", error);
      }
    };
    
    if (course?.id) fetchCourseDetails();
  }, [course?.id]);

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Quay lại */}
      <button onClick={onBack} className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-sm">
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
                Giảng viên: <strong className="text-slate-700">GV. Phan Thuận</strong>
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
              className={`flex items-center space-x-2 pb-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
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
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-extrabold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{lesson.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Thời lượng: {lesson.duration}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-slate-50 hover:bg-blue-50 text-blue-600 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer">
                <PlayCircle className="w-4 h-4" />
                <span>Học ngay</span>
              </button>
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
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600">
                <span>Hạn nộp: {item.dueDate || item.due_date}</span>
                <span className="text-orange-600">Thang điểm: {item.maxScore || item.max_score}</span>
              </div>
              <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-colors cursor-pointer">
                <UploadCloud className="w-4 h-4" />
                <span>Nộp Bài Tập</span>
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
              </div>
              <button className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer">
                <CheckCircle2 className="w-4 h-4" />
                <span>Làm Bài Thi</span>
              </button>
            </div>
          ))}
          {quizzes.length === 0 && <div className="text-center p-8 text-xs text-slate-400">Chưa có bài kiểm tra nào.</div>}
        </div>
      )}
    </div>
  )
}