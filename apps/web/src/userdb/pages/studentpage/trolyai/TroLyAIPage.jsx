import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Sparkles, Paperclip, Camera, Mic, ArrowUp, BookOpen, FileText, Edit3, 
  ListChecks, ChevronDown, GraduationCap, RotateCcw, Cpu, X, 
  Image as ImageIcon, Bot, User, Copy, Check, LayoutDashboard, Loader2, 
  History, Eye, BrainCircuit, Gauge, Square, Volume2, PenTool, Crop, Zap,
  AudioLines
} from "lucide-react";

// ==========================================
// COMPONENT: KHOANH VÙNG CẮT ẢNH THUẦN (KHÔNG CẦN CÀI THÊM THƯ VIỆN)
// Hỗ trợ kéo thả di chuyển, kéo 8 điểm neo (4 góc + 4 cạnh), hỗ trợ cả Mobile
// ==========================================
const ImageCropperModal = ({ imageSrc, onClose, onCropComplete }) => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Tỉ lệ vùng crop (tính theo phần trăm 0 -> 100)
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [dragState, setDragState] = useState(null); // 'move' hoặc 'nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'

  const getClientPos = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  const handleStartDrag = (type, e) => {
    e.preventDefault();
    e.stopPropagation();
    const { clientX, clientY } = getClientPos(e);
    setDragState({
      type,
      startX: clientX,
      startY: clientY,
      startCrop: { ...crop }
    });
  };

  useEffect(() => {
    const handleMove = (e) => {
      if (!dragState || !imgRef.current) return;
      const { clientX, clientY } = getClientPos(e);
      const rect = imgRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const deltaXPercent = ((clientX - dragState.startX) / rect.width) * 100;
      const deltaYPercent = ((clientY - dragState.startY) / rect.height) * 100;
      const sc = dragState.startCrop;

      let newCrop = { ...crop };

      if (dragState.type === "move") {
        let nextX = Math.max(0, Math.min(100 - sc.width, sc.x + deltaXPercent));
        let nextY = Math.max(0, Math.min(100 - sc.height, sc.y + deltaYPercent));
        newCrop.x = nextX;
        newCrop.y = nextY;
      } else {
        let x = sc.x;
        let y = sc.y;
        let w = sc.width;
        let h = sc.height;

        if (dragState.type.includes("e")) {
          w = Math.min(100 - x, Math.max(10, sc.width + deltaXPercent));
        }
        if (dragState.type.includes("s")) {
          h = Math.min(100 - y, Math.max(10, sc.height + deltaYPercent));
        }
        if (dragState.type.includes("w")) {
          const maxLeft = sc.x + sc.width - 10;
          x = Math.max(0, Math.min(maxLeft, sc.x + deltaXPercent));
          w = sc.width + (sc.x - x);
        }
        if (dragState.type.includes("n")) {
          const maxTop = sc.y + sc.height - 10;
          y = Math.max(0, Math.min(maxTop, sc.y + deltaYPercent));
          h = sc.height + (sc.y - y);
        }

        newCrop = { x, y, width: w, height: h };
      }

      setCrop(newCrop);
    };

    const handleEnd = () => {
      setDragState(null);
    };

    if (dragState) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [dragState, crop]);

  const handleConfirmCrop = () => {
    const img = imgRef.current;
    if (!img) return;

    const canvas = document.createElement("canvas");
    const realX = (crop.x / 100) * img.naturalWidth;
    const realY = (crop.y / 100) * img.naturalHeight;
    const realW = (crop.width / 100) * img.naturalWidth;
    const realH = (crop.height / 100) * img.naturalHeight;

    canvas.width = Math.max(1, Math.floor(realW));
    canvas.height = Math.max(1, Math.floor(realH));

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      img,
      realX, realY, realW, realH,
      0, 0, canvas.width, canvas.height
    );

    const base64 = canvas.toDataURL("image/jpeg", 0.95);
    onCropComplete(base64);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/85 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-700">
            <div className="p-2 rounded-xl bg-indigo-50">
              <Crop className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-[15px]">Khoanh vùng câu hỏi</h3>
              <p className="text-[11px] text-slate-400 font-medium">Kéo 4 góc hoặc các cạnh để chọn đúng phần bài tập cần giải</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={containerRef} className="relative w-full h-[55vh] sm:h-[60vh] bg-slate-950/95 flex items-center justify-center p-4 overflow-hidden select-none">
          <div className="relative inline-block max-h-full max-w-full">
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop target"
              className="max-h-[50vh] sm:max-h-[55vh] w-auto object-contain block pointer-events-none user-select-none"
            />
            {/* Lớp phủ & khung Crop */}
            <div
              className="absolute border-2 border-indigo-400 bg-indigo-500/15 cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`
              }}
              onMouseDown={(e) => handleStartDrag("move", e)}
              onTouchStart={(e) => handleStartDrag("move", e)}
            >
              {/* Lưới chia 3x3 */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
                <div className="border-r border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-r border-b border-white"></div>
                <div className="border-b border-white"></div>
                <div className="border-r border-white"></div>
                <div className="border-r border-white"></div>
                <div></div>
              </div>

              {/* 4 Góc */}
              <div onMouseDown={(e) => handleStartDrag("nw", e)} onTouchStart={(e) => handleStartDrag("nw", e)} className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize shadow-md" />
              <div onMouseDown={(e) => handleStartDrag("ne", e)} onTouchStart={(e) => handleStartDrag("ne", e)} className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize shadow-md" />
              <div onMouseDown={(e) => handleStartDrag("sw", e)} onTouchStart={(e) => handleStartDrag("sw", e)} className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize shadow-md" />
              <div onMouseDown={(e) => handleStartDrag("se", e)} onTouchStart={(e) => handleStartDrag("se", e)} className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize shadow-md" />

              {/* 4 Cạnh */}
              <div onMouseDown={(e) => handleStartDrag("n", e)} onTouchStart={(e) => handleStartDrag("n", e)} className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-indigo-600 rounded-full cursor-ns-resize" />
              <div onMouseDown={(e) => handleStartDrag("s", e)} onTouchStart={(e) => handleStartDrag("s", e)} className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-indigo-600 rounded-full cursor-ns-resize" />
              <div onMouseDown={(e) => handleStartDrag("w", e)} onTouchStart={(e) => handleStartDrag("w", e)} className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-2 h-6 bg-white border border-indigo-600 rounded-full cursor-ew-resize" />
              <div onMouseDown={(e) => handleStartDrag("e", e)} onTouchStart={(e) => handleStartDrag("e", e)} className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-6 bg-white border border-indigo-600 rounded-full cursor-ew-resize" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-[13px] hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleConfirmCrop}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-[13px] hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Xác nhận vùng chọn
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT: HIỆU ỨNG GÕ CHỮ THÔNG MINH (TYPEWRITER)
// ==========================================
const AnimatedGreeting = () => {
  const phrases = [
    "giải chi tiết bài tập khó?",
    "tóm tắt tài liệu PDF & Word?",
    "ôn luyện bài tập trắc nghiệm?",
    "nâng cấp từ vựng & ngữ pháp?",
    "giải thích kiến thức chuyên sâu?"
  ];
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const typeSpeed = isDeleting ? 30 : 60;
    const currentPhrase = phrases[phraseIndex];

    const timer = setTimeout(() => {
      if (!isDeleting && text === currentPhrase) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      } else {
        setText(currentPhrase.substring(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [text, isDeleting, phraseIndex]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70px] sm:min-h-[84px] px-2 select-none">
      <h1 className="text-2xl sm:text-3xl md:text-[32px] font-extrabold text-slate-800 tracking-tight leading-snug text-center flex flex-wrap justify-center items-center gap-x-2">
        <span>Hôm nay, tôi có thể giúp bạn</span>
        <span className="relative inline-flex items-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 font-black">
            {text}
          </span>
          <span className="inline-block w-[3px] h-6 sm:h-7 bg-indigo-500 ml-1 rounded-full animate-pulse" />
        </span>
      </h1>
    </div>
  );
};

// ==========================================
// COMPONENT 1: INTERACTIVE QUIZ CARD
// ==========================================
const InteractiveQuiz = ({ quizData }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qIndex, oIndex) => {
    if (showResults) return;
    setSelectedAnswers({ ...selectedAnswers, [qIndex]: oIndex });
  };

  return (
    <div className="bg-white border border-indigo-100 rounded-2xl p-4 my-3 shadow-sm w-full font-sans">
      <div className="flex items-center gap-2 mb-4 text-indigo-700">
        <Zap className="w-5 h-5 fill-current text-amber-400" />
        <h3 className="font-extrabold text-[15px]">Luyện tập nhanh (1-Click Quiz)</h3>
      </div>
      
      {quizData.map((q, qIndex) => {
        const isCorrect = selectedAnswers[qIndex] === q.answerIndex;
        return (
          <div key={qIndex} className="mb-6 pb-6 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0">
            <p className="text-[14px] font-bold text-slate-800 mb-3">Câu {qIndex + 1}: {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, oIndex) => {
                let btnClass = "w-full text-left px-4 py-2.5 rounded-xl border text-[13px] font-medium transition-all ";
                if (showResults) {
                  if (oIndex === q.answerIndex) btnClass += "bg-emerald-50 border-emerald-400 text-emerald-800";
                  else if (oIndex === selectedAnswers[qIndex]) btnClass += "bg-red-50 border-red-300 text-red-700";
                  else btnClass += "bg-white border-slate-200 text-slate-500 opacity-50";
                } else {
                  if (selectedAnswers[qIndex] === oIndex) btnClass += "bg-indigo-50 border-indigo-400 text-indigo-700 ring-2 ring-indigo-100";
                  else btnClass += "bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50";
                }
                return (
                  <button key={oIndex} onClick={() => handleSelect(qIndex, oIndex)} className={btnClass} disabled={showResults}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {showResults && (
              <div className={`mt-3 p-3 rounded-xl text-[13px] ${isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
                <span className="font-bold">{isCorrect ? "🎉 Chính xác!" : "❌ Rất tiếc!"}</span> 
                <span className="ml-2 block mt-1 text-slate-700"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{q.explanation}</ReactMarkdown></span>
              </div>
            )}
          </div>
        );
      })}

      {!showResults ? (
        <button onClick={() => setShowResults(true)} disabled={Object.keys(selectedAnswers).length < quizData.length} className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-[14px] hover:bg-indigo-700 disabled:opacity-50 transition-colors mt-2">
          Nộp bài & Chấm điểm
        </button>
      ) : (
        <button onClick={() => { setSelectedAnswers({}); setShowResults(false); }} className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-[14px] hover:bg-slate-200 transition-colors mt-2">
          Làm lại
        </button>
      )}
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function TroLyAIPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("Tự động phát hiện");
  const [copiedId, setCopiedId] = useState(null);

  // --- STATE TÍNH NĂNG MỚI ---
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  
  const [imageToCrop, setImageToCrop] = useState(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState(null);

  const videoRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const docInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const modelDropdownRef = useRef(null);
  const isAutoScrollEnabled = useRef(true);
  
  // REF CHO NHẬN DIỆN GIỌNG NÓI VÀ ABORT
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);

  const userAvatar = "https://ui-avatars.com/api/?name=Hoc+Sinh&background=0D8ABC&color=fff"; 
  
  // 🌟 LOGO TRANG WEB
  const aiLogo = "/edutechcentrallogoai.png"; 

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

  const [messages, setMessages] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [attachedImage, setAttachedImage] = useState(null);
  const [attachedDoc, setAttachedDoc] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const API_URL = import.meta.env.VITE_API_AI_URL || "http://localhost:8000/api/v1/ai";

  // ==========================================
  // HÀM NGẮT (DỪNG) AI KHI ĐANG TRẢ LỜI
  // ==========================================
  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // ==========================================
  // LOGIC VOICE-TO-TEXT (THỰC SỰ GHI ÂM)
  // ==========================================
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Khuyên dùng Chrome hoặc Edge.");
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.lang = "vi-VN";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      const originalText = inputMessage;

      recognition.onstart = () => setIsRecording(true);
      
      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInputMessage(originalText + (originalText ? " " : "") + currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Lỗi Microphone:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => setIsRecording(false);

      recognition.start();
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // ==========================================
  // LOGIC CÁC TÍNH NĂNG MỚI (AUDIO, CROP, DRAW)
  // ==========================================
  const handleSpeak = (text, msgId) => {
    if (!window.speechSynthesis) return alert("Trình duyệt không hỗ trợ đọc giọng nói!");
    if (playingMsgId === msgId) {
      window.speechSynthesis.cancel(); setPlayingMsgId(null); return;
    }
    window.speechSynthesis.cancel();
    let cleanText = text.replace(/[*_#`]/g, '').replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.onend = () => setPlayingMsgId(null);
    utterance.onerror = () => setPlayingMsgId(null);
    window.speechSynthesis.speak(utterance);
    setPlayingMsgId(msgId);
  };
  useEffect(() => { return () => window.speechSynthesis && window.speechSynthesis.cancel(); }, []);

  const handleCropComplete = (croppedBase64) => {
    setAttachedImage(croppedBase64);
    setSelectedModel("deepseek-v4-flash-vision-exp");
    setImageToCrop(null);
  };

  const saveDrawing = () => {
    if (drawingCanvasRef.current) {
      setAttachedImage(drawingCanvasRef.current.toDataURL("image/png"));
      setSelectedModel("deepseek-v4-flash-vision-exp");
      setIsDrawingMode(false);
    }
  };

  let drawingContext = null; let isDrawingCanvas = false;
  const startDrawing = (e) => { isDrawingCanvas = true; draw(e); };
  const stopDrawing = () => { isDrawingCanvas = false; drawingContext?.beginPath(); };
  const draw = (e) => {
    if (!isDrawingCanvas || !drawingCanvasRef.current) return;
    const canvas = drawingCanvasRef.current;
    if (!drawingContext) drawingContext = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
    const y = e.clientY ? e.clientY - rect.top : e.touches[0].clientY - rect.top;

    drawingContext.lineWidth = 3; drawingContext.lineCap = "round"; drawingContext.strokeStyle = "#fff";
    drawingContext.lineTo(x, y); drawingContext.stroke();
    drawingContext.beginPath(); drawingContext.moveTo(x, y);
  };

  useEffect(() => {
    if (isDrawingMode && drawingCanvasRef.current) {
      const canvas = drawingCanvasRef.current;
      drawingContext = canvas.getContext("2d");
      drawingContext.fillStyle = "#1e293b";
      drawingContext.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [isDrawingMode]);

  // ==========================================
  // CORE LOGIC CỦA BẠN (GIỮ NGUYÊN 100%)
  // ==========================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { return () => stopCamera(); }, [cameraStream]);

  useEffect(() => {
    if (isCameraOpen && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOpen, cameraStream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCameraStream(mediaStream); setIsCameraOpen(true);
    } catch (error) {
      console.warn("Không thể mở Camera web, fallback dùng app mặc định của thiết bị.", error);
      cameraInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (cameraStream) { cameraStream.getTracks().forEach(track => track.stop()); setCameraStream(null); }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth; canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const photoData = canvas.toDataURL("image/jpeg", 0.8);
      setAttachedImage(photoData);
      setSelectedModel("deepseek-v4-flash-vision-exp");
      stopCamera();
    }
  };

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
      } catch {}
    };
    fetchModels();
  }, []);

  const fetchHistory = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = currentUser.id || currentUser._id || currentUser.uid || currentUser.userId || currentUser.email || currentUser.fullName || currentUser.full_name || "guest";
      const res = await fetch(`${API_URL}/chat/history?user_id=${userId}`);
      const data = await res.json();
      if (data.success) { return data.data; }
    } catch (err) { console.error("Lỗi tải lịch sử chat:", err); }
    return null;
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const params = new URLSearchParams(location.search);
      const urlSessionId = params.get("session");
      const openHistory = params.get("openHistory");

      if (openHistory === "true") setIsSidebarOpen(true);

      if (!urlSessionId) {
        setMessages([]); setCurrentSessionId(null); setAttachedImage(null); setAttachedDoc(null); return;
      }

      const historyData = await fetchHistory();
      if (historyData) {
        const targetSession = historyData.find(s => s.id === urlSessionId);
        if (targetSession) {
          const loadedMessages = targetSession.messages.map((msg, index) => {
            let textContent = msg.content; let imageUrl = null;
            if (Array.isArray(msg.content)) {
              const textObj = msg.content.find(item => item.type === "text");
              const imgObj = msg.content.find(item => item.type === "image_url");
              textContent = textObj ? textObj.text : ""; imageUrl = imgObj ? imgObj.image_url.url : null;
            }
            return { id: `loaded-${index}`, role: msg.role, content: textContent, image: imageUrl, time: "" };
          });
          setMessages(loadedMessages); setCurrentSessionId(targetSession.id); setSelectedSubject(targetSession.subject || "Tự động phát hiện");
        }
      }
    };
    loadInitialData();
  }, [location.search]);

  const promptSuggestions = [
    { icon: BookOpen, iconBg: "bg-indigo-50 text-indigo-500", title: "Giải chi tiết bài toán", desc: "Từng bước phương pháp giải", prompt: "Hãy hướng dẫn giải chi tiết bài toán này theo từng bước." },
    { icon: FileText, iconBg: "bg-emerald-50 text-emerald-500", title: "Tóm tắt tài liệu PDF", desc: "Rút gọn ý chính, công thức", prompt: "Hãy tóm tắt ngắn gọn các ý chính của tài liệu này." },
    { icon: Edit3, iconBg: "bg-amber-50 text-amber-500", title: "Kiểm tra ngữ pháp", desc: "Sửa văn phong, nâng cấp từ vựng", prompt: "Sửa lỗi ngữ pháp và nâng cấp từ vựng bài viết sau:" },
    { icon: ListChecks, iconBg: "bg-purple-50 text-purple-500", title: "Tạo bài trắc nghiệm", desc: "Kèm đáp án và giải thích", prompt: "Tạo 10 câu trắc nghiệm kèm đáp án và giải thích chi tiết." },
  ];

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    isAutoScrollEnabled.current = scrollHeight - scrollTop - clientHeight < 80;
  };

  useEffect(() => {
    if (chatContainerRef.current && isAutoScrollEnabled.current) chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
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
      setUploadingFile(true); const formData = new FormData(); formData.append("file", file);
      try {
        const res = await fetch(`${API_URL}/upload-document`, { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) setAttachedDoc({ filename: file.name, extractedText: data.data.extracted_text, fileType: ext.replace(".", "").toUpperCase() });
        else alert("Không thể phân tích file: " + (data.detail || "Lỗi đọc dữ liệu"));
      } catch { alert("Lỗi tải lên tài liệu!"); } finally { setUploadingFile(false); }
    } else alert("Định dạng chưa được hỗ trợ!");
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items; if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) { handleIncomingFile(items[i].getAsFile()); break; }
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); const files = e.dataTransfer.files; if (files && files.length > 0) handleIncomingFile(files[0]); };

  const formatLatex = (text) => {
    if (!text || typeof text !== "string") return "";
    return text.replace(/\\\((.*?)\\\)/g, "$$$1$$").replace(/\\\[([\s\S]*?)\\\]/g, "$$$$$1$$$$");
  };

  // ==========================================
  // XỬ LÝ GỬI TIN NHẮN (KHÔNG TỰ ĐỘNG CHÈN PROMPT MẶC ĐỊNH)
  // ==========================================
  const handleSendMessage = async (textToSend) => {
    const promptText = (textToSend || inputMessage).trim();
    if (!promptText && !attachedImage && !attachedDoc) return;
    if (loading || uploadingFile) return;

    let userPrompt = promptText;

    const currentImg = attachedImage; const currentDoc = attachedDoc;
    const userDisplayMessage = { id: Date.now().toString(), role: "user", content: userPrompt, image: currentImg, doc: currentDoc, time: "" };
    const assistantId = (Date.now() + 1).toString();
    const initialAssistantMessage = { id: assistantId, role: "assistant", content: "", model: selectedModel, time: "" };

    isAutoScrollEnabled.current = true;
    setMessages((prev) => [...prev, userDisplayMessage, initialAssistantMessage]);
    setInputMessage(""); setAttachedImage(null); setAttachedDoc(null); setLoading(true);

    if (isRecording) {
      toggleRecording();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    let accumulatedText = "";

    try {
      let finalPrompt = userPrompt;
      if (currentDoc && currentDoc.extractedText) {
        finalPrompt = `[NỘI DUNG TÀI LIỆU "${currentDoc.filename}"]:\n${currentDoc.extractedText.slice(0, 8000)}\n\n[YÊU CẦU CỦA HỌC SINH]:\n${userPrompt}`;
      }

      let messageContent = currentImg 
        ? [{ type: "text", text: finalPrompt || "" }, { type: "image_url", image_url: { url: currentImg } }] 
        : finalPrompt;

      const apiMessages = messages.map((m) => {
        if (m.image) return { role: m.role, content: [{ type: "text", text: m.content || "" }, { type: "image_url", image_url: { url: m.image } }] };
        return { role: m.role, content: m.content || "" };
      });
      apiMessages.push({ role: "user", content: messageContent });

      const systemInstruction = {
        role: "system",
        content: `Bạn là gia sư AI EduTech chuyên sâu. 
1. Nếu học sinh gửi tài liệu hoặc ảnh, nắm bắt chính xác câu hỏi hoặc lý thuyết.
2. Trình bày bài giải rõ ràng theo từng bước logic, chuẩn xác.
3. Đưa ra kết luận đáp số rõ ràng. Định hướng môn: ${selectedSubject}.`
      };

      const response = await fetch(`${API_URL}/chat/stream`, {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
        body: JSON.stringify({ model: currentImg ? "deepseek-v4-flash-vision-exp" : selectedModel, temperature: 0.3, messages: [systemInstruction, ...apiMessages] }),
        signal: signal
      });

      if (!response.ok || !response.body) throw new Error("Mất kết nối stream");

      const reader = response.body.getReader(); const decoder = new TextDecoder("utf-8"); 

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulatedText += decoder.decode(value, { stream: true });
        setMessages((prev) => prev.map((msg) => msg.id === assistantId ? { ...msg, content: accumulatedText } : msg));
      }

      try {
        const cleanHistory = [...messages, userDisplayMessage, { role: "assistant", content: accumulatedText }].map(m => ({ role: String(m.role), content: m.content || "" }));
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const rawUserId = currentUser.id || currentUser._id || currentUser.uid || currentUser.userId || currentUser.email || currentUser.fullName || currentUser.full_name || "guest";
        
        const saveRes = await fetch(`${API_URL}/chat/save`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: currentSessionId || null, user_id: String(rawUserId), subject: selectedSubject || "Chung", messages: cleanHistory })
        });
        
        const saveData = await saveRes.json();
        if (saveData.success) {
          if (!currentSessionId) setCurrentSessionId(saveData.session_id);
          const role = localStorage.getItem('role') || 'student';
          navigate(`/${role}/ai-assistant?session=${saveData.session_id || currentSessionId}`, { replace: true });
        }
      } catch (saveErr) { console.error("Lỗi tự động lưu lịch sử:", saveErr); }

    } catch (error) {
      if (error.name === 'AbortError') {
        try {
          const cleanHistory = [...messages, userDisplayMessage, { role: "assistant", content: accumulatedText }].map(m => ({ role: String(m.role), content: m.content || "" }));
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          const rawUserId = currentUser.id || currentUser._id || currentUser.uid || currentUser.userId || currentUser.email || currentUser.fullName || currentUser.full_name || "guest";
          const saveRes = await fetch(`${API_URL}/chat/save`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: currentSessionId || null, user_id: String(rawUserId), subject: selectedSubject || "Chung", messages: cleanHistory })
          });
          const saveData = await saveRes.json();
          if (saveData.success && !currentSessionId) setCurrentSessionId(saveData.session_id);
        } catch (saveErr) {}
      } else {
        setMessages((prev) => prev.map((msg) => msg.id === assistantId ? { ...msg, content: "❌ Không thể kết nối đến AI Service hoặc phiên kết nối bị gián đoạn." } : msg));
      }
    } finally { 
      setLoading(false); 
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };
  const handleCopy = (text, id) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };
  const handleResetChat = () => { const role = localStorage.getItem('role') || 'student'; navigate(`/${role}/ai-assistant`, { replace: true }); };

  const currentSelectedModelObj = availableModels.find(m => m.id === selectedModel) || { id: selectedModel, name: selectedModel, tag: "Tự chọn", type: "general" };

  const handleGenerateQuiz = () => {
    const prompt = `Tạo 3 câu trắc nghiệm tương tự bài vừa rồi. BẮT BUỘC TRẢ VỀ DUY NHẤT 1 BLOCK JSON (KHÔNG GHI GÌ THÊM), cấu trúc JSON như sau:
{"quiz": [ {"question": "Nội dung...", "options": ["A. ...", "B. ...", "C. ...", "D. ..."], "answerIndex": 0, "explanation": "Giải thích..."} ]}`;
    handleSendMessage(prompt);
  };

  // ==========================================
  // GIAO DIỆN CHAT INPUT (GEMINI STYLE)
  // ==========================================
  const renderModernChatInput = () => (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pb-6 pt-2 bg-white">
      <div className={`bg-white border shadow-sm rounded-3xl p-3 flex flex-col transition-all relative ${isRecording ? 'border-red-400 ring-4 ring-red-50' : 'border-slate-200/90 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50'}`}>
        
        {/* Vùng đính kèm file */}
        <div className="flex flex-wrap gap-2 px-1">
          {uploadingFile && (
             <div className="flex items-center space-x-2 p-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold animate-pulse mb-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Đang phân tích tài liệu...</span>
             </div>
          )}
          {attachedImage && (
            <div className="relative inline-flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-200 w-fit mb-2 group">
              <img src={attachedImage} alt="Preview" className="h-12 w-12 object-cover rounded-xl" />
              <div className="pr-3"><div className="text-[12px] font-bold text-slate-800">Ảnh đã tải lên</div></div>
              
              {/* NÚT CHỌN CẮT ẢNH: KHI BẤM NÚT NÀY MỚI MỞ POPUP CẮT */}
              <button 
                type="button" 
                onClick={() => setImageToCrop(attachedImage)} 
                className="p-1.5 rounded-full bg-slate-200 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                title="Khoanh vùng / Cắt ảnh này"
              >
                <Crop className="w-3.5 h-3.5" />
              </button>

              <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-800 text-white shadow hover:bg-red-500 transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
            </div>
          )}
          {attachedDoc && (
            <div className="relative inline-flex items-center gap-2 p-1.5 bg-blue-50 rounded-2xl border border-blue-200 w-fit mb-2">
              <span className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shadow-sm">{attachedDoc.fileType}</span>
              <div className="pr-3"><div className="text-[12px] font-bold text-slate-800 truncate max-w-[200px]">{attachedDoc.filename}</div></div>
              <button onClick={() => setAttachedDoc(null)} className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-800 text-white shadow hover:bg-red-500 transition-colors cursor-pointer"><X className="w-3 h-3" /></button>
            </div>
          )}
        </div>

        <textarea
          rows={Math.min(5, inputMessage.split('\n').length || 1)}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
          placeholder={isRecording ? "Đang lắng nghe (Hãy nói gì đó)..." : "Hỏi AI bất kỳ điều gì, dán đề bài (Nhấn Enter để gửi)..."}
          disabled={loading || uploadingFile}
          className="w-full bg-transparent border-none outline-none text-[15px] text-slate-800 placeholder:text-slate-400 px-3 py-2 resize-none custom-scrollbar min-h-[44px] disabled:opacity-50"
        />

        <div className="flex items-center justify-between pt-2 mt-1">
          <div className="flex items-center gap-1.5">
            <button onClick={() => docInputRef.current?.click()} disabled={loading || uploadingFile} className="p-2.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer" title="Đính kèm tài liệu PDF/Word">
              <Paperclip className="w-5 h-5" />
            </button>
            <button onClick={startCamera} disabled={loading || uploadingFile} className="p-2.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer" title="Chụp ảnh trực tiếp">
              <Camera className="w-5 h-5" />
            </button>
            <button onClick={() => setIsDrawingMode(true)} disabled={loading || uploadingFile} className="p-2.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors hidden sm:block cursor-pointer" title="Vẽ tay công thức">
              <PenTool className="w-5 h-5" />
            </button>
            
            <div className="relative ml-1">
              {isRecording ? (
                <button onClick={toggleRecording} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-600 transition-all animate-in zoom-in cursor-pointer">
                   <AudioLines className="w-5 h-5 animate-pulse" />
                   <span className="text-[13px] font-bold">Đang nghe...</span>
                   <Square className="w-3 h-3 ml-1 fill-current opacity-80" />
                </button>
              ) : (
                <button onClick={toggleRecording} disabled={loading || uploadingFile} className="p-2.5 rounded-full hover:bg-slate-100 text-slate-600 transition-all cursor-pointer" title="Nhập bằng giọng nói">
                   <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex items-center" ref={modelDropdownRef}>
              <button type="button" onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)} className="flex items-center gap-1.5 px-3 py-2 rounded-2xl hover:bg-slate-100 text-slate-700 transition-colors border border-transparent hover:border-slate-200 cursor-pointer">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span className="text-[13px] font-bold hidden sm:block max-w-[120px] truncate">{currentSelectedModelObj.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isModelDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isModelDropdownOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 origin-bottom-right">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Mô hình phân tích</div>
                  <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                    {availableModels.map((m) => (
                      <button key={m.id} onClick={() => { setSelectedModel(m.id); setIsModelDropdownOpen(false); }} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${selectedModel === m.id ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-700"}`}>
                        {m.type === "vision" ? <Eye className="w-4 h-4 text-emerald-500 shrink-0" /> : m.type === "reasoning" ? <BrainCircuit className="w-4 h-4 text-purple-500 shrink-0" /> : <Gauge className="w-4 h-4 text-blue-500 shrink-0" />}
                        <div className="flex flex-col min-w-0">
                          <span className="text-[12px] font-bold truncate">{m.name}</span>
                          <span className="text-[10px] opacity-70 truncate">{m.tag}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <button
                onClick={stopGenerating}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-red-100 text-red-600 hover:bg-red-200 shadow-md hover:scale-105 cursor-pointer"
                title="Dừng tạo phản hồi"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={() => handleSendMessage()}
                disabled={uploadingFile || (!inputMessage.trim() && !attachedImage && !attachedDoc)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  (inputMessage.trim() || attachedImage || attachedDoc)
                    ? "bg-slate-900 text-white hover:bg-black shadow-md hover:scale-105"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <ArrowUp className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // RENDER GIAO DIỆN CHÍNH TRANG CHAT
  // ==========================================
  return (
    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className="flex flex-col h-[calc(100vh-4.5rem)] w-full bg-white font-sans text-slate-800 antialiased overflow-hidden select-none relative">
      
      {/* 1. OVERLAY CAMERA */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <button onClick={stopCamera} className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"><X className="w-6 h-6" /></button>
          <div className="relative w-full max-w-lg aspect-[3/4] sm:aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 sm:p-12"><div className="w-full h-full border-2 border-white/30 rounded-2xl border-dashed"></div></div>
          </div>
          <div className="mt-8 flex flex-col items-center gap-4">
            <button onClick={capturePhoto} className="w-16 h-16 rounded-full border-[3px] border-white/50 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-all group p-1 cursor-pointer"><div className="w-full h-full rounded-full bg-white group-hover:scale-90 transition-transform shadow-lg" /></button>
            <p className="text-white/70 text-sm font-medium">Nhấn để chụp</p>
          </div>
        </div>
      )}

      {/* 2. OVERLAY KHOANH VÙNG CẮT ẢNH CHUYÊN NGHIỆP */}
      {imageToCrop && (
        <ImageCropperModal
          imageSrc={imageToCrop}
          onClose={() => setImageToCrop(null)}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* 3. OVERLAY BẢNG VẼ CÔNG THỨC */}
      {isDrawingMode && (
        <div className="fixed inset-0 z-[999] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#1e293b] rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
               <h3 className="font-bold text-white flex items-center gap-2"><PenTool className="w-5 h-5 text-amber-400"/> Bảng nháp viết tay</h3>
               <button onClick={() => setIsDrawingMode(false)} className="p-1 rounded-full bg-slate-700 text-white hover:bg-red-500 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <canvas ref={drawingCanvasRef} width={800} height={400} className="w-full h-[400px] cursor-crosshair touch-none" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseOut={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} />
            <div className="p-4 bg-slate-800 flex justify-end gap-3">
              <button onClick={() => { const c = drawingCanvasRef.current; c.getContext('2d').fillRect(0,0,c.width,c.height); }} className="px-4 py-2 rounded-xl bg-slate-700 text-white text-sm font-bold hover:bg-slate-600 cursor-pointer">Xóa bảng</button>
              <button onClick={saveDrawing} className="px-4 py-2 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 cursor-pointer">Gửi bản nháp</button>
            </div>
          </div>
        </div>
      )}

      {/* DRAG & DROP OVERLAY */}
      {isDragging && (
        <div className="fixed inset-0 bg-blue-600/10 backdrop-blur-md border-4 border-dashed border-blue-500 z-50 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-3xl bg-white shadow-2xl flex items-center justify-center text-blue-600 animate-bounce"><ImageIcon className="w-10 h-10" /></div>
          <p className="text-lg font-bold text-blue-950 mt-4">Thả file vào đây</p>
        </div>
      )}

      <input type="file" ref={docInputRef} onChange={(e) => { handleIncomingFile(e.target.files?.[0]); e.target.value = ""; }} accept="image/*,.pdf,.doc,.docx,.txt" className="hidden" />
      <input type="file" ref={cameraInputRef} onChange={(e) => { handleIncomingFile(e.target.files?.[0]); e.target.value = ""; }} accept="image/*" capture="environment" className="hidden" />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col h-full w-full bg-white relative overflow-hidden">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/30">
              <div className="h-14 px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/70 backdrop-blur-md z-20">
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="text-xs bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 font-medium text-slate-600 outline-none cursor-pointer hidden sm:block">
                  <option value="Tự động phát hiện">🎯 Nhận diện môn học</option>
                  <option value="Toán học 12">📐 Toán học</option>
                  <option value="Vật lý 12">⚡ Vật lý</option>
                  <option value="Hóa học 12">🧪 Hóa học</option>
                </select>
                <button onClick={() => navigate(`/${localStorage.getItem('role') || 'student'}/ai-history`)} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer"><History className="w-3.5 h-3.5" /><span className="hidden sm:inline">Lịch sử</span></button>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col p-4 md:p-6 w-full custom-scrollbar">
                <div className="flex flex-col items-center max-w-2xl mx-auto w-full text-center space-y-5 my-auto py-4 md:py-8 animate-in fade-in duration-300">
                  
                  {/* LOGO MÀN HÌNH CHÍNH (KHÔNG KHUNG, BÓNG TỰ NHIÊN) */}
                  <div className="flex items-center justify-center">
                    <img 
                      src={aiLogo} 
                      alt="EduTech AI Logo" 
                      className="h-24 sm:h-28 w-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] hover:scale-105 transition-transform duration-500" 
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} 
                    />
                    <Sparkles className="w-10 h-10 text-indigo-600 hidden" />
                  </div>
                  
                  {/* HIỆU ỨNG GÕ CHỮ */}
                  <div className="space-y-1 px-2">
                    <AnimatedGreeting />
                    <p className="text-[13px] sm:text-[14px] text-slate-500 max-w-md mx-auto leading-relaxed">
                      Sẵn sàng đồng hành cùng bạn giải bài tập, phân tích tài liệu và nâng cao năng lực học tập mỗi ngày.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
                    {promptSuggestions.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <button key={idx} onClick={() => handleSendMessage(item.prompt)} className="p-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-xs transition-all flex items-start space-x-3 bg-white text-left group cursor-pointer">
                          <div className={`p-2 rounded-xl shrink-0 ${item.iconBg}`}><Icon className="w-4.5 h-4.5" /></div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[12px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{item.title}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{item.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="shrink-0 w-full bg-white border-t border-slate-100">{renderModernChatInput()}</div>
            </div>
          ) : (
            <div className="flex flex-col h-full w-full bg-slate-50/40">
              <header className="h-14 border-b border-slate-200/70 px-6 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md z-10">
                <button onClick={handleResetChat} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"><LayoutDashboard className="w-3.5 h-3.5 text-blue-600" /><span className="hidden sm:block">Trang chính</span></button>
                <div className="flex items-center space-x-2">
                  <button onClick={() => navigate(`/${localStorage.getItem('role') || 'student'}/ai-history`)} className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"><History className="w-3.5 h-3.5 text-slate-500" /></button>
                  <button onClick={handleResetChat} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /><span className="hidden sm:inline">Mới</span></button>
                </div>
              </header>

              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col h-full">
                  <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scroll-smooth bg-white">
                    <div className="max-w-3xl mx-auto space-y-6">
                      {messages.map((m) => {
                        let isQuizContent = false; let quizData = null;
                        if (m.role === "assistant" && m.content.includes('"quiz"')) {
                          try { const jsonStr = m.content.match(/\{[\s\S]*"quiz"[\s\S]*\}/); if (jsonStr) { const parsed = JSON.parse(jsonStr[0]); if (parsed.quiz && Array.isArray(parsed.quiz)) { isQuizContent = true; quizData = parsed.quiz; } } } catch (e) {}
                        }

                        return (
                        <div key={m.id} className={`flex gap-3.5 ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in duration-300`}>
                          
                          {/* LOGO AVATAR CỦA BOT TRONG ĐOẠN CHAT */}
                          {m.role === "assistant" && (
                            <div className="h-10 w-10 flex items-center justify-center shrink-0 mt-0.5 z-10 bg-transparent">
                              <img 
                                src={aiLogo} 
                                alt="AI" 
                                className="w-full h-full object-contain drop-shadow-md" 
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} 
                              />
                              <div className="hidden w-full h-full items-center justify-center bg-indigo-600 text-white rounded-xl shadow-sm">
                                <Bot className="w-5 h-5" />
                              </div>
                            </div>
                          )}

                          <div className={`max-w-[88%] rounded-3xl p-4.5 space-y-2 ${m.role === "user" ? "bg-slate-900 text-white shadow-md rounded-tr-xs" : "bg-white border border-slate-200/90 shadow-sm text-slate-800 rounded-tl-xs"}`}>
                            {m.image && <div className="relative overflow-hidden rounded-2xl border border-slate-200 mb-2 bg-slate-50"><img src={m.image} alt="Bài tập" className="max-h-64 max-w-full object-contain rounded-2xl" /></div>}
                            {m.doc && <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl mb-2 border border-slate-200"><span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase font-bold">{m.doc.fileType}</span><span className="text-sm font-semibold text-slate-700">{m.doc.filename}</span></div>}

                            {/* Chỉ hiển thị bong bóng chữ khi có nội dung gõ */}
                            {(m.content || (!m.image && !m.doc)) && (
                              <div className={`text-[15px] leading-relaxed ${m.role === "user" ? "text-slate-100" : "text-slate-800"} prose prose-slate max-w-none prose-p:my-1.5 prose-pre:bg-slate-900 prose-pre:text-slate-100`}>
                                {isQuizContent && quizData ? <InteractiveQuiz quizData={quizData} /> : <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{formatLatex(m.content)}</ReactMarkdown>}
                                {loading && m.role === "assistant" && m.id === messages[messages.length - 1]?.id && <span className="inline-block w-2.5 h-2.5 ml-1 bg-blue-600 rounded-full animate-bounce align-middle" />}
                              </div>
                            )}

                            {m.role === "assistant" && m.content && !isQuizContent && (
                              <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 border-t border-slate-100 text-[12px] text-slate-500 font-medium select-none">
                                <button onClick={() => handleSpeak(m.content, m.id)} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors cursor-pointer ${playingMsgId === m.id ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-100 hover:text-slate-700"}`}>
                                  {playingMsgId === m.id ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-4 h-4" />}
                                  {playingMsgId === m.id ? "Đang phát..." : "Nghe giảng"}
                                </button>
                                <div className="w-px h-3 bg-slate-300"></div>
                                <button onClick={handleGenerateQuiz} className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer"><Zap className="w-4 h-4" /> Luyện tập tiếp</button>
                                <div className="w-px h-3 bg-slate-300"></div>
                                <button onClick={() => handleCopy(m.content, m.id)} className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer">
                                  {copiedId === m.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />} {copiedId === m.id ? "Đã chép" : "Sao chép"}
                                </button>
                              </div>
                            )}
                          </div>
                          {m.role === "user" && <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 mt-1 overflow-hidden shadow-sm border border-slate-200">{userAvatar ? <img src={userAvatar} alt="User" /> : <User className="w-4 h-4 text-slate-600" />}</div>}
                        </div>
                      )})}
                    </div>
                  </div>
                  <div className="shrink-0 w-full bg-gradient-to-t from-slate-50 to-transparent pt-2">{renderModernChatInput()}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}