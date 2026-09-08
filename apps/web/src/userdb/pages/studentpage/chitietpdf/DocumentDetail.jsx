import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Download,
  Share2,
  Bookmark,
  FileText,
  ThumbsUp,
  Eye,
  Calendar,
  Layers,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquare,
  Send,
  UserCheck
} from "lucide-react"

// Mock danh sách tài liệu đầy đủ kèm dữ liệu đánh giá
const ALL_DOCUMENTS = [
  {
    id: 1,
    title: "Tiểu Luận Nhóm 10 - Pháp Luật Đại Cương",
    subTitle: "Nghiên cứu về quy định sở hữu tài sản trong Bộ luật Dân sự 2015",
    faculty: "Khoa Luật & Khoa học Xã hội",
    author: "Nhóm 10 - Lớp K15",
    pages: 47,
    fileSize: "3.4 MB",
    fileType: "PDF",
    uploadDate: "15/10/2025",
    downloads: 1420,
    views: 3890,
    likes: 312,
    rating: 4.9,
    ratingCount: 86,
    tag: "ĐH",
    color: "text-red-600 bg-red-100",
    description:
      "Tài liệu tổng hợp phân tích cấu trúc pháp luật, khái niệm quyền sở hữu, chiếm hữu và các bài tập tình huống thực tiễn áp dụng cho sinh viên các khối ngành đại trà.",
    outline: [
      "Phần 1: Mở đầu & Tính cấp thiết của đề tài",
      "Phần 2: Khái quát chung về quyền sở hữu tài sản",
      "Phần 3: Thực trạng áp dụng pháp luật và bài học thực tiễn",
      "Phần 4: Kết luận & Kiến nghị sửa đổi"
    ],
    ratingBreakdown: {
      5: 78,
      4: 16,
      3: 4,
      2: 1,
      1: 1
    },
    reviews: [
      {
        id: "r1",
        author: "Trần Minh Quân",
        classBadge: "CNTT K15",
        score: 5,
        date: "2 ngày trước",
        comment: "Bố cục bài tiểu luận rất chuẩn chỉnh theo format của trường, phần trích dẫn điều luật dân sự rất chính xác. Mình đã tham khảo để làm bài thi giữa kỳ đạt 9.5.",
        upvotes: 14
      },
      {
        id: "r2",
        author: "Nguyễn Hà Linh",
        classBadge: "Kinh Tế K14",
        score: 5,
        date: "1 tuần trước",
        comment: "Tài liệu hay, lời văn gãy gọn và có nhiều ví dụ thực tế về tranh chấp tài sản thừa kế. Rất đáng để tải về tham khảo!",
        upvotes: 8
      },
      {
        id: "r3",
        author: "Lê Đức Thắng",
        classBadge: "Khoa Luật K15",
        score: 4,
        date: "3 tuần trước",
        comment: "Nội dung rất tốt, tuy nhiên ở phần kiến nghị sửa đổi nếu có thêm dẫn chứng từ luật so sánh quốc tế thì bài sẽ trọn vẹn hơn nữa.",
        upvotes: 3
      }
    ],
    relatedDocs: [
      { id: 2, title: "- Tiểu Luận PLĐC", pages: 61, size: "4.1 MB" },
      { id: 3, title: "Tiểu Luận Pháp Luật Đại Cương", pages: 25, size: "1.8 MB" }
    ]
  },
  {
    id: 2,
    title: "- Tiểu Luận PLĐC",
    subTitle: "Đề tài trách nhiệm dân sự do vi phạm hợp đồng thương mại",
    faculty: "Khoa Luật Kinh Tế",
    author: "Ủy Ban Học Tập UB",
    pages: 61,
    fileSize: "4.1 MB",
    fileType: "PDF",
    uploadDate: "02/11/2025",
    downloads: 980,
    views: 2410,
    likes: 188,
    rating: 4.8,
    ratingCount: 42,
    tag: "UB",
    color: "text-blue-700 bg-blue-100",
    description: "Đề tài nghiên cứu các yếu tố cấu thành trách nhiệm dân sự và bồi thường thiệt hại ngoài hợp đồng.",
    outline: [
      "Chương I: Cơ sở lý luận về chế định hợp đồng",
      "Chương II: Phân tích thực trạng vi phạm nghĩa vụ hợp đồng",
      "Chương III: Biện pháp phòng tránh rủi ro pháp lý"
    ],
    ratingBreakdown: { 5: 80, 4: 15, 3: 5, 2: 0, 1: 0 },
    reviews: [
      {
        id: "r201",
        author: "Phạm Tấn Đạt",
        classBadge: "QTKD K15",
        score: 5,
        date: "5 ngày trước",
        comment: "Rất chi tiết về hợp đồng thương mại, bảng đối chiếu điều khoản làm rất công phu.",
        upvotes: 6
      }
    ],
    relatedDocs: [
      { id: 1, title: "Tiểu Luận Nhóm 10", pages: 47, size: "3.4 MB" }
    ]
  },
  {
    id: 3,
    title: "Tiểu Luận Pháp Luật Đại Cương",
    subTitle: "Khái cương về hệ thống cơ quan quản lý nhà nước",
    faculty: "Khoa Lý Luận Chính Trị",
    author: "Ban Học Cụ PL",
    pages: 25,
    fileSize: "1.8 MB",
    fileType: "PDF",
    uploadDate: "20/12/2025",
    downloads: 750,
    views: 1800,
    likes: 120,
    rating: 4.7,
    ratingCount: 28,
    tag: "PL",
    color: "text-sky-600 bg-sky-100",
    description: "Tóm tắt các quy chế lập pháp, hành pháp và tư pháp theo Hiến pháp năm 2013.",
    outline: ["Chương I: Bộ máy nhà nước CHXHCN Việt Nam", "Chương II: Cơ chế vận hành quyền lực"],
    ratingBreakdown: { 5: 70, 4: 25, 3: 5, 2: 0, 1: 0 },
    reviews: [],
    relatedDocs: []
  },
  {
    id: 4,
    title: "430206 - Nguyễn Tuấn Anh",
    subTitle: "Bài thu hoạch môn học pháp chế đại cương",
    faculty: "Khoa CNTT",
    author: "Nguyễn Tuấn Anh",
    pages: 16,
    fileSize: "1.2 MB",
    fileType: "PDF",
    uploadDate: "05/01/2026",
    downloads: 410,
    views: 920,
    likes: 45,
    rating: 4.5,
    ratingCount: 12,
    tag: "NTA",
    color: "text-slate-800 bg-slate-200",
    description: "Bài tập cá nhân tổng hợp kiến thức học phần.",
    outline: ["Nội dung 1: Tóm tắt bài giảng", "Nội dung 2: Liên hệ bản thân"],
    ratingBreakdown: { 5: 60, 4: 30, 3: 10, 2: 0, 1: 0 },
    reviews: [],
    relatedDocs: []
  },
  {
    id: 5,
    title: "Tiểu Luận PLDC",
    subTitle: "Nghiên cứu văn hóa pháp lý học đường",
    faculty: "Khoa Xã Hội Học",
    author: "Nhóm TM",
    pages: 22,
    fileSize: "1.5 MB",
    fileType: "PDF",
    uploadDate: "12/02/2026",
    downloads: 530,
    views: 1100,
    likes: 72,
    rating: 4.6,
    ratingCount: 19,
    tag: "TM",
    color: "text-amber-700 bg-amber-100",
    description: "Đánh giá mức độ hiểu biết pháp luật của sinh viên năm nhất.",
    outline: ["Phần mở đầu", "Khảo sát thực tế", "Giải pháp tuyên truyền"],
    ratingBreakdown: { 5: 65, 4: 25, 3: 10, 2: 0, 1: 0 },
    reviews: [],
    relatedDocs: []
  },
  {
    id: 6,
    title: "Luật HNGĐ",
    subTitle: "Luật Hôn Nhân và Gia Đình - Tài liệu phân tích chuyên đề",
    faculty: "Khoa Dân Sự",
    author: "Ban Soạn Thảo HNGĐ",
    pages: 205,
    fileSize: "12.8 MB",
    fileType: "PDF",
    uploadDate: "28/02/2026",
    downloads: 3200,
    views: 8900,
    likes: 850,
    rating: 5.0,
    ratingCount: 140,
    tag: "HNGĐ",
    color: "text-emerald-700 bg-emerald-100",
    description: "Bộ tài liệu chuyên sâu 205 trang phân tích toàn diện Luật Hôn nhân & Gia đình và các án lệ thực tế.",
    outline: [
      "Phần 1: Những nguyên tắc cơ bản của chế độ HNGĐ",
      "Phần 2: Điều kiện kết hôn và hệ quả kết hôn trái pháp luật",
      "Phần 3: Chế độ tài sản của vợ chồng theo luật định và theo thỏa thuận",
      "Phần 4: Ly hôn và giải quyết tranh chấp nuôi con, chia tài sản"
    ],
    ratingBreakdown: { 5: 95, 4: 5, 3: 0, 2: 0, 1: 0 },
    reviews: [
      {
        id: "r601",
        author: "Võ Hoàng Yến",
        classBadge: "Thạc sĩ Luật",
        score: 5,
        date: "3 ngày trước",
        comment: "Tài liệu cực kỳ đầy đủ và có giá trị tham khảo học thuật rất cao. Hệ thống án lệ phân loại chi tiết.",
        upvotes: 27
      }
    ],
    relatedDocs: [
      { id: 1, title: "Tiểu Luận Nhóm 10", pages: 47, size: "3.4 MB" }
    ]
  }
]

