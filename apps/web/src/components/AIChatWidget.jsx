import React, { useState, useRef, useEffect, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  RotateCcw,
  ChevronDown,
  CreditCard,
  BookOpen,
  GraduationCap,
  Layers,
  ArrowRight,
  Copy,
  Check,
  ThumbsUp,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Download,
  Users,
  Calendar,
  FileCheck,
  DollarSign
} from "lucide-react"

// Chuẩn hóa tiếng Việt bỏ dấu để tìm kiếm thông minh hơn
const removeVietnameseTones = (str = "") => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
}

// BỘ DỮ LIỆU ĐA NGHIỆP VỤ HỖ TRỢ TOÀN HỆ THỐNG
const KNOWLEDGE_BASE = [
  // --- 1. DÀNH CHO HỌC VIÊN (STUDENT) ---
  {
    id: "student_programs",
    category: "student",
    keywords: ["khoa hoc", "chuong trinh", "khoi lop", "dang ky hoc", "mua khoa", "lop 10", "lop 11", "lop 12"],
    answer:
      "Bạn có thể khám phá toàn bộ lộ trình học tại **Chương trình khối lớp**:\n" +
      "* Lựa chọn môn học theo khối và xem đề cương.\n" +
      "* Với khóa miễn phí: Bấm **Tham gia ngay**.\n" +
      "* Với khóa có phí: Thanh toán nhanh chóng qua cổng **VNPAY**.",
    action: { label: "Mở Chương trình khối lớp", path: "/student/programs", roles: ["student", "all"] }
  },
  {
    id: "student_my_courses",
    category: "student",
    keywords: ["mon hoc cua toi", "bai hoc cua toi", "vao hoc", "tiep tuc hoc", "danh sach mon"],
    answer:
      "Tất cả các môn bạn đã đăng ký hoặc đang theo học đều được lưu tại **Môn học của tôi**. Bạn có thể theo dõi tiến độ hoàn thành % tại đây.",
    action: { label: "Mở Môn học của tôi", path: "/student/courses", roles: ["student", "all"] }
  },
  {
    id: "student_library",
    category: "student",
    keywords: ["kho hoc lieu", "tai lieu", "de cuong", "giao trinh", "tai file", "pdf"],
    answer:
      "Toàn bộ tài liệu tham khảo, file bài tập và đề cương số hóa chuẩn chương trình được tổng hợp tại **Kho học liệu**.",
    action: { label: "Mở Kho học liệu", path: "/student/library", roles: ["student", "all"] }
  },
  {
    id: "student_bookshelf",
    category: "student",
    keywords: ["tu sach", "doc sach", "sach giao khoa", "bookshelf", "ebook"],
    answer:
      "Bạn có thể đọc sách giáo khoa điện tử và tuyển tập tài liệu tham khảo trực tuyến tại **Tủ sách điện tử**.",
    action: { label: "Xem Tủ sách điện tử", path: "/student/bookshelf", roles: ["student", "all"] }
  },
  {
    id: "student_videos",
    category: "student",
    keywords: ["video", "videoedu", "bai giang video", "xem lai bai giang", "clip hoc"],
    answer:
      "Thư viện bài giảng ghi hình chất lượng cao theo từng chuyên đề ôn luyện có tại **VideoEdu**.",
    action: { label: "Xem Video bài giảng", path: "/student/videos", roles: ["student", "all"] }
  },

  // --- 2. THANH TOÁN & GIAO DỊCH (VNPAY) ---
  {
    id: "payment_vnpay",
    category: "payment",
    keywords: ["vnpay", "thanh toan", "chuyen khoan", "quet qr", "hoc phi", "nap tien", "giao dich", "hoa don"],
    answer:
      "Quy trình thanh toán học phí qua **VNPAY**:\n" +
      "1. Chọn khóa học cần thanh toán ➔ Hệ thống tạo mã QR VNPAY.\n" +
      "2. Dùng App Ngân hàng hoặc ví VNPAY quét mã.\n" +
      "3. Sau khi trừ tiền thành công, khóa học được kích hoạt tự động sau **5–10 giây**. Bạn có thể xem lại lịch sử tại trang giao dịch.",
    action: { label: "Xem Lịch sử giao dịch", path: "/student/transactions", roles: ["student", "all"] }
  },

  // --- 3. DÀNH CHO GIÁNG VIÊN (TEACHER) ---
  {
    id: "teacher_courses",
    category: "teacher",
    keywords: ["quan ly lop hoc", "lop day", "danh sach lop day", "bai giang cua toi"],
    answer:
      "Thầy/Cô quản lý các khóa học đang trực tiếp giảng dạy, bài tập và học viên tại **Quản lý lớp học**.",
    action: { label: "Quản lý khóa học", path: "/teacher/courses", roles: ["teacher"] }
  },
  {
    id: "teacher_request",
    category: "teacher",
    keywords: ["yeu cau mo khoa", "mo lop moi", "tao khoa hoc", "de xuat khoa"],
    answer:
      "Thầy/Cô soạn thảo thông tin khóa học, khung chương trình và học phí gửi Ban Quản Trị tại **Yêu cầu mở khóa**.",
    action: { label: "Tạo yêu cầu mở khóa", path: "/teacher/courses/request", roles: ["teacher"] }
  },
  {
    id: "teacher_quizzes",
    category: "teacher",
    keywords: ["ngan hang de", "tao de thi", "trac nghiem", "soan cau hoi", "quiz bank"],
    answer:
      "Khu vực quản lý kho câu hỏi trắc nghiệm, cấu hình thời gian làm bài và trộn đề thi tự động tại **Ngân hàng đề thi**.",
    action: { label: "Mở Ngân hàng đề thi", path: "/teacher/quizzes", roles: ["teacher"] }
  },
  {
    id: "teacher_grading",
    category: "teacher",
    keywords: ["cham diem", "nhap diem", "cham bai", "bai nop", "grading"],
    answer:
      "Giáo viên kiểm tra danh sách bài tập đã nộp, nhập điểm tự luận và nhận xét học viên tại mục **Chấm điểm & Điểm số**.",
    action: { label: "Chấm bài & Nhập điểm", path: "/teacher/grading", roles: ["teacher"] }
  },
  {
    id: "teacher_schedule",
    category: "teacher",
    keywords: ["lich day", "lich meet", "google meet", "thoi khoa bieu", "phong hop"],
    answer:
      "Lịch biểu giảng dạy trực tuyến và phòng Google Meet theo ca học được quản lý tại **Lịch dạy & Meet**.",
    action: { label: "Xem Lịch dạy Meet", path: "/teacher/schedule", roles: ["teacher"] }
  },

  // --- 4. DÀNH CHO ADMIN (QUẢN TRỊ VIÊN) ---
  {
    id: "admin_dashboard",
    category: "admin",
    keywords: ["dashboard admin", "tong quan", "bao cao he thong", "thong ke"],
    answer:
      "Báo cáo tổng quan về số lượng học viên, số khóa học đang mở và doanh thu hệ thống tại **Bảng điều khiển Admin**.",
    action: { label: "Mở Admin Dashboard", path: "/admin/dashboard", roles: ["admin"] }
  },
  {
    id: "admin_users",
    category: "admin",
    keywords: ["quan ly nguoi dung", "tai khoan", "khoa tai khoan", "phan quyen", "user list"],
    answer:
      "Admin xem danh sách, khóa/mở tài khoản hoặc thay đổi vai trò (Student, Teacher, Admin) tại **Quản lý người dùng**.",
    action: { label: "Quản lý Người dùng", path: "/admin/users", roles: ["admin"] }
  },
  {
    id: "admin_courses",
    category: "admin",
    keywords: ["duyet khoa hoc", "khoa hoc truong", "admin courses", "tao khoa truong"],
    answer:
      "Phê duyệt các yêu cầu mở khóa của giảng viên hoặc tạo khóa học chuẩn tại **Quản lý khóa học Admin**.",
    action: { label: "Quản lý & Duyệt khóa", path: "/admin/courses", roles: ["admin"] }
  },
  {
    id: "admin_transactions",
    category: "admin",
    keywords: ["doanh thu", "giao dich he thong", "dong tien", "admin vnpay"],
    answer:
      "Theo dõi dòng tiền nộp học phí qua VNPAY và đối soát tài chính tại **Giao dịch & Doanh thu**.",
    action: { label: "Kiểm tra Doanh thu", path: "/admin/transactions", roles: ["admin"] }
  },

  // --- 5. TÀI KHOẢN & BẢO MẬT CHUNG ---
  {
    id: "common_profile",
    category: "common",
    keywords: ["ho so", "profile", "thong tin ca nhan", "doi mat khau", "avatar"],
    answer:
      "Cập nhật họ tên, hình đại diện và thông tin liên hệ của bạn tại **Thông tin cá nhân**.",
    action: { label: "Cập nhật Hồ sơ", path: "DYNAMIC_PROFILE", roles: ["all"] }
  },
  {
    id: "common_greeting",
    category: "common",
    keywords: ["chao", "hi", "hello", "alo", "ad oi", "ban oi", "tro ly"],
    answer:
      "Xin chào! Mình là **EduTech AI Copilot** 🎓.\n" +
      "Mình hiểu toàn bộ nghiệp vụ trên hệ thống. Bạn có thể hỏi bất kỳ điều gì hoặc bấm nút để chuyển thẳng đến màn hình cần thao tác!",
    action: null
  }
]

