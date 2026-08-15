import React, { useState } from "react";
import { School, X, Download, Loader2 } from "lucide-react";
import { courseService } from "../../../../api/course.api";

export default function ImportStudentsModal({ isOpen, course, onClose, onSuccess }) {
  const [parsedStudents, setParsedStudents] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen || !course) return null;

  const handleDownloadSampleFile = () => {
    const sampleContent =
      "Họ Và Tên,Email/Tài Khoản,Mật Khẩu,Mã Học Sinh,Trường Học,Khối Lớp\n" +
      "Nguyễn Văn An,an.nguyen@school.edu.vn,123456,1001,THPT Chuyên Lê Hồng Phong,Lớp 12\n" +
      "Trần Thị Mai,mai.tran@school.edu.vn,123456,1002,THPT Chuyên Lê Hồng Phong,Lớp 12\n" +
      "Lê Hoàng Nam,nam.le@school.edu.vn,123456,1003,THPT Chuyên Lê Hồng Phong,Lớp 12\n" +
      "Phạm Quỳnh Chi,chi.pham@school.edu.vn,123456,1004,THPT Chuyên Lê Hồng Phong,Lớp 12";

    const blob = new Blob(["\uFEFF" + sampleContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Danh_Sach_Hoc_Sinh_${course?.code || "ChinhQuy"}.csv`;
    a.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split("\n").filter((line) => line.trim() !== "");
      const students = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
        if (parts.length >= 2 && parts[0]) {
          students.push({
            student_name: parts[0],
            student_email: parts[1],
            password: parts[2] || "123456",
            student_id: Number(parts[3]) || Math.floor(1000 + Math.random() * 9000),
            school_name: parts[4] || course?.schoolName || "THPT",
            grade: parts[5] || course?.grade || "Lớp 12"
          });
        }
      }
      setParsedStudents(students);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (parsedStudents.length === 0) {
      alert("Chưa có dữ liệu học viên để nạp!");
      return;
    }

    try {
      setIsImporting(true);
      const res = await courseService.importStudentsBatch(course.id, parsedStudents);
      alert(res.message || "Đã nạp danh sách học viên thành công!");
      setParsedStudents([]);
      onClose();
      onSuccess();
    } catch (err) {
      console.error("Lỗi Import học viên:", err);
      alert("Lỗi trong quá trình nạp dữ liệu!");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <School className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="font-extrabold text-sm">Nạp Danh Sách Học Viên Từ Excel</h3>
              <p className="text-[11px] text-emerald-100">
                Lớp: <strong>{course.title}</strong> ({course.code})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h5 className="font-bold text-emerald-900">Quy chuẩn file Excel / CSV:</h5>
              <p className="text-[11px] text-emerald-700">
                File cần có các cột: <strong>Họ Và Tên</strong>, <strong>Email / Tài Khoản</strong>, <strong>Mật Khẩu</strong>, <strong>Mã Học Sinh</strong>.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSampleFile}
              className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center space-x-1 shrink-0 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải File Mẫu (.CSV)</span>
            </button>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Chọn tệp Excel / CSV danh sách học sinh trường gửi:
            </label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="w-full p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-xs font-bold text-slate-600 text-center file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
            />
          </div>

          {parsedStudents.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-slate-800">
                Xem trước dữ liệu ({parsedStudents.length} học viên):
              </span>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 uppercase text-[10px] text-slate-500 font-bold border-b sticky top-0">
                    <tr>
                      <th className="p-2.5">Mã HS</th>
                      <th className="p-2.5">Họ Và Tên</th>
                      <th className="p-2.5">Email / Tài Khoản</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedStudents.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-orange-600 font-bold">{s.student_id}</td>
                        <td className="p-2.5 font-bold text-slate-900">{s.student_name}</td>
                        <td className="p-2.5 text-slate-500">{s.student_email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isImporting || parsedStudents.length === 0}
            onClick={handleConfirmImport}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isImporting ? "Đang nạp dữ liệu..." : `Xác Nhận Nhập ${parsedStudents.length} Học Viên`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}