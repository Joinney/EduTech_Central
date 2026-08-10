import React, { useState } from "react"
import { 
  Calendar as CalendarIcon, 
  Video, 
  Clock, 
  Building2, 
  Users, 
  Plus, 
  ExternalLink, 
  Radio, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  BookOpen
} from "lucide-react"

// Mẫu dữ liệu thời khóa biểu tuần
const initialSchedule = [
  {
    id: 1,
    dayOfWeek: "Thứ Hai",
    dateStr: "2026-08-10",
    time: "07:30 - 09:10",
    courseName: "Toán Học Lớp 12A1",
    schoolName: "THPT Chuyên Lê Hồng Phong",
    room: "Phòng 302 / Meet",
    type: "school", // school | external
    meetUrl: "https://meet.google.com/abc-defg-hij",
    status: "completed", // completed | live | upcoming
    note: "Ôn tập chuyên đề Khảo sát hàm số"
  },
  {
    id: 2,
    dayOfWeek: "Thứ Hai",
    dateStr: "2026-08-10",
    time: "19:30 - 21:30",
    courseName: "Lập trình ReactJS Thực Chiến K15",
    schoolName: "Trung tâm EduTech Online",
    room: "Google Meet",
    type: "external",
    meetUrl: "https://meet.google.com/xyz-uvwx-rst",
    status: "live",
    note: "Thực hành React Hooks & Custom Hooks"
  },
  {
    id: 3,
    dayOfWeek: "Thứ Tư",
    dateStr: "2026-08-12",
    time: "07:30 - 09:10",
    courseName: "Toán Học Lớp 12A1",
    schoolName: "THPT Chuyên Lê Hồng Phong",
    room: "Phòng 302",
    type: "school",
    meetUrl: "https://meet.google.com/abc-defg-hij",
    status: "upcoming",
    note: "Phương trình Mũ & Logarit"
  },
  {
    id: 4,
    dayOfWeek: "Thứ Sáu",
    dateStr: "2026-08-14",
    time: "19:30 - 21:30",
    courseName: "Lập trình ReactJS Thực Chiến K15",
    schoolName: "Trung tâm EduTech Online",
    room: "Google Meet",
    type: "external",
    meetUrl: "https://meet.google.com/xyz-uvwx-rst",
    status: "upcoming",
    note: "Kiểm tra giữa kỳ trắc nghiệm 30 phút"
  }
]

const DAYS_OF_WEEK = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"]

