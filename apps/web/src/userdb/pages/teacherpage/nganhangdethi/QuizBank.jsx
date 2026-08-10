import React, { useState } from "react"
import { 
  Plus, 
  Search, 
  Filter, 
  HelpCircle, 
  Clock, 
  FileCheck, 
  Award, 
  Eye, 
  Edit3, 
  Trash2, 
  Share2, 
  X, 
  Sparkles, 
  CheckCircle2, 
  FolderPlus,
  BookOpen
} from "lucide-react"

// Mẫu dữ liệu bộ đề thi ban đầu
const initialQuizzes = [
  {
    id: 1,
    title: "Đề Thi Giữa Kỳ Toán 12 - Chuyên Đề Hàm Số & Logarit",
    subject: "Toán Học",
    grade: "Lớp 12",
    type: "multiple_choice", // multiple_choice | essay | mixed
    totalQuestions: 40,
    duration: "60 phút",
    passScore: 5.0,
    usageCount: 12, // Số lần đã dùng cho các lớp
    isVisible: true,
    description: "Đề thi gồm 40 câu trắc nghiệm bao phủ toàn bộ kiến thức khảo sát hàm số, mũ và logarit."
  },
  {
    id: 2,
    title: "Bài Kiểm Tra 15 Phút - Kiến Thức ReactJS & Hooks",
    subject: "Công nghệ thông tin",
    grade: "Đại học / Đi làm",
    type: "multiple_choice",
    totalQuestions: 15,
    duration: "15 phút",
    passScore: 7.0,
    usageCount: 8,
    isVisible: true,
    description: "Kiểm tra nhanh mức độ hiểu về useState, useEffect và Custom Hooks."
  },
  {
    id: 3,
    title: "Đề Kiểm Tra Tự Luận - Luyện Viết IELTS Writing Task 2",
    subject: "Tiếng Anh",
    grade: "Mọi cấp độ",
    type: "essay",
    totalQuestions: 2,
    duration: "60 phút",
    passScore: 6.0,
    usageCount: 5,
    isVisible: false,
    description: "Đề kiểm tra kỹ năng viết bài luận IELTS theo các chủ đề Education & Technology."
  }
]

