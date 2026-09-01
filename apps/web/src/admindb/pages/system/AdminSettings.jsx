/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { 
  Save, 
  ShieldCheck, 
  Clock, 
  Cloud, 
  ChevronDown,
  CloudLightning,
  CreditCard,
  Video,
  Server,
  Key,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers
} from "lucide-react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("payment"); // "payment" | "security_quiz" | "cloud_media" | "network"
  const [isSaved, setIsSaved] = useState(false);

  // 1. STATE CẤU HÌNH HỆ THỐNG
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("edutech_system_settings");
    if (saved) {
      try { return JSON.parse(saved); } catch (_) {}
    }
    return {
      // VNPay Gateway
      vnpTmnCode: "EDUTECH01",
      vnpHashSecret: "VNPAY_SECRET_KEY_SANDBOX_2026",
      vnpUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
      vnpAutoConfirm: true,
      
      // Cloudinary & Storage
      cloudinaryCloudName: "mlyddegi",
      cloudinaryFolderAvatar: "edutech_avatars",
      cloudinaryFolderCourse: "edutech_courses",
      cloudinaryFolderDocs: "edutech_assignments",

      // Quiz & Giám sát gian lận
      maxTabViolations: 3,
      autoSubmitOnTimeout: true,
      strictExamMode: true,
      allowReviewAnswers: true,

      // Live Meet & WebRTC
      jitsiDomain: "meet.jit.si",
      roomPrefix: "edutech_room",
      autoRecordAttendance: true,

      // Bảo mật Admin
      require2FA: false,
      sessionTimeoutMinutes: 60,
      adminIpWhitelist: ""
    };
  });

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  // Lưu cấu hình
  const handleSaveSettings = () => {
    localStorage.setItem("edutech_system_settings", JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Reset về mặc định
  const handleResetDefaults = () => {
    if (window.confirm("Khôi phục toàn bộ cấu hình về giá trị mặc định của hệ thống?")) {
      localStorage.removeItem("edutech_system_settings");
      window.location.reload();
    }
  };

  // Component Toggle Switch
  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
        enabled ? "bg-[#38497C]" : "bg-slate-200"
      }`}
      onClick={() => onChange(!enabled)}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  return (
    <div className="p-4 md:p-6 bg-[#F8F9FA] min-h-screen font-sans space-y-6 pb-16">
      
      {/* 1. HEADER */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Server className="w-4 h-4" />
            <span>EduTech Central Management Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Cấu Hình & Thiết Lập Hệ Thống</h1>
          <p className="text-xs text-slate-500 mt-0.5">Tùy chỉnh thông số cổng thanh toán VNPay, lưu trữ Cloudinary, quy chế thi online và phòng học Meet.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>

          <button
            onClick={handleSaveSettings}
            className="px-5 py-2.5 bg-[#FF8C00] hover:bg-[#e67e00] text-white rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
          >
            {isSaved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? "Đã lưu thành công!" : "Lưu thay đổi"}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN LAYOUT: SIDEBAR TABS & FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Menu Tabs bên trái */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden p-2">
            {[
              { id: "payment", label: "Thanh toán VNPay (Port 8004)", icon: CreditCard, color: "text-emerald-600" },
              { id: "security_quiz", label: "Khảo thí & Anti-Cheat (8003)", icon: ShieldCheck, color: "text-purple-600" },
              { id: "cloud_media", label: "Lưu trữ Cloudinary & Media", icon: Cloud, color: "text-blue-600" },
              { id: "virtual_meet", label: "Phòng học Live & Jitsi Meet", icon: Video, color: "text-orange-600" },
              { id: "network", label: "Bảo mật & Phân quyền Admin", icon: Lock, color: "text-slate-700" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold text-left transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#38497C] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-white" : tab.color}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-3xl p-4 space-y-1.5 text-xs text-blue-900">
            <div className="flex items-center space-x-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Chế độ kiểm thử Sandbox</span>
            </div>
            <p className="text-[11px] text-blue-700/80 leading-relaxed">
              Các thông số cấu hình được áp dụng đồng bộ ngay lập tức cho các cổng Microservices đang chạy qua Docker.
            </p>
          </div>
        </div>

        {/* Nội dung cấu hình bên phải */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* TAB 1: CỔNG THANH TOÁN VNPAY */}
          {activeTab === "payment" && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-2xs space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-900 text-base">Cấu hình Cổng Thanh Toán VNPay Sandbox</h3>
                <p className="text-xs text-slate-400 mt-0.5">Quản lý mã kết nối kết nối `payment-service` với máy chủ VNPAY</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">VNP_TMN_CODE (Mã website)</label>
                  <input
                    type="text"
                    value={settings.vnpTmnCode}
                    onChange={(e) => handleInputChange("vnpTmnCode", e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">VNP_HASH_SECRET (Chuỗi bí mật)</label>
                  <input
                    type="password"
                    value={settings.vnpHashSecret}
                    onChange={(e) => handleInputChange("vnpHashSecret", e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">VNPAY Payment Gateway URL</label>
                  <input
                    type="text"
                    value={settings.vnpUrl}
                    onChange={(e) => handleInputChange("vnpUrl", e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Tự động kích hoạt khóa học sau khi thanh toán thành công</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tự động thêm học viên vào danh sách lớp ngay khi VNPay trả mã 00</p>
                </div>
                <ToggleSwitch
                  enabled={settings.vnpAutoConfirm}
                  onChange={(val) => handleInputChange("vnpAutoConfirm", val)}
                />
              </div>
            </div>
          )}

          {/* TAB 2: KHẢO THÍ & CHỐNG GIAN LẬN (QUIZ SERVICE) */}
          {activeTab === "security_quiz" && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-2xs space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-900 text-base">Quy chế Khảo thí & Giám sát Chống Gian lận</h3>
                <p className="text-xs text-slate-400 mt-0.5">Thiết lập chính sách phát hiện chuyển Tab, thoát màn hình trong `ExamRoom`</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Số lần chuyển Tab tối đa cho phép</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.maxTabViolations}
                    onChange={(e) => handleInputChange("maxTabViolations", Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">Vượt quá ngưỡng này sẽ bị đánh dấu đỏ trong báo cáo của Giảng viên.</span>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Tự động thu bài khi hết thời gian</h4>
                      <p className="text-[10px] text-slate-400">Tự động đóng bài và gửi lên MongoDB Atlas</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.autoSubmitOnTimeout}
                      onChange={(val) => handleInputChange("autoSubmitOnTimeout", val)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">Chế độ thi bảo mật cao (Full Screen Lock)</h4>
                      <p className="text-[10px] text-slate-400">Cảnh báo khi mất tiêu điểm cửa sổ thi</p>
                    </div>
                    <ToggleSwitch
                      enabled={settings.strictExamMode}
                      onChange={(val) => handleInputChange("strictExamMode", val)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLOUDINARY & LƯU TRỮ */}
          {activeTab === "cloud_media" && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-2xs space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-900 text-base">Cấu hình Lưu Trữ Media Cloudinary</h3>
                <p className="text-xs text-slate-400 mt-0.5">Định tuyến upload ảnh đại diện học viên, bài tập và tài liệu giảng dạy</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Cloudinary Cloud Name</label>
                  <input
                    type="text"
                    value={settings.cloudinaryCloudName}
                    onChange={(e) => handleInputChange("cloudinaryCloudName", e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Folder Avatar Người Dùng</label>
                  <input
                    type="text"
                    value={settings.cloudinaryFolderAvatar}
                    onChange={(e) => handleInputChange("cloudinaryFolderAvatar", e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Folder Bài Tập Tự Luận</label>
                  <input
                    type="text"
                    value={settings.cloudinaryFolderDocs}
                    onChange={(e) => handleInputChange("cloudinaryFolderDocs", e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Folder Tài Liệu Khóa Học</label>
                  <input
                    type="text"
                    value={settings.cloudinaryFolderCourse}
                    onChange={(e) => handleInputChange("cloudinaryFolderCourse", e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PHÒNG HỌC LIVE & MEET */}
          {activeTab === "virtual_meet" && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-2xs space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-900 text-base">Cấu hình Phòng Học Trực Tuyến (Jitsi / WebRTC)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Quản lý máy chủ phát sóng Live Meet cho toàn bộ các lớp học chính quy</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Jitsi Server Domain</label>
                  <input
                    type="text"
                    value={settings.jitsiDomain}
                    onChange={(e) => handleInputChange("jitsiDomain", e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Mã Định Danh Tiền Tố (Room Prefix)</label>
                  <input
                    type="text"
                    value={settings.roomPrefix}
                    onChange={(e) => handleInputChange("roomPrefix", e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">Tự động ghi nhận giờ vào / rời để điểm danh</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Lưu nhật ký tham gia lớp học vào bảng `attendance_logs`</p>
                </div>
                <ToggleSwitch
                  enabled={settings.autoRecordAttendance}
                  onChange={(val) => handleInputChange("autoRecordAttendance", val)}
                />
              </div>
            </div>
          )}

          {/* TAB 5: BẢO MẬT & QUẢN TRỊ VIÊN */}
          {activeTab === "network" && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-2xs space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-900 text-base">Bảo Mật & Phân Quyền Quản Trị Viên</h3>
                <p className="text-xs text-slate-400 mt-0.5">Cấu hình thời gian phiên đăng nhập và bảo vệ phiên làm việc Admin</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Bắt buộc Xác thực 2 bước (2FA OTP)</h4>
                    <p className="text-[11px] text-slate-400">Áp dụng cho tất cả tài khoản có vai trò ADMIN</p>
                  </div>
                  <ToggleSwitch
                    enabled={settings.require2FA}
                    onChange={(val) => handleInputChange("require2FA", val)}
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Thời gian tự động hết hạn phiên (Phút)</label>
                  <input
                    type="number"
                    value={settings.sessionTimeoutMinutes}
                    onChange={(e) => handleInputChange("sessionTimeoutMinutes", Number(e.target.value))}
                    className="w-48 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}