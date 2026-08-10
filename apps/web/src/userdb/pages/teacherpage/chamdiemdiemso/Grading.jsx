import React, { useState } from "react"
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
  ExternalLink
} from "lucide-react"

// Mẫu dữ liệu bài nộp ban đầu
const initialSubmissions = [
  {
    id: 1,
    studentName: "Nguyễn Văn An",
    studentEmail: "nguyenvanan@gmail.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    assignmentTitle: "Bài tập 1: Xây dựng TodoList với React",
    courseName: "Lập trình ReactJS K15",
    submittedAt: "10/08/2026 - 20:15",
    status: "pending", // pending | graded
    score: null,
    feedback: "",
    fileUrl: "https://github.com/nguyenvanan/react-todolist-project",
    studentNote: "Em đã hoàn thành đủ các tính năng Thêm, Sửa, Xóa và lưu LocalStorage ạ."
  },
  {
    id: 2,
    studentName: "Trần Thị Bích",
    studentEmail: "tranthibich@gmail.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    assignmentTitle: "Bài tập 1: Xây dựng TodoList với React",
    courseName: "Lập trình ReactJS K15",
    submittedAt: "09/08/2026 - 18:30",
    status: "graded",
    score: 9.5,
    feedback: "Giao diện đẹp, code sạch sẽ, xử lý tốt các trường hợp lỗi.",
    fileUrl: "https://github.com/tranthibich/react-todo-app",
    studentNote: "Bài làm của em có làm thêm giao diện Dark/Light mode ạ."
  },
  {
    id: 3,
    studentName: "Lê Hoàng Cường",
    studentEmail: "lehoangcuong@gmail.com",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop",
    assignmentTitle: "Kiểm tra Giữa kỳ: Toán 12 - Hàm Số",
    courseName: "Toán Học Lớp 12A1",
    submittedAt: "10/08/2026 - 15:45",
    status: "pending",
    score: null,
    feedback: "",
    fileUrl: "https://example.com/bai-lam-toan-cuong.pdf",
    studentNote: "Em gửi file lời giải bài tự luận hình học không gian."
  }
]

