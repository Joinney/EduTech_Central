"use client";

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroBackground3D from '@/components/HeroBackground3D';
import { motion, Variants, useInView, animate } from 'framer-motion';
import confetti from 'canvas-confetti';
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
  FileCheck,
  Cpu,
  Activity,
  Globe2
} from 'lucide-react';

// Component đếm số nhảy mượt mà
function AnimatedCounter({ from = 0, to, duration = 2.2, suffix = "" }: { from?: number; to: number; duration?: number; suffix?: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: false, amount: 0.3 });

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    if (isInView) {
      const controls = animate(from, to, {
        duration: duration,
        ease: [0.16, 1, 0.3, 1], // Bezier Curve mượt chuẩn iOS/Apple
        onUpdate(value) {
          node.textContent = Math.floor(value).toLocaleString() + suffix;
        }
      });
      return () => controls.stop();
    } else {
      node.textContent = from.toLocaleString() + suffix;
    }
  }, [isInView, from, to, duration, suffix]);

  return <span ref={nodeRef}>{from}{suffix}</span>;
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'meet' | 'exam' | 'analytics'>('meet');

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#ff9100', '#ffffff', '#0072ff', '#10b981']
    });
  };

  // Variants chuyển động mượt mà lặp lại liên tục cho mọi section
  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 60, scale: 0.96 },
    visible: (custom: number = 0) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        delay: custom * 0.1,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  return (
    <div className="relative min-h-screen text-slate-800 font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden">
      
      {/* 1. NỀN CANVAS 3D PHỦ TOÀN BỘ TRANG */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <HeroBackground3D />
      </div>

      {/* HEADER TÍCH HỢP KÍNH MỜ TRẮNG SÁNG */}
      <div className="relative z-50">
        <Header />
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <main className="relative z-10 space-y-28 pb-16">

        {/* ==================== PHẦN 1: HERO SECTION ==================== */}
        <section className="relative min-h-[720px] w-full flex items-center justify-center pt-8">
          
          {/* HUD Widget Trái */}
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

          {/* HUD Widget Phải */}
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

          {/* Nội dung trung tâm Banner */}
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

        {/* ==================== PHẦN 2: BẢNG CHỈ SỐ MỞ RỘNG CỰC RỘNG VÀ CHẠY SỐ MƯỢT MA ==================== */}
        <section className="max-w-[1530px] mx-auto px-6 md:px-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={sectionVariants}
            custom={0}
            className="bg-slate-950/85 backdrop-blur-3xl border border-cyan-500/30 rounded-[36px] p-8 md:p-12 shadow-[0_0_60px_rgba(0,180,255,0.18)] relative overflow-hidden"
          >
            <div className="absolute -top-28 -left-28 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-28 -right-28 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

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
              
              {/* Stat 1 */}
              <motion.div 
                variants={sectionVariants}
                custom={1}
                className="relative group bg-slate-900/90 border border-slate-800 hover:border-cyan-400/80 p-7 rounded-3xl transition duration-500 hover:shadow-[0_0_35px_rgba(0,240,255,0.25)] flex flex-col justify-between space-y-5 overflow-hidden"
              >
                <div className="flex justify-between items-center z-10">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                    <Globe2 className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2.5 py-1 rounded-md">
                    #GLOBAL
                  </span>
                </div>
                <div className="z-10">
                  <div className="text-4xl xl:text-5xl font-black text-white font-mono tracking-tight group-hover:text-cyan-300 transition">
                    <AnimatedCounter to={100000} suffix="+" />
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-wider mt-2">Học Viên Toàn Cầu</p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-mono">
                  <span className="flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1" /> +24% MTH</span>
                  <span className="text-slate-500">142 Quốc gia</span>
                </div>
              </motion.div>

              {/* Stat 2 */}
              <motion.div 
                variants={sectionVariants}
                custom={2}
                className="relative group bg-slate-900/90 border border-slate-800 hover:border-orange-500/80 p-7 rounded-3xl transition duration-500 hover:shadow-[0_0_35px_rgba(255,145,0,0.25)] flex flex-col justify-between space-y-5 overflow-hidden"
              >
                <div className="flex justify-between items-center z-10">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-400/30 text-orange-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                    <Radio className="w-7 h-7 animate-pulse" />
                  </div>
                  <span className="text-xs font-mono text-orange-300 bg-orange-950/80 border border-orange-800 px-2.5 py-1 rounded-md">
                    #LIVE_MEET
                  </span>
                </div>
                <div className="z-10">
                  <div className="text-4xl xl:text-5xl font-black text-white font-mono tracking-tight group-hover:text-orange-300 transition">
                    <AnimatedCounter to={500} suffix="+" />
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-wider mt-2">Lớp Meet Tương Tác</p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-orange-400 font-mono">
                  <span className="flex items-center"><Zap className="w-3.5 h-3.5 mr-1" /> Latency &lt;15ms</span>
                  <span className="text-slate-500">Full HD Stream</span>
                </div>
              </motion.div>

              {/* Stat 3 */}
              <motion.div 
                variants={sectionVariants}
                custom={3}
                className="relative group bg-slate-900/90 border border-slate-800 hover:border-emerald-500/80 p-7 rounded-3xl transition duration-500 hover:shadow-[0_0_35px_rgba(16,185,129,0.25)] flex flex-col justify-between space-y-5 overflow-hidden"
              >
                <div className="flex justify-between items-center z-10">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                    <Cpu className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-md">
                    #AI_ENGINE
                  </span>
                </div>
                <div className="z-10">
                  <div className="text-4xl xl:text-5xl font-black text-white font-mono tracking-tight group-hover:text-emerald-300 transition">
                    <AnimatedCounter to={1200000} suffix="+" />
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-wider mt-2">Bài Thi AI Đã Chấm</p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-mono">
                  <span className="flex items-center"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 99.8% Acc.</span>
                  <span className="text-slate-500">Tốc độ &lt;3s</span>
                </div>
              </motion.div>

              {/* Stat 4 */}
              <motion.div 
                variants={sectionVariants}
                custom={4}
                className="relative group bg-slate-900/90 border border-slate-800 hover:border-purple-500/80 p-7 rounded-3xl transition duration-500 hover:shadow-[0_0_35px_rgba(168,85,247,0.25)] flex flex-col justify-between space-y-5 overflow-hidden"
              >
                <div className="flex justify-between items-center z-10">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-400/30 text-purple-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
                    <Bot className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-mono text-purple-300 bg-purple-950/80 border border-purple-800 px-2.5 py-1 rounded-md">
                    #AI_PROCTOR
                  </span>
                </div>
                <div className="z-10">
                  <div className="text-4xl xl:text-5xl font-black text-white font-mono tracking-tight group-hover:text-purple-300 transition">
                    24/7
                  </div>
                  <p className="text-xs md:text-sm text-slate-400 font-bold uppercase tracking-wider mt-2">Trợ Lý AI Giám Sát</p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-purple-400 font-mono">
                  <span className="flex items-center"><Sparkles className="w-3.5 h-3.5 mr-1" /> Auto Note</span>
                  <span className="text-slate-500">Feedback Realtime</span>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </section>

        {/* ==================== PHẦN 3: THẺ KHÓA HỌC (MỞ RỘNG TOÀN DIỆN MÁY TÍNH) ==================== */}
        <section className="max-w-[1530px] mx-auto px-6 md:px-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            variants={sectionVariants}
            className="bg-white/85 backdrop-blur-2xl border border-white/95 rounded-[36px] p-8 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.06)] space-y-12"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/80 pb-8">
              <div className="space-y-3">
                <span className="inline-flex items-center space-x-2 text-blue-600 text-xs font-black tracking-widest uppercase bg-blue-100/80 px-4 py-2 rounded-full border border-blue-200">
                  <BookOpen className="w-4 h-4" />
                  <span>PREMIUM CURRICULUM 2026</span>
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                  Khóa Học Công Nghệ Đột Phá
                </h2>
                <p className="text-slate-600 text-base md:text-lg font-medium">
                  Học trực tiếp qua Meet 4.0, thực hành phòng lab VR AI và nhận chứng chỉ mã hóa NFT.
                </p>
              </div>

              <a href="#" className="group inline-flex items-center space-x-2.5 text-blue-600 hover:text-white font-extrabold text-sm bg-white hover:bg-blue-600 border border-blue-200 px-7 py-3.5 rounded-2xl transition duration-300 shadow-md">
                <span>Khám phá tất cả khóa học</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {[
                {
                  tag: "AI & NEURAL NETWORKS",
                  title: "Trí tuệ Nhân tạo & Deep Learning Pro",
                  desc: "Xây dựng mô hình Large Language Model (LLM), học 1:1 qua Google Meet cùng các chuyên gia Viện AI.",
                  price: "1,200,000 đ",
                  originalPrice: "2,500,000 đ",
                  instructor: "GS. Nguyễn Văn A",
                  duration: "40 Giờ + 10 Bài thi AI",
                  badgeColor: "bg-blue-600",
                  hoverGlow: "hover:shadow-[0_25px_60px_rgba(37,99,235,0.25)]",
                  btnBg: "bg-blue-600 hover:bg-blue-700",
                  bgImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop",
                  hotBadge: "🔥 TOP RATED",
                  studentsCount: "2,450 học viên"
                },
                {
                  tag: "DATA SCIENCE & CLOUD",
                  title: "Khoa học Dữ liệu Doanh nghiệp 4.0",
                  desc: "Phân tích Big Data trên Cloud, hệ thống tự động chấm điểm bài code SQL/Python bằng AI.",
                  price: "1,500,000 đ",
                  originalPrice: "3,000,000 đ",
                  instructor: "TS. Lê Thị B",
                  duration: "52 Giờ + 15 Bài thi AI",
                  badgeColor: "bg-orange-500",
                  hoverGlow: "hover:shadow-[0_25px_60px_rgba(249,115,22,0.25)]",
                  btnBg: "bg-orange-500 hover:bg-orange-600",
                  bgImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
                  hotBadge: "⚡ HOT TRENDING",
                  studentsCount: "1,890 học viên"
                },
                {
                  tag: "FULL-STACK ARCHITECTURE",
                  title: "Lập trình Web Full-Stack Chuyên Nghiệp",
                  desc: "Xây dựng hệ thống Microservices scale lớn, Code Review trực tiếp qua Meet với Tech Lead.",
                  price: "1,800,000 đ",
                  originalPrice: "3,600,000 đ",
                  instructor: "ThS. Trần Văn C",
                  duration: "65 Giờ + 20 Bài thi AI",
                  badgeColor: "bg-purple-600",
                  hoverGlow: "hover:shadow-[0_25px_60px_rgba(147,51,234,0.25)]",
                  btnBg: "bg-purple-600 hover:bg-purple-700",
                  bgImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop",
                  hotBadge: "🚀 BESTSELLER",
                  studentsCount: "3,120 học viên"
                }
              ].map((course, idx) => (
                <motion.div
                  key={idx}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.2 }}
                  variants={sectionVariants}
                  custom={idx + 1}
                  whileHover={{ y: -12 }}
                  className={`bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-lg ${course.hoverGlow} transition duration-500 flex flex-col justify-between group relative`}
                >
                  <div>
                    <div className="h-60 relative p-6 flex flex-col justify-between overflow-hidden">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url('${course.bgImage}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />

                      <div className="flex items-center justify-between z-10">
                        <span className={`${course.badgeColor} text-white font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-md`}>
                          {course.tag}
                        </span>
                        <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-3 py-1 rounded-full shadow-md">
                          {course.hotBadge}
                        </span>
                      </div>

                      <div className="z-10 bg-slate-950/60 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl">
                        <div className="flex items-center justify-between text-white text-xs">
                          <span className="font-bold flex items-center text-cyan-300">
                            <Video className="w-4 h-4 mr-1.5 text-cyan-400" /> Live Meet 1:1
                          </span>
                          <span className="font-semibold flex items-center text-amber-200">
                            <Clock className="w-4 h-4 mr-1.5" /> {course.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-7 space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-orange-500 font-black flex items-center">
                          <Star className="w-4 h-4 fill-orange-400 mr-1 text-orange-400" /> 4.9/5 <span className="text-slate-400 ml-1">({course.studentsCount})</span>
                        </span>
                        <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Chứng Chỉ NFT
                        </span>
                      </div>

                      <h3 className="font-black text-slate-900 text-xl md:text-2xl leading-snug group-hover:text-blue-600 transition">
                        {course.title}
                      </h3>

                      <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
                        {course.desc}
                      </p>
                    </div>
                  </div>

                  <div className="p-7 pt-0 space-y-5">
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-slate-700 text-xs font-bold">Giảng viên: {course.instructor}</span>
                      <div className="text-right">
                        <span className="block text-xs text-slate-400 line-through">{course.originalPrice}</span>
                        <span className="text-blue-600 font-black text-xl">{course.price}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <button className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3.5 rounded-xl border border-slate-200 transition">Xem Lịch Meet</button>
                      <button className={`${course.btnBg} text-white font-black text-xs py-3.5 rounded-xl shadow-md transition duration-200 active:scale-95`}>Đăng Ký Ngay 🚀</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </motion.div>
        </section>

        {/* ==================== PHẦN 4: CYBER MEET & AI COMMAND COCKPIT (RỘNG RÃI TOÀN MÀN HÌNH) ==================== */}
        <section className="max-w-[1530px] mx-auto px-6 md:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={sectionVariants}
            custom={1}
            className="bg-slate-950 text-white border border-slate-800 rounded-[36px] p-8 md:p-12 shadow-[0_0_70px_rgba(0,0,0,0.8)] space-y-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center max-w-4xl mx-auto space-y-3">
              <span className="bg-cyan-950 text-cyan-400 text-xs font-mono font-black px-4 py-1.5 rounded-full border border-cyan-800 uppercase inline-flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>CYBER COMMAND CENTER</span>
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Lớp Học Trực Tuyến Meet 4.0 & Giám Sát AI
              </h2>
              <p className="text-slate-400 text-base font-medium">
                Sức mạnh kết hợp giữa tương tác 1:1 qua Google Meet và hệ thống AI phân tích năng lực tự động theo thời gian thực.
              </p>
            </div>

            <div className="flex justify-center space-x-3 bg-slate-900/90 p-2 rounded-2xl max-w-xl mx-auto border border-slate-800">
              <button
                onClick={() => setActiveTab('meet')}
                className={`flex-1 py-3 rounded-xl text-xs md:text-sm font-mono font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                  activeTab === 'meet' ? 'bg-cyan-500 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.5)] font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Live Meet 4.0</span>
              </button>
              <button
                onClick={() => setActiveTab('exam')}
                className={`flex-1 py-3 rounded-xl text-xs md:text-sm font-mono font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                  activeTab === 'exam' ? 'bg-orange-500 text-slate-950 shadow-[0_0_25px_rgba(249,115,22,0.5)] font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Bài Thi AI</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 py-3 rounded-xl text-xs md:text-sm font-mono font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                  activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] font-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>AI Analytics</span>
              </button>
            </div>

            <div className="bg-slate-900/80 rounded-3xl p-6 md:p-10 border border-slate-800 relative">
              {activeTab === 'meet' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-5 gap-3">
                    <div className="flex items-center space-x-3">
                      <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping" />
                      <span className="font-mono text-sm font-bold text-cyan-300">ROOM #102: Lập Trình Python & AI Algorithms</span>
                    </div>
                    <span className="bg-cyan-500/10 text-cyan-400 text-xs px-4 py-1.5 rounded-full border border-cyan-500/30 font-mono font-bold">
                      👥 38 Attendees Online
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-slate-950 rounded-2xl h-72 lg:h-80 flex flex-col justify-between p-5 border border-slate-800 relative bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center">
                      <div className="absolute inset-0 bg-slate-950/80 rounded-2xl" />
                      <div className="relative z-10 flex justify-between items-start">
                        <span className="bg-black/80 text-xs md:text-sm px-3.5 py-1.5 rounded-lg backdrop-blur-md font-bold text-amber-300 border border-white/10">
                          👨‍🏫 GS. Nguyễn Văn A đang giảng bài
                        </span>
                        <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded shadow">
                          AUTO-NOTE ON
                        </span>
                      </div>
                      <div className="relative z-10 bg-black/90 backdrop-blur-md p-4 rounded-xl border border-white/10 text-xs md:text-sm font-mono text-cyan-300 space-y-1">
                        <div className="text-xs text-slate-500 uppercase">Ghi chú AI Realtime:</div>
                        <p>&gt; transcript: &quot;Thuật toán Optimization giúp mô hình hội tụ nhanh hơn gấp 3 lần...&quot;</p>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-6 rounded-2xl space-y-5 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-mono font-extrabold text-orange-400 uppercase tracking-wider mb-3 flex items-center">
                          <Radio className="w-4 h-4 mr-2 animate-pulse" /> Live Chat Interaction
                        </h4>
                        <div className="space-y-3 text-xs md:text-sm">
                          <p><span className="text-cyan-400 font-bold">Quốc Bảo:</span> Thầy giải thích lại phần loss function ạ?</p>
                          <p><span className="text-amber-400 font-bold">AI Assistant:</span> @Quốc Bảo: Loss function đo lường khoảng cách giữa kết quả dự đoán và thực tế.</p>
                        </div>
                      </div>
                      <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs md:text-sm py-3.5 rounded-xl transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer">
                        <Mic className="w-4 h-4" />
                        <span>Bật Mic / Giơ Tay Phát Biểu</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'exam' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-5 gap-3">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                      <span className="text-amber-400 font-mono text-sm font-bold">TIME REMAINING: 14:32</span>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 text-xs px-4 py-1.5 rounded-full border border-emerald-500/30 font-mono font-bold">
                      🛡️ AI PROCTORING ACTIVE
                    </span>
                  </div>

                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                    <span className="bg-blue-600 text-white text-xs font-mono font-black px-3 py-1 rounded">QUESTION 04 / 20</span>
                    <h3 className="text-base md:text-lg font-bold text-white">
                      Thuật toán nào sau đây phù hợp nhất cho bài toán phân loại nhị phân (Binary Classification) trên tập dữ liệu lớn?
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                      {['A. Decision Tree depth=100', 'B. Logistic Regression với L2 Regularization', 'C. K-Means Clustering', 'D. Linear Regression đơn thuần'].map((opt, i) => (
                        <div key={i} className={`p-4 rounded-xl border cursor-pointer transition ${i === 1 ? 'bg-cyan-500/20 border-cyan-400 font-bold text-white' : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'}`}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-400 font-mono">⚡ AI auto-grading system online</span>
                    <button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs md:text-sm px-7 py-3.5 rounded-xl shadow-lg hover:scale-105 transition flex items-center space-x-2 cursor-pointer">
                      <span>Nộp Bài & Xem Điểm AI</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h3 className="text-xs font-mono font-extrabold text-emerald-400 uppercase tracking-widest flex items-center">
                      <BarChart3 className="w-4 h-4 mr-2" /> AI PERFORMANCE SCORECARD
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                      <span className="text-xs text-slate-400 block font-mono">GPA Score:</span>
                      <span className="text-4xl font-black font-mono text-emerald-400">9.2 / 10</span>
                    </div>
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                      <span className="text-xs text-slate-400 block font-mono">Meet Attendance:</span>
                      <span className="text-4xl font-black font-mono text-cyan-400">98%</span>
                    </div>
                    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                      <span className="text-xs text-slate-400 block font-mono">Class Rank:</span>
                      <span className="text-4xl font-black font-mono text-amber-400">TOP 3</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-xs md:text-sm space-y-2">
                    <span className="text-amber-300 font-bold flex items-center">
                      <Bot className="w-4 h-4 mr-2 text-amber-400" />
                      AI Mentor Nhận Xét:
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      &quot;Bạn đạt kết quả xuất sắc trong phần thuật toán Logistic Regression. Nên tiếp tục duy trì tiến độ ở bài thi Deep Learning tiếp theo.&quot;
                    </p>
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        </section>

        {/* ==================== PHẦN 5: LỘ TRÌNH RỘNG RÃI MƯỢT MÀ ==================== */}
        <section className="max-w-[1530px] mx-auto px-6 md:px-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={sectionVariants}
            className="bg-white/85 backdrop-blur-2xl border border-white/95 rounded-[36px] p-8 md:p-12 shadow-xl space-y-12"
          >
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-purple-600 text-xs font-black tracking-widest uppercase bg-purple-100 px-4 py-2 rounded-full border border-purple-200 inline-flex items-center space-x-2">
                <Compass className="w-4 h-4" />
                <span>EXPERT LEARNING FLOW</span>
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900">
                Lộ Trình Học Tập 4 Bước Chuẩn Quốc Tế
              </h2>
              <p className="text-slate-600 text-base font-medium">
                Quy trình đào tạo bài bản từ đánh giá đầu vào đến cấp chứng chỉ xác thực.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {[
                { step: "01", title: "Test AI Phân Loại", desc: "Hệ thống AI kiểm tra kỹ năng đầu vào & gợi ý lộ trình học Meet tối ưu.", icon: BrainCircuit },
                { step: "02", title: "Lớp Học Meet Live", desc: "Tương tác trực tiếp 1:1 qua Google Meet cùng các chuyên gia hàng đầu.", icon: Video },
                { step: "03", title: "Thi AI Tự Động", desc: "Thực hành bài thi trắc nghiệm & tự luận, AI chấm điểm ngay trong 3s.", icon: Award },
                { step: "04", title: "Chứng Chỉ QR NFT", desc: "Bảo vệ đồ án qua Meet và nhận chứng chỉ xác thực mã QR bảo mật.", icon: GraduationCap },
              ].map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.2 }}
                    variants={sectionVariants}
                    custom={index + 1}
                    className="bg-white border border-slate-200/90 p-7 rounded-3xl shadow-sm hover:shadow-2xl hover:border-blue-500 transition duration-300 space-y-5 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg shadow-inner group-hover:bg-blue-600 group-hover:text-white transition duration-300">
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-mono font-black text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
                        STEP {item.step}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-xl group-hover:text-blue-600 transition">{item.title}</h3>
                    <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>

          </motion.div>
        </section>

        {/* ==================== PHẦN 6: COMMUNITY REVIEWS (MỞ RỘNG RỘNG RÃI) ==================== */}
        <section className="max-w-[1530px] mx-auto px-6 md:px-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            variants={sectionVariants}
            className="bg-white/85 backdrop-blur-2xl border border-white/95 rounded-[36px] p-8 md:p-12 shadow-xl space-y-10"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
              <div>
                <span className="text-emerald-600 text-xs font-black tracking-widest uppercase bg-emerald-100 px-4 py-2 rounded-full border border-emerald-200 inline-flex items-center space-x-2">
                  <Star className="w-4 h-4 fill-emerald-600" />
                  <span>HALL OF FAME & REVIEWS</span>
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-3">Cảm Nhận Từ Học Viên Xuất Sắc</h2>
              </div>
              <span className="text-slate-500 text-sm font-semibold flex items-center">
                <Star className="w-4.5 h-4.5 fill-amber-400 text-amber-400 mr-1.5" />
                Hơn 10,000+ Đánh giá 5 Sao ★★★★★
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  name: "Trần Minh Hoàng", 
                  role: "Học viên Lớp AI Meet", 
                  comment: "Lớp học Meet cực kỳ mượt mà! Thích nhất là tính năng AI Auto-Transcript ghi chú bài giảng tự động, xem lại bài thi được AI phân tích lỗi sai rất chi tiết.",
                  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" 
                },
                { 
                  name: "Lê Ngọc Phương", 
                  role: "Sinh viên ĐH Bách Khoa", 
                  comment: "Hệ thống làm bài kiểm tra AI chấm điểm tức tính giúp mình tiết kiệm rất nhiều thời gian. Không phải chờ giáo viên chấm bài hàng tuần nữa!",
                  avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop" 
                },
                { 
                  name: "Phạm Quốc Anh", 
                  role: "Kỹ sư Dữ liệu", 
                  comment: "Lộ trình rõ ràng, lớp học trực tiếp qua Meet giúp mình trao đổi bài với giảng viên cực kỳ tự nhiên như đang học tại trường đại học.",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" 
                },
              ].map((review, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.2 }}
                  variants={sectionVariants}
                  custom={i + 1}
                  className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-400 transition space-y-5"
                >
                  <div className="flex items-center space-x-3.5">
                    <img 
                      src={review.avatar} 
                      alt={review.name} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shadow-md"
                    />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">{review.name}</h4>
                      <p className="text-xs text-blue-600 font-bold">{review.role}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-medium italic">
                    &quot;{review.comment}&quot;
                  </p>
                  <div className="text-amber-500 text-xs font-bold flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="flex items-center">
                      <Star className="w-4 h-4 fill-amber-400 mr-1" /> 5.0 / 5.0
                    </span>
                    <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                      Xác thực Google Meet
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

          </motion.div>
        </section>

      </main>

      <Footer />
    </div>
  );
}