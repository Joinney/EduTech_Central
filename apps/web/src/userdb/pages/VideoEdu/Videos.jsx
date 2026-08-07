import React from "react"
import { 
  Play, 
  ThumbsUp, 
  Bookmark, 
  Share2, 
  Sparkles, 
  Download, 
  Check, 
  Zap, 
  MessageCircle, 
  ArrowRight 
} from "lucide-react"

export default function Videos() {
  const notes = [
    {
      time: "02:15",
      title: "Công thức cơ bản",
      content: "∫u dv = uv - ∫v du. Ghi nhớ quy tắc chọn u: \"Nhất log, nhì đa, tam lượng, tứ mũ\".",
    },
    {
      time: "12:30",
      title: "Ví dụ 1: Đa thức x Mũ",
      content: "Tính I = ∫x*e^x dx. Đặt u = x, dv = e^x dx.",
    },
    {
      time: "25:45",
      title: "Dạng lặp (Tích phân vòng)",
      content: "Thường gặp với hàm e^x và sin(x) hoặc cos(x)...",
    },
  ]

  const playlist = [
    {
      id: 1,
      title: "Bài 1: Khái niệm Nguyên hàm",
      duration: "28:15",
      status: "completed",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      title: "Bài 4: Tích phân từng phần",
      duration: "45:30",
      status: "playing",
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&auto=format&fit=crop&q=80",
    },
    {
      id: 3,
      title: "Bài 5: Ứng dụng tính diện tích",
      duration: "Chưa học",
      status: "upcoming",
      image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=300&auto=format&fit=crop&q=80",
    },
  ]

  const reels = [
    {
      id: 1,
      title: "Mẹo casio tính nhanh tích phân từng phần",
      views: "12k",
      author: "@ToanThayTuan",
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      title: "Thần chú chọn u, dv cực dễ nhớ",
      views: "8.5k",
      author: "@ToanThayTuan",
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80",
    },
    {
      id: 3,
      title: "Sai lầm chí mạng khi làm tích phân vòng",
      views: "5.2k",
      author: "@HocToanCungAI",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&auto=format&fit=crop&q=80",
    },
    {
      id: 4,
      title: "Sơ đồ tư duy chương Tích phân",
      views: "15k",
      author: "@ToanThayTuan",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 text-slate-800">
      
      {/* Breadcrumb */}
      <div className="text-xs font-semibold text-slate-400 space-x-1.5 flex items-center">
        <span>Video Edu</span>
        <span>&gt;</span>
        <span>Toán Học 12</span>
        <span>&gt;</span>
        <span>Giải tích: Tích phân từng phần</span>
      </div>

      {/* Main Grid: Player + Sidebar Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* CỘT TRÁI (2/3): Player Video & Thông tin bài giảng */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Trình phát Video màn hình chính */}
          <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden shadow-lg border border-slate-800 flex items-center justify-center group">
            <img 
              src="https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&auto=format&fit=crop&q=80" 
              alt="Video Thumbnail" 
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
            
            {/* Overlay mô phỏng nội dung bảng công thức toán */}
            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-md text-[10px] text-white font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Complex Integration: U-Substitution vs Polynomial Division</span>
            </div>

            {/* Nút Play trung tâm */}
            <button className="w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center shadow-2xl transition hover:scale-110 cursor-pointer z-10">
              <Play className="w-7 h-7 fill-white ml-1" />
            </button>
          </div>

          {/* Thông tin bài học & Nút tương tác */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded">
                    Toán 12
                  </span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded">
                    Đại số
                  </span>
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                  Bài 4: Kỹ thuật Tích phân từng phần cơ bản
                </h1>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                <button className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer">
                  <ThumbsUp className="w-4 h-4 text-slate-500" />
                  <span>1.2k</span>
                </button>
                <button className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer">
                  <Bookmark className="w-4 h-4 text-slate-500" />
                  <span>Lưu</span>
                </button>
                <button className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer">
                  <Share2 className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Hướng dẫn chi tiết phương pháp tính tích phân từng phần (u dv), mẹo chọn u và dv tối ưu cho các dạng toán thường gặp trong đề thi THPT Quốc gia.
            </p>

            {/* Thông tin Giảng viên */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Thầy Phạm Minh Tuấn"
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Thầy Phạm Minh Tuấn</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Giáo viên Toán chuyên</p>
                </div>
              </div>

              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer">
                Theo dõi
              </button>
            </div>
          </div>

        </div>

        {/* CỘT PHẢI (1/3): AI Ghi chú Tự động + Playlist Chương */}
        <div className="space-y-6">
          
          {/* Widget 1: AI Ghi chú Tự động */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-blue-600 font-extrabold text-sm">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>AI Ghi chú Tự động</span>
              </div>
              <button className="flex items-center space-x-1 text-[11px] font-bold text-slate-500 hover:text-blue-600 transition cursor-pointer">
                <span>Tải PDF</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Timestamps Notes List */}
            <div className="space-y-3">
              {notes.map((note, index) => (
                <div key={index} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1 hover:border-slate-200 transition">
                  <span className="inline-block bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                    {note.time}
                  </span>
                  <h5 className="font-bold text-xs text-slate-800">{note.title}</h5>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: Playlist Chương 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                Chương 3: Nguyên hàm & Tích phân
              </h4>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                4/12 Bài
              </span>
            </div>

            <div className="space-y-2">
              {playlist.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-2.5 rounded-xl border flex items-center space-x-3 transition cursor-pointer ${
                    item.status === "playing" 
                      ? "bg-blue-50/80 border-blue-200" 
                      : "bg-white border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="relative w-16 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    {item.status === "completed" && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h5 className={`font-bold text-xs truncate ${item.status === "playing" ? "text-blue-600" : "text-slate-800"}`}>
                      {item.title}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-medium">{item.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ================= SECTION BÊN DƯỚI: EduReels MẸO GIẢI NHANH ================= */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-900 font-black text-base">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>EduReels: Mẹo giải nhanh</span>
          </div>
          <a href="#reels" className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1">
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 4 Thẻ EduReels dạng dọc */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {reels.map((reel) => (
            <div key={reel.id} className="relative aspect-[9/16] rounded-2xl overflow-hidden group shadow-sm border border-slate-200/80 bg-slate-900 cursor-pointer">
              <img 
                src={reel.image} 
                alt={reel.title} 
                className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

              {/* View Badge trên cùng */}
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-white font-bold flex items-center space-x-1">
                <Play className="w-2.5 h-2.5 fill-white" />
                <span>{reel.views}</span>
              </div>

              {/* Nội dung bên dưới */}
              <div className="absolute bottom-3 left-3 right-3 space-y-1.5 text-white">
                <span className="text-[9px] font-extrabold uppercase bg-blue-600 px-1.5 py-0.5 rounded">
                  MATH HACK!
                </span>
                <h4 className="font-bold text-xs leading-snug line-clamp-2 drop-shadow-sm">
                  {reel.title}
                </h4>
                <p className="text-[10px] text-slate-300 font-medium opacity-80">
                  {reel.author}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}