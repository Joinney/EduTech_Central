import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

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
  GraduationCap,
  RotateCcw,
  Cpu,
  X,
  Image as ImageIcon,
  Bot,
  User,
  Copy,
  Check,
  LayoutDashboard,
  AlertCircle,
  ChevronRight,
  Zap,
  Loader2,
  History,
  CheckCircle2,
  Eye,
  BrainCircuit,
  Gauge
} from "lucide-react";

export default function TroLyAIPage() {
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Tự động phát hiện");
  const [copiedId, setCopiedId] = useState(null);

  // Danh sách model đầy đủ từ backend configs/setting.py
  const fallbackModels = [
    { id: "deepseek-v4-flash-vision-exp", name: "DeepSeek Vision", tag: "Mắt thần OCR", type: "vision" },
    { id: "DeepSeek-V4-Pro", name: "DeepSeek Pro", tag: "Suy luận sâu", type: "reasoning" },
    { id: "DeepSeek-V4-Flash", name: "DeepSeek Flash", tag: "Tốc độ cao", type: "fast" },
    { id: "glm-5.3-flash", name: "GLM 5.3 Flash", tag: "Đa năng", type: "general" },
    { id: "glm-4.5-air", name: "GLM 4.5 Air", tag: "Siêu nhẹ", type: "fast" },
    { id: "kimi-k3", name: "Kimi K3", tag: "Ngữ cảnh dài", type: "general" },
    { id: "Qwen3.8-Flash-Next", name: "Qwen 3.8 Next", tag: "Logic & Code", type: "reasoning" },
    { id: "Qwen3.8-27B", name: "Qwen 3.8 27B", tag: "Chính xác cao", type: "reasoning" },
    { id: "step-3.7-flash", name: "Step 3.7 Flash", tag: "Phản hồi tức thì", type: "fast" },
    { id: "spark-x2.5", name: "Spark X2.5", tag: "Toán học & Khoa học", type: "general" }
  ];

  const [availableModels, setAvailableModels] = useState(fallbackModels);
  const [selectedModel, setSelectedModel] = useState("deepseek-v4-flash-vision-exp");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // Danh sách tin nhắn cuộc trò chuyện
  const [messages, setMessages] = useState([]);
  
  // Quản lý file đính kèm
  const [attachedImage, setAttachedImage] = useState(null);
  const [attachedDoc, setAttachedDoc] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const docInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isAutoScrollEnabled = useRef(true);
  const modelDropdownRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_AI_URL || "http://localhost:8000/api/v1/ai";

  // Đóng dropdown model khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tự động tải danh sách Model từ backend API
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch(`${API_URL}/models`);
        const data = await res.json();
        if (data.success && Array.isArray(data.models)) {
          const mapped = data.models.map(mId => {
            const found = fallbackModels.find(f => f.id === mId);
            return found || { id: mId, name: mId, tag: "Mô hình AI", type: "general" };
          });
          setAvailableModels(mapped);
        }
      } catch {
        // Sử dụng danh sách fallback
      }
    };
    fetchModels();
  }, []);

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

  const activeInsights = [
    {
      id: "ins-1",
      level: "danger",
      title: "Cực trị hàm chứa dấu trị tuyệt đối",
      badge: "Sai 42%",
      desc: "Bạn thường quên xét đạo hàm tại điểm gãy hàm số |f(x)| khi đổi dấu.",
      actionText: "Luyện 3 câu bù lỗ hổng",
      promptToAsk: "Tạo 3 câu trắc nghiệm cực trị hàm số chứa trị tuyệt đối |f(x)| kèm lời giải chi tiết để tôi luyện tập."
    },
    {
      id: "ins-2",
      level: "warning",
      title: "Dao động cơ & Con lắc lò xo",
      badge: "Cần cải thiện",
      desc: "Thời gian bấm máy tính Casio dạng phương trình dao động đang chậm hơn trung bình.",
      actionText: "Xem mẹo bấm Casio 580VNX",
      promptToAsk: "Chia sẻ mẹo và hướng dẫn bấm máy tính Casio 580VNX dạng bài viết phương trình dao động điều hòa."
    },
    {
      id: "ins-3",
      level: "info",
      title: "Đổi biến số tích phân hàm ẩn",
      badge: "Công thức vàng",
      desc: "Khi gặp f(u(x)) · u'(x) dx, luôn ưu tiên đặt t = u(x) để hạ bậc tích phân.",
      actionText: "Xem bảng công thức đổi biến",
      promptToAsk: "Tổng hợp các dạng đổi biến số tích phân hàm ẩn thường gặp nhất trong đề thi THPT Quốc Gia."
    }
  ];

  const savedSessions = [
    {
      id: "session-1",
      title: "Giải tích phân hàm ẩn nâng cao f(x)",
      subject: "Toán học 12",
      time: "25 phút trước",
      firstPrompt: "Cho hàm số f(x) liên tục trên [0; 1] thỏa mãn f(x) + 2x·f(x²) = √(1 - x²). Tính giá trị I = ∫[0→1] f(x) dx."
    },
    {
      id: "session-2",
      title: "Tóm tắt di truyền học & ADN Sinh 12",
      subject: "Sinh học 12",
      time: "3 giờ trước",
      firstPrompt: "Tóm tắt các enzym then chốt trong quá trình nhân đôi ADN và điểm khác biệt giữa sinh vật nhân sơ và nhân thực."
    }
  ];

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    isAutoScrollEnabled.current = scrollHeight - scrollTop - clientHeight < 80;
  };

  useEffect(() => {
    if (chatContainerRef.current && isAutoScrollEnabled.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleIncomingFile = async (file) => {
    if (!file) return;

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachedImage(e.target.result);
        setSelectedModel("deepseek-v4-flash-vision-exp");
      };
      reader.readAsDataURL(file);
      return;
    }

    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if ([".pdf", ".doc", ".docx", ".txt"].includes(ext)) {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch(`${API_URL}/upload-document`, {
          method: "POST",
          body: formData
        });
        const data = await res.json();

        if (data.success) {
          setAttachedDoc({
            filename: file.name,
            extractedText: data.data.extracted_text,
            fileType: ext.replace(".", "").toUpperCase()
          });
        } else {
          alert("Không thể phân tích file: " + (data.detail || "Lỗi đọc dữ liệu"));
        }
      } catch {
        alert("Lỗi tải lên tài liệu! Vui lòng kiểm tra lại backend service.");
      } finally {
        setUploadingFile(false);
      }
    } else {
      alert("Định dạng chưa được hỗ trợ! Vui lòng chọn ảnh hoặc file PDF, DOC, DOCX, TXT.");
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        handleIncomingFile(items[i].getAsFile());
        break;
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleIncomingFile(files[0]);
    }
  };

  const formatLatex = (text) => {
    if (!text || typeof text !== "string") return "";
    return text
      .replace(/\\\((.*?)\\\)/g, "$$$1$$")
      .replace(/\\\[([\s\S]*?)\\\]/g, "$$$$$1$$$$");
  };

  const handleSendMessage = async (textToSend) => {
    const promptText = (textToSend || inputMessage).trim();
    if (!promptText && !attachedImage && !attachedDoc) return;
    if (loading || uploadingFile) return;

    let userPrompt = promptText;
    if (!userPrompt) {
      if (attachedDoc) {
        userPrompt = `Hãy đọc, tóm tắt và giải thích các điểm trọng tâm trong tài liệu "${attachedDoc.filename}".`;
      } else if (attachedImage) {
        userPrompt = "Hãy nhận diện đề bài trong ảnh và giải chi tiết từng bước giúp tôi.";
      }
    }

    const currentImg = attachedImage;
    const currentDoc = attachedDoc;

    const userDisplayMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userPrompt,
      image: currentImg,
      doc: currentDoc,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const assistantId = (Date.now() + 1).toString();
    const initialAssistantMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      model: selectedModel,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    isAutoScrollEnabled.current = true;
    setMessages((prev) => [...prev, userDisplayMessage, initialAssistantMessage]);
    setInputMessage("");
    setAttachedImage(null);
    setAttachedDoc(null);
    setLoading(true);

    try {
      let finalPrompt = userPrompt;
      if (currentDoc && currentDoc.extractedText) {
        finalPrompt = `[NỘI DUNG TÀI LIỆU "${currentDoc.filename}"]:\n${currentDoc.extractedText.slice(0, 8000)}\n\n[YÊU CẦU CỦA HỌC SINH]:\n${userPrompt}`;
      }

      let messageContent;
      if (currentImg) {
        messageContent = [
          { type: "text", text: finalPrompt },
          { type: "image_url", image_url: { url: currentImg } }
        ];
      } else {
        messageContent = finalPrompt;
      }

      const apiMessages = messages.map((m) => {
        if (m.image) {
          return {
            role: m.role,
            content: [
              { type: "text", text: m.content },
              { type: "image_url", image_url: { url: m.image } }
            ]
          };
        }
        return { role: m.role, content: m.content };
      });

      apiMessages.push({
        role: "user",
        content: messageContent
      });

      const systemInstruction = {
        role: "system",
        content: `Bạn là gia sư AI EduTech chuyên sâu. 
1. Nếu học sinh gửi tài liệu hoặc ảnh, nắm bắt chính xác câu hỏi hoặc lý thuyết.
2. Trình bày bài giải rõ ràng theo từng bước logic, chuẩn xác.
3. Đưa ra kết luận đáp số rõ ràng. Định hướng môn: ${selectedSubject}.`
      };

      const response = await fetch(`${API_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream"
        },
        body: JSON.stringify({
          model: currentImg ? "deepseek-v4-flash-vision-exp" : selectedModel,
          temperature: 0.3,
          messages: [systemInstruction, ...apiMessages]
        })
      });

      if (!response.ok || !response.body) throw new Error("Mất kết nối stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedText += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: accumulatedText } : msg
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: "❌ Không thể kết nối đến AI Service hoặc phiên kết nối bị gián đoạn." }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([]);
    setInputMessage("");
    setAttachedImage(null);
    setAttachedDoc(null);
  };

  const currentSelectedModelObj = availableModels.find(m => m.id === selectedModel) || {
    id: selectedModel,
    name: selectedModel,
    tag: "Tự chọn",
    type: "general"
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col h-[calc(100vh-4.5rem)] w-full bg-white font-sans text-slate-800 antialiased overflow-hidden select-none relative"
    >
      {/* Overlay kéo thả ảnh/tệp */}
      {isDragging && (
        <div className="fixed inset-0 bg-blue-600/10 backdrop-blur-md border-4 border-dashed border-blue-500 z-50 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-3xl bg-white shadow-2xl flex items-center justify-center text-blue-600 animate-bounce">
            <ImageIcon className="w-10 h-10" />
          </div>
          <p className="text-lg font-bold text-blue-950 mt-4">Thả ảnh hoặc tài liệu PDF/Word vào đây</p>
          <p className="text-xs text-blue-700/80 mt-1">EduTech AI sẽ trích xuất và giải thích bài học</p>
        </div>
      )}

      {/* Input File ẩn */}
      <input
        type="file"
        ref={docInputRef}
        onChange={(e) => { handleIncomingFile(e.target.files?.[0]); e.target.value = ""; }}
        accept="image/*,.pdf,.doc,.docx,.txt"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={(e) => { handleIncomingFile(e.target.files?.[0]); e.target.value = ""; }}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* 🟢 GIAO DIỆN 1: MÀN HÌNH KHỞI TẠO                                         */}
      {/* ========================================================================= */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Header Top Bar */}
          <div className="h-14 px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/70 backdrop-blur-md z-20">
            <div className="flex items-center space-x-2">
              
              {/* Custom Model Dropdown */}
              <div className="relative" ref={modelDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-2xs transition cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  <span>{currentSelectedModelObj.name}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-semibold">
                    {currentSelectedModelObj.tag}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isModelDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu nổi */}
                {isModelDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Chọn mô hình ({availableModels.length} models)
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-0.5 pr-1">
                      {availableModels.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedModel(m.id);
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition cursor-pointer ${
                            selectedModel === m.id
                              ? "bg-blue-50 text-blue-700 font-bold"
                              : "hover:bg-slate-50 text-slate-700 font-medium"
                          }`}
                        >
                          <div className="flex items-center space-x-2 min-w-0">
                            {m.type === "vision" ? (
                              <Eye className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : m.type === "reasoning" ? (
                              <BrainCircuit className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            ) : (
                              <Gauge className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            )}
                            <span className="truncate">{m.name}</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold shrink-0 ml-1 ${
                            selectedModel === m.id ? "bg-blue-200/60 text-blue-800" : "bg-slate-100 text-slate-500"
                          }`}>
                            {m.tag}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Subject Selector */}
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 font-medium text-slate-600 outline-none cursor-pointer"
              >
                <option value="Tự động phát hiện">🎯 Tự nhận diện môn</option>
                <option value="Toán học 12">📐 Toán học</option>
                <option value="Vật lý 12">⚡ Vật lý</option>
                <option value="Hóa học 12">🧪 Hóa học</option>
                <option value="Sinh học 12">🧬 Sinh học</option>
                <option value="Tiếng Anh">🌐 Tiếng Anh</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>Xem lịch sử phiên học</span>
            </button>
          </div>

          {/* Vùng trung tâm cuộn */}
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

              {/* Thẻ gợi ý hành động nhanh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
                {promptSuggestions.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(item.prompt)}
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

          {/* Thanh nhập liệu gắn đáy */}
          <div className="shrink-0 w-full bg-white border-t border-slate-100 px-4 sm:px-6 pb-4 md:pb-6 pt-2">
            <div className="max-w-3xl mx-auto space-y-2">
              <div className="rounded-3xl border border-slate-200/90 shadow-sm hover:border-slate-300 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all bg-white px-3 sm:px-4 pt-2.5 sm:pt-3 pb-2 flex flex-col space-y-1.5 sm:space-y-2">
                
                {uploadingFile && (
                  <div className="flex items-center space-x-2 p-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang trích xuất văn bản tài liệu...</span>
                  </div>
                )}

                {attachedImage && (
                  <div className="relative inline-flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-200 w-fit">
                    <img src={attachedImage} alt="Preview" className="h-12 w-12 object-cover rounded-lg" />
                    <div className="pr-2">
                      <div className="text-xs font-bold text-slate-800">Ảnh đề bài sẵn sàng</div>
                      <div className="text-[10px] text-slate-400">Vision OCR</div>
                    </div>
                    <button type="button" onClick={() => setAttachedImage(null)} className="p-1 rounded-full bg-slate-200 hover:bg-red-500 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {attachedDoc && (
                  <div className="relative inline-flex items-center gap-2 p-1.5 bg-blue-50 rounded-xl border border-blue-200 w-fit">
                    <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      {attachedDoc.fileType}
                    </span>
                    <div className="pr-2">
                      <div className="text-xs font-bold text-slate-800 truncate max-w-xs">{attachedDoc.filename}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Đã đọc xong văn bản
                      </div>
                    </div>
                    <button type="button" onClick={() => setAttachedDoc(null)} className="p-1 rounded-full bg-slate-200 hover:bg-red-500 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    attachedDoc
                      ? `Đã nhận "${attachedDoc.filename}". Đặt câu hỏi về tệp này hoặc nhấn gửi...`
                      : "Hỏi AI bất kỳ điều gì, dán đề bài hoặc kéo thả tệp..."
                  }
                  className="w-full bg-transparent border-none outline-none text-[13px] sm:text-sm text-slate-800 placeholder:text-slate-400 py-1 sm:py-1.5 min-w-0"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-slate-400">
                    <button
                      type="button"
                      onClick={() => docInputRef.current?.click()}
                      disabled={uploadingFile}
                      title="Đính kèm tệp PDF/Word/Ảnh"
                      className="p-1.5 sm:p-2 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      disabled={uploadingFile}
                      title="Scan hình ảnh"
                      className="p-1.5 sm:p-2 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Camera className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-indigo-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 text-[10px] sm:text-[11px] font-bold text-slate-700 border border-slate-200/80 ml-1 transition cursor-pointer"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-blue-500 fill-blue-500 shrink-0" />
                      <span className="truncate">{currentSelectedModelObj.name}</span>
                      <ChevronDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    </button>
                  </div>

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
                      disabled={!inputMessage.trim() && !attachedImage && !attachedDoc}
                      onClick={() => handleSendMessage()}
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
      ) : (
        /* ========================================================================= */
        /* 🟢 GIAO DIỆN 2: CHAT TRỰC TIẾP 2 CỘT                                     */
        /* ========================================================================= */
        <div className="flex flex-col h-full w-full bg-white">
          <header className="h-14 border-b border-slate-200/70 px-6 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-10">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleResetChat}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                <span>Trang chính</span>
              </button>

              <div className="h-4 w-px bg-slate-200" />

              {/* Model Dropdown trong Chat View */}
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.tag})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Lịch sử</span>
              </button>

              <button
                type="button"
                onClick={handleResetChat}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đoạn chat mới</span>
              </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* CỘT TRÁI: KHUNG TRÒ CHUYỆN */}
            <div className="flex-1 flex flex-col h-full border-r border-slate-200/80">
              <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scroll-smooth"
              >
                <div className="max-w-2xl mx-auto space-y-6">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex gap-3.5 ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}
                    >
                      {m.role === "assistant" && (
                        <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[88%] rounded-3xl p-4.5 space-y-2 ${
                          m.role === "user"
                            ? "bg-slate-900 text-white shadow-md rounded-tr-xs"
                            : "bg-white border border-slate-200/90 shadow-xs text-slate-800 rounded-tl-xs"
                        }`}
                      >
                        {m.image && (
                          <div className="relative overflow-hidden rounded-2xl border border-white/20 mb-2">
                            <img src={m.image} alt="Bài tập" className="max-h-64 max-w-full object-contain rounded-2xl bg-black/5" />
                          </div>
                        )}

                        {m.doc && (
                          <div className="flex items-center space-x-2 p-2 bg-slate-800 rounded-xl border border-slate-700 text-white mb-2">
                            <span className="px-2 py-1 rounded bg-blue-600 text-[10px] font-black">{m.doc.fileType}</span>
                            <span className="text-xs truncate font-medium">{m.doc.filename}</span>
                          </div>
                        )}

                        <div className={`text-xs md:text-sm leading-relaxed ${m.role === "user" ? "text-slate-100" : "text-slate-800"} prose prose-slate max-w-none prose-p:my-1.5 prose-pre:bg-slate-900 prose-pre:text-slate-100`}>
                          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {formatLatex(m.content)}
                          </ReactMarkdown>

                          {loading && m.role === "assistant" && m.id === messages[messages.length - 1]?.id && (
                            <span className="inline-block w-2 h-4 ml-1 bg-blue-600 animate-pulse rounded-xs align-middle" />
                          )}
                        </div>

                        {m.role === "assistant" && m.content && (
                          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-[11px] text-slate-400">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-500 text-[10px]">{m.model}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(m.content, m.id)}
                              className="flex items-center space-x-1 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedId === m.id ? "Đã chép" : "Sao chép"}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {m.role === "user" && (
                        <div className="w-8 h-8 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Thanh nhập liệu trong chat */}
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="max-w-2xl mx-auto">
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-2.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100/70 transition-all">
                    
                    {attachedImage && (
                      <div className="relative inline-flex items-center gap-2 p-1.5 mb-2 bg-white rounded-2xl border border-slate-200">
                        <img src={attachedImage} alt="Preview" className="h-12 w-12 object-cover rounded-xl" />
                        <div className="pr-2">
                          <div className="text-xs font-bold text-slate-800">Ảnh bài tập</div>
                        </div>
                        <button type="button" onClick={() => setAttachedImage(null)} className="p-1 rounded-full bg-slate-200 hover:bg-red-500 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {attachedDoc && (
                      <div className="relative inline-flex items-center gap-2 p-1.5 mb-2 bg-blue-50 rounded-2xl border border-blue-200">
                        <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                          {attachedDoc.fileType}
                        </span>
                        <div className="pr-2">
                          <div className="text-xs font-bold text-slate-800 truncate max-w-xs">{attachedDoc.filename}</div>
                        </div>
                        <button type="button" onClick={() => setAttachedDoc(null)} className="p-1 rounded-full bg-slate-200 hover:bg-red-500 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onPaste={handlePaste}
                      onKeyDown={handleKeyDown}
                      placeholder="Hỏi tiếp câu khác hoặc tải file PDF/Word/ảnh đề bài..."
                      disabled={loading || uploadingFile}
                      className="w-full bg-transparent border-none outline-none text-xs md:text-sm text-slate-800 placeholder:text-slate-400 px-3 py-1.5 leading-relaxed"
                    />

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1 px-1">
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => docInputRef.current?.click()}
                          disabled={loading || uploadingFile}
                          className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-200/60 transition-colors cursor-pointer"
                          title="Tải ảnh hoặc tài liệu PDF/Word"
                        >
                          <Paperclip className="w-4 h-4 text-slate-600" />
                        </button>

                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          disabled={loading || uploadingFile}
                          className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-200/60 transition-colors cursor-pointer"
                          title="Chụp ảnh đề bài"
                        >
                          <Camera className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSendMessage()}
                        disabled={loading || uploadingFile || (!inputMessage.trim() && !attachedImage && !attachedDoc)}
                        className="w-8 h-8 rounded-full bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: CHẨN ĐOÁN ĐIỂM YẾU KIẾN THỨC (AI INSIGHTS) */}
            <aside className="w-80 lg:w-96 bg-slate-50/50 p-5 overflow-y-auto hidden md:flex flex-col space-y-4 shrink-0">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Chẩn đoán điểm yếu kiến thức
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold">
                    AI Insights
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Các bẫy đề thi và lỗi sai bạn hay mắc phải trong chủ đề này
                </p>

                <div className="space-y-3 pt-2">
                  {activeInsights.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-2xl p-4 space-y-2 border transition-all hover:shadow-xs ${
                        item.level === "danger"
                          ? "bg-[#fff5f5] border-[#fed7d7]"
                          : item.level === "warning"
                          ? "bg-[#fffdf0] border-[#feebc8]"
                          : "bg-blue-50/50 border-blue-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900 leading-snug">{item.title}</span>
                        <span className={`px-2 py-0.5 rounded-md font-black text-[10px] shrink-0 ${
                          item.level === "danger"
                            ? "bg-[#fee2e2] text-[#dc2626]"
                            : item.level === "warning"
                            ? "bg-[#fef3c7] text-[#b45309]"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {item.badge}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {item.desc}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleSendMessage(item.promptToAsk)}
                        className={`text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors pt-1 ${
                          item.level === "danger"
                            ? "text-[#dc2626] hover:text-[#b91c1c]"
                            : item.level === "warning"
                            ? "text-[#b45309] hover:text-[#92400e]"
                            : "text-blue-600 hover:text-blue-700"
                        }`}
                      >
                        <span>{item.actionText}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl p-5 text-white space-y-2 shadow-xs">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Mẹo ôn thi THPT</span>
                </div>
                <h4 className="text-xs font-black">Bấm thẻ bên trên để AI tạo bài tập bù lỗ hổng</h4>
                <p className="text-[11px] text-blue-100 leading-relaxed">
                  Hệ thống tự động đưa các câu hỏi trọng tâm sát với đề thi để khắc phục lỗi sai thường gặp.
                </p>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🟢 MODAL: DANH SÁCH LỊCH SỬ PHIÊN HỌC                                     */}
      {/* ========================================================================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Lịch sử phiên học gần đây</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {savedSessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setShowHistoryModal(false);
                    handleSendMessage(s.firstPrompt);
                  }}
                  className="p-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition cursor-pointer space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">{s.subject}</span>
                    <span className="text-[10px] text-slate-400">{s.time}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{s.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{s.firstPrompt}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}