// Hàm tìm câu trả lời tối ưu theo từ khóa và vai trò người dùng
const findBestMatch = (queryText, currentRole = "student") => {
  const normalizedQuery = removeVietnameseTones(queryText)
  let bestItem = null
  let maxScore = 0

  for (const item of KNOWLEDGE_BASE) {
    let score = 0
    for (const kw of item.keywords) {
      const normalizedKw = removeVietnameseTones(kw)
      if (normalizedQuery.includes(normalizedKw)) {
        score += normalizedKw.split(" ").length * 3
      }
    }

    // Ưu tiên kết quả khớp với quyền hiện tại
    if (score > 0 && item.category === currentRole) {
      score += 2
    }

    if (score > maxScore) {
      maxScore = score
      bestItem = item
    }
  }

  if (bestItem && maxScore > 0) {
    let action = bestItem.action ? { ...bestItem.action } : null

    // Xử lý Dynamic Profile route
    if (action && action.path === "DYNAMIC_PROFILE") {
      action.path = currentRole === "admin" ? "/admin/profile" : `/${currentRole}/profile`
    }

    return {
      content: bestItem.answer,
      action
    }
  }

  return {
    content:
      "EduTech AI chưa tìm thấy chỉ mục khớp hoàn toàn với yêu cầu này. Bạn có thể thử:\n" +
      "* Gõ từ khóa ngắn gọn: *'học phí'*, *'tủ sách'*, *'chấm điểm'*, *'duyệt khóa'*...\n" +
      "* Hoặc sử dụng các lối tắt nhanh bên dưới.",
    action: null
  }
}

