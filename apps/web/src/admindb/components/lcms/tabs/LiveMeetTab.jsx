import React from "react";
import { Calendar, Clock } from "lucide-react";

export default function LiveMeetTab({
  courses,
  attendanceLogs,
  subTabLive,
  onSwitchSubTab
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        {[
          { id: "schedule", label: "Phòng học ảo & Lịch phát", icon: Calendar },
          { id: "attendance", label: `Nhật ký điểm danh Live (${attendanceLogs.length})`, icon: Clock }
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => onSwitchSubTab(st.id)}
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
          <h3 className="font-bold text-sm text-slate-900">Danh sách các phòng Live Meet đang hoạt động</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((c) => (
              <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                  <span
                    className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                      c.meetIsActive ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {c.meetIsActive ? "Đang Phát Live" : "Sẵn Sàng"}
                  </span>
                </div>
                <p className="text-slate-500">
                  ⏰ Lịch học: <strong>{c.schedule || "Chưa có lịch"}</strong>
                </p>
                <p className="text-slate-500">
                  🔗 Phòng Meet:{" "}
                  <code className="text-orange-600 bg-orange-50 px-1 py-0.5 rounded font-mono">
                    edutech_room_{(c.code || "room").toLowerCase()}_id{c.id}
                  </code>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTabLive === "attendance" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-sm text-slate-900">Nhật ký Điểm danh Trực tuyến (Attendance Logs Thực tế)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b">
                <tr>
                  <th className="p-3">Học viên</th>
                  <th className="p-3">Mã phòng Jitsi</th>
                  <th className="p-3">Giờ vào</th>
                  <th className="p-3">Giờ rời</th>
                  <th className="p-3">Tổng thời lượng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {attendanceLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{log.student_name || "Học viên"}</td>
                    <td className="p-3 font-mono text-orange-600">{log.room_name}</td>
                    <td className="p-3 text-emerald-600 font-bold">
                      {log.joined_at ? new Date(log.joined_at).toLocaleTimeString("vi-VN") : "--"}
                    </td>
                    <td className="p-3 text-rose-600 font-bold">
                      {log.left_at ? new Date(log.left_at).toLocaleTimeString("vi-VN") : "Đang trong phòng"}
                    </td>
                    <td className="p-3 font-bold">
                      {log.duration_minutes ? `${log.duration_minutes} phút` : "1 phút"}
                    </td>
                  </tr>
                ))}
                {attendanceLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">Chưa có lượt điểm danh nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}