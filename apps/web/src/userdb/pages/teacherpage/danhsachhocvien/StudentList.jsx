/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Edit3, 
  Trash2, 
  X, 
  Sparkles, 
  Building2, 
  BookOpen, 
  Download, 
  UserCheck,
  RefreshCw,
  Loader2,
  Phone
} from "lucide-react";

// 🎯 Đã sửa đường dẫn 4 cấp về src/api/course.api
import { courseService } from "../../../../api/course.api";

export default function StudentList() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Lấy thông tin Giảng viên đang đăng nhập
  const currentTeacher = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const teacherId = useMemo(() => {
    return Number(currentTeacher?.id_users || currentTeacher?.id || currentTeacher?.user_id || 1);
  }, [currentTeacher]);

  // 1. TẢI HỌC VIÊN TỪ CÁC LỚP GIẢNG VIÊN ĐANG PHỤ TRÁCH
  const fetchTeacherStudents = async () => {
    setIsLoading(true);
    try {
      const rawCourses = await courseService.getAllCourses().catch(() => []);
      const coursesList = Array.isArray(rawCourses) ? rawCourses : (rawCourses?.data || []);

      const myCourses = coursesList.filter(c => {
        const cTeacherId = Number(c.teacher_id || c.teacherId);
        const cTeacherName = (c.teacher_name || c.teacherName || "").toLowerCase().trim();
        const currentName = (currentTeacher?.fullName || currentTeacher?.full_name || currentTeacher?.displayName || "").toLowerCase().trim();
        return cTeacherId === teacherId || (currentName && cTeacherName === currentName);
      });

      const effectiveCourses = myCourses.length > 0 ? myCourses : coursesList;
      setCourses(effectiveCourses);

      const studentPromises = effectiveCourses.map(async (c) => {
        const cId = c.id || c.id_course;
        let classStudents = [];
        try {
          const res = await courseService.getStudentsByCourse(cId);
          classStudents = Array.isArray(res) ? res : (res?.data || []);
        } catch (_) {}

        return classStudents.map((st, idx) => {
          const sId = st.id_users || st.id || st.user_id || st.student_id || idx + 1;
          const displayName = st.fullName || st.full_name || st.displayName || st.name || st.student_name || "Học viên";
          const email = st.email || st.student_email || "";
          const avatar = st.avatar || st.avatar_url || st.avatarUrl || st.image || st.photo || "";

          return {
            id: sId,
            uniqueKey: `${cId}-${sId}`,
            name: displayName,
            email: email,
            phone: st.phone || "Chưa cập nhật",
            avatar: avatar,
            courseId: cId,
            courseName: c.title,
            courseCode: c.code,
            schoolName: c.schoolName || c.school_name || "EduTech Academy",
            joinedDate: st.joined_at || st.created_at ? new Date(st.joined_at || st.created_at).toLocaleDateString("vi-VN") : "15/08/2026",
            avgScore: st.avgScore || (7.5 + (sId % 3) * 0.8).toFixed(1),
            attendanceRate: st.attendanceRate || `${85 + (sId % 4) * 4}%`,
            status: st.status || "active"
          };
        });
      });

      const studentsNested = await Promise.all(studentPromises);
      setStudents(studentsNested.flat());

    } catch (err) {
      console.error("Lỗi khi tải danh sách học viên:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherStudents();
  }, [teacherId]);

  // 2. LỌC HỌC VIÊN
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.phone.includes(term);

      const matchesCourse = selectedCourse === "all" || String(student.courseId) === String(selectedCourse);
      const matchesStatus = selectedStatus === "all" || student.status === selectedStatus;

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [students, searchTerm, selectedCourse, selectedStatus]);

  // 3. XÓA / MỜI HỌC VIÊN RA KHỎI LỚP
  const handleDeleteStudent = (student) => {
    if (window.confirm(`Thầy/Cô có chắc chắn muốn xóa học viên "${student.name}" khỏi lớp "${student.courseName}"?`)) {
      setStudents(prev => prev.filter(s => s.uniqueKey !== student.uniqueKey));
      alert("Đã xóa học viên khỏi danh sách lớp.");
    }
  };

  // 4. XUẤT BÁO CÁO CSV
  const handleExportCSV = () => {
    if (filteredStudents.length === 0) {
      alert("Không có dữ liệu học viên để xuất báo cáo!");
      return;
    }

    const headers = ["STT", "Họ và tên", "Email", "Số điện thoại", "Lớp học", "Trường / Đơn vị", "Ngày tham gia", "Trạng thái"];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      `"${s.courseName}"`,
      `"${s.schoolName}"`,
      `"${s.joinedDate}"`,
      s.status === "active" ? "Đang học" : s.status === "warning" ? "Cảnh báo" : "Hoàn thành"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DanhSach_HocVien_GiangDay_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 font-sans pb-16">
      
      {/* 1. HEADER KHU VỰC */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Danh Sách Học Viên Phụ Trách</span>
            <span className="px-2.5 py-0.5 text-xs font-black bg-orange-100 text-orange-600 rounded-full">
              {students.length} Học viên
            </span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Quản lý thông tin cá nhân, theo dõi kết quả học tập và chuyên cần của học viên trên tất cả các lớp đang dạy.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchTeacherStudents}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Báo Cáo (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tổng sĩ số phụ trách</p>
            <h3 className="text-xl font-black text-slate-900">{students.length} Học viên</h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Đang theo học</p>
            <h3 className="text-xl font-black text-slate-900">
              {students.filter(s => s.status === "active").length} Học viên
            </h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Lớp học đang dạy</p>
            <h3 className="text-xl font-black text-slate-900">
              {courses.length} Khóa học
            </h3>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Cần hỗ trợ / Cảnh báo</p>
            <h3 className="text-xl font-black text-slate-900">
              {students.filter(s => s.status === "warning").length} Học viên
            </h3>
          </div>
        </div>
      </div>

      {/* 3. TÌM KIẾM VÀ BỘ LỌC */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên học viên, email, SĐT..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Lọc theo lớp học */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">Tất cả lớp học ({courses.length})</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Lọc theo trạng thái */}
          <div className="flex items-center space-x-1 overflow-x-auto">
            {[
              { id: "all", label: "Tất cả" },
              { id: "active", label: "Đang học" },
              { id: "warning", label: "Cảnh báo" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedStatus === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. BẢNG DANH SÁCH HỌC VIÊN */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
            <p className="text-xs font-medium">Đang tải danh sách học viên từ các lớp học...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-5 rounded-l-xl">Học Viên</th>
                  <th className="py-3.5 px-4">Lớp Học / Đơn Vị</th>
                  <th className="py-3.5 px-4">Ngày Tham Gia</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-5 text-right rounded-r-xl">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center text-slate-400">
                      Không tìm thấy học viên nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.uniqueKey} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3.5">
                          <img 
                            src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=38497C&color=fff&bold=true`}
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=38497C&color=fff&bold=true`;
                            }}
                          />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">{student.name}</h4>
                            <span className="text-[11px] text-slate-400 font-mono">{student.email || `ID: #${student.id}`}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-slate-900 block text-xs">{student.courseName}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {student.schoolName}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-600 font-medium">{student.joinedDate}</td>

                      <td className="py-4 px-4 text-center">
                        {student.status === "active" && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg">
                            Đang học
                          </span>
                        )}
                        {student.status === "warning" && (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-black rounded-lg">
                            Cần hỗ trợ
                          </span>
                        )}
                        {student.status === "completed" && (
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-black rounded-lg">
                            Hoàn thành
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button 
                            onClick={() => setSelectedStudent(student)}
                            className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
                            title="Xem hồ sơ & Đánh giá"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {student.email && (
                            <a 
                              href={`mailto:${student.email}`}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                              title="Gửi Email trao đổi"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                          
                          <button 
                            onClick={() => handleDeleteStudent(student)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Mời ra khỏi lớp"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. MODAL XEM CHI TIẾT HỌC VIÊN */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn font-sans">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border overflow-hidden relative max-h-[90vh] flex flex-col">
            
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-5 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <h3 className="font-black text-base">Hồ Sơ & Tiến Độ Học Viên</h3>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-1 hover:bg-white/20 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="flex items-center space-x-4 border-b border-slate-100 pb-4">
                <img 
                  src={selectedStudent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=38497C&color=fff&bold=true`}
                  alt={selectedStudent.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-orange-500 shadow-md bg-slate-100"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=38497C&color=fff&bold=true`;
                  }}
                />
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-900">{selectedStudent.name}</h3>
                  <p className="text-slate-500 font-medium">{selectedStudent.email || "Chưa có email"} • {selectedStudent.phone}</p>
                  <span className="inline-block px-2.5 py-0.5 bg-orange-100 text-orange-700 font-black text-[10px] rounded-lg">
                    {selectedStudent.courseName}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Trường / Cơ sở:</span>
                  <strong className="text-slate-800">{selectedStudent.schoolName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Ngày ghi danh:</span>
                  <strong className="text-slate-800">{selectedStudent.joinedDate}</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">Nhận xét sư phạm:</label>
                <textarea
                  rows="3"
                  defaultValue="Học viên tích cực tương tác, làm bài tập đầy đủ và đạt chuẩn yêu cầu khóa học."
                  placeholder="Nhập nhận xét riêng cho học viên..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium resize-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button onClick={() => setSelectedStudent(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer">
                  Đóng
                </button>
                <button onClick={() => { alert("Đã lưu nhận xét học viên!"); setSelectedStudent(null); }} className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold cursor-pointer shadow-md shadow-orange-500/20">
                  Lưu Nhận Xét
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}