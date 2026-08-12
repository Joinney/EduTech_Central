import React, { useState, useEffect } from "react"
import CourseDetail from "./CourseDetail.jsx"
// Đảm bảo đường dẫn này khớp với vị trí thực tế của file course.api.js so với file hiện tại
import { courseService } from "../../../../api/course.api" 
import { 
  Plus, 
  Search, 
  BookOpen, 
  Users, 
  Building2, 
  Eye, 
  Trash2, 
  X, 
  Sparkles,
  School,
  Globe,
  Image as ImageIcon,
  Loader2
} from "lucide-react"

// Danh sách ảnh mẫu gợi ý sẵn theo chủ đề
const PRESET_IMAGES = [
  { name: "Công nghệ / CNTT", url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop" },
  { name: "Toán Học", url: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop" },
  { name: "Ngoại Ngữ / Tiếng Anh", url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop" },
  { name: "Khoa Học / Vật Lý", url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=600&auto=format&fit=crop" }
]

export default function CourseManagement() {
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [activeTypeTab, setActiveTypeTab] = useState("school") // "school" | "external"
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    type: "school",
    title: "",
    code: "",
    subject: "",
    schoolName: "",
    grade: "Lớp 12",
    maxStudents: 30,
    schedule: "",
    thumbnail: "",
    description: ""
  })

  // Gọi API lấy dữ liệu khi Component được mount
  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setIsLoading(true)
      const data = await courseService.getAllCourses()
      setCourses(data || [])
    } catch (error) {
      console.error("Lỗi khi tải danh sách lớp học:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Lọc theo Loại lớp và Từ khóa tìm kiếm
  const filteredCourses = courses.filter(c => {
    const matchesType = c.type === activeTypeTab
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  // Thêm lớp mới (Bắn API POST)
  const handleCreateCourse = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.schoolName) return

    const defaultImg = formData.type === "school" 
      ? "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop"
      : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"

    const payload = {
      teacher_id: 1, 
      type: formData.type,
      title: formData.title,
      // Tự động sinh mã lớp ngẫu nhiên 6 ký tự
      code: `CLASS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`, 
      subject: formData.subject,
      schoolName: formData.schoolName,
      grade: formData.grade,
      maxStudents: Number(formData.maxStudents) || 30,
      schedule: formData.schedule || "Chưa xếp lịch",
      thumbnail: formData.thumbnail.trim() || defaultImg,
      description: formData.description || "Chưa có mô tả."
    }

    try {
      const newCourse = await courseService.createCourse(payload)
      setCourses([newCourse, ...courses])
      setIsModalOpen(false)
      setFormData({ type: "school", title: "", code: "", subject: "", schoolName: "", grade: "Lớp 12", maxStudents: 30, schedule: "", thumbnail: "", description: "" })
    } catch (error) {
      console.error("Lỗi khi tạo lớp học:", error)
      alert("Có lỗi xảy ra khi tạo lớp học!")
    }
  }

  // Xóa lớp học (Bắn API DELETE)
  const handleDeleteCourse = async (id, e) => {
    e.stopPropagation()
    if (window.confirm("Thầy/Cô có chắc chắn muốn xóa lớp học này?")) {
      try {
        await courseService.deleteCourse(id)
        setCourses(courses.filter(c => c.id !== id))
      } catch (error) {
        console.error("Lỗi khi xóa lớp học:", error)
        alert("Không thể xóa lớp học lúc này.")
      }
    }
  }

  if (selectedCourse) {
    return <CourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)} />
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Quản Lý Lớp & Khóa Học
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Phân loại giảng dạy theo Lớp trường học chính quy và Khóa học kỹ năng mở rộng.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ ...formData, type: activeTypeTab })
            setIsModalOpen(true)
          }}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-xl shadow-md hover:opacity-90 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Lớp Mới</span>
        </button>
      </div>

      {/* TABS PHÂN LOẠI CƠ BẢN */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
        <div className="flex items-center space-x-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTypeTab("school")}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTypeTab === "school"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <School className="w-4 h-4" />
            <span>Lớp Theo Trường Học ({courses.filter(c => c.type === "school").length})</span>
          </button>

          <button
            onClick={() => setActiveTypeTab("external")}
            className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTypeTab === "external"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Khóa Học Tự Do / Mở Rộng ({courses.filter(c => c.type === "external").length})</span>
          </button>
        </div>

        {/* Tìm kiếm */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên lớp, tên trường..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
      </div>

      {/* DANH SÁCH LỚP HỌC (CARDS CÓ HÌNH ẢNH) */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="text-xs font-medium">Đang tải dữ liệu khóa học...</span>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed text-slate-400 text-xs">
          Chưa có lớp học nào thuộc mục này.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <div 
              key={course.id}
              onClick={() => setSelectedCourse(course)}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group cursor-pointer"
            >
              {/* Ảnh bìa lớp học */}
              <div className="relative h-40 overflow-hidden bg-slate-100">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                
                <span className={`absolute top-3 left-3 px-2.5 py-0.5 text-[10px] font-black uppercase rounded-md shadow-sm ${
                  course.type === "school" ? "bg-blue-600 text-white" : "bg-purple-600 text-white"
                }`}>
                  {course.type === "school" ? "Lớp Trường" : "Khóa Ngoài"}
                </span>

                <span className="absolute top-3 right-3 px-2 py-0.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono font-bold rounded-md">
                  {course.code}
                </span>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-[10px] font-bold text-orange-300 uppercase tracking-wider">{course.subject}</p>
                  <h3 className="text-sm font-bold truncate leading-snug">{course.title}</h3>
                </div>
              </div>

              {/* Nội dung chi tiết ngắn */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center space-x-1.5 text-slate-500 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-semibold text-slate-700">{course.schoolName}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-orange-500" />
                    <span className="font-bold">
                      {course.studentsCount || 0}/{course.maxStudents} HS
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Vào Lớp</span>
                    </button>

                    <button 
                      onClick={(e) => handleDeleteCourse(course.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa lớp"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TẠO LỚP HỌC */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <h3 className="font-extrabold text-sm">Tạo Lớp / Khóa Học Mới</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateCourse} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              
              {/* 1. Chọn loại lớp */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Loại hình giảng dạy *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="school">Lớp Theo Trường Học Chính Quy</option>
                  <option value="external">Khóa Học Mở Rộng / Kỹ Năng Tự Do</option>
                </select>
              </div>

              {/* 2. Tên Lớp */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Tên Lớp / Khóa Học *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Toán 12A1 / Lập trình ReactJS..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* 3. Trường học & Môn học */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    {formData.type === "school" ? "Trường / Sở GD *" : "Trung tâm / Đơn vị *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    placeholder="VD: THPT Chuyên Lê Hồng Phong..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Môn học *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="VD: Toán, Tin học..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              {/* 4. Nhập Link Ảnh Bìa (URL) & Preview */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                    <span>Hình ảnh bìa của lớp (URL)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">(Không bắt buộc)</span>
                </label>

                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/... hoặc dán link ảnh"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-orange-500/20"
                />

                {/* Chọn nhanh mẫu ảnh có sẵn */}
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold mb-1">Hoặc chọn nhanh ảnh mẫu có sẵn:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_IMAGES.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, thumbnail: preset.url })}
                        className={`px-2 py-1 text-[10px] rounded-lg border font-bold transition-all cursor-pointer ${
                          formData.thumbnail === preset.url
                            ? "bg-orange-50 border-orange-500 text-orange-600"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview ảnh */}
                {formData.thumbnail && (
                  <div className="mt-2 relative h-28 rounded-xl overflow-hidden border border-slate-200">
                    <img 
                      src={formData.thumbnail} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.style.display = "none" }}
                    />
                    <span className="absolute bottom-1 right-2 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                      Xem trước ảnh
                    </span>
                  </div>
                )}
              </div>

              {/* 5. Lịch học & Mô tả */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Lịch học dự kiến</label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="VD: Thứ 2 - Thứ 6 (19:30 - 21:30)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-2 shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  Tạo Lớp Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}