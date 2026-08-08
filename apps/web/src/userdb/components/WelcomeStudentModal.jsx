import React, { useState, useEffect, useRef } from "react"
import { 
  Sparkles, 
  GraduationCap, 
  School, 
  BookOpen, 
  Loader2, 
  Search,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Rocket,
  Target,
  Compass,
  Check,
  Code2,
  Atom,
  Globe,
  Palette,
  BrainCircuit,
  Building2,
  Award,
  ShieldCheck,
  ChevronRight,
  X,
  Sparkle,
  SkipForward
} from "lucide-react"

const API_AUTH_URL = import.meta.env.VITE_API_AUTH_URL || "http://localhost:8001/api/v1"

const educationLevels = [
  { id: "primary", name: "Tiểu học", icon: Sparkle, badge: "Cấp 1" },
  { id: "secondary", name: "THCS", icon: School, badge: "Cấp 2" },
  { id: "high_school", name: "THPT", icon: GraduationCap, badge: "Cấp 3" },
  { id: "university", name: "Đại học", icon: Building2, badge: "ĐH / CĐ" }
]

const gradesByLevel = {
  primary: ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5"],
  secondary: ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"],
  high_school: ["Lớp 10", "Lớp 11", "Lớp 12"],
  university: ["Năm 1", "Năm 2", "Năm 3", "Năm 4", "Năm 5+", "Đã tốt nghiệp"]
}

const interestOptions = [
  { 
    id: "tech", 
    label: "Lập trình & CNTT", 
    desc: "Coding, AI, Web, Mobile App & Data Science",
    icon: Code2, 
    activeBorder: "border-orange-500 bg-orange-50/60 text-slate-900 ring-2 ring-orange-500/20",
    iconBg: "bg-orange-500 text-white"
  },
  { 
    id: "science", 
    label: "Toán & Khoa học", 
    desc: "Toán, Lý, Hóa, Sinh & Tư duy logic",
    icon: Atom, 
    activeBorder: "border-blue-600 bg-blue-50/60 text-slate-900 ring-2 ring-blue-600/20",
    iconBg: "bg-blue-600 text-white"
  },
  { 
    id: "language", 
    label: "Ngoại ngữ & Tiếng Anh", 
    desc: "IELTS, TOEIC, Giao tiếp & Ngôn ngữ",
    icon: Globe, 
    activeBorder: "border-orange-500 bg-orange-50/60 text-slate-900 ring-2 ring-orange-500/20",
    iconBg: "bg-orange-500 text-white"
  },
  { 
    id: "art", 
    label: "Nghệ thuật & Xã hội", 
    desc: "Văn học, Lịch sử, Thiết kế & Sáng tạo",
    icon: Palette, 
    activeBorder: "border-blue-600 bg-blue-50/60 text-slate-900 ring-2 ring-blue-600/20",
    iconBg: "bg-blue-600 text-white"
  },
  { 
    id: "softskills", 
    label: "Kỹ năng mềm", 
    desc: "Thuyết trình, Quản lý thời gian & Tư duy",
    icon: BrainCircuit, 
    activeBorder: "border-orange-500 bg-orange-50/60 text-slate-900 ring-2 ring-orange-500/20",
    iconBg: "bg-orange-500 text-white"
  }
]

