import React, { useState } from "react";
import { 
  Sparkles, 
  Paperclip, 
  Camera, 
  ChevronDown, 
  ArrowRight, 
  CheckCircle2, 
  FileDown, 
  BookOpen, 
  Clock, 
  AlertCircle,
  FileText,
  Layers,
  ChevronRight,
  Calculator
} from "lucide-react";

export default function TroLyAIPage() {
  const [filter, setFilter] = useState("all");
  const [inputContent, setInputContent] = useState("");

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. HERO & INPUT PROMPT BOX */}
      <section className="bg-gradient-to-b from-blue-50/60 via-white to-white rounded-3xl border border-blue-100/80 p-6 md:p-10 shadow-xs relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-blue-400/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-3xl mx-auto text-center space-y-3">
          {/* Version badge */}
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/80 px-3.5 py-1 rounded-full text-blue-600 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
            <span>Trợ lý AI Thế hệ mới • Model EduTech 4.5 Turbo</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Hôm nay bạn cần trợ giúp bài học nào?
          </h1>
          <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Chụp ảnh bài tập, dán đề bài toán, phân tích tài liệu PDF hoặc tạo trắc nghiệm củng cố kiến thức trong vài giây.
          </p>

          {/* Large Prompt Input Box */}
          <div className="pt-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all p-4 text-left space-y-4">
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="Nhập đề bài, dán hình ảnh hoặc tải file PDF/Word để AI giải thích từng bước..."
                rows={3}
                className="w-full resize-none border-none outline-none text-xs md:text-sm text-slate-800 placeholder:text-slate-400 leading-relaxed bg-transparent"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                {/* Action Buttons Group */}
                <div className="flex items-center flex-wrap gap-2 text-xs text-slate-600 font-medium">
                  <button 
                    type="button" 
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-purple-500" />
                    <span>Đính kèm tệp / PDF</span>
                  </button>

                  <button 
                    type="button" 
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Scan ảnh đề bài</span>
                  </button>

                  <div className="relative inline-flex items-center">
                    <button 
                      type="button" 
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                    >
                      <span>Môn: Tự động phát hiện</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="button"
                  className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/30 transition-all cursor-pointer"
                >
                  <span>Giải đáp ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN WORKSPACE (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: Activity Logs & Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Header & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Phiên làm việc & Lời giải gần đây
              </h2>
              <p className="text-xs text-slate-500">
                Các kết quả học tập và tài liệu AI đã phân tích cho bạn
              </p>
            </div>

            {/* Filter Pills */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 text-[11px] font-semibold text-slate-600 self-start sm:self-auto">
              <button 
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${filter === "all" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"}`}
              >
                Tất cả
              </button>
              <button 
                onClick={() => setFilter("math")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${filter === "math" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"}`}
              >
                Giải toán
              </button>
              <button 
                onClick={() => setFilter("doc")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${filter === "doc" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"}`}
              >
                Tóm tắt tài liệu
              </button>
              <button 
                onClick={() => setFilter("quiz")}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${filter === "quiz" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"}`}
              >
                Flashcard & Đề thi
              </button>
            </div>
          </div>

          {/* CARD 1: Toán học (Giải tích) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-bold border border-blue-100">
                  Toán 12 • Giải tích ôn thi THPT Quốc Gia
                </span>
                <span className="text-[11px] text-slate-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1 inline" /> 14 phút trước
                </span>
              </div>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                <CheckCircle2 className="w-3 h-3" />
                <span>Hoàn thành 100%</span>
              </span>
            </div>

            <h3 className="font-bold text-sm text-slate-900">
              Giải bài toán tích phân hàm ẩn nâng cao chứa điều kiện f(x) + 2x·f(x²)
            </h3>

            {/* Prompt Preview block */}
            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 font-mono border border-slate-100 leading-relaxed">
              <span className="font-bold text-slate-900">Đề bài: </span>
              Cho hàm số f(x) liên tục trên [0; 1] thỏa mãn f(x) + 2x·f(x²) = √(1 - x²). Tính giá trị I = ∫[0→1] f(x) dx.
            </div>

            {/* Steps Breakdown */}
            <div className="space-y-2.5 pt-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                CÁC BƯỚC GIẢI CỦA EDUTECH AI:
              </div>

              {/* Step 1 */}
              <div className="bg-white rounded-xl border border-slate-100 p-3 space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[10px] flex items-center justify-center">1</span>
                  <span>Lấy tích phân hai vế: Tích phân cận từ 0 đến 1 cả hai vế:</span>
                </div>
                <div className="pl-6 text-xs text-slate-600 font-mono">
                  ∫[0→1] f(x) dx + 2·∫[0→1] x·f(x²) dx = ∫[0→1] √(1 - x²) dx
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl border border-slate-100 p-3 space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[10px] flex items-center justify-center">2</span>
                  <span>Đổi biến số tích phân thứ hai: Đặt t = x² ⇒ dt = 2x dx. Với x=0 ⇒ t=0; x=1 ⇒ t=1.</span>
                </div>
                <div className="pl-6 text-xs text-slate-600 font-mono">
                  Suy ra: 2·∫[0→1] x·f(x²) dx = ∫[0→1] f(t) dt = I.
                </div>
              </div>

              {/* Step Final */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-900 font-medium flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <b>Kết luận đáp án:</b> I + I = 2I = π/4 (diện tích 1/4 hình tròn bán kính 1). Suy ra <b className="underline">I = π/8</b>.
                </span>
              </div>
            </div>

            {/* Footer Tags & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                <span className="px-2 py-1 bg-slate-100 rounded-md">Đổi biến số tích phân</span>
                <span className="px-2 py-1 bg-slate-100 rounded-md">Lượng giác hóa x = sin(t)</span>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  type="button" 
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>Xuất PDF</span>
                </button>
                <button 
                  type="button" 
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold cursor-pointer"
                >
                  <span>Luyện bài tương tự</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* CARD 2: Sinh học (Tóm tắt tài liệu) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-bold border border-emerald-100">
                  Sinh học 12 • Di truyền học phân tử
                </span>
                <span className="text-[11px] text-slate-400 flex items-center">
                  <Clock className="w-3 h-3 mr-1 inline" /> 2 giờ trước
                </span>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold border border-indigo-100">
                Sơ đồ tư duy & 15 Câu trắc nghiệm
              </span>
            </div>

            <h3 className="font-bold text-sm text-slate-900">
              Tóm tắt trọng tâm: Quá trình nhân đôi ADN, Phiên mã & Dịch mã ở Sinh vật nhân sơ và nhân thực
            </h3>

            {/* Grid Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Các enzym then chốt cần ghi nhớ</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  • <b>Helicase:</b> Tháo xoắn và tách mạch kép ADN.<br />
                  • <b>ADN Polymerase:</b> Tổng hợp mạch mới theo chiều 5&apos; → 3&apos;.<br />
                  • <b>Ligase:</b> Nối các đoạn Okazaki mạch ngắt quãng.
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  <span>Điểm khác biệt trọng tâm thi TN THPT</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  • Nhân sơ: 1 điểm khởi đầu tái bản (ori).<br />
                  • Nhân thực: Nhiều đơn vị tái bản, có giai đoạn cắt intron.<br />
                  • Nguyên tắc: Bán bảo tồn & bổ sung (A-T, G-X).
                </p>
              </div>
            </div>

            {/* Footer attachment & CTA */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                <Paperclip className="w-3.5 h-3.5" />
                <span>Tệp đính kèm:</span>
                <span className="text-blue-600 font-medium underline cursor-pointer">SinhHoc12_Ch4_DiTruyen.pdf</span>
                <span>(45 trang)</span>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  type="button" 
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Mở sơ đồ tư duy
                </button>
                <button 
                  type="button" 
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold cursor-pointer"
                >
                  Làm 15 câu ôn tập ngay
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Diagnosis & Quick Documents */}
        <div className="space-y-6">
          {/* Card: Chẩn đoán điểm yếu kiến thức */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <h3 className="font-bold text-xs text-slate-900">
                  Chẩn đoán điểm yếu kiến thức
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold">
                AI Insights
              </span>
            </div>
            <p className="text-[11px] text-slate-500 -mt-2">
              Phân tích từ 15 bài giải gần nhất
            </p>

            {/* Weakness Item 1 */}
            <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Cực trị hàm chứa dấu trị tuyệt đối</span>
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-extrabold text-[10px]">
                  Sai 42%
                </span>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Bạn thường quên xét đạo hàm tại điểm gãy hàm số |f(x)|.
              </p>
              <button 
                type="button" 
                className="text-[11px] font-bold text-red-600 hover:text-red-700 inline-flex items-center cursor-pointer"
              >
                <span>Luyện 5 câu bù lỗ hổng</span>
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            {/* Weakness Item 2 */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Dao động cơ & Con lắc lò xo</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-extrabold text-[10px]">
                  Cần cải thiện
                </span>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Thời gian bấm máy tính Casio dạng phương trình dao động đang chậm hơn trung bình.
              </p>
              <button 
                type="button" 
                className="text-[11px] font-bold text-amber-700 hover:text-amber-800 inline-flex items-center cursor-pointer"
              >
                <span>Xem mẹo bấm Casio 580VNX</span>
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>

            {/* Daily Practice CTA Box */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-3.5 text-white flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs">Đề xuất ôn luyện hôm nay</h4>
                <p className="text-[10px] text-blue-100">Bài kiểm tra vi mô 5 phút (5 câu)</p>
              </div>
              <button 
                type="button" 
                className="px-3 py-1.5 bg-white text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-2xs cursor-pointer"
              >
                Bắt đầu
              </button>
            </div>
          </div>

          {/* Card: Tài liệu vừa mở */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-xs text-slate-900">
                  Tài liệu vừa mở
                </h3>
              </div>
              <button 
                type="button" 
                className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            {/* Doc Item 1 */}
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                  PDF
                </span>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 truncate">
                    De_Thi_Thu_Mon_Toan_2026.pdf
                  </h5>
                  <p className="text-[10px] text-slate-400 truncate">
                    50 câu • Đã giải 28 câu
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-bold shrink-0 ml-2 cursor-pointer"
              >
                Tóm tắt AI
              </button>
            </div>

            {/* Doc Item 2 */}
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                  DOC
                </span>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 truncate">
                    IELTS_Writing_Task2_Band7.docx
                  </h5>
                  <p className="text-[10px] text-slate-400 truncate">
                    Từ vựng C1-C2 theo topic
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 text-[11px] font-bold shrink-0 ml-2 cursor-pointer"
              >
                Tóm tắt AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}