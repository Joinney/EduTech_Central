import React, { useState } from "react";
import { 
  Save, 
  ShieldCheck, 
  Clock, 
  Cloud, 
  ChevronDown,
  CloudLightning
} from "lucide-react";

export default function AdminSettings() {
  // States cho các nút Toggle (Bật/Tắt)
  const [twoFA, setTwoFA] = useState(true);
  const [awsActive, setAwsActive] = useState(true);
  const [cfActive, setCfActive] = useState(true);

  // Component Nút Toggle dùng chung
  const ToggleSwitch = ({ enabled, setEnabled }) => (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
        enabled ? "bg-[#38497C]" : "bg-slate-200"
      }`}
      onClick={() => setEnabled(!enabled)}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen font-sans space-y-6">
      
      {/* 1. HEADER KHU VỰC CẤU HÌNH */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">Cấu hình hệ thống</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý các cài đặt chung, bảo mật, API keys, tích hợp và thông tin hệ thống.</p>
        </div>
        <button className="px-5 py-2.5 bg-[#FF8C00] hover:bg-[#e67e00] transition-colors rounded-xl text-sm font-bold text-white flex items-center gap-2 shadow-md shadow-orange-500/20 shrink-0">
          <Save className="w-4 h-4" />
          <span>Lưu thay đổi</span>
        </button>
      </div>

      {/* 2. MAIN LAYOUT (SIDEBAR MÀN HÌNH SETTING & CONTENT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-6">
            <nav className="flex flex-col">
              <button className="flex items-center gap-3 px-5 py-4 border-l-4 border-[#38497C] bg-slate-50 text-[#38497C] font-bold text-sm text-left">
                <ShieldCheck className="w-5 h-5" />
                Bảo mật & Phân quyền
              </button>
              <button className="flex items-center gap-3 px-5 py-4 border-l-4 border-transparent text-slate-600 hover:bg-slate-50 font-medium text-sm text-left transition-colors">
                <Clock className="w-5 h-5" />
                Lịch trình hệ thống
              </button>
              <button className="flex items-center gap-3 px-5 py-4 border-l-4 border-transparent text-slate-600 hover:bg-slate-50 font-medium text-sm text-left transition-colors">
                <Cloud className="w-5 h-5" />
                API & Cloud Storage
              </button>
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* SECTION 1: BẢO MẬT NÂNG CAO */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-6">Bảo mật nâng cao</h2>
            
            <div className="space-y-6">
              {/* 2FA Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Xác thực 2 lớp (2FA)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Bắt buộc 2FA cho tất cả tài khoản Admin.</p>
                </div>
                <ToggleSwitch enabled={twoFA} setEnabled={setTwoFA} />
              </div>

              {/* IP Restriction */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2">Giới hạn IP truy cập Admin</label>
                <textarea 
                  rows={3}
                  className="w-full p-3 text-sm font-mono bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all resize-none text-slate-700"
                  defaultValue={"192.168.1.100\n203.0.113.50"}
                ></textarea>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">Để trống để cho phép truy cập từ mọi nơi.</p>
              </div>
            </div>
          </div>

          {/* SECTION 2: LỊCH TRÌNH HỆ THỐNG */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-6">Lịch trình hệ thống</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2">Tự động Backup Database</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-xl pl-3 pr-8 py-2.5 outline-none focus:border-indigo-400 cursor-pointer">
                    <option>Hàng ngày lúc 00:00</option>
                    <option>Hàng tuần</option>
                    <option>Không tự động</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-2">Gửi báo cáo định kỳ</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-sm rounded-xl pl-3 pr-8 py-2.5 outline-none focus:border-indigo-400 cursor-pointer">
                    <option>Hàng tuần (Sáng thứ 2)</option>
                    <option>Hàng tháng (Ngày 1)</option>
                    <option>Không gửi</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: LƯU TRỮ ĐÁM MÂY & CDN */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 mb-6">Lưu trữ đám mây & CDN</h2>
            
            <div className="space-y-6">
              {/* AWS S3 Config Block */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        AWS S3 Storage
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded uppercase tracking-wider">ACTIVE</span>
                      </h3>
                    </div>
                  </div>
                  <ToggleSwitch enabled={awsActive} setEnabled={setAwsActive} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5">Access Key ID</label>
                    <input type="text" defaultValue="AKIAIOSFODNN7EXAMPLE" className="w-full p-2.5 text-sm font-mono bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-400 text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5">Secret Access Key</label>
                    <input type="password" defaultValue="secretkey123" className="w-full p-2.5 text-sm font-mono bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-400 text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5">Bucket Name</label>
                    <input type="text" defaultValue="edutech-assets-prod" className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-400 text-slate-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5">Region</label>
                    <input type="text" defaultValue="ap-southeast-1" className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-400 text-slate-700" />
                  </div>
                </div>
              </div>

              {/* Cloudflare CDN Config Block */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <CloudLightning className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        Cloudflare CDN
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded uppercase tracking-wider">ACTIVE</span>
                      </h3>
                    </div>
                  </div>
                  <ToggleSwitch enabled={cfActive} setEnabled={setCfActive} />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5">CDN URL</label>
                  <input type="text" defaultValue="https://cdn.edutech.edu.vn" className="w-full p-2.5 text-sm text-blue-600 bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-400" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}