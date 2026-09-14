import React from "react"
import { X } from "lucide-react"

export default function VerticalVideoModal({ video, onClose }) {
  if (!video) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-[360px] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
        
        <video 
          src={video.videoUrl} 
          autoPlay 
          controls 
          loop
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none text-white space-y-1">
          <span className="text-[10px] bg-orange-600 px-2 py-0.5 rounded font-black uppercase">Clip ngắn</span>
          <h4 className="text-sm font-bold leading-snug">{video.title}</h4>
          <p className="text-xs text-slate-300">{video.author}</p>
        </div>
      </div>
    </div>
  )
}