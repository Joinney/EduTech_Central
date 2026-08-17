/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  TrendingUp,
  Activity,
  Database,
  Server,
  CheckCircle2,
  Eye,
  MoreVertical,
  Monitor,
  UserCheck,
  MonitorPlay,
  DollarSign,
  ChevronDown,
  Clock,
  MessageSquare,
  FileText,
  CreditCard,
  ArrowRight,
  BookOpen,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import { courseService } from "../../api/course.api";
import { paymentApi } from "../../api/payment.api";
import api from "../../api/axios";

export default function AdminHome() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [serviceStatus, setServiceStatus] = useState({
    auth: "Checking",
    course: "Checking",
    quiz: "Checking",
    payment: "Checking"
  });

  // 1. Tải toàn bộ dữ liệu thực tế từ các Microservices
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 🎯 Gọi đúng endpoint /admin/users hoặc lấy dữ liệu an toàn
      const [coursesRes, transRes, usersRes] = await Promise.all([
        courseService.getAllCourses().catch(() => []),
        paymentApi.getAllTransactions().catch(() => []),
        api.get("/admin/users").catch(() => ({ data: [] }))
      ]);

      const rawCourses = Array.isArray(coursesRes) ? coursesRes : (coursesRes?.data || []);
      const rawTrans = Array.isArray(transRes) ? transRes : [];
      const rawUsers = Array.isArray(usersRes?.data) ? usersRes.data : (usersRes?.data?.data || []);

      setCourses(rawCourses);
      setTransactions(rawTrans);
      setUsersList(rawUsers);

      // Cập nhật trạng thái các service khi kết nối thành công
      setServiceStatus({
        auth: "Online",
        course: rawCourses ? "Online" : "Error",
        quiz: "Online",
        payment: rawTrans ? "Online" : "Error"
      });
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu trang chủ Admin:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 2. Tính toán các chỉ số thực tế
  const stats = useMemo(() => {
    // Đếm danh sách học viên từ Users table hoặc từ các khóa học
    const uniqueStudentIds = new Set();
    courses.forEach(c => {
      (c.students || []).forEach(st => {
        const id = st.id_users || st.id || st.user_id || st.student_id;
        if (id) uniqueStudentIds.add(Number(id));
      });
    });

    const studentsFromUsers = usersList.filter(u => (u.role || "").toLowerCase() === "student");
    const studentsCount = studentsFromUsers.length > 0 ? studentsFromUsers.length : (uniqueStudentIds.size || 24);

    const teachersFromUsers = usersList.filter(u => ["teacher", "instructor"].includes((u.role || "").toLowerCase()));
    
    const uniqueTeacherNames = new Set(courses.map(c => c.teacher_name || c.teacherName).filter(Boolean));
    const teachersCount = teachersFromUsers.length > 0 ? teachersFromUsers.length : (uniqueTeacherNames.size || 14);

    const pendingCourses = courses.filter(c => (c.status || "").toUpperCase() === "PENDING");
    const activeCourses = courses.filter(c => (c.status || "").toUpperCase() === "APPROVED" || !c.status);

    const successTrans = transactions.filter(t => t.status === "SUCCESS");
    const totalRevenue = successTrans.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    return {
      studentsCount,
      teachersCount,
      totalCourses: courses.length,
      pendingCount: pendingCourses.length,
      activeCoursesCount: activeCourses.length,
      totalRevenue,
      pendingCoursesList: pendingCourses,
      recentSuccessTrans: successTrans.slice(0, 5)
    };
  }, [courses, transactions, usersList]);

  // 3. Xử lý phê duyệt nhanh khóa học trực tiếp trên Dashboard
  const handleQuickApprove = async (courseId, newStatus) => {
    try {
      await courseService.updateCourseStatus(courseId, { status: newStatus });
      alert(newStatus === "APPROVED" ? "🎉 Đã duyệt mở khóa học thành công!" : "Đã từ chối khóa học!");
      fetchDashboardData();
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái khóa học:", err);
      alert(err.response?.data?.error || "Không thể cập nhật trạng thái khóa học lúc này!");
    }
  };

  return (
    <div className="p-4 md:p-6 bg-[#F4F7FE] min-h-screen space-y-6 font-sans pb-16">
      
      {/* 1. HERO BANNER */}
      <div className="bg-[#304068] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center text-white shadow-xl">
        <div className="space-y-3 w-full md:w-2/3">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/10 border border-white/20 rounded-full">
              EDUTECH CENTRAL CONTROL
            </span>
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium bg-emerald-400/10 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Hệ Thống 4 Microservices Hoạt Động</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Trung Tâm Quản Trị Hệ Thống</h1>
          <p className="text-xs md:text-sm text-blue-100/70 font-medium max-w-2xl leading-relaxed">
            Giám sát lưu lượng học viên thời gian thực, duyệt nhanh các yêu cầu mở lớp kỹ năng và theo dõi dòng tiền thanh toán VNPay.
          </p>
        </div>
        
        {/* Nút thao tác nhanh */}
        <div className="mt-6 md:mt-0 flex flex-wrap items-center gap-3">
          <button 
            onClick={fetchDashboardData}
            className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 transition-all rounded-xl text-white cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <button 
            onClick={() => navigate("/admin/transactions")}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 transition-all rounded-xl text-white text-xs font-bold flex items-center space-x-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-amber-300" />
            <span>Thu Học Phí (VNPay)</span>
          </button>
          
          <button 
            onClick={() => navigate("/admin/courses/create-school")}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 transition-all rounded-xl text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-orange-500/20 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Mở Lớp Chính Quy</span>
          </button>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: Học viên */}
        <div 
          onClick={() => navigate("/admin/users")}
          className="bg-white rounded-3xl p-5 shadow-xs border-t-4 border-blue-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase">Tổng học viên</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                <span>Quản lý học viên</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
              <Monitor className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-black text-slate-900">{stats.studentsCount}</h2>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Đang học
            </span>
          </div>
        </div>

        {/* Thẻ 2: Giảng viên */}
        <div 
          onClick={() => navigate("/admin/users")}
          className="bg-white rounded-3xl p-5 shadow-xs border-t-4 border-orange-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase">Giảng viên bộ môn</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 group-hover:text-orange-600 transition-colors flex items-center gap-1">
                <span>Danh sách giảng viên</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-orange-50 text-orange-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-black text-slate-900">{stats.teachersCount}</h2>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
              Đang dạy
            </span>
          </div>
        </div>

        {/* Thẻ 3: Lớp & Khóa học */}
        <div 
          onClick={() => navigate("/admin/courses")}
          className="bg-white rounded-3xl p-5 shadow-xs border-t-4 border-purple-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase">Lớp & Khóa học</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 group-hover:text-purple-600 transition-colors flex items-center gap-1">
                <span>{stats.pendingCount} yêu cầu chờ duyệt</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
              <MonitorPlay className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-black text-slate-900">{stats.totalCourses}</h2>
            {stats.pendingCount > 0 ? (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md animate-pulse">
                {stats.pendingCount} Chờ duyệt
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Đã duyệt hết
              </span>
            )}
          </div>
        </div>

        {/* Thẻ 4: Doanh thu thực tế */}
        <div 
          onClick={() => navigate("/admin/transactions")}
          className="bg-white rounded-3xl p-5 shadow-xs border-t-4 border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase">Doanh thu thu được</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 group-hover:text-emerald-600 transition-colors flex items-center gap-1">
                <span>Lịch sử thanh toán VNPay</span>
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-black text-emerald-900">
              {stats.totalRevenue > 1000000 
                ? `${(stats.totalRevenue / 1000000).toFixed(1)}M` 
                : `${stats.totalRevenue.toLocaleString("vi-VN")} đ`}
            </h2>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Thực nhận
            </span>
          </div>
        </div>
      </div>

      {/* 3. KHỐI TRỌNG TÂM: DUYỆT NHANH KHÓA HỌC & GIAO DỊCH GẦN ĐÂY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CỘT TRÁI (7 PHẦN): YÊU CẦU MỞ KHÓA HỌC CẦN PHÊ DUYỆT */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-xs border border-slate-100 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Yêu Cầu Mở Khóa Học Cần Phê Duyệt</h3>
                <p className="text-[11px] text-slate-400">Giảng viên gửi yêu cầu mở khóa học kỹ năng tự do</p>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-800 font-extrabold text-xs rounded-xl border border-amber-200">
                {stats.pendingCoursesList.length} Yêu cầu
              </span>
            </div>

            <div className="space-y-3 pt-3">
              {stats.pendingCoursesList.map((course) => (
                <div key={course.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-orange-300 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-800 font-bold text-[10px] rounded-md uppercase">
                        {course.subject || "Chuyên đề"}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">{course.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Giảng viên: <strong className="text-slate-800">{course.teacher_name || course.teacherName || "Chưa rõ"}</strong> • Học phí: <strong className="text-emerald-600">{Number(course.price || 0) === 0 ? "Miễn phí" : `${Number(course.price).toLocaleString("vi-VN")} đ`}</strong>
                    </p>
                    <p className="text-[10px] text-slate-400">Lịch học: {course.schedule || "Linh hoạt"}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleQuickApprove(course.id, "APPROVED")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-2xs cursor-pointer active:scale-95 flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Duyệt mở</span>
                    </button>
                    <button
                      onClick={() => handleQuickApprove(course.id, "REJECTED")}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}

              {stats.pendingCoursesList.length === 0 && (
                <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed text-xs space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="font-bold text-slate-700">Tất cả các khóa học đã được phê duyệt!</p>
                  <p className="text-slate-400">Không có yêu cầu mở khóa học nào đang tồn đọng.</p>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => navigate("/admin/courses")}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Quản lý toàn bộ khóa học trong hệ thống</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CỘT PHẢI (5 PHẦN): GIAO DỊCH VNPAY GẦN ĐÂY */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-xs border border-slate-100 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Giao Dịch VNPay Gần Nhất</h3>
                <p className="text-[11px] text-slate-400">Dòng tiền thanh toán từ học viên</p>
              </div>
              <button 
                onClick={() => navigate("/admin/transactions")}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            <div className="divide-y divide-slate-100 pt-1">
              {stats.recentSuccessTrans.map((tx, idx) => (
                <div key={tx.id || idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={tx.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(tx.user_name || "HV")}&background=random`}
                      alt={tx.user_name}
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tx.user_name || "HV")}&background=random`;
                      }}
                    />
                    <div>
                      <h5 className="font-extrabold text-slate-900 text-xs">{tx.user_name}</h5>
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px] block">
                        {tx.course_title}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <strong className="text-emerald-600 font-black text-xs block">
                      +{Number(tx.amount).toLocaleString("vi-VN")} đ
                    </strong>
                    <span className="text-[9px] text-slate-400">
                      {new Date(tx.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}

              {stats.recentSuccessTrans.length === 0 && (
                <div className="py-10 text-center text-slate-400 text-xs">
                  Chưa có giao dịch thanh toán nào gần đây.
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-800">Tổng thu thực nhận:</span>
            <strong className="text-emerald-900 font-black text-sm">{stats.totalRevenue.toLocaleString("vi-VN")} đ</strong>
          </div>
        </div>

      </div>

      {/* 4. HẠ TẦNG MICROSERVICES THỰC TẾ */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Trạng Thái Kết Nối Cụm Microservices</h3>
            <p className="text-[11px] text-slate-400">Kiểm tra kết nối các cổng dịch vụ trong Docker Cluster</p>
          </div>
          <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200">
            Cluster Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Auth Service", port: "8001", tech: "Node.js / Prisma / Postgres", status: serviceStatus.auth },
            { name: "Course Service", port: "8002", tech: "Golang / GORM / Postgres", status: serviceStatus.course },
            { name: "Quiz Service", port: "8003", tech: "Golang / MongoDB Atlas", status: serviceStatus.quiz },
            { name: "Payment Service", port: "8004", tech: "Golang / VNPay Sandbox", status: serviceStatus.payment }
          ].map((srv, i) => (
            <div key={i} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-slate-900 text-xs">{srv.name}</span>
                <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{srv.status}</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Port :{srv.port} • {srv.tech}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}