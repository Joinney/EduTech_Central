import React, { useState, useEffect, useRef, useMemo } from "react"
import ReactDOM from "react-dom"
import { 
  Sparkles, 
  Award, 
  Building2, 
  BookOpen, 
  Clock, 
  FileText, 
  Loader2, 
  Search, 
  MapPin, 
  ArrowLeft, 
  ArrowRight, 
  Rocket, 
  Target, 
  Compass, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  ShieldCheck, 
  Sparkle, 
  School, 
  GraduationCap, 
  Plus, 
  X 
} from "lucide-react"

const API_AUTH_URL = import.meta.env.VITE_API_AUTH_URL || "http://localhost:8001/api/v1"

// Các cấp học giảng dạy
const teachingLevels = [
  { id: "primary", name: "Tiểu học", icon: Sparkle, badge: "Cấp 1" },
  { id: "secondary", name: "THCS", icon: School, badge: "Cấp 2" },
  { id: "high_school", name: "THPT", icon: GraduationCap, badge: "Cấp 3" },
  { id: "university", name: "Đại học / CĐ", icon: Building2, badge: "ĐH / CĐ" }
]

// Danh mục môn học tương ứng chính xác theo từng Cấp học
const subjectsByLevel = {
  primary: [
    "Toán (Tiểu học)",
    "Tiếng Việt",
    "Tiếng Anh (Tiểu học)",
    "Tin học & Công nghệ (Tiểu học)",
    "Tự nhiên và Xã hội / Khoa học",
    "Lịch sử và Địa lý (Lớp 4 - 5)",
    "Mỹ thuật",
    "Âm nhạc",
    "Giáo dục thể chất",
    "Hoạt động trải nghiệm"
  ],
  secondary: [
    "Toán học (THCS)",
    "Ngữ văn (THCS)",
    "Tiếng Anh (THCS)",
    "Khoa học Tự nhiên (Lý - Hóa - Sinh tích hợp)",
    "Lịch sử & Địa lý (Tích hợp)",
    "Tin học (Lớp 6 - 9)",
    "Công nghệ",
    "Giáo dục công dân (GDCD)",
    "Giáo dục thể chất",
    "Nghệ thuật (Âm nhạc, Mỹ thuật)",
    "Lập trình thuật toán & HSG Tin trẻ"
  ],
  high_school: [
    "Toán học (THPT)",
    "Ngữ văn (THPT)",
    "Tiếng Anh (THPT)",
    "Vật lý",
    "Hóa học",
    "Sinh học",
    "Lịch sử",
    "Địa lý",
    "Giáo dục kinh tế và pháp luật (GDKT&PL)",
    "Tin học & Khoa học máy tính",
    "Lập trình thi đấu (C++, Python)",
    "Công nghệ (Công nghiệp / Nông nghiệp)",
    "Giáo dục Quốc phòng và An ninh (GDQP-AN)"
  ],
  university: [
    "Khoa học máy tính & Công nghệ phần mềm",
    "Trí tuệ nhân tạo & Khoa học dữ liệu (AI/Data)",
    "Toán cao cấp, Giải tích & Xác suất thống kê",
    "Kinh tế, Tài chính & Ngân hàng",
    "Quản trị kinh doanh & Marketing",
    "Kỹ thuật Điện - Điện tử & Cơ điện tử",
    "Khối ngành Y - Dược & Sức khỏe",
    "Luật học & Pháp lý",
    "Ngôn ngữ Anh & Luyện thi (IELTS, VSTEP)",
    "Sư phạm & Khoa học Giáo dục"
  ]
}

const degreeOptions = [
  "Cử nhân Sư phạm / Cử nhân",
  "Kỹ sư",
  "Thạc sĩ",
  "Tiến sĩ",
  "Phó Giáo sư / Giáo sư",
  "Chứng chỉ Nghiệp vụ Sư phạm / Khác"
]

