import React, { useState, useEffect, useRef } from "react"
import Header from "../components/Header"
import Footer from "../components/Footer"
import HeroBackground3D from "../components/HeroBackground3D"
import { motion, useInView, animate } from "framer-motion"
import confetti from "canvas-confetti"
import {
  Video,
  BrainCircuit,
  Award,
  Users,
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Play,
  Bot,
  Sparkles,
  BarChart3,
  Send,
  Mic,
  GraduationCap,
  Compass,
  Star,
  ShieldCheck,
  TrendingUp,
  Zap,
  Radio,
  Cpu,
  Activity,
  Globe2,
  ChevronDown,
  ChevronRight,
  Layers,
  Laptop,
  Check,
  Headphones,
  HelpCircle,
  Code2,
  Rocket,
  Atom
} from "lucide-react"

// Component đếm số tự động khi cuộn màn hình
function AnimatedCounter({ from = 0, to, duration = 2.2, suffix = "" }) {
  const nodeRef = useRef(null)
  const isInView = useInView(nodeRef, { once: false, amount: 0.3 })

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    if (isInView) {
      const controls = animate(from, to, {
        duration: duration,
        ease: [0.16, 1, 0.3, 1],
        onUpdate(value) {
          node.textContent = Math.floor(value).toLocaleString() + suffix
        }
      })
      return () => controls.stop()
    } else {
      node.textContent = from.toLocaleString() + suffix
    }
  }, [isInView, from, to, duration, suffix])

  return <span ref={nodeRef}>{from}{suffix}</span>
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("meet")
  const [openFaq, setOpenFaq] = useState(null)

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#00f0ff", "#ff9100", "#ffffff", "#0072ff", "#10b981"]
    })
  }

  // Cấu hình variants giúp các section tự động hiển thị mượt mà khi lướt lên/xuống
  const sectionVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.96 },
    visible: (custom = 0) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        delay: custom * 0.1,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  }

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="relative min-h-screen text-slate-800 font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden">
      
      {/* Background 3D cố định phía sau */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <HeroBackground3D />
      </div>

      {/* Header chính */}
      <div className="relative z-50">
        <Header />
      </div>

      <main className="relative z-10 space-y-28 pb-16">
        
        {/* ================= SECTION 1: HERO ================= */}
        <section className="relative min-h-[720px] w-full flex items-center justify-center pt-8">
          <motion.div
            initial={{ opacity: 0, x: -60, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden xl:block absolute left-10 top-20 bg-white/85 backdrop-blur-2xl border border-white/90 p-5.5 rounded-3xl shadow-[0_20px_45px_rgba(0,100,255,0.18)] space-y-3 w-80 z-20 hover:border-cyan-400 transition duration-300"
          >
            <div className="flex items-center space-x-2 text-xs font-black text-blue-600">
              <Bot className="w-4.5 h-4.5 text-blue-600 animate-bounce" />
              <span className="tracking-wider uppercase">AI TUTOR ACTIVE</span>
            </div>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              &quot;Phân tích kỹ năng: Bạn đạt <span className="text-orange-600 font-bold">94%</span> lộ trình Lập trình Web Fullstack & Machine Learning.&quot;
            </p>
            <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden border border-white p-0.5">
              <div className="bg-gradient-to-r from-blue-600 via-cyan-500 to-orange-500 h-full rounded-full w-[94%] shadow-sm" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden xl:block absolute right-10 bottom-16 bg-white/85 backdrop-blur-2xl border border-white/90 p-5.5 rounded-3xl shadow-[0_20px_45px_rgba(255,100,0,0.18)] space-y-3 w-80 z-20 hover:border-orange-400 transition duration-300"
          >
            <div className="flex items-center justify-between text-xs font-black">
              <div className="flex items-center space-x-1.5 text-orange-600">
                <Video className="w-4 h-4" />
                <span className="tracking-wider uppercase">VR CLASSROOM</span>
              </div>
              <span className="bg-orange-500 text-white font-extrabold px-3 py-0.5 rounded-full text-[10px] shadow-sm animate-pulse">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-900 font-bold">Thực hành Phòng lab Thực tế ảo AI</p>
            <div className="flex items-center space-x-2 pt-1">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <p className="text-[11px] text-slate-600 font-semibold">45 Học viên đang tương tác trực tiếp</p>
            </div>
          </motion.div>

          <div className="max-w-6xl mx-auto px-6 text-center space-y-7">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="inline-flex items-center space-x-2 bg-white/85 text-blue-900 text-xs font-black px-7 py-3 rounded-full border border-white shadow-xl backdrop-blur-xl tracking-widest uppercase">
                <Sparkles className="w-4 h-4 text-cyan-500 animate-spin" />
                <span>EDUTECH CENTRAL ECOSYSTEM</span>
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-3"
            >
              <h2 className="text-2xl md:text-3xl font-black text-amber-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] tracking-wide uppercase">
                Trang chủ EduTech Central
              </h2>
              <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-tight text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
                Khai phá tiềm năng tương lai với <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-amber-200">công nghệ giáo dục</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl mx-auto bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-white/30 shadow-2xl"
            >
              <p className="text-white font-medium text-base md:text-xl leading-relaxed drop-shadow">
                Nền tảng học tập trực tuyến tích hợp Google Meet 4.0, hệ thống kiểm tra AI tự động và phòng Lab thực tế ảo chuẩn quốc tế.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="pt-3 flex flex-wrap items-center justify-center gap-6"
            >
              <motion.button
                whileHover={{ scale: 1.08, boxShadow: "0px 0px 40px rgba(255, 145, 0, 0.8)" }}
                whileTap={{ scale: 0.95 }}
                onClick={triggerConfetti}
                className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-black text-base px-10 py-4.5 rounded-2xl shadow-2xl transition duration-200 cursor-pointer border border-amber-200/50"
              >
                <span>Khám phá ngay</span>
                <Send className="w-4.5 h-4.5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08, boxShadow: "0px 0px 40px rgba(0, 180, 255, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex items-center space-x-3 bg-white/20 hover:bg-white/30 text-white font-black text-base px-9 py-4.5 rounded-2xl backdrop-blur-xl border-2 border-white/80 shadow-2xl transition duration-200 cursor-pointer"
              >
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-600 font-bold shadow-md group-hover:scale-110 transition">
                  <Play className="w-3.5 h-3.5 fill-blue-600 ml-0.5" />
                </span>
                <span className="text-white group-hover:text-amber-200 transition">Xem Video Lớp Học Meet</span>
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* ================= SECTION 2: METRICS MATRIX ================= */}
        <section className="max-w-[1530px] mx-auto px-6 md:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={sectionVariants}
            custom={0}
            className="bg-slate-950/85 backdrop-blur-3xl border border-cyan-500/30 rounded-[36px] p-8 md:p-12 shadow-[0_0_60px_rgba(0,180,255,0.18)] relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800/90 pb-6 mb-10">
              <div className="flex items-center space-x-3">
                <span className="flex h-3.5 w-3.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500"></span>
                </span>
                <span className="text-cyan-400 font-mono text-xs md:text-sm font-black uppercase tracking-widest">
                  LIVE TELEMETRY MATRIX // REALTIME SYSTEM METRICS
                </span>
              </div>
              <span className="hidden md:inline-flex items-center text-xs text-slate-300 font-mono bg-slate-900/90 border border-slate-800 px-4 py-1.5 rounded-full shadow-inner">
                <Activity className="w-4 h-4 text-emerald-400 mr-2 animate-pulse" /> SYSTEM STATUS: 100% ONLINE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <motion.div variants={sectionVariants} custom={1} className="bg-slate-900/90 border border-slate-800 p-7 rounded-3xl flex flex-col justify-between space-y-5">
                <div className="flex justify-between items-center">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 flex items-center justify-center">
                    <Globe2 className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2.5 py-1 rounded-md">#GLOBAL</span>
                </div>
                <div>
                  <div className="text-4xl xl:text-5xl font-black text-white font-mono">
                    <AnimatedCounter to={100000} suffix="+" />
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 font-bold uppercase mt-2">Học Viên Toàn Cầu</p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-mono">
                  <span className="flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1" /> +24% MTH</span>
                  <span className="text-slate-500">142 Quốc gia</span>
                </div>
              </motion.div>

              <motion.div variants={sectionVariants} custom={2} className="bg-slate-900/90 border border-slate-800 p-7 rounded-3xl flex flex-col justify-between space-y-5">
                <div className="flex justify-between items-center">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-400/30 text-orange-400 flex items-center justify-center">
                    <Radio className="w-7 h-7 animate-pulse" />
                  </div>
                  <span className="text-xs font-mono text-orange-300 bg-orange-950/80 border border-orange-800 px-2.5 py-1 rounded-md">#LIVE_MEET</span>
                </div>
                <div>
                  <div className="text-4xl xl:text-5xl font-black text-white font-mono">
                    <AnimatedCounter to={500} suffix="+" />
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 font-bold uppercase mt-2">Lớp Meet Tương Tác</p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-orange-400 font-mono">
                  <span className="flex items-center"><Zap className="w-3.5 h-3.5 mr-1" /> Latency &lt;15ms</span>
                  <span className="text-slate-500">Full HD Stream</span>
                </div>
              </motion.div>

              <motion.div variants={sectionVariants} custom={3} className="bg-slate-900/90 border border-slate-800 p-7 rounded-3xl flex flex-col justify-between space-y-5">
                <div className="flex justify-between items-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center">
                    <Cpu className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-md">#AI_ENGINE</span>
                </div>
                <div>
                  <div className="text-4xl xl:text-5xl font-black text-white font-mono">
                    <AnimatedCounter to={1200000} suffix="+" />
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 font-bold uppercase mt-2">Bài Thi AI Đã Chấm</p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-mono">
                  <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 99.8% Acc.</span>
                  <span className="text-slate-500">Tốc độ &lt;3s</span>
                </div>
              </motion.div>

              <motion.div variants={sectionVariants} custom={4} className="bg-slate-900/90 border border-slate-800 p-7 rounded-3xl flex flex-col justify-between space-y-5">
                <div className="flex justify-between items-center">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-400/30 text-purple-400 flex items-center justify-center">
                    <Bot className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-mono text-purple-300 bg-purple-950/80 border border-purple-800 px-2.5 py-1 rounded-md">#AI_PROCTOR</span>
                </div>
                <div>
                  <div className="text-4xl xl:text-5xl font-black text-white font-mono">24/7</div>
                  <p className="text-xs md:text-sm text-slate-400 font-bold uppercase mt-2">Trợ Lý AI Giám Sát</p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-purple-400 font-mono">
                  <span className="flex items-center"><Sparkles className="w-3.5 h-3.5 mr-1" /> Auto Note</span>
                  <span className="text-slate-500">Feedback Realtime</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ================= SECTION 3: CORE FEATURES HIGHLIGHTS ================= */}
        <section className="max-w-7xl mx-auto px-6 space-y-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={sectionVariants}
            className="text-center space-y-3 max-w-3xl mx-auto"
          >
            <span className="bg-orange-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md border border-orange-400">
              CÔNG NGHỆ BỘT BẤT
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
              Hệ sinh thái học tập hiện đại nhất
            </h2>
            <p className="text-slate-600 text-base font-medium">
              Kết hợp hoàn hảo giữa mô hình giảng dạy trực tiếp, trợ lý trí tuệ nhân tạo và kho học liệu tương tác 3D.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              variants={sectionVariants}
              custom={1}
              whileHover={{ y: -8 }}
              className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-5 relative overflow-hidden group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                <Video className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Google Meet 4.0 Tích Hợp</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Tham gia lớp học trực tuyến mượt mà với chất lượng HD, tự động điểm danh bằng khuôn mặt và ghi lại bài giảng với AI summary.
              </p>
              <div className="pt-2 flex items-center text-xs font-bold text-blue-600 space-x-1">
                <span>Tìm hiểu công nghệ Stream</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              variants={sectionVariants}
              custom={2}
              whileHover={{ y: -8 }}
              className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-5 relative overflow-hidden group"
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition duration-300">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">AI Tutor Cá Nhân Hóa</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Gia sư AI đồng hành 24/7, phát hiện lỗ hổng kiến thức, phân tích điểm mạnh yếu và đề xuất lộ trình ôn tập độc bản cho từng học viên.
              </p>
              <div className="pt-2 flex items-center text-xs font-bold text-amber-600 space-x-1">
                <span>Trải nghiệm Trợ lý AI</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              variants={sectionVariants}
              custom={3}
              whileHover={{ y: -8 }}
              className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-lg space-y-5 relative overflow-hidden group"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition duration-300">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Thư Viện & Phòng Lab VR</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Hàng ngàn file PDF, SCORM, video Edu chuẩn hóa cùng môi trường thực hành mô phỏng 3D trực quan sinh động.
              </p>
              <div className="pt-2 flex items-center text-xs font-bold text-emerald-600 space-x-1">
                <span>Khám phá Thư viện số</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ================= SECTION 4: INTERACTIVE DEMO TAB ================= */}
        <section className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={sectionVariants}
            className="bg-slate-900 rounded-[32px] p-8 md:p-12 text-white shadow-2xl space-y-8 border border-slate-800"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-black">Trải nghiệm tính năng đột phá</h3>
                <p className="text-slate-400 text-sm font-medium">Chọn tab bên dưới để xem cách hệ thống hỗ trợ việc học của bạn</p>
              </div>

              {/* Tab Selector */}
              <div className="flex flex-wrap gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  onClick={() => setActiveTab("meet")}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "meet" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Lớp Meet 4.0
                </button>
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "ai" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  AI Tóm Tắt & Note
                </button>
                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === "quiz" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Chấm Bài Thi AI
                </button>
              </div>
            </div>

            {/* Content hiển thị theo Tab */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-4">
              {activeTab === "meet" && (
                <>
                  <div className="space-y-5">
                    <span className="bg-blue-500/20 text-blue-400 font-mono text-xs font-bold px-3 py-1 rounded-md">#SMART_CLASSROOM</span>
                    <h4 className="text-2xl font-bold">Tương tác trực tiếp không khoảng cách</h4>
                    <ul className="space-y-3 text-slate-300 text-sm font-medium">
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Tự động quay video bài giảng Full HD và lưu trên Cloud.</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Hỗ trợ chia sẻ bảng trắng tương tác đa điểm.</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Tạo phòng nhóm thảo luận (Breakout rooms) tự động.</span>
                      </li>
                    </ul>
                    <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer">
                      Thử nghiệm ngay
                    </button>
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-950 aspect-video flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&auto=format&fit=crop&q=80"
                      alt="Google Meet Classroom"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-6">
                      <div className="flex items-center space-x-3 text-xs font-bold">
                        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <span>Đang diễn ra: Lớp Giải Tích Nâng Cao (48 Học Viên)</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "ai" && (
                <>
                  <div className="space-y-5">
                    <span className="bg-amber-500/20 text-amber-400 font-mono text-xs font-bold px-3 py-1 rounded-md">#AI_NOTE_TAKER</span>
                    <h4 className="text-2xl font-bold">Tự động ghi chép & Trích xuất ý chính</h4>
                    <p className="text-slate-300 text-sm font-medium leading-relaxed">
                      AI lắng nghe bài giảng theo thời gian thực, tự động ghi chú các mốc quan trọng, tạo flashcard và bản tóm tắt PDF tải về tức thì.
                    </p>
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                      <p className="text-amber-400">[02:15] Công thức tính đạo hàm hợp</p>
                      <p className="text-slate-400">[12:30] Ví dụ ứng dụng thực tế trong AI Optimization</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-700 p-6 bg-slate-950 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-xs font-bold text-slate-400">Bản tóm tắt tự động</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Hoàn thành</span>
                    </div>
                    <div className="space-y-2 text-xs text-slate-300">
                      <p className="font-bold text-white">Chủ đề: Tối ưu hóa Gradient Descent</p>
                      <p>• Định nghĩa và ý nghĩa của hệ số Learning Rate.</p>
                      <p>• Các lỗi thường gặp khi chọn Learning Rate quá lớn.</p>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "quiz" && (
                <>
                  <div className="space-y-5">
                    <span className="bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold px-3 py-1 rounded-md">#AUTO_GRADING</span>
                    <h4 className="text-2xl font-bold">Chấm điểm & Phản hồi trong 3 giây</h4>
                    <p className="text-slate-300 text-sm font-medium leading-relaxed">
                      Hệ thống tự động phân tích câu trả lời trắc nghiệm lẫn tự luận, đưa ra giải thích chi tiết và gợi ý tài liệu học lại phần bị hổng.
                    </p>
                    <div className="flex items-center space-x-4 pt-2">
                      <div className="text-center">
                        <span className="text-2xl font-black text-emerald-400">99.8%</span>
                        <p className="text-[10px] text-slate-400">Độ chính xác</p>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl font-black text-cyan-400">&lt; 3s</span>
                        <p className="text-[10px] text-slate-400">Thời gian trả bài</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-700 p-6 bg-slate-950 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Kết quả bài thi Python Basic</span>
                      <span className="text-emerald-400 font-black text-lg">9.5/10</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[95%]" />
                    </div>
                    <p className="text-[11px] text-slate-400 italic">
                      &quot;AI nhận xét: Bạn nắm rất vững cấu trúc dữ liệu List và Dict. Cần chú ý thêm về List Comprehension.&quot;
                    </p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </section>

        {/* ================= SECTION 5: LỘ TRÌNH HỌC TẬP (LEARNING PATH) ================= */}
        <section className="max-w-7xl mx-auto px-6 space-y-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={sectionVariants}
            className="text-center space-y-3 max-w-3xl mx-auto"
          >
            <span className="bg-orange-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md border border-orange-400">
              LỘ TRÌNH CHUẨN HOÁ
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
              4 Bước chinh phục tri thức
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {[
              { num: "01", color: "bg-blue-600", title: "Đánh Giá Đầu Vào", desc: "Bài kiểm tra AI giúp xác định chính xác trình độ hiện tại và mục tiêu mong muốn." },
              { num: "02", color: "bg-cyan-500", title: "Nhận Lộ Trình AI", desc: "Thực đơn bài học cá nhân hóa được tự động thiết lập riêng cho từng học viên." },
              { num: "03", color: "bg-amber-500", title: "Học Trực Tuyến & Lab", desc: "Tham gia lớp Meet tương tác, thực hành trực tiếp tại phòng Lab thực tế ảo." },
              { num: "04", color: "bg-emerald-500", title: "Nhận Chứng Chỉ AI", desc: "Hoàn thành dự án thực tế, nhận chứng chỉ xác thực trên hệ thống Blockchain." }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                variants={sectionVariants}
                custom={idx + 1}
                whileHover={{ y: -6 }}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4 relative"
              >
                <span className={`w-10 h-10 rounded-2xl ${step.color} text-white font-black text-sm flex items-center justify-center`}>
                  {step.num}
                </span>
                <h4 className="font-bold text-lg text-slate-900">{step.title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= SECTION 6: INSTRUCTORS & MENTORS ================= */}
        <section className="max-w-7xl mx-auto px-6 space-y-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={sectionVariants}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <span className="bg-orange-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md border border-orange-400">ĐỘI NGŨ GIẢNG VIÊN</span>
              <h2 className="text-3xl font-black text-white tracking-tight mt-3 drop-shadow-md">Chuyên gia hàng đầu đồng hành</h2>
            </div>
            <button className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1 cursor-pointer">
              <span>Xem tất cả giảng viên</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "TS. Sarah Jenkins", role: "Chuyên gia AI & Machine Learning", exp: "10+ năm kinh nghiệm giảng dạy tại Đại học Quốc gia", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80" },
              { name: "Thầy Phạm Minh Tuấn", role: "Thạc sĩ Toán Chuyên & Data Science", exp: "Tác giả hàng loạt bộ đề luyện thi THPT Quốc gia", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80" },
              { name: "GS. Mark Reed", role: "Chuyên gia Vật Lý Hiện Đại", exp: "Cố vấn chương trình STEM Quốc Tế", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80" },
              { name: "ThS. Nguyễn Hoàng Nam", role: "Kỹ sư Kiến trúc Phần mềm", exp: "Giảng viên Lập trình Web Fullstack", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80" }
            ].map((instructor, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                variants={sectionVariants}
                custom={idx + 1}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm space-y-3 p-4"
              >
                <img
                  src={instructor.img}
                  alt={instructor.name}
                  className="w-full h-48 object-cover rounded-2xl"
                />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{instructor.name}</h4>
                  <p className="text-[11px] text-blue-600 font-semibold">{instructor.role}</p>
                  <p className="text-[11px] text-slate-500">{instructor.exp}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= SECTION 7: STUDENT FEEDBACK & REVIEWS ================= */}
        <section className="max-w-7xl mx-auto px-6 space-y-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={sectionVariants}
            className="text-center space-y-2"
          >
            <span className="bg-orange-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md border border-orange-400">CẢM NHẬN HỌC VIÊN</span>
            <h2 className="text-3xl font-black text-white tracking-tight pt-1 drop-shadow-md">Hơn 100,000+ niềm tin trao gửi</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Trần Anh Khoa", role: "Học sinh Khối 12 - Chuyên Toán", text: "Tính năng AI tóm tắt bài giảng giúp mình tiết kiệm 50% thời gian ghi chép. Lớp Meet học rất mượt, không bao giờ bị giật lag!", bg: "bg-blue-100", color: "text-blue-600", initial: "AN" },
              { name: "Lê Ngọc Phương Anh", role: "Học viên Lập trình Web", text: "Phòng Lab VR thực sự ấn tượng. Mình được tự tay thao tác các mô hình hóa học 3D mà trước đây chỉ thấy trên sách vở.", bg: "bg-orange-100", color: "text-orange-600", initial: "LN" },
              { name: "Vũ Minh Hoàng", role: "Học sinh Lớp 12A1", text: "Nhờ AI Proctor phân tích điểm yếu, mình đã cải thiện rõ rệt điểm số môn Vật Lý từ 6.5 lên 9.0 chỉ sau 2 tháng học!", bg: "bg-emerald-100", color: "text-emerald-600", initial: "VT" }
            ].map((review, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                variants={sectionVariants}
                custom={idx + 1}
                whileHover={{ y: -6 }}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex text-amber-400 space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                    &quot;{review.text}&quot;
                  </p>
                </div>
                <div className="flex items-center space-x-3 pt-2">
                  <div className={`w-9 h-9 rounded-full ${review.bg} ${review.color} font-bold text-xs flex items-center justify-center`}>
                    {review.initial}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">{review.name}</h5>
                    <p className="text-[10px] text-slate-400">{review.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= SECTION 8: PRICING / MEMBERSHIP PLANS ================= */}
        <section className="max-w-7xl mx-auto px-6 space-y-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={sectionVariants}
            className="text-center space-y-2 max-w-2xl mx-auto"
          >
            <span className="bg-orange-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md border border-orange-400">GÓI HỌC VIÊN</span>
            <h2 className="text-3xl font-black text-white tracking-tight pt-1 drop-shadow-md">Lựa chọn lộ trình phù hợp với bạn</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              variants={sectionVariants}
              custom={1}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-500 uppercase">CƠ BẢN</span>
                <div className="space-y-1">
                  <span className="text-3xl font-black text-slate-900">Miễn phí</span>
                  <p className="text-xs text-slate-500">Dành cho học viên trải nghiệm ban đầu</p>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-600 pt-2">
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-500" /> <span>Truy cập 50+ bài giảng miễn phí</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-500" /> <span>Tham gia lớp Meet công khai</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-500" /> <span>AI tóm tắt cơ bản (3 lần/tuần)</span></li>
                </ul>
              </div>
              <button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs transition cursor-pointer">
                Đăng ký ngay
              </button>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              variants={sectionVariants}
              custom={2}
              whileHover={{ y: -8 }}
              className="bg-gradient-to-b from-blue-600 to-indigo-700 text-white rounded-3xl p-8 shadow-xl space-y-6 flex flex-col justify-between relative transform lg:-translate-y-2 border-2 border-amber-300"
            >
              <span className="absolute top-4 right-4 bg-amber-400 text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                PHỔ BIẾN NHẤT
              </span>
              <div className="space-y-4">
                <span className="text-xs font-bold text-blue-200 uppercase">HỌC VIÊN PRO</span>
                <div className="space-y-1">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-black">299.000đ</span>
                    <span className="text-xs text-blue-200">/tháng</span>
                  </div>
                  <p className="text-xs text-blue-100">Dành cho học sinh ôn thi chuyên sâu</p>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-blue-50 pt-2">
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-amber-300" /> <span>Toàn bộ bài giảng khóa học Pro</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-amber-300" /> <span>AI Tutor cá nhân hóa không giới hạn</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-amber-300" /> <span>Trải nghiệm Phòng Lab Thực tế ảo VR</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-amber-300" /> <span>AI Chấm bài tự luận chi tiết &lt; 3s</span></li>
                </ul>
              </div>
              <button className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black rounded-2xl text-xs transition cursor-pointer shadow-md">
                Nâng cấp Pro ngay
              </button>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.2 }}
              variants={sectionVariants}
              custom={3}
              whileHover={{ y: -6 }}
              className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-500 uppercase">TRƯỜNG HỌC / TỔ CHỨC</span>
                <div className="space-y-1">
                  <span className="text-3xl font-black text-slate-900">Liên hệ</span>
                  <p className="text-xs text-slate-500">Dành cho trường học và trung tâm giáo dục</p>
                </div>
                <ul className="space-y-3 text-xs font-semibold text-slate-600 pt-2">
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-500" /> <span>Hệ thống LMS quản lý toàn trường</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-500" /> <span>Tích hợp Google Meet Enterprise</span></li>
                  <li className="flex items-center space-x-2"><Check className="w-4 h-4 text-emerald-500" /> <span>Tùy chỉnh lộ trình và ngân hàng đề thi</span></li>
                </ul>
              </div>
              <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition cursor-pointer">
                Liên hệ tư vấn
              </button>
            </motion.div>
          </div>
        </section>

        {/* ================= SECTION 9: FAQ SECTION ================= */}
        <section className="max-w-4xl mx-auto px-6 space-y-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={sectionVariants}
            className="text-center space-y-2"
          >
            <span className="bg-orange-500 text-white text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md border border-orange-400">GÓC GIẢI ĐÁP</span>
            <h2 className="text-3xl font-black text-white tracking-tight pt-1 drop-shadow-md">Câu hỏi thường gặp</h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: "Tôi có thể tham gia lớp học Meet bằng thiết bị di động không?",
                a: "Có! Hệ thống EduTech Central tương thích hoàn hảo trên cả máy tính, máy tính bảng và điện thoại di động (iOS & Android) thông qua ứng dụng hoặc trình duyệt web."
              },
              {
                q: "AI Tutor hoạt động như thế nào trong việc hỗ trợ giải bài tập?",
                a: "AI Tutor được huấn luyện dựa trên kho dữ liệu bài giảng chuẩn. Khi bạn tải ảnh hoặc gõ câu hỏi, AI sẽ phân tích từng bước giải, đưa ra lời giải thích chi tiết và gợi ý các bài tập tương tự để luyện tập."
              },
              {
                q: "Làm thế nào để nhận chứng chỉ sau khi hoàn thành khóa học?",
                a: "Sau khi đạt trên 80% điểm số các bài kiểm tra AI và hoàn thành dự án cuối khóa, chứng chỉ số tích hợp mã QR xác thực Blockchain sẽ tự động gửi về email của bạn."
              }
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.2 }}
                variants={sectionVariants}
                custom={idx + 1}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left font-bold text-sm text-slate-900 flex justify-between items-center cursor-pointer hover:bg-slate-50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openFaq === idx ? "rotate-180 text-blue-600" : "text-slate-400"}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed font-medium border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= SECTION 10: CTA BANNER ================= */}
        <section className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={sectionVariants}
            className="bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-700 rounded-[32px] p-10 md:p-16 text-white text-center space-y-6 shadow-2xl relative overflow-hidden"
          >
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              Sẵn sàng bứt phá điểm số cùng AI?
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto text-sm md:text-base font-medium">
              Đăng ký ngay hôm nay để nhận 14 ngày trải nghiệm gói Pro cùng hệ thống AI Tutor cá nhân hóa hoàn toàn miễn phí.
            </p>
            <div className="pt-2 flex justify-center">
              <button
                onClick={triggerConfetti}
                className="px-10 py-4 bg-amber-400 hover:bg-amber-500 text-slate-900 font-black rounded-2xl text-base transition shadow-xl hover:scale-105 cursor-pointer"
              >
                Bắt đầu học ngay hôm nay
              </button>
            </div>
          </motion.div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}