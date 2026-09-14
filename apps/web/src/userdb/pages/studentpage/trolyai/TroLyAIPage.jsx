import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import { 
  Sparkles, 
  Paperclip, 
  Camera, 
  ChevronDown, 
  ArrowRight, 
  ArrowUp,
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ChevronRight, 
  RotateCcw,
  Cpu,
  X,
  Image as ImageIcon,
  Bot,
  User,
  Copy,
  Check,
  LayoutDashboard,
  Zap,
  Loader2,
  FileCheck2
} from "lucide-react";

export default function TroLyAIPage() {
  const [filter, setFilter] = useState("all");
  const [inputContent, setInputContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedModel, setSelectedModel] = useState("deepseek-v4-flash-vision-exp");
  const [selectedSubject, setSelectedSubject] = useState("Tự động phát hiện");
  const [copiedId, setCopiedId] = useState(null);

  const [messages, setMessages] = useState([]);
  
  // Quản lý tệp đính kèm: Hỗ trợ cả ẢNH và TÀI LIỆU (PDF/Word)
  const [attachedImage, setAttachedImage] = useState(null); // base64
  const [attachedDoc, setAttachedDoc] = useState(null); // { filename, extractedText, fileType }
  const [isDragging, setIsDragging] = useState(false);

  const docInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  const isAutoScrollEnabled = useRef(true);

  const API_URL = import.meta.env.VITE_API_AI_URL || "http://localhost:8000/api/v1/ai";

  const availableModels = [
    { id: "deepseek-v4-flash-vision-exp", name: "DeepSeek Vision", tag: "Mắt thần OCR" },
    { id: "DeepSeek-V4-Flash", name: "DeepSeek Flash", tag: "Tốc độ cao" },
    { id: "DeepSeek-V4-Pro", name: "DeepSeek Pro", tag: "Suy luận sâu" },
    { id: "glm-5.3-flash", name: "GLM 5.3 Flash", tag: "Đa năng" },
    { id: "Qwen3.8-Flash-Next", name: "Qwen 3.8 Next", tag: "Chính xác" },
    { id: "kimi-k3", name: "Kimi K3", tag: "Ngữ cảnh dài" }
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

  // Xử lý tệp chung: Phân luồng file Ảnh hoặc File Tài liệu (PDF/Word)
  const handleIncomingFile = async (file) => {
    if (!file) return;

    // 1. Nếu là tệp ảnh
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachedImage(e.target.result);
        setSelectedModel("deepseek-v4-flash-vision-exp");
      };
      reader.readAsDataURL(file);
      return;
    }

    // 2. Nếu là tệp tài liệu PDF, DOC, DOCX, TXT -> Upload lên server trích xuất chữ
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
          alert("Không thể phân tích file: " + (data.detail || "Lỗi không xác định"));
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

  // GỬI TIN NHẮN STREAMING
  const handleSendMessage = async (textToSend) => {
    const promptText = (textToSend || inputContent).trim();
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
    setInputContent("");
    setAttachedImage(null);
    setAttachedDoc(null);
    setLoading(true);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      // Chuẩn bị payload gửi lên AI
      let messageContent;
      let finalPrompt = userPrompt;

      // Nếu có tài liệu, đính kèm văn bản trích xuất vào ngữ cảnh
      if (currentDoc && currentDoc.extractedText) {
        finalPrompt = `[NỘI DUNG TÀI LIỆU "${currentDoc.filename}"]:\n${currentDoc.extractedText.slice(0, 8000)}\n\n[YÊU CẦU CỦA HỌC SINH]:\n${userPrompt}`;
      }

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
1. Nếu học sinh gửi tài liệu (PDF/Word) hoặc ảnh, hãy nắm bắt chính xác nội dung câu hỏi/bài học trong tài liệu.
2. Trình bày bài giải rõ ràng theo từng bước logic, dễ hiểu.
3. Đưa ra kết luận đáp số chuẩn xác. Định hướng môn: ${selectedSubject}.`
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
    setInputContent("");
    setAttachedImage(null);
    setAttachedDoc(null);
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen bg-slate-50/50 text-slate-800 antialiased relative selection:bg-blue-100 selection:text-blue-900"
    >
      {/* Overlay Drag & Drop */}
      {isDragging && (
        <div className="fixed inset-0 bg-blue-600/10 backdrop-blur-md border-4 border-dashed border-blue-500 z-50 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-3xl bg-white shadow-2xl flex items-center justify-center text-blue-600 animate-bounce">
            <ImageIcon className="w-10 h-10" />
          </div>
          <p className="text-lg font-bold text-blue-950 mt-4">Thả ảnh hoặc tài liệu PDF/Word vào đây</p>
          <p className="text-xs text-blue-700/80 mt-1">EduTech AI sẽ trích xuất và giải thích bài học</p>
        </div>
      )}

      {/* Input File hỗ trợ: Ảnh, PDF, DOC, DOCX */}
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
      {/* 🟢 GIAO DIỆN 1: DASHBOARD BAN ĐẦU                                         */}
      {/* ========================================================================= */}
      {messages.length === 0 ? (
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
          <section className="bg-gradient-to-b from-blue-50/60 via-white to-white rounded-3xl border border-blue-100/80 p-6 md:p-10 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-blue-400/10 blur-3xl pointer-events-none rounded-full" />

            <div className="relative max-w-3xl mx-auto text-center space-y-3">
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200/80 px-3.5 py-1 rounded-full text-blue-600 text-xs font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                <span>Trợ lý AI Thế hệ mới • Model {selectedModel}</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Hôm nay bạn cần trợ giúp bài học nào?
              </h1>
              <p className="text-xs md:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
                Chụp ảnh bài tập, dán đề bài toán, phân tích tài liệu PDF/Word hoặc tạo trắc nghiệm củng cố kiến thức trong vài giây.
              </p>

              <div className="pt-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-blue-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all p-4 text-left space-y-3">
                  
                  {/* Trạng thái đang tải lên tài liệu */}
                  {uploadingFile && (
                    <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang trích xuất nội dung từ tệp tài liệu...</span>
                    </div>
                  )}

                  {/* Preview ảnh đính kèm */}
                  {attachedImage && (
                    <div className="relative inline-flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                      <img src={attachedImage} alt="Preview" className="h-14 w-14 object-cover rounded-lg" />
                      <div className="pr-2">
                        <div className="text-xs font-bold text-slate-800">Ảnh đề bài sẵn sàng</div>
                        <div className="text-[10px] text-slate-400">Chế độ Vision OCR</div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setAttachedImage(null)} 
                        className="p-1 rounded-full bg-slate-200 hover:bg-red-500 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Preview file tài liệu (PDF, Word) */}
                  {attachedDoc && (
                    <div className="relative inline-flex items-center gap-2.5 p-2 bg-blue-50/70 rounded-xl border border-blue-200">
                      <span className="w-9 h-9 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                        {attachedDoc.fileType}
                      </span>
                      <div className="pr-2">
                        <div className="text-xs font-bold text-slate-800 truncate max-w-xs">{attachedDoc.filename}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đã đọc xong văn bản
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setAttachedDoc(null)} 
                        className="p-1 rounded-full bg-slate-200 hover:bg-red-500 hover:text-white ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <textarea
                    value={inputContent}
                    onChange={(e) => setInputContent(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      attachedDoc 
                        ? `Đã nhận "${attachedDoc.filename}". Hãy nhập câu hỏi về tệp này (hoặc để trống rồi bấm "Giải đáp ngay")...` 
                        : "Nhập đề bài, dán hình ảnh (Ctrl + V) hoặc tải file PDF/Word để AI giải thích từng bước..."
                    }
                    rows={3}
                    className="w-full resize-none border-none outline-none text-xs md:text-sm text-slate-800 placeholder:text-slate-400 leading-relaxed bg-transparent"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center flex-wrap gap-2 text-xs text-slate-600 font-medium">
                      <button 
                        type="button" 
                        onClick={() => docInputRef.current?.click()}
                        disabled={uploadingFile}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Paperclip className="w-3.5 h-3.5 text-purple-500" />
                        <span>Đính kèm tệp / PDF / Word</span>
                      </button>

                      <button 
                        type="button" 
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Scan ảnh đề bài</span>
                      </button>

                      <div className="relative inline-flex items-center">
                        <select
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="appearance-none flex items-center space-x-1 pl-3 pr-7 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer outline-none bg-white text-xs font-medium"
                        >
                          <option value="Tự động phát hiện">Môn: Tự động phát hiện</option>
                          <option value="Toán học 12">Toán học 12</option>
                          <option value="Vật lý 12">Vật lý 12</option>
                          <option value="Hóa học 12">Hóa học 12</option>
                          <option value="Sinh học 12">Sinh học 12</option>
                          <option value="Tiếng Anh">Tiếng Anh</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={loading || uploadingFile || (!inputContent.trim() && !attachedImage && !attachedDoc)}
                      className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span>Giải đáp ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2 CỘT WORKSPACE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Phiên làm việc &amp; Lời giải gần đây
                  </h2>
                  <p className="text-xs text-slate-500">
                    Các kết quả học tập và tài liệu AI đã phân tích cho bạn
                  </p>
                </div>

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
                </div>
              </div>

              {/* CARD MẪU TOÁN */}
              {(filter === "all" || filter === "math") && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-bold border border-blue-100">
                      Toán 12 • Giải tích ôn thi THPT Quốc Gia
                    </span>
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Hoàn thành 100%</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">
                    Giải bài toán tích phân hàm ẩn nâng cao chứa điều kiện f(x) + 2x·f(x²)
                  </h3>

                  <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 font-mono border border-slate-100 leading-relaxed">
                    <span className="font-bold text-slate-900">Đề bài: </span>
                    Cho hàm số f(x) liên tục trên [0; 1] thỏa mãn f(x) + 2x·f(x²) = √(1 - x²). Tính giá trị I = ∫[0→1] f(x) dx.
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <div className="bg-white rounded-xl border border-slate-100 p-3 space-y-1">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[10px] flex items-center justify-center">1</span>
                        <span>Lấy tích phân hai vế cận từ 0 đến 1:</span>
                      </div>
                      <div className="pl-6 text-xs text-slate-600 font-mono">
                        ∫[0→1] f(x) dx + 2·∫[0→1] x·f(x²) dx = ∫[0→1] √(1 - x²) dx
                      </div>
                    </div>

                    <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-900 font-medium flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <b>Kết luận đáp án:</b> I + I = 2I = π/4. Suy ra <b className="underline">I = π/8</b>.
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => handleSendMessage("Hãy cho tôi 1 bài toán tích phân hàm ẩn tương tự dạng f(x) + 2x·f(x²) kèm lời giải chi tiết.")}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold cursor-pointer"
                    >
                      <span>Luyện bài tương tự</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CỘT PHẢI: CHẨN ĐOÁN BAN ĐẦU */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Chẩn đoán điểm yếu kiến thức
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold">
                    AI Insights
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {activeInsights.map((item) => (
                    <div 
                      key={item.id}
                      className={`rounded-2xl p-4 space-y-2 border transition-all ${
                        item.level === "danger" 
                          ? "bg-[#fff5f5] border-[#fed7d7]/70" 
                          : item.level === "warning"
                          ? "bg-[#fffdf0] border-[#feebc8]/80"
                          : "bg-blue-50/40 border-blue-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-slate-900">{item.title}</span>
                        <span className={`px-2 py-0.5 rounded-md font-black text-[10px] ${
                          item.level === "danger" 
                            ? "bg-[#fee2e2] text-[#dc2626]" 
                            : item.level === "warning"
                            ? "bg-[#fef3c7] text-[#b45309]"
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
                      <button 
                        type="button" 
                        onClick={() => handleSendMessage(item.promptToAsk)}
                        className={`text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
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
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 🟢 GIAO DIỆN 2: CHAT 2 CỘT (STREAM TRÁI + CHÚ Ý MÀU SẮC BÊN PHẢI)         */
        /* ========================================================================= */
        <div className="flex flex-col h-screen max-w-7xl mx-auto bg-white">
          
          {/* Header */}
          <header className="h-14 border-b border-slate-200/70 px-6 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-10">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={handleResetChat}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                <span>Quay lại Dashboard</span>
              </button>

              <div className="h-4 w-px bg-slate-200" />

              <div className="flex items-center space-x-1.5 bg-slate-100/90 border border-slate-200/60 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer text-xs font-semibold text-slate-700"
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.tag})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="button" 
              onClick={handleResetChat} 
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đoạn chat mới</span>
            </button>
          </header>

          <div className="flex-1 flex overflow-hidden">
            
            {/* CỘT TRÁI: STREAMING KHUNG CHAT */}
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
                        {/* Ảnh bài tập (nếu có) */}
                        {m.image && (
                          <div className="relative overflow-hidden rounded-2xl border border-white/20 mb-2">
                            <img src={m.image} alt="Bài tập" className="max-h-64 max-w-full object-contain rounded-2xl bg-black/5" />
                          </div>
                        )}

                        {/* File tài liệu đính kèm (nếu có) */}
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

              {/* Ô nhập liệu dưới đáy */}
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="max-w-2xl mx-auto">
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-2.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100/70 transition-all">
                    
                    {/* Đang đọc tài liệu */}
                    {uploadingFile && (
                      <div className="flex items-center space-x-2 p-2 mb-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang phân tích tài liệu tải lên...</span>
                      </div>
                    )}

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

                    <textarea
                      ref={textareaRef}
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      onPaste={handlePaste}
                      onKeyDown={handleKeyDown}
                      placeholder="Hỏi tiếp bài tập hoặc nhấn tải file PDF/Word/ảnh đề bài..."
                      rows={1}
                      disabled={loading || uploadingFile}
                      className="w-full bg-transparent resize-none border-none outline-none text-xs md:text-sm text-slate-800 placeholder:text-slate-400 px-3 py-1.5 max-h-36 leading-relaxed"
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
                        disabled={loading || uploadingFile || (!inputContent.trim() && !attachedImage && !attachedDoc)}
                        className="w-8 h-8 rounded-full bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: ĐIỂM CẦN CHÚ Ý MÀU SẮC (THEO HÌNH MẪU) */}
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
                  Phân tích từ 15 bài giải gần nhất
                </p>

                {/* Các thẻ cảnh báo màu sắc */}
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
    </div>
  );
}