import React from "react"

export default function Footer() {
  return (
    <footer className="relative z-10 w-full bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-200">
          <div className="space-y-4">
            <a href="#" className="inline-block">
              <img
                src="/edutechcentral.png"
                alt="EduTech Central Logo"
                className="h-14 md:h-16 w-auto object-contain transition duration-200 hover:scale-105"
                onError={(e) => {
                  const target = e.target
                  target.style.display = "none"
                  const parent = target.parentElement
                  if (parent && !parent.querySelector(".fallback-logo")) {
                    const fallback = document.createElement("div")
                    fallback.className =
                      "fallback-logo w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md"
                    fallback.innerText = "EC"
                    parent.appendChild(fallback)
                  }
                }}
              />
            </a>
            <p className="text-xs text-gray-600 leading-relaxed font-medium max-w-sm">
              Empowering professionals through world-class online education and precision learning frameworks.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-gray-900 tracking-wider uppercase">PLATFORM</h4>
            <ul className="space-y-2 text-xs text-gray-600 font-semibold">
              <li><a href="#" className="hover:text-blue-600 transition">Support</a></li>
              <li><a href="#" className="hover:text-blue-600 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 transition">Terms of Service</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-gray-900 tracking-wider uppercase">RESOURCES</h4>
            <ul className="space-y-2 text-xs text-gray-600 font-semibold">
              <li><a href="#" className="hover:text-blue-600 transition">Case Studies</a></li>
              <li><a href="#" className="hover:text-blue-600 transition">Documentation</a></li>
              <li><a href="#" className="hover:text-blue-600 transition">Help Center</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-gray-900 tracking-wider uppercase">FOLLOW US</h4>
            <div className="flex space-x-3 text-sm">
              <a href="#" className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition shadow-sm">🌐</a>
              <a href="#" className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition shadow-sm">👥</a>
              <a href="#" className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition shadow-sm">📺</a>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 font-bold">
          © 2026 EduTech Central. Precision in Learning.
        </div>
      </div>
    </footer>
  )
}