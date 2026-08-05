"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  User,
  Eye, 
  EyeOff, 
  Sparkles, 
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";

import HeroBackground3D from "@/components/HeroBackground3D";

const registerPosters = [
  {
    id: 1,
    tag: "ĐẶC QUYỀN HỌC VIÊN",
    title: "Tặng 100 AI Credits Miễn Phí",
    desc: "Trải nghiệm ngay trợ lý AI chấm điểm bài thi tự động và ghi chú bài giảng realtime ngay sau khi tạo tài khoản.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop",
    badgeColor: "bg-orange-500"
  },
  {
    id: 2,
    tag: "LỚP HỌC LIVE MEET 4.0",
    title: "Kết Nối Hơn 500+ Chuyên Gia",
    desc: "Tham gia các buổi workshop và lớp học trực tiếp 1:1 cùng giảng viên hàng đầu đến từ các tập đoàn công nghệ.",
    image: "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=1000&auto=format&fit=crop",
    badgeColor: "bg-blue-600"
  },
  {
    id: 3,
    tag: "CHỨNG CHỈ QUỐC TẾ",
    title: "Bảo Lưu Hồ Sơ Học Tập Vĩnh Viễn",
    desc: "Tự động tích hợp bảng điểm AI và cấp chứng chỉ xác thực QR Code chuẩn mã hóa blockchain.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop",
    badgeColor: "bg-purple-600"
  }
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % registerPosters.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % registerPosters.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + registerPosters.length) % registerPosters.length);
  };

  const getPasswordStrength = () => {
    if (!password) return { text: "", color: "bg-slate-200", width: "0%" };
    if (password.length < 6) return { text: "Yếu", color: "bg-red-500", width: "33%" };
    if (password.length < 10) return { text: "Trung bình", color: "bg-amber-500", width: "66%" };
    return { text: "Mạnh", color: "bg-emerald-500", width: "100%" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50 font-sans text-slate-800 selection:bg-orange-500 selection:text-white">
      
      {/* ==================== BÊN TRÁI: FORM ĐĂNG KÝ SÁNG TẠO ==================== */}
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

        <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 md:px-20 lg:px-12 xl:px-20 py-10">
          <div className="w-full max-w-md space-y-5">
            
            {/* Header Form & Logo */}
            <div className="text-center lg:text-left space-y-2">
              <Link href="/" className="inline-block group">
                <img
                  src="/edutechcentral.png"
                  alt="EduTech Central Logo"
                  className="h-12 md:h-14 w-auto object-contain transition duration-200 group-hover:scale-105 drop-shadow-sm"
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
                Tạo tài khoản mới
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Tham gia ngay nền tảng học tập công nghệ hàng đầu.
              </p>
            </div>

            {/* Chọn vai trò người dùng (Học viên / Giảng viên) */}
            <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  role === "student"
                    ? "bg-white text-blue-600 shadow-md font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Học Viên</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  role === "teacher"
                    ? "bg-white text-orange-600 shadow-md font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Giảng Viên</span>
              </button>
            </div>

            {/* Form Inputs */}
            <form className="space-y-3.5" onSubmit={(e) => e.preventDefault()}>
              
              {/* Họ và tên */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Họ và tên đầy đủ
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Email đăng ký
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

              {/* Mật khẩu & Thanh độ mạnh */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Mật khẩu bảo mật
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="Tối thiểu 8 ký tự"
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

                {password && (
                  <div className="pt-1 space-y-1">
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>Độ mạnh mật khẩu:</span>
                      <span className="font-bold text-slate-700">{strength.text}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Điều khoản sử dụng */}
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="mt-0.5 h-3.5 w-3.5 text-orange-500 focus:ring-orange-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2 block text-[11px] font-medium text-slate-600 leading-snug cursor-pointer">
                  Tôi đồng ý với <a href="#" className="font-bold text-blue-600 hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="font-bold text-blue-600 hover:underline">Chính sách bảo mật</a>.
                </label>
              </div>

              {/* Nút Đăng ký */}
              <button
                type="submit"
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-md shadow-orange-500/20 text-xs font-black text-white bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Tạo tài khoản EduTech</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="px-3 bg-white text-slate-400 font-medium">Hoặc đăng ký nhanh với</span>
              </div>
            </div>

            {/* Đăng ký bằng Google & Microsoft */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center space-x-2 py-2 px-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98] cursor-pointer">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Google</span>
              </button>

              <button className="flex items-center justify-center space-x-2 py-2 px-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98] cursor-pointer">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H1z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H1z"/>
                </svg>
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Microsoft</span>
              </button>
            </div>

            {/* Đã có tài khoản */}
            <p className="text-center text-xs font-medium text-slate-600 pt-0.5">
              Đã có tài khoản?{" "}
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500 hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ==================== BÊN PHẢI: NỀN 3D + POSTER ƯU ĐÃI ĐẶC QUYỀN (GLASSMORPHISM) ==================== */}
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
            <span className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 text-[10px] font-black px-3.5 py-1 rounded-full border border-amber-400/30 uppercase tracking-widest backdrop-blur-xl shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              <span>ĐĂNG KÝ MIỄN PHÍ DỄ DÀNG</span>
            </span>
            <h3 className="text-xl md:text-2xl font-black text-white leading-snug drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              Bắt đầu hành trình chinh phục <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-white to-amber-200">tri thức công nghệ</span>
            </h3>
          </div>

          {/* KHUNG POSTER ƯU ĐÃI KÍNH TRONG SUỐT */}
          <div className="relative w-full bg-white/10 backdrop-blur-2xl border border-white/30 rounded-3xl p-4 shadow-[0_30px_70px_rgba(0,0,0,0.5)] space-y-3 flex flex-col justify-between">
            
            <div className="relative h-52 w-full rounded-2xl overflow-hidden shadow-2xl group border border-white/20 bg-slate-950/40 backdrop-blur-md">
              {registerPosters.map((poster, index) => (
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
              {registerPosters.map((_, index) => (
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