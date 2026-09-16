import React, { useState, useEffect } from "react";
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
  RotateCcw,
  Loader2
} from "lucide-react";

export default function ChatHistoryPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Tất cả các môn");
  const [selectedType, setSelectedType] = useState("Tất cả loại");
  const [selectedTime, setSelectedTime] = useState("Mọi lúc");

<<<<<<< HEAD
  // State lưu lịch sử thật từ Database thay vì dữ liệu cứng
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // URL gọi tới Backend FastAPI
  const API_URL = import.meta.env.VITE_API_AI_URL || "http://localhost:8000/api/v1/ai";

  // 🎯 GỌI API LẤY LỊCH SỬ TỪ MONGODB
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/chat/history?user_id=guest`);
        const data = await res.json();
        
        if (data.success) {
          // Lấy ngày hôm nay định dạng dd/mm/yyyy để so sánh
=======
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_AI_URL || "http://localhost:8000/api/v1/ai";

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const userId = currentUser.id || currentUser._id || currentUser.uid || currentUser.userId || currentUser.email || currentUser.fullName || currentUser.full_name || "guest";

        const res = await fetch(`${API_URL}/chat/history?user_id=${userId}`);
        const data = await res.json();
        
        if (data.success) {
>>>>>>> 4070cbbc0b9ec0611d0d9c4ec0049c93f43b83d7
          const todayString = new Date().toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
          });

<<<<<<< HEAD
          // Map lại data từ Database cho khớp với UI
          const formattedSessions = data.data.map(s => {
            const isToday = s.time && s.time.includes(todayString);
            
            // Trích xuất tin nhắn làm preview (Ưu tiên lấy tin nhắn cuối cùng)
=======
          const formattedSessions = data.data.map(s => {
            const isToday = s.time && s.time.includes(todayString);
            
>>>>>>> 4070cbbc0b9ec0611d0d9c4ec0049c93f43b83d7
            let previewText = "Chưa có nội dung";
            if (s.messages && s.messages.length > 0) {
              const lastMsg = s.messages[s.messages.length - 1].content;
              previewText = typeof lastMsg === 'string' 
                ? (lastMsg.length > 150 ? lastMsg.substring(0, 150) + "..." : lastMsg)
                : "[Nội dung hình ảnh/file]";
            }

            return {
              id: s.id,
              group: isToday ? "HÔM NAY" : "CÁC NGÀY TRƯỚC",
              subject: s.subject || "Chung",
              model: "EduTech AI", 
              messageCount: s.messages ? s.messages.length : 0,
              updatedAt: s.time || "Gần đây",
              starred: false,
              title: s.title || "Phiên học chưa đặt tên",
              status: "ĐÃ LƯU",
              statusColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
              aiPreview: previewText,
              actionType: "chat",
              actionLabel: "Tiếp tục chat"
            };
          });
          
          setSessions(formattedSessions);
        }
      } catch (error) {
        console.error("Lỗi khi tải lịch sử:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, []);

  const toggleStar = (id) => {
    setSessions(prev =>
      prev.map(item => item.id === id ? { ...item, starred: !item.starred } : item)
    );
  };

  const deleteSession = (id) => {
    setSessions(prev => prev.filter(item => item.id !== id));
    // Lưu ý: Có thể gọi thêm API DELETE tới backend ở đây trong tương lai
  };

<<<<<<< HEAD
  // 🎯 ĐIỀU HƯỚNG VÀ TRUYỀN ID SANG TRANG CHAT AI
=======
>>>>>>> 4070cbbc0b9ec0611d0d9c4ec0049c93f43b83d7
  const handleNavigateChat = (sessionId) => {
    const role = localStorage.getItem("role") || "student";
    navigate(`/${role.toLowerCase()}/ai-assistant${sessionId ? `?session=${sessionId}` : ""}`);
  };

  const filteredSessions = sessions.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.aiPreview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todaySessions = filteredSessions.filter(item => item.group === "HÔM NAY");
  const pastSessions = filteredSessions.filter(item => item.group === "CÁC NGÀY TRƯỚC");

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 space-y-6 max-w-6xl mx-auto font-sans antialiased text-slate-800 select-none">
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

      <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-medium text-slate-600">
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span>Tổng: <b>{sessions.length} cuộc hội thoại</b></span>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-slate-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span><b>{sessions.filter(s => s.starred).length} Đã gắn sao</b></span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 space-y-3 shadow-2xs">
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

<<<<<<< HEAD
      {/* Hiển thị Loading khi đang kéo dữ liệu từ Database */}
=======
>>>>>>> 4070cbbc0b9ec0611d0d9c4ec0049c93f43b83d7
      {loading && (
        <div className="flex justify-center items-center py-12">
           <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

<<<<<<< HEAD
      {/* 4. SECTION: HÔM NAY */}
=======
>>>>>>> 4070cbbc0b9ec0611d0d9c4ec0049c93f43b83d7
      {!loading && todaySessions.length > 0 && (
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

                <button 
                  type="button" 
                  onClick={() => handleNavigateChat(session.id)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#5252f8] hover:bg-[#4343e8] text-white text-xs font-semibold shadow-2xs self-start sm:self-auto cursor-pointer"
                >
                  <span>{session.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] text-slate-600 leading-relaxed border border-slate-100">
                <b className="text-slate-700">EduTech AI:</b> &ldquo;{session.aiPreview}&rdquo;
              </div>
            </div>
          ))}
        </div>
      )}

<<<<<<< HEAD
      {/* 5. SECTION: CÁC NGÀY TRƯỚC */}
=======
>>>>>>> 4070cbbc0b9ec0611d0d9c4ec0049c93f43b83d7
      {!loading && pastSessions.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
              CÁC NGÀY TRƯỚC <span className="text-slate-400 font-normal lowercase">({pastSessions.length} phiên thảo luận)</span>
            </h2>
          </div>

          {pastSessions.map((session) => (
            <div key={session.id} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:border-blue-200 transition space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${session.subject.includes("Toán") ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"}`}>
                    {session.subject}
                  </span>

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
<<<<<<< HEAD
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    {session.title}
                  </h3>
                </div>

                <button 
                  type="button" 
                  onClick={() => handleNavigateChat(session.id)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs self-start sm:self-auto cursor-pointer"
                >
                  <span>{session.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
=======
                <h3 className="text-sm font-bold text-slate-900">
                  {session.title}
                </h3>
                <button 
                  type="button" 
                  onClick={() => handleNavigateChat(session.id)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs self-start sm:self-auto cursor-pointer"
                >
                  <span>{session.actionLabel}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
>>>>>>> 4070cbbc0b9ec0611d0d9c4ec0049c93f43b83d7
                </button>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] text-slate-600 leading-relaxed border border-slate-100">
                <b className="text-slate-700">EduTech AI:</b> &ldquo;{session.aiPreview}&rdquo;
              </div>
            </div>
          ))}
        </div>
      )}
<<<<<<< HEAD
      
      {!loading && sessions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400 text-sm">Chưa có lịch sử phiên học nào được lưu lại.</p>
=======

      {!loading && sessions.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Chưa có dữ liệu lịch sử</h3>
          <p className="text-slate-400 text-xs mt-1">Hãy bắt đầu một cuộc trò chuyện với EduTech AI để xem lịch sử tại đây.</p>
>>>>>>> 4070cbbc0b9ec0611d0d9c4ec0049c93f43b83d7
        </div>
      )}
    </div>
  );
}