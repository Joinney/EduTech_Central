/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react"
import { 
  Calendar as CalendarIcon, 
  X, 
  Minimize2, 
  Clock,
  ClipboardList,
  GraduationCap,
  Sparkles,
  HelpCircle,
  FileCheck
} from "lucide-react"
import { quizApi } from "../api/quiz.api"

export default function LichHocWidget({ courses = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("assessments") // "assessments" (Tab 1: Bài tập & Thi) | "schedule" (Tab 2: Lịch học)

  // Danh sách đề thi MongoDB của toàn bộ môn học
  const [mongoExams, setMongoExams] = useState([])

  // Map lưu sự kiện cho 2 Tab riêng biệt
  const [assessmentEventsMap, setAssessmentEventsMap] = useState({})
  const [scheduleEventsMap, setScheduleEventsMap] = useState({})

  // Lấy ngày/tháng/năm hiện tại
  const today = new Date()
  const currentDayNumber = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const [selectedDayNumber, setSelectedDayNumber] = useState(currentDayNumber)

  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay()
  const prefixBlanksCount = firstDayIndex === 0 ? 6 : firstDayIndex - 1

  const daysArray = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1)
  const blanksArray = Array.from({ length: prefixBlanksCount }, (_, i) => i)

  // Lấy ID user để quản lý cờ mở lần đầu cho từng tài khoản
  const currentUserId = useMemo(() => {
    try {
      const stored = localStorage.getItem("user")
      if (!stored) return "guest"
      const parsed = JSON.parse(stored)
      return parsed.id_users || parsed.id || parsed.user_id || "guest"
    } catch {
      return "guest"
    }
  }, [])

  // 1. Tự động mở Lịch dạng phóng to khi vào trang lần đầu trong phiên đăng nhập
  useEffect(() => {
    const storageKey = `hasSeenAutoCalendar_${currentUserId}`
    const hasSeenAutoCalendar = sessionStorage.getItem(storageKey)
    if (!hasSeenAutoCalendar) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        sessionStorage.setItem(storageKey, "true")
      }, 700)
      return () => clearTimeout(timer)
    }
  }, [currentUserId])

  // 2. Kéo toàn bộ đề thi trắc nghiệm & tự luận của các khóa học
  useEffect(() => {
    const fetchAllQuizzes = async () => {
      if (!courses || courses.length === 0) return
      try {
        const promises = courses.map(async (c) => {
          const exams = await quizApi.getExamsByCourse(c.id).catch(() => [])
          return exams.map((e) => ({
            ...e,
            courseTitle: c.title,
            courseCode: c.code
          }))
        })
        const results = await Promise.all(promises)
        setMongoExams(results.flat())
      } catch (err) {
        console.error("Lỗi khi tải đề thi vào widget:", err)
      }
    }
    fetchAllQuizzes()
  }, [courses])

  // 3. Bóc tách dữ liệu sự kiện thành 2 luồng riêng biệt
  useEffect(() => {
    const assessMapped = {}
    const schedMapped = {}

    const addEvent = (mapObj, day, eventItem) => {
      if (day >= 1 && day <= daysInCurrentMonth) {
        if (!mapObj[day]) mapObj[day] = []
        mapObj[day].push(eventItem)
      }
    }

    courses.forEach((course) => {
      // ================= TAB 2: THỜI KHÓA BIỂU TIẾT HỌC =================
      const scheduleText = (course.schedule || "").toLowerCase()
      const timeSlot =
        course.schedule?.split("•")[1]?.trim() ||
        course.schedule?.split("(")[1]?.replace(")", "")?.trim() ||
        "07:30 - 09:45"

      for (let day = 1; day <= daysInCurrentMonth; day++) {
        const dateObj = new Date(currentYear, currentMonth, day)
        const dayOfWeekIndex = dateObj.getDay()

        let isMatchDay = false
        if (dayOfWeekIndex === 1 && (scheduleText.includes("thứ 2") || scheduleText.includes("t2"))) isMatchDay = true
        if (dayOfWeekIndex === 2 && (scheduleText.includes("thứ 3") || scheduleText.includes("t3"))) isMatchDay = true
        if (dayOfWeekIndex === 3 && (scheduleText.includes("thứ 4") || scheduleText.includes("t4"))) isMatchDay = true
        if (dayOfWeekIndex === 4 && (scheduleText.includes("thứ 5") || scheduleText.includes("t5"))) isMatchDay = true
        if (dayOfWeekIndex === 5 && (scheduleText.includes("thứ 6") || scheduleText.includes("t6"))) isMatchDay = true
        if (dayOfWeekIndex === 6 && (scheduleText.includes("thứ 7") || scheduleText.includes("t7"))) isMatchDay = true
        if (dayOfWeekIndex === 0 && (scheduleText.includes("chủ nhật") || scheduleText.includes("cn"))) isMatchDay = true

        if (isMatchDay) {
          addEvent(schedMapped, day, {
            type: "live",
            title: `Tiết học: ${course.title}`,
            time: timeSlot,
            color: "blue"
          })
        }
      }

      // ================= TAB 1: BÀI TẬP VỀ NHÀ =================
      ;(course.assignments || []).forEach((a, idx) => {
        let targetDay = (currentDayNumber + idx * 3 + 2) % daysInCurrentMonth || 15
        const rawDateStr = a.dueDate || a.due_date
        if (rawDateStr) {
          const parsed = new Date(rawDateStr)
          if (!isNaN(parsed.getDate()) && parsed.getMonth() === currentMonth) {
            targetDay = parsed.getDate()
          } else {
            const matchDay = rawDateStr.match(/(\d{1,2})[\/\-](\d{1,2})/)
            if (matchDay && matchDay[1]) targetDay = parseInt(matchDay[1], 10)
          }
        }
        addEvent(assessMapped, targetDay, {
          type: "due",
          title: `Hạn nộp: ${a.title} (${course.title})`,
          time: rawDateStr ? (rawDateStr.includes("T") ? rawDateStr.split("T")[1]?.slice(0, 5) : "23:59") : "23:59",
          color: "rose"
        })
      })

      // Bài học mở mới
      ;(course.lessons || []).slice(0, 1).forEach((l, idx) => {
        const targetDay = (currentDayNumber + idx * 5 + 1) % daysInCurrentMonth || 10
        addEvent(assessMapped, targetDay, {
          type: "open",
          title: `Mở bài học: ${l.title} (${course.title})`,
          time: "08:00",
          color: "emerald"
        })
      })
    })

    // ================= TAB 1: ĐỀ THI & BÀI KIỂM TRA MỚI =================
    mongoExams.forEach((q, idx) => {
      let targetDay = (currentDayNumber + idx * 4 + 3) % daysInCurrentMonth || 20
      const dateStr = q.start_time || q.duration || q.end_time || q.dueDate
      if (dateStr) {
        const parsed = new Date(dateStr)
        if (!isNaN(parsed.getDate()) && parsed.getMonth() === currentMonth) {
          targetDay = parsed.getDate()
        }
      }

      addEvent(assessMapped, targetDay, {
        type: "quiz",
        title: `Đề thi: ${q.title} (${q.courseTitle || "Khóa học"})`,
        time: `${q.duration_mins || 15} phút`,
        color: "purple"
      })
    })

    if (Object.keys(assessMapped).length === 0) {
      addEvent(assessMapped, currentDayNumber, {
        type: "open",
        title: "Bắt đầu học kỳ & Cập nhật học liệu mới",
        time: "08:00",
        color: "emerald"
      })
    }

    setAssessmentEventsMap(assessMapped)
    setScheduleEventsMap(schedMapped)
  }, [courses, mongoExams, daysInCurrentMonth, currentMonth, currentYear, currentDayNumber])

  const currentActiveEventsMap = activeTab === "assessments" ? assessmentEventsMap : scheduleEventsMap
  const selectedDayEvents = currentActiveEventsMap[selectedDayNumber] || []
  const totalAssessmentEvents = Object.values(assessmentEventsMap).reduce((acc, curr) => acc + curr.length, 0)
  const totalScheduleEvents = Object.values(scheduleEventsMap).reduce((acc, curr) => acc + curr.length, 0)

  return (
    <>
      {/* Nút Cuốn Lịch Nổi */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => {
            setActiveTab("assessments")
            setIsOpen(true)
          }}
          className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-xl shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all cursor-pointer"
          title="Xem Kế Hoạch Học Tập & Lịch Biểu"
        >
          <CalendarIcon className="w-6 h-6 animate-bounce" />

          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white font-black text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            {totalAssessmentEvents || 1}
          </span>

          <span className="absolute left-16 px-3 py-1.5 bg-slate-900/90 text-white text-xs font-bold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
            📅 Kế hoạch bài tập & Lịch học
          </span>
        </button>
      </div>

      {/* Modal Lịch Phóng To */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp">
            
            {/* Header Lịch */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-4 text-white shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/10 backdrop-blur-xs rounded-2xl">
                    <CalendarIcon className="w-5 h-5 text-blue-200" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                      <span>Lịch Biểu & Kế Hoạch Học Tập</span>
                      <span className="text-[10px] px-2.5 py-0.5 bg-white/20 rounded-full font-bold">
                        Tháng {currentMonth + 1}/{currentYear}
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold text-white flex items-center space-x-1 transition cursor-pointer"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Thu Nhỏ</span>
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/20 rounded-xl transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Điều hướng 2 Tab */}
              <div className="flex items-center bg-black/20 p-1 rounded-2xl w-full sm:w-fit gap-1">
                <button
                  onClick={() => {
                    setActiveTab("assessments")
                    setSelectedDayNumber(currentDayNumber)
                  }}
                  className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === "assessments"
                      ? "bg-white text-blue-700 shadow-md"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Hạn Nộp & Khảo Thí ({totalAssessmentEvents})</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab("schedule")
                    setSelectedDayNumber(currentDayNumber)
                  }}
                  className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === "schedule"
                      ? "bg-white text-indigo-700 shadow-md"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Thời Khóa Biểu Tiết Học ({totalScheduleEvents})</span>
                </button>
              </div>
            </div>

            {/* Thân Lịch */}
            <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Lưới ngày */}
              <div className="lg:col-span-8 space-y-3">
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-400 uppercase tracking-wider pb-1">
                  <span>T2</span>
                  <span>T3</span>
                  <span>T4</span>
                  <span>T5</span>
                  <span>T6</span>
                  <span className="text-blue-600">T7</span>
                  <span className="text-rose-500">CN</span>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {blanksArray.map((_, idx) => (
                    <div key={`blank-${idx}`} className="h-16 bg-slate-50/50 rounded-xl border border-dashed border-slate-100" />
                  ))}

                  {daysArray.map((day) => {
                    const events = currentActiveEventsMap[day] || []
                    const isSelected = selectedDayNumber === day
                    const isToday = day === currentDayNumber

                    return (
                      <div
                        key={`day-${day}`}
                        onClick={() => setSelectedDayNumber(day)}
                        className={`h-16 p-1 rounded-xl border flex flex-col justify-between transition-all cursor-pointer text-left relative group ${
                          isToday
                            ? "bg-gradient-to-b from-amber-50 to-orange-50/40 border-amber-400 ring-2 ring-amber-400/40 shadow-xs"
                            : isSelected
                            ? "bg-blue-50/90 border-blue-500 shadow-xs ring-2 ring-blue-400/20"
                            : events.length > 0
                            ? "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                            : "bg-slate-50/40 border-slate-100 hover:bg-slate-100/60 text-slate-400"
                        }`}
                      >
                        <div className="flex justify-between items-center px-1">
                          <span
                            className={`text-xs font-black rounded-md flex items-center gap-1 ${
                              isToday
                                ? "text-amber-700 font-black"
                                : isSelected
                                ? "text-blue-600 font-extrabold"
                                : "text-slate-700"
                            }`}
                          >
                            {day}
                            {isToday && (
                              <span className="px-1 py-0.2 bg-amber-500 text-white text-[8px] font-black uppercase rounded shadow-2xs animate-pulse">
                                Nay
                              </span>
                            )}
                          </span>

                          {events.length > 0 && (
                            <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "assessments" ? "bg-rose-500" : "bg-blue-600"} animate-ping`} />
                          )}
                        </div>

                        {/* Thẻ rút gọn trong ô ngày */}
                        <div className="space-y-0.5 overflow-hidden">
                          {events.slice(0, 2).map((ev, idx) => (
                            <div
                              key={idx}
                              className={`text-[8px] font-bold px-1 py-0.5 rounded truncate leading-tight ${
                                ev.color === "emerald"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : ev.color === "rose"
                                  ? "bg-rose-100 text-rose-800"
                                  : ev.color === "purple"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {ev.type === "open" && "🟢 Mở bài"}
                              {ev.type === "due" && "🔴 Hạn nộp"}
                              {ev.type === "quiz" && "📝 Đề thi"}
                              {ev.type === "live" && "📹 Tiết học"}
                            </div>
                          ))}
                          {events.length > 2 && (
                            <span className="text-[7px] font-bold text-slate-400 block px-1">
                              +{events.length - 2} mục khác
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Chi tiết sự kiện bên phải */}
              <div className="lg:col-span-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {activeTab === "assessments" ? "Kế hoạch bài tập & Khảo thí" : "Thời khóa biểu chi tiết"}
                      </span>
                      <h4 className="font-black text-sm text-slate-900 mt-0.5 flex items-center gap-1.5">
                        <span>Ngày {selectedDayNumber} Thg {currentMonth + 1}, {currentYear}</span>
                        {selectedDayNumber === currentDayNumber && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                            Hôm nay
                          </span>
                        )}
                      </h4>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                      {selectedDayEvents.length} Mục
                    </span>
                  </div>

                  {selectedDayEvents.length > 0 ? (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto">
                      {selectedDayEvents.map((ev, i) => (
                        <div
                          key={i}
                          className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                ev.color === "emerald"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : ev.color === "rose"
                                  ? "bg-rose-100 text-rose-700"
                                  : ev.color === "purple"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {ev.type === "open" ? "Bắt đầu mở" : ev.type === "due" ? "Hạn chót nộp" : ev.type === "quiz" ? "Bài thi khảo thí" : "Tiết học"}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {ev.time}
                            </span>
                          </div>
                          <h5 className="font-bold text-xs text-slate-900 leading-snug">{ev.title}</h5>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200 text-xs">
                      {activeTab === "assessments" 
                        ? "Không có bài tập hay đề thi nào trong ngày này." 
                        : "Không có tiết học nào được xếp lịch vào ngày này."}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <span>Thu Gọn Lại Góc Trái</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}