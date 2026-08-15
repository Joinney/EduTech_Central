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
  Radio,
  Video,
  ClipboardCheck,
  HelpCircle,
  FileCheck,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Trash2,
  Edit3,
  Eye,
  Calendar,
  Layers,
  GraduationCap,
  Sparkles,
  Loader2,
  Award,
  Globe,
  School,
  AlertTriangle,
  Hourglass,
  FileText,
  Paperclip,
  X
} from "lucide-react";
import { courseService } from "../../api/course.api";

// Danh sách gợi ý Trường học & Môn học chính quy
const SCHOOL_OPTIONS = [
  "THPT Chuyên Lê Hồng Phong (TP.HCM)",
  "THPT Chuyên Trần Đại Nghĩa (TP.HCM)",
  "THPT Chuyên Hà Nội - Amsterdam",
  "THPT Chuyên Khoa học Tự nhiên",
  "THPT Nguyễn Thị Minh Khai",
  "THPT Chu Văn An (Hà Nội)",
  "Đại học Bách Khoa TP.HCM (HCMUT)",
  "Đại học Khoa học Tự nhiên (HCMUS)",
  "Đại học Công nghệ Thông tin (UIT)",
  "Đại học Bách Khoa Hà Nội (HUST)",
  "Đại học Kinh tế TP.HCM (UEH)",
  "Đại học Văn Lang",
  "Đại học FPT"
];

const SUBJECT_OPTIONS = [
  "Toán Học",
  "Ngữ Văn",
  "Tiếng Anh",
  "Vật Lý",
  "Hóa Học",
  "Sinh Học",
  "Lịch Sử",
  "Địa Lý",
  "Tin Học",
  "Giáo Dục Kinh Tế & Pháp Luật",
  "Lập trình Web",
  "Khoa học Dữ liệu"
];

// Hàm chuyển đổi nhãn trạng thái sang tiếng Việt
const formatStatusBadge = (status, type) => {
  if (type === "school") {
    return status === "APPROVED" ? (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> Đang Mở
      </span>
    ) : (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 flex items-center gap-1">
        <Clock className="w-3 h-3" /> Tạm Dừng
      </span>
    );
  }

  switch (status) {
    case "APPROVED":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Đã Phê Duyệt
        </span>
      );
    case "PENDING":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 flex items-center gap-1 animate-pulse">
          <Hourglass className="w-3 h-3" /> Chờ Duyệt
        </span>
      );
    case "NEEDS_REVISION":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Yêu Cầu Sửa
        </span>
      );
    case "REJECTED":
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 flex items-center gap-1">
          <XCircle className="w-3 h-3" /> Từ Chối
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
};

