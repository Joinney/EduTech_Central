import React, { useEffect, useRef } from "react"
import { 
  Sparkles, 
  Video, 
  PlusCircle,
  VideoOff,
  FileText, 
  Layers, 
  Network, 
  ShoppingBag, 
  Eye, 
  Download, 
  PlayCircle, 
  ThumbsUp, 
  MessageSquare,
  Bookmark,
  Filter
} from "lucide-react"

// Component Canvas hạt phân tử AI chuyển động
function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    let animationFrameId

    // Đặt kích thước canvas theo container
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Khởi tạo danh sách phân tử (45 hạt)
    const particleCount = 45
    const particles = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8, // Tốc độ di chuyển X
        vy: (Math.random() - 0.5) * 0.8, // Tốc độ di chuyển Y
        radius: Math.random() * 2 + 1.5,   // Kích thước hạt
        alpha: Math.random() * 0.5 + 0.5
      })
    }

    // Vòng lặp vẽ Animation
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 1. Cập nhật vị trí và vẽ các hạt
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy

        // Bật lại khi chạm viền canvas
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Vẽ hạt phân tử phát sáng nhẹ
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`
        ctx.shadowBlur = 6
        ctx.shadowColor = "#ffffff"
        ctx.fill()
        ctx.shadowBlur = 0 // Reset shadow

        // 2. Vẽ đường nối mạng lưới giữa các hạt lại gần nhau
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          // Nếu khoảng cách < 110px thì nối dây mờ
          if (dist < 110) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 * (1 - dist / 110)})`
            ctx.lineWidth = 0.75
            ctx.stroke()
          }
        }
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  )
}

