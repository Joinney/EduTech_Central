import React, { useState, useEffect } from "react"
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Clock, 
  PlusCircle, 
  FileText, 
  HelpCircle,
  Building2,
  GraduationCap,
  Plus,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  Download,
  X,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Video,
  Radio,
  ExternalLink,
  Copy
} from "lucide-react"

export default function CourseDetail({ course, onBack }) {
  const [activeTab, setActiveTab] = useState("lessons") // "lessons" | "assignments" | "quizzes" | "students"

  // 1. Quản lý trạng thái Phòng Meet / Live của lớp
  const [meetInfo, setMeetInfo] = useState({
    title: "Buổi học Trực tuyến: Ôn tập & Giải đáp thắc mắc",
    link: "https://meet.google.com/abc-defg-hij",
    startTime: "19:30 - 21:00",
    isActive: true
  })

  // 2. Quản lý Bài giảng
  const [lessons, setLessons] = useState(course.lessons || [])

  // 3. Quản lý Bài tập về nhà
  const [assignments, setAssignments] = useState(course.assignments || [])

  // 4. Quản lý Bài kiểm tra
  const [quizzes, setQuizzes] = useState(course.quizzes || [])

  // --- GỌI API KÉO DỮ LIỆU TỪ BACKEND LÊN KHI MỞ CHI TIẾT LỚP ---
  useEffect(() => {
    const fetchCourseDetails = async () => {
      const baseUrl = import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1";
      
      try {
        // 1. Kéo danh sách Bài giảng
        const resLessons = await fetch(`${baseUrl}/courses/${course.id}/lessons`);
        if (resLessons.ok) {
          const dataLessons = await resLessons.json();
          setLessons(dataLessons.data || dataLessons || []);
        }

        // 2. Kéo danh sách Bài tập
        const resAssignments = await fetch(`${baseUrl}/courses/${course.id}/assignments`);
        if (resAssignments.ok) {
          const dataAssignments = await resAssignments.json();
          setAssignments(dataAssignments.data || dataAssignments || []);
        }

        // 3. Kéo danh sách Bài kiểm tra
        const resQuizzes = await fetch(`${baseUrl}/courses/${course.id}/quizzes`);
        if (resQuizzes.ok) {
          const dataQuizzes = await resQuizzes.json();
          setQuizzes(dataQuizzes.data || dataQuizzes || []);
        }
      } catch (error) {
        console.error("Lỗi khi tải chi tiết lớp học:", error);
      }
    };

    if (course?.id) {
      fetchCourseDetails();
    }
  }, [course?.id]);

  // --- STATE DÀNH CHO MODAL ---
  const [modalType, setModalType] = useState(null) // "create" | "edit" | "view" | "meet" | null
  const [selectedItem, setSelectedItem] = useState(null)
  const [formCategory, setFormCategory] = useState("lesson") // "lesson" | "assignment" | "quiz"

  // Form State cho Bài học/Bài tập
  const [formData, setFormData] = useState({
    title: "",
    duration: "45 phút",
    content: "",
    dueDate: "",
    maxScore: 10,
    totalQuestions: 20,
    passScore: 5,
    description: ""
  })

  // Form State riêng cho Tạo phòng Meet
  const [meetForm, setMeetForm] = useState({
    title: meetInfo.title,
    link: meetInfo.link,
    startTime: meetInfo.startTime
  })

  // --- THAO TÁC MEET ---
  const handleSaveMeet = (e) => {
    e.preventDefault()
    setMeetInfo({
      ...meetForm,
      isActive: true
    })
    setModalType(null)
    alert("Đã cập nhật thông tin phòng học Meet thành công!")
  }

  // --- THAO TÁC MỞ MODAL THƯỜNG ---
  const handleOpenCreate = (category) => {
    setFormCategory(category)
    setFormData({
      title: "",
      duration: "45 phút",
      content: "",
      dueDate: "2026-08-30",
      maxScore: 10,
      totalQuestions: 20,
      passScore: 5,
      description: ""
    })
    setModalType("create")
  }

  const handleOpenEdit = (category, item) => {
    setFormCategory(category)
    setSelectedItem(item)
    setFormData({
      title: item.title || "",
      duration: item.duration || "45 phút",
      content: item.content || "",
      dueDate: item.dueDate || "",
      maxScore: item.maxScore || 10,
      totalQuestions: item.totalQuestions || 20,
      passScore: item.passScore || 5,
      description: item.description || ""
    })
    setModalType("edit")
  }

  const handleOpenView = (category, item) => {
    setFormCategory(category)
    setSelectedItem(item)
    setModalType("view")
  }

  // --- SUBMIT FORM TẠO / SỬA (Đã tích hợp API gọi Backend Golang) ---
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    // Lấy URL Backend từ biến môi trường (cổng 8002)
    const baseUrl = import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1";

    try {
      if (formCategory === "lesson") {
        if (modalType === "create") {
          // Bắn API tạo Bài giảng
          const response = await fetch(`${baseUrl}/courses/${course.id}/lessons`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formData.title,
              duration: formData.duration,
              content: formData.description,
            }),
          });
          
          if (response.ok) {
            const newLesson = await response.json();
            // Lấy data thực từ DB đẩy lên UI
            setLessons([...lessons, newLesson.data || newLesson]); 
          }
        } else if (modalType === "edit") {
          // Ghi chú: Cần bổ sung API PUT/PATCH trên Golang sau
          setLessons(lessons.map(l => l.id === selectedItem.id ? { ...l, title: formData.title, duration: formData.duration, content: formData.description } : l));
        }
      } 
      
      else if (formCategory === "assignment") {
        if (modalType === "create") {
          // Bắn API tạo Bài tập
          const response = await fetch(`${baseUrl}/courses/${course.id}/assignments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formData.title,
              due_date: formData.dueDate, // Backend Go thường dùng snake_case
              max_score: Number(formData.maxScore),
              description: formData.description,
            }),
          });

          if (response.ok) {
            const newAssignment = await response.json();
            setAssignments([...assignments, newAssignment.data || newAssignment]);
          }
        } else if (modalType === "edit") {
          setAssignments(assignments.map(a => a.id === selectedItem.id ? { ...a, title: formData.title, dueDate: formData.dueDate, maxScore: formData.maxScore, description: formData.description } : a));
        }
      } 
      
      else if (formCategory === "quiz") {
        if (modalType === "create") {
          // Bắn API tạo Quiz
          const response = await fetch(`${baseUrl}/courses/${course.id}/quizzes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formData.title,
              duration: formData.duration,
              total_questions: Number(formData.totalQuestions),
              pass_score: Number(formData.passScore),
              description: formData.description,
            }),
          });

          if (response.ok) {
            const newQuiz = await response.json();
            setQuizzes([...quizzes, newQuiz.data || newQuiz]);
          }
        } else if (modalType === "edit") {
          setQuizzes(quizzes.map(q => q.id === selectedItem.id ? { ...q, title: formData.title, duration: formData.duration, totalQuestions: formData.totalQuestions, description: formData.description } : q));
        }
      }

      setModalType(null);

    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu vào Backend:", error);
      alert("Lỗi kết nối máy chủ! Hãy mở Console F12 để kiểm tra.");
    }
  }

  // --- THAO TÁC XOÁ & ẨN/HIỆN ---
  const toggleVisibility = (category, id) => {
    if (category === "lesson") setLessons(lessons.map(l => l.id === id ? { ...l, isVisible: !l.isVisible } : l))
    if (category === "assignment") setAssignments(assignments.map(a => a.id === id ? { ...a, isVisible: !a.isVisible } : a))
    if (category === "quiz") setQuizzes(quizzes.map(q => q.id === id ? { ...q, isVisible: !q.isVisible } : q))
  }

  const handleDelete = (category, id) => {
    if (window.confirm("Thầy/Cô có chắc chắn muốn xóa mục này khỏi lớp học?")) {
      if (category === "lesson") setLessons(lessons.filter(l => l.id !== id))
      if (category === "assignment") setAssignments(assignments.filter(a => a.id !== id))
      if (category === "quiz") setQuizzes(quizzes.filter(q => q.id !== id))
    }
  }

  if (!course) return null

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Quay lại & Mã lớp */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-orange-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh sách lớp</span>
        </button>

        <span className="px-3 py-1 bg-orange-100 text-orange-600 font-mono font-extrabold text-xs rounded-lg">
          Mã lớp: {course.code}
        </span>
      </div>

      {/* Thông tin Lớp học & NÚT TẠO MEET */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-orange-500 text-white text-[10px] font-black uppercase rounded-md">
                {course.subject}
              </span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Đơn vị: <strong className="text-slate-700">{course.schoolName || "Chưa cập nhật"}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">{course.title}</h1>
          </div>

          {/* Cụm nút bấm Nhanh bao gồm BẮT ĐẦU MEET */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setModalType("meet")}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Video className="w-4 h-4 animate-pulse" />
              <span>Tạo / Mở Phòng Meet</span>
            </button>

            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-orange-500" />
              <span>Sĩ số: {course.studentsCount}/{course.maxStudents}</span>
            </div>
          </div>
        </div>

        {/* THÔNG BÁO PHÒNG MEET ĐANG HOẠT ĐỘNG (NẾU CÓ) */}
        {meetInfo.isActive && (
          <div className="p-3.5 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border border-red-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  {meetInfo.title}
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-extrabold rounded-md uppercase">Live</span>
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">Khung giờ: {meetInfo.startTime}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <a
                href={meetInfo.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <span>Vào Phòng Học</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>
      </div>

      {/* TABS CHỨC NĂNG */}
      <div className="flex border-b border-slate-200 space-x-6 overflow-x-auto">
        {[
          { id: "lessons", label: `Nội dung Bài giảng (${lessons.length})`, icon: BookOpen },
          { id: "assignments", label: `Bài tập về nhà (${assignments.length})`, icon: FileText },
          { id: "quizzes", label: `Bài kiểm tra / Thi (${quizzes.length})`, icon: HelpCircle },
          { id: "students", label: "Danh sách Học viên", icon: Users },
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ================= TAB 1: BÀI GIẢNG ================= */}
      {activeTab === "lessons" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Danh sách bài học trong lớp</h3>
            <button 
              onClick={() => handleOpenCreate("lesson")}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm Bài Học Mới</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {lessons.map((lesson, idx) => (
              <div 
                key={lesson.id} 
                className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between transition-all ${
                  lesson.isVisible !== false ? "bg-white border-slate-200/80" : "bg-slate-50/80 border-slate-200 opacity-75"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 font-extrabold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-900">{lesson.title}</h4>
                      {lesson.isVisible === false && (
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded">
                          Đã ẩn
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Thời lượng: {lesson.duration}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button onClick={() => handleOpenView("lesson", lesson)} className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl cursor-pointer" title="Xem chi tiết">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleVisibility("lesson", lesson.id)} className={`p-2 rounded-xl text-xs font-bold cursor-pointer ${lesson.isVisible !== false ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-600"}`} title={lesson.isVisible !== false ? "Ẩn bài" : "Hiện bài"}>
                    {lesson.isVisible !== false ? <CheckCircle2 className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleOpenEdit("lesson", lesson)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer" title="Chỉnh sửa"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete("lesson", lesson.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: BÀI TẬP VỀ NHÀ ================= */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Danh sách bài tập giao cho học viên</h3>
            <button onClick={() => handleOpenCreate("assignment")} className="flex items-center space-x-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Giao Bài Tập Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map(item => (
              <div key={item.id} className={`p-4 rounded-2xl border shadow-sm space-y-3 ${item.isVisible !== false ? "bg-white border-slate-200" : "bg-slate-50 opacity-75"}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">Hạn nộp: {item.dueDate || item.due_date}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isVisible !== false ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                    {item.isVisible !== false ? "Đang mở" : "Đã ẩn"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <span>Đã nộp bài: <strong className="text-slate-800">{item.submittedCount || 0}/{item.totalStudents || 0}</strong></span>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => handleOpenView("assignment", item)} className="p-1.5 text-slate-500 hover:text-orange-600 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => toggleVisibility("assignment", item.id)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg">{item.isVisible !== false ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                    <button onClick={() => handleOpenEdit("assignment", item)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete("assignment", item.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: BÀI KIỂM TRA ================= */}
      {activeTab === "quizzes" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Danh sách bài kiểm tra</h3>
            <button onClick={() => handleOpenCreate("quiz")} className="flex items-center space-x-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Tạo Đề Kiểm Tra</span>
            </button>
          </div>

          <div className="space-y-3">
            {quizzes.map(quiz => (
              <div key={quiz.id} className={`p-4 rounded-2xl border shadow-sm flex justify-between items-center ${quiz.isVisible !== false ? "bg-white border-slate-200" : "bg-slate-50 opacity-75"}`}>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-900">{quiz.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${quiz.isVisible !== false ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                      {quiz.isVisible !== false ? "Công khai" : "Đã ẩn"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Thời gian: {quiz.duration} • Số câu: {quiz.totalQuestions || quiz.total_questions} câu</p>
                </div>

                <div className="flex items-center space-x-1">
                  <button onClick={() => handleOpenView("quiz", quiz)} className="p-1.5 text-slate-500 hover:text-orange-600 rounded-lg"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => toggleVisibility("quiz", quiz.id)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg">{quiz.isVisible !== false ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                  </button>
                  <button onClick={() => handleOpenEdit("quiz", quiz)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete("quiz", quiz.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL TẠO / CẤP NHẬT PHÒNG MEET ================= */}
      {modalType === "meet" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border overflow-hidden relative max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Video className="w-5 h-5 text-rose-200 animate-pulse" />
                <h3 className="font-extrabold text-sm">Cấu Hình Phòng Học Live / Meet</h3>
              </div>
              <button onClick={() => setModalType(null)} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMeet} className="p-5 space-y-3 text-xs overflow-y-auto flex-1">
              <div>
                <label className="font-bold text-slate-700 uppercase">Tiêu đề buổi học trực tuyến *</label>
                <input
                  type="text"
                  required
                  value={meetForm.title}
                  onChange={(e) => setMeetForm({ ...meetForm, title: e.target.value })}
                  placeholder="VD: Buổi học Live: Ôn tập chương 1..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase">Đường dẫn Google Meet / Zoom URL *</label>
                <input
                  type="url"
                  required
                  value={meetForm.link}
                  onChange={(e) => setMeetForm({ ...meetForm, link: e.target.value })}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase">Khung giờ diễn ra</label>
                <input
                  type="text"
                  value={meetForm.startTime}
                  onChange={(e) => setMeetForm({ ...meetForm, startTime: e.target.value })}
                  placeholder="VD: Thứ 2 (19:30 - 21:00)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 text-[11px] font-medium leading-relaxed">
                💡 <strong>Mẹo:</strong> Sau khi xác nhận, đường dẫn Meet sẽ hiển thị ngay trên đầu trang chi tiết lớp học này để học viên tiện vào học.
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer shadow-md shadow-red-500/20">Lưu & Bắt Đầu Meet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DÙNG CHUNG ================= */}
      {modalType && modalType !== "meet" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border overflow-hidden relative max-h-[90vh] flex flex-col">
            
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <h3 className="font-extrabold text-sm capitalize">
                  {modalType === "view" && "Chi Tiết "}
                  {modalType === "create" && "Tạo "}
                  {modalType === "edit" && "Chỉnh Sửa "}
                  {formCategory === "lesson" ? "Bài Giảng" : formCategory === "assignment" ? "Bài Tập Về Nhà" : "Bài Kiểm Tra"}
                </h3>
              </div>
              <button onClick={() => setModalType(null)} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalType === "view" ? (
              <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{selectedItem?.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Mã thuộc lớp: {course.code}</p>
                </div>

                {formCategory === "assignment" && (
                  <div className="p-3 bg-slate-50 border rounded-xl flex justify-between text-slate-600 font-bold">
                    <span>Hạn nộp bài: {selectedItem?.dueDate || selectedItem?.due_date}</span>
                    <span>Thang điểm: {selectedItem?.maxScore || selectedItem?.max_score} điểm</span>
                  </div>
                )}

                {formCategory === "quiz" && (
                  <div className="p-3 bg-slate-50 border rounded-xl flex justify-between text-slate-600 font-bold">
                    <span>Thời gian làm: {selectedItem?.duration}</span>
                    <span>Số câu hỏi: {selectedItem?.totalQuestions || selectedItem?.total_questions} câu</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Nội dung / Mô tả chi tiết:</label>
                  <div className="p-3 bg-slate-50 border rounded-xl leading-relaxed text-slate-700">
                    {selectedItem?.description || selectedItem?.content || "Chưa có nội dung mô tả chi tiết."}
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button onClick={() => setModalType(null)} className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold cursor-pointer">Đóng</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitForm} className="p-5 space-y-3 overflow-y-auto flex-1 text-xs">
                <div>
                  <label className="font-bold text-slate-700 uppercase">Tiêu đề *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="VD: Nhập tiêu đề..."
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                {formCategory === "assignment" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 uppercase">Hạn nộp bài *</label>
                      <input
                        type="date"
                        required
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 uppercase">Thang điểm tối đa</label>
                      <input
                        type="number"
                        value={formData.maxScore}
                        onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                      />
                    </div>
                  </div>
                )}

                {(formCategory === "lesson" || formCategory === "quiz") && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 uppercase">Thời lượng dự kiến</label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="VD: 45 phút..."
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                      />
                    </div>
                    {formCategory === "quiz" && (
                      <div>
                        <label className="font-bold text-slate-700 uppercase">Số lượng câu hỏi</label>
                        <input
                          type="number"
                          value={formData.totalQuestions}
                          onChange={(e) => setFormData({ ...formData, totalQuestions: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 uppercase">Mô tả / Hướng dẫn chi tiết</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Nhập yêu cầu hoặc mô tả chi tiết..."
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium resize-none"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer">Hủy</button>
                  <button type="submit" className="px-5 py-2 bg-orange-500 text-white rounded-xl font-bold cursor-pointer shadow-md shadow-orange-500/20">Lưu Thay Đổi</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  )
}