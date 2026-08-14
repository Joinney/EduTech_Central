/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookOpenCheck,
  FolderTree,
  Database,
  Users,
  TrendingUp,
  MessageSquareCheck,
  Radio,
  Video,
  ClipboardCheck,
  HelpCircle,
  FileCheck,
  BarChart3,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Download,
  Trash2,
  Edit3,
  Eye,
  Settings,
  MoreVertical,
  Calendar,
  AlertTriangle,
  UserCheck,
  FileText,
  Layers,
  GraduationCap
} from "lucide-react";

export default function AdminCourses() {
  const location = useLocation();
  const navigate = useNavigate();

  // Quản lý Tab chính (content | students | live | assessment)
  const [mainTab, setMainTab] = useState("content");

  // Quản lý Tab con cho từng nhóm
  const [subTabContent, setSubTabContent] = useState("course_list");
  const [subTabStudent, setSubTabStudent] = useState("student_list");
  const [subTabLive, setSubTabLive] = useState("schedule");
  const [subTabAssess, setSubTabAssess] = useState("question_bank");

  // 🚀 TỰ ĐỘNG ĐỒNG BỘ THEO THANH SIDEBAR TRÁI (URL PARAMS)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get("tab") || "content";
    const subParam = params.get("sub");

    setMainTab(tabParam);
    if (tabParam === "content" && subParam) setSubTabContent(subParam);
    if (tabParam === "students" && subParam) setSubTabStudent(subParam);
    if (tabParam === "live" && subParam) setSubTabLive(subParam);
    if (tabParam === "assessment" && subParam) setSubTabAssess(subParam);
  }, [location.search]);

  // Hàm chuyển đổi sub-tab nhanh trên đầu
  const handleSwitchSubTab = (subId) => {
    if (mainTab === "content") setSubTabContent(subId);
    if (mainTab === "students") setSubTabStudent(subId);
    if (mainTab === "live") setSubTabLive(subId);
    if (mainTab === "assessment") setSubTabAssess(subId);

    navigate(`/admin/courses?tab=${mainTab}&sub=${subId}`);
  };

  // Tiêu đề & Icon theo nhóm Tab hiện tại
  const getTabHeaderInfo = () => {
    switch (mainTab) {
      case "students":
        return { title: "Quản Lý Lớp Học & Học Viên", desc: "Theo dõi hồ sơ học viên, tỷ lệ chuyên cần và thảo luận lớp học.", icon: GraduationCap };
      case "live":
        return { title: "Điều Phối Dạy Online & Lịch Live", desc: "Thời khóa biểu phòng học ảo Jitsi/Meet và nhật ký điểm danh thời gian thực.", icon: Radio };
      case "assessment":
        return { title: "Trung Tâm Đánh Giá & Khảo Thí", desc: "Ngân hàng câu hỏi, thiết lập đề thi đảo câu và công cụ chấm bài tự luận.", icon: FileCheck };
      default:
        return { title: "Quản Lý Khóa Học & Bài Giảng (LCMS Core)", desc: "Kiểm duyệt khóa học mới, cấu trúc chương mục và ngân hàng tài nguyên dùng chung.", icon: BookOpenCheck };
    }
  };

  const currentHeader = getTabHeaderInfo();
  const HeaderIcon = currentHeader.icon;

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen font-sans space-y-5">
      
      {/* ================= HEADER TRANG ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <HeaderIcon className="w-4 h-4" />
            <span>EduTech Central LCMS Core</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {currentHeader.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentHeader.desc}
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Báo Cáo</span>
          </button>
          <button className="px-4 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center space-x-1.5">
            <Plus className="w-4 h-4" />
            <span>Tạo Khóa Mới (Admin)</span>
          </button>
        </div>
      </div>

      {/* ================= NỘI DUNG TỪNG NHÓM (ĐƯỢC CHỌN TỪ SIDEBAR) ================= */}

      {/* ==================== 1. KHÓA HỌC & BÀI GIẢNG ==================== */}
      {mainTab === "content" && (
        <div className="space-y-4">
          {/* Sub-tabs menu */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            {[
              { id: "course_list", label: "Danh sách khóa học & Kiểm duyệt", icon: BookOpenCheck },
              { id: "curriculum", label: "Cấu trúc chương mục (Modules)", icon: Layers },
              { id: "resources", label: "Ngân hàng tài nguyên dùng chung", icon: Database },
            ].map((st) => {
              const Icon = st.icon;
              return (
                <button
                  key={st.id}
                  onClick={() => handleSwitchSubTab(st.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    subTabContent === st.id
                      ? "bg-[#38497C] text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-tab 1.1: Danh sách khóa học */}
          {subTabContent === "course_list" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              {/* Cột danh sách */}
              <div className="xl:col-span-8 space-y-3">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm theo mã lớp, tên khóa học, giảng viên..."
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer">
                    <option>Tất cả trạng thái (Chờ duyệt, Hoạt động)</option>
                    <option>Chờ kiểm duyệt</option>
                    <option>Đang giảng dạy</option>
                    <option>Đã đóng lớp</option>
                  </select>
                </div>

                {/* Bảng danh sách khóa học */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Khóa học / Lớp</th>
                        <th className="p-3.5">Giảng viên</th>
                        <th className="p-3.5">Loại hình</th>
                        <th className="p-3.5">Giá niêm yết</th>
                        <th className="p-3.5">Trạng thái</th>
                        <th className="p-3.5 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {[
                        { id: 1, code: "CLASS-7WSQ", title: "Lập trình ReactJS & Microservices", teacher: "ThS. Phan Thuận", type: "Khóa Tự Do", price: "1,200,000 đ", status: "Chờ duyệt", statusColor: "bg-amber-100 text-amber-700" },
                        { id: 2, code: "MATH-12A1", title: "Toán Nâng Cao 12 - Ôn Thi THPT", teacher: "Cô Lê Thị Hoa", type: "Lớp Trường", price: "Miễn phí", status: "Đã duyệt", statusColor: "bg-emerald-100 text-emerald-700" },
                        { id: 3, code: "ENG-IELTS", title: "IELTS Speaking Masterclass 7.5+", teacher: "Thầy John Đặng", type: "Khóa Tự Do", price: "1,500,000 đ", status: "Yêu cầu sửa", statusColor: "bg-rose-100 text-rose-700" }
                      ].map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5">
                            <span className="font-mono text-[10px] text-orange-600 font-bold block">{item.code}</span>
                            <span className="font-bold text-slate-900">{item.title}</span>
                          </td>
                          <td className="p-3.5">{item.teacher}</td>
                          <td className="p-3.5"><span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold">{item.type}</span></td>
                          <td className="p-3.5 font-bold text-slate-900">{item.price}</td>
                          <td className="p-3.5"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.statusColor}`}>{item.status}</span></td>
                          <td className="p-3.5 text-right space-x-1">
                            <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600" title="Chi tiết"><Eye className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-600" title="Duyệt"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600" title="Từ chối"><XCircle className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cột Chi tiết kiểm duyệt & Phân công */}
              <div className="xl:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <span>Chi tiết kiểm duyệt nội dung</span>
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold uppercase">CLASS-7WSQ</span>
                </h3>
                <div className="space-y-2">
                  <p className="text-slate-500">Giảng viên: <strong className="text-slate-800">ThS. Phan Thuận</strong></p>
                  <p className="text-slate-500">Đơn vị / Trường: <strong className="text-slate-800">Đại học Bách Khoa TP.HCM</strong></p>
                  <p className="text-slate-500">Số lượng bài giảng: <strong className="text-slate-800">12 bài</strong> | Bài tập: <strong className="text-slate-800">4 bài</strong></p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-slate-700 block uppercase text-[10px]">Ghi chú kiểm duyệt từ Admin</span>
                  <textarea rows="3" placeholder="Nhập lý do duyệt hoặc yêu cầu chỉnh sửa gửi giảng viên..." className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs resize-none outline-none"></textarea>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">Phê Duyệt Khóa</button>
                  <button className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl border border-rose-200">Yêu Cầu Sửa</button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 1.2: Cấu trúc chương mục (Modules) */}
          {subTabContent === "curriculum" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Sơ đồ Cấu trúc Chương mục (Curriculum Tree)</h3>
                  <p className="text-xs text-slate-500">Phân cấp khóa học: Khóa học -&gt; Chương (Module) -&gt; Bài học -&gt; Tài nguyên</p>
                </div>
                <button className="px-3.5 py-1.5 bg-[#38497C] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Chương Mới</span>
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { module: "Chương 1: Tổng quan kiến trúc Microservices", lessons: 4, duration: "3 giờ 15 phút" },
                  { module: "Chương 2: Xây dựng REST API & Golang Service", lessons: 6, duration: "5 giờ 30 phút" },
                  { module: "Chương 3: Realtime với Jitsi Meet & WebRTC", lessons: 5, duration: "4 giờ 00 phút" }
                ].map((mod, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-orange-500 text-white font-bold text-xs flex items-center justify-center">{i + 1}</span>
                        <h4 className="font-bold text-xs text-slate-900">{mod.module}</h4>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">{mod.lessons} bài học • {mod.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-tab 1.3: Ngân hàng tài nguyên dùng chung */}
          {subTabContent === "resources" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-900">Kho lưu trữ tài nguyên đa phương tiện (Cloudinary CDN)</h3>
                <button className="px-3.5 py-1.5 bg-[#F97316] text-white text-xs font-bold rounded-xl flex items-center space-x-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tải lên tài nguyên chung</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {[
                  { name: "Slide_KienTruc_Microservices.pdf", size: "14.2 MB", date: "12/08/2026", type: "PDF" },
                  { name: "DeThiMau_THPT_Toan_2026.docx", size: "3.5 MB", date: "10/08/2026", type: "Word" },
                  { name: "Bang_Tinh_Diem_Chuan.xlsx", size: "1.1 MB", date: "09/08/2026", type: "Excel" }
                ].map((file, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-slate-900 truncate max-w-[180px]">{file.name}</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">{file.size} • {file.date}</p>
                    </div>
                    <span className="px-2 py-1 bg-white border border-slate-200 rounded-md font-mono text-[10px] font-bold">{file.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 2. LỚP HỌC & HỌC VIÊN ==================== */}
      {mainTab === "students" && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            {[
              { id: "student_list", label: "Danh sách học viên & Phân nhóm", icon: Users },
              { id: "progress", label: "Tiến độ học tập & Tương tác", icon: TrendingUp },
              { id: "forum", label: "Kiểm duyệt diễn đàn & Thảo luận", icon: MessageSquareCheck },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => handleSwitchSubTab(st.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  subTabStudent === st.id
                    ? "bg-[#38497C] text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <st.icon className="w-4 h-4" />
                <span>{st.label}</span>
              </button>
            ))}
          </div>

          {subTabStudent === "student_list" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center gap-3">
                <input type="text" placeholder="Tìm học viên theo tên, email, lớp đang học..." className="px-3 py-1.5 bg-slate-50 border rounded-xl text-xs w-72" />
                <button className="px-3 py-1.5 bg-[#F97316] text-white font-bold rounded-xl text-xs">+ Thêm học viên vào lớp</button>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">Học viên</th>
                    <th className="p-3.5">Lớp đang theo học</th>
                    <th className="p-3.5">Ngày tham gia</th>
                    <th className="p-3.5">Trạng thái</th>
                    <th className="p-3.5 text-right">Quản trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: "Nguyễn Văn An", email: "an.nguyen@gmail.com", class: "CLASS-7WSQ (ReactJS)", date: "10/08/2026", status: "Đang học" },
                    { name: "Trần Thị Mai", email: "mai.tran@gmail.com", class: "MATH-12A1 (Toán 12)", date: "12/08/2026", status: "Đang học" },
                    { name: "Lê Hoàng Long", email: "long.le@gmail.com", class: "ENG-IELTS (IELTS)", date: "14/08/2026", status: "Chờ duyệt" }
                  ].map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{s.name}<span className="block text-[10px] text-slate-400 font-normal">{s.email}</span></td>
                      <td className="p-3.5 font-medium">{s.class}</td>
                      <td className="p-3.5 text-slate-500">{s.date}</td>
                      <td className="p-3.5"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded font-bold text-[10px]">{s.status}</span></td>
                      <td className="p-3.5 text-right space-x-1">
                        <button className="p-1 hover:bg-slate-200 rounded text-slate-600"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button className="p-1 hover:bg-red-100 rounded text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {subTabStudent === "progress" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-sm text-slate-900">Báo cáo Hoàn thành Khóa học & Cảnh báo bỏ học</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <span className="text-emerald-800 font-bold text-xs">Hoàn thành &gt; 80% bài học</span>
                  <h4 className="text-2xl font-black text-emerald-600 mt-1">128 HV</h4>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <span className="text-amber-800 font-bold text-xs">Đang chậm tiến độ</span>
                  <h4 className="text-2xl font-black text-amber-600 mt-1">34 HV</h4>
                </div>
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                  <span className="text-rose-800 font-bold text-xs">Chưa nộp bài tập / Nguy cơ</span>
                  <h4 className="text-2xl font-black text-rose-600 mt-1">12 HV</h4>
                </div>
              </div>
            </div>
          )}

          {subTabStudent === "forum" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-sm text-slate-900">Kiểm duyệt bình luận & Thảo luận trong lớp</h3>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                <div>
                  <h5 className="font-bold text-slate-900">Học sinh: Nguyễn Văn An tại bài &quot;Microservices Overview&quot;</h5>
                  <p className="text-slate-600 mt-1">&quot;Thầy ơi cho em hỏi phần gRPC kết nối với Golang port 8002 bị lỗi connection refused thì fix sao ạ?&quot;</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold">Duyệt hiện</button>
                  <button className="px-3 py-1 bg-rose-100 text-rose-600 rounded-lg font-bold">Ẩn</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 3. DẠY ONLINE & LỊCH LIVE ==================== */}
      {mainTab === "live" && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            {[
              { id: "schedule", label: "Thời khóa biểu & Lên lịch Live", icon: Calendar },
              { id: "virtual_room", label: "Tích hợp phòng học ảo (Jitsi/Meet)", icon: Video },
              { id: "attendance", label: "Điểm danh & Thời gian tham gia", icon: Clock },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => handleSwitchSubTab(st.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  subTabLive === st.id
                    ? "bg-[#38497C] text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <st.icon className="w-4 h-4" />
                <span>{st.label}</span>
              </button>
            ))}
          </div>

          {subTabLive === "schedule" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Phân bổ Lịch dạy trực tuyến (Live Sessions)</h3>
                  <p className="text-slate-500">Admin xếp thời khóa biểu cho các lớp trường học chính quy và duyệt lịch khóa mở rộng.</p>
                </div>
                <button className="px-3.5 py-2 bg-[#F97316] text-white font-bold rounded-xl">+ Xếp lịch dạy mới</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Toán 12A1: Luyện đề số 04", room: "edutech_room_math12a1_id2", time: "19:30 - 21:00 (Thứ 2, 4, 6)", status: "Sắp diễn ra" },
                  { title: "ReactJS: Hướng dẫn Socket.io Realtime", room: "edutech_room_class7wsq_id8", time: "20:00 - 22:00 (Thứ 3, 5, 7)", status: "Đang Live" }
                ].map((s, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded font-bold uppercase text-[10px] animate-pulse">{s.status}</span>
                    </div>
                    <p className="text-slate-500">⏰ Khung giờ: <strong>{s.time}</strong></p>
                    <p className="text-slate-500">🔗 Mã phòng Jitsi: <code className="text-orange-600 bg-orange-50 px-1 py-0.5 rounded font-mono">{s.room}</code></p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {subTabLive === "virtual_room" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900">Cấu hình Hệ thống Phòng Ảo (Virtual Classroom API)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-blue-900">
                    <Radio className="w-4 h-4 text-blue-600" />
                    <span>Jitsi Meet (Mặc định)</span>
                  </div>
                  <p className="text-blue-700 text-[11px]">Đã tích hợp Jitsi Meet External API mã nguồn mở, không giới hạn thời gian.</p>
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded">Đang kích hoạt</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 opacity-75">
                  <span className="font-bold text-slate-800">Zoom SDK Integration</span>
                  <p className="text-slate-500 text-[11px]">Kết nối tài khoản Zoom Pro thông qua JWT / OAuth 2.0.</p>
                  <button className="px-2.5 py-1 bg-white border rounded text-[11px] font-bold">Cấu hình API Key</button>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 opacity-75">
                  <span className="font-bold text-slate-800">Google Meet API</span>
                  <p className="text-slate-500 text-[11px]">Tự động tạo link Google Meet thông qua Google Calendar API.</p>
                  <button className="px-2.5 py-1 bg-white border rounded text-[11px] font-bold">Cấu hình OAuth</button>
                </div>
              </div>
            </div>
          )}

          {subTabLive === "attendance" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-sm text-slate-900">Nhật ký Điểm danh Trực tuyến (Attendance Logs)</h3>
              <table className="w-full text-left">
                <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold">
                  <tr>
                    <th className="p-3">Học viên</th>
                    <th className="p-3">Phòng học</th>
                    <th className="p-3">Giờ vào</th>
                    <th className="p-3">Giờ rời</th>
                    <th className="p-3">Tổng thời lượng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: "Phan Thuận (Giáo viên)", room: "CLASS-7WSQ", in: "19:28:10", out: "21:05:00", dur: "96 phút" },
                    { name: "Nguyễn Văn An (Học sinh)", room: "CLASS-7WSQ", in: "19:31:05", out: "21:00:12", dur: "89 phút" }
                  ].map((log, i) => (
                    <tr key={i}>
                      <td className="p-3 font-bold text-slate-900">{log.name}</td>
                      <td className="p-3 font-mono">{log.room}</td>
                      <td className="p-3 text-emerald-600 font-bold">{log.in}</td>
                      <td className="p-3 text-rose-600 font-bold">{log.out}</td>
                      <td className="p-3 font-bold">{log.dur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== 4. ĐÁNH GIÁ & KHẢO THÍ ==================== */}
      {mainTab === "assessment" && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            {[
              { id: "question_bank", label: "Kho ngân hàng câu hỏi", icon: HelpCircle },
              { id: "quiz_mgmt", label: "Quản lý bài kiểm tra & Đề thi", icon: FileCheck },
              { id: "grading", label: "Chấm điểm & Báo cáo khảo thí", icon: BarChart3 },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => handleSwitchSubTab(st.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  subTabAssess === st.id
                    ? "bg-[#38497C] text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <st.icon className="w-4 h-4" />
                <span>{st.label}</span>
              </button>
            ))}
          </div>

          {subTabAssess === "question_bank" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-slate-900">Ngân hàng câu hỏi trắc nghiệm & tự luận theo chuyên đề</h3>
                <button className="px-3.5 py-1.5 bg-[#F97316] text-white font-bold rounded-xl">+ Soạn câu hỏi mới</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[
                  { topic: "Toán 12 - Giải tích & Đạo hàm", count: "140 câu" },
                  { topic: "Lập trình Web - React Hooks", count: "85 câu" },
                  { topic: "Tiếng Anh - Grammar & Reading", count: "210 câu" },
                  { topic: "Vật Lý - Sóng cơ & Dao động", count: "95 câu" }
                ].map((bank, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <h5 className="font-bold text-slate-900">{bank.topic}</h5>
                    <p className="text-orange-600 font-bold mt-1">{bank.count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {subTabAssess === "quiz_mgmt" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-sm text-slate-900">Thiết lập bài thi (Đảo đề ngẫu nhiên, giới hạn thời gian)</h3>
              <p className="text-slate-500">Cấu hình thời gian đếm ngược, điểm liệt, tự động khóa bài khi hết giờ.</p>
              <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">Đề thi Giữa kỳ: Lập trình Microservices Fullstack</span>
                  <span className="text-slate-500 font-bold">Thời gian: 45 phút • 30 câu hỏi • Điểm đạt: 5.0</span>
                </div>
              </div>
            </div>
          )}

          {subTabAssess === "grading" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-sm text-slate-900">Bảng tổng hợp điểm số & Công cụ phúc khảo</h3>
              <p className="text-slate-500">Giáo viên chấm bài tự luận kèm file đính kèm Word/PDF từ học viên.</p>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center">
                <span>Tổng số bài tự luận đã nộp chờ chấm: <strong className="text-emerald-800">18 bài</strong></span>
                <button className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl font-bold">Mở công cụ chấm bài</button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}