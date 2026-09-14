import React, { useState } from "react";
import {
  Sparkles,
  Paperclip,
  Camera,
  Mic,
  ArrowUp,
  BookOpen,
  FileText,
  Edit3,
  ListChecks,
  ChevronDown,
  GraduationCap
} from "lucide-react";

export default function TroLyAIPage() {
  const [inputMessage, setInputMessage] = useState("");

  const promptSuggestions = [
    {
      icon: BookOpen,
      iconBg: "bg-indigo-50 text-indigo-500",
      title: "Giải chi tiết bài toán tích phân",
      desc: "Từng bước phương pháp đổi biến, vi phân",
      prompt: "Hãy hướng dẫn giải chi tiết bài toán tích phân theo từng bước: phương pháp đổi biến số và vi phân.",
    },
    {
      icon: FileText,
      iconBg: "bg-emerald-50 text-emerald-500",
      title: "Tóm tắt chương tài liệu PDF",
      desc: "Rút gọn ý chính, công thức cốt lõi",
      prompt: "Hãy tóm tắt ngắn gọn các ý chính và công thức cốt lõi của chương tài liệu này.",
    },
    {
      icon: Edit3,
      iconBg: "bg-amber-50 text-amber-500",
      title: "Kiểm tra lỗi ngữ pháp bài luận",
      desc: "Sửa văn phong IELTS, nâng cấp collocation",
      prompt: "Sửa lỗi ngữ pháp và nâng cấp từ vựng, collocations chuẩn văn phong IELTS cho bài luận sau:",
    },
    {
      icon: ListChecks,
      iconBg: "bg-purple-50 text-purple-500",
      title: "Tạo bộ 10 câu trắc nghiệm ôn tập",
      desc: "Kèm đáp án và giải thích tường tận",
      prompt: "Tạo 10 câu trắc nghiệm ôn tập kèm đáp án và giải thích chi tiết cho tôi.",
    },
  ];

  const handleSend = (text) => {
    const query = text || inputMessage;
    if (!query.trim()) return;
    console.log("Gửi câu hỏi:", query);
    setInputMessage("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] w-full bg-white font-sans text-slate-800 antialiased overflow-hidden select-none">
      
      {/* 1. KHU VỰC TRUNG TÂM (CÓ THỂ CUỘN NẾU MÀN HÌNH NHỎ) */}
      <div className="flex-1 overflow-y-auto flex flex-col p-4 md:p-6 w-full custom-scrollbar">
        <div className="flex flex-col items-center max-w-2xl mx-auto w-full text-center space-y-6 md:space-y-8 my-auto py-4 md:py-8 animate-in fade-in duration-300">
          
          <div className="relative shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/25 border-2 border-white">
              <GraduationCap className="w-6 h-6 md:w-7 md:h-7 stroke-[2.2]" />
            </div>
            <span className="w-3.5 h-3.5 md:w-4 md:h-4 bg-amber-400 border-2 border-white rounded-full absolute -top-1 -right-1 flex items-center justify-center shadow-xs">
              <Sparkles className="w-2 h-2 md:w-2.5 md:h-2.5 text-white fill-white" />
            </span>
          </div>

          <div className="space-y-2.5 px-2">
            <h1 className="text-xl sm:text-2xl md:text-[28px] font-extrabold text-slate-900 tracking-tight leading-snug">
              EduTech AI có thể giúp gì cho việc học<br className="hidden sm:block" />của bạn hôm nay?
            </h1>
            <p className="text-[11px] sm:text-xs md:text-[13px] text-slate-500 max-w-lg mx-auto leading-relaxed">
              Hỏi bất kỳ bài toán, tải tài liệu PDF để phân tích, hoặc kiểm tra và củng cố kiến thức theo giáo trình THPT & Đại học.
            </p>
          </div>

          {/* Lưới Thẻ gợi ý responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
            {promptSuggestions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(item.prompt)}
                  className="p-3 md:p-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-xs transition-all flex items-start space-x-3 bg-white text-left cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <div className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-110 ${item.iconBg}`}>
                    <Icon className="w-4 h-4 md:w-4.5 md:h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] md:text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5 md:mt-1 line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. THANH NHẬP LIỆU GẮN ĐÁY (KHÔNG BAO GIỜ BỊ CHE KHUẤT) */}
      <div className="shrink-0 w-full bg-white border-t border-transparent px-4 sm:px-6 pb-4 md:pb-6 pt-2">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="rounded-3xl border border-slate-200/90 shadow-sm hover:border-slate-300 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all bg-white px-3 sm:px-4 pt-2.5 sm:pt-3 pb-2 flex flex-col space-y-1.5 sm:space-y-2">
            
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Hỏi AI bất kỳ điều gì, dán đề bài..."
              className="w-full bg-transparent border-none outline-none text-[13px] sm:text-sm text-slate-800 placeholder:text-slate-400 py-1 sm:py-1.5 min-w-0"
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              
              {/* Cụm công cụ bên trái (Wrap mượt mà trên mobile) */}
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-slate-400">
                <button
                  type="button"
                  title="Đính kèm tệp"
                  className="p-1.5 sm:p-2 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
                >
                  <Paperclip className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>
                <button
                  type="button"
                  title="Scan hình ảnh"
                  className="p-1.5 sm:p-2 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
                >
                  <Camera className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>

                <div className="inline-flex items-center space-x-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full bg-slate-50 text-[10px] sm:text-[11px] font-medium text-slate-600 border border-slate-100 ml-1 cursor-pointer hover:bg-slate-100 transition truncate max-w-[140px] sm:max-w-none">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500 fill-blue-500 shrink-0" />
                  <span className="truncate">EduTech 4.5 Turbo</span>
                  <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
                </div>
              </div>

              {/* Cụm nút bên phải */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  title="Nhập giọng nói"
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
                >
                  <Mic className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </button>
                <button
                  type="button"
                  disabled={!inputMessage.trim()}
                  onClick={() => handleSend()}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#0f172a] hover:bg-blue-600 disabled:bg-slate-200 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
                >
                  <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

            </div>
          </div>

          <p className="text-[9px] sm:text-[10px] text-slate-400 text-center select-none px-2 leading-tight">
            EduTech AI có thể đưa ra kết quả chưa chính xác. Hãy kiểm tra lại các công thức và tài liệu quan trọng.
          </p>
        </div>
      </div>

    </div>
  );
}