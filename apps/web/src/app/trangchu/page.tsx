'use client';

import React from 'react';
import {
  GraduationCap,
  Search,
  Wand2,
  Users,
  Star,
  Bell,
  Settings,
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  PlayCircle,
  Bookmark,
  LogOut,
  User,
  FileText,
  Layers,
  Network,
  ShoppingCart,
  ThumbsUp,
  MessageSquare,
  Eye,
  Download,
  Play,
  Target,
  TrendingUp,
  Filter,
  Globe,
  Mail,
  Share2,
  MapPin,
  Phone,
  Bot
} from 'lucide-react';

export default function TrangChuPage() {
  return (
    <div className="bg-[#f4f6fb] text-[#334155] min-h-screen font-sans">
      {/* HEADER Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-[#0055d4] text-white p-1.5 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-[#0f172a] tracking-tight">Kinetic Academy</span>
          </div>

          {/* Search Bar */}
          <div className="relative w-[400px]">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Tìm bài giảng, PDF, video, SCORM..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#f1f5f9] border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-[#0055d4] transition-all"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="bg-[#eff6ff] hover:bg-[#dbeafe] text-[#0055d4] px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition border border-transparent">
            <Wand2 className="w-3.5 h-3.5" /> Trợ lý AI
          </button>

          <div className="flex items-center gap-1.5 text-xs text-[#475569] bg-[#f1f5f9] px-3 py-1.5 rounded-full">
            <Users className="w-3.5 h-3.5" />
            <span>Lớp <strong>12A1</strong></span>
          </div>

          <div className="bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa] px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-[#ea580c]" />
            <span>1,250 Points</span>
          </div>

          <button className="text-gray-500 hover:text-gray-700 relative p-1.5">
            <Bell className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
            <img
              src="https://i.pravatar.cc/100?img=32"
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-gray-200"
            />
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex min-h-[calc(100vh-65px)] max-w-[1600px] mx-auto">
        {/* LEFT SIDEBAR */}
        <aside className="w-[260px] bg-[#f8fafc] border-r border-gray-200 py-6 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="flex items-center space-x-3 px-6 mb-8">
              <img
                src="https://i.pravatar.cc/100?img=32"
                alt="User"
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
              <div>
                <h4 className="font-bold text-sm text-[#0f172a] leading-tight">Kinetic Learner</h4>
                <p className="text-[11px] text-[#64748b]">Học viên chính thức</p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1 text-[13px] font-medium flex flex-col">
              <a href="#" className="flex items-center space-x-3 px-6 py-3 bg-[#e2e8f0] text-[#0055d4] font-semibold border-l-4 border-[#0055d4] transition-colors relative">
                <LayoutDashboard className="w-4 h-4" />
                <span>Bảng điều khiển</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-6 py-3 text-[#64748b] hover:bg-[#f1f5f9] border-l-4 border-transparent hover:text-[#0f172a] transition">
                <BookOpen className="w-4 h-4" />
                <span>Chương trình học / Khoa viện</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-6 py-3 text-[#64748b] hover:bg-[#f1f5f9] border-l-4 border-transparent hover:text-[#0f172a] transition">
                <FolderOpen className="w-4 h-4" />
                <span>Kho Học liệu & Thư viện số</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-6 py-3 text-[#64748b] hover:bg-[#f1f5f9] border-l-4 border-transparent hover:text-[#0f172a] transition">
                <GraduationCap className="w-4 h-4" />
                <span>Môn học của tôi</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-6 py-3 text-[#64748b] hover:bg-[#f1f5f9] border-l-4 border-transparent hover:text-[#0f172a] transition">
                <PlayCircle className="w-4 h-4" />
                <span>Video Edu & Bài giảng</span>
              </a>
              <a href="#" className="flex items-center space-x-3 px-6 py-3 text-[#64748b] hover:bg-[#f1f5f9] border-l-4 border-transparent hover:text-[#0f172a] transition">
                <Bookmark className="w-4 h-4" />
                <span>Tủ sách & Bộ sưu tập</span>
              </a>
            </nav>
          </div>

          {/* Logout */}
          <div className="px-6 border-t border-gray-200 pt-4 mt-8">
            <button className="flex items-center space-x-2 text-[13px] text-[#ef4444] font-semibold hover:bg-red-50 px-3 py-2 rounded-lg transition w-full">
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-12 gap-8 max-w-7xl mx-auto">
            
            {/* LEFT COLUMN */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              
              {/* BANNER: Lộ trình AI đề xuất */}
              <div className="bg-gradient-to-r from-[#bdcde8] via-[#cad8f0] to-[#b2c4e3] rounded-[20px] p-7 relative overflow-hidden shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Wand2 className="w-5 h-5 text-[#f59e0b]" />
                  <h2 className="font-bold text-lg text-[#1e293b]">Lộ trình AI đề xuất</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
                  <div className="bg-white/70 backdrop-blur-md rounded-xl p-5 flex flex-col justify-between border border-white/50 shadow-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#0055d4]">Bài học tiếp theo</span>
                      <h3 className="font-bold text-[15px] text-[#0f172a] mt-1.5 mb-2 leading-tight">Cấu trúc dữ liệu nâng cao</h3>
                      <p className="text-[11px] text-[#64748b] mb-4">Hoàn thành 65% - Module 4</p>
                    </div>
                    <button className="w-full bg-[#0055d4] hover:bg-[#0047b3] text-white py-2 rounded-lg text-xs font-semibold transition shadow-sm">
                      Tiếp tục học
                    </button>
                  </div>

                  <div className="bg-white/70 backdrop-blur-md rounded-xl p-5 flex flex-col justify-between border border-white/50 shadow-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#0055d4]">Ôn tập đề xuất</span>
                      <h3 className="font-bold text-[15px] text-[#0f172a] mt-1.5 mb-2 leading-tight">Thuật toán tối ưu</h3>
                      <p className="text-[11px] text-[#64748b] mb-4">Dựa trên kết quả bài kiểm tra Python</p>
                    </div>
                    <button className="w-full bg-white hover:bg-gray-50 text-[#0055d4] py-2 rounded-lg text-xs font-semibold border border-[#0055d4]/20 transition shadow-sm">
                      Luyện tập ngay
                    </button>
                  </div>

                  <div className="bg-white/70 backdrop-blur-md rounded-xl p-5 flex flex-col justify-between border border-white/50 shadow-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#0055d4]">Kỹ năng thiếu</span>
                      <h3 className="font-bold text-[15px] text-[#0f172a] mt-1.5 mb-2 leading-tight">Big Data cơ bản</h3>
                      <p className="text-[11px] text-[#64748b] mb-4">Lấp đầy khoảng trống kiến thức</p>
                    </div>
                    <button className="w-full bg-[#ff6b00] hover:bg-[#e66000] text-white py-2 rounded-lg text-xs font-semibold transition shadow-sm">
                      Bắt đầu
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION: Học kỳ hiện tại */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-[#0f172a] text-[17px]">Học kỳ hiện tại (Môn học)</h3>
                  <a href="#" className="text-xs font-semibold text-[#0055d4] hover:underline">Xem tất cả</a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Course Card 1 */}
                  <div className="bg-white rounded-[16px] border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className="relative h-[140px] bg-[#e3e8f0]">
                      <img src="https://picsum.photos/400/200?random=11" alt="Course" className="w-full h-full object-cover" />
                      <span className="absolute top-3 right-3 bg-[#f59e0b] text-white text-[10px] font-bold px-2 py-1 rounded">Bắt buộc</span>
                      <span className="absolute bottom-3 right-3 bg-[#0055d4] text-white text-[10px] font-semibold px-2 py-1 rounded flex items-center gap-1.5 shadow-sm">
                        <PlayCircle className="w-3 h-3" /> Lớp học Meet
                      </span>
                    </div>
                    <div className="p-5">
                      <div>
                        <span className="text-[10px] font-bold text-[#0055d4] tracking-wider uppercase">Khoa Kinh doanh</span>
                        <h4 className="font-bold text-[15px] text-[#0f172a] mt-1 mb-3">Nền tảng Phân tích Kinh doanh</h4>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-end text-[11px] font-medium text-[#64748b] mb-1.5">45%</div>
                        <div className="w-full bg-[#f1f5f9] rounded-full h-1.5">
                          <div className="bg-[#0055d4] h-1.5 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      
                      <div className="text-[12px] text-[#64748b] flex items-center gap-1.5 mb-4">
                        <User className="w-3.5 h-3.5" /> TS. Sarah Jenkins
                      </div>
                      
                      <div className="grid grid-cols-3 gap-1.5 mb-4">
                        <button className="bg-[#f8fafc] hover:bg-[#f1f5f9] text-[9px] font-bold text-[#475569] py-1.5 rounded flex items-center justify-center gap-1 border border-gray-100">
                          <FileText className="w-3 h-3 text-[#0055d4]" /> TÓM TẮT AI
                        </button>
                        <button className="bg-[#f8fafc] hover:bg-[#f1f5f9] text-[9px] font-bold text-[#475569] py-1.5 rounded flex items-center justify-center gap-1 border border-gray-100">
                          <Layers className="w-3 h-3 text-[#8b5cf6]" /> FLASHCARDS
                        </button>
                        <button className="bg-[#f8fafc] hover:bg-[#f1f5f9] text-[9px] font-bold text-[#475569] py-1.5 rounded flex items-center justify-center gap-1 border border-gray-100">
                          <Network className="w-3 h-3 text-[#f59e0b]" /> SƠ ĐỒ TƯ DUY
                        </button>
                      </div>
                      
                      <button className="w-full bg-[#0055d4] hover:bg-[#0047b3] text-white py-2.5 rounded-lg text-[13px] font-semibold transition shadow-sm">
                        Học ngay
                      </button>
                    </div>
                  </div>

                  {/* Course Card 2 */}
                  <div className="bg-white rounded-[16px] border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className="relative h-[140px] bg-[#e3e8f0]">
                      <img src="https://picsum.photos/400/200?random=12" alt="Course" className="w-full h-full object-cover" />
                      <span className="absolute bottom-3 right-3 bg-[#0055d4] text-white text-[10px] font-semibold px-2 py-1 rounded flex items-center gap-1.5 shadow-sm">
                        <PlayCircle className="w-3 h-3" /> Lớp học Meet
                      </span>
                    </div>
                    <div className="p-5">
                      <div>
                        <span className="text-[10px] font-bold text-[#0055d4] tracking-wider uppercase">Khoa Kỹ thuật</span>
                        <h4 className="font-bold text-[15px] text-[#0f172a] mt-1 mb-3">Thiết kế Kiến trúc Hệ thống</h4>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-end text-[11px] font-medium text-[#64748b] mb-1.5">15%</div>
                        <div className="w-full bg-[#f1f5f9] rounded-full h-1.5">
                          <div className="bg-[#0055d4] h-1.5 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                      </div>
                      
                      <div className="text-[12px] text-[#64748b] flex items-center gap-1.5 mb-4">
                        <User className="w-3.5 h-3.5" /> GS. Mark Reed
                      </div>
                      
                      <div className="grid grid-cols-3 gap-1.5 mb-4">
                        <button className="bg-[#f8fafc] hover:bg-[#f1f5f9] text-[9px] font-bold text-[#475569] py-1.5 rounded flex items-center justify-center gap-1 border border-gray-100">
                          <FileText className="w-3 h-3 text-[#0055d4]" /> TÓM TẮT AI
                        </button>
                        <button className="bg-[#f8fafc] hover:bg-[#f1f5f9] text-[9px] font-bold text-[#475569] py-1.5 rounded flex items-center justify-center gap-1 border border-gray-100">
                          <Layers className="w-3 h-3 text-[#8b5cf6]" /> FLASHCARDS
                        </button>
                        <button className="bg-[#f8fafc] hover:bg-[#f1f5f9] text-[9px] font-bold text-[#475569] py-1.5 rounded flex items-center justify-center gap-1 border border-gray-100">
                          <Network className="w-3 h-3 text-[#f59e0b]" /> SƠ ĐỒ TƯ DUY
                        </button>
                      </div>
                      
                      <button className="w-full bg-[#0055d4] hover:bg-[#0047b3] text-white py-2.5 rounded-lg text-[13px] font-semibold transition shadow-sm">
                        Học ngay
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION: Học liệu & Khóa học đề xuất */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-[#0f172a] text-[17px]">Học liệu & Khóa học đề xuất</h3>
                  <a href="#" className="text-xs font-semibold text-[#0055d4] hover:underline">Xem cửa hàng</a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white rounded-[16px] border border-gray-200 overflow-hidden p-4">
                    <div className="h-[120px] bg-[#e2e8f0] rounded-xl flex items-center justify-center relative mb-4">
                      <BookOpen className="w-10 h-10 text-[#94a3b8]" />
                      <span className="absolute top-2 left-2 bg-[#f59e0b] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">-20%</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px] text-[#0f172a]">Chuyên sâu Prompt Engineering</h4>
                      <div className="flex items-center gap-2 mt-1.5 mb-4">
                        <span className="text-[#0055d4] font-bold text-[15px]">450.000đ</span>
                        <span className="text-[#94a3b8] text-xs line-through">560.000đ</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 bg-[#0055d4] hover:bg-[#0047b3] text-white py-2 rounded-lg text-[13px] font-semibold transition">
                        Mua ngay
                      </button>
                      <button className="p-2 border border-gray-200 rounded-lg text-[#64748b] hover:bg-gray-50 transition">
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-[16px] border border-gray-200 overflow-hidden p-4">
                    <div className="h-[120px] bg-[#e2e8f0] rounded-xl flex items-center justify-center mb-4">
                      <PlayCircle className="w-10 h-10 text-[#94a3b8]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px] text-[#0f172a]">Mastering React & Tailwind</h4>
                      <div className="mt-1.5 mb-4">
                        <span className="text-[#0055d4] font-bold text-[15px]">Miễn phí</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 bg-[#0055d4] hover:bg-[#0047b3] text-white py-2 rounded-lg text-[13px] font-semibold transition">
                        Đăng ký
                      </button>
                      <button className="p-2 border border-gray-200 rounded-lg text-[#64748b] hover:bg-gray-50 transition">
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION: Thư viện số */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-[#0f172a] text-[17px]">Thư viện số (Đang nghiên cứu)</h3>
                  <div className="flex bg-[#f1f5f9] p-1 rounded-lg text-xs">
                    <button className="px-4 py-1.5 bg-white text-[#0f172a] font-semibold rounded shadow-sm">PDF</button>
                    <button className="px-4 py-1.5 text-[#64748b] font-medium hover:text-[#0f172a]">Video</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-[16px] p-5 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#fde8e8] rounded-xl flex items-center justify-center text-[#ef4444] shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-[#fef2f2] text-[#ef4444] text-[9px] font-bold px-2 py-0.5 rounded border border-[#fee2e2]">BẮT BUỘC</span>
                          <h4 className="font-bold text-[14px] text-[#0f172a]">Kỹ thuật Tối ưu hóa Machine Learning.pdf</h4>
                        </div>
                        <p className="text-[12px] text-[#64748b]">2023 • Khoa Nghiên cứu AI • 45 trang</p>
                        <div className="flex items-center gap-4 text-[11px] text-[#94a3b8] mt-2">
                          <span className="flex items-center gap-1.5"><ThumbsUp className="w-3.5 h-3.5" /> 124 Hữu ích</span>
                          <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> 32 Bình luận</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button className="bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#334155] text-[12px] px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
                        <Eye className="w-4 h-4" /> Đọc trực tuyến
                      </button>
                      <button className="bg-[#0055d4] hover:bg-[#0047b3] text-white text-[12px] px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition shadow-sm">
                        <Download className="w-4 h-4" /> Tải về
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-[16px] p-5 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#e0eaef] rounded-xl flex items-center justify-center text-[#4a6899] shrink-0">
                        <PlayCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-[#f1f5f9] text-[#64748b] text-[9px] font-bold px-2 py-0.5 rounded border border-gray-200">THAM KHẢO</span>
                          <h4 className="font-bold text-[14px] text-[#0f172a]">Bài giảng 4: Mở rộng Cơ sở Hạ tầng Đám mây (Video)</h4>
                        </div>
                        <p className="text-[12px] text-[#64748b]">2024 • Nền tảng CNTT • 1h 20m</p>
                        <div className="flex items-center gap-4 text-[11px] text-[#94a3b8] mt-2">
                          <span className="flex items-center gap-1.5"><ThumbsUp className="w-3.5 h-3.5" /> 89 Hữu ích</span>
                          <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> 12 Bình luận</span>
                        </div>
                      </div>
                    </div>

                    <button className="bg-[#0055d4] hover:bg-[#0047b3] text-white text-[13px] px-5 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 shrink-0 transition shadow-sm">
                      <Play className="w-4 h-4 fill-white" /> Xem ngay
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              
              {/* WIDGET 1 */}
              <div className="bg-white p-6 rounded-[16px] border border-gray-200 shadow-sm">
                <h4 className="font-bold text-[#0f172a] text-[15px] mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#0055d4]" /> Chỉ số tập trung AI
                </h4>
                <div className="h-[120px] flex items-end justify-between gap-2.5 border-b border-gray-100 pb-3 pt-2">
                  <div className="w-full bg-[#dbeafe] rounded-t-sm h-[50%]"></div>
                  <div className="w-full bg-[#bfdbfe] rounded-t-sm h-[70%]"></div>
                  <div className="w-full bg-[#93c5fd] rounded-t-sm h-[90%]"></div>
                  <div className="w-full bg-[#60a5fa] rounded-t-sm h-[65%]"></div>
                  <div className="w-full bg-[#0055d4] rounded-t-sm h-[100%] shadow-sm"></div>
                </div>
                <p className="text-[12px] text-[#64748b] mt-4 leading-relaxed">
                  Mức độ tập trung trung bình tuần này: <strong className="text-[#0f172a]">82%</strong>.<br/> 
                  <span className="text-[#16a34a] font-semibold">Tăng 12%</span> so với tuần trước.
                </p>
              </div>

              {/* WIDGET 2 */}
              <div className="bg-white p-6 rounded-[16px] border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-[#0f172a] text-[15px]">Chuỗi ngày học tập</h4>
                  <span className="text-3xl font-extrabold text-[#f59e0b]">12</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 mb-3">
                  <div className="h-7 bg-[#dbeafe] rounded-sm"></div>
                  <div className="h-7 bg-[#93c5fd] rounded-sm"></div>
                  <div className="h-7 bg-[#3b82f6] rounded-sm"></div>
                  <div className="h-7 bg-[#1d4ed8] rounded-sm"></div>
                  <div className="h-7 bg-[#1e3a8a] rounded-sm"></div>
                  <div className="h-7 bg-[#93c5fd] rounded-sm"></div>
                  <div className="h-7 bg-[#bfdbfe] rounded-sm"></div>
                </div>
                <p className="text-[12px] text-[#64748b]">
                  Bạn đang trong <strong className="text-[#0055d4]">top 5%</strong> học viên chăm chỉ nhất tuần này!
                </p>
              </div>

              {/* WIDGET 3 */}
              <div className="bg-white p-6 rounded-[16px] border border-gray-200 shadow-sm">
                <h4 className="font-bold text-[#0f172a] text-[15px] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#0055d4]" /> Dự báo kết quả
                </h4>
                <div className="flex items-baseline justify-between mb-2 mt-4">
                  <span className="text-[13px] text-[#64748b] font-medium">Điểm trung bình dự kiến</span>
                  <span className="text-3xl font-black text-[#0055d4]">8.5<span className="text-xl text-[#94a3b8]">/10</span></span>
                </div>
                <p className="text-[11px] text-[#94a3b8] italic mt-2 leading-relaxed">
                  *Dựa trên tốc độ hoàn thành 15 bài tập gần nhất và điểm số hiện tại.
                </p>
              </div>

              {/* WIDGET 4 */}
              <div className="bg-white p-6 rounded-[16px] border border-gray-200 shadow-sm space-y-4">
                <h4 className="font-bold text-[#0f172a] text-[15px] flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#0055d4]" /> Bộ lọc học liệu
                </h4>

                <div className="space-y-3 text-[13px]">
                  <div>
                    <label className="text-[#64748b] block mb-1.5 font-medium">Loại File</label>
                    <select className="w-full border border-gray-200 rounded-lg p-2.5 bg-[#f8fafc] focus:outline-none focus:border-[#0055d4] text-[#334155]">
                      <option>Tất cả (All)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#64748b] block mb-1.5 font-medium">Khoa / Môn học</label>
                    <select className="w-full border border-gray-200 rounded-lg p-2.5 bg-[#f8fafc] focus:outline-none focus:border-[#0055d4] text-[#334155]">
                      <option>Tất cả khoa viện</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#64748b] block mb-1.5 font-medium">Năm học</label>
                      <select className="w-full border border-gray-200 rounded-lg p-2.5 bg-[#f8fafc] focus:outline-none focus:border-[#0055d4] text-[#334155]">
                        <option>2023 - 2024</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[#64748b] block mb-1.5 font-medium">Học kỳ</label>
                      <select className="w-full border border-gray-200 rounded-lg p-2.5 bg-[#f8fafc] focus:outline-none focus:border-[#0055d4] text-[#334155]">
                        <option>Học kỳ 1</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[#64748b] block mb-1.5 font-medium">Mức giá</label>
                    <select className="w-full border border-gray-200 rounded-lg p-2.5 bg-[#f8fafc] focus:outline-none focus:border-[#0055d4] text-[#334155]">
                      <option>Tất cả mức giá</option>
                    </select>
                  </div>
                </div>

                <button className="w-full bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#334155] text-[13px] font-bold py-2.5 rounded-lg transition mt-4">
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#f8fafc] border-t border-gray-200 pt-12 pb-6 px-12 text-[13px] text-[#64748b]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-[#0055d4] text-white p-1 rounded">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold text-[15px] text-[#0f172a]">Kinetic Academy</span>
            </div>
            <p className="text-[#64748b] leading-relaxed">
              Empowering next-gen learners with AI-driven personalized education and modern learning tools.
            </p>
            <div className="flex space-x-4 pt-2">
              <Globe className="w-4 h-4 hover:text-[#0055d4] cursor-pointer transition" />
              <Mail className="w-4 h-4 hover:text-[#0055d4] cursor-pointer transition" />
              <Share2 className="w-4 h-4 hover:text-[#0055d4] cursor-pointer transition" />
            </div>
          </div>

          <div>
            <h5 className="font-bold text-[#0f172a] uppercase tracking-wider mb-4 text-xs">TRUY CẬP NHANH</h5>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-[#0055d4] transition">Bảng điều khiển</a></li>
              <li><a href="#" className="hover:text-[#0055d4] transition">Khóa học</a></li>
              <li><a href="#" className="hover:text-[#0055d4] transition">Trường học</a></li>
              <li><a href="#" className="hover:text-[#0055d4] transition">Thư viện</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[#0f172a] uppercase tracking-wider mb-4 text-xs">HỖ TRỢ</h5>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-[#0055d4] transition">Trung tâm Trợ giúp</a></li>
              <li><a href="#" className="hover:text-[#0055d4] transition">Điều khoản Dịch vụ</a></li>
              <li><a href="#" className="hover:text-[#0055d4] transition">Trường học</a></li>
              <li><a href="#" className="hover:text-[#0055d4] transition">Chính sách Cookie</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-[#0f172a] uppercase tracking-wider mb-4 text-xs">LIÊN HỆ</h5>
            <ul className="space-y-3">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 shrink-0" /> Hà Nội, Việt Nam</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 shrink-0" /> +84 123 456 789</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 shrink-0" /> contact@kinetic.edu.vn</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between text-[#94a3b8]">
          <p>© 2024 Kinetic Academy. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0 text-[12px]">
            <a href="#" className="hover:text-[#0f172a] transition">Tiếng Việt</a>
            <a href="#" className="hover:text-[#0f172a] transition">English</a>
            <a href="#" className="hover:text-[#0f172a] transition">Khu vực</a>
          </div>
        </div>

        {/* Floating Chat Widgets */}
        <div className="fixed bottom-6 right-6 flex items-center gap-3">
          <button className="bg-[#f59e0b] hover:bg-[#d97706] text-white text-[13px] font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 transition transform hover:-translate-y-1">
            Trợ lý học tập AI
          </button>
          <button className="bg-[#0055d4] hover:bg-[#0047b3] text-white p-3.5 rounded-full shadow-lg transition transform hover:-translate-y-1">
            <Bot className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
}