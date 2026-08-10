import React, { useState } from "react"
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Edit3, 
  Trash2, 
  X, 
  Sparkles, 
  Building2, 
  BookOpen, 
  Download, 
  UserCheck
} from "lucide-react"

// Mẫu dữ liệu học viên ban đầu
const initialStudents = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "nguyenvanan@gmail.com",
    phone: "0901 234 567",
    courseName: "Toán Học Lớp 12A1",
    schoolName: "THPT Chuyên Lê Hồng Phong",
    joinedDate: "10/01/2026",
    avgScore: 8.5,
    attendanceRate: "95%",
    status: "active", // active | completed | warning
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Trần Thị Bích",
    email: "tranthibich@gmail.com",
    phone: "0912 345 678",
    courseName: "Lập trình ReactJS K15",
    schoolName: "Trung tâm EduTech Online",
    joinedDate: "12/01/2026",
    avgScore: 9.0,
    attendanceRate: "100%",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Lê Hoàng Cường",
    email: "lehoangcuong@gmail.com",
    phone: "0923 456 789",
    courseName: "Toán Học Lớp 12A1",
    schoolName: "THPT Chuyên Lê Hồng Phong",
    joinedDate: "15/01/2026",
    avgScore: 4.8,
    attendanceRate: "70%",
    status: "warning",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Phạm Minh Dung",
    email: "phamminhdung@gmail.com",
    phone: "0934 567 890",
    courseName: "Lập trình ReactJS K15",
    schoolName: "Trung tâm EduTech Online",
    joinedDate: "05/01/2026",
    avgScore: 9.5,
    attendanceRate: "98%",
    status: "completed",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop"
  }
]

export default function StudentList() {
  const [students, setStudents] = useState(initialStudents)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState(null) // Chi tiết học viên

  // Lọc học viên theo tìm kiếm, lớp học và trạng thái
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = selectedCourse === "all" || student.courseName === selectedCourse
    const matchesStatus = selectedStatus === "all" || student.status === selectedStatus
    return matchesSearch && matchesCourse && matchesStatus
  })

  // Xóa học viên khỏi lớp
  const handleDeleteStudent = (id) => {
    if (window.confirm("Thầy/Cô có chắc chắn muốn xóa học viên này khỏi lớp?")) {
      setStudents(students.filter(s => s.id !== id))
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* 1. HEADER KHU VỰC */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Danh Sách Học Viên
            <span className="px-2.5 py-0.5 text-xs font-bold bg-orange-100 text-orange-600 rounded-full">
              {students.length} Học viên
            </span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Quản lý thông tin cá nhân, theo dõi kết quả học tập và chuyên cần của học viên theo từng lớp.
          </p>
        </div>

        <button
          onClick={() => alert("Tính năng Xuất Báo Cáo Excel")}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Báo Cáo (Excel)</span>
        </button>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng sĩ số</p>
            <h3 className="text-lg font-black text-slate-800">{students.length} Học viên</h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đang theo học</p>
            <h3 className="text-lg font-black text-slate-800">
              {students.filter(s => s.status === "active").length} Học viên
            </h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Điểm TB Toàn Khóa</p>
            <h3 className="text-lg font-black text-slate-800">
              {(students.reduce((acc, s) => acc + s.avgScore, 0) / (students.length || 1)).toFixed(1)} / 10
            </h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cần hỗ trợ / Cảnh báo</p>
            <h3 className="text-lg font-black text-slate-800">
              {students.filter(s => s.status === "warning").length} Học viên
            </h3>
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
            placeholder="Tìm theo tên học viên, email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {[
            { id: "all", label: "Tất cả trạng thái" },
            { id: "active", label: "Đang học" },
            { id: "warning", label: "Cảnh báo" },
            { id: "completed", label: "Hoàn thành" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedStatus === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. BẢNG DANH SÁCH HỌC VIÊN */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Học viên</th>
                <th className="p-3.5">Lớp học / Trường</th>
                <th className="p-3.5">Ngày tham gia</th>
                <th className="p-3.5 text-center">Điểm TB</th>
                <th className="p-3.5 text-center">Chuyên cần</th>
                <th className="p-3.5 text-center">Trạng thái</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    Không tìm thấy học viên nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Học viên Info */}
                    <td className="p-3.5">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={student.avatar} 
                          alt={student.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm shrink-0" 
                        />
                        <div>
                          <h4 className="font-bold text-slate-900">{student.name}</h4>
                          <p className="text-[10px] text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Lớp & Trường */}
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block">{student.courseName}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {student.schoolName}
                        </span>
                      </div>
                    </td>

                    {/* Ngày tham gia */}
                    <td className="p-3.5 text-slate-600">{student.joinedDate}</td>

                    {/* Điểm trung bình */}
                    <td className="p-3.5 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded-md text-xs ${
                        student.avgScore >= 8.0 
                          ? "bg-emerald-50 text-emerald-600 font-black" 
                          : student.avgScore < 5.0 
                            ? "bg-red-50 text-red-600 font-black" 
                            : "bg-amber-50 text-amber-600 font-black"
                      }`}>
                        {student.avgScore}
                      </span>
                    </td>

                    {/* Tỷ lệ chuyên cần */}
                    <td className="p-3.5 text-center font-bold text-slate-800">{student.attendanceRate}</td>

                    {/* Trạng thái */}
                    <td className="p-3.5 text-center">
                      {student.status === "active" && (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold rounded-md">
                          Đang học
                        </span>
                      )}
                      {student.status === "warning" && (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-extrabold rounded-md">
                          Cảnh báo
                        </span>
                      )}
                      {student.status === "completed" && (
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-extrabold rounded-md">
                          Hoàn thành
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                          title="Xem thông tin chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a 
                          href={`mailto:${student.email}`}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Gửi Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa khỏi lớp"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL XEM CHI TIẾT HỌC VIÊN */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <h3 className="font-extrabold text-sm">Hồ Sơ Học Viên</h3>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="flex items-center space-x-4 border-b border-slate-100 pb-4">
                <img 
                  src={selectedStudent.avatar} 
                  alt={selectedStudent.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-orange-500 shadow-md"
                />
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900">{selectedStudent.name}</h3>
                  <p className="text-slate-500 font-medium">{selectedStudent.email} • {selectedStudent.phone}</p>
                  <span className="inline-block px-2.5 py-0.5 bg-orange-100 text-orange-600 font-extrabold text-[10px] rounded-md">
                    {selectedStudent.courseName}
                  </span>
                </div>
              </div>

              {/* Stats detail */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Điểm trung bình</span>
                  <p className="text-base font-black text-slate-800">{selectedStudent.avgScore} / 10</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Tỷ lệ chuyên cần</span>
                  <p className="text-base font-black text-slate-800">{selectedStudent.attendanceRate}</p>
                </div>
              </div>

              {/* Nhận xét của Giảng viên */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Nhận xét của Giảng viên:</label>
                <textarea
                  rows="3"
                  defaultValue={selectedStudent.avgScore >= 8.0 ? "Học viên siêng năng, tiếp thu bài tốt và làm bài đầy đủ." : "Cần tập trung hơn trong các buổi học tiếp theo."}
                  placeholder="Nhập nhận xét cá nhân cho học viên này..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium resize-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button onClick={() => setSelectedStudent(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer">
                  Đóng
                </button>
                <button onClick={() => { alert("Đã lưu nhận xét!"); setSelectedStudent(null) }} className="px-5 py-2 bg-orange-500 text-white rounded-xl font-bold cursor-pointer shadow-md shadow-orange-500/20">
                  Lưu Nhận Xét
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}