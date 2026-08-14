/* eslint-disable react/prop-types */
import React, { useMemo, useState, useEffect } from "react"
import { ArrowLeft, ShieldCheck, Copy, Check, ExternalLink } from "lucide-react"

export default function LiveMeetingRoom({ course, meetInfo, onLeave }) {
  const [isCopied, setIsCopied] = useState(false)

  // 🎲 1. Sinh mã phòng họp ngẫu nhiên dạng chuẩn (VD: x89-qtwp-3mn)
  const randomMeetCode = useMemo(() => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    const generateSegment = (len) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    
    return `${generateSegment(3)}-${generateSegment(4)}-${generateSegment(3)}`
  }, [])

  // 🚀 2. TỰ ĐỘNG ĐỔI ĐƯỜNG DẪN URL TRÊN THANH TRÌNH DUYỆT (Kèm mã ngẫu nhiên)
  useEffect(() => {
    const originalUrl = window.location.pathname
    const cleanCode = (course?.code || "meeting").replace(/[^a-zA-Z0-9]/g, "")
    const roomPath = `/teacher/courses/EduTech/${cleanCode}/${randomMeetCode}`

    // Đổi URL trên thanh địa chỉ thành đường dẫn chi tiết của phòng
    window.history.pushState({ inMeeting: true }, "", roomPath)

    // Khi rời phòng (component unmount) -> Trả lại URL ban đầu
    return () => {
      window.history.pushState(null, "", originalUrl)
    }
  }, [course?.code, randomMeetCode])

  // 3. Lấy thông tin user hiện tại từ LocalStorage
  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("user")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }, [])

  const displayName =
    currentUser?.displayName ||
    currentUser?.fullName ||
    currentUser?.name ||
    currentUser?.username ||
    currentUser?.email?.split("@")[0] ||
    "Thành viên lớp học"

  // 4. Tạo tên phòng cố định cho Jitsi theo ID & Code lớp học
  const roomKey = useMemo(() => {
    const rawCode = (course?.code || "room").replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
    const courseId = course?.id || "live"
    return `edutech_room_${rawCode}_id${courseId}`
  }, [course])

  const publicShareLink = `https://meet.jit.si/${roomKey}`

  // 5. Cấu hình nhúng Iframe Jitsi Meet
  const jitsiRoomUrl = useMemo(() => {
    const params = [
      `userInfo.displayName="${encodeURIComponent(displayName)}"`,
      `config.prejoinPageEnabled=false`, // Vào thẳng phòng, bỏ qua chờ
      `config.defaultLanguage="vi"`,      // Giao diện Tiếng Việt
      `config.startWithAudioMuted=false`,
      `config.startWithVideoMuted=false`
    ].join("&")

    return `https://meet.jit.si/${roomKey}#${params}`
  }, [roomKey, displayName])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicShareLink)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-fadeIn">
      {/* Header điều hướng */}
      <header className="h-14 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
        
        {/* Nút Rời phòng & Tên lớp */}
        <div className="flex items-center space-x-3 truncate">
          <button
            type="button"
            onClick={onLeave}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Rời phòng & Quay lại</span>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center space-x-2 truncate">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <h2 className="text-xs sm:text-sm font-black text-white truncate">
              {meetInfo?.title || course?.title || "Phòng học trực tuyến"}
            </h2>
            <span className="hidden md:inline px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 text-orange-400 font-mono text-[10px] font-bold rounded-md">
              {course?.code}
            </span>
          </div>
        </div>

        {/* Tiện ích Copy & Tên tài khoản */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
              isCopied
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
            }`}
            title="Sao chép link phòng học"
          >
            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isCopied ? "Đã chép link!" : "Copy Link Phòng"}</span>
          </button>

          <a
            href={publicShareLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-colors"
            title="Mở trong tab trình duyệt mới"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span><strong className="text-white">{displayName}</strong></span>
          </div>
        </div>
      </header>

      {/* Frame nhúng Jitsi */}
      <main className="flex-1 w-full h-full bg-slate-950 relative">
        <iframe
          src={jitsiRoomUrl}
          title="Phòng Học Trực Tuyến Live Meet"
          allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
          className="w-full h-full border-0"
        />
      </main>
    </div>
  )
}