export default function Schedule() {
  const [schedules, setSchedules] = useState(initialSchedule)
  const [selectedDay, setSelectedDay] = useState("all") // "all" | "Thứ Hai" ...
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form State Tạo buổi dạy Live / Meet mới
  const [formData, setFormData] = useState({
    courseName: "",
    schoolName: "",
    dayOfWeek: "Thứ Hai",
    time: "19:30 - 21:00",
    meetUrl: "",
    note: ""
  })

  // Lọc lịch dạy theo ngày đã chọn
  const filteredSchedules = schedules.filter(item => {
    if (selectedDay === "all") return true
    return item.dayOfWeek === selectedDay
  })

  // Thêm Ca dạy Live mới
  const handleCreateSchedule = (e) => {
    e.preventDefault()
    if (!formData.courseName || !formData.meetUrl) return

    const newSchedule = {
      id: Date.now(),
      dayOfWeek: formData.dayOfWeek,
      dateStr: "2026-08-15",
      time: formData.time,
      courseName: formData.courseName,
      schoolName: formData.schoolName || "Lớp Học Trực Tuyến",
      room: "Google Meet / Zoom",
      type: "external",
      meetUrl: formData.meetUrl,
      status: "upcoming",
      note: formData.note || "Buổi học trực tuyến"
    }

    setSchedules([...schedules, newSchedule])
    setIsModalOpen(false)
    setFormData({ courseName: "", schoolName: "", dayOfWeek: "Thứ Hai", time: "19:30 - 21:00", meetUrl: "", note: "" })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* 1. HEADER KHU VỰC */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Lịch Dạy & Phòng Học Live (Meet)
            <span className="px-2.5 py-0.5 text-xs font-bold bg-orange-100 text-orange-600 rounded-full">
              {schedules.length} Ca dạy
            </span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Theo dõi lịch giảng dạy tuần, tạo phòng Meet và tham gia ca dạy trực tuyến nhanh chóng.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20 transition-all cursor-pointer active:scale-95"
        >
          <Video className="w-4 h-4 animate-pulse" />
          <span>Tạo Ca Dạy Live / Meet</span>
        </button>
      </div>

      {/* 2. CA DẠY DẠNG "LIVE" NỔI BẬT NẾU ĐANG DIỄN RA */}
      {schedules.some(s => s.status === "live") && (
        <div className="p-5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 rounded-3xl text-white shadow-lg shadow-rose-500/15 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-lg flex items-center gap-1.5 border border-white/30">
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-300" />
              Đang Diễn Ra Live
            </span>
            <span className="text-xs font-bold text-rose-100">Khung giờ: 19:30 - 21:30</span>
          </div>

          {schedules.filter(s => s.status === "live").map(liveItem => (
            <div key={liveItem.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <h3 className="text-lg font-black">{liveItem.courseName}</h3>
                <p className="text-xs text-rose-100 font-medium mt-0.5">{liveItem.schoolName} • Ghi chú: {liveItem.note}</p>
              </div>

              <a
                href={liveItem.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-white text-rose-600 font-black text-xs rounded-xl shadow-md hover:bg-rose-50 transition-all cursor-pointer shrink-0"
              >
                <span>Vào Phòng Meet Ngay</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* 3. BỘ LỌC THEO THỨ TRONG TUẦN */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setSelectedDay("all")}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            selectedDay === "all"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Tất cả các ngày
        </button>

        {DAYS_OF_WEEK.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedDay === day
                ? "bg-orange-500 text-white shadow-sm shadow-orange-500/20"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* 4. DANH SÁCH TỜ LỊCH DẠY (LIST / CARDS) */}
      {filteredSchedules.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
          Không có ca dạy nào trong thời gian này.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSchedules.map(item => (
            <div 
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md ${
                item.status === "live" 
                  ? "bg-amber-50/40 border-amber-300" 
                  : item.status === "completed"
                    ? "bg-slate-50/80 border-slate-200 opacity-75"
                    : "bg-white border-slate-200/80"
              }`}
            >
              {/* Cột Trái: Thời gian & Môn học */}
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex flex-col items-center justify-center shrink-0 border border-orange-100">
                  <CalendarIcon className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-orange-600">{item.dayOfWeek}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {item.time}
                    </span>

                    {/* Badge trạng thái */}
                    {item.status === "live" && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black uppercase rounded-md">Live</span>
                    )}
                    {item.status === "completed" && (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded-md">Đã xong</span>
                    )}
                    {item.status === "upcoming" && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md">Sắp tới</span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{item.courseName}</h3>

                  <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {item.schoolName}
                    </span>
                    <span>•</span>
                    <span>Phòng: {item.room}</span>
                  </div>
                </div>
              </div>

              {/* Cột Phải: Nút Vào Meet & Ghi chú */}
              <div className="flex items-center justify-between md:justify-end space-x-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-slate-400 block font-medium">Nội dung / Ghi chú:</span>
                  <span className="text-xs font-semibold text-slate-700 line-clamp-1">{item.note}</span>
                </div>

                <a
                  href={item.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm ${
                    item.status === "live"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-orange-50 hover:bg-orange-100 text-orange-600"
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Mở Meet</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. MODAL TẠO CA DẠY LIVE / MEET */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border overflow-hidden relative max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <h3 className="font-extrabold text-sm">Tạo Lịch Dạy & Phòng Meet Mới</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSchedule} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
              <div>
                <label className="font-bold text-slate-700 uppercase">Tên Lớp / Môn Học *</label>
                <input
                  type="text"
                  required
                  value={formData.courseName}
                  onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                  placeholder="VD: Toán Lớp 12A1 / Lập trình ReactJS..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase">Trường / Đơn vị giảng dạy</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="VD: THPT Chuyên Lê Hồng Phong..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase">Thứ trong tuần *</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase">Khung giờ dạy *</label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="VD: 19:30 - 21:30"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase">Đường dẫn Google Meet / Zoom URL *</label>
                <input
                  type="url"
                  required
                  value={formData.meetUrl}
                  onChange={(e) => setFormData({ ...formData, meetUrl: e.target.value })}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase">Ghi chú nội dung buổi dạy</label>
                <textarea
                  rows="2"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Nội dung bài học hoặc tài liệu học viên cần chuẩn bị..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold cursor-pointer shadow-md shadow-orange-500/20"
                >
                  Lưu Ca Dạy
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}