export default function UserHome() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* ================= THANH TẠO VÀ THAM GIA CUỘC HỌP (TRÊN LỘ TRÌNH AI) ================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-800">Lớp học trực tuyến & Cuộc họp</h3>
            <p className="text-xs font-medium text-slate-500">Tạo phòng học Google Meet/Zoom mới hoặc tham gia bằng mã phòng.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0">
          <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 cursor-pointer">
            <PlusCircle className="w-4 h-4" />
            <span>Tạo cuộc họp mới</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer">
            <Video className="w-4 h-4 text-blue-600" />
            <span>Tham gia cuộc họp</span>
          </button>
        </div>
      </div>

      {/* ================= HÀNG 1: LỘ TRÌNH AI (NỀN BẠC + CANVAS CHUYỂN ĐỘNG) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Banner Lộ trình AI đề xuất */}
        <div className="lg:col-span-2 relative rounded-3xl p-6 border border-slate-300/60 shadow-md overflow-hidden flex flex-col justify-between bg-gradient-to-br from-[#c8d3e0] via-[#b6c4d4] to-[#9eb0c3]">
          
          {/* Hiệu ứng mờ ánh bạc kim loại */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-blue-200/20 pointer-events-none z-0" />

          {/* Canvas Hạt Phân Tử AI Chuyển Động */}
          <ParticleCanvas />

          {/* Watermark Chữ mờ 4 góc */}
          <span className="absolute top-3 left-4 text-[9px] font-bold text-slate-600/30 select-none pointer-events-none tracking-tight z-0">
            Bảng điều khiển Học viên - Kinetic Academy
          </span>
          <span className="absolute top-3 right-4 text-[9px] font-bold text-slate-600/30 select-none pointer-events-none tracking-tight z-0">
            Bảng điều khiển Học viên - Kinetic Academy
          </span>
          <span className="absolute bottom-3 left-4 text-[9px] font-bold text-slate-600/30 select-none pointer-events-none tracking-tight z-0">
            Bảng điều khiển Học viên - Kinetic Academy
          </span>
          <span className="absolute bottom-3 right-4 text-[9px] font-bold text-slate-600/30 select-none pointer-events-none tracking-tight z-0">
            Bảng điều khiển Học viên - Kinetic Academy
          </span>

          {/* Tiêu đề Banner */}
          <div className="relative z-10 flex items-center space-x-2 text-[#0a2540] font-black text-xl mb-5">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0" />
            <span className="tracking-tight">Lộ trình AI đề xuất</span>
          </div>

          {/* 3 Thẻ chức năng bên trong */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Card 1: Bài học tiếp theo */}
            <div className="bg-white p-5 rounded-2xl shadow-sm flex flex-col justify-between border border-white/60">
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block mb-2">
                  Bài học tiếp theo
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 mb-2 leading-snug">
                  Cấu trúc dữ liệu nâng cao
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mb-6">
                  Hoàn thành 65% - Module 4
                </p>
              </div>
              <button className="w-full py-2.5 bg-[#0062d2] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer">
                Tiếp tục học
              </button>
            </div>

            {/* Card 2: Ôn tập đề xuất */}
            <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm flex flex-col justify-between border border-white/40">
              <div>
                <span className="text-[10px] font-extrabold text-[#8a5d28] uppercase tracking-wider block mb-2">
                  Ôn tập (Đề xuất)
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 mb-2 leading-snug">
                  Thuật toán tối ưu
                </h4>
                <p className="text-[11px] text-slate-600 font-medium mb-6 leading-relaxed">
                  Dựa trên kết quả bài kiểm tra Python
                </p>
              </div>
              <button className="w-full py-2.5 bg-white/90 border-2 border-[#0062d2] hover:bg-blue-50 text-[#0062d2] rounded-xl text-xs font-bold transition shadow-sm cursor-pointer">
                Luyện tập ngay
              </button>
            </div>

            {/* Card 3: Kỹ năng thiếu */}
            <div className="bg-[#d5ceca]/60 backdrop-blur-md p-5 rounded-2xl shadow-sm flex flex-col justify-between border border-white/30">
              <div>
                <span className="text-[10px] font-extrabold text-[#703b0d] uppercase tracking-wider block mb-2">
                  Kỹ năng thiếu
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 mb-2 leading-snug">
                  Big Data cơ bản
                </h4>
                <p className="text-[11px] text-slate-700 font-medium mb-6">
                  Lấp đầy khoảng trống kiến thức
                </p>
              </div>
              <button className="w-full py-2.5 bg-[#ff8c00] hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer">
                Bắt đầu
              </button>
            </div>

          </div>
        </div>

        {/* Cột Widgets bên phải */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                🌐
              </span>
              <span>Chỉ số tập trung AI</span>
            </div>
            
            <div className="h-14 flex items-end justify-between space-x-2 px-1 pt-2">
              <div className="w-full bg-blue-100 rounded-t h-[35%]" />
              <div className="w-full bg-blue-200 rounded-t h-[55%]" />
              <div className="w-full bg-blue-300 rounded-t h-[80%]" />
              <div className="w-full bg-blue-500 rounded-t h-[45%]" />
              <div className="w-full bg-blue-600 rounded-t h-[100%]" />
            </div>

            <p className="text-[11px] text-slate-500 leading-tight pt-1">
              Mức độ tập trung trung bình tuần này: <strong className="text-blue-600 font-bold">82%</strong>. Tăng 12% so với tuần trước.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                <span className="text-base">🔥</span>
                <span>Chuỗi ngày học tập</span>
              </div>
              <span className="text-xl font-black text-amber-500">12</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 py-1">
              <div className="h-6 rounded bg-blue-100" />
              <div className="h-6 rounded bg-blue-200" />
              <div className="h-6 rounded bg-blue-300" />
              <div className="h-6 rounded bg-blue-600" />
              <div className="h-6 rounded bg-blue-600" />
              <div className="h-6 rounded bg-blue-300" />
              <div className="h-6 rounded bg-blue-400" />
            </div>

            <p className="text-[11px] text-slate-500 leading-tight">
              Bạn đang trong top 5% học viên chăm chỉ nhất tuần này!
            </p>
          </div>
        </div>

      </div>

      {/* ================= HÀNG 2: HỌC KỲ HIỆN TẠI + BỘ LỌC ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-slate-800">Học kỳ hiện tại (Môn học)</h3>
            <a href="#view-all" className="text-xs font-bold text-blue-600 hover:underline">Xem tất cả</a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Card Môn 1: Toán */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="relative h-40 bg-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=80" 
                  alt="Giai tich" 
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  Bắt buộc
                </span>
                <span className="absolute top-2.5 right-2.5 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1 shadow-sm">
                  <Video className="w-3 h-3" />
                  <span>Lớp học Meet</span>
                </span>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                    MÔN TOÁN - KHỐI 12
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 mt-0.5">
                    Giải tích 12: Đạo hàm
                  </h4>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-[45%]" />
                  </div>
                  <div className="text-right text-[10px] font-bold text-slate-400">45%</div>
                </div>

                <p className="text-xs text-slate-500 font-medium">👨‍🏫 TS. Sarah Jenkins</p>

                <div className="grid grid-cols-3 gap-1 pt-1">
                  <button className="flex items-center justify-center space-x-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[9px] font-bold text-slate-700 transition">
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span>TÓM TẮT AI</span>
                  </button>
                  <button className="flex items-center justify-center space-x-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[9px] font-bold text-slate-700 transition">
                    <Layers className="w-3 h-3 text-slate-500" />
                    <span>FLASHCARDS</span>
                  </button>
                  <button className="flex items-center justify-center space-x-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[9px] font-bold text-slate-700 transition">
                    <Network className="w-3 h-3 text-slate-500" />
                    <span>SƠ ĐỒ TƯ DUY</span>
                  </button>
                </div>

                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                  Học ngay
                </button>
              </div>
            </div>

            {/* Card Môn 2: Vật lý */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="relative h-40 bg-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=80" 
                  alt="Vat ly" 
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 right-2.5 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1 shadow-sm">
                  <Video className="w-3 h-3" />
                  <span>Lớp học Meet</span>
                </span>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                    MÔN VẬT LÝ - KHỐI 12
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 mt-0.5">
                    Vật lý 12: Điện xoay chiều
                  </h4>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-[15%]" />
                  </div>
                  <div className="text-right text-[10px] font-bold text-slate-400">15%</div>
                </div>

                <p className="text-xs text-slate-500 font-medium">👨‍🏫 GS. Mark Reed</p>

                <div className="grid grid-cols-3 gap-1 pt-1">
                  <button className="flex items-center justify-center space-x-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-[9px] font-bold text-slate-700 transition">
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span>TÓM TẮT AI</span>
                  </button>
                  <button className="flex items-center justify-center space-x-1 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[9px] font-bold text-slate-700 transition">
                    <Layers className="w-3 h-3 text-slate-500" />
                    <span>FLASHCARDS</span>
                  </button>
                  <button className="flex items-center justify-center space-x-1 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[9px] font-bold text-slate-700 transition">
                    <Network className="w-3 h-3 text-slate-500" />
                    <span>SƠ ĐỒ TƯ DUY</span>
                  </button>
                </div>

                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                  Học ngay
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Cột Bộ lọc học liệu */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 h-fit">
          <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-3">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Bộ lọc học liệu</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Loại File</label>
              <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500">
                <option>Tất cả (All)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Khối / Môn học</label>
              <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500">
                <option>Tất cả khối lớp</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Năm học / Học kỳ</label>
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500">
                  <option>2023-2024</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">&nbsp;</label>
                <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500">
                  <option>Học kỳ 1</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mức giá</label>
              <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500">
                <option>Tất cả mức giá</option>
              </select>
            </div>

            <button className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition mt-2 cursor-pointer">
              Áp dụng bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* ================= HÀNG 3: HỌC LIỆU ĐỀ XUẤT ================= */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base text-slate-800">Học liệu & Khóa học đề xuất</h3>
          <a href="#shop" className="text-xs font-bold text-blue-600 hover:underline">Xem cửa hàng</a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col justify-between space-y-4">
            <div className="relative bg-slate-100 rounded-xl h-36 flex items-center justify-center">
              <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                -20%
              </span>
              <FileText className="w-10 h-10 text-slate-400" />
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-800">Chuyên sâu Prompt Engineering</h4>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className="font-bold text-blue-600 text-sm">450.000đ</span>
                <span className="text-xs text-slate-400 line-through">560.000đ</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                Mua ngay
              </button>
              <button className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition cursor-pointer">
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col justify-between space-y-4">
            <div className="bg-slate-100 rounded-xl h-36 flex items-center justify-center">
              <PlayCircle className="w-10 h-10 text-slate-400" />
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-800">Mastering React & Tailwind</h4>
              <div className="mt-1">
                <span className="font-bold text-blue-600 text-sm">Miễn phí</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                Đăng ký
              </button>
              <button className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition cursor-pointer">
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= HÀNG 4: THƯ VIỆN SỐ ================= */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-base text-slate-800">Thư viện số (Đang nghiên cứu)</h3>
          <div className="flex space-x-1 bg-slate-200/60 p-0.5 rounded-lg text-xs font-bold text-slate-600">
            <button className="px-3 py-1 bg-white rounded-md shadow-sm">PDF</button>
            <button className="px-3 py-1 hover:text-slate-900 transition">Video</button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-500 shrink-0 mt-1 sm:mt-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="bg-amber-500/10 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    BẮT BUỘC
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                    Kỹ thuật Tối ưu hóa Machine Learning.pdf
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">2023 • Khối 12 • 45 trang</p>
                <div className="flex items-center space-x-4 mt-2 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center space-x-1"><ThumbsUp className="w-3 h-3" /> <span>124 Hữu ích</span></span>
                  <span className="flex items-center space-x-1"><MessageSquare className="w-3 h-3" /> <span>32 Bình luận</span></span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer">
                <Eye className="w-3.5 h-3.5" />
                <span>Đọc trực tuyến</span>
              </button>
              <button className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                <Download className="w-3.5 h-3.5" />
                <span>Tải về</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500 shrink-0 mt-1 sm:mt-0">
                <PlayCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    THAM KHẢO
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                    Bài giảng 4: Mở rộng Cơ sở Hạ tầng Đám mây (Video)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">2024 • Nền tảng CNTT • 1h 20m</p>
                <div className="flex items-center space-x-4 mt-2 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center space-x-1"><ThumbsUp className="w-3 h-3" /> <span>89 Hữu ích</span></span>
                  <span className="flex items-center space-x-1"><MessageSquare className="w-3 h-3" /> <span>12 Bình luận</span></span>
                </div>
              </div>
            </div>

            <button className="w-full sm:w-auto flex items-center justify-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer">
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Xem ngay</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}