export default function Grading() {
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // all | pending | graded
  
  // State phục vụ Modal Chấm điểm
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [gradingScore, setGradingScore] = useState("")
  const [gradingFeedback, setGradingFeedback] = useState("")

  // Lọc danh sách bài nộp
  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sub.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Mở Modal Chấm điểm
  const handleOpenGradingModal = (submission) => {
    setSelectedSubmission(submission)
    setGradingScore(submission.score !== null ? submission.score : "")
    setGradingFeedback(submission.feedback || "")
  }

  // Lưu điểm & Nhận xét
  const handleSaveGrading = (e) => {
    e.preventDefault()
    if (!selectedSubmission) return

    const numericScore = parseFloat(gradingScore)
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 10) {
      alert("Vui lòng nhập điểm số hợp lệ từ 0 đến 10!")
      return
    }

    setSubmissions(submissions.map(sub => {
      if (sub.id === selectedSubmission.id) {
        return {
          ...sub,
          status: "graded",
          score: numericScore,
          feedback: gradingFeedback
        }
      }
      return sub
    }))

    setSelectedSubmission(null)
  }

  // Chọn nhanh mẫu nhận xét
  const handleQuickFeedback = (text) => {
    setGradingFeedback(prev => prev ? `${prev} ${text}` : text)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* 1. HEADER KHU VỰC */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Chấm Điểm & Đánh Giá
            <span className="px-2.5 py-0.5 text-xs font-bold bg-orange-100 text-orange-600 rounded-full">
              {submissions.filter(s => s.status === "pending").length} Bài chờ chấm
            </span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Xem bài nộp của học viên, chấm điểm và gửi lời nhận xét trực tiếp.
          </p>
        </div>

        <button
          onClick={() => alert("Tính năng xuất bảng điểm tổng hợp")}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Bảng Điểm (Excel)</span>
        </button>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bài cần chấm ngay</p>
            <h3 className="text-lg font-black text-slate-800">
              {submissions.filter(s => s.status === "pending").length} Bài
            </h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đã hoàn thành chấm</p>
            <h3 className="text-lg font-black text-slate-800">
              {submissions.filter(s => s.status === "graded").length} Bài
            </h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Điểm trung bình bài chấm</p>
            <h3 className="text-lg font-black text-slate-800">
              {submissions.filter(s => s.score !== null).length > 0
                ? (submissions.filter(s => s.score !== null).reduce((acc, s) => acc + s.score, 0) / submissions.filter(s => s.score !== null).length).toFixed(1)
                : "0.0"} / 10
            </h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tỷ lệ hoàn thành</p>
            <h3 className="text-lg font-black text-slate-800">88%</h3>
          </div>
        </div>
      </div>

      {/* 3. TÌM KIẾM VÀ BỘ LỌC */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên học viên, bài tập..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {[
            { id: "all", label: "Tất cả bài nộp" },
            { id: "pending", label: "Chưa chấm điểm" },
            { id: "graded", label: "Đã chấm điểm" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. BẢNG DANH SÁCH BÀI NỘP */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Học viên</th>
                <th className="p-3.5">Bài tập / Lớp học</th>
                <th className="p-3.5">Thời gian nộp</th>
                <th className="p-3.5 text-center">Trạng thái</th>
                <th className="p-3.5 text-center">Điểm số</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    Chưa có bài nộp nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Học viên */}
                    <td className="p-3.5">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={sub.avatar} 
                          alt={sub.studentName} 
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900">{sub.studentName}</h4>
                          <p className="text-[10px] text-slate-400">{sub.studentEmail}</p>
                        </div>
                      </div>
                    </td>

                    {/* Tên Bài tập & Lớp */}
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block">{sub.assignmentTitle}</span>
                        <span className="text-[10px] text-orange-600 font-semibold">{sub.courseName}</span>
                      </div>
                    </td>

                    {/* Ngày nộp */}
                    <td className="p-3.5 text-slate-500">{sub.submittedAt}</td>

                    {/* Trạng thái */}
                    <td className="p-3.5 text-center">
                      {sub.status === "pending" ? (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-extrabold rounded-md inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Chờ chấm
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded-md inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã chấm
                        </span>
                      )}
                    </td>

                    {/* Điểm số */}
                    <td className="p-3.5 text-center font-bold">
                      {sub.score !== null ? (
                        <span className="px-2.5 py-1 bg-orange-50 text-orange-600 font-black text-xs rounded-lg">
                          {sub.score} / 10
                        </span>
                      ) : (
                        <span className="text-slate-300">--</span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenGradingModal(sub)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs inline-flex items-center space-x-1.5 transition-colors cursor-pointer ${
                          sub.status === "pending"
                            ? "bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
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
      </div>

      {/* 5. MODAL CHẤM ĐIỂM VÀ NHẬN XÉT */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <h3 className="font-extrabold text-sm">Chấm Điểm Bài Nộp Học Viên</h3>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveGrading} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              
              {/* Thông tin bài làm */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img src={selectedSubmission.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900">{selectedSubmission.studentName}</h4>
                      <p className="text-[10px] text-slate-400">{selectedSubmission.courseName}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{selectedSubmission.submittedAt}</span>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="font-bold text-slate-700 block mb-0.5">Tiêu đề bài tập:</span>
                  <p className="text-slate-800 font-semibold">{selectedSubmission.assignmentTitle}</p>
                </div>

                {selectedSubmission.studentNote && (
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-600 text-[11px] italic">
                    "Ghi chú từ học viên: {selectedSubmission.studentNote}"
                  </div>
                )}

                <div className="pt-1">
                  <a 
                    href={selectedSubmission.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 text-orange-600 hover:text-orange-700 font-bold underline"
                  >
                    <span>Xem đường dẫn bài nộp / File đính kèm</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Nhập Điểm Số */}
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-orange-600 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Mẫu nhận xét nhanh */}
              <div>
                <span className="font-bold text-slate-700 uppercase block mb-1.5">Chọn mẫu nhận xét nhanh:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Bài làm xuất sắc!",
                    "Trình bày sạch sẽ, chính xác.",
                    "Cần rèn luyện thêm kỹ năng xử lý ngoại lệ.",
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
                <label className="font-bold text-slate-700 uppercase block mb-1">Lời nhận xét / Góp ý</label>
                <textarea
                  rows="3"
                  value={gradingFeedback}
                  onChange={(e) => setGradingFeedback(e.target.value)}
                  placeholder="Nhập góp ý cho bài làm của học viên..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium resize-none focus:ring-2 focus:ring-orange-500/20"
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
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Lưu & Gửi Kết Quả
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}