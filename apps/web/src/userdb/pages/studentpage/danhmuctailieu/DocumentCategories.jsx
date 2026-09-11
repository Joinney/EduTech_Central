/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { 
  FileText, 
  FileCheck2, 
  BookOpen, 
  GraduationCap, 
  Search,
  SlidersHorizontal,
  Eye,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  Loader2,
  User,
  Calendar,
  Lock,
  Clock
} from "lucide-react"

// Thư viện đọc và kết xuất PDF
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

const ICON_MAPPING = {
  "de-thi-kiem-tra": { icon: FileCheck2, bgLight: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  "ghi-chep-lop-hoc": { icon: BookOpen, bgLight: "bg-blue-50 text-blue-600 border-blue-100" },
  "bai-tap-ve-nha": { icon: FileText, bgLight: "bg-amber-50 text-amber-600 border-amber-100" },
  "tieu-luan": { icon: GraduationCap, bgLight: "bg-purple-50 text-purple-600 border-purple-100" }
}

// 🎯 Component Card hiển thị Bìa PDF trang 1 kèm Dải Hover trượt lên
function DocumentCardItem({ item, role, isTeacher }) {
  const [cardPages, setCardPages] = useState(null)
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/${role}/documents/${item.id}`)
  }

  return (
    <div
      onClick={handleCardClick}
      className="relative bg-slate-50 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group w-full h-[380px] cursor-pointer flex flex-col items-center justify-center p-2.5"
    >
      {/* 1. KHUNG HIỂN THỊ TRANG BÌA PDF */}
      <div className="w-full h-full bg-white rounded-xl shadow-xs border border-slate-100 flex items-center justify-center overflow-hidden">
        {item.file_url?.toLowerCase().endsWith(".pdf") ? (
          <Document
            file={item.file_url}
            onLoadSuccess={({ numPages }) => setCardPages(numPages)}
            loading={
              <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                <Loader2 className={`w-6 h-6 animate-spin ${isTeacher ? "text-orange-600" : "text-blue-600"}`} />
                <span>Đang kết xuất...</span>
              </div>
            }
            error={
              <div className="p-4 text-center text-xs text-slate-400">
                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-1" />
                <span>Tài liệu PDF</span>
              </div>
            }
          >
            <Page
              pageNumber={1}
              height={360}
              devicePixelRatio={Math.min(window.devicePixelRatio || 1, 2)}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="pointer-events-none drop-shadow-xs"
            />
          </Document>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400 text-xs p-4 text-center">
            <FileText className="w-12 h-12 text-slate-300" />
            <span className="font-bold text-slate-500 line-clamp-2">{item.title}</span>
          </div>
        )}
      </div>

      {/* Badges góc trên bên trái: Đã gỡ nút "Công khai", chỉ giữ lại badge khi là Riêng tư hoặc Chờ duyệt */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 z-10 pointer-events-none">
        {item.is_public === false && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-600/90 text-white text-[10px] font-bold rounded-md shadow-xs">
            <Lock className="w-3 h-3" /> Riêng tư
          </span>
        )}

        {item.is_approved === false && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-500/90 text-white text-[10px] font-bold rounded-md shadow-xs">
            <Clock className="w-3 h-3" /> Chờ duyệt
          </span>
        )}
      </div>

      {/* Badge loại file góc trên bên phải */}
      <span className="absolute top-4 right-4 px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded uppercase shadow-sm z-10 pointer-events-none">
        {item.file_url?.toLowerCase().endsWith(".docx") ? "DOCX" : "PDF"}
      </span>

      {/* 2. DẢI MỜ TRẮNG DƯỚI CHÂN (HOVER TRƯỢT LÊN) */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-xs pt-12 pb-3.5 px-4 text-slate-800 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex flex-col justify-end gap-1.5 z-20 pointer-events-none border-t border-slate-100/30">
        <div className="space-y-0.5">
          <span className={`inline-block px-2 py-0.5 text-[9px] font-extrabold uppercase rounded tracking-wide ${
            isTeacher ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"
          }`}>
            {item.category_rel?.name || item.category || "Tài liệu"}
          </span>
          <h4 className="font-black text-xs text-slate-900 line-clamp-1" title={item.title}>
            {item.title}
          </h4>
        </div>

        <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-200/60 pt-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 truncate max-w-[65%]">
              <User className={`w-3 h-3 shrink-0 ${isTeacher ? "text-orange-600" : "text-blue-600"}`} />
              <strong className="text-slate-800 truncate">{item.student_name || "Tác giả"}</strong>
            </span>
            <span className="flex items-center gap-1 text-slate-500 shrink-0">
              <Calendar className="w-3 h-3 text-slate-400" />
              {item.created_at ? new Date(item.created_at).toLocaleDateString("vi-VN") : "Gần đây"}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            <span>{cardPages ? `${cardPages} trang` : "Tài liệu"}</span>
            <span className={`flex items-center gap-1 font-bold ${isTeacher ? "text-orange-700" : "text-blue-700"}`}>
              <Eye className="w-3 h-3" />
              {item.views || 0} lượt xem
            </span>
          </div>
        </div>

        <button
          type="button"
          className={`w-full mt-1 py-1.5 text-white font-bold text-[11px] rounded-lg shadow-sm transition flex items-center justify-center gap-1.5 ${
            isTeacher ? "bg-orange-600 hover:bg-orange-700" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Đọc tài liệu</span>
        </button>
      </div>
    </div>
  )
}

export default function DocumentCategories() {
  const { docSlug } = useParams()
  const navigate = useNavigate()
  const role = localStorage.getItem("role")?.toLowerCase() || "student"
  const isTeacher = role === "teacher"

  const [categories, setCategories] = useState([])
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("popular")

  const baseUrl = import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1"

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${baseUrl}/document-categories`)
        if (res.ok) {
          const json = await res.json()
          setCategories(json.data || [])
        }
      } catch (err) {
        console.error("Lỗi lấy danh mục tài liệu:", err)
      }
    }
    fetchCategories()
  }, [baseUrl])

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true)
      try {
        let endpoint = `${baseUrl}/shared-documents`
        if (docSlug) {
          endpoint += `?category=${docSlug}`
        }
        const res = await fetch(endpoint)
        if (res.ok) {
          const json = await res.json()
          setDocuments(json.data || [])
        } else {
          setDocuments([])
        }
      } catch (err) {
        console.error("Lỗi tải tài liệu:", err)
        setDocuments([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchDocuments()
  }, [docSlug, baseUrl])

  const currentCategory = useMemo(() => {
    return categories.find(c => c.slug === docSlug)
  }, [categories, docSlug])

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchTitle = (doc.title || "").toLowerCase().includes(q)
        const matchSubject = (doc.subject || "").toLowerCase().includes(q)
        const matchAuthor = (doc.student_name || "").toLowerCase().includes(q)
        if (!matchTitle && !matchSubject && !matchAuthor) return false
      }
      return true
    }).sort((a, b) => {
      if (sortBy === "popular") return (b.downloads || 0) - (a.downloads || 0)
      if (sortBy === "views") return (b.views || 0) - (a.views || 0)
      return 0
    })
  }, [documents, searchTerm, sortBy])

  // ================= 1. GIAO DIỆN XEM TÀI LIỆU CỦA 1 DANH MỤC =================
  if (docSlug) {
    const IconConfig = ICON_MAPPING[docSlug] || { icon: FileText, bgLight: "bg-blue-50 text-blue-600 border-blue-100" }
    const Icon = IconConfig.icon

    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/${role}/document-categories`)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
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
              {currentCategory ? currentCategory.name : "Tài liệu học thuật"}
            </h1>
          </div>
        </div>

        {currentCategory && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${IconConfig.bgLight}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{currentCategory.name}</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">{currentCategory.description}</p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold shrink-0 self-start md:self-center">
              {filteredDocs.length} tài liệu thực tế
            </span>
          </div>
        )}

        {/* Thanh tìm kiếm & Sắp xếp */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên tài liệu, môn học, tác giả..."
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
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer outline-none"
            >
              <option value="popular">Tải nhiều nhất</option>
              <option value="views">Lượt xem nhiều</option>
            </select>
          </div>
        </div>

        {/* Danh sách thẻ Card PDF trang đầu tiên */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200/80">
            <Loader2 className={`w-8 h-8 animate-spin ${isTeacher ? "text-orange-600" : "text-blue-600"}`} />
            <p className="text-xs font-bold text-slate-400">Đang nạp dữ liệu và kết xuất tài liệu...</p>
          </div>
        ) : filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredDocs.map((doc) => (
              <DocumentCardItem
                key={doc.id}
                item={doc}
                role={role}
                isTeacher={isTeacher}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-3">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">Chưa có tài liệu nào trong danh mục này</h3>
            <p className="text-xs text-slate-500">Các bài chia sẻ mới sau khi được duyệt sẽ xuất hiện tại đây.</p>
          </div>
        )}
      </div>
    )
  }

  // ================= 2. GIAO DIỆN TỔNG HỢP DANH MỤC (/document-categories) =================
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <div className={`p-6 md:p-8 rounded-3xl border shadow-2xs ${
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
          Truy cập kho tài liệu số hóa, bài tập thực hành và đề thi chia sẻ từ cộng đồng học viên EduTech.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
        {categories.map((cat) => {
          const IconConfig = ICON_MAPPING[cat.slug] || { icon: FileText, bgLight: "bg-blue-50 text-blue-600 border-blue-100" }
          const Icon = IconConfig.icon

          return (
            <Link
              key={cat.id}
              to={`/${role}/docs/${cat.slug}`}
              className="group bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-2xs transition-transform duration-300 group-hover:scale-110 ${IconConfig.bgLight}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
                    Dữ liệu thực tế
                  </span>
                </div>

                <h3 className={`font-extrabold text-base text-slate-900 group-hover:transition-colors ${
                  isTeacher ? "group-hover:text-orange-600" : "group-hover:text-blue-600"
                }`}>
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                  {cat.description}
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