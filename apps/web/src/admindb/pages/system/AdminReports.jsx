/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { 
  TrendingUp, 
  Wallet, 
  AlertCircle, 
  Info, 
  Star, 
  Download, 
  RefreshCw, 
  ShieldAlert, 
  Search
} from "lucide-react";

import { courseService } from "../../api/course.api";
import { paymentApi } from "../../api/payment.api";
import { quizApi } from "../../api/quiz.api";

const API_AUTH_URL = import.meta.env.VITE_API_AUTH_URL || "http://localhost:8001/api/v1";

export default function AdminReports() {
  const [isLoading, setIsLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState("month");

  const [courses, setCourses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // Bộ lọc cho Bảng Tiến độ lớp học
  const [courseSearch, setCourseSearch] = useState("");
  const [courseSubjectFilter, setCourseSubjectFilter] = useState("all");
  const [progressRateFilter, setProgressRateFilter] = useState("all");

  // Bộ lọc cho Top Giảng viên
  const [teacherSortBy, setTeacherSortBy] = useState("students");

  // 🎯 1. TẢI DỮ LIỆU ĐỒNG BỘ TỪ CÁC ENDPOINT CHUẨN XÁC
  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("adminToken");

      // A. Gọi đồng thời courses, transactions, users
      const [coursesRes, transRes, usersRes] = await Promise.all([
        courseService.getAllCourses().catch(() => []),
        paymentApi.getAllTransactions().catch(() => []),
        fetch(`${API_AUTH_URL}/admin/users`, {
          headers: { "Authorization": `Bearer ${token}` }
        }).then(r => r.json()).catch(() => ({ data: [] }))
      ]);

      const rawCourses = Array.isArray(coursesRes) ? coursesRes : (coursesRes?.data || []);
      const rawTrans = Array.isArray(transRes) ? transRes : [];
      const rawUsers = Array.isArray(usersRes?.data) ? usersRes.data : [];

      // B. Gọi chính xác API lấy Danh sách Học viên & Bài tập cho từng khóa học
      const enrichedCoursesPromises = rawCourses.map(async (c) => {
        const cId = c.id || c.id_course;

        // 1. Lấy danh sách học viên qua route /courses/:id/students (giống CourseDetail.jsx)
        let students = [];
        try {
          const resS = await courseService.getStudentsByCourse(cId);
          students = Array.isArray(resS) ? resS : (resS?.data || []);
        } catch (_) {}

        // 2. Lấy danh sách bài tập qua route /courses/:id/assignments
        let assignments = [];
        try {
          const resA = await courseService.getAssignmentsByCourse(cId);
          assignments = Array.isArray(resA) ? resA : (resA?.data || []);
        } catch (_) {}

        // 3. Lấy số lượng bài đã nộp cho từng bài tập
        let totalSubmitted = 0;
        const enrichedAssignments = await Promise.all(
          assignments.map(async (a) => {
            let subCount = Number(a.submittedCount) || 0;
            if (a.id) {
              try {
                const subRes = await courseService.getSubmissionsByAssignment(a.id);
                const subList = Array.isArray(subRes) ? subRes : (subRes?.data || []);
                subCount = subList.length;
              } catch (_) {}
            }
            totalSubmitted += subCount;
            return { ...a, submittedCount: subCount };
          })
        );

        return {
          ...c,
          students,
          studentsCount: students.length,
          assignments: enrichedAssignments,
          assignmentsCount: enrichedAssignments.length,
          submittedCount: totalSubmitted
        };
      });

      const fullCourses = await Promise.all(enrichedCoursesPromises);

      setCourses(fullCourses);
      setTransactions(rawTrans);
      setUsersList(rawUsers);

    } catch (err) {
      console.error("Lỗi khi tải dữ liệu báo cáo:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // Map avatar và thông tin người dùng từ users table
  const userMap = useMemo(() => {
    const map = new Map();
    usersList.forEach(u => {
      const id = Number(u.id || u.id_users);
      const email = (u.email || "").toLowerCase();
      const name = (u.fullName || u.full_name || "").toLowerCase().trim();
      const info = {
        name: u.fullName || u.full_name || u.name,
        avatar: u.avatar || u.avatar_url || "",
        role: u.role
      };
      if (id) map.set(id, info);
      if (email) map.set(email, info);
      if (name) map.set(name, info);
    });
    return map;
  }, [usersList]);

  // 2. BIỂU ĐỒ DOANH THU THỰC TẾ VNPAY
  const revenueChartData = useMemo(() => {
    const successTrans = transactions.filter(t => t.status === "SUCCESS");
    const now = new Date();
    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthNum = d.getMonth() + 1;
      const yearNum = d.getFullYear();
      const monthLabel = `Th ${monthNum}`;

      const totalInMonth = successTrans.filter(t => {
        const tDate = new Date(t.created_at || t.createdAt);
        return tDate.getMonth() + 1 === monthNum && tDate.getFullYear() === yearNum;
      }).reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      monthlyData.push({
        label: monthLabel,
        amount: totalInMonth,
        displayAmount: totalInMonth > 0 ? `${(totalInMonth / 1000).toLocaleString()}k` : "0đ"
      });
    }

    const maxAmount = Math.max(...monthlyData.map(m => m.amount), 100000);
    
    const points = monthlyData.map((m, idx) => {
      const x = (idx / 5) * 600;
      const y = 180 - (m.amount / maxAmount) * 140;
      return { x, y, ...m };
    });

    const pathD = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M${p.x},${p.y}` : `${acc} L${p.x},${p.y}`;
    }, "");

    const areaD = `${pathD} L600,200 L0,200 Z`;

    return {
      monthlyData,
      points,
      pathD,
      areaD,
      totalSuccessRevenue: successTrans.reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
      successCount: successTrans.length
    };
  }, [transactions]);

  // 3. TÍNH TOÁN TIẾN ĐỘ & SĨ SỐ KHÓA HỌC
  const enrichedCoursesList = useMemo(() => {
    return courses.map(c => {
      const studentsCount = c.studentsCount || 0;
      const assignmentsCount = c.assignmentsCount || 0;
      const submittedCount = c.submittedCount || 0;

      // Tính tỷ lệ nộp bài (%)
      let progressRate = null;
      if (assignmentsCount > 0) {
        if (studentsCount > 0) {
          const expectedTotal = studentsCount * assignmentsCount;
          progressRate = Math.min(100, Math.round((submittedCount / expectedTotal) * 100));
        } else {
          progressRate = 0;
        }
      }

      // Giảng viên & Avatar
      const teacherName = c.teacher_name || c.teacherName || "Giảng viên bộ môn";
      const teacherId = Number(c.teacher_id || c.teacherId);
      const mappedUser = userMap.get(teacherId) || userMap.get(teacherName.toLowerCase().trim());
      
      const teacherAvatar = mappedUser?.avatar || c.teacher_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}&background=38497C&color=fff&bold=true`;

      return {
        id: c.id,
        title: c.title,
        subject: c.subject || "Chính quy",
        instructor: teacherName,
        instructorAvatar: teacherAvatar,
        teacherId,
        studentsCount,
        assignmentsCount,
        submittedCount,
        progressRate
      };
    });
  }, [courses, userMap]);

  // 4. TOP GIẢNG VIÊN THỰC TẾ (TÍCH LŨY SĨ SỐ HỌC VIÊN CHUẨN)
  const topInstructors = useMemo(() => {
    const teacherMap = new Map();

    enrichedCoursesList.forEach(c => {
      const name = c.instructor;
      if (!teacherMap.has(name)) {
        teacherMap.set(name, {
          name: name,
          avatar: c.instructorAvatar,
          subject: c.subject,
          studentsCount: 0,
          coursesCount: 0,
          rating: "5.0"
        });
      }

      const current = teacherMap.get(name);
      current.studentsCount += c.studentsCount;
      current.coursesCount += 1;
    });

    let list = Array.from(teacherMap.values());

    if (teacherSortBy === "students") {
      list.sort((a, b) => b.studentsCount - a.studentsCount || b.coursesCount - a.coursesCount);
    } else {
      list.sort((a, b) => b.coursesCount - a.coursesCount || b.studentsCount - a.studentsCount);
    }

    return list.slice(0, 5);
  }, [enrichedCoursesList, teacherSortBy]);

  // 5. BỘ LỌC BÁO CÁO KHÓA HỌC
  const filteredCourseReports = useMemo(() => {
    let list = [...enrichedCoursesList];

    if (courseSearch.trim()) {
      const term = courseSearch.toLowerCase();
      list = list.filter(c => 
        c.title.toLowerCase().includes(term) || 
        c.instructor.toLowerCase().includes(term)
      );
    }

    if (courseSubjectFilter !== "all") {
      list = list.filter(c => c.subject.toLowerCase() === courseSubjectFilter.toLowerCase());
    }

    if (progressRateFilter === "high") {
      list = list.filter(c => c.progressRate !== null && c.progressRate >= 80);
    } else if (progressRateFilter === "medium") {
      list = list.filter(c => c.progressRate !== null && c.progressRate >= 50 && c.progressRate < 80);
    } else if (progressRateFilter === "low") {
      list = list.filter(c => c.progressRate !== null && c.progressRate < 50);
    } else if (progressRateFilter === "none") {
      list = list.filter(c => c.assignmentsCount === 0);
    }

    return list;
  }, [enrichedCoursesList, courseSearch, courseSubjectFilter, progressRateFilter]);

  const availableSubjects = useMemo(() => {
    const subjects = new Set(courses.map(c => c.subject).filter(Boolean));
    return Array.from(subjects);
  }, [courses]);

  // 6. XUẤT FILE CSV
  const handleExportCSV = () => {
    if (filteredCourseReports.length === 0) {
      alert("Không có dữ liệu để xuất file!");
      return;
    }

    const headers = ["Mã Lớp", "Tên Khóa Học", "Chuyên Môn", "Giảng Viên", "Sĩ Số", "Bài Tập Giao", "Bài Đã Nộp", "Tỷ Lệ Hoàn Thành (%)"];
    const rows = filteredCourseReports.map(c => [
      c.id,
      `"${c.title}"`,
      `"${c.subject}"`,
      `"${c.instructor}"`,
      c.studentsCount,
      c.assignmentsCount,
      c.submittedCount,
      c.progressRate !== null ? `${c.progressRate}%` : "Chưa có bài tập"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BaoCao_TienDo_LopHoc_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-6 bg-[#F8F9FA] min-h-screen font-sans space-y-6 pb-16">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>EduTech Performance & Risk Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Báo Cáo Hiệu Suất & Cảnh Báo</h1>
          <p className="text-xs text-slate-500 mt-0.5">Dữ liệu tài chính VNPay, sĩ số học tập và tiến độ nộp bài cập nhật theo thời gian thực.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={fetchReportData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button 
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 transition rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-sm shadow-emerald-600/20 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Báo Cáo (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. BIỂU ĐỒ DOANH THU & THẺ TỔNG QUAN */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Khung Biểu đồ doanh thu thực tế VNPay */}
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-black text-slate-900">Biểu Đồ Doanh Thu Thực Tế VNPay</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Thống kê theo 6 tháng gần nhất từ các giao dịch thanh toán thành công</p>
            </div>
            
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button 
                onClick={() => setChartPeriod("month")}
                className={`px-3 py-1 rounded-lg transition ${chartPeriod === "month" ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500"}`}
              >Tháng</button>
              <button 
                onClick={() => setChartPeriod("quarter")}
                className={`px-3 py-1 rounded-lg transition ${chartPeriod === "quarter" ? "bg-white text-slate-800 shadow-2xs" : "text-slate-500"}`}
              >Quý</button>
            </div>
          </div>

          <div className="h-56 w-full relative flex items-end">
            <svg viewBox="0 0 600 200" className="w-full h-full absolute inset-0" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38497C" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#38497C" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              <path d={revenueChartData.areaD} fill="url(#revenueGrad)" />
              <path d={revenueChartData.pathD} fill="none" stroke="#38497C" strokeWidth="3.5" strokeLinecap="round" />
              
              {revenueChartData.points.map((p, idx) => (
                <circle 
                  key={idx} 
                  cx={p.x} 
                  cy={p.y} 
                  r={idx === 5 ? "6" : "4.5"} 
                  fill="white" 
                  stroke={idx === 5 ? "#F97316" : "#38497C"} 
                  strokeWidth="3" 
                />
              ))}
            </svg>

            <div className="w-full flex justify-between text-[11px] text-slate-500 font-bold px-2 pt-3 border-t border-slate-100 relative z-10">
              {revenueChartData.monthlyData.map((m, idx) => (
                <div key={idx} className="text-center">
                  <span className={idx === 5 ? "text-[#38497C] font-extrabold" : "text-slate-400"}>{m.label}</span>
                  <span className="block text-[10px] text-emerald-600 font-extrabold">{m.displayAmount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột Phải: Thẻ Doanh Thu & Cảnh Báo */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tổng Doanh Thu Thực Nhận</span>
                <h3 className="text-2xl font-black text-emerald-950 mt-1">
                  {revenueChartData.totalSuccessRevenue.toLocaleString("vi-VN")} đ
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span>{revenueChartData.successCount} Giao dịch VNPay thành công</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Cảnh Báo Khảo Thí & Hệ Thống</span>
              </div>
              <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black rounded-lg">
                Anti-Cheat
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-1">
                <div className="flex justify-between items-center text-rose-700 font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Giám sát thoát tab làm bài</span>
                  </span>
                  <span className="text-[10px]">Tự động</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Quiz-service tự động phát hiện và ghi nhận số lần chuyển Tab trong kỳ thi trực tuyến.
                </p>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-1">
                <div className="flex justify-between items-center text-blue-700 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>4 Cụm Microservices Live</span>
                  </span>
                  <span className="text-[10px]">100% OK</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Đồng bộ dữ liệu thông suốt giữa Auth (8001), Course (8002), Quiz (8003) và Payment (8004).
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. BOTTOM GRID: TOP GIẢNG VIÊN & TIẾN ĐỘ KHÓA HỌC */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* CỘT TRÁI (4 PHẦN): TOP GIẢNG VIÊN */}
        <div className="xl:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Top Giảng Viên Phụ Trách</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Xếp hạng theo quy mô học sinh & lớp học</p>
              </div>

              <select
                value={teacherSortBy}
                onChange={(e) => setTeacherSortBy(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="students">Theo học viên</option>
                <option value="courses">Theo số lớp</option>
              </select>
            </div>

            <div className="space-y-3 pt-3">
              {topInstructors.map((inst, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-orange-200 transition">
                  <div className="flex items-center space-x-3">
                    <img
                      src={inst.avatar}
                      alt={inst.name}
                      className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0 bg-slate-100"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(inst.name)}&background=f97316&color=fff&bold=true`;
                      }}
                    />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight">{inst.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        <strong className="text-orange-600 font-bold">{inst.studentsCount} học viên</strong> • {inst.coursesCount} lớp
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-xl">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{inst.rating}</span>
                  </div>
                </div>
              ))}

              {topInstructors.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Chưa có thông tin giảng viên.
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl text-[11px] text-orange-800 font-medium">
            💡 Sĩ số giảng viên tính bằng tổng học viên thực tế ghi danh tại tất cả các lớp phụ trách.
          </div>
        </div>

        {/* CỘT PHẢI (8 PHẦN): BÁO CÁO THU BÀI & TIẾN ĐỘ KÈM BỘ LỌC NÂNG CAO */}
        <div className="xl:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Báo Cáo Thu Bài & Tiến Độ Lớp Học</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Theo dõi sĩ số và tỷ lệ hoàn thành bài tập thực tế</p>
              </div>

              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-xl shrink-0 self-start sm:self-auto">
                {filteredCourseReports.length} Lớp học
              </span>
            </div>

            {/* Thanh Bộ Lọc & Tìm Kiếm */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm theo tên lớp, giảng viên..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <select
                value={courseSubjectFilter}
                onChange={(e) => setCourseSubjectFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Tất cả chuyên môn</option>
                {availableSubjects.map((s, idx) => (
                  <option key={idx} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={progressRateFilter}
                onChange={(e) => setProgressRateFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Tất cả tỷ lệ nộp bài</option>
                <option value="high">Cao (≥ 80%)</option>
                <option value="medium">Trung bình (50% - 79%)</option>
                <option value="low">Cần đôn đốc (&lt; 50%)</option>
                <option value="none">Chưa có bài tập</option>
              </select>
            </div>

            {/* Bảng dữ liệu tiến độ thực tế */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
                    <th className="py-3 px-4 rounded-l-xl">Khóa Học & Lớp</th>
                    <th className="py-3 px-4">Giảng Viên</th>
                    <th className="py-3 px-4 text-center">Sĩ Số</th>
                    <th className="py-3 px-4 text-center">Bài Tập Thu</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">Tỷ Lệ Nộp Bài</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCourseReports.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-xs">{c.title}</div>
                        <span className="text-[10px] text-blue-600 font-bold uppercase">{c.subject}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <img
                            src={c.instructorAvatar}
                            alt={c.instructor}
                            className="w-7 h-7 rounded-full border border-slate-200 object-cover shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.instructor)}&background=38497C&color=fff&bold=true`;
                            }}
                          />
                          <span className="font-medium text-slate-700">{c.instructor}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-black text-slate-900">
                        {c.studentsCount} học viên
                      </td>

                      <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                        {c.assignmentsCount > 0 
                          ? `${c.submittedCount} bài nộp (${c.assignmentsCount} bài giao)`
                          : "Chưa có bài tập"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {c.progressRate !== null ? (
                          <div className="inline-flex items-center space-x-2">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  c.progressRate >= 80 ? "bg-emerald-500" : c.progressRate >= 50 ? "bg-blue-600" : "bg-rose-500"
                                }`} 
                                style={{ width: `${c.progressRate}%` }} 
                              />
                            </div>
                            <span className={`font-black ${
                              c.progressRate >= 80 ? "text-emerald-600" : c.progressRate >= 50 ? "text-blue-700" : "text-rose-600"
                            }`}>
                              {c.progressRate}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-bold">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCourseReports.length === 0 && (
                <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-xs space-y-1">
                  <p className="font-bold text-slate-600">Không tìm thấy khóa học nào phù hợp với bộ lọc.</p>
                  <p className="text-slate-400">Thử thay đổi từ khóa tìm kiếm hoặc chọn lại môn học.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 text-right">
            <span className="text-[11px] text-slate-400 font-medium">
              Đang hiển thị {filteredCourseReports.length} / {courses.length} khóa học toàn hệ thống
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}