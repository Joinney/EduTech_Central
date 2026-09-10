/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { 
  Calculator, 
  Code2, 
  Languages, 
  Atom, 
  FlaskConical, 
  Binary, 
  Scale, 
  TrendingUp,
  ArrowRight,
  Sparkles,
  BookOpenCheck,
  Search,
  SlidersHorizontal,
  Clock,
  Star,
  Users,
  GraduationCap,
  ArrowLeft,
  Loader2
} from "lucide-react"

import { courseService } from "../../../../api/course.api"

// Cấu hình thông tin chuẩn các danh mục
const CATEGORIES = [
  {
    id: "toan-hoc",
    name: "Toán học & Giải tích",
    desc: "Đại số, Hình học không gian, Vi tích phân phổ thông và ứng dụng thực tiễn.",
    icon: Calculator,
    bgLight: "bg-blue-50 text-blue-600 border-blue-100"
  },
  {
    id: "tin-hoc",
    name: "Tin học & Lập trình",
    desc: "Thuật toán, Python, Web Development, C++ và cấu trúc dữ liệu.",
    icon: Code2,
    bgLight: "bg-cyan-50 text-cyan-600 border-cyan-100"
  },
  {
    id: "tieng-anh",
    name: "Tiếng Anh & Ngoại ngữ",
    desc: "IELTS, TOEIC, Ngữ pháp chuyên sâu và kỹ năng giao tiếp học thuật.",
    icon: Languages,
    bgLight: "bg-emerald-50 text-emerald-600 border-emerald-100"
  },
  {
    id: "vat-ly",
    name: "Vật lý đại cương",
    desc: "Cơ học, Điện từ trường, Quang học và Vật lý thực nghiệm.",
    icon: Atom,
    bgLight: "bg-amber-50 text-amber-600 border-amber-100"
  },
  {
    id: "khoa-hoc-tu-nhien",
    name: "Hóa học & Sinh học",
    desc: "Hóa hữu cơ - vô cơ, Sinh học phân tử và Di truyền học đại cương.",
    icon: FlaskConical,
    bgLight: "bg-rose-50 text-rose-600 border-rose-100"
  },
  {
    id: "toan-cao-cap",
    name: "Toán cao cấp & Đại số tuyến tính",
    desc: "Ma trận, Không gian vector, Tích phân suy rộng cho bậc Đại học.",
    icon: Binary,
    bgLight: "bg-purple-50 text-purple-600 border-purple-100"
  },
  {
    id: "dai-cuong",
    name: "Triết học & Pháp luật đại cương",
    desc: "Triết học Mác - Lênin, Nhà nước & Pháp luật, Tư tưởng Hồ Chí Minh.",
    icon: Scale,
    bgLight: "bg-slate-100 text-slate-700 border-slate-200"
  },
  {
    id: "kinh-te",
    name: "Kinh tế vi mô & vĩ mô",
    desc: "Quy luật cung cầu, Thị trường tài chính và Kinh tế học ứng dụng.",
    icon: TrendingUp,
    bgLight: "bg-teal-50 text-teal-600 border-teal-100"
  }
]

// Từ điển ánh xạ slug sang từ khóa tiếng Việt tương ứng trong CSDL
const CATEGORY_KEYWORDS = {
  "vat-ly": ["vật lý", "vat ly", "physics"],
  "toan-hoc": ["toán", "toan", "giải tích", "hình học"],
  "tin-hoc": ["tin học", "lập trình", "ai", "cntt", "code", "python", "c++", "web"],
  "tieng-anh": ["tiếng anh", "english", "ngoại ngữ", "ielts", "toeic", "giao tiếp"],
  "khoa-hoc-tu-nhien": ["hóa học", "hoa hoc", "sinh học", "sinh hoc"],
  "toan-cao-cap": ["toán cao cấp", "đại số tuyến tính", "đại số", "ma trận", "vector"],
  "dai-cuong": ["triết", "pháp luật", "chính trị", "tư tưởng", "đại cương"],
  "kinh-te": ["kinh tế", "tài chính", "vi mô", "vĩ mô"]
}

// Mock bổ trợ
const MOCK_COURSES = [
  {
    id: "c-toan-12",
    title: "Chinh phục Giải tích 12: Đạo hàm & Khảo sát hàm số",
    categorySlug: "toan-hoc",
    instructor: "ThS. Trần Nhật Nam",
    level: "Nâng cao",
    rating: 4.9,
    studentsCount: 1420,
    lessonsCount: 36,
    duration: "45 giờ",
    price: 399000,
    originalPrice: 799000,
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: "c-py-01",
    title: "Lập trình Python từ Zero đến Thực chiến dữ liệu",
    categorySlug: "tin-hoc",
    instructor: "Kỹ sư Lê Minh Trí",
    level: "Cơ bản",
    rating: 4.95,
    studentsCount: 3120,
    lessonsCount: 52,
    duration: "60 giờ",
    price: 499000,
    originalPrice: 999000,
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: "c-ielts-7",
    title: "Luyện thi IELTS 7.0+: Kỹ năng Writing & Speaking",
    categorySlug: "tieng-anh",
    instructor: "Cô Sarah Davis (8.5 IELTS)",
    level: "Nâng cao",
    rating: 4.9,
    studentsCount: 2200,
    lessonsCount: 40,
    duration: "50 giờ",
    price: 799000,
    originalPrice: 1500000,
    thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=60"
  }
]

