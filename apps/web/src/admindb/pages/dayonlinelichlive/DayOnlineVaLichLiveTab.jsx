/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from "react";
import { 
  Calendar, 
  Clock, 
  Video, 
  Radio, 
  UserCircle, 
  Search, 
  Filter, 
  ExternalLink, 
  Copy, 
  Check, 
  Users, 
  Building2, 
  Sparkles, 
  Download,
  ShieldCheck,
  Activity,
  AlertCircle
} from "lucide-react";

export default function DayOnlineVaLichLiveTab({
  courses = [],
  attendanceLogs = [],
  subTabLive,
  onSwitchSubTab
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "left"
  const [copiedRoomId, setCopiedRoomId] = useState(null);

  // 🎯 1. Map tra cứu Avatar & Tên thật từ bảng users (qua courses.students)
  const studentMap = useMemo(() => {
    const map = new Map();
    courses.forEach((c) => {
      (c.students || []).forEach((st) => {
        const sId = Number(st.id_users || st.id || st.user_id || st.student_id);
        const avatar = st.avatar || st.avatar_url || st.avatarUrl || st.photo || st.image;
        const name = st.fullName || st.full_name || st.displayName || st.name || st.student_name;
        const email = (st.email || st.student_email || "").toLowerCase();

        const studentInfo = { avatar, name, email };

        if (sId) {
          map.set(sId, studentInfo);
        }
        if (email) {
          map.set(email, studentInfo);
        }
      });
    });
    return map;
  }, [courses]);

  // 2. Sao chép ID phòng
  const handleCopyRoom = (roomCode, courseId) => {
    const fullRoom = `edutech_room_${(roomCode || "room").toLowerCase()}_id${courseId}`;
    navigator.clipboard.writeText(fullRoom);
    setCopiedRoomId(courseId);
    setTimeout(() => setCopiedRoomId(null), 2000);
  };

  // 3. Lọc danh sách lớp học cho Sub-tab 1 & 2
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch = 
        (c.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.teacher_name || c.teacherName || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCourse = selectedCourseFilter === "all" || String(c.id) === String(selectedCourseFilter);
      return matchSearch && matchCourse;
    });
  }, [courses, searchTerm, selectedCourseFilter]);

  // 4. Lọc danh sách nhật ký điểm danh cho Sub-tab 3
  const filteredLogs = useMemo(() => {
    return attendanceLogs.filter((log) => {
      const sId = Number(log.student_id || log.user_id);
      const sEmail = (log.student_email || "").toLowerCase();
      const mapped = studentMap.get(sId) || studentMap.get(sEmail);

      const displayName = mapped?.name || log.student_name || "Học viên";
      const displayEmail = mapped?.email || log.student_email || "";

      const matchSearch = 
        displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        displayEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.room_name || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchCourse = selectedCourseFilter === "all" || String(log.course_id) === String(selectedCourseFilter);
      
      let matchStatus = true;
      if (statusFilter === "active") matchStatus = !log.left_at;
      if (statusFilter === "left") matchStatus = !!log.left_at;

      return matchSearch && matchCourse && matchStatus;
    });
  }, [attendanceLogs, searchTerm, selectedCourseFilter, statusFilter, studentMap]);

  // Thống kê nhanh điểm danh
  const stats = useMemo(() => {
    const liveCoursesCount = courses.filter((c) => c.meetIsActive || c.meet_is_active).length;
    const activeInRoomCount = attendanceLogs.filter((l) => !l.left_at).length;
    return {
      liveCoursesCount,
      activeInRoomCount,
      totalLogs: attendanceLogs.length
    };
  }, [courses, attendanceLogs]);

  // Xuất file CSV nhật ký điểm danh
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert("Không có dữ liệu điểm danh để xuất file!");
      return;
    }

    const headers = ["STT", "Học viên", "Email", "Phòng Live", "Giờ vào", "Giờ rời", "Thời lượng (Phút)"];
    const rows = filteredLogs.map((log, idx) => {
      const sId = Number(log.student_id || log.user_id);
      const sEmail = (log.student_email || "").toLowerCase();
      const mapped = studentMap.get(sId) || studentMap.get(sEmail);

      return [
        idx + 1,
        `"${mapped?.name || log.student_name || "Học viên"}"`,
        `"${mapped?.email || log.student_email || ""}"`,
        `"${log.room_name || ""}"`,
        `"${log.joined_at ? new Date(log.joined_at).toLocaleString("vi-VN") : "--"}"`,
        `"${log.left_at ? new Date(log.left_at).toLocaleString("vi-VN") : "Đang trong phòng"}"`,
        log.duration_minutes || 1
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DiemDanh_LiveMeet_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-fadeIn font-sans pb-8">
      {/* Thanh chuyển Sub-tab */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {[
            { id: "schedule", label: "Phòng học ảo & Lịch phát", icon: Calendar, count: courses.length },
            { id: "virtual_room", label: "Tích hợp phòng ảo & Giám sát", icon: Video, count: stats.liveCoursesCount },
            { id: "attendance", label: `Nhật ký điểm danh online (${attendanceLogs.length})`, icon: Clock }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => onSwitchSubTab(st.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                (subTabLive === st.id || (!subTabLive && st.id === "schedule"))
                  ? "bg-[#38497C] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <st.icon className="w-4 h-4" />
              <span>{st.label}</span>
              {st.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  (subTabLive === st.id || (!subTabLive && st.id === "schedule"))
                    ? "bg-white/20 text-white" 
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {st.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bộ lọc theo lớp */}
        <div className="flex items-center space-x-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tất cả lớp học ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= 1. SUB-TAB: PHÒNG HỌC ẢO & LỊCH PHÁT ================= */}
      {(subTabLive === "schedule" || !subTabLive) && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Danh Sách Lớp Học & Khung Giờ Phát Live</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Theo dõi thời khóa biểu và trạng thái mở phòng của giảng viên</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm lớp, giảng viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCourses.map((c) => {
              const isLive = c.meetIsActive || c.meet_is_active;
              const fullRoomName = `edutech_room_${(c.code || "room").toLowerCase()}_id${c.id}`;

              return (
                <div key={c.id} className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3.5 hover:border-blue-300 transition-all flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                          {c.subject || "Chính quy"}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm mt-1 leading-snug">{c.title}</h4>
                      </div>

                      <span className={`px-2.5 py-1 rounded-lg font-black uppercase text-[10px] flex items-center space-x-1 shrink-0 ${
                        isLive ? "bg-rose-100 text-rose-700 animate-pulse border border-rose-200" : "bg-slate-200 text-slate-600"
                      }`}>
                        {isLive && <Radio className="w-3 h-3" />}
                        <span>{isLive ? "Đang Phát Live" : "Sẵn Sàng"}</span>
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Giảng viên:</span>
                        <strong className="text-slate-800 font-bold">{c.teacher_name || c.teacherName || "Giảng viên bộ môn"}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Lịch học:</span>
                        <strong className="text-slate-800">{c.schedule || "Lịch học linh hoạt"}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Đơn vị:</span>
                        <span className="text-slate-700 font-medium truncate max-w-[180px]">{c.schoolName || "EduTech Academy"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-500 truncate max-w-[220px]">
                      <span className="text-slate-400">Room:</span>
                      <code className="text-orange-600 font-bold truncate">{fullRoomName}</code>
                    </div>

                    <button
                      onClick={() => handleCopyRoom(c.code, c.id)}
                      className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-[11px] flex items-center space-x-1 transition cursor-pointer"
                    >
                      {copiedRoomId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{copiedRoomId === c.id ? "Đã chép" : "Sao chép"}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredCourses.length === 0 && (
              <div className="col-span-2 py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-xs">
                Không tìm thấy phòng học nào phù hợp.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 2. SUB-TAB: TÍCH HỢP PHÒNG ẢO & GIÁM SÁT ================= */}
      {subTabLive === "virtual_room" && (
        <div className="space-y-4 text-xs">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Giám Sát & Điều Phối Phòng Học Ảo Trực Tiếp</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Admin có quyền tham gia kiểm tra chất lượng giảng dạy hoặc kết nối WebRTC / Jitsi Meet</p>
              </div>

              <span className="px-3 py-1 bg-rose-50 text-rose-700 font-black rounded-xl text-xs border border-rose-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>{stats.liveCoursesCount} Phòng đang mở Live</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((c) => {
                const isLive = c.meetIsActive || c.meet_is_active;
                const fullRoomName = `edutech_room_${(c.code || "room").toLowerCase()}_id${c.id}`;
                const jitsiMeetUrl = `https://meet.jit.si/${fullRoomName}`;

                return (
                  <div key={c.id} className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isLive ? "bg-rose-50/30 border-rose-200 shadow-xs" : "bg-slate-50 border-slate-200/80"
                  }`}>
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">{c.title}</h4>
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          isLive ? "bg-rose-500 text-white animate-pulse" : "bg-slate-200 text-slate-600"
                        }`}>
                          {isLive ? "Đang Trực Tuyến" : "Chờ Giảng Viên"}
                        </span>
                      </div>

                      <p className="text-slate-500">Giảng viên: <strong className="text-slate-800 font-bold">{c.teacher_name || c.teacherName || "Giảng viên"}</strong></p>
                      
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
                        <div className="text-slate-400">Tên định danh phòng Jitsi / WebRTC:</div>
                        <div className="text-blue-700 font-bold select-all break-all">{fullRoomName}</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleCopyRoom(c.code, c.id)}
                        className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 text-xs flex items-center space-x-1.5 transition cursor-pointer"
                      >
                        {copiedRoomId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{copiedRoomId === c.id ? "Đã copy" : "Copy Link Phòng"}</span>
                      </button>

                      <a
                        href={jitsiMeetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                      >
                        <span>Vào Giám Sát Phòng</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. SUB-TAB: NHẬT KÝ ĐIỂM DANH LIVE THỰC TẾ ================= */}
      {subTabLive === "attendance" && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Nhật Ký Điểm Danh Học Viên (Live Attendance Logs)</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Dữ liệu ghi nhận tự động theo thời gian thực khi học sinh tham gia & rời phòng Live</p>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer self-start sm:self-auto active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Báo Cáo Điểm Danh (CSV)</span>
            </button>
          </div>

          {/* Thanh công cụ tìm kiếm & lọc */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên học viên, email, mã phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang trong phòng</option>
                <option value="left">Đã rời phòng</option>
              </select>
            </div>
          </div>

          {/* Bảng Dữ Liệu Điểm Danh */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
                  <th className="py-3.5 px-4 rounded-l-xl">Học Viên Tham Gia</th>
                  <th className="py-3.5 px-4">Mã Phòng Live</th>
                  <th className="py-3.5 px-4 text-center">Giờ Vào</th>
                  <th className="py-3.5 px-4 text-center">Giờ Rời</th>
                  <th className="py-3.5 px-4 text-right rounded-r-xl">Tổng Thời Lượng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log, idx) => {
                  const sId = Number(log.student_id || log.user_id);
                  const sEmail = (log.student_email || "").toLowerCase();
                  
                  // 🎯 Lấy thông tin user đã tra cứu từ bảng users qua studentMap
                  const mappedUser = studentMap.get(sId) || studentMap.get(sEmail);

                  const displayName = mappedUser?.name || log.student_name || "Học viên";
                  const displayEmail = mappedUser?.email || log.student_email || (sId ? `Mã SV: #${sId}` : "--");
                  
                  // 🎯 Ưu tiên Avatar từ bảng users qua mappedUser -> log.avatar -> fallback UI
                  const avatarUrl = 
                    mappedUser?.avatar ||
                    log.student_avatar || 
                    log.avatar || 
                    log.avatar_url || 
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

                  const isInRoom = !log.left_at;

                  return (
                    <tr key={log.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      {/* Học viên + Avatar thật */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
                            }}
                          />
                          <div>
                            <h5 className="font-extrabold text-slate-900 text-sm leading-tight">{displayName}</h5>
                            <span className="text-[11px] text-slate-400 font-mono">{displayEmail}</span>
                          </div>
                        </div>
                      </td>

                      {/* Mã Phòng */}
                      <td className="py-3.5 px-4 font-mono font-bold text-orange-600">
                        {log.room_name}
                      </td>

                      {/* Giờ vào */}
                      <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">
                        {log.joined_at ? new Date(log.joined_at).toLocaleTimeString("vi-VN") : "--"}
                      </td>

                      {/* Giờ rời */}
                      <td className="py-3.5 px-4 text-center">
                        {isInRoom ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-black rounded-lg text-[10px] animate-pulse">
                            Đang trong phòng
                          </span>
                        ) : (
                          <span className="text-slate-600 font-medium">
                            {new Date(log.left_at).toLocaleTimeString("vi-VN")}
                          </span>
                        )}
                      </td>

                      {/* Thời lượng */}
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {log.duration_minutes ? `${log.duration_minutes} phút` : "1 phút"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredLogs.length === 0 && (
              <div className="py-14 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-xs space-y-1">
                <p className="font-bold text-slate-600">Chưa có dữ liệu điểm danh nào phù hợp.</p>
                <p className="text-slate-400">Dữ liệu sẽ tự động ghi nhận khi học sinh vào lớp học Meet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}