export default function AdminCourses() {
  const location = useLocation();
  const navigate = useNavigate();

  // Tab chính & Tab con
  const [mainTab, setMainTab] = useState("content");
  const [courseCategoryTab, setCourseCategoryTab] = useState("external");
  const [subTabContent, setSubTabContent] = useState("course_list");
  const [subTabStudent, setSubTabStudent] = useState("student_list");
  const [subTabLive, setSubTabLive] = useState("schedule");
  const [subTabAssess, setSubTabAssess] = useState("question_bank");

  // Dữ liệu từ Backend
  const [courses, setCourses] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Modal tạo lớp trường học chính quy (Dành riêng Admin)
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isSubmittingSchool, setIsSubmittingSchool] = useState(false);
  const [schoolFormData, setSchoolFormData] = useState({
    title: "",
    subject: "Toán Học",
    schoolName: "THPT Chuyên Lê Hồng Phong (TP.HCM)",
    grade: "Lớp 12",
    teacher_name: "Thầy Phan Thuận",
    maxStudents: 45,
    schedule: "Thứ 2, Thứ 4, Thứ 6 (Tiết 1 - 3)",
    description: "Lớp học chính quy theo chương trình chuẩn của Bộ Giáo Dục & Đào Tạo."
  });

  // Modal Import Excel Danh Sách Học Viên
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [targetCourseForImport, setTargetCourseForImport] = useState(null);
  const [parsedStudents, setParsedStudents] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  // 1. Đồng bộ URL Query Params
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

  // 2. Tải toàn bộ dữ liệu thật
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [coursesRes, logsRes] = await Promise.all([
        courseService.getAllCourses(),
        courseService.getAllAttendanceLogs().catch(() => ({ data: [] }))
      ]);

      const courseList = Array.isArray(coursesRes) ? coursesRes : coursesRes?.data || [];
      setCourses(courseList);
      if (courseList.length > 0 && !selectedCourse) {
        setSelectedCourse(courseList[0]);
      }

      const logsList = Array.isArray(logsRes) ? logsRes : logsRes?.data || [];
      setAttendanceLogs(logsList);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Admin LCMS:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSwitchSubTab = (subId) => {
    if (mainTab === "content") setSubTabContent(subId);
    if (mainTab === "students") setSubTabStudent(subId);
    if (mainTab === "live") setSubTabLive(subId);
    if (mainTab === "assessment") setSubTabAssess(subId);
    navigate(`/admin/courses?tab=${mainTab}&sub=${subId}`);
  };

  // 3. Phê duyệt / Cập nhật trạng thái
  const handleUpdateCourseStatus = async (courseId, newStatus) => {
    try {
      let defaultMsg = "Trạng thái đã được cập nhật.";
      if (newStatus === "APPROVED") defaultMsg = "Khóa học đã đạt tiêu chuẩn và được xuất bản.";
      if (newStatus === "NEEDS_REVISION") defaultMsg = "Yêu cầu giảng viên rà soát lại tài liệu và nội dung bài học.";
      if (newStatus === "REJECTED") defaultMsg = "Khóa học bị từ chối do không phù hợp quy định đào tạo.";

      await courseService.updateCourseStatus(courseId, {
        status: newStatus,
        admin_note: adminNote || defaultMsg
      });

      alert(`Đã cập nhật trạng thái: ${newStatus}`);
      setAdminNote("");
      fetchAllData();
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      alert("Cập nhật thất bại. Vui lòng thử lại!");
    }
  };

  // 4. Admin tạo lớp Trường học chính quy mới
  const handleCreateSchoolCourse = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingSchool(true);
      const payload = {
        teacher_id: 1,
        teacher_name: schoolFormData.teacher_name,
        type: "school",
        title: schoolFormData.title,
        code: `EDU-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        subject: schoolFormData.subject,
        schoolName: schoolFormData.schoolName,
        grade: schoolFormData.grade,
        maxStudents: Number(schoolFormData.maxStudents) || 45,
        schedule: schoolFormData.schedule,
        thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop",
        description: schoolFormData.description,
        status: "APPROVED",
        is_published: true
      };

      await courseService.createCourse(payload);
      alert("🎉 Tạo lớp trường học chính quy thành công!");
      setIsSchoolModalOpen(false);
      setSchoolFormData({
        title: "",
        subject: "Toán Học",
        schoolName: "THPT Chuyên Lê Hồng Phong (TP.HCM)",
        grade: "Lớp 12",
        teacher_name: "Thầy Phan Thuận",
        maxStudents: 45,
        schedule: "Thứ 2, Thứ 4, Thứ 6 (Tiết 1 - 3)",
        description: "Lớp học chính quy theo chương trình chuẩn của Bộ Giáo Dục & Đào Tạo."
      });
      fetchAllData();
    } catch (err) {
      console.error("Lỗi tạo lớp chính quy:", err);
      alert("Lỗi khi tạo lớp học chính quy!");
    } finally {
      setIsSubmittingSchool(false);
    }
  };

  // 5. Đọc file CSV / Excel mẫu
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
            password: parts[2] || "123456", // 👈 Nhận mật khẩu
            student_id: Number(parts[3]) || Math.floor(1000 + Math.random() * 9000),
            school_name: parts[4] || targetCourseForImport?.schoolName || "THPT",
            grade: parts[5] || targetCourseForImport?.grade || "Lớp 12"
          });
        }
      }
      setParsedStudents(students);
    };
    reader.readAsText(file);
  };

  // 1. Tải file mẫu CSV có cột Mật khẩu
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
    a.download = `Danh_Sach_Hoc_Sinh_${targetCourseForImport?.code || "ChinhQuy"}.csv`;
    a.click();
  };

  const handleConfirmImport = async () => {
    if (!targetCourseForImport || parsedStudents.length === 0) {
      alert("Chưa có dữ liệu học viên để nạp!");
      return;
    }

    try {
      setIsImporting(true);
      const res = await courseService.importStudentsBatch(targetCourseForImport.id, parsedStudents);
      alert(res.message || "Đã nạp danh sách học viên thành công!");
      setIsImportModalOpen(false);
      setParsedStudents([]);
      fetchAllData();
    } catch (err) {
      console.error("Lỗi Import học viên:", err);
      alert("Lỗi trong quá trình nạp dữ liệu!");
    } finally {
      setIsImporting(false);
    }
  };

  // Phân loại khóa học
  const externalCourses = courses.filter((c) => c.type === "external");
  const schoolCourses = courses.filter((c) => c.type === "school");
  const currentCategoryCourses = courseCategoryTab === "external" ? externalCourses : schoolCourses;

  const filteredCourses = currentCategoryCourses.filter((c) => {
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchSearch =
      (c.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.teacher_name || c.teacherName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.schoolName || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getHeaderInfo = () => {
    switch (mainTab) {
      case "students":
        return {
          title: "Quản Lý Lớp Học & Học Viên",
          desc: "Theo dõi danh sách học viên, tỉ lệ chuyên cần và tiến độ hoàn thành bài học.",
          icon: GraduationCap
        };
      case "live":
        return {
          title: "Điều Phối Dạy Online & Lịch Live",
          desc: "Giám sát phòng học ảo Jitsi và nhật ký điểm danh thời gian thực.",
          icon: Radio
        };
      case "assessment":
        return {
          title: "Trung Tâm Đánh Giá & Khảo Thí",
          desc: "Tổng hợp bài tập tự luận, kết quả thi trắc nghiệm và thang điểm học viên.",
          icon: FileCheck
        };
      default:
        return {
          title: "Quản Lý & Kiểm Duyệt Khóa Học (LCMS Core)",
          desc: "Quy trình kiểm duyệt bài giảng mở rộng và điều phối cấp lớp trường học chính quy.",
          icon: BookOpenCheck
        };
    }
  };

  const currentHeader = getHeaderInfo();
  const HeaderIcon = currentHeader.icon;

  return (
    <div className="p-6 bg-[#F8F9FA] min-h-screen font-sans space-y-5 animate-fadeIn">
      {/* ================= HEADER TRANG ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
            <HeaderIcon className="w-4 h-4" />
            <span>EduTech Central • Quản Trị Hệ Thống Đào Tạo</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {currentHeader.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{currentHeader.desc}</p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsSchoolModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tạo Lớp Chính Quy Mới</span>
          </button>

          <button
            onClick={fetchAllData}
            className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Làm Mới</span>
          </button>
        </div>
      </div>

      {/* ==================== 1. QUẢN LÝ KHÓA HỌC & BÀI GIẢNG ==================== */}
      {mainTab === "content" && (
        <div className="space-y-4">
          {/* Sub-tabs điều hướng chính */}
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            {[
              { id: "course_list", label: `Danh sách khóa & Lớp (${courses.length})`, icon: BookOpenCheck },
              { id: "curriculum", label: "Cấu trúc bài giảng chi tiết", icon: Layers },
              { id: "resources", label: "Kho học liệu & Tệp đính kèm", icon: Database }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => handleSwitchSubTab(st.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  subTabContent === st.id
                    ? "bg-[#38497C] text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <st.icon className="w-4 h-4" />
                <span>{st.label}</span>
              </button>
            ))}
          </div>

          {/* Thanh chuyển đổi Khóa Tự Do vs Lớp Chính Quy */}
          <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-1.5 w-full sm:w-auto">
              <button
                onClick={() => {
                  setCourseCategoryTab("external");
                  setStatusFilter("ALL");
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  courseCategoryTab === "external"
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>Khóa Kỹ Năng / Tự Do - Cần Duyệt ({externalCourses.length})</span>
              </button>

              <button
                onClick={() => {
                  setCourseCategoryTab("school");
                  setStatusFilter("ALL");
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  courseCategoryTab === "school"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <School className="w-4 h-4" />
                <span>Lớp Trường Học Chính Quy ({schoolCourses.length})</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên khóa, mã lớp, trường..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {subTabContent === "course_list" && courseCategoryTab === "external" && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ kiểm duyệt (PENDING)</option>
                  <option value="APPROVED">Đã phê duyệt (APPROVED)</option>
                  <option value="NEEDS_REVISION">Yêu cầu chỉnh sửa</option>
                  <option value="REJECTED">Bị từ chối</option>
                </select>
              )}
            </div>
          </div>

          {/* Sub-tab 1.1: Danh sách khóa học */}
          {subTabContent === "course_list" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className={`${courseCategoryTab === "external" ? "xl:col-span-8" : "xl:col-span-12"} space-y-3`}>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Mã / Tên Khóa Học</th>
                        <th className="p-3.5">Giảng Viên</th>
                        <th className="p-3.5">Đơn Vị / Trường</th>
                        <th className="p-3.5">Nội Dung</th>
                        <th className="p-3.5">Trạng Thái</th>
                        <th className="p-3.5 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredCourses.map((c) => (
                        <tr
                          key={c.id}
                          onClick={() => setSelectedCourse(c)}
                          className={`cursor-pointer transition-colors ${
                            selectedCourse?.id === c.id ? "bg-orange-50/60" : "hover:bg-slate-50"
                          }`}
                        >
                          <td className="p-3.5">
                            <span className="font-mono text-[10px] text-orange-600 font-bold block">
                              {c.code}
                            </span>
                            <span className="font-bold text-slate-900">{c.title}</span>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-800">
                            {c.teacher_name || c.teacherName || "Chưa phân công"}
                          </td>
                          <td className="p-3.5 text-slate-500">{c.schoolName || "EduTech"}</td>
                          <td className="p-3.5 text-slate-500">
                            {c.lessons?.length || 0} bài • {c.assignments?.length || 0} bài tập • {c.quizzes?.length || 0} thi
                          </td>
                          <td className="p-3.5">{formatStatusBadge(c.status || "APPROVED", c.type)}</td>
                          <td className="p-3.5 text-right">
                            {c.type === "school" ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateCourseStatus(
                                    c.id,
                                    c.status === "APPROVED" ? "PAUSED" : "APPROVED"
                                  );
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-colors"
                              >
                                {c.status === "APPROVED" ? "Tạm Đóng" : "Mở Lại"}
                              </button>
                            ) : (
                              <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredCourses.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">
                            Không tìm thấy khóa học nào phù hợp.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bảng Kiểm Duyệt Khóa Tự Do */}
              {courseCategoryTab === "external" && (
                <div className="xl:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                  {selectedCourse ? (
                    <>
                      <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                        <span>Kiểm Duyệt Khóa Tự Do</span>
                        <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold font-mono uppercase">
                          {selectedCourse.code}
                        </span>
                      </h3>
                      <div className="space-y-2">
                        <p className="text-slate-500">
                          Khóa học: <strong className="text-slate-900">{selectedCourse.title}</strong>
                        </p>
                        <p className="text-slate-500">
                          Giảng viên:{" "}
                          <strong className="text-slate-800">
                            {selectedCourse.teacher_name || selectedCourse.teacherName || "Chưa gán"}
                          </strong>
                        </p>
                        <p className="text-slate-500">
                          Chuyên đề: <strong className="text-slate-800">{selectedCourse.subject}</strong>
                        </p>
                        <p className="text-slate-500">
                          Đơn vị: <strong className="text-slate-800">{selectedCourse.schoolName}</strong>
                        </p>
                        <div className="flex items-center space-x-2 pt-1">
                          <span className="text-slate-500">Trạng thái:</span>
                          {formatStatusBadge(selectedCourse.status || "APPROVED", selectedCourse.type)}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                        <span className="font-bold text-slate-700 block uppercase text-[10px]">
                          Ý kiến / Ghi chú phản hồi đến Giảng viên
                        </span>
                        <textarea
                          rows="3"
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="Nhập lý do phê duyệt, từ chối hoặc yêu cầu sửa đổi..."
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs resize-none outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => handleUpdateCourseStatus(selectedCourse.id, "APPROVED")}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Phê Duyệt Khóa Học (APPROVED)</span>
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleUpdateCourseStatus(selectedCourse.id, "NEEDS_REVISION")}
                            className="py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-xl border border-amber-200 flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Yêu Cầu Sửa</span>
                          </button>
                          <button
                            onClick={() => handleUpdateCourseStatus(selectedCourse.id, "REJECTED")}
                            className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 flex items-center justify-center space-x-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Từ Chối</span>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-slate-400 py-8">Chọn một khóa học bên trái để kiểm duyệt.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 1.2: Cấu trúc bài giảng chi tiết */}
          {subTabContent === "curriculum" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Cấu Trúc Chương Mục & Bài Giảng:{" "}
                    <span className={courseCategoryTab === "external" ? "text-orange-600" : "text-blue-600"}>
                      {courseCategoryTab === "external" ? "Khóa Kỹ Năng / Tự Do" : "Lớp Trường Học Chính Quy"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hiển thị toàn bộ cây bài học theo từng lớp được đăng tải trong hệ thống.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-xl">
                  Tổng: {filteredCourses.length} Lớp
                </span>
              </div>

              <div className="space-y-3">
                {filteredCourses.map((c) => (
                  <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-orange-600 px-2 py-0.5 bg-orange-50 rounded-md">
                            {c.code}
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-900">{c.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Đơn vị: <strong>{c.schoolName}</strong> • Giảng viên: <strong>{c.teacher_name || c.teacherName || "Chưa gán"}</strong>
                        </p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 shrink-0">
                        {c.lessons?.length || 0} Bài Giảng
                      </span>
                    </div>

                    {(c.lessons || []).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                        {c.lessons.map((l, i) => (
                          <div
                            key={l.id}
                            className="p-3 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl flex items-center justify-between transition-colors text-xs"
                          >
                            <div className="flex items-center space-x-2.5 truncate pr-2">
                              <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <div className="truncate">
                                <h5 className="font-bold text-slate-900 truncate">{l.title}</h5>
                                <span className="text-[10px] text-slate-400">Thời lượng: {l.duration || "30 phút"}</span>
                              </div>
                            </div>
                            {(l.fileUrl || l.file_url) && (
                              <span className="p-1 text-blue-600 bg-blue-50 rounded" title="Có tệp tài liệu">
                                <Paperclip className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl text-xs">
                        Chưa có bài giảng nào trong lớp này.
                      </div>
                    )}
                  </div>
                ))}

                {filteredCourses.length === 0 && (
                  <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    Không tìm thấy lớp học nào thuộc mục này.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sub-tab 1.3: Kho học liệu & Tệp đính kèm */}
          {subTabContent === "resources" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Kho Học Liệu & Tài Nguyên Đính Kèm:{" "}
                    <span className={courseCategoryTab === "external" ? "text-orange-600" : "text-blue-600"}>
                      {courseCategoryTab === "external" ? "Khóa Kỹ Năng / Tự Do" : "Lớp Trường Học Chính Quy"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tài liệu, Slide bài giảng, Đề bài tập và Đề thi trắc nghiệm được gom nhóm theo từng lớp cụ thể.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {filteredCourses.map((c) => {
                  const lessonFiles = (c.lessons || [])
                    .filter((l) => l.fileUrl || l.file_url)
                    .map((l) => ({
                      type: "Bài Giảng",
                      title: l.title,
                      fileName: l.fileName || l.file_name || l.title,
                      fileUrl: l.fileUrl || l.file_url,
                      color: "blue"
                    }));

                  const assignmentFiles = (c.assignments || [])
                    .filter((a) => a.fileUrl || a.file_url)
                    .map((a) => ({
                      type: "Đề Bài Tập",
                      title: a.title,
                      fileName: a.fileName || a.file_name || a.title,
                      fileUrl: a.fileUrl || a.file_url,
                      color: "orange"
                    }));

                  const quizFiles = (c.quizzes || [])
                    .filter((q) => q.fileUrl || q.file_url)
                    .map((q) => ({
                      type: "Đề Kiểm Tra",
                      title: q.title,
                      fileName: q.fileName || q.file_name || q.title,
                      fileUrl: q.fileUrl || q.file_url,
                      color: "rose"
                    }));

                  const allClassFiles = [...lessonFiles, ...assignmentFiles, ...quizFiles];

                  return (
                    <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-2.5">
                          <span className="font-mono text-xs font-bold text-orange-600 px-2 py-0.5 bg-orange-50 rounded-md">
                            {c.code}
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-900">{c.title}</h4>
                          <span className="text-[11px] text-slate-400">({c.schoolName})</span>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                          {allClassFiles.length} Tệp Tài Liệu
                        </span>
                      </div>

                      {allClassFiles.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {allClassFiles.map((file, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/80 rounded-xl flex items-center justify-between transition-all"
                            >
                              <div className="flex items-start space-x-2.5 truncate pr-2">
                                <div
                                  className={`p-2 rounded-lg shrink-0 ${
                                    file.color === "blue"
                                      ? "bg-blue-100 text-blue-700"
                                      : file.color === "orange"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-rose-100 text-rose-700"
                                  }`}
                                >
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="truncate text-xs">
                                  <h5 className="font-bold text-slate-900 truncate">{file.fileName}</h5>
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    Loại: <span className="font-semibold">{file.type}</span> • Thuộc: {file.title}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 shrink-0">
                                <a
                                  href={file.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                                  title="Xem trực tiếp"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href={file.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                  title="Tải về máy"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl text-xs">
                          Lớp này hiện chưa có tệp tài liệu nào được đính kèm.
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredCourses.length === 0 && (
                  <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    Không tìm thấy lớp học nào thuộc mục này.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 2. LỚP HỌC & HỌC VIÊN ==================== */}
      {mainTab === "students" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              {[
                { id: "student_list", label: "Quản Lý Danh Sách Học Viên Theo Lớp", icon: Users },
                { id: "progress", label: "Tiến Độ Học Tập Trực Tiếp", icon: TrendingUp }
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
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {courses.map((c) => (
                <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md ${
                            c.type === "school" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {c.type === "school" ? "Lớp Chính Quy (Excel)" : "Khóa Kỹ Năng (Tự Do)"}
                        </span>
                        <span className="font-mono text-xs font-bold text-orange-600 px-1.5 py-0.5 bg-orange-50 rounded">
                          {c.code}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900">{c.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Trường: <strong>{c.schoolName}</strong> • Giảng viên:{" "}
                        <strong>{c.teacher_name || c.teacherName}</strong> • Sĩ số:{" "}
                        <strong className="text-blue-600">
                          {c.studentsCount || 0}/{c.maxStudents} Học viên
                        </strong>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {c.type === "school" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setTargetCourseForImport(c);
                            setParsedStudents([]);
                            setIsImportModalOpen(true);
                          }}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>📥 Import DS Học Sinh (Excel)</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                          Mã tham gia: <strong className="text-orange-600 font-mono">{c.code}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    {c.type === "school"
                      ? "📌 Lớp chính quy: Danh sách học sinh được phân bổ trực tiếp từ file Excel do Trường/Sở gửi về."
                      : "🔓 Khóa tự do: Học sinh tự nhập mã lớp để tham gia."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== 3. DẠY ONLINE & ĐIỂM DANH LIVE ==================== */}
      {mainTab === "live" && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            {[
              { id: "schedule", label: "Phòng học ảo & Lịch phát", icon: Calendar },
              { id: "attendance", label: `Nhật ký điểm danh Live (${attendanceLogs.length})`, icon: Clock }
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
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          Chưa có lượt điểm danh nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== 4. ĐÁNH GIÁ & BÀI TẬP ==================== */}
      {mainTab === "assessment" && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            {[
              { id: "question_bank", label: "Tổng hợp bài tập tự luận", icon: HelpCircle },
              { id: "quiz_mgmt", label: "Bài kiểm tra trắc nghiệm", icon: FileCheck }
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

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Danh sách bài tập & Đề thi được phân bổ cho các lớp</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses
                .flatMap((c) => (c.assignments || []).map((a) => ({ ...a, courseTitle: c.title })))
                .map((a, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <h5 className="font-bold text-slate-900">{a.title}</h5>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                        Thang {a.maxScore || 10}đ
                      </span>
                    </div>
                    <p className="text-slate-500">
                      Thuộc lớp: <strong>{a.courseTitle}</strong>
                    </p>
                    <p className="text-slate-500">
                      Hạn nộp: <span className="text-rose-600 font-bold">{a.dueDate || "Chưa đặt"}</span>
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL TẠO LỚP CHÍNH QUY (ADMIN) ================= */}
      {isSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border overflow-hidden relative max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <School className="w-5 h-5 text-blue-200" />
                <h3 className="font-extrabold text-sm">Tạo Lớp Học Trường Học Chính Quy</h3>
              </div>
              <button
                onClick={() => setIsSchoolModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchoolCourse} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed text-[11px]">
                ℹ️ <strong>Lưu ý:</strong> Lớp học chính quy do Admin trực tiếp khởi tạo sẽ tự động ở trạng thái{" "}
                <strong>Đang Mở (APPROVED)</strong> và có hiệu lực ngay lập tức cho học sinh đăng ký.
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Tên Lớp Học *</label>
                <input
                  type="text"
                  required
                  value={schoolFormData.title}
                  onChange={(e) => setSchoolFormData({ ...schoolFormData, title: e.target.value })}
                  placeholder="VD: Toán Học 12A1 / Hóa Học 10C2..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Trường / Sở GD *</label>
                  <select
                    value={schoolFormData.schoolName}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, schoolName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
                  >
                    {SCHOOL_OPTIONS.map((sch, i) => (
                      <option key={i} value={sch}>
                        {sch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Môn Học *</label>
                  <select
                    value={schoolFormData.subject}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
                  >
                    {SUBJECT_OPTIONS.map((sub, i) => (
                      <option key={i} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Giảng Viên Phụ Trách</label>
                  <input
                    type="text"
                    required
                    value={schoolFormData.teacher_name}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, teacher_name: e.target.value })}
                    placeholder="VD: Thầy Phan Thuận"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Sĩ Số Tối Đa</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={schoolFormData.maxStudents}
                    onChange={(e) => setSchoolFormData({ ...schoolFormData, maxStudents: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Thời Khóa Biểu (TKB)</label>
                <input
                  type="text"
                  value={schoolFormData.schedule}
                  onChange={(e) => setSchoolFormData({ ...schoolFormData, schedule: e.target.value })}
                  placeholder="VD: Thứ 2, Thứ 4, Thứ 6 (Tiết 1 - 3)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Mô Tả Lớp Học</label>
                <textarea
                  rows="2"
                  value={schoolFormData.description}
                  onChange={(e) => setSchoolFormData({ ...schoolFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsSchoolModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSchool}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  {isSubmittingSchool && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingSchool ? "Đang tạo..." : "Khởi Tạo Lớp Chính Quy"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL IMPORT DANH SÁCH HỌC VIÊN BẰNG EXCEL / CSV ================= */}
      {isImportModalOpen && targetCourseForImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <School className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="font-extrabold text-sm">Nạp Danh Sách Học Viên Từ Excel</h3>
                  <p className="text-[11px] text-emerald-100">
                    Lớp: <strong>{targetCourseForImport.title}</strong> ({targetCourseForImport.code})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h5 className="font-bold text-emerald-900">Quy chuẩn file Excel / CSV:</h5>
                  <p className="text-[11px] text-emerald-700">
                    File cần có các cột: <strong>Họ Và Tên</strong>, <strong>Email / Tài Khoản</strong>, <strong>Mã Học Sinh</strong>.
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
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">
                      Xem trước dữ liệu ({parsedStudents.length} học viên):
                    </span>
                  </div>
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
                onClick={() => setIsImportModalOpen(false)}
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
      )}
    </div>
  );
}