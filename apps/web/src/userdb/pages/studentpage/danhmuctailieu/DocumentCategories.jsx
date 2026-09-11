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
  Download,
  Eye,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  Loader2,
  ExternalLink
} from "lucide-react"

const ICON_MAPPING = {
  "de-thi-kiem-tra": { icon: FileCheck2, bgLight: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  "ghi-chep-lop-hoc": { icon: BookOpen, bgLight: "bg-blue-50 text-blue-600 border-blue-100" },
  "bai-tap-ve-nha": { icon: FileText, bgLight: "bg-amber-50 text-amber-600 border-amber-100" },
  "tieu-luan": { icon: GraduationCap, bgLight: "bg-purple-50 text-purple-600 border-purple-100" }
}

// 🎯 Hàm lấy ảnh trang đầu tiên trực tiếp từ Cloudinary URL
const getDocumentCoverUrl = (fileUrl) => {
  if (!fileUrl) return null
  const cleanUrl = fileUrl.trim()

  // Nếu là file PDF trên Cloudinary: Chuyển đổi thành ảnh preview trang đầu tiên (page 1)
  if (cleanUrl.includes("res.cloudinary.com") && cleanUrl.toLowerCase().endsWith(".pdf")) {
    return cleanUrl.replace(/\.pdf$/i, ".jpg")
  }
  
  // Nếu đã là link ảnh
  if (/\.(jpg|jpeg|png|webp)$/i.test(cleanUrl)) {
    return cleanUrl
  }

  return null
}

// 🎯 Component hiển thị trang đầu của tài liệu
function DocumentPageThumbnail({ fileUrl, title }) {
  const [loadError, setLoadError] = useState(false)
  const previewImgUrl = useMemo(() => getDocumentCoverUrl(fileUrl), [fileUrl])
  const isPdf = fileUrl?.toLowerCase().endsWith(".pdf")
  const isDocx = fileUrl?.toLowerCase().endsWith(".docx")

  if (previewImgUrl && !loadError) {
    return (
      <div className="relative w-full h-full bg-slate-100 overflow-hidden flex items-center justify-center">
        <img
          src={previewImgUrl}
          alt={title}
          className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={() => setLoadError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
          <span className="text-[11px] font-bold text-white bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> Xem trước trang 1
          </span>
        </div>
      </div>
    )
  }

  // Fallback nếu là file Docx hoặc Cloudinary chưa kịp generate thumbnail: Nhúng trực tiếp iframe xem trước từ Google Docs Viewer
  if (fileUrl) {
    return (
      <div className="relative w-full h-full bg-white overflow-hidden select-none">
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
          title={title}
          className="w-[140%] h-[140%] -translate-x-[20%] -translate-y-[10%] pointer-events-none scale-75 border-none"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-transparent" />
      </div>
    )
  }

  // Fallback mặc định
  return (
    <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <FileText className="w-12 h-12 text-slate-300 mb-2" />
      <span className="text-xs font-bold text-slate-500 line-clamp-2">{title}</span>
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
      <div className="p-6 max-w-7xl mx-auto space-y-6">
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
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="popular">Tải nhiều nhất</option>
              <option value="views">Lượt xem nhiều</option>
            </select>
          </div>
        </div>

        {/* Danh sách tài liệu: Thumbnail trang đầu thực tế */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-bold text-slate-400">Đang nạp dữ liệu và tạo ảnh xem trước...</p>
          </div>
        ) : filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocs.map((doc) => {
              const isPdf = (doc.file_url || "").toLowerCase().endsWith(".pdf")
              const isDocx = (doc.file_url || "").toLowerCase().endsWith(".docx")

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Khung bìa hiển thị nội dung trang đầu tiên */}
                  <div className="relative w-full aspect-3/4 bg-slate-100 border-b border-slate-100 overflow-hidden">
                    <DocumentPageThumbnail fileUrl={doc.file_url} title={doc.title} />

                    {/* Tag loại file góc trên */}
                    <span className={`absolute top-3 right-3 px-2 py-0.5 font-black text-[9px] rounded-md shadow-xs uppercase ${
                      isPdf ? "bg-red-600 text-white" : isDocx ? "bg-blue-600 text-white" : "bg-slate-700 text-white"
                    }`}>
                      {isPdf ? "PDF" : isDocx ? "DOCX" : "DOC"}
                    </span>

                    {/* Tag môn học góc dưới */}
                    <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {doc.subject || "Chuyên ngành"}
                    </div>
                  </div>

                  {/* Thông tin mô tả bên dưới */}
                  <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors" title={doc.title}>
                        {doc.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                        <span>Đăng bởi: <strong>{doc.student_name || "Ẩn danh"}</strong></span>
                        <span>{new Date(doc.created_at).toLocaleDateString("vi-VN")}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-2.5">
                        <span className="truncate max-w-[120px]">{doc.category_rel?.name || doc.category}</span>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{doc.views || 0}</span>
                          <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" />{doc.downloads || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 text-center py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 ${
                            isTeacher 
                              ? "bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white" 
                              : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                          }`}
                        >
                          <span>Xem toàn bộ</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <a
                          href={doc.file_url}
                          download
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Tải tệp về máy"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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