import React, { useState, useMemo } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { 
  FolderTree, 
  FileText, 
  FileCheck2, 
  BookOpen, 
  GraduationCap, 
  Presentation,
  Search,
  SlidersHorizontal,
  Download,
  Eye,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  Award
} from "lucide-react"

// Cấu hình 5 danh mục tài liệu đồng bộ với Sidebar
const DOC_CATEGORIES = [
  {
    id: "giao-trinh",
    name: "Giáo trình & Bài giảng chuẩn",
    desc: "Giáo trình chuẩn bộ môn, bài giảng điện tử và đề cương chi tiết các môn học.",
    icon: FileText,
    bgLight: "bg-blue-50 text-blue-600 border-blue-100"
  },
  {
    id: "de-thi",
    name: "Đề thi & Đáp án chi tiết",
    desc: "Tổng hợp ngân hàng đề kiểm tra giữa kỳ, cuối kỳ, thi thử có đáp án và lời giải.",
    icon: FileCheck2,
    bgLight: "bg-emerald-50 text-emerald-600 border-emerald-100"
  },
  {
    id: "ebooks",
    name: "Sách & Ebook tham khảo",
    desc: "Tài liệu mở rộng, sách chuyên khảo, cẩm nang tra cứu học tập dạng số hóa.",
    icon: BookOpen,
    bgLight: "bg-amber-50 text-amber-600 border-amber-100"
  },
  {
    id: "nghien-cuu",
    name: "Bài báo & Đề tài nghiên cứu",
    desc: "Công trình nghiên cứu khoa học sinh viên, kỷ yếu hội thảo, luận văn mẫu.",
    icon: GraduationCap,
    bgLight: "bg-purple-50 text-purple-600 border-purple-100"
  },
  {
    id: "slide",
    name: "Slide & Tóm tắt kiến thức",
    desc: "Bản tóm tắt mindmap, slide thuyết trình bài giảng chắt lọc trọng tâm.",
    icon: Presentation,
    bgLight: "bg-rose-50 text-rose-600 border-rose-100"
  }
]

// Mock dữ liệu tài liệu có đầy đủ metadata học thuật trang bìa
const MOCK_DOCUMENTS = [
  {
    id: "doc-nghiencuu-01",
    title: "THỰC TRẠNG GIẢI QUYẾT TÌNH TRẠNG THẤT NGHIỆP Ở TRUNG QUỐC VÀ BÀI HỌC CHO VIỆT NAM",
    docSlug: "nghien-cuu",
    university: "TRƯỜNG ĐẠI HỌC KINH TẾ",
    faculty: "KHOA KINH TẾ CHÍNH TRỊ",
    instructor: "ThS. Nguyễn Thị Lan Hương",
    student: "Cao Mỹ Hạnh",
    studentId: "18050045",
    subject: "Kinh tế chính trị về cải cách kinh tế ở Trung Quốc",
    year: "Hà Nội - Năm 2020",
    format: "PDF",
    size: "4.8 MB",
    pages: 42,
    downloads: 1240,
    views: 3890
  },
  {
    id: "doc-gt-toan1",
    title: "GIÁO TRÌNH GIẢI TÍCH 1: PHÉP TÍNH VI PHÂN VÀ TÍCH PHÂN HÀM MỘT BIẾN SỐ",
    docSlug: "giao-trinh",
    university: "TRƯỜNG ĐẠI HỌC KHOA HỌC TỰ NHIÊN",
    faculty: "KHOA TOÁN - TIN HỌC",
    instructor: "PGS.TS. Trần Nhật Nam",
    student: "Nhóm Biên Soạn Học Thuật",
    studentId: "KHTN-2022",
    subject: "Toán học cao cấp & Giải tích ứng dụng",
    year: "TP. Hồ Chí Minh - Năm 2022",
    format: "PDF",
    size: "12.5 MB",
    pages: 284,
    downloads: 3540,
    views: 8900
  },
  {
    id: "doc-gt-triet",
    title: "BÀI TẬP LỚN TRIẾT HỌC MÁC - LÊNIN: QUY LUẬT LƯỢNG ĐỔI DẪN ĐẾN CHẤT ĐỔI",
    docSlug: "giao-trinh",
    university: "TRƯỜNG ĐẠI HỌC QUỐC GIA",
    faculty: "KHOA LÝ LUẬN CHÍNH TRỊ",
    instructor: "TS. Hoàng Đình Tuấn",
    student: "Nguyễn Văn An",
    studentId: "20021548",
    subject: "Triết học Mác - Lênin đại cương",
    year: "Hà Nội - Năm 2023",
    format: "PDF",
    size: "2.8 MB",
    pages: 35,
    downloads: 2150,
    views: 5600
  },
  {
    id: "doc-dt-tin",
    title: "NGÂN HÀNG ĐỀ THI VÀ LỜI GIẢI CHI TIẾT: CẤU TRÚC DỮ LIỆU VÀ GIẢI THUẬT NÂNG CAO",
    docSlug: "de-thi",
    university: "TRƯỜNG ĐẠI HỌC BÁCH KHOA",
    faculty: "KHOA KỸ THUẬT MÁY TÍNH",
    instructor: "ThS. Đỗ Tuấn Kiệt",
    student: "Hội đồng Khảo thí & Bộ môn",
    studentId: "CSE-BK",
    subject: "Lập trình C++ & Thuật toán",
    year: "Hà Nội - Năm 2024",
    format: "PDF",
    size: "6.2 MB",
    pages: 110,
    downloads: 4120,
    views: 11200
  },
  {
    id: "doc-eb-ielts",
    title: "CẨM NANG HƯỚNG DẪN TỰ ÔN LUYỆN KỸ NĂNG IELTS WRITING TASK 2 TỪ BAND 5.0 LÊN 7.5",
    docSlug: "ebooks",
    university: "VIỆN NGOẠI NGỮ & ĐÀO TẠO QUỐC TẾ",
    faculty: "TRUNG TÂM KHẢO THÍ HỌC THUẬT",
    instructor: "Cô Sarah Davis (8.5 IELTS)",
    student: "Ban Học Liệu Ngoại Ngữ",
    studentId: "IELTS-2024",
    subject: "IELTS Academic Preparation",
    year: "Hà Nội - Năm 2024",
    format: "PDF",
    size: "24.6 MB",
    pages: 215,
    downloads: 6890,
    views: 16500
  },
  {
    id: "doc-sl-kt",
    title: "BẢN TÓM TẮT HỆ THỐNG KIẾN THỨC VÀ SƠ ĐỒ MINDMAP KINH TẾ VI MÔ VÀ VĨ MÔ",
    docSlug: "slide",
    university: "TRƯỜNG ĐẠI HỌC NGOẠI THƯƠNG",
    faculty: "KHOA KINH TẾ QUỐC TẾ",
    instructor: "TS. Vũ Hải Đăng",
    student: "Lê Minh Tuấn & Nhóm nghiên cứu",
    studentId: "19114522",
    subject: "Kinh tế học cơ sở",
    year: "Hà Nội - Năm 2023",
    format: "PDF",
    size: "14.2 MB",
    pages: 95,
    downloads: 1890,
    views: 4500
  }
]

