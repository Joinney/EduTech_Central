import React from "react"
import Sidebar from "../components/Sidebar.jsx"
import Header from "../components/Header.jsx"
import Footer from "../components/Footer.jsx"
import { Video, BookOpen, Clock, Award, Play, TrendingUp, Sparkles } from "lucide-react"

export default function UserHome() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
          <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 p-8 text-white overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="inline-flex items-center space-x-2 bg-white/20 px-3.5 py-1 rounded-full text-xs font-extrabold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Không gian học tập cá nhân</span>
              </span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Xin chào, Võ Duy Toàn 👋</h1>
              <p className="text-sm font-medium text-blue-100 leading-relaxed">
                Hôm nay bạn có 2 buổi học Google Meet trực tuyến và 1 bài kiểm tra AI Algorithms sắp diễn ra.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}