export default function QuizBank() {
  const [quizzes, setQuizzes] = useState(initialQuizzes)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingQuiz, setEditingQuiz] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    subject: "Toán Học",
    grade: "Lớp 12",
    type: "multiple_choice",
    totalQuestions: 20,
    duration: "45 phút",
    passScore: 5.0,
    description: ""
  })

  // Lọc bộ đề thi
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quiz.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = selectedSubject === "all" || quiz.subject === selectedSubject
    return matchesSearch && matchesSubject
  })

  // Thao tác Mở Modal Tạo Mới
  const handleOpenCreateModal = () => {
    setEditingQuiz(null)
    setFormData({
      title: "",
      subject: "Toán Học",
      grade: "Lớp 12",
      type: "multiple_choice",
      totalQuestions: 20,
      duration: "45 phút",
      passScore: 5.0,
      description: ""
    })
    setIsModalOpen(true)
  }

  // Thao tác Mở Modal Sửa
  const handleOpenEditModal = (quiz, e) => {
    e.stopPropagation()
    setEditingQuiz(quiz)
    setFormData({
      title: quiz.title,
      subject: quiz.subject,
      grade: quiz.grade,
      type: quiz.type,
      totalQuestions: quiz.totalQuestions,
      duration: quiz.duration,
      passScore: quiz.passScore,
      description: quiz.description
    })
    setIsModalOpen(true)
  }

  // Xử lý Submit Form
  const handleSubmitForm = (e) => {
    e.preventDefault()
    if (!formData.title) return

    if (editingQuiz) {
      // Cập nhật
      setQuizzes(quizzes.map(q => q.id === editingQuiz.id ? { ...q, ...formData } : q))
    } else {
      // Tạo mới
      const newQuiz = {
        id: Date.now(),
        ...formData,
        usageCount: 0,
        isVisible: true
      }
      setQuizzes([newQuiz, ...quizzes])
    }

    setIsModalOpen(false)
  }

  // Bật/Tắt Ẩn Hiện Đề Thi
  const toggleVisibility = (id, e) => {
    e.stopPropagation()
    setQuizzes(quizzes.map(q => q.id === id ? { ...q, isVisible: !q.isVisible } : q))
  }

  // Xóa Đề Thi
  const handleDeleteQuiz = (id, e) => {
    e.stopPropagation()
    if (window.confirm("Thầy/Cô có chắc chắn muốn xóa bộ đề thi này khỏi Ngân hàng đề?")) {
      setQuizzes(quizzes.filter(q => q.id !== id))
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* 1. HEADER KHU VỰC */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Ngân Hàng Đề Thi & Bài Kiểm Tra
            <span className="px-2.5 py-0.5 text-xs font-bold bg-orange-100 text-orange-600 rounded-full">
              {quizzes.length} Đề thi
            </span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Quản lý tập trung các bộ đề trắc nghiệm, tự luận để gán nhanh vào các lớp học.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Đề Thi Mới</span>
        </button>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng số câu hỏi</p>
            <h3 className="text-lg font-black text-slate-800">
              {quizzes.reduce((acc, q) => acc + Number(q.totalQuestions), 0)} Câu
            </h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bộ đề công khai</p>
            <h3 className="text-lg font-black text-slate-800">
              {quizzes.filter(q => q.isVisible).length} Đề
            </h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lượt gán vào Lớp</p>
            <h3 className="text-lg font-black text-slate-800">
              {quizzes.reduce((acc, q) => acc + q.usageCount, 0)} Lượt
            </h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Môn học đã tạo</p>
            <h3 className="text-lg font-black text-slate-800">
              {new Set(quizzes.map(q => q.subject)).size} Môn
            </h3>
          </div>
        </div>
      </div>

      {/* 3. TÌM KIẾM & LỌC */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm đề thi theo tên, môn học..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {[
            { id: "all", label: "Tất cả môn" },
            { id: "Toán Học", label: "Toán Học" },
            { id: "Công nghệ thông tin", label: "CNTT" },
            { id: "Tiếng Anh", label: "Tiếng Anh" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedSubject(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedSubject === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. DANH SÁCH BỘ ĐỀ THI (CARDS GRID) */}
      {filteredQuizzes.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
          Không tìm thấy đề thi nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((quiz) => (
            <div 
              key={quiz.id}
              className={`bg-white rounded-2xl border transition-all p-5 space-y-4 flex flex-col justify-between group shadow-sm hover:shadow-md ${
                quiz.isVisible ? "border-slate-200" : "border-slate-200 bg-slate-50/60 opacity-80"
              }`}
            >
              <div className="space-y-2.5">
                {/* Header Badge */}
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-black uppercase rounded-md">
                    {quiz.subject}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {quiz.grade}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                  {quiz.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {quiz.description}
                </p>

                {/* Specs Info */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] font-semibold text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
                    <span>{quiz.totalQuestions} câu hỏi</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>{quiz.duration}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button 
                  onClick={() => alert(`Xem thử đề thi: ${quiz.title}`)}
                  className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-xl flex items-center space-x-1 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem / Thi thử</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button 
                    onClick={(e) => toggleVisibility(quiz.id, e)}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                    title={quiz.isVisible ? "Ẩn đề thi" : "Hiện đề thi"}
                  >
                    {quiz.isVisible ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Eye className="w-4 h-4 text-slate-400" />}
                  </button>

                  <button 
                    onClick={(e) => handleOpenEditModal(quiz, e)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button 
                    onClick={(e) => handleDeleteQuiz(quiz.id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. MODAL TẠO / SỬA ĐỀ THI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <h3 className="font-extrabold text-sm">
                  {editingQuiz ? "Chỉnh Sửa Bộ Đề Thi" : "Tạo Bộ Đề Thi Mới"}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="font-bold text-slate-700 uppercase">Tên Bộ Đề Thi *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Đề Thi Giữa Kỳ Toán 12..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase">Môn Học *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="VD: Toán, Tiếng Anh..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Khối / Trình độ</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    <option value="Lớp 10">Lớp 10</option>
                    <option value="Lớp 11">Lớp 11</option>
                    <option value="Lớp 12">Lớp 12</option>
                    <option value="Đại học / Đi làm">Đại học / Đi làm</option>
                    <option value="Mọi cấp độ">Mọi cấp độ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase">Số lượng câu hỏi</label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={formData.totalQuestions}
                    onChange={(e) => setFormData({ ...formData, totalQuestions: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Thời gian làm bài</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="VD: 45 phút, 90 phút..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase">Mô tả / Hướng dẫn đề thi</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả phạm vi kiến thức hoặc hướng dẫn quy chế thi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold cursor-pointer shadow-md shadow-orange-500/20"
                >
                  {editingQuiz ? "Cập Nhật" : "Lưu Đề Thi"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}