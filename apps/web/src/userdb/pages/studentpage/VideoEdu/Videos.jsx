/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react"
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
  Flame, 
  Video as VideoIcon, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Link as LinkIcon,
  FileVideo
} from "lucide-react"

export default function Videos() {
  const role = localStorage.getItem("role")?.toLowerCase() || "student"
  const isTeacher = role === "teacher" || role === "instructor"
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  const [videos, setVideos] = useState([])
  const [currentVideo, setCurrentVideo] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [toastMsg, setToastMsg] = useState("")

  // Tương tác cá nhân
  const [likedMap, setLikedMap] = useState({})
  const [bookmarkedMap, setBookmarkedMap] = useState({})

  // Modal tải video dành cho Giảng viên
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadMode, setUploadMode] = useState("file") // "file" | "link"
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

  // 1. Nạp danh sách Video
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
      console.error("Lỗi lấy danh sách video:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  // 2. Tự động đọc thời lượng khi chọn file video
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

  // 3. Lọc video theo môn học
  const filteredVideos = useMemo(() => {
    if (selectedSubject === "all") return videos
    return videos.filter(v => (v.subject || "").toLowerCase() === selectedSubject.toLowerCase())
  }, [videos, selectedSubject])

  // 4. Bảng xếp hạng giảng viên
  const topInstructors = useMemo(() => {
    const stats = {}
    videos.forEach(v => {
      const name = v.teacher_name || "Giảng viên EduTech"
      if (!stats[name]) {
        stats[name] = { name, count: 0, totalViews: 0 }
      }
      stats[name].count += 1
      stats[name].totalViews += (v.views || 0)
    })
    return Object.values(stats)
      .sort((a, b) => b.count - a.count || b.totalViews - a.totalViews)
      .slice(0, 4)
  }, [videos])

  // 5. Video mới nhất
  const recentVideos = useMemo(() => {
    return [...videos]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  }, [videos])

  // 6. Xử lý upload video
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

    // Trích xuất thông tin người dùng từ localStorage an toàn
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
    const teacherId = storedUser.id || storedUser.userId || storedUser._id || user?.id || 1
    const teacherName =
      storedUser.fullName ||
      storedUser.full_name ||
      storedUser.name ||
      user?.fullName ||
      user?.full_name ||
      "Giảng viên EduTech"

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
    payload.append("teacher_id", String(teacherId))
    payload.append("teacher_name", teacherName)

    try {
      const res = await fetch(`${baseUrl}/videos`, {
        method: "POST",
        body: payload
      })

      const resJson = await res.json().catch(() => ({}))

      if (res.ok) {
        triggerToast("🎉 Đăng video thành công! Video đang chờ Admin phê duyệt.")
        setShowUploadModal(false)
        setFormData({ title: "", subject: "Toán Học", description: "", videoUrl: "", duration: "" })
        setSelectedFile(null)
        fetchVideos()
      } else {
        // In trực tiếp thông báo lỗi từ backend Go để biết chính xác nguyên nhân
        triggerToast(resJson.error || `Lỗi ${res.status}: Không thể xử lý yêu cầu đăng video!`)
      }
    } catch (err) {
      console.error("Lỗi upload:", err)
      triggerToast("Lỗi mạng khi tải lên video!")
    } finally {
      setUploading(false)
    }
  }

  // Helper render video (hỗ trợ cả YouTube Embed lẫn file video gốc)
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
        poster={vid.thumbnail_url || "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&q=80"}
        className="w-full h-full object-contain"
      />
    )
  }

  return (
    <div className="w-full min-h-screen bg-slate-50/70 p-4 md:p-6 space-y-6 font-sans select-none text-slate-800">
      
      {/* Toast thông báo */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-orange-500/30 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER: Filter & Nút đăng */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-extrabold text-[10px] uppercase tracking-wider">
              EduTech Video Portal
            </span>
            <span className="text-xs text-slate-400">• Tổng cộng {videos.length} bài giảng</span>
          </div>
          <h1 className="text-xl font-black text-slate-900">
            Kho Video Bài Giảng & Chuyên Đề Trực Tuyến
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200/60">
            {["all", "Toán Học", "Tin Học", "Vật Lý", "Tiếng Anh"].map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs ${
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
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-xs shadow-orange-500/25 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng Video Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CỘT TRÁI: Player & Nội dung */}
        <div className="lg:col-span-8 space-y-5">
          <div className="relative aspect-video rounded-3xl bg-slate-950 overflow-hidden shadow-xl border border-slate-800 flex items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2 text-orange-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs font-bold text-slate-400">Đang tải luồng phát...</span>
              </div>
            ) : currentVideo ? (
              renderPlayer(currentVideo)
            ) : (
              <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                <VideoIcon className="w-10 h-10 text-slate-600" />
                <span>Chưa có bài giảng nào trong mục này</span>
              </div>
            )}

            {currentVideo && isTeacher && (
              <div className="absolute top-3 left-3 z-10">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  currentVideo.is_approved 
                    ? "bg-emerald-500/90 text-white backdrop-blur-md" 
                    : "bg-amber-500/90 text-white backdrop-blur-md"
                }`}>
                  {currentVideo.is_approved ? "Đã kiểm duyệt" : "Chờ Admin phê duyệt"}
                </span>
              </div>
            )}
          </div>

          {currentVideo && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-50 text-orange-600 border border-orange-200 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
                      {currentVideo.subject || "Chuyên Đề"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {currentVideo.duration || "Tự do"}
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 leading-snug">
                    {currentVideo.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => {
                      const isLiked = likedMap[currentVideo.id]
                      setLikedMap(prev => ({ ...prev, [currentVideo.id]: !isLiked }))
                      setCurrentVideo(prev => ({
                        ...prev,
                        likes: isLiked ? Math.max(0, (prev.likes || 0) - 1) : (prev.likes || 0) + 1
                      }))
                      triggerToast(isLiked ? "Đã bỏ thích" : "Đã thích bài giảng")
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      likedMap[currentVideo.id]
                        ? "bg-orange-50 border-orange-300 text-orange-600"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${likedMap[currentVideo.id] ? "fill-orange-500 text-orange-500" : ""}`} />
                    <span>{currentVideo.likes || 0}</span>
                  </button>

                  <button 
                    onClick={() => {
                      setBookmarkedMap(prev => ({ ...prev, [currentVideo.id]: !prev[currentVideo.id] }))
                      triggerToast(bookmarkedMap[currentVideo.id] ? "Đã bỏ lưu" : "Đã lưu vào bộ sưu tập")
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      bookmarkedMap[currentVideo.id]
                        ? "bg-amber-50 border-amber-300 text-amber-600"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${bookmarkedMap[currentVideo.id] ? "fill-amber-500 text-amber-500" : ""}`} />
                    <span className="hidden sm:inline">Lưu</span>
                  </button>

                  <button 
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href)
                      triggerToast("Đã sao chép liên kết vào bộ nhớ tạm")
                    }}
                    className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl transition cursor-pointer"
                    title="Chia sẻ"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                {currentVideo.description || "Chưa có mô tả chi tiết cho bài giảng này."}
              </p>

              <div className="pt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-700 font-black flex items-center justify-center border border-orange-200">
                    {currentVideo.teacher_name?.charAt(0) || "G"}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900">{currentVideo.teacher_name || "Giảng viên"}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">Tác giả bài giảng</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-400 text-[11px] font-semibold">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    {currentVideo.views || 0} lượt xem
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(currentVideo.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CỘT PHẢI: Playlist & Xếp hạng */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <VideoIcon className="w-4 h-4 text-orange-500" />
                <span>Danh sách phát ({filteredVideos.length})</span>
              </h3>
              <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-md">
                #{currentVideo?.id || 1}
              </span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredVideos.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  Chưa có bài giảng nào.
                </div>
              ) : (
                filteredVideos.map((vid) => {
                  const isPlaying = currentVideo?.id === vid.id
                  return (
                    <div
                      key={vid.id}
                      onClick={() => setCurrentVideo(vid)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isPlaying 
                          ? "bg-orange-50/80 border-orange-300 ring-1 ring-orange-400/40" 
                          : "bg-slate-50/50 hover:bg-slate-100 border-slate-200/80"
                      }`}
                    >
                      <div className="relative w-20 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                        <img 
                          src={vid.thumbnail_url || "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&q=80"} 
                          alt={vid.title} 
                          className="w-full h-full object-cover opacity-75"
                        />
                        {isPlaying ? (
                          <div className="absolute inset-0 bg-orange-600/60 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-white animate-pulse" />
                          </div>
                        ) : (
                          <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-white px-1 rounded font-mono">
                            {vid.duration || "Tự do"}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs font-bold truncate leading-tight ${isPlaying ? "text-orange-600 font-black" : "text-slate-800"}`}>
                          {vid.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span>{vid.teacher_name || "EduTech"}</span>
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

          {/* Top Giảng viên */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Giảng viên tiêu biểu</span>
              </h3>
            </div>

            <div className="space-y-2">
              {topInstructors.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">Đang cập nhật...</p>
              ) : (
                topInstructors.map((ins, index) => (
                  <div key={ins.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        index === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-700"
                      }`}>
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 truncate">{ins.name}</h5>
                        <span className="text-[10px] text-slate-400">{ins.totalViews} lượt xem</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-extrabold shrink-0">
                      {ins.count} video
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL TẢI VIDEO ĐƯỢC TỐI ƯU */}
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

              {/* Tùy chọn nguồn Video: Tải file hoặc Dán liên kết */}
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

              {/* Nhập File */}
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
                /* Nhập URL */
                <div>
                  <input 
                    type="url" 
                    placeholder="Dán link video MP4 trực tiếp hoặc link YouTube/Drive..."
                    value={formData.videoUrl}
                    onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    * Hỗ trợ URL video Cloudinary, máy chủ riêng hoặc video YouTube
                  </p>
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