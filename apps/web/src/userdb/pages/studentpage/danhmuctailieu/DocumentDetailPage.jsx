/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  ArrowLeft,
  Download,
  Eye,
  Calendar,
  User,
  BookOpen,
  FolderTree,
  Share2,
  Bookmark,
  CheckCircle2,
  FileText,
  ExternalLink,
  Loader2,
  ShieldCheck
} from "lucide-react"

export default function DocumentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const role = localStorage.getItem("role")?.toLowerCase() || "student"
  const isTeacher = role === "teacher"

  const [document, setDocument] = useState(null)
  const [relatedDocs, setRelatedDocs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const baseUrl = import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1"

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(""), 3000)
  }

  useEffect(() => {
    const fetchDocumentDetail = async () => {
      setIsLoading(true)
      try {
        // Lấy danh sách tài liệu từ Backend để tìm theo ID
        const res = await fetch(`${baseUrl}/shared-documents?all=true`)
        if (res.ok) {
          const json = await res.json()
          const list = Array.isArray(json) ? json : (json?.data || [])
          
          const found = list.find((item) => String(item.id) === String(id))
          if (found) {
            setDocument(found)
            // Lọc ra các tài liệu cùng môn học hoặc danh mục liên quan
            const related = list.filter(
              (item) => String(item.id) !== String(id) && 
              (item.subject === found.subject || item.category_id === found.category_id)
            ).slice(0, 4)
            setRelatedDocs(related)
          } else {
            setDocument(null)
          }
        }
      } catch (err) {
        console.error("Lỗi khi nạp chi tiết tài liệu:", err)
        setDocument(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchDocumentDetail()
    }
  }, [id, baseUrl])

  // Trình nhúng file phù hợp với cả PDF và file Word (DOCX)
  const viewerUrl = useMemo(() => {
    if (!document?.file_url) return ""
    const fileUrl = document.file_url.trim()
    
    // Nếu là PDF trực tiếp
    if (fileUrl.toLowerCase().endsWith(".pdf")) {
      return fileUrl
    }
    // Dùng Google Docs Viewer nhúng file Word / file văn phòng
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
  }, [document])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
        <p className="text-xs font-bold text-slate-500">Đang khởi tạo trình đọc tài liệu...</p>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <FileText className="w-12 h-12 text-slate-300" />
        <h3 className="text-base font-bold text-slate-700">Không tìm thấy tài liệu này</h3>
        <p className="text-xs text-slate-500">Tài liệu có thể đã bị gỡ hoặc đang chờ kiểm duyệt.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Quay lại danh mục
        </button>
      </div>
    )
  }

  const isPdf = (document.file_url || "").toLowerCase().endsWith(".pdf")

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-slate-700 text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer shrink-0"
            title="Quay lại"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="truncate">
            <h1 className="text-sm font-black text-slate-900 truncate" title={document.title}>
              {document.title}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span className="text-blue-900 font-bold">{document.subject}</span>
              <span>•</span>
              <span>{document.category_rel?.name || document.category || "Tài liệu học thuật"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setIsBookmarked(!isBookmarked)
              triggerToast(isBookmarked ? "Đã gỡ khỏi tài liệu đã lưu" : "Đã lưu vào bộ sưu tập cá nhân")
            }}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isBookmarked ? "bg-amber-50 border-amber-300 text-amber-500" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            title="Lưu tài liệu"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={() => triggerToast("Đã sao chép liên kết tài liệu vào bộ nhớ tạm")}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Chia sẻ tài liệu"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <a
            href={document.file_url}
            download
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Tải tệp tin</span>
          </a>
        </div>
      </header>

      {/* Nội dung chính: 2 Cột (Trình đọc PDF bên trái + Thông tin chi tiết bên phải) */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* CỘT TRÁI: KHUNG ĐỌC TÀI LIỆU TRỰC TIẾP */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col h-[78vh] lg:h-[86vh]">
          <div className="bg-slate-800 text-slate-200 px-4 py-2 flex items-center justify-between text-xs font-bold border-b border-slate-700">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Chế độ đọc trực tuyến ({isPdf ? "Adobe PDF" : "Office Document"})</span>
            </span>
            <a
              href={document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white flex items-center gap-1 hover:underline"
            >
              Mở toàn màn hình <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex-1 w-full h-full bg-slate-900">
            <iframe
              src={viewerUrl}
              title={document.title}
              className="w-full h-full border-none"
            />
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN CHI TIẾT VÀ TÀI LIỆU LIÊN QUAN */}
        <div className="space-y-6">
          {/* Card Thông số */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Thông tin học thuật
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Người đăng</span>
                <span className="font-bold text-slate-900">{document.student_name || "Thành viên EduTech"}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Môn học</span>
                <span className="font-bold text-blue-900">{document.subject}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5"><FolderTree className="w-3.5 h-3.5" /> Phân loại</span>
                <span className="font-bold text-slate-900">{document.category_rel?.name || document.category}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-dashed border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Ngày đăng</span>
                <span className="font-bold text-slate-900">{new Date(document.created_at).toLocaleDateString("vi-VN")}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Lượt xem / tải</span>
                <span className="font-bold text-slate-900">{document.views || 0} xem • {document.downloads || 0} tải</span>
              </div>
            </div>

            {document.description && (
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-[11px] font-extrabold text-slate-700 uppercase mb-1">Mô tả tóm tắt:</h4>
                <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {document.description}
                </p>
              </div>
            )}
          </div>

          {/* Card Tài liệu liên quan */}
          {relatedDocs.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                Tài liệu cùng chủ đề
              </h3>

              <div className="space-y-2.5">
                {relatedDocs.map((item) => (
                  <Link
                    key={item.id}
                    to={`/${role}/documents/${item.id}`}
                    className="block p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 transition group"
                  >
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-900 transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {item.subject} • {new Date(item.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}