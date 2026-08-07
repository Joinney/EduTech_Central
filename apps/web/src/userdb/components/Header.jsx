import React from "react"
import { Search, Bell } from "lucide-react"

export default function Header() {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="relative w-80">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm khóa học, bài thi..."
          className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Học viên Pro Active</span>
        </div>

        <button className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition relative cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-orange-500 rounded-full absolute top-2 right-2" />
        </button>

        <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-xs flex items-center justify-center shadow-md">
            VDT
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-extrabold text-white">Võ Duy Toàn</div>
            <div className="text-[10px] font-bold text-slate-400">duytoan@edutech.vn</div>
          </div>
        </div>
      </div>
    </header>
  )
}