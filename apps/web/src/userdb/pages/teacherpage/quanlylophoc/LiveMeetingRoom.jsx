/* eslint-disable react/prop-types */
import React, { useMemo, useState, useEffect, useRef } from "react"
import { ArrowLeft, Copy, Check, ExternalLink } from "lucide-react"
import { courseService } from "../../../../api/course.api" // 👈 ĐÃ IMPORT API

export default function LiveMeetingRoom({ course, meetInfo, onLeave }) {
  const [isCopied, setIsCopied] = useState(false)
  const jitsiContainerRef = useRef(null)
  const apiRef = useRef(null)
  const attendanceLogIdRef = useRef(null) // 👈 Lưu log_id điểm danh

  // 🎲 1. Sinh mã phòng họp ngẫu nhiên (VD: m7n-7xfg-erg)
  const randomMeetCode = useMemo(() => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
    const generateSegment = (len) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    
    return `${generateSegment(3)}-${generateSegment(4)}-${generateSegment(3)}`
  }, [])

  // 🚀 2. Tự động đổi URL trên thanh trình duyệt
  useEffect(() => {
    const originalUrl = window.location.pathname
    const cleanCode = (course?.code || "meeting").replace(/[^a-zA-Z0-9]/g, "")
    const roomPath = `/teacher/courses/EduTech/${cleanCode}/live-room/${randomMeetCode}`

    window.history.pushState({ inMeeting: true }, "", roomPath)

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
    "Học viên"

  const userEmail = currentUser?.email || "user@edutech.com"

  // 🖼️ Lấy Avatar thật của user
  const userAvatar = useMemo(() => {
    const rawAvatar =
      currentUser?.avatar_url ||
      currentUser?.avatar ||
      currentUser?.avatarUrl ||
      currentUser?.picture ||
      currentUser?.photoURL

    if (rawAvatar && rawAvatar.trim() !== "") {
      return rawAvatar
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0284c7&color=ffffff&bold=true&rounded=true&size=256`
  }, [currentUser, displayName])

  // 4. Tạo roomKey duy nhất cho lớp học
  const roomKey = useMemo(() => {
    const rawCode = (course?.code || "room").replace(/[^a-zA-Z0-9]/g, "").toLowerCase()
    const courseId = course?.id || "live"
    return `edutech_room_${rawCode}_id${courseId}`
  }, [course])

  const publicShareLink = `https://meet.jit.si/${roomKey}`

  // 🚀 5. TỰ ĐỘNG ĐIỂM DANH LIVE MEET (JOIN & LEAVE)
  useEffect(() => {
    if (course?.id && currentUser?.id) {
      courseService.recordJoinAttendance({
        course_id: Number(course.id),
        student_id: Number(currentUser.id),
        student_name: displayName,
        room_name: roomKey,
      }).then((res) => {
        if (res?.log_id) {
          attendanceLogIdRef.current = res.log_id
        }
      }).catch((err) => console.error("Lỗi ghi nhận điểm danh vào phòng:", err))
    }

    // Khi rời phòng -> Ghi nhận giờ ra & thời lượng
    return () => {
      if (attendanceLogIdRef.current) {
        courseService.recordLeaveAttendance(attendanceLogIdRef.current)
          .catch((err) => console.error("Lỗi ghi nhận rời phòng:", err))
      }
    }
  }, [course?.id, currentUser?.id, displayName, roomKey])

  // 🚀 6. KHỞI TẠO JITSI & ÉP ĐỒNG BỘ AVATAR 2 CHIỀU
  useEffect(() => {
    const loadJitsiScript = () => {
      return new Promise((resolve) => {
        if (window.JitsiMeetExternalAPI) {
          resolve(window.JitsiMeetExternalAPI)
          return
        }
        const script = document.createElement("script")
        script.src = "https://meet.jit.si/external_api.js"
        script.async = true
        script.onload = () => resolve(window.JitsiMeetExternalAPI)
        document.body.appendChild(script)
      })
    }

    let isMounted = true

    loadJitsiScript().then((JitsiMeetExternalAPI) => {
      if (!isMounted || !jitsiContainerRef.current) return

      jitsiContainerRef.current.innerHTML = ""

      const options = {
        roomName: roomKey,
        width: "100%",
        height: "100%",
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: displayName,
          email: userEmail,
          avatarUrl: userAvatar,
        },
        configOverwrite: {
          prejoinPageEnabled: false,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          defaultLanguage: "vi",
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        },
      }

      const api = new JitsiMeetExternalAPI("meet.jit.si", options)
      apiRef.current = api

      const applyAvatar = () => {
        if (userAvatar) {
          api.executeCommand("avatarUrl", userAvatar)
        }
      }

      api.addEventListener("videoConferenceJoined", () => {
        applyAvatar()
        setTimeout(applyAvatar, 1000)
        setTimeout(applyAvatar, 3000)
      })

      api.addEventListener("participantJoined", () => {
        applyAvatar()
      })
    })

    return () => {
      isMounted = false
      if (apiRef.current) {
        apiRef.current.dispose()
        apiRef.current = null
      }
    }
  }, [roomKey, displayName, userEmail, userAvatar])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicShareLink)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleLeaveRoom = () => {
    if (attendanceLogIdRef.current) {
      courseService.recordLeaveAttendance(attendanceLogIdRef.current).catch(() => {})
    }
    onLeave()
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-fadeIn">
      {/* Header điều hướng */}
      <header className="h-14 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
        
        {/* Nút Rời phòng & Tên lớp */}
        <div className="flex items-center space-x-3 truncate">
          <button
            type="button"
            onClick={handleLeaveRoom}
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

        {/* Tiện ích Copy & Avatar người dùng */}
        <div className="flex items-center space-x-2.5 text-xs">
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

          {/* Hiển thị Avatar & Tên tài khoản */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <img
              src={userAvatar}
              alt={displayName}
              className="w-7 h-7 rounded-full object-cover border border-slate-700 shadow-sm"
            />
            <span className="hidden lg:inline text-xs font-bold text-white max-w-[120px] truncate">
              {displayName}
            </span>
          </div>
        </div>
      </header>

      {/* Frame nhúng Jitsi */}
      <main className="flex-1 w-full h-full bg-slate-950 relative">
        <div ref={jitsiContainerRef} className="w-full h-full" />
      </main>
    </div>
  )
}