export default function WelcomeStudentModal({ isOpen, user, onComplete }) {
  const [step, setStep] = useState(1)
  
  const [educationLevel, setEducationLevel] = useState("high_school")
  const [gradeLevel, setGradeLevel] = useState("Lớp 10")
  
  const [schoolSearchQuery, setSchoolSearchQuery] = useState("")
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [schoolList, setSchoolList] = useState([])
  const [loadingSchools, setLoadingSchools] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const [fieldOfInterest, setFieldOfInterest] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const dropdownRef = useRef(null)

  // Cập nhật khối lớp tự động khi đổi Cấp học
  useEffect(() => {
    if (gradesByLevel[educationLevel]) {
      setGradeLevel(gradesByLevel[educationLevel][0])
    }
  }, [educationLevel])

  // Đóng Dropdown danh sách trường khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Tìm kiếm trường học với Debounce & Xử lý An Toàn
  useEffect(() => {
    const getSchoolName = (school) => school?.schoolName || school?.school_name || school?.name
    
    if (!schoolSearchQuery.trim() || getSchoolName(selectedSchool) === schoolSearchQuery) {
      setSchoolList([])
      return
    }

    const timer = setTimeout(async () => {
      setLoadingSchools(true)
      try {
        const res = await fetch(
          `${API_AUTH_URL}/schools/search?query=${encodeURIComponent(schoolSearchQuery)}&level=${educationLevel}`
        )

        // Kiểm tra xem res có phải là JSON hay không trước khi parse .json()
        const contentType = res.headers.get("content-type")
        if (res.ok && contentType && contentType.includes("application/json")) {
          const data = await res.json()
          if (data.success && Array.isArray(data.data)) {
            setSchoolList(data.data)
            setShowDropdown(true)
          }
        } else {
          setSchoolList([])
        }
      } catch (err) {
        console.error("Lỗi kết nối API trường học:", err)
      } finally {
        setLoadingSchools(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [schoolSearchQuery, educationLevel, selectedSchool])

  if (!isOpen) return null

  const handleSelectSchool = (school) => {
    setSelectedSchool(school)
    const name = school.schoolName || school.school_name || school.name || ""
    setSchoolSearchQuery(name)
    setShowDropdown(false)
  }

  const handleClearSchoolInput = () => {
    setSchoolSearchQuery("")
    setSelectedSchool(null)
    setSchoolList([])
  }

  const handleNextStep = () => {
    setErrorMsg("")
    if (step === 2) {
      if (!schoolSearchQuery.trim()) {
        setErrorMsg("Vui lòng nhập hoặc chọn tên trường học!")
        return
      }
    }
    if (step === 3) {
      if (!fieldOfInterest) {
        setErrorMsg("Vui lòng chọn 1 lĩnh vực hoặc bấm 'Bỏ qua'!")
        return
      }
    }
    if (step < 4) setStep(step + 1)
  }

  const handleSkipInterest = () => {
    setErrorMsg("")
    setFieldOfInterest("")
    setStep(4)
  }

  const handlePrevStep = () => {
    setErrorMsg("")
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    try {
      const response = await fetch(`${API_AUTH_URL}/student/onboarding`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify({
          userId: user?.id_users || user?.id,
          educationLevel,
          schoolId: selectedSchool?.id || selectedSchool?.id_school || null,
          schoolName: schoolSearchQuery.trim(),
          gradeLevel,
          fieldOfInterest: fieldOfInterest || "Chưa xác định"
        })
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Lỗi kết nối Server (${response.status})! Vui lòng kiểm tra lại Backend.`)
      }

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Cập nhật hồ sơ thất bại!")
      }

      const updatedUser = { ...user, ...result.data, is_onboarded: true }
      localStorage.setItem("user", JSON.stringify(updatedUser))

      onComplete(updatedUser)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  const stepsHeaderConfig = [
    { id: 1, name: "Chào mừng", subtitle: "Khởi động" },
    { id: 2, name: "Học tập", subtitle: "Trường lớp" },
    { id: 3, name: "Sở thích", subtitle: "Mục tiêu" },
    { id: 4, name: "Xác nhận", subtitle: "Hoàn tất" }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md transition-all">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col">
        
        {/* Glow Effects Nền */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-gradient-to-br from-orange-400/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-gradient-to-tr from-blue-500/20 via-cyan-400/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-orange-500" />

        {/* HEADER VỚI STEPPER PROGRESS */}
        <div className="px-8 pt-6 pb-5 bg-gradient-to-b from-slate-100/90 via-slate-50 to-white border-b border-slate-200/80 shrink-0 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-orange-100 text-orange-600 border border-orange-200 shadow-2xs">
                Bước {step} / 4
              </span>
              <span className="text-sm font-extrabold text-slate-800">
                {stepsHeaderConfig[step - 1].name}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold shadow-2xs">
              <Sparkles className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>EduTech Portal</span>
            </div>
          </div>

          <div className="relative flex items-center justify-between pt-2">
            <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
            
            <div 
              className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-blue-600 to-orange-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />

            {stepsHeaderConfig.map((s) => {
              const isActive = step === s.id
              const isCompleted = step > s.id

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => s.id < step && setStep(s.id)}
                  disabled={s.id > step}
                  className="relative z-10 flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted 
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-100" 
                      : isActive 
                      ? "bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg shadow-blue-600/30 scale-110" 
                      : "bg-white border-2 border-slate-300 text-slate-400"
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.id}
                  </div>
                  <span className={`text-xs font-semibold mt-1.5 transition-colors ${
                    isActive ? "text-blue-600 font-extrabold" : isCompleted ? "text-slate-800" : "text-slate-400"
                  }`}>
                    {s.subtitle}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto flex-1 flex flex-col justify-between relative z-10">
          <div>
            {errorMsg && (
              <div className="p-3.5 mb-5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-600 text-center flex items-center justify-center space-x-2 shadow-2xs">
                <X className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* BƯỚC 1: CHÀO MỪNG */}
            {step === 1 && (
              <div className="space-y-6 py-2 text-center animate-fadeIn">
                <div className="relative inline-flex items-center justify-center pt-2">
                  <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-blue-600/20 transform -rotate-3 hover:rotate-0 transition-transform">
                    <Rocket className="w-12 h-12 animate-bounce" />
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 bg-orange-500 p-2 rounded-2xl text-white shadow-lg ring-4 ring-white">
                    <Sparkles className="w-5 h-5 fill-white" />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Xin chào <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">{user?.fullName || user?.name || "bạn học mới"}</span>! 👋
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-md mx-auto">
                    Chào mừng bạn đến với <strong className="text-slate-800">EduTech Central</strong>! Hãy dành 1 phút hoàn tất thông tin để thiết lập lộ trình học tập tối ưu.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start space-x-3.5 shadow-2xs hover:border-blue-300 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20 mt-0.5">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-800">Lộ trình chuẩn hóa</div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-snug">Hệ thống đề xuất bài giảng phù hợp với từng cấp lớp.</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start space-x-3.5 shadow-2xs hover:border-orange-300 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20 mt-0.5">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-800">Định hướng cá nhân</div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-snug">Giao lưu & chia sẻ kinh nghiệm cùng nhóm bạn cùng đam mê.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BƯỚC 2: THÔNG TIN TRƯỜNG LỚP */}
            {step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h4 className="text-base font-black text-slate-800 flex items-center space-x-2">
                    <div className="p-1.5 rounded-xl bg-blue-100 text-blue-600">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <span>Thông tin trường & cấp học</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 ml-8">Giúp hệ thống đồng bộ đúng chương trình học của bạn.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Cấp học hiện tại <span className="text-orange-500">*</span>
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {educationLevels.map((lvl) => {
                      const Icon = lvl.icon
                      const isSelected = educationLevel === lvl.id
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => setEducationLevel(lvl.id)}
                          className={`p-3 rounded-2xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 scale-[1.02]"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${isSelected ? "bg-white/20 text-white" : "bg-white text-blue-600 shadow-2xs"}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="text-xs font-bold truncate w-full">{lvl.name}</div>
                          <div className={`text-[10px] font-medium ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                            {lvl.badge}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div className="sm:col-span-2 space-y-2 relative" ref={dropdownRef}>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Tên trường học <span className="text-orange-500">*</span>
                    </label>

                    <div className="relative group">
                      <input
                        type="text"
                        value={schoolSearchQuery}
                        onChange={(e) => {
                          setSchoolSearchQuery(e.target.value)
                          setSelectedSchool(null)
                        }}
                        onFocus={() => schoolList.length > 0 && setShowDropdown(true)}
                        placeholder="Gõ tên trường của bạn..."
                        className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      
                      {loadingSchools ? (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin absolute right-3.5 top-3.5" />
                      ) : schoolSearchQuery && (
                        <button 
                          type="button" 
                          onClick={handleClearSchoolInput}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {showDropdown && schoolList.length > 0 && (
                      <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-52 overflow-y-auto divide-y divide-slate-100">
                        {schoolList.map((item) => {
                          const schoolName = item.schoolName || item.school_name || item.name;
                          const provinceName = item.provinceName || item.province_name || item.province;
                          const schoolId = item.id || item.id_school;

                          return (
                            <button
                              key={schoolId || schoolName}
                              type="button"
                              onClick={() => handleSelectSchool(item)}
                              className="w-full text-left p-3 hover:bg-blue-50/70 transition-colors flex items-center justify-between cursor-pointer group"
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600">
                                  <Building2 className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                                    {schoolName}
                                  </div>
                                  {provinceName && (
                                    <div className="text-[10px] text-slate-400 flex items-center mt-0.5">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      <span>{provinceName}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Khối / Lớp
                    </label>
                    <div className="relative">
                      <select
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(e.target.value)}
                        className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer appearance-none shadow-2xs"
                      >
                        {gradesByLevel[educationLevel]?.map((grade) => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BƯỚC 3: LĨNH VỰC QUAN TÂM */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-black text-slate-800 flex items-center space-x-2">
                      <div className="p-1.5 rounded-xl bg-orange-100 text-orange-600">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <span>Lĩnh vực bạn quan tâm nhất</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 ml-8">Lựa chọn 1 chủ đề bạn muốn nâng cao kỹ năng nhất.</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSkipInterest}
                    className="text-xs font-bold text-slate-400 hover:text-orange-500 flex items-center space-x-1 py-1.5 px-3 rounded-xl hover:bg-orange-50 transition-all cursor-pointer shrink-0 border border-transparent hover:border-orange-200"
                  >
                    <span>Bỏ qua</span>
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {interestOptions.map((item) => {
                    const Icon = item.icon
                    const isSelected = fieldOfInterest === item.label

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFieldOfInterest(item.label)}
                        className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex items-start space-x-3.5 ${
                          isSelected
                            ? item.activeBorder + " shadow-md scale-[1.01]"
                            : "bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ${
                          isSelected ? item.iconBg : "bg-white text-slate-600 border border-slate-200"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-extrabold truncate">{item.label}</div>
                          <div className="text-[11px] text-slate-400 leading-tight mt-1 line-clamp-2">{item.desc}</div>
                        </div>

                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all mt-0.5 ${
                          isSelected ? "bg-orange-500 border-orange-500 text-white shadow-2xs" : "border-slate-300 bg-white"
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* BƯỚC 4: XÁC NHẬN HỒ SƠ */}
            {step === 4 && (
              <div className="space-y-5 animate-fadeIn py-1">
                <div className="text-center space-y-1">
                  <div className="inline-flex p-3 rounded-2xl bg-orange-100 text-orange-600 mb-1 shadow-2xs">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900">Xác nhận hồ sơ học sinh</h4>
                  <p className="text-xs text-slate-500">Rà soát lại toàn bộ thông tin trước khi mở khóa tài khoản.</p>
                </div>

                <div className="p-5 bg-slate-50/90 border border-slate-200/90 rounded-2xl space-y-3.5 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/70">
                      <span className="text-xs text-slate-500 font-medium flex items-center">
                        <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                        Cấp học:
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {educationLevels.find(l => l.id === educationLevel)?.name}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/70">
                      <span className="text-xs text-slate-500 font-medium flex items-center">
                        <Award className="w-4 h-4 mr-2 text-orange-500" />
                        Khối / Lớp:
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {gradeLevel}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/70">
                    <span className="text-xs text-slate-500 font-medium flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                      Trường học:
                    </span>
                    <span className="text-xs font-bold text-blue-700 text-right max-w-[280px] truncate">
                      {schoolSearchQuery}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/70">
                    <span className="text-xs text-slate-500 font-medium flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-orange-500" />
                      Lĩnh vực quan tâm:
                    </span>
                    <span className={`text-xs font-bold text-right max-w-[240px] truncate ${
                      fieldOfInterest ? "text-orange-600" : "text-slate-400 italic"
                    }`}>
                      {fieldOfInterest || "Chưa lựa chọn"}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 text-center italic">
                  * Bạn luôn có thể thay đổi các thông tin này sau trong Hồ sơ cá nhân.
                </div>
              </div>
            )}
          </div>

          {/* FOOTER BUTTONS */}
          <div className="pt-6 flex items-center space-x-3 shrink-0 border-t border-slate-100 mt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center justify-center space-x-1.5 py-3.5 px-5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleSkipInterest}
                className="py-3.5 px-5 rounded-2xl border border-dashed border-slate-300 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer active:scale-95 flex items-center space-x-1.5"
              >
                <span>Bỏ qua</span>
                <SkipForward className="w-4 h-4" />
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 flex justify-center items-center space-x-2 py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-600/20 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{step === 1 ? "Khám phá ngay" : "Tiếp tục"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex justify-center items-center space-x-2 py-4 px-6 rounded-2xl shadow-xl shadow-orange-500/25 text-xs font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Hoàn tất & Bắt đầu học ngay</span>
                    <Sparkles className="w-4 h-4 text-amber-200 fill-amber-200" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}