export default function CourseCategories() {
  const { categorySlug } = useParams()
  const navigate = useNavigate()
  const role = localStorage.getItem("role")?.toLowerCase() || "student"
  const isTeacher = role === "teacher"

  const [dbCourses, setDbCourses] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Bộ lọc nội bộ
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [selectedPrice, setSelectedPrice] = useState("all")
  const [sortBy, setSortBy] = useState("popular")

  // Thông tin danh mục hiện tại
  const currentCategory = useMemo(() => {
    return CATEGORIES.find(c => c.id === categorySlug)
  }, [categorySlug])

  // 🎯 TẢI DỮ LIỆU THỰC TẾ TỪ POSTGRESQL (COURSE-SERVICE)
  useEffect(() => {
    const fetchCoursesFromDB = async () => {
      setIsLoading(true)
      try {
        const baseUrl = import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1"
        const queryParam = categorySlug ? `?category=${categorySlug}` : ""
        const res = await fetch(`${baseUrl}/courses${queryParam}`).catch(() => null)
        
        let list = []
        if (res && res.ok) {
          const json = await res.json()
          list = Array.isArray(json) ? json : (json?.data || [])
        } else {
          const fallbackRes = await courseService.getAllCourses().catch(() => [])
          list = Array.isArray(fallbackRes) ? fallbackRes : (fallbackRes?.data || [])
        }

        // Chuẩn hóa định dạng khóa học từ DB
        const mapped = list.map(c => {
          const defaultThumb = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60"
          const thumb = (c.thumbnail && !c.thumbnail.includes("ui-avatars")) ? c.thumbnail : defaultThumb

          return {
            id: c.id || c.id_course,
            title: c.title,
            subject: c.subject || "",
            categorySlug: c.category?.slug || "",
            categoryId: c.category_id,
            instructor: c.teacher_name || c.teacherName || "Giảng viên EduTech",
            level: c.grade || "Đại học",
            rating: 4.9,
            studentsCount: c.studentsCount || c.students_count || 45,
            lessonsCount: c.lessons?.length || 12,
            duration: c.schedule || "45 giờ",
            price: Number(c.price) || 0,
            originalPrice: Number(c.price) ? Number(c.price) * 1.5 : 0,
            thumbnail: thumb,
            isDb: true
          }
        })

        setDbCourses(mapped)
      } catch (err) {
        console.error("Lỗi tải khóa học:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCoursesFromDB()
  }, [categorySlug])

  // Gộp các khóa học DB cùng danh sách Mock
  const combinedCourses = useMemo(() => {
    const list = [...dbCourses]
    MOCK_COURSES.forEach(mock => {
      if (!list.some(item => item.title === mock.title)) {
        list.push(mock)
      }
    })
    return list
  }, [dbCourses])

  // 🎯 LỌC KHÓA HỌC THEO SLUG & TỪ KHÓA
  const filteredCourses = useMemo(() => {
    const keywords = categorySlug ? (CATEGORY_KEYWORDS[categorySlug] || [categorySlug]) : []

    return combinedCourses.filter(course => {
      // 1. Kiểm tra khớp danh mục
      if (categorySlug) {
        const matchSlug = course.categorySlug === categorySlug
        const subjectLower = (course.subject || "").toLowerCase()
        const titleLower = (course.title || "").toLowerCase()
        const matchKeyword = keywords.some(kw => subjectLower.includes(kw) || titleLower.includes(kw))

        if (!matchSlug && !matchKeyword) return false
      }

      // 2. Khớp từ khóa tìm kiếm
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const matchTitle = course.title.toLowerCase().includes(query)
        const matchInstructor = course.instructor.toLowerCase().includes(query)
        if (!matchTitle && !matchInstructor) return false
      }

      // 3. Khớp trình độ
      if (selectedLevel !== "all" && course.level !== selectedLevel) return false

      // 4. Khớp loại phí
      if (selectedPrice === "free" && course.price > 0) return false
      if (selectedPrice === "paid" && course.price === 0) return false

      return true
    }).sort((a, b) => {
      if (sortBy === "popular") return b.studentsCount - a.studentsCount
      if (sortBy === "rating") return b.rating - a.rating
      if (sortBy === "price-low") return a.price - b.price
      if (sortBy === "price-high") return b.price - a.price
      return 0
    })
  }, [combinedCourses, categorySlug, searchTerm, selectedLevel, selectedPrice, sortBy])

  // 1. GIAO DIỆN KHI XEM TỪNG DANH MỤC CỤ THỂ
  if (categorySlug) {
    const Icon = currentCategory?.icon || BookOpenCheck

    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans pb-16">
        
        {/* Nút quay lại & Header danh mục */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/${role}/courses/category`)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>Danh mục đào tạo</span>
              <span>/</span>
              <span className={isTeacher ? "text-orange-600" : "text-blue-600"}>
                {currentCategory ? currentCategory.name : categorySlug}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 truncate">
              {currentCategory ? currentCategory.name : "Khóa học theo danh mục"}
            </h1>
          </div>
        </div>

        {/* Hero banner giới thiệu danh mục */}
        {currentCategory && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${currentCategory.bgLight}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{currentCategory.name}</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">{currentCategory.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">
                {filteredCourses.length} khóa học có sẵn
              </span>
            </div>
          </div>
        )}

        {/* Thanh lọc & Tìm kiếm */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm môn học, giảng viên..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 pr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bộ lọc:</span>
            </div>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả trình độ</option>
              <option value="Cơ bản">Cơ bản</option>
              <option value="Nâng cao">Nâng cao</option>
              <option value="Chuyên sâu">Chuyên sâu</option>
            </select>

            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả chi phí</option>
              <option value="free">Miễn phí</option>
              <option value="paid">Trả phí</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="popular">Phổ biến nhất</option>
              <option value="rating">Đánh giá cao</option>
              <option value="price-low">Giá: Thấp đến cao</option>
              <option value="price-high">Giá: Cao đến thấp</option>
            </select>
          </div>
        </div>

        {/* Lưới hiển thị các thẻ khóa học */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-xs font-medium">Đang tải danh sách khóa học từ hệ thống...</p>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-lg">
                      {course.level}
                    </span>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <h3 
                      className={`font-bold text-xs leading-snug line-clamp-2 transition-colors ${
                        isTeacher ? "group-hover:text-orange-600" : "group-hover:text-blue-600"
                      }`}
                      title={course.title}
                    >
                      {course.title}
                    </h3>

                    <p className="text-[11px] text-slate-500 font-medium flex items-center space-x-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{course.instructor}</span>
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-100">
                      <div className="flex items-center space-x-1 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{course.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{course.studentsCount} HV</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 mt-2 flex items-center justify-between border-t border-slate-50">
                  <div>
                    {course.price === 0 ? (
                      <span className="text-xs font-black text-emerald-600 uppercase">Miễn phí</span>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900">
                          {course.price.toLocaleString("vi-VN")} đ
                        </span>
                        {course.originalPrice > course.price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {course.originalPrice.toLocaleString("vi-VN")} đ
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/${role}/courses/${course.id}`}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shadow-xs ${
                      isTeacher
                        ? "bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                    }`}
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-3">
            <BookOpenCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">Chưa tìm thấy khóa học phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Không có khóa học nào khớp với bộ lọc hoặc từ khóa tìm kiếm của bạn trong danh mục này.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("")
                setSelectedLevel("all")
                setSelectedPrice("all")
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </div>
    )
  }

  // 2. GIAO DIỆN TỔNG QUAN KHI VÀO DANH MỤC GỐC
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans pb-16">
      <div className={`p-6 md:p-8 rounded-3xl border shadow-xs ${
        isTeacher 
          ? "bg-gradient-to-r from-orange-500/10 via-amber-50/40 to-white border-orange-200/70"
          : "bg-gradient-to-r from-blue-600/10 via-indigo-50/40 to-white border-blue-200/70"
      }`}>
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider mb-2 text-slate-500">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Hệ thống phân loại đào tạo</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Danh Mục Khóa Học & Lĩnh Vực Đào Tạo
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Chọn một danh mục để bắt đầu khám phá các khóa học chuẩn hóa từ bậc phổ thông đến chuyên ngành đại học.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const keywords = CATEGORY_KEYWORDS[cat.id] || [cat.id]
          const matchCount = combinedCourses.filter(c => {
            if (c.categorySlug === cat.id) return true
            const sub = (c.subject || "").toLowerCase()
            const title = (c.title || "").toLowerCase()
            return keywords.some(kw => sub.includes(kw) || title.includes(kw))
          }).length

          return (
            <Link
              key={cat.id}
              to={`/${role}/courses/category/${cat.id}`}
              className="group relative bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs transition-transform duration-300 group-hover:scale-110 ${cat.bgLight}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full flex items-center space-x-1">
                    <BookOpenCheck className="w-3 h-3 text-slate-400" />
                    <span>{matchCount} khóa</span>
                  </span>
                </div>

                <h3 className={`font-extrabold text-sm text-slate-900 group-hover:transition-colors line-clamp-1 ${
                  isTeacher ? "group-hover:text-orange-600" : "group-hover:text-blue-600"
                }`}>
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                  {cat.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                <span>Xem khóa học</span>
                <ArrowRight className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${
                  isTeacher ? "text-orange-500" : "text-blue-600"
                }`} />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}