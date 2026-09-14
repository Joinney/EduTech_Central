import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Upload, 
  Plus, 
  Search, 
  ChevronDown, 
  LayoutGrid, 
  Star, 
  Download, 
  Trash2, 
  ArrowRight, 
  ChevronRight,
  Sparkles,
  Paperclip,
  RotateCcw
} from "lucide-react";

export default function ChatHistoryPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Tất cả các môn");
  const [selectedType, setSelectedType] = useState("Tất cả loại");
  const [selectedTime, setSelectedTime] = useState("Mọi lúc");

  // Dữ liệu danh sách các phiên học
  const [sessions, setSessions] = useState([
    {
      id: "chat-1",
      group: "HÔM NAY",
      subject: "Toán học 12",
      model: "EduTech 4.5 Turbo",
      messageCount: 12,
      updatedAt: "25 phút trước",
      starred: true,
      title: "Giải tích phân hàm ẩn nâng cao f(x)",
      status: "ĐÃ HOÀN THÀNH GIẢI",
      statusColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
      aiPreview: "Để tìm nguyên hàm của f(x) thỏa mãn điều kiện 2f(x) + 3f(1-x) = x², ta thực hiện phương pháp thế biến t = 1 - x để lập hệ phương trình hai ẩn hàm f(x) và f(1-x)...",
      actionType: "chat",
      actionLabel: "Tiếp tục chat"
    },
    {
      id: "chat-2",
      group: "HÔM NAY",
      subject: "Sinh học 12",
      attachment: "SinhHoc12_Ch4.pdf (2.4 MB)",
      messageCount: 8,
      updatedAt: "3 giờ trước",
      starred: false,
      title: "Tóm tắt di truyền học & ADN Sinh 12",
      aiPreview: "Các enzym tháo xoắn Helicase, DNA Polymerase tổng hợp mạch mới theo chiều 5' -> 3'. Mạch khuôn 3' -> 5' tổng hợp liên tục, mạch khuôn 5' -> 3' tổng hợp ngắt quãng tạo các đoạn Okazaki...",
      actionType: "review",
      actionLabel: "Xem lại kết quả"
    },
    {
      id: "chat-3",
      group: "7 NGÀY TRƯỚC",
      subject: "Toán học 12",
      badge: "Bộ 50 câu trắc nghiệm",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-100",
      result: "Kết quả: 46/50 câu đúng",
      updatedAt: "4 ngày trước",
      starred: true,
      title: "Đề thi thử Toán THPT Quốc Gia Số 08",
      aiPreview: "Phân tích các câu hỏi phân loại 8+: Phương trình logarit chứa tham số m, hình học không gian tính góc giữa hai mặt phẳng, và cực trị số phức...",
      actionType: "retry",
      actionLabel: "Làm lại đề thi"
    },
    {
      id: "chat-4",
      group: "7 NGÀY TRƯỚC",
      subject: "Tiếng Anh IELTS",
      badge: "Chữa lỗi ngữ pháp & Lexical Resource",
      badgeColor: "bg-slate-100 text-slate-600",
      result: "Ước tính Band: 7.5",
      updatedAt: "5 ngày trước",
      starred: false,
      title: "Bài luận Task 2: Urbanization & Environmental Impact",
      aiPreview: "Phân tích cấu trúc câu phức, nâng cấp collocations và chỉnh sửa cách liên kết đoạn theo tiêu chuẩn Coherence & Cohesion band 7.5+...",
      actionType: "review",
      actionLabel: "Xem lại bài sửa"
    }
  ]);

  // Bật/tắt trạng thái gắn sao
  const toggleStar = (id) => {
    setSessions(prev =>
      prev.map(item => item.id === id ? { ...item, starred: !item.starred } : item)
    );
  };

  // Xóa một phiên học khỏi danh sách
  const deleteSession = (id) => {
    setSessions(prev => prev.filter(item => item.id !== id));
  };

  // Điều hướng sang trang chat hoặc tải lại phiên
  const handleNavigateChat = (sessionId) => {
    const role = localStorage.getItem("role") || "student";
    navigate(`/${role.toLowerCase()}/ai-assistant${sessionId ? `?session=${sessionId}` : ""}`);
  };

  // Lọc theo từ khóa tìm kiếm
  const filteredSessions = sessions.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.aiPreview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todaySessions = filteredSessions.filter(item => item.group === "HÔM NAY");
  const pastSessions = filteredSessions.filter(item => item.group === "7 NGÀY TRƯỚC");

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 space-y-6 max-w-6xl mx-auto font-sans antialiased text-slate-800 select-none">
      {/* 1. HEADER: TIÊU ĐỀ & NÚT THAO TÁC */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Lịch sử trò chuyện & Phiên học AI
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Xem lại tất cả các phiên hỏi đáp bài học, lời giải chi tiết và tài liệu đã phân tích cùng EduTech AI.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button 
            type="button" 
            onClick={() => alert("Tính năng xuất báo cáo PDF/MD đang được xử lý!")}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất tất cả (PDF/MD)</span>
          </button>

          <button 
            type="button" 
            onClick={() => handleNavigateChat()}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#5252f8] hover:bg-[#4343e8] text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo phiên hỏi mới</span>
          </button>
        </div>
      </div>

      {/* 2. STATS PILLS: THỐNG KÊ TỔNG QUAN */}
      <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-medium text-slate-600">
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Tổng: <b>{sessions.length} cuộc hội thoại</b></span>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span><b>{sessions.filter(s => s.starred).length} Đã gắn sao</b></span>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span><b>1.4k Tin nhắn & Lời giải</b></span>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span><b>19 Tệp tài liệu ôn tập</b></span>
        </div>
      </div>

      {/* 3. BỘ LỌC & Ô TÌM KIẾM */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 space-y-3 shadow-2xs">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm lịch sử cuộc trò chuyện, bài toán, tài liệu đã phân tích..."
            className="w-full bg-slate-50/70 rounded-xl pl-9 pr-16 py-2 text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200/60 focus:bg-white focus:border-blue-400 focus:outline-none transition"
          />
          <span className="absolute right-3 text-[10px] text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono">
            Ctrl + K
          </span>
        </div>

        {/* Dropdowns Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button 
              type="button" 
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-600 cursor-pointer"
            >
              <span>Môn học: <b>{selectedSubject}</b></span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            <button 
              type="button" 
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-600 cursor-pointer"
            >
              <span>Loại phiên: <b>{selectedType}</b></span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            <button 
              type="button" 
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-600 cursor-pointer"
            >
              <span>Thời gian: <b>{selectedTime}</b></span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Hiển thị <b>{filteredSessions.length}</b> trên <b>{sessions.length}</b> phiên</span>
            <button type="button" className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. SECTION: HÔM NAY */}
      {todaySessions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
              HÔM NAY <span className="text-slate-400 font-normal lowercase">({todaySessions.length} phiên thảo luận)</span>
            </h2>
          </div>

          {todaySessions.map((session) => (
            <div key={session.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-blue-200 transition space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${session.subject.includes("Sinh") ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                    {session.subject}
                  </span>

                  {session.model && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-blue-500" /> {session.model}
                    </span>
                  )}

                  {session.attachment && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-100 text-[10px] font-semibold flex items-center gap-1">
                      <Paperclip className="w-2.5 h-2.5" /> {session.attachment}
                    </span>
                  )}

                  <span className="text-[11px] text-slate-400">
                    • {session.messageCount} tin nhắn • Cập nhật {session.updatedAt}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-slate-400">
                  <button 
                    type="button" 
                    onClick={() => toggleStar(session.id)}
                    className="p-1 hover:text-amber-400 transition cursor-pointer"
                  >
                    <Star className={`w-3.5 h-3.5 ${session.starred ? "fill-amber-400 text-amber-400" : "text-slate-400"}`} />
                  </button>
                  <button type="button" className="p-1 hover:text-slate-600 transition cursor-pointer">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => deleteSession(session.id)}
                    className="p-1 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {session.title}
                  </h3>
                  {session.status && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${session.statusColor}`}>
                      {session.status}
                    </span>
                  )}
                </div>

                {session.actionType === "chat" ? (
                  <button 
                    type="button" 
                    onClick={() => handleNavigateChat(session.id)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#5252f8] hover:bg-[#4343e8] text-white text-xs font-semibold shadow-2xs self-start sm:self-auto cursor-pointer"
                  >
                    <span>{session.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => handleNavigateChat(session.id)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs self-start sm:self-auto cursor-pointer"
                  >
                    <span>{session.actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] text-slate-600 leading-relaxed border border-slate-100">
                <b className="text-slate-700">EduTech AI:</b> &ldquo;{session.aiPreview}&rdquo;
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. SECTION: 7 NGÀY TRƯỚC */}
      {pastSessions.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
              7 NGÀY TRƯỚC <span className="text-slate-400 font-normal lowercase">({pastSessions.length} phiên thảo luận)</span>
            </h2>
          </div>

          {pastSessions.map((session) => (
            <div key={session.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-blue-200 transition space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${session.subject.includes("Toán") ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"}`}>
                    {session.subject}
                  </span>

                  {session.badge && (
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-semibold ${session.badgeColor}`}>
                      {session.badge}
                    </span>
                  )}

                  <span className="text-[11px] text-slate-400">
                    {session.result ? `• ${session.result} • ` : "• "} {session.updatedAt}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-slate-400">
                  <button 
                    type="button" 
                    onClick={() => toggleStar(session.id)}
                    className="p-1 hover:text-amber-400 transition cursor-pointer"
                  >
                    <Star className={`w-3.5 h-3.5 ${session.starred ? "fill-amber-400 text-amber-400" : "text-slate-400"}`} />
                  </button>
                  <button type="button" className="p-1 hover:text-slate-600 transition cursor-pointer">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => deleteSession(session.id)}
                    className="p-1 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {session.title}
                </h3>

                {session.actionType === "retry" ? (
                  <button 
                    type="button" 
                    onClick={() => handleNavigateChat(session.id)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs self-start sm:self-auto cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>{session.actionLabel}</span>
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => handleNavigateChat(session.id)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs self-start sm:self-auto cursor-pointer"
                  >
                    <span>{session.actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] text-slate-600 leading-relaxed border border-slate-100">
                {session.aiPreview}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}