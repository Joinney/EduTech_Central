/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Document, Page, pdfjs } from "react-pdf"
import {
  ArrowLeft,
  Download,
  Share2,
  Bookmark,
  FileText,
  ThumbsUp,
  Eye,
  Calendar,
  CheckCircle2,
  Loader2,
  BookOpen,
  User,
  FolderTree,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  List,
  RotateCw,
  Maximize2,
  Minimize2,
  ScrollText,
  PanelRightClose,
  PanelRightOpen
} from "lucide-react"

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export default function DocumentDetail() {
  const { docId } = useParams()
  const navigate = useNavigate()
  const readerContainerRef = useRef(null)

  const [document, setDocument] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // PDF Controls
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [inputPage, setInputPage] = useState("1")
  const [scale, setScale] = useState(1.15)
  const [rotation, setRotation] = useState(0)
  const [isContinuousScroll, setIsContinuousScroll] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showMetaPanel, setShowMetaPanel] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [toastMsg, setToastMsg] = useState("")

  const baseUrl = import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1"

  const triggerToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(""), 3000)
  }

  useEffect(() => {
    const fetchDocDetail = async () => {
      setIsLoading(true)
      try {
        let found = null
        try {
          const directRes = await fetch(`${baseUrl}/shared-documents/${docId}`)
          if (directRes.ok) {
            const directJson = await directRes.json()
            found = directJson?.data || directJson
          }
        } catch (_) {}

        if (!found || !found.id) {
          const listRes = await fetch(`${baseUrl}/shared-documents?all=true`)
          if (listRes.ok) {
            const listJson = await listRes.json()
            const list = Array.isArray(listJson) ? listJson : (listJson?.data || [])
            found = list.find((item) => String(item.id) === String(docId))
          }
        }

        setDocument(found || null)
      } catch (err) {
        console.error("Lỗi nạp tài liệu:", err)
        setDocument(null)
      } finally {
        setIsLoading(false)
      }
    }

    if (docId) fetchDocDetail()
  }, [docId, baseUrl])

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    setCurrentPage(1)
    setInputPage("1")
  }

  const handleJumpToPage = (p) => {
    const pageNum = Math.max(1, Math.min(numPages || 1, Number(p) || 1))
    setCurrentPage(pageNum)
    setInputPage(String(pageNum))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const toggleFullscreen = () => {
    if (typeof window === "undefined" || !window.document) return
    if (!isFullscreen) {
      if (readerContainerRef.current?.requestFullscreen) {
        readerContainerRef.current.requestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (window.document.exitFullscreen) {
        window.document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  const handleDownload = () => {
    if (document?.file_url) {
      triggerToast(`Đang tải tệp: ${document.title}`)
      window.open(document.file_url, "_blank")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-80px)] space-y-3 bg-white text-slate-700 font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="text-xs font-bold text-slate-500">Đang chuẩn bị trình đọc EduTech...</p>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-80px)] p-6 text-center space-y-3 bg-white font-sans">
        <FileText className="w-14 h-14 text-slate-300" />
        <h2 className="text-lg font-bold text-slate-800">Không tìm thấy tài liệu #{docId}</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
        >
          Quay lại danh mục
        </button>
      </div>
    )
  }

  const isPdf = (document.file_url || "").toLowerCase().endsWith(".pdf")

  return (
    <div 
      ref={readerContainerRef} 
      className="w-full h-[calc(100vh-70px)] flex flex-col bg-white font-sans select-none overflow-hidden"
    >
      {/* Toast thông báo */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-orange-400/40 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 🎯 1. THANH CÔNG CỤ TRÊN CÙNG - NỀN TRẮNG SÁNG & TÔNG CAM */}
      <header className="w-full px-4 py-2 bg-white border-b border-slate-200 text-slate-700 flex flex-wrap items-center justify-between gap-2.5 text-xs z-20 shrink-0 shadow-2xs">
        
        {/* Cụm trái: Quay lại, Mục lục, Chế độ xem, Tên file */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 border border-slate-200 transition cursor-pointer shrink-0"
            title="Quay lại danh mục"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 px-3 rounded-xl border transition cursor-pointer flex items-center gap-1.5 font-bold text-xs shrink-0 ${
              showSidebar 
                ? "bg-orange-500 border-orange-500 text-white shadow-xs" 
                : "bg-white border-slate-200 text-slate-700 hover:border-orange-400 hover:text-orange-600"
            }`}
            title="Mục lục & Trang thu nhỏ"
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Mục lục</span>
          </button>

          <button
            onClick={() => setIsContinuousScroll(!isContinuousScroll)}
            className={`p-2 px-3 rounded-xl border transition cursor-pointer flex items-center gap-1.5 font-bold text-xs shrink-0 ${
              isContinuousScroll 
                ? "bg-orange-500 border-orange-500 text-white shadow-xs" 
                : "bg-white border-slate-200 text-slate-700 hover:border-orange-400 hover:text-orange-600"
            }`}
            title="Chuyển chế độ xem"
          >
            <ScrollText className="w-4 h-4" />
            <span className="hidden md:inline">{isContinuousScroll ? "Cuộn dọc" : "Từng trang"}</span>
          </button>

          <div className="flex items-center gap-2 truncate pl-2 border-l border-slate-200">
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
              isPdf ? "bg-orange-500 text-white" : "bg-blue-600 text-white"
            }`}>
              {isPdf ? "PDF" : "DOCX"}
            </span>
            <span className="truncate max-w-[180px] md:max-w-[320px] font-extrabold text-slate-900" title={document.title}>
              {document.title}
            </span>
          </div>
        </div>

        {/* Cụm giữa: Điều khiển trang */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 shrink-0">
          <button
            disabled={currentPage <= 1 || isContinuousScroll}
            onClick={() => handleJumpToPage(currentPage - 1)}
            className="p-1 hover:text-orange-600 text-slate-600 disabled:opacity-30 cursor-pointer"
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
            <span>Trang</span>
            <input
              type="number"
              min="1"
              max={numPages || 1}
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJumpToPage(inputPage)
              }}
              className="w-11 text-center bg-white border border-slate-300 focus:border-orange-500 text-slate-900 font-extrabold rounded py-0.5 text-xs outline-none"
            />
            <span className="text-slate-400">/ {numPages || "..."}</span>
          </div>

          <button
            disabled={currentPage >= (numPages || 1) || isContinuousScroll}
            onClick={() => handleJumpToPage(currentPage + 1)}
            className="p-1 hover:text-orange-600 text-slate-600 disabled:opacity-30 cursor-pointer"
            title="Trang sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Cụm phải: Zoom, Xoay, Toàn màn hình & Ẩn/Hiện bảng Học liệu */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
              className="p-1 hover:text-orange-600 text-slate-600 cursor-pointer"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setScale(1.15)}
              className="text-[11px] w-10 text-center font-bold text-slate-700 hover:text-orange-600 cursor-pointer"
              title="Đặt lại zoom mặc định"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={() => setScale((s) => Math.min(2.2, s + 0.15))}
              className="p-1 hover:text-orange-600 text-slate-600 cursor-pointer"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleRotate}
            className="p-2 bg-slate-50 hover:bg-orange-50 border border-slate-200 text-slate-600 hover:text-orange-600 rounded-xl transition cursor-pointer"
            title="Xoay trang 90 độ"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-50 hover:bg-orange-50 border border-slate-200 text-slate-600 hover:text-orange-600 rounded-xl transition cursor-pointer"
            title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowMetaPanel(!showMetaPanel)}
            className={`p-2 px-3 rounded-xl border transition cursor-pointer flex items-center gap-1.5 font-bold text-xs ${
              showMetaPanel 
                ? "bg-orange-500 border-orange-500 text-white shadow-xs" 
                : "bg-white border-slate-200 text-slate-700 hover:border-orange-400 hover:text-orange-600"
            }`}
            title={showMetaPanel ? "Ẩn bảng thông tin" : "Hiện bảng thông tin"}
          >
            {showMetaPanel ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            <span className="hidden lg:inline">Thông tin</span>
          </button>
        </div>
      </header>

      {/* 🎯 2. THÂN GIAO DIỆN TRÀN TOÀN TRANG (Mục lục trắng - Canvas sáng - Panel thông tin) */}
      <div className="flex flex-1 w-full h-[calc(100%-49px)] overflow-hidden bg-slate-100/90 relative">
        
        {/* SIDEBAR MỤC LỤC & THUMBNAIL (NỀN TRẮNG SÁNG) */}
        {showSidebar && isPdf && (
          <aside className="w-60 md:w-64 bg-white border-r border-slate-200 p-3 overflow-y-auto flex flex-col gap-3 shrink-0 z-10 animate-in slide-in-from-left duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-700 text-xs font-bold">
              <span>Mục lục ({numPages || 0} trang)</span>
              <span className="text-[10px] text-slate-400">Nhấn để nhảy</span>
            </div>

            <Document file={document.file_url} className="space-y-3 flex flex-col items-center">
              {Array.from(new Array(numPages || 0), (_, index) => {
                const pNum = index + 1
                const isSelected = currentPage === pNum

                return (
                  <div
                    key={`thumb_${pNum}`}
                    onClick={() => handleJumpToPage(pNum)}
                    className={`w-full p-2 rounded-xl cursor-pointer transition flex flex-col items-center gap-1.5 border ${
                      isSelected 
                        ? "bg-orange-50 border-orange-500 text-orange-600 font-extrabold shadow-xs" 
                        : "bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="w-24 shadow-sm rounded-xs overflow-hidden pointer-events-none bg-white border border-slate-200">
                      <Page
                        pageNumber={pNum}
                        width={96}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </div>
                    <span className="text-[11px]">Trang {pNum}</span>
                  </div>
                )
              })}
            </Document>
          </aside>
        )}

        {/* KHU VỰC HIỂN THỊ TRANG GIẤY TỰ NHIÊN (NỀN SÁNG DỊU MẮT) */}
        <main className="flex-1 overflow-auto flex justify-center p-4 md:p-8 bg-slate-100/90">
          {isPdf ? (
            <Document
              file={document.file_url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center p-16 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  <span className="text-xs font-bold text-slate-500">Đang tạo bản vẽ trang...</span>
                </div>
              }
              error={
                <div className="p-8 text-center text-xs text-red-500 font-bold">
                  Không thể nạp tệp PDF. Vui lòng bấm nút tải về để xem trên máy.
                </div>
              }
            >
              {isContinuousScroll ? (
                <div className="flex flex-col gap-6 items-center">
                  {Array.from(new Array(numPages || 0), (_, index) => (
                    <div
                      key={`page_${index + 1}`}
                      className="shadow-xl rounded-xs overflow-hidden bg-white border border-slate-300"
                    >
                      <Page
                        pageNumber={index + 1}
                        scale={scale}
                        rotate={rotation}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="shadow-xl rounded-xs overflow-hidden bg-white border border-slate-300">
                  <Page
                    pageNumber={currentPage}
                    scale={scale}
                    rotate={rotation}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>
              )}
            </Document>
          ) : (
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(document.file_url)}&embedded=true`}
              title={document.title}
              className="w-full max-w-5xl h-full border-none bg-white shadow-xl"
            />
          )}
        </main>

        {/* 🎯 BẢNG "HỌC LIỆU CHÍNH QUY" NỀN TRẮNG & TÔNG CAM (BÊN PHẢI) */}
        {showMetaPanel && (
          <aside className="w-72 md:w-80 bg-white border-l border-slate-200 p-5 overflow-y-auto flex flex-col justify-between shrink-0 shadow-lg z-10 animate-in slide-in-from-right duration-150">
            <div className="space-y-4">
              {/* Header học liệu */}
              <div className="flex items-start gap-3 pb-3.5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold bg-orange-50 text-orange-600 border border-orange-200 shadow-2xs shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] uppercase font-black text-orange-600 tracking-wider block">
                    Học liệu chính quy
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug mt-0.5" title={document.title}>
                    {document.title}
                  </h3>
                </div>
              </div>

              {/* Danh sách thông số */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Môn học:
                  </span>
                  <span className="font-bold text-orange-600 truncate max-w-[140px]">{document.subject}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Người đăng:
                  </span>
                  <span className="font-bold text-slate-800 truncate max-w-[140px]">{document.student_name || "Ẩn danh"}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5 text-slate-400" /> Danh mục:
                  </span>
                  <span className="font-bold text-slate-800 truncate max-w-[140px]">
                    {document.category_rel?.name || document.category || "Tài liệu"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Ngày đăng:
                  </span>
                  <span className="font-bold text-slate-800">{new Date(document.created_at).toLocaleDateString("vi-VN")}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-slate-400" /> Lượt xem:
                  </span>
                  <span className="font-bold text-slate-800">{document.views || 0} lượt</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-slate-400" /> Lượt tải:
                  </span>
                  <span className="font-bold text-emerald-600">{document.downloads || 0} lượt</span>
                </div>
              </div>

              {document.description && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Mô tả:</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-orange-50/40 p-2.5 rounded-lg border border-orange-100">
                    {document.description}
                  </p>
                </div>
              )}
            </div>

            {/* Các nút tương tác & tải tệp */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <button
                  className={`flex-1 py-2 rounded-xl border transition cursor-pointer text-xs font-bold flex items-center justify-center gap-1.5 ${
                    isLiked ? "text-orange-600 bg-orange-50 border-orange-300" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                  onClick={() => {
                    setIsLiked(!isLiked)
                    triggerToast(isLiked ? "Đã bỏ thích" : "Đã thích tài liệu")
                  }}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Thích</span>
                </button>

                <button
                  className={`flex-1 py-2 rounded-xl border transition cursor-pointer text-xs font-bold flex items-center justify-center gap-1.5 ${
                    isBookmarked ? "text-orange-600 bg-orange-50 border-orange-300" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                  onClick={() => {
                    setIsBookmarked(!isBookmarked)
                    triggerToast(isBookmarked ? "Đã gỡ khỏi lưu trữ" : "Đã lưu")
                  }}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Lưu</span>
                </button>

                <button
                  className="p-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition cursor-pointer"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href)
                    triggerToast("Đã sao chép liên kết tài liệu")
                  }}
                  title="Sao chép liên kết"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleDownload}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>TẢI TỆP TIN VỀ MÁY</span>
              </button>
            </div>
          </aside>
        )}

      </div>
    </div>
  )
}