export default function WelcomeTeacherModal({ isOpen, user, onComplete }) {
  const [step, setStep] = useState(1)

  // Step 2: Bằng cấp & Nơi công tác
  const [degree, setDegree] = useState(degreeOptions[0])
  const [workplace, setWorkplace] = useState("")
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [schoolList, setSchoolList] = useState([])
  const [loadingSchools, setLoadingSchools] = useState(false)
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false)

  // Step 3: Cấp học giảng dạy & Môn học (Multi-select)
  const [teachingLevel, setTeachingLevel] = useState("high_school")
  const [specializations, setSpecializations] = useState([])
  const [specInput, setSpecInput] = useState("")
  const [showSpecDropdown, setShowSpecDropdown] = useState(false)
  const [yearsOfExperience, setYearsOfExperience] = useState(1)
  const [bio, setBio] = useState("")

  // Chống click-through tự submit ở bước 4
  const [canSubmit, setCanSubmit] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const schoolDropdownRef = useRef(null)
  const specDropdownRef = useRef(null)
  const specInputRef = useRef(null)

  // Khóa an toàn 350ms khi vừa chuyển tới bước 4
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => setCanSubmit(true), 350)
      return () => clearTimeout(timer)
    } else {
      setCanSubmit(false)
    }
  }, [step])

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(event.target)) {
        setShowSchoolDropdown(false)
      }
      if (specDropdownRef.current && !specDropdownRef.current.contains(event.target)) {
        setShowSpecDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Tìm kiếm trường học Debounce
  useEffect(() => {
    const getSchoolName = (school) => school?.schoolName || school?.school_name || school?.name

    if (!workplace.trim() || (selectedSchool && getSchoolName(selectedSchool) === workplace.trim())) {
      setSchoolList([])
      setLoadingSchools(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoadingSchools(true)
      try {
        const token = localStorage.getItem("token") || ""
        const res = await fetch(
          `${API_AUTH_URL}/schools/search?query=${encodeURIComponent(workplace.trim())}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          }
        )

        if (res.ok) {
          const resData = await res.json()
          let schools = []
          if (Array.isArray(resData)) {
            schools = resData
          } else if (Array.isArray(resData.data)) {
            schools = resData.data
          } else if (Array.isArray(resData.schools)) {
            schools = resData.schools
          } else if (Array.isArray(resData.items)) {
            schools = resData.items
          }

          setSchoolList(schools)
          setShowSchoolDropdown(schools.length > 0)
        } else {
          setSchoolList([])
          setShowSchoolDropdown(false)
        }
      } catch (err) {
        console.error("Lỗi kết nối API trường học:", err)
        setSchoolList([])
      } finally {
        setLoadingSchools(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [workplace, selectedSchool])

  // Lọc môn học theo cấp học
  const availableSubjects = useMemo(() => {
    const currentList = subjectsByLevel[teachingLevel] || []
    const query = specInput.trim().toLowerCase()
    if (!query) return currentList
    return currentList.filter((subj) => subj.toLowerCase().includes(query))
  }, [teachingLevel, specInput])

  if (!isOpen) return null

  const handleSelectSchool = (school) => {
    setSelectedSchool(school)
    const name = school.schoolName || school.school_name || school.name || ""
    setWorkplace(name)
    setShowSchoolDropdown(false)
  }

  const handleClearSchoolInput = () => {
    setWorkplace("")
    setSelectedSchool(null)
    setSchoolList([])
  }

  const toggleSubject = (subject) => {
    setSpecializations((prev) =>
      prev.includes(subject) ? prev.filter((item) => item !== subject) : [...prev, subject]
    )
  }

  const removeSubject = (subjectToRemove, e) => {
    e.stopPropagation()
    setSpecializations((prev) => prev.filter((item) => item !== subjectToRemove))
  }

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      e.stopPropagation()
      const trimmed = specInput.trim()
      if (trimmed && !specializations.includes(trimmed)) {
        setSpecializations((prev) => [...prev, trimmed])
        setSpecInput("")
      }
    } else if (e.key === "Backspace" && !specInput && specializations.length > 0) {
      setSpecializations((prev) => prev.slice(0, -1))
    }
  }

  const handleNextStep = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setErrorMsg("")
    if (step === 2) {
      if (!workplace.trim()) {
        setErrorMsg("Vui lòng nhập hoặc chọn nơi công tác / trường giảng dạy!")
        return
      }
    }
    if (step === 3) {
      if (specializations.length === 0) {
        setErrorMsg("Vui lòng chọn hoặc nhập ít nhất 1 môn học/chuyên môn giảng dạy!")
        return
      }
    }
    if (step < 4) setStep(step + 1)
  }

  const handlePrevStep = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setErrorMsg("")
    if (step > 1) setStep(step - 1)
  }

  const handleSubmitFinal = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!canSubmit || loading) return

    setLoading(true)
    setErrorMsg("")

    try {
      const response = await fetch(`${API_AUTH_URL}/teacher/onboarding`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`
        },
        body: JSON.stringify({
          userId: user?.id || user?.id_users,
          degree,
          teachingLevel,
          schoolId: selectedSchool?.id || selectedSchool?.id_school || null,
          workplace: workplace.trim(),
          specialization: specializations.join(", "),
          yearsOfExperience: Number(yearsOfExperience),
          bio: bio.trim()
        })
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Lỗi kết nối Server (${response.status})! Vui lòng kiểm tra lại Backend.`)
      }

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Cập nhật hồ sơ giảng viên thất bại!")
      }

      const updatedUserFromBackend = result.data?.user || result.data
      const updatedUser = { 
        ...user, 
        ...updatedUserFromBackend,
        isOnboarded: true,
        is_onboarded: true
      }

      localStorage.setItem("user", JSON.stringify(updatedUser))
      onComplete(updatedUser)
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  const stepsHeaderConfig = [
    { id: 1, name: "Khởi động", subtitle: "Chào mừng" },
    { id: 2, name: "Đơn vị", subtitle: "Trường & Học vị" },
    { id: 3, name: "Chuyên môn", subtitle: "Cấp & Môn dạy" },
    { id: 4, name: "Xác nhận", subtitle: "Hoàn tất" }
  ]

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md transition-all">
      <div 
        onClick={(e) => e.stopPropagation()} 
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col"
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-gradient-to-br from-orange-400/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-gradient-to-tr from-amber-500/20 via-orange-400/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Thanh sọc nhận diện */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500" />

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
            
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold shadow-2xs">
              <Sparkles className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>Cổng Giảng Viên</span>
            </div>
          </div>

          <div className="relative flex items-center justify-between pt-2">
            <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
            
            <div 
              className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500"
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
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-100" 
                      : isActive 
                      ? "bg-orange-600 text-white ring-4 ring-orange-100 shadow-lg shadow-orange-600/30 scale-110" 
                      : "bg-white border-2 border-slate-300 text-slate-400"
                  }`}>
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.id}
                  </div>
                  <span className={`text-xs font-semibold mt-1.5 transition-colors ${
                    isActive ? "text-orange-600 font-extrabold" : isCompleted ? "text-slate-800" : "text-slate-400"
                  }`}>
                    {s.subtitle}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* NỘI DUNG CONTAINER (KHÔNG BỌC THẺ FORM ĐỂ TRÁNH ENTER SUBMIT) */}
        <div className="p-8 overflow-y-auto flex-1 flex flex-col justify-between relative z-10">
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
                  <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-500/20 transform -rotate-3 hover:rotate-0 transition-transform">
                    <Rocket className="w-12 h-12 animate-bounce" />
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 bg-amber-400 p-2 rounded-2xl text-slate-900 shadow-lg ring-4 ring-white">
                    <Sparkles className="w-5 h-5 fill-slate-900" />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Kính chào Thầy/Cô <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{user?.fullName || user?.name || ""}</span>! 👨‍🏫👩‍🏫
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-md mx-auto">
                    Chào mừng Quý Thầy/Cô đến với không gian giảng dạy của <strong className="text-slate-800">EduTech Central</strong>! Hãy thiết lập hồ sơ để quản lý lớp học và tài liệu số.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start space-x-3.5 shadow-2xs hover:border-orange-300 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-600/20 mt-0.5">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-800">Quản lý lớp học thông minh</div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-snug">Dễ dàng tạo lớp, điểm danh, giao bài và chấm thi trực tuyến.</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start space-x-3.5 shadow-2xs hover:border-amber-300 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20 mt-0.5">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-800">Kho học liệu chuẩn hóa</div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-snug">Liên kết ngân hàng câu hỏi và giáo án số theo từng cấp học.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BƯỚC 2: TRƯỜNG CÔNG TÁC & HỌC VỊ */}
            {step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h4 className="text-base font-black text-slate-800 flex items-center space-x-2">
                    <div className="p-1.5 rounded-xl bg-orange-100 text-orange-600">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span>Đơn vị công tác & Học vị</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 ml-8">Thông tin giúp học sinh và phụ huynh xác thực giảng viên.</p>
                </div>

                {/* Học vị */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-orange-600" />
                    <span>Học vị / Bằng cấp cao nhất</span>
                  </label>
                  <div className="relative">
                    <select
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 cursor-pointer appearance-none shadow-2xs"
                    >
                      {degreeOptions.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                      ▼
                    </div>
                  </div>
                </div>

                {/* Tìm kiếm trường */}
                <div className="space-y-2 relative" ref={schoolDropdownRef}>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Trường học / Nơi công tác hiện tại <span className="text-orange-500">*</span>
                  </label>

                  <div className="relative group">
                    <input
                      type="text"
                      value={workplace}
                      onChange={(e) => {
                        setWorkplace(e.target.value)
                        setSelectedSchool(null)
                      }}
                      onFocus={() => schoolList.length > 0 && setShowSchoolDropdown(true)}
                      placeholder="Gõ tên trường hoặc cơ quan công tác của Thầy/Cô..."
                      className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 transition-all shadow-2xs"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />

                    {loadingSchools ? (
                      <Loader2 className="w-4 h-4 text-orange-600 animate-spin absolute right-3.5 top-3.5" />
                    ) : workplace && (
                      <button
                        type="button"
                        onClick={handleClearSchoolInput}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {showSchoolDropdown && schoolList.length > 0 && (
                    <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-52 overflow-y-auto divide-y divide-slate-100">
                      {schoolList.map((item) => {
                        const schoolName = item.schoolName || item.school_name || item.name
                        const provinceName = item.provinceName || item.province_name || item.province
                        const schoolId = item.id || item.id_school

                        return (
                          <button
                            key={schoolId || schoolName}
                            type="button"
                            onClick={() => handleSelectSchool(item)}
                            className="w-full text-left p-3 hover:bg-orange-50/70 transition-colors flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center space-x-2.5">
                              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-orange-100 group-hover:text-orange-600">
                                <Building2 className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-800 group-hover:text-orange-700">
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
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Số năm kinh nghiệm */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>Số năm kinh nghiệm giảng dạy</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* BƯỚC 3: CẤP HỌC & CHỌN NHIỀU MÔN DẠY */}
            {step === 3 && (
              <div className="space-y-5 animate-fadeIn">
                <div>
                  <h4 className="text-base font-black text-slate-800 flex items-center space-x-2">
                    <div className="p-1.5 rounded-xl bg-orange-100 text-orange-600">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span>Cấp học & Môn giảng dạy chính</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 ml-8">Chọn cấp học tương ứng để hệ thống lọc danh sách môn phụ trách.</p>
                </div>

                {/* 1. Chọn Cấp học */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Cấp học giảng dạy chính <span className="text-orange-500">*</span>
                  </label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {teachingLevels.map((lvl) => {
                      const Icon = lvl.icon
                      const isSelected = teachingLevel === lvl.id
                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => {
                            setTeachingLevel(lvl.id)
                            setSpecInput("")
                          }}
                          className={`p-3 rounded-2xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                            isSelected
                              ? "bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-600/20 scale-[1.02]"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <div className={`p-2 rounded-xl ${isSelected ? "bg-white/20 text-white" : "bg-white text-orange-600 shadow-2xs"}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="text-xs font-bold truncate w-full">{lvl.name}</div>
                          <div className={`text-[10px] font-medium ${isSelected ? "text-orange-100" : "text-slate-400"}`}>
                            {lvl.badge}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Multi-select Tags Môn học */}
                <div className="space-y-2 relative" ref={specDropdownRef}>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Môn học phụ trách ({teachingLevels.find(l => l.id === teachingLevel)?.name}) <span className="text-orange-500">*</span>
                    </label>
                    {specializations.length > 0 && (
                      <span className="text-[11px] font-bold text-orange-600">
                        Đã chọn {specializations.length} môn
                      </span>
                    )}
                  </div>

                  {/* Input chứa Tags */}
                  <div 
                    onClick={() => {
                      setShowSpecDropdown(true)
                      specInputRef.current?.focus()
                    }}
                    className="min-h-[46px] p-2 bg-slate-50 border border-slate-200 rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-600 flex flex-wrap items-center gap-1.5 cursor-text transition-all shadow-2xs"
                  >
                    {specializations.map((item) => (
                      <span 
                        key={item}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-orange-100 text-orange-800 border border-orange-200 rounded-xl text-xs font-semibold animate-fadeIn"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={(e) => removeSubject(item, e)}
                          className="hover:bg-orange-200 rounded-full p-0.5 text-orange-700 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    <input
                      ref={specInputRef}
                      type="text"
                      value={specInput}
                      onChange={(e) => {
                        setSpecInput(e.target.value)
                        setShowSpecDropdown(true)
                      }}
                      onFocus={() => setShowSpecDropdown(true)}
                      onKeyDown={handleInputKeyDown}
                      placeholder={specializations.length === 0 ? "Bấm chọn hoặc gõ tên môn rồi Enter..." : "Thêm môn khác..."}
                      className="flex-1 min-w-[130px] bg-transparent border-none text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none px-1.5 py-1"
                    />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowSpecDropdown((prev) => !prev)
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 ml-auto cursor-pointer"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showSpecDropdown ? "rotate-180 text-orange-600" : ""}`} />
                    </button>
                  </div>

                  {/* Dropdown danh sách môn học theo cấp */}
                  {showSpecDropdown && (
                    <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-56 overflow-y-auto p-1.5 divide-y divide-slate-100">
                      {specInput.trim() && !specializations.includes(specInput.trim()) && (
                        <div className="p-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSpecializations((prev) => [...prev, specInput.trim()])
                              setSpecInput("")
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm môn: "{specInput.trim()}"</span>
                          </button>
                        </div>
                      )}

                      {availableSubjects.length > 0 ? (
                        <div className="py-1 space-y-0.5">
                          {availableSubjects.map((item) => {
                            const isSelected = specializations.includes(item)
                            return (
                              <button
                                key={item}
                                type="button"
                                onClick={() => toggleSubject(item)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected 
                                    ? "bg-orange-50 text-orange-700 font-bold" 
                                    : "text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                <span>{item}</span>
                                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                  isSelected 
                                    ? "bg-orange-600 border-orange-600 text-white" 
                                    : "border-slate-300 bg-white"
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-500">
                          Không có môn sẵn có theo từ khóa. Nhấn <strong>Enter</strong> để lưu môn bạn vừa gõ.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Giới thiệu bản thân ngắn */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-orange-600" />
                    <span>Giới thiệu ngắn / Phong cách giảng dạy <span className="text-slate-400 font-normal">(Tùy chọn)</span></span>
                  </label>
                  <textarea
                    rows="2"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="VD: Giáo viên dạy chuyên Toán/Tin, ứng dụng công nghệ trực quan vào bài giảng..."
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 resize-none shadow-2xs"
                  />
                </div>
              </div>
            )}

            {/* BƯỚC 4: XÁC NHẬN HỒ SƠ GIẢNG VIÊN */}
            {step === 4 && (
              <div className="space-y-5 animate-fadeIn py-1">
                <div className="text-center space-y-1">
                  <div className="inline-flex p-3 rounded-2xl bg-orange-100 text-orange-600 mb-1 shadow-2xs">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-slate-900">Xác nhận hồ sơ giảng viên</h4>
                  <p className="text-xs text-slate-500">Rà soát lại thông tin trước khi kích hoạt bảng điều khiển giảng dạy.</p>
                </div>

                <div className="p-5 bg-slate-50/90 border border-slate-200/90 rounded-2xl space-y-3.5 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/70">
                      <span className="text-xs text-slate-500 font-medium flex items-center">
                        <Award className="w-4 h-4 mr-2 text-orange-600" />
                        Học vị:
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {degree}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/70">
                      <span className="text-xs text-slate-500 font-medium flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-amber-500" />
                        Kinh nghiệm:
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {yearsOfExperience} Năm
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/70">
                    <span className="text-xs text-slate-500 font-medium flex items-center">
                      <Building2 className="w-4 h-4 mr-2 text-orange-600" />
                      Nơi công tác:
                    </span>
                    <span className="text-xs font-bold text-orange-700 text-right max-w-[280px] truncate">
                      {workplace}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/70">
                    <span className="text-xs text-slate-500 font-medium flex items-center">
                      <GraduationCap className="w-4 h-4 mr-2 text-amber-600" />
                      Cấp học:
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {teachingLevels.find(l => l.id === teachingLevel)?.name}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/70 space-y-2">
                    <span className="text-xs text-slate-500 font-medium flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-orange-500" />
                      Môn học phụ trách ({specializations.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {specializations.map((subj) => (
                        <span key={subj} className="px-2 py-0.5 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-[11px] font-bold">
                          {subj}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 text-center italic">
                  * Thầy/Cô có thể cập nhật lại thông tin này bất kỳ lúc nào tại Hồ sơ cá nhân.
                </div>
              </div>
            )}
          </div>

          {/* FOOTER BUTTONS (ĐỘC LẬP TỪNG BƯỚC) */}
          <div className="pt-6 flex items-center space-x-3 shrink-0 border-t border-slate-100 mt-6">
            {step > 1 && (
              <button
                key="btn-back"
                type="button"
                onClick={handlePrevStep}
                disabled={loading}
                className="flex items-center justify-center space-x-1.5 py-3.5 px-5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại</span>
              </button>
            )}

            {step < 4 ? (
              <button
                key="btn-next"
                type="button"
                onClick={handleNextStep}
                className="flex-1 flex justify-center items-center space-x-2 py-3.5 px-6 rounded-2xl shadow-lg shadow-orange-500/20 text-xs font-black text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{step === 1 ? "Bắt đầu thiết lập" : "Tiếp tục"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                key="btn-submit"
                type="button"
                onClick={handleSubmitFinal}
                disabled={loading || !canSubmit}
                className="flex-1 flex justify-center items-center space-x-2 py-4 px-6 rounded-2xl shadow-xl shadow-orange-500/25 text-xs font-black text-white bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-700 hover:to-amber-600 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Vào Bảng Quản Lý Giảng Viên</span>
                    <Sparkles className="w-4 h-4 text-amber-200 fill-amber-200" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}