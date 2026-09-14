/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useMemo } from "react"
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
  PanelRightOpen,
  Lock,
  Clock,
  EyeOff,
  Sparkles
} from "lucide-react"

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

// =========================================================================
// COMPONENT CON: TRANG CHỜ 10 GIÂY - HIỆU ỨNG KÍNH MỜ NHÌN XUYÊN THẤU CHỮ
// =========================================================================
function DelayedPageCard({
  pageNumber,
  scale,
  rotation,
  watermarkSvgBg,
  isUnlocked,
  onUnlockPage,
  isContinuousScroll,
  isCurrentlyActive
}) {
  const [timeLeft, setTimeLeft] = useState(10)
  const [isInViewport, setIsInViewport] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (isUnlocked) return

    if (!isContinuousScroll) {
      setIsInViewport(isCurrentlyActive)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting)
      },
      { threshold: 0.4 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [isUnlocked, isContinuousScroll, isCurrentlyActive])

  useEffect(() => {
    if (isUnlocked || !isInViewport) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onUnlockPage(pageNumber)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isUnlocked, isInViewport, pageNumber, onUnlockPage])

  return (
    <div
      ref={containerRef}
      className="shadow-xl rounded-xs overflow-hidden bg-white border border-slate-300 relative flex justify-center"
    >
      {/* Watermark */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 35,
          backgroundImage: watermarkSvgBg,
          backgroundRepeat: "repeat",
          backgroundPosition: "center center"
        }}
      />

      {/* 🎯 NỘI DUNG TRANG: Mờ nhẹ 4.5px, độ rõ 88% -> VẪN THẤY RÕ TỪNG DÒNG CHỮ VĂN BẢN ẨN HIỆN */}
      <div
        style={{
          filter: !isUnlocked ? "blur(4.5px)" : "none",
          opacity: !isUnlocked ? 0.88 : 1,
          transition: "filter 0.4s ease, opacity 0.4s ease",
          pointerEvents: !isUnlocked ? "none" : "auto",
          userSelect: "none"
        }}
      >
        <Page
          pageNumber={pageNumber}
          scale={scale}
          rotate={rotation}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </div>

      {/* 🎯 TẤM KÍNH MỜ TRONG SUỐT (Thấy rõ bài viết đằng sau) */}
      {!isUnlocked && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
          style={{
            zIndex: 30,
            backgroundColor: "rgba(255, 255, 255, 0.18)", // Rất trong suốt
            backdropFilter: "blur(4px)",                  // Hiệu ứng kính mờ chuẩn
            WebkitBackdropFilter: "blur(4px)"
          }}
        >
          <div className="bg-white/85 backdrop-blur-lg p-5 md:p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-white/90 flex flex-col items-center space-y-3 animate-in zoom-in-95">
            <div className="w-11 h-11 bg-amber-500/15 text-amber-600 rounded-full flex items-center justify-center border border-amber-300">
              <Clock className={`w-5 h-5 ${isInViewport ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full border border-amber-300 inline-block">
                Trang xen kẽ
              </span>
              <h4 className="text-sm font-black text-slate-900">
                Đang đọc trang {pageNumber}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isInViewport ? (
                  <span className="text-emerald-600 font-bold">Đang nhận diện bạn đang đọc trang...</span>
                ) : (
                  <span className="text-amber-600 font-bold">Cuộn dừng lại ở trang này để đếm ngược.</span>
                )}
              </p>
            </div>

            <div className="w-full py-2 bg-slate-100/80 border border-slate-200/80 rounded-xl flex items-center justify-center gap-2">
              <span className="text-xs text-slate-500 font-bold">Tự động rõ sau:</span>
              <span className="text-2xl font-black text-orange-600 font-mono">
                {timeLeft}s
              </span>
            </div>

            <span className="text-[10px] text-slate-400">
              *Hết 10 giây kính sẽ trong suốt để xem chữ rõ ràng.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// =========================================================================
// COMPONENT CHÍNH
// =========================================================================
export default function DocumentDetail() {
  const { docId } = useParams()
  const navigate = useNavigate()
  const readerContainerRef = useRef(null)

  const rawRole = (localStorage.getItem("role") || "student").trim().toLowerCase()
  const isTeacher = rawRole === "teacher" || rawRole === "admin"

  const [unlockedPages, setUnlockedPages] = useState(new Set())
  const handleUnlockPage = (pNum) => {
    setUnlockedPages((prev) => new Set([...prev, pNum]))
  }

  // 🎯 QUY TẮC XEN KẼ KHÔNG KHÓA LIÊN TIẾP:
  // - Trang 1, 2: "free" (mở 100%)
  // - Trang 3: "delay" (chờ 10s tại chỗ)
  // - Trang 4: "free" (mở xen kẽ)
  // - Trang 5: "hard_lock" (kính mờ khóa)
  // - Trang 6: "free" (mở xen kẽ)
  // - Trang 7: "delay" (chờ 10s tại chỗ)...
  const getPageType = (pNum) => {
    if (isTeacher) return "free"
    if (pNum <= 2) return "free"
    if (pNum % 2 === 0) return "free"

    const oddIndex = (pNum - 3) / 2
    return oddIndex % 2 === 0 ? "delay" : "hard_lock"
  }

  const currentUserName = localStorage.getItem("username") || localStorage.getItem("full_name") || "Học viên EduTech"
  const currentUserId = localStorage.getItem("user_id") || "ID-MEMBER"

  const [document, setDocument] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // PDF Controls
  const [numPages, setNumPages] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [inputPage, setInputPage] = useState("1")
  const [scale, setScale] = useState(1.15)
  const [rotation, setRotation] = useState(0)
  const [isContinuousScroll, setIsContinuousScroll] = useState(true)
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
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && ["p", "s", "u"].includes(e.key.toLowerCase())) {
        e.preventDefault()
        triggerToast("Hành động bị giới hạn để bảo vệ quyền tác giả!")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

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

  const watermarkSvgBg = useMemo(() => {
    const textPrimary = `${currentUserName} (${currentUserId})`
    const textSecondary = `BẢN QUYỀN EDUTECH • ${new Date().toLocaleDateString("vi-VN")}`

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="360" height="240">
        <text x="50%" y="42%" text-anchor="middle" fill="rgba(100, 116, 139, 0.16)" font-size="13" font-family="sans-serif" font-weight="bold" transform="rotate(-25, 180, 120)">
          ${textPrimary}
        </text>
        <text x="50%" y="62%" text-anchor="middle" fill="rgba(100, 116, 139, 0.11)" font-size="11" font-family="sans-serif" transform="rotate(-25, 180, 120)">
          ${textSecondary}
        </text>
      </svg>
    `.trim()

    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svgString)}")`
  }, [currentUserName, currentUserId])

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
    if (!isTeacher) {
      triggerToast("Tài liệu chỉ cho phép đọc trực tuyến. Vui lòng liên hệ quản trị viên!")
      return
    }

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
  const currentPageType = getPageType(currentPage)
  const isCurrentPageUnlocked = unlockedPages.has(currentPage)

  return (
    <div 
      ref={readerContainerRef} 
      className="w-full h-[calc(100vh-70px)] flex flex-col bg-white font-sans select-none overflow-hidden"
      onContextMenu={(e) => {
        e.preventDefault()
        triggerToast("Đã khóa chuột phải để bảo vệ nội dung tài liệu!")
      }}
    >
      {/* Toast thông báo */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-orange-400/40 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 🎯 1. THANH CÔNG CỤ TRÊN CÙNG */}
      <header className="w-full px-4 py-2 bg-white border-b border-slate-200 text-slate-700 flex flex-wrap items-center justify-between gap-2.5 text-xs z-20 shrink-0 shadow-2xs">
        
        {/* Cụm trái */}
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

        {/* Cụm phải: Zoom, Xoay, Toàn màn hình & Ẩn/Hiện bảng */}
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

      {/* 🎯 2. THÂN GIAO DIỆN */}
      <div className="flex flex-1 w-full h-[calc(100%-49px)] overflow-hidden bg-slate-100/90 relative">
        
        {/* SIDEBAR MỤC LỤC */}
        {showSidebar && isPdf && (
          <aside className="w-60 md:w-64 bg-white border-r border-slate-200 p-3 overflow-y-auto flex flex-col gap-3 shrink-0 z-10 animate-in slide-in-from-left duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-700 text-xs font-bold">
              <span>Mục lục ({numPages || 0} trang)</span>
              <span className="text-[10px] text-slate-400">Xen kẽ</span>
            </div>

            <Document file={document.file_url} className="space-y-3 flex flex-col items-center">
              {Array.from(new Array(numPages || 0), (_, index) => {
                const pNum = index + 1
                const isSelected = currentPage === pNum
                const type = getPageType(pNum)
                const isUnlocked = unlockedPages.has(pNum)
                const isMaskedThumb = (type === "delay" && !isUnlocked) || type === "hard_lock"

                return (
                  <div
                    key={`thumb_${pNum}`}
                    onClick={() => handleJumpToPage(pNum)}
                    className={`w-full p-2 rounded-xl cursor-pointer transition flex flex-col items-center gap-1.5 border relative ${
                      isSelected 
                        ? "bg-orange-50 border-orange-500 text-orange-600 font-extrabold shadow-xs" 
                        : "bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="w-24 shadow-sm rounded-xs overflow-hidden pointer-events-none bg-white border border-slate-200 relative">
                      <div className={isMaskedThumb ? "filter blur-[1.5px] opacity-80" : ""}>
                        <Page
                          pageNumber={pNum}
                          width={96}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </div>
                      {isMaskedThumb && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                          {type === "hard_lock" ? (
                            <EyeOff className="w-4 h-4 text-rose-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] flex items-center gap-1 font-medium">
                      {pNum <= 2 && <span className="text-emerald-600 font-bold">●</span>}
                      {type === "hard_lock" && <EyeOff className="w-3 h-3 text-rose-500" />}
                      {type === "delay" && !isUnlocked && <Clock className="w-3 h-3 text-amber-500" />}
                      Trang {pNum}
                    </span>
                  </div>
                )
              })}
            </Document>
          </aside>
        )}

        {/* KHU VỰC HIỂN THỊ TÀI LIỆU */}
        <main className="flex-1 overflow-auto flex justify-center p-4 md:p-8 bg-slate-100/90">
          {isPdf ? (
            <Document
              file={document.file_url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center p-16 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  <span className="text-xs font-bold text-slate-500">Đang chuẩn bị trang đọc...</span>
                </div>
              }
              error={
                <div className="p-8 text-center text-xs text-red-500 font-bold">
                  Không thể nạp tệp PDF. Vui lòng thử lại sau.
                </div>
              }
            >
              {isContinuousScroll ? (
                /* ============================================================ */
                /* CHẾ ĐỘ CUỘN DỌC: MỜ TRONG NHƯ KÍNH (THẤY CHỮ ẨN HIỆN)       */
                /* ============================================================ */
                <div className="flex flex-col gap-6 items-center">
                  {Array.from(new Array(numPages || 0), (_, index) => {
                    const pageNumber = index + 1
                    const type = getPageType(pageNumber)
                    const isUnlocked = unlockedPages.has(pageNumber)

                    // 1. TRANG ĐỢI 10S: ĐẾM RIÊNG TỪNG TRANG KHI CUỘN TỚI
                    if (type === "delay") {
                      return (
                        <DelayedPageCard
                          key={`page_delay_${pageNumber}`}
                          pageNumber={pageNumber}
                          scale={scale}
                          rotation={rotation}
                          watermarkSvgBg={watermarkSvgBg}
                          isUnlocked={isUnlocked}
                          onUnlockPage={handleUnlockPage}
                          isContinuousScroll={true}
                          isCurrentlyActive={false}
                        />
                      )
                    }

                    // 2. TRANG MỞ (1, 2 và các trang chẵn) HOẶC TRANG KÍNH MỜ KHÓA HẲN
                    const isHard = type === "hard_lock"

                    return (
                      <div
                        key={`page_${pageNumber}`}
                        className="shadow-xl rounded-xs overflow-hidden bg-white border border-slate-300 relative flex justify-center"
                      >
                        {/* Watermark */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            zIndex: 35,
                            backgroundImage: watermarkSvgBg,
                            backgroundRepeat: "repeat",
                            backgroundPosition: "center center"
                          }}
                        />

                        {/* 🎯 Nội dung trang: Mờ 5px, độ rõ 85% -> Vẫn thấy rõ từng khối chữ bên trong */}
                        <div
                          style={{
                            filter: isHard ? "blur(5px)" : "none",
                            opacity: isHard ? 0.85 : 1,
                            pointerEvents: isHard ? "none" : "auto",
                            userSelect: "none"
                          }}
                        >
                          <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            rotate={rotation}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                          />
                        </div>

                        {/* 🎯 Tấm kính mờ trong suốt cho trang khóa hẳn */}
                        {isHard && (
                          <div 
                            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                            style={{
                              zIndex: 30,
                              backgroundColor: "rgba(255, 255, 255, 0.2)",
                              backdropFilter: "blur(4.5px)",
                              WebkitBackdropFilter: "blur(4.5px)"
                            }}
                          >
                            <div className="bg-white/85 backdrop-blur-lg p-5 md:p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-white/90 flex flex-col items-center space-y-3 animate-in zoom-in-95">
                              <div className="w-11 h-11 bg-rose-500/15 text-rose-600 rounded-full flex items-center justify-center border border-rose-300 shadow-inner">
                                <EyeOff className="w-5 h-5" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-sm font-black text-slate-900">
                                  Trang {pageNumber} thuộc nội dung nâng cao
                                </h4>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                  Trang này nằm ngoài gói đọc thử. Vui lòng đăng ký gói học viên để mở xem chi tiết.
                                </p>
                              </div>
                              <button
                                onClick={() => triggerToast(`Đã gửi yêu cầu mở khóa trang ${pageNumber}!`)}
                                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-orange-500/25 cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Mở khóa toàn bộ tài liệu</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* ============================================================ */
                /* CHẾ ĐỘ XEM TỪNG TRANG                                        */
                /* ============================================================ */
                <div>
                  {currentPageType === "delay" ? (
                    <DelayedPageCard
                      pageNumber={currentPage}
                      scale={scale}
                      rotation={rotation}
                      watermarkSvgBg={watermarkSvgBg}
                      isUnlocked={isCurrentPageUnlocked}
                      onUnlockPage={handleUnlockPage}
                      isContinuousScroll={false}
                      isCurrentlyActive={true}
                    />
                  ) : (
                    <div className="shadow-xl rounded-xs overflow-hidden bg-white border border-slate-300 relative flex justify-center">
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          zIndex: 35,
                          backgroundImage: watermarkSvgBg,
                          backgroundRepeat: "repeat",
                          backgroundPosition: "center center"
                        }}
                      />
                      <div
                        style={{
                          filter: currentPageType === "hard_lock" ? "blur(5px)" : "none",
                          opacity: currentPageType === "hard_lock" ? 0.85 : 1,
                          userSelect: "none"
                        }}
                      >
                        <Page
                          pageNumber={currentPage}
                          scale={scale}
                          rotate={rotation}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </div>

                      {currentPageType === "hard_lock" && (
                        <div 
                          className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                          style={{
                            zIndex: 30,
                            backgroundColor: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(4.5px)",
                            WebkitBackdropFilter: "blur(4.5px)"
                          }}
                        >
                          <div className="bg-white/85 backdrop-blur-lg p-5 md:p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-white/90 flex flex-col items-center space-y-3 animate-in zoom-in-95">
                            <div className="w-11 h-11 bg-rose-500/15 text-rose-600 rounded-full flex items-center justify-center border border-rose-300 shadow-inner">
                              <EyeOff className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-black text-slate-900">
                                Trang {currentPage} thuộc nội dung nâng cao
                              </h4>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                Trang này nằm ngoài gói đọc thử. Vui lòng đăng ký gói học viên để mở toàn bộ.
                              </p>
                            </div>
                            <button
                              onClick={() => triggerToast(`Đã gửi yêu cầu mở khóa trang ${currentPage}!`)}
                              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-orange-500/25 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Mở khóa toàn bộ</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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

        {/* 🎯 BẢNG THÔNG TIN HỌC LIỆU BÊN PHẢI */}
        {showMetaPanel && (
          <aside className="w-72 md:w-80 bg-white border-l border-slate-200 p-5 overflow-y-auto flex flex-col justify-between shrink-0 shadow-lg z-10 animate-in slide-in-from-right duration-150">
            <div className="space-y-4">
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

              {isTeacher ? (
                <button
                  onClick={handleDownload}
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>TẢI TỆP TIN VỀ MÁY</span>
                </button>
              ) : (
                <button
                  onClick={handleDownload}
                  className="w-full py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>CHỈ CHO PHÉP ĐỌC TRỰC TUYẾN</span>
                </button>
              )}
            </div>
          </aside>
        )}

      </div>
    </div>
  )
}