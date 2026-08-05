"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Sparkles, LogOut, Settings, BookOpen } from "lucide-react";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsUserMenuOpen(false);
    setUserEmail("");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm px-6 md:px-8 py-3 flex items-center justify-between transition-all">
      {/* Logo */}
      <Link href="/" className="flex items-center group">
        <img
          src="/edutechcentral.png"
          alt="EduTech Central Logo"
          className="h-10 md:h-12 w-auto object-contain transition duration-200 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent && !parent.querySelector(".fallback-logo")) {
              const fallback = document.createElement("div");
              fallback.className =
                "fallback-logo w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md";
              fallback.innerText = "EC";
              parent.appendChild(fallback);
            }
          }}
        />
      </Link>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-600">
        <Link href="/" className="text-blue-600 border-b-2 border-blue-600 pb-0.5 font-extrabold">
          Home
        </Link>
        <Link href="#" className="hover:text-blue-600 transition duration-200">
          Courses
        </Link>
        <Link href="#" className="hover:text-blue-600 transition duration-200">
          Solutions
        </Link>
        <Link href="#" className="hover:text-blue-600 transition duration-200">
          Resources
        </Link>
        <Link href="#" className="hover:text-blue-600 transition duration-200">
          About Us
        </Link>
      </nav>

      {/* Right Action Area */}
      <div className="flex items-center space-x-3.5">
        {!isLoggedIn ? (
          <>
            {/* Chuyển đến trang Đăng nhập */}
            <Link
              href="/login"
              className="text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 px-4 py-2 rounded-xl transition duration-200"
            >
              Log In
            </Link>

            {/* Chuyển đến trang Đăng ký */}
            <Link
              href="/register"
              className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:opacity-90 active:scale-95 text-white text-sm font-extrabold px-5 py-2.5 rounded-xl shadow-md transition duration-200 flex items-center space-x-1.5"
            >
              <span>Get Started</span>
              <Sparkles className="w-3.5 h-3.5" />
            </Link>
          </>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 p-1.5 pr-3 rounded-full border border-slate-200 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="text-xs font-bold text-slate-700 max-w-[100px] truncate">
                {userEmail.split("@")[0] || "Học viên"}
              </span>
            </button>

            {/* Dropdown Profile */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 space-y-1">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-black text-slate-900 truncate">{userEmail}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">Học viên Active</p>
                </div>
                <Link href="#" className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>Khóa học của tôi</span>
                </Link>
                <Link href="#" className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Cài đặt tài khoản</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left border-t border-slate-100 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}