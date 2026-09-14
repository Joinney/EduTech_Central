/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useRef } from "react"
import { 
  Play, 
  ThumbsUp, 
  Bookmark, 
  Share2, 
  Plus, 
  X, 
  UploadCloud, 
  Loader2, 
  Eye, 
  Calendar, 
  Trophy, 
  Video as VideoIcon, 
  Clock, 
  CheckCircle2, 
  Link as LinkIcon,
  FileVideo,
  MessageSquare,
  Send,
  GraduationCap,
  ShieldCheck
} from "lucide-react"

export default function Videos() {
  const role = localStorage.getItem("role")?.toLowerCase() || "student"
  const isTeacher = role === "teacher" || role === "instructor"
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
  const currentUserId = storedUser.id || storedUser.userId || storedUser._id || 1
  
  const currentUserAvatar = storedUser.avatar || storedUser.avatar_url || ""
  const rawCurrentUserName = storedUser.fullName || storedUser.full_name || storedUser.name || (isTeacher ? "Giảng viên EduTech" : "Học viên EduTech")

  const formatNameWithRole = (name, userRole) => {
    if (!name || !name.trim()) return userRole === "teacher" ? "GV. Giảng viên" : "HV. Học viên"
    const trimmed = name.trim()

    if (/^(gv\.|gv\s|giảng viên\s)/i.test(trimmed)) {
      return trimmed.replace(/^(gv\.|gv\s|giảng viên\s+)/i, "GV. ")
    }
    if (/^(hv\.|hv\s|học viên\s|sinh viên\s|sv\.)/i.test(trimmed)) {
      return trimmed.replace(/^(hv\.|hv\s|học viên\s+|sinh viên\s+|sv\.)/i, "HV. ")
    }

    if (userRole === "teacher" || userRole === "instructor") {
      return `GV. ${trimmed}`
    }
    return `HV. ${trimmed}`
  }

  const currentUserName = formatNameWithRole(rawCurrentUserName, role)

  const [videos, setVideos] = useState([])
  const [currentVideo, setCurrentVideo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [toastMsg, setToastMsg] = useState("")

  const [likedMap, setLikedMap] = useState({})
  const [bookmarkedMap, setBookmarkedMap] = useState({})

  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadMode, setUploadMode] = useState("file")
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({ 
    title: "", 
    subject: "Toán Học", 
    description: "", 
    videoUrl: "",
    duration: "" 
  })
  const [selectedFile, setSelectedFile] = useState(null)

  const baseUrl = import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1"

  const triggerToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(""), 3000)
  }

  const fetchVideos = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${baseUrl}/videos?all=true`)
      if (res.ok) {
        const json = await res.json()
        const data = json.data || []
        const displayList = isTeacher 
          ? data 
          : data.filter(v => v.is_approved === true)

        setVideos(displayList)
        if (displayList.length > 0 && !currentVideo) {
          setCurrentVideo(displayList[0])
        }
      }
    } catch (err) {
      console.error("Lỗi lấy video:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserInteractions = async () => {
    if (!currentUserId) return
    try {
      const res = await fetch(`${baseUrl}/videos/user-interactions?user_id=${currentUserId}`)
      if (res.ok) {
        const json = await res.json()
        const likes = {}
        const bookmarks = {}
        ;(json.likes || []).forEach(id => { likes[id] = true })
        ;(json.bookmarks || []).forEach(id => { bookmarks[id] = true })
        setLikedMap(likes)
        setBookmarkedMap(bookmarks)
      }
    } catch (err) {
      console.warn("Lỗi đọc tương tác user:", err)
    }
  }

  const fetchComments = async (videoId) => {
    if (!videoId) return
    try {
      const res = await fetch(`${baseUrl}/videos/${videoId}/comments`)
      if (res.ok) {
        const json = await res.json()
        setComments(json.data || [])
      }
    } catch (err) {
      console.warn("Lỗi tải bình luận:", err)
    }
  }

  const viewedVideosRef = useRef(new Set())
  const recordView = async (videoId) => {
    if (!videoId || viewedVideosRef.current.has(videoId)) return
    viewedVideosRef.current.add(videoId)
    try {
      await fetch(`${baseUrl}/videos/${videoId}/view`, { method: "POST" })
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, views: (v.views || 0) + 1 } : v))
      if (currentVideo?.id === videoId) {
        setCurrentVideo(prev => ({ ...prev, views: (prev.views || 0) + 1 }))
      }
    } catch (err) {
      console.warn("Lỗi tăng view:", err)
    }
  }

  useEffect(() => {
    fetchVideos()
    fetchUserInteractions()
  }, [])

  useEffect(() => {
    if (currentVideo?.id) {
      fetchComments(currentVideo.id)
      recordView(currentVideo.id)
    }
  }, [currentVideo?.id])

  const handleLike = async (vidId) => {
    try {
      const res = await fetch(`${baseUrl}/videos/${vidId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId })
      })
      if (res.ok) {
        const data = await res.json()
        setLikedMap(prev => ({ ...prev, [vidId]: data.liked }))
        if (currentVideo && currentVideo.id === vidId) {
          setCurrentVideo(prev => ({ ...prev, likes: data.likes }))
        }
        setVideos(prev => prev.map(v => v.id === vidId ? { ...v, likes: data.likes } : v))
        triggerToast(data.liked ? "❤️ Đã thích bài giảng" : "Đã bỏ thích bài giảng")
      }
    } catch (err) {
      triggerToast("Lỗi kết nối khi like video!")
    }
  }

  const handleBookmark = async (vidId) => {
    try {
      const res = await fetch(`${baseUrl}/videos/${vidId}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUserId })
      })
      if (res.ok) {
        const data = await res.json()
        setBookmarkedMap(prev => ({ ...prev, [vidId]: data.bookmarked }))
        triggerToast(data.bookmarked ? "📌 Đã lưu vào bài giảng yêu thích" : "Đã gỡ bài giảng khỏi danh sách lưu")
      }
    } catch (err) {
      triggerToast("Lỗi kết nối khi lưu video!")
    }
  }

  const handleSendComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !currentVideo?.id) return

    setIsSubmittingComment(true)
    try {
      const res = await fetch(`${baseUrl}/videos/${currentVideo.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUserId,
          user_name: currentUserName,
          user_avatar: currentUserAvatar,
          content: newComment.trim()
        })
      })

      if (res.ok) {
        const data = await res.json()
        setComments(prev => [data.data, ...prev])
        setNewComment("")
        triggerToast("💬 Đã đăng bình luận thành công!")
      } else {
        triggerToast("Không thể gửi bình luận, vui lòng thử lại!")
      }
    } catch (err) {
      triggerToast("Lỗi mạng khi đăng bình luận!")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const renderUserAvatar = (avatarUrl, name, isGV = false) => {
    const cleanName = (name || "").replace(/^(gv\.|hv\.)\s*/i, "").trim()
    const firstLetter = cleanName.charAt(0).toUpperCase() || "U"

    if (avatarUrl && avatarUrl.startsWith("http")) {
      return (
        <img
          src={avatarUrl}
          alt={cleanName}
          className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs"
          onError={(e) => {
            e.target.onerror = null
            e.target.style.display = "none"
            if (e.target.nextSibling) e.target.nextSibling.style.display = "flex"
          }}
        />
      )
    }

    return (
      <div
        className={`w-7 h-7 rounded-full font-black text-[11px] flex items-center justify-center shrink-0 border shadow-2xs ${
          isGV 
            ? "bg-orange-100 text-orange-700 border-orange-200" 
            : "bg-blue-100 text-blue-700 border-blue-200"
        }`}
      >
        {firstLetter}
      </div>
    )
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setSelectedFile(file)

    const videoEl = document.createElement("video")
    videoEl.preload = "metadata"
    videoEl.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoEl.src)
      const sec = Math.floor(videoEl.duration)
      const m = Math.floor(sec / 60)
      const s = sec % 60
      const formatted = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      setFormData(prev => ({ ...prev, duration: formatted }))
    }
    videoEl.src = URL.createObjectURL(file)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (uploadMode === "file" && !selectedFile) {
      triggerToast("Vui lòng chọn một tệp video!")
      return
    }
    if (uploadMode === "link" && !formData.videoUrl.trim()) {
      triggerToast("Vui lòng nhập đường liên kết video!")
      return
    }

    setUploading(true)
    const teacherName = formatNameWithRole(rawCurrentUserName, "teacher")

    const payload = new FormData()
    if (uploadMode === "file" && selectedFile) {
      payload.append("file", selectedFile)
    }
    if (uploadMode === "link") {
      payload.append("video_url", formData.videoUrl.trim())
    }
    payload.append("title", formData.title.trim())
    payload.append("subject", formData.subject)
    payload.append("description", formData.description.trim())
    payload.append("duration", formData.duration || "Tự do")
    payload.append("teacher_id", String(currentUserId))
    payload.append("teacher_name", teacherName)

    try {
      const res = await fetch(`${baseUrl}/videos`, {
        method: "POST",
        body: payload
      })
      const resJson = await res.json().catch(() => ({}))
      if (res.ok) {
        triggerToast("🎉 Đăng video thành công! Video đang chờ Admin duyệt.")
        setShowUploadModal(false)
        setFormData({ title: "", subject: "Toán Học", description: "", videoUrl: "", duration: "" })
        setSelectedFile(null)
        fetchVideos()
      } else {
        triggerToast(resJson.error || `Lỗi ${res.status}: Không thể xử lý!`)
      }
    } catch (err) {
      triggerToast("Lỗi mạng khi tải lên video!")
    } finally {
      setUploading(false)
    }
  }

  const filteredVideos = useMemo(() => {
    if (selectedSubject === "all") return videos
    return videos.filter(v => (v.subject || "").toLowerCase() === selectedSubject.toLowerCase())
  }, [videos, selectedSubject])

  const topInstructors = useMemo(() => {
    const stats = {}

    videos.forEach((v) => {
      // Dùng ID làm khóa gom nhóm chính để tránh bị trùng tên do ký tự/dấu cách
      const teacherKey = v.teacher_id ? String(v.teacher_id) : (v.teacher_name || "default")
      const displayName = formatNameWithRole(v.teacher_name, "teacher")

      if (!stats[teacherKey]) {
        stats[teacherKey] = {
          id: teacherKey,
          name: displayName,
          count: 0,
          totalViews: 0,
        }
      }

      stats[teacherKey].count += 1
      stats[teacherKey].totalViews += (v.views || 0)
    })

    return Object.values(stats)
      .sort((a, b) => b.count - a.count || b.totalViews - a.totalViews)
      .slice(0, 4)
  }, [videos])

  const renderPlayer = (vid) => {
    if (!vid?.video_url) return null
    const isYouTube = vid.video_url.includes("youtube.com") || vid.video_url.includes("youtu.be")
    if (isYouTube) {
      let embedUrl = vid.video_url
      if (vid.video_url.includes("watch?v=")) {
        embedUrl = vid.video_url.replace("watch?v=", "embed/")
      } else if (vid.video_url.includes("youtu.be/")) {
        embedUrl = vid.video_url.replace("youtu.be/", "www.youtube.com/embed/")
      }
      return (
        <iframe
          src={embedUrl}
          title={vid.title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    }
    return (
      <video 
        key={vid.id}
        src={vid.video_url} 
        controls 
        autoPlay={false}
        poster={vid.thumbnail_url || ""}
        className="w-full h-full object-cover"
      />
    )
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/70 px-3 py-1.5 md:px-5 space-y-2.5 font-sans select-none text-slate-800">
      
      {/* Toast thông báo */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-orange-500/30 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP BAR: Rút gọn khoảng cách thừa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-white px-4 py-2 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.2 rounded-full bg-orange-100 text-orange-700 font-extrabold text-[9px] uppercase tracking-wider">
              EduTech Video Portal
            </span>
            <span className="text-[11px] text-slate-400">• {videos.length} bài giảng</span>
          </div>
          <h1 className="text-sm md:text-base font-black text-slate-900">
            Kho Video Bài Giảng Chuyên Đề
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-bold border border-slate-200/60">
            {["all", "Toán Học", "Tin Học", "Vật Lý", "Tiếng Anh"].map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
                  selectedSubject === sub 
                    ? "bg-orange-500 text-white shadow-2xs" 
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {sub === "all" ? "Tất cả" : sub}
              </button>
            ))}
          </div>

          {isTeacher && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-xs shadow-orange-500/25 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Đăng Video</span>
            </button>
          )}
        </div>
      </div>

      {/* BỐ CỤC 3 CỘT CHUẨN: 5 - 3 - 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        
        {/* ======================================================== */}
        {/* CỘT 1: THÔNG TIN VIDEO HIỆN TẠI + PLAYLIST + BẢNG XẾP HẠNG (5 CỘT) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* 🎯 ĐƯA PHẦN TIÊU ĐỀ & CHI TIẾT VIDEO LÊN ĐẦU CỘT 1 */}
          {currentVideo && (
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-orange-50 text-orange-600 border border-orange-200 text-[9px] font-black px-2 py-0.2 rounded uppercase">
                      {currentVideo.subject || "Chuyên Đề"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {currentVideo.duration || "Tự do"}
                    </span>
                  </div>
                  <h2 className="text-sm font-black text-slate-900 leading-snug">
                    {currentVideo.title}
                  </h2>
                </div>

                {/* Các nút tương tác: Like, Lưu, Chia sẻ */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button 
                    onClick={() => handleLike(currentVideo.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                      likedMap[currentVideo.id]
                        ? "bg-orange-50 border-orange-300 text-orange-600 ring-1 ring-orange-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                    title="Thích video"
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${likedMap[currentVideo.id] ? "fill-orange-500 text-orange-500" : ""}`} />
                    <span>{currentVideo.likes || 0}</span>
                  </button>

                  <button 
                    onClick={() => handleBookmark(currentVideo.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                      bookmarkedMap[currentVideo.id]
                        ? "bg-amber-50 border-amber-300 text-amber-600 ring-1 ring-amber-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                    title="Lưu bài học"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${bookmarkedMap[currentVideo.id] ? "fill-amber-500 text-amber-500" : ""}`} />
                    <span>{bookmarkedMap[currentVideo.id] ? "Đã lưu" : "Lưu"}</span>
                  </button>

                  <button 
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href)
                      triggerToast("Đã sao chép liên kết")
                    }}
                    className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl transition cursor-pointer"
                    title="Chia sẻ"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {currentVideo.description || "Chưa có mô tả chi tiết cho bài giảng này."}
              </p>

              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black flex items-center justify-center text-[10px]">
                    {formatNameWithRole(currentVideo.teacher_name, "teacher").replace(/^GV\.\s*/, "").charAt(0) || "G"}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                      <span>{formatNameWithRole(currentVideo.teacher_name, "teacher")}</span>
                      <span className="text-[8px] font-black uppercase px-1 py-0.2 bg-orange-100 text-orange-700 rounded">
                        GV
                      </span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-400 text-[10px]">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-500" />
                    {currentVideo.views || 0} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {new Date(currentVideo.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* DANH SÁCH PHÁT */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <h3 className="font-extrabold text-[11px] text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <VideoIcon className="w-3.5 h-3.5 text-orange-500" />
                <span>Danh sách phát ({filteredVideos.length})</span>
              </h3>
              <span className="text-[9px] text-orange-600 font-bold bg-orange-50 px-1.5 py-0.5 rounded">
                #{currentVideo?.id || 1}
              </span>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {filteredVideos.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Chưa có bài giảng nào.
                </div>
              ) : (
                filteredVideos.map((vid) => {
                  const isPlaying = currentVideo?.id === vid.id
                  return (
                    <div
                      key={vid.id}
                      onClick={() => setCurrentVideo(vid)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                        isPlaying 
                          ? "bg-orange-50/90 border-orange-300 ring-1 ring-orange-400/40" 
                          : "bg-slate-50/60 hover:bg-slate-100 border-slate-200/70"
                      }`}
                    >
                      <div className="relative w-12 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                        <img 
                          src={vid.thumbnail_url || "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&q=80"} 
                          alt={vid.title} 
                          className="w-full h-full object-cover opacity-75"
                        />
                        {isPlaying ? (
                          <div className="absolute inset-0 bg-orange-600/70 flex items-center justify-center">
                            <Play className="w-3.5 h-3.5 text-white fill-white animate-pulse" />
                          </div>
                        ) : (
                          <span className="absolute bottom-0.5 right-0.5 bg-black/75 text-[8px] text-white px-1 rounded font-mono">
                            {vid.duration || "Tự do"}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs font-bold truncate leading-tight ${isPlaying ? "text-orange-600 font-black" : "text-slate-800"}`}>
                          {vid.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{formatNameWithRole(vid.teacher_name, "teacher")}</p>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5">
                          <span className="px-1.5 py-0.2 bg-slate-200/70 rounded text-[9px] font-semibold">{vid.subject}</span>
                          <span>•</span>
                          <span>{vid.views || 0} views</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* GIẢNG VIÊN TIÊU BIỂU */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="font-extrabold text-[11px] text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Giảng viên tiêu biểu</span>
              </h3>
            </div>

            <div className="space-y-1.5">
              {topInstructors.length === 0 ? (
                <p className="text-[10px] text-slate-400 text-center py-1">Đang cập nhật...</p>
              ) : (
                topInstructors.map((ins, index) => (
                  <div key={ins.name} className="flex items-center justify-between p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                        index === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"
                      }`}>
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 truncate">{ins.name}</h5>
                        <span className="text-[9px] text-slate-400">{ins.totalViews} views</span>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.2 rounded bg-orange-100 text-orange-700 text-[9px] font-extrabold shrink-0">
                      {ins.count} video
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* CỘT 2: KHUNG VIDEO DỌC TIKTOK (3 CỘT - GỌN GÀNG, KHÔNG THỪA) */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 flex justify-center">
          <div className="bg-slate-950 p-1.5 rounded-2xl shadow-xl border border-slate-800 inline-block">
            <div className="relative w-[270px] h-[480px] rounded-xl overflow-hidden bg-black flex items-center justify-center">
              {isLoading ? (
                <div className="flex flex-col items-center gap-2 text-orange-400">
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <span className="text-xs font-bold text-slate-400">Đang tải video...</span>
                </div>
              ) : currentVideo ? (
                renderPlayer(currentVideo)
              ) : (
                <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                  <VideoIcon className="w-8 h-8 text-slate-600" />
                  <span>Chưa có video</span>
                </div>
              )}

              {currentVideo && isTeacher && (
                <div className="absolute top-2 left-2 z-10">
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                    currentVideo.is_approved 
                      ? "bg-emerald-500/90 text-white backdrop-blur-md" 
                      : "bg-amber-500/90 text-white backdrop-blur-md"
                  }`}>
                    {currentVideo.is_approved ? "Đã duyệt" : "Chờ duyệt"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CỘT 3: THẢO LUẬN & BÌNH LUẬN (4 CỘT - CAO 492PX KHỚP KHUNG VIDEO) */}
        {/* ======================================================== */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col h-[492px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                <span>Thảo luận ({comments.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400">Hỏi đáp bài học</span>
            </div>

            {/* Danh sách bình luận */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-1 py-2">
              {comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
                  <MessageSquare className="w-6 h-6 text-slate-300 mb-1" />
                  <span>Chưa có thảo luận nào. Hãy gửi bình luận đầu tiên!</span>
                </div>
              ) : (
                comments.map((cmt) => {
                  const isCmtTeacher = /^(gv\.|giảng viên)/i.test(cmt.user_name)
                  const formattedCmtName = formatNameWithRole(cmt.user_name, isCmtTeacher ? "teacher" : "student")

                  return (
                    <div key={cmt.id} className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 flex gap-2 items-start">
                      {renderUserAvatar(cmt.user_avatar, formattedCmtName, isCmtTeacher)}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            <span className="font-black text-[11px] text-slate-900 truncate max-w-[120px]">{formattedCmtName}</span>
                            <span className={`text-[8px] font-black uppercase px-1 py-0.2 rounded ${
                              isCmtTeacher ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {isCmtTeacher ? "GV" : "HV"}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-400">
                            {new Date(cmt.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-relaxed break-words font-medium">{cmt.content}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Ô nhập bình luận cố định dưới chân */}
            <form onSubmit={handleSendComment} className="pt-2 border-t border-slate-100 flex gap-2 items-start">
              <div className="shrink-0 pt-0.5">
                {renderUserAvatar(currentUserAvatar, currentUserName, isTeacher)}
              </div>
              <div className="flex-1 relative">
                <textarea
                  rows="2"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Gửi câu hỏi hoặc ý kiến..."
                  className="w-full p-2 pr-9 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition resize-none font-medium"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="absolute right-2 bottom-2 p-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-lg transition cursor-pointer shadow-xs"
                  title="Gửi bình luận"
                >
                  {isSubmittingComment ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>

      {/* MODAL UPLOAD */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-orange-50/50">
              <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm">
                <UploadCloud className="w-5 h-5 text-orange-600" />
                Đăng Video Bài Giảng Lên Hệ Thống
              </h3>
              <button 
                onClick={() => setShowUploadModal(false)} 
                className="text-slate-400 hover:text-red-500 transition cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề bài giảng *</label>
                <input 
                  type="text" 
                  required
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                  placeholder="Ví dụ: Bài 4 - Kỹ thuật tích phân từng phần"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Môn học *</label>
                <select 
                  value={formData.subject} 
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:border-orange-500 outline-none bg-white font-medium"
                >
                  <option>Toán Học</option>
                  <option>Tin Học</option>
                  <option>Vật Lý</option>
                  <option>Hóa Học</option>
                  <option>Tiếng Anh</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Hình thức cung cấp Video *</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setUploadMode("file")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                      uploadMode === "file" 
                        ? "bg-white text-orange-600 shadow-xs" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <FileVideo className="w-4 h-4" />
                    <span>Tải tệp tin (File)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadMode("link")}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                      uploadMode === "link" 
                        ? "bg-white text-orange-600 shadow-xs" 
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>Dán liên kết (URL)</span>
                  </button>
                </div>
              </div>

              {uploadMode === "file" ? (
                <div className="space-y-1.5">
                  <input 
                    type="file" 
                    accept="video/mp4,video/webm,video/*" 
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                  />
                  {formData.duration && (
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Thời lượng nhận diện tự động: {formData.duration}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <input 
                    type="url" 
                    placeholder="Dán link video MP4 trực tiếp hoặc link YouTube/Drive..."
                    value={formData.videoUrl}
                    onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả tóm tắt nội dung</label>
                <textarea 
                  rows="3"
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none resize-none transition"
                  placeholder="Ghi chú kiến thức trọng tâm trong bài giảng..."
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl flex justify-center items-center gap-2 transition shadow-xs shadow-orange-500/25 disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  <span>{uploading ? "Đang xử lý tải lên..." : "Hoàn tất & Gửi duyệt"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}