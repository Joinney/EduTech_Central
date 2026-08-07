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
  Globe2
} from "lucide-react"

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

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#00f0ff", "#ff9100", "#ffffff", "#0072ff", "#10b981"]
    })
  }

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

  return (
    <div className="relative min-h-screen text-slate-800 font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <HeroBackground3D />
      </div>

      <div className="relative z-50">
        <Header />
      </div>

      <main className="relative z-10 space-y-28 pb-16">
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
      </main>

      <Footer />
    </div>
  )
}