// Component format Markdown nhẹ nhàng
const FormattedMessage = ({ text, isBot }) => {
  const lines = text.split("\n")
  return (
    <div className="space-y-1.5 leading-relaxed text-[13px]">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1" />
        const isBullet = line.trim().startsWith("*") || line.trim().startsWith("-")
        const cleanLine = isBullet ? line.trim().replace(/^[*|-]\s*/, "") : line

        const rendered = cleanLine.replace(
          /\*\*(.*?)\*\*/g,
          `<strong class="${isBot ? "font-semibold text-orange-600" : "font-bold text-white"}">$1</strong>`
        )

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isBot ? "bg-orange-500" : "bg-white"}`} />
              <span dangerouslySetInnerHTML={{ __html: rendered }} />
            </div>
          )
        }

        return <p key={idx} dangerouslySetInnerHTML={{ __html: rendered }} />
      })}
    </div>
  )
}

export default function AIChatWidget() {
  const navigate = useNavigate()
  const location = useLocation()

  const currentRole = (localStorage.getItem("role") || "student").toLowerCase()

  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [likedIds, setLikedIds] = useState([])
  const [isSpeaking, setIsSpeaking] = useState(false)

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Xin chào! Mình là **EduTech Copilot** 🎓.\n" +
        "Bạn cần tìm tài liệu, xem lịch học, nộp bài hay thanh toán? Hãy nhắn câu hỏi hoặc bấm vào nút điều hướng để mình đưa bạn đến ngay!",
      action: {
        label: currentRole === "teacher" ? "Mở Quản lý lớp học" : "Xem Chương trình học",
        path: currentRole === "teacher" ? "/teacher/courses" : "/student/programs"
      },
      time: "Vừa xong"
    }
  ])

  const messagesEndRef = useRef(null)

  // Ẩn hoàn toàn AI khi học sinh đang làm bài thi để tránh gian lận / phân tâm
  if (location.pathname.includes("/exam/")) {
    return null
  }

  // Tùy biến câu hỏi gợi ý phù hợp từng phân quyền
  const quickPrompts = useMemo(() => {
    if (currentRole === "admin") {
      return [
        { icon: <Layers className="w-3.5 h-3.5" />, text: "Duyệt khóa học mới" },
        { icon: <Users className="w-3.5 h-3.5" />, text: "Quản lý người dùng" },
        { icon: <DollarSign className="w-3.5 h-3.5" />, text: "Kiểm tra doanh thu VNPAY" }
      ]
    }
    if (currentRole === "teacher" || currentRole === "instructor") {
      return [
        { icon: <FileCheck className="w-3.5 h-3.5" />, text: "Yêu cầu mở khóa học" },
        { icon: <GraduationCap className="w-3.5 h-3.5" />, text: "Soạn ngân hàng đề thi" },
        { icon: <Calendar className="w-3.5 h-3.5" />, text: "Xem lịch dạy Meet" }
      ]
    }
    return [
      { icon: <Layers className="w-3.5 h-3.5" />, text: "Xem chương trình khối lớp" },
      { icon: <CreditCard className="w-3.5 h-3.5" />, text: "Thanh toán học phí VNPAY" },
      { icon: <BookOpen className="w-3.5 h-3.5" />, text: "Mở tủ sách điện tử" }
    ]
  }, [currentRole])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen, isTyping])

  const handleSend = (customText) => {
    const text = (customText || input).trim()
    if (!text) return

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: text,
      time: now
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    setTimeout(() => {
      const response = findBestMatch(text, currentRole)
      const botMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.content,
        action: response.action,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 550)
  }

  // Điều hướng trực tiếp tới trang và đóng hộp thoại
  const handleNavigateTo = (path) => {
    if (!path) return
    navigate(path)
    setIsOpen(false)
  }

  const handleCopy = (id, text) => {
    const cleanText = text.replace(/\*\*/g, "")
    navigator.clipboard.writeText(cleanText)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleLike = (id) => {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Đọc câu trả lời bằng giọng nói qua Web Speech API
  const handleSpeak = (text) => {
    if (!window.speechSynthesis) return
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const cleanText = text.replace(/[*#_`]/g, "")
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = "vi-VN"
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    setIsSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  // Tải file text lịch sử trò chuyện
  const handleExportChat = () => {
    const content = messages
      .map((m) => `[${m.time}] ${m.role === "user" ? "Bạn" : "EduTech AI"}:\n${m.content}\n`)
      .join("\n----------------------------------------\n\n")

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `edutech-chat-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans select-none">
      {/* ================= KHUNG CỬA SỔ CHAT AI ================= */}
      {isOpen && (
        <div
          className={`mb-3.5 bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_25px_70px_-15px_rgba(234,88,12,0.3),0_0_0_1px_rgba(249,115,22,0.12)] flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded
              ? "w-[92vw] sm:w-[560px] h-[84vh]"
              : "w-[370px] sm:w-[440px] h-[620px] max-h-[85vh]"
          }`}
        >
          {/* HEADER CHAT */}
          <div className="px-5 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center space-x-3.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-inner">
                  <Bot className="w-5 h-5 text-white drop-shadow-sm" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight text-white">EduTech Copilot</h3>
                  <span className="text-[9px] uppercase font-bold tracking-wider bg-white/25 px-1.5 py-0.5 rounded-md backdrop-blur-sm border border-white/20 text-orange-50">
                    {currentRole}
                  </span>
                </div>
                <p className="text-[11px] text-orange-100/90 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  Sẵn sàng giải đáp & điều hướng
                </p>
              </div>
            </div>

            {/* Các nút hành động Header */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleExportChat}
                title="Tải lịch sử chat"
                className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() =>
                  setMessages([
                    {
                      id: Date.now(),
                      role: "assistant",
                      content: "Hội thoại đã được đặt lại. Bạn muốn mình hướng dẫn đến tính năng nào?",
                      time: "Vừa xong"
                    }
                  ])
                }
                title="Làm mới hội thoại"
                className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:block p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition"
                title={isExpanded ? "Thu nhỏ" : "Phóng to"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition"
                title="Đóng chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* VÙNG DANH SÁCH TIN NHẮN */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-orange-50/20 via-slate-50/50 to-white">
            {messages.map((m) => {
              const isBot = m.role === "assistant"
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 items-start ${isBot ? "justify-start" : "justify-end"}`}
                >
                  {isBot && (
                    <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/15 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-2 ${isBot ? "" : "flex flex-col items-end"}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-[13px] shadow-sm transition-all ${
                        isBot
                          ? "bg-white text-slate-800 border border-slate-100 rounded-tl-sm shadow-slate-200/40"
                          : "bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tr-sm shadow-orange-500/20"
                      }`}
                    >
                      <FormattedMessage text={m.content} isBot={isBot} />

                      {/* NÚT ĐIỀU HƯỚNG TRỰC TIẾP */}
                      {isBot && m.action && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={() => handleNavigateTo(m.action.path)}
                            className="group flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                          >
                            <span>{m.action.label}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </button>
                          <span className="text-[10px] text-slate-400 font-medium">Bấm để mở trang</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Nút hành động */}
                    <div className="flex items-center gap-2 px-1 text-[10px] text-slate-400 font-medium">
                      <span>{m.time}</span>
                      {isBot && (
                        <>
                          <span>•</span>
                          <button
                            onClick={() => handleCopy(m.id, m.content)}
                            className="hover:text-slate-700 transition flex items-center gap-1"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedId === m.id ? "Đã chép" : "Sao chép"}</span>
                          </button>

                          <span>•</span>
                          <button
                            onClick={() => handleSpeak(m.content)}
                            className="hover:text-slate-700 transition flex items-center gap-1"
                            title="Nghe đọc nội dung"
                          >
                            {isSpeaking ? (
                              <VolumeX className="w-3 h-3 text-orange-500 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3 h-3" />
                            )}
                            <span>{isSpeaking ? "Dừng đọc" : "Nghe"}</span>
                          </button>

                          <span>•</span>
                          <button
                            onClick={() => toggleLike(m.id)}
                            className={`hover:text-orange-500 transition flex items-center gap-1 ${
                              likedIds.includes(m.id) ? "text-orange-500 font-semibold" : ""
                            }`}
                          >
                            <ThumbsUp className={`w-3 h-3 ${likedIds.includes(m.id) ? "fill-orange-500" : ""}`} />
                            <span>Hữu ích</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {!isBot && (
                    <div className="w-8 h-8 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-sm mt-0.5 font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              )
            })}

            {/* HIỆU ỨNG TYPING KHI CHỜ TRẢ LỜI */}
            {isTyping && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center space-x-1.5 shadow-sm">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* GỢI Ý NHANH THEO VAI TRÒ (QUICK CHIPS) */}
          <div className="px-4 py-2 bg-white/90 backdrop-blur border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.text)}
                className="group flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-xs text-slate-600 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-slate-200/80 rounded-xl transition duration-150 active:scale-95 shrink-0"
              >
                <span className="text-orange-500 group-hover:scale-110 transition-transform">{q.icon}</span>
                <span className="font-medium">{q.text}</span>
              </button>
            ))}
          </div>

          {/* KHUNG NHẬP NỘI DUNG */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="p-3.5 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi AI hoặc gõ trang cần đến..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition placeholder:text-slate-400 text-slate-800"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 bg-gradient-to-tr from-orange-500 via-orange-600 to-amber-500 disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95 text-white rounded-2xl flex items-center justify-center transition shadow-md shadow-orange-500/25 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ================= NÚT TRIGGER NỔI (FLOATING BUTTON) ================= */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center gap-2.5 px-4 h-13 py-3 rounded-full shadow-[0_12px_32px_rgba(234,88,12,0.35)] transition-all duration-300 active:scale-95 focus:outline-none ring-4 ring-orange-500/10 ${
          isOpen
            ? "bg-slate-800 text-white hover:bg-slate-900"
            : "bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white hover:shadow-[0_16px_36px_rgba(234,88,12,0.45)] hover:scale-105"
        }`}
      >
        {isOpen ? (
          <>
            <X className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
            <span className="text-xs font-semibold tracking-wide pr-1">Thu gọn</span>
          </>
        ) : (
          <>
            <div className="relative">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-200" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-white"></span>
              </span>
            </div>
            <span className="text-xs font-bold tracking-wide pr-0.5">EduTech AI</span>
          </>
        )}
      </button>
    </div>
  )
}