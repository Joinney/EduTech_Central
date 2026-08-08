import React from "react"
import { Sparkles, GraduationCap, ArrowRight, SlidersHorizontal, LayoutGrid } from "lucide-react"

export default function Programs() {
  const grades = [
    {
      id: 10,
      title: "Khối 10",
      tag: "Khởi đầu",
      tagBg: "bg-white/80 text-slate-700",
      numberColor: "text-slate-300",
      cardHeaderBg: "bg-gradient-to-br from-slate-200 to-slate-100",
      description: "Xây dựng nền tảng vững chắc với các môn học cơ bản và định hướng năng lực ban đầu.",
      subjectCount: "12 Môn học",
      isCurrent: false,
    },
    {
      id: 11,
      title: "Khối 11",
      tag: "Tăng tốc",
      tagBg: "bg-white/80 text-amber-800",
      numberColor: "text-amber-200/80",
      cardHeaderBg: "bg-gradient-to-br from-amber-100/80 to-amber-50/50",
      description: "Đi sâu vào kiến thức chuyên môn, chuẩn bị cho các kỳ thi học sinh giỏi và chứng chỉ.",
      subjectCount: "14 Môn học",
      isCurrent: false,
    },
    {
      id: 12,
      title: "Khối 12",
      tag: "Lớp hiện tại",
      tagBg: "bg-blue-600 text-white font-bold",
      numberColor: "text-blue-300/80",
      cardHeaderBg: "bg-gradient-to-br from-blue-200/80 to-slate-100",
      description: "Ôn thi THPT Quốc gia cường độ cao, luyện đề và chiến thuật phòng thi tối ưu.",
      subjectCount: "9 Môn trọng tâm",
      isCurrent: true,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Chương trình & Khối lớp</h1>
        <p className="text-xs font-medium text-slate-500">
          Khám phá các lộ trình học tập được thiết kế riêng cho khối Trung học Phổ thông, với sự hỗ trợ từ AI.
        </p>
      </div>

      {/* AI Recommendation Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-50 via-slate-50 to-blue-100/60 p-8 border border-blue-100/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
        
        {/* Left Content */}
        <div className="max-w-xl space-y-4">
          <div className="inline-flex items-center space-x-1.5 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
            <span>Lộ Trình AI Đề Xuất</span>
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Tối ưu hóa hành trình Lớp 12 của bạn
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Dựa trên kết quả học tập và mục tiêu thi đại học Khối A00, AI đề xuất tập trung vào Toán, Vật Lý và Hóa Học nâng cao trong học kỳ này.
          </p>

          <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 cursor-pointer">
            Xem chi tiết lộ trình
          </button>
        </div>

        {/* Right Icon Graphic */}
        <div className="shrink-0 flex items-center justify-center">
          <div className="w-36 h-36 rounded-full border-4 border-amber-300/80 bg-blue-50 flex items-center justify-center p-2 shadow-inner">
            <div className="w-full h-full rounded-full border-2 border-blue-200 flex items-center justify-center bg-white shadow-sm">
              <GraduationCap className="w-16 h-16 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Section List Header */}
      <div className="flex items-center justify-between pt-2">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Khối Lớp THPT</h2>
        <div className="flex items-center space-x-2">
          <button className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition cursor-pointer">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition cursor-pointer">
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {grades.map((grade) => (
          <div
            key={grade.id}
            className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md ${
              grade.isCurrent ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200/80"
            }`}
          >
            {/* Card Header (Graphic Background + Tag + Big Number) */}
            <div className={`relative h-44 p-4 flex flex-col justify-between ${grade.cardHeaderBg}`}>
              <div className="flex justify-end">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-sm ${grade.tagBg}`}>
                  {grade.tag}
                </span>
              </div>
              <div className={`text-6xl font-black tracking-tighter ${grade.numberColor}`}>
                {grade.id}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-slate-900">{grade.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {grade.description}
                </p>
              </div>

              {/* Card Footer Info */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600">{grade.subjectCount}</span>
                <button className="p-2 rounded-xl text-blue-600 group-hover:bg-blue-50 transition cursor-pointer">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}