export default function DocumentDetail() {
  const { docId } = useParams()
  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState(1)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [toastMsg, setToastMsg] = useState("")

  // State đánh giá nhận xét
  const [userRating, setUserRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [commentInput, setCommentInput] = useState("")

  const triggerToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(""), 3000)
  }

  const doc = ALL_DOCUMENTS.find((d) => String(d.id) === String(docId))

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <FileText className="w-14 h-14 text-slate-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy tài liệu #{docId}</h2>
        <p className="text-sm text-slate-500 mt-1 mb-4">Tệp tin có thể đã bị gỡ hoặc đường dẫn không đúng.</p>
        <button
          onClick={() => navigate("/student/home")}
          className="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
        >
          Quay lại trang chủ
        </button>
      </div>
    )
  }

  const handleDownload = () => {
    triggerToast(`Đang tải tệp: ${doc.title}.pdf`)
  }

  const handleSubmitReview = (e) => {
    e.preventDefault()
    if (!commentInput.trim()) {
      triggerToast("Vui lòng nhập lời nhận xét trước khi gửi!")
      return
    }
    triggerToast("Cảm ơn bạn đã gửi đánh giá cho tài liệu!")
    setCommentInput("")
  }

  return (
    <div className="doc-detail-universe">
      <style>{`
        .doc-detail-universe {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Inter', -apple-system, sans-serif;
          color: #0f172a;
          padding-bottom: 50px;
        }

        .doc-nav-bar {
          position: sticky;
          top: 0;
          z-index: 40;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .doc-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #1e3a8a;
          font-size: 13px;
          font-weight: 700;
          padding: 7px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .doc-back-btn:hover {
          background: #e0e7ff;
          border-color: #1e3a8a;
        }

        .doc-body-grid {
          max-width: 1280px;
          margin: 24px auto 0;
          padding: 0 20px;
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 24px;
          align-items: start;
        }

        /* Khung Preview PDF Mockup */
        .preview-stage-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        .preview-toolbar {
          background: #1e293b;
          color: #ffffff;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
        }

        .preview-canvas-viewport {
          background: #475569;
          min-height: 520px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: auto;
        }

        .simulated-pdf-sheet {
          background: #ffffff;
          width: 100%;
          max-width: 480px;
          min-height: 600px;
          border-radius: 6px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          padding: 40px 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s ease;
        }

        .mock-sheet-header {
          border-bottom: 2px solid #0f172a;
          padding-bottom: 12px;
          text-align: center;
        }

        .mock-skeleton-line {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          margin-bottom: 8px;
        }

        /* Review Section */
        .rating-summary-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
          margin-top: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        }

        .rating-bar-track {
          flex: 1;
          height: 6px;
          background: #f1f5f9;
          border-radius: 9999px;
          overflow: hidden;
        }

        .rating-bar-fill {
          height: 100%;
          background: #f59e0b;
          border-radius: 9999px;
        }

        .review-card-item {
          padding: 14px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 12px;
          transition: all 0.2s ease;
        }

        .review-card-item:hover {
          background: #ffffff;
          border-color: #cbd5e1;
        }

        /* Cột bên phải */
        .doc-meta-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          margin-bottom: 18px;
        }

        .doc-download-main-btn {
          width: 100%;
          padding: 13px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%);
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 6px 16px rgba(2, 132, 199, 0.25);
          transition: all 0.2s;
        }

        .doc-download-main-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(2, 132, 199, 0.35);
        }

        @media (max-width: 960px) {
          .doc-body-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Toast thông báo */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="doc-nav-bar">
        <button className="doc-back-btn" onClick={() => navigate("/student/home")}>
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            className={`p-2 border rounded-lg transition ${isLiked ? "text-emerald-600 bg-emerald-50 border-emerald-300" : "bg-white border-slate-200 text-slate-600"}`}
            onClick={() => {
              setIsLiked(!isLiked)
              triggerToast(isLiked ? "Đã bỏ thích" : "Đã thích tài liệu")
            }}
            title="Thích tài liệu"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            className={`p-2 border rounded-lg transition ${isBookmarked ? "text-amber-500 bg-amber-50 border-amber-300" : "bg-white border-slate-200 text-slate-600"}`}
            onClick={() => {
              setIsBookmarked(!isBookmarked)
              triggerToast(isBookmarked ? "Đã bỏ lưu" : "Đã lưu vào bộ sưu tập")
            }}
            title="Lưu tài liệu"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            className="p-2 border border-slate-200 bg-white rounded-lg text-slate-600 hover:bg-slate-50 transition"
            onClick={() => triggerToast("Đã sao chép liên kết tài liệu")}
            title="Chia sẻ"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Thân bài */}
      <main className="doc-body-grid">
        {/* Cột trái: Preview PDF, Đề cương & Đánh giá */}
        <div>
          {/* 1. Preview PDF */}
          <div className="preview-stage-card mb-6">
            <div className="preview-toolbar">
              <div className="flex items-center gap-3">
                <span className="bg-red-500 text-white font-black text-[10px] px-2 py-0.5 rounded">PDF</span>
                <span className="font-semibold text-xs truncate max-w-[240px] md:max-w-[360px]">{doc.title}.pdf</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded-md text-xs">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="hover:text-sky-400 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span>{currentPage} / {doc.pages}</span>
                  <button
                    disabled={currentPage >= doc.pages}
                    onClick={() => setCurrentPage((p) => Math.min(doc.pages, p + 1))}
                    className="hover:text-sky-400 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    className="p-1 hover:text-sky-400"
                    onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                    title="Thu nhỏ"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs w-10 text-center">{zoomLevel}%</span>
                  <button
                    className="p-1 hover:text-sky-400"
                    onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                    title="Phóng to"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="preview-canvas-viewport">
              <div
                className="simulated-pdf-sheet"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                <div>
                  <div className="mock-sheet-header mb-6">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                      {doc.faculty}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                      {doc.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 italic">{doc.subTitle}</p>
                  </div>

                  <div className="space-y-2 mt-6">
                    <div className="mock-skeleton-line w-full" />
                    <div className="mock-skeleton-line w-[90%]" />
                    <div className="mock-skeleton-line w-[95%]" />
                    <div className="mock-skeleton-line w-[80%]" />
                    <div className="mock-skeleton-line w-[88%]" />
                  </div>

                  <div className="mt-8 p-3 bg-slate-50 border border-dashed border-slate-300 rounded text-[11px] text-slate-600 leading-relaxed">
                    <strong>Nội dung tóm tắt trang {currentPage}:</strong> {doc.description}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Hệ thống thư viện số trực tuyến</span>
                  <span>Trang {currentPage}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Đề cương mục lục tài liệu */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-900" /> Cấu trúc & Đề cương tài liệu
            </h4>
            <div className="space-y-2">
              {doc.outline.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-900 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. KHU VỰC ĐÁNH GIÁ & NHẬN XÉT CHI TIẾT */}
          <section className="rating-summary-box">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Đánh giá & Nhận xét từ sinh viên
              </h4>
              <span className="text-xs font-semibold text-slate-500">
                {doc.ratingCount || 0} lượt xếp hạng
              </span>
            </div>

            {/* Thống kê điểm sao & phân bổ */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
              <div className="md:col-span-4 text-center md:border-r border-slate-200 md:pr-4">
                <div className="text-4xl font-black text-slate-900 leading-none mb-1">
                  {typeof doc.rating === "number" ? doc.rating.toFixed(1) : doc.rating}
                </div>
                <div className="flex items-center justify-center gap-1 text-amber-400 my-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Đánh giá chung cộng đồng</span>
              </div>

              <div className="md:col-span-8 space-y-1.5 text-xs text-slate-600">
                {[5, 4, 3, 2, 1].map((star) => {
                  const percent = doc.ratingBreakdown ? doc.ratingBreakdown[star] || 0 : star === 5 ? 85 : 15
                  return (
                    <div key={star} className="flex items-center gap-2.5">
                      <span className="w-10 font-bold flex items-center gap-1">
                        {star} <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      </span>
                      <div className="rating-bar-track">
                        <div className="rating-bar-fill" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="w-8 text-right font-medium text-slate-400">{percent}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Khung gửi nhận xét mới */}
            <form onSubmit={handleSubmitReview} className="p-4 border border-slate-200 rounded-xl bg-white mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-800">Đánh giá của bạn về tài liệu này:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5 text-slate-300 hover:text-amber-400 transition"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          (hoverRating || userRating) >= star ? "text-amber-400 fill-amber-400" : ""
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <textarea
                  rows="3"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Chia sẻ nhận xét về nội dung, tính thực tiễn hay độ chính xác của tài liệu để hỗ trợ các sinh viên khác..."
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-sky-500 focus:bg-white transition resize-none"
                />
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition"
                >
                  <Send className="w-3.5 h-3.5" /> Gửi đánh giá
                </button>
              </div>
            </form>

            {/* Danh sách các bình luận đánh giá */}
            <div className="space-y-3">
              {doc.reviews && doc.reviews.length > 0 ? (
                doc.reviews.map((rev) => (
                  <div key={rev.id} className="review-card-item">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">{rev.author}</span>
                        <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded">
                          {rev.classBadge}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.score ? "fill-amber-400" : "text-slate-300"}`}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed mb-3">{rev.comment}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 text-slate-400">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Đã xác thực sinh viên
                      </span>
                      <button
                        onClick={() => triggerToast(`Đã ghi nhận hữu ích từ nhận xét của ${rev.author}!`)}
                        className="hover:text-blue-900 flex items-center gap-1 font-semibold transition"
                      >
                        <ThumbsUp className="w-3 h-3" /> Hữu ích ({rev.upvotes})
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Chưa có nhận xét nào. Hãy là người đầu tiên để lại đánh giá cho tài liệu này!
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Cột phải: Thông số & Nút tải về */}
        <aside>
          <div className="doc-meta-card">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-base shadow-xs ${doc.color}`}>
                {doc.tag}
              </div>
              <div className="min-width-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Học liệu chính quy</span>
                <h3 className="text-sm font-extrabold text-slate-900 truncate">{doc.title}</h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4 pb-3 border-b border-slate-100">
              {doc.description}
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Tác giả / Nhóm:</span>
                <span className="font-bold text-slate-800">{doc.author}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Số trang:</span>
                <span className="font-bold text-slate-800">{doc.pages} trang</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Dung lượng tệp:</span>
                <span className="font-bold text-slate-800">{doc.fileSize}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Lượt tải về:</span>
                <span className="font-bold text-emerald-600">{doc.downloads} lượt</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Đánh giá chung:</span>
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {typeof doc.rating === "number" ? `${doc.rating} / 5.0` : doc.rating}
                </span>
              </div>
            </div>

            <button className="doc-download-main-btn mt-5" onClick={handleDownload}>
              <Download className="w-4 h-4" />
              <span>TẢI TẬP TIN PDF</span>
            </button>
          </div>

          {/* Tài liệu liên quan */}
          {doc.relatedDocs && doc.relatedDocs.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h5 className="text-xs font-extrabold uppercase text-slate-400 tracking-wide mb-3">
                Tài liệu cùng chủ đề
              </h5>
              <div className="space-y-2">
                {doc.relatedDocs.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => navigate(`/student/documents/${rel.id}`)}
                    className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <h6 className="text-xs font-bold text-slate-800">{rel.title}</h6>
                      <span className="text-[10px] text-slate-500">{rel.pages} trang • {rel.size}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}