export default function DocumentCategories() {
  const { docSlug } = useParams()
  const navigate = useNavigate()
  const role = localStorage.getItem("role")?.toLowerCase() || "student"
  const isTeacher = role === "teacher"

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFormat, setSelectedFormat] = useState("all")
  const [sortBy, setSortBy] = useState("popular")

  const currentCategory = useMemo(() => {
    return DOC_CATEGORIES.find(c => c.id === docSlug)
  }, [docSlug])

  const filteredDocs = useMemo(() => {
    return MOCK_DOCUMENTS.filter(doc => {
      if (docSlug && doc.docSlug !== docSlug) return false

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchTitle = doc.title.toLowerCase().includes(query)
        const matchFaculty = doc.faculty?.toLowerCase().includes(query)
        const matchAuthor = doc.instructor?.toLowerCase().includes(query) || doc.student?.toLowerCase().includes(query)
        if (!matchTitle && !matchFaculty && !matchAuthor) return false
      }

      if (selectedFormat !== "all" && doc.format !== selectedFormat) return false

      return true
    }).sort((a, b) => {
      if (sortBy === "popular") return b.downloads - a.downloads
      if (sortBy === "views") return b.views - a.views
      return 0
    })
  }, [docSlug, searchTerm, selectedFormat, sortBy])

  // 1. GIAO DIỆN XEM CHI TIẾT DANH MỤC TÀI LIỆU (/docs/:docSlug)
  if (docSlug) {
    const Icon = currentCategory?.icon || FileText

    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Nút quay lại & Header */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/${role}/document-categories`)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Danh mục tài liệu</span>
              <span>/</span>
              <span className={isTeacher ? "text-orange-600" : "text-blue-600"}>
                {currentCategory ? currentCategory.name : docSlug}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 truncate">
              {currentCategory ? currentCategory.name : "Tài liệu & Học liệu số"}
            </h1>
          </div>
        </div>

        {/* Banner tóm tắt */}
        {currentCategory && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${currentCategory.bgLight}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{currentCategory.name}</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">{currentCategory.desc}</p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold shrink-0 self-start md:self-center">
              {filteredDocs.length} tài liệu số chuẩn
            </span>
          </div>
        )}

        {/* Thanh tìm kiếm & bộ lọc */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm tài liệu theo đề tài, giảng viên, môn học..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 pr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sắp xếp:</span>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="popular">Tải nhiều nhất</option>
              <option value="views">Lượt xem nhiều</option>
            </select>
          </div>
        </div>

        {/* Grid tài liệu với thiết kế trang bìa báo cáo PDF */}
        {filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Khung bìa luận văn / PDF học thuật */}
                <div className="relative w-full aspect-[3/4.2] bg-white rounded-lg p-2.5 shadow-sm border border-slate-200 group-hover:border-slate-400 transition-all select-none overflow-hidden flex flex-col justify-between">
                  
                  {/* Đường viền khung đôi học thuật */}
                  <div className="w-full h-full border-2 border-slate-800 p-2 flex flex-col justify-between relative bg-slate-50/20">
                    
                    {/* Họa tiết hoa văn góc */}
                    <div className="absolute top-0.5 left-0.5 w-2.5 h-2.5 border-t-2 border-l-2 border-slate-800" />
                    <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 border-t-2 border-r-2 border-slate-800" />
                    <div className="absolute bottom-0.5 left-0.5 w-2.5 h-2.5 border-b-2 border-l-2 border-slate-800" />
                    <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 border-b-2 border-r-2 border-slate-800" />

                    {/* Header bìa: Tên trường & Khoa */}
                    <div className="text-center pt-1">
                      <p className="text-[10px] font-bold text-slate-800 tracking-wide uppercase">
                        {doc.university}
                      </p>
                      <p className="text-[9px] font-black text-slate-900 tracking-wider uppercase mt-0.5">
                        {doc.faculty}
                      </p>
                      <div className="w-12 h-0.5 bg-slate-700 mx-auto mt-1" />
                    </div>

                    {/* Logo biểu trưng trường ở giữa */}
                    <div className="flex flex-col items-center my-auto py-2">
                      <div className="w-14 h-16 rounded-b-2xl border-2 border-red-800 bg-red-800 flex flex-col items-center justify-center text-white shadow-xs p-1">
                        <Award className="w-6 h-6 text-amber-300 mb-0.5" />
                        <span className="text-[7px] font-extrabold uppercase tracking-tighter">EduTech</span>
                      </div>
                    </div>

                    {/* Đề tài luận văn in hoa chính giữa */}
                    <div className="text-center px-2 my-auto">
                      <h3 className="text-[11px] font-extrabold text-slate-900 leading-snug line-clamp-3 uppercase tracking-tight font-serif">
                        {doc.title}
                      </h3>
                    </div>

                    {/* Footer thông tin: Giảng viên & Sinh viên */}
                    <div className="text-[8.5px] text-slate-800 space-y-0.5 px-2 pb-1 border-t border-slate-200/60 pt-1.5 font-serif">
                      <p className="truncate"><span className="font-bold">GVHD:</span> {doc.instructor}</p>
                      <p className="truncate"><span className="font-bold">SVTH:</span> {doc.student}</p>
                      {doc.studentId && <p><span className="font-bold">MSV:</span> {doc.studentId}</p>}
                      <p className="truncate"><span className="font-bold">Học phần:</span> {doc.subject}</p>
                    </div>

                    {/* Năm thực hiện */}
                    <div className="text-center text-[8px] font-bold text-slate-600 font-serif pb-0.5">
                      {doc.year}
                    </div>
                  </div>

                  {/* Nhãn định dạng góc trên */}
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-red-600 text-white font-black text-[9px] rounded shadow-xs">
                    {doc.format}
                  </span>
                </div>

                {/* Metadata & Nút hành động */}
                <div className="pt-3 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>{doc.size} • {doc.pages} trang</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{doc.views}</span>
                      <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" />{doc.downloads}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <Link
                      to={`/${role}/documents/${doc.id}`}
                      className={`flex-1 text-center py-2 rounded-xl text-xs font-bold transition-colors ${
                        isTeacher 
                          ? "bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white" 
                          : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                      }`}
                    >
                      Đọc tài liệu PDF
                    </Link>

                    <button
                      type="button"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="Tải tệp tin về máy"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-3">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">Chưa có tài liệu phù hợp</h3>
            <p className="text-xs text-slate-500">Hãy thử nhập từ khóa tìm kiếm khác.</p>
          </div>
        )}
      </div>
    )
  }

  // 2. GIAO DIỆN TỔNG QUAN KHI VÀO /document-categories (DANH SÁCH 5 DANH MỤC)
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className={`p-6 md:p-8 rounded-3xl border shadow-xs ${
        isTeacher 
          ? "bg-gradient-to-r from-orange-500/10 via-amber-50/40 to-white border-orange-200/70"
          : "bg-gradient-to-r from-blue-600/10 via-indigo-50/40 to-white border-blue-200/70"
      }`}>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Hệ thống tài liệu học thuật</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Danh Mục Tài Liệu & Luận Văn Học Thuật
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Truy cập giáo trình chuẩn, đề thi, bài tập lớn và công trình nghiên cứu khoa học số hóa.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {DOC_CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const count = MOCK_DOCUMENTS.filter(d => d.docSlug === cat.id).length

          return (
            <Link
              key={cat.id}
              to={`/${role}/docs/${cat.id}`}
              className="group bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs transition-transform duration-300 group-hover:scale-110 ${cat.bgLight}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {count || 5}+ tài liệu
                  </span>
                </div>

                <h3 className={`font-extrabold text-sm text-slate-900 group-hover:transition-colors ${
                  isTeacher ? "group-hover:text-orange-600" : "group-hover:text-blue-600"
                }`}>
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                  {cat.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Xem kho tài liệu</span>
                <ArrowRight className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${
                  isTeacher ? "text-orange-500" : "text-blue-600"
                }`} />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}