
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import HeroBackground3D from "@/components/HeroBackground3D";

const posters = [
  {
    id: 1,
    tag: "VR CLASSROOM LIVE",
    title: "Phòng Lab Thực Tế Ảo AI 4.0",
    desc: "Trải nghiệm không gian học tập tương tác không giới hạn cùng chuyên gia hàng đầu.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop",
    badgeColor: "bg-orange-500"
  },
  {
    id: 2,
    tag: "AI TUTORING SYSTEM",
    title: "Trợ Lý AI Phân Tích Lộ Trình",
    desc: "Đánh giá chính xác 94% kỹ năng lập trình và đưa ra bài tập cá nhân hóa cho riêng bạn.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop",
    badgeColor: "bg-blue-600"
  },
  {
    id: 3,
    tag: "GLOBAL CERTIFICATION",
    title: "Chứng Chỉ Xác Thực Quốc Tế",
    desc: "Bảo vệ đồ án thành công qua hệ thống Meet trực tuyến và nhận chứng chỉ mã QR bảo mật.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop",
    badgeColor: "bg-purple-600"
  }
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % posters.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % posters.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + posters.length) % posters.length);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50 font-sans text-slate-800 selection:bg-blue-500 selection:text-white">
      
      {/* ==================== BÊN TRÁI: FORM ĐĂNG NHẬP ==================== */}
      <div className="w-full lg:w-1/2 h-full flex flex-col relative z-20 bg-white shadow-[10px_0_30px_rgba(0,0,0,0.05)] overflow-y-auto">
        
        {/* Nút quay lại NẰM BÊN PHẢI CỦA FORM */}
        <div className="absolute top-6 right-6 md:top-8 md:right-8 z-10">
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-xs md:text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors bg-slate-50 px-3.5 py-1.5 md:px-4 md:py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang chủ</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 md:px-24 lg:px-16 xl:px-24 py-12">
          <div className="w-full max-w-md space-y-6">
            
            {/* Header Form & Logo */}
            <div className="text-center lg:text-left space-y-3">
              <Link href="/" className="inline-block group">
                <img
                  src="/edutechcentral.png"
                  alt="EduTech Central Logo"
                  className="h-14 md:h-16 w-auto object-contain transition duration-200 group-hover:scale-105 drop-shadow-sm"
                  onError={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector(".fallback-logo")) {
                      const fallback = document.createElement("div");
                      fallback.className =
                        "fallback-logo w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-md";
                      fallback.innerText = "EC";
                      parent.appendChild(fallback);
                    }
                  }}
                />
              </Link>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Đăng nhập
              </h2>
              <p className="text-xs md:text-sm font-medium text-slate-500">
                Chào mừng bạn trở lại với hệ sinh thái EduTech Central.
              </p>
            </div>

            {/* Form Inputs */}
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email học viên
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="nhapemail@domain.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mật khẩu
                  </label>
                  <Link href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-slate-600 cursor-pointer">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              {/* Nút đăng nhập */}
              <button
                type="submit"
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-orange-500/20 text-xs font-black text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Đăng nhập hệ thống</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-400 font-medium">Hoặc đăng nhập với</span>
              </div>
            </div>

            {/* Đăng nhập bằng Google & Microsoft */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center space-x-2 py-2.5 px-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98] cursor-pointer">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Google</span>
              </button>

              <button className="flex items-center justify-center space-x-2 py-2.5 px-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98] cursor-pointer">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H1z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Microsoft</span>
              </button>
            </div>

            {/* Đăng ký */}
            <p className="text-center text-xs font-medium text-slate-600 pt-1">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">
                Đăng ký tham gia ngay
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ==================== BÊN PHẢI: NỀN 3D + KHUNG POSTER KÍNH TRONG SUỐT ==================== */}
      <div className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden bg-slate-900 p-8 flex-col justify-center items-center">
        
        {/* Nền Canvas 3D */}
        <div className="absolute inset-0 z-0">
          <HeroBackground3D />
        </div>

        {/* CONTAINER CHÍNH GIỮA */}
        <div className="relative z-10 w-full max-w-lg space-y-6 flex flex-col items-center">
          
          {/* LOGO VÀ CHỮ GIỚI THIỆU */}
          <div className="w-full text-center space-y-3">
            <div className="flex justify-center">
              <img
                src="/edutechcentral.png"
                alt="EduTech Central Logo"
                className="h-16 md:h-18 w-auto object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
              />
            </div>
            <span className="inline-flex items-center space-x-2 bg-white/15 text-cyan-200 text-[10px] font-black px-3.5 py-1 rounded-full border border-white/30 uppercase tracking-widest backdrop-blur-xl shadow-lg">
              <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
              <span>HỆ SINH THÁI GIÁO DỤC 4.0</span>
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white leading-snug drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              Khai phá tiềm năng tương lai với <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-amber-200">công nghệ giáo dục</span>
            </h3>
          </div>

          {/* KHUNG POSTER KÍNH TRONG SUỐT */}
          <div className="relative w-full bg-white/10 backdrop-blur-2xl border border-white/30 rounded-3xl p-4 shadow-[0_30px_70px_rgba(0,0,0,0.5)] space-y-3 flex flex-col justify-between">
            
            <div className="relative h-52 w-full rounded-2xl overflow-hidden shadow-2xl group border border-white/20 bg-slate-950/40 backdrop-blur-md">
              {posters.map((poster, index) => (
                <div 
                  key={poster.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-col justify-end p-4 ${
                    index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105 opacity-60"
                    style={{ backgroundImage: `url('${poster.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  <div className="relative z-10 space-y-1">
                    <span className={`${poster.badgeColor} text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md inline-block`}>
                      {poster.tag}
                    </span>
                    <h4 className="text-sm font-extrabold text-white drop-shadow-md">
                      {poster.title}
                    </h4>
                    <p className="text-[11px] text-slate-200 font-medium leading-relaxed line-clamp-2 drop-shadow">
                      {poster.desc}
                    </p>
                  </div>
                </div>
              ))}

              <button 
                onClick={prevSlide}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 border border-white/30 flex items-center justify-center text-white transition z-20 cursor-pointer backdrop-blur-md shadow-lg"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 border border-white/30 flex items-center justify-center text-white transition z-20 cursor-pointer backdrop-blur-md shadow-lg"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center space-x-1.5 pt-0.5">
              {posters.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentIndex ? "w-5 bg-orange-500 shadow-md" : "w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
