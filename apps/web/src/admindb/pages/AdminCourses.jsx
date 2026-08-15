/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookOpenCheck,
  GraduationCap,
  Radio,
  FileCheck,
  Plus,
  Download
} from "lucide-react";
import { courseService } from "../../api/course.api";

import ImportStudentsModal from "../components/lcms/modals/ImportStudentsModal";
import ContentTab from "../components/lcms/tabs/ContentTab";
import StudentsTab from "../components/lcms/tabs/StudentsTab";
import LiveMeetTab from "../components/lcms/tabs/LiveMeetTab";
import AssessmentTab from "../components/lcms/tabs/AssessmentTab";

export default function AdminCourses() {
  const location = useLocation();
  const navigate = useNavigate();

  // Tab routing
  const [mainTab, setMainTab] = useState("content");
  const [courseCategoryTab, setCourseCategoryTab] = useState("external");
  const [subTabContent, setSubTabContent] = useState("course_list");
  const [subTabStudent, setSubTabStudent] = useState("student_list");
  const [subTabLive, setSubTabLive] = useState("schedule");
  const [subTabAssess, setSubTabAssess] = useState("question_bank");

  // State dữ liệu
  const [courses, setCourses] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State Modals
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [targetCourseForImport, setTargetCourseForImport] = useState(null);

  // 1. Đồng bộ URL Query Params[cite: 3]
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

  // 2. Fetch dữ liệu[cite: 3]
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

  // 3. Duyệt khóa học[cite: 3]
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

  // Lọc dữ liệu[cite: 3]
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
      {/* HEADER */}
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
          // Thay vì mở modal, chuyển hướng sang trang riêng:
<button
  onClick={() => navigate("/admin/courses/create-school")}
  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center space-x-1.5"
>
  <Plus className="w-4 h-4" />
  <span>Tạo Lớp Chính Quy Mới</span>
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

      {/* RENDER TABS THEO URL */}
      {mainTab === "content" && (
        <ContentTab
          courses={courses}
          filteredCourses={filteredCourses}
          externalCourses={externalCourses}
          schoolCourses={schoolCourses}
          subTabContent={subTabContent}
          onSwitchSubTab={handleSwitchSubTab}
          courseCategoryTab={courseCategoryTab}
          setCourseCategoryTab={setCourseCategoryTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          adminNote={adminNote}
          setAdminNote={setAdminNote}
          onUpdateCourseStatus={handleUpdateCourseStatus}
        />
      )}

      {mainTab === "students" && (
        <StudentsTab
          courses={courses}
          subTabStudent={subTabStudent}
          onSwitchSubTab={handleSwitchSubTab}
          onOpenImportModal={(course) => {
            setTargetCourseForImport(course);
            setIsImportModalOpen(true);
          }}
        />
      )}

      {mainTab === "live" && (
        <LiveMeetTab
          courses={courses}
          attendanceLogs={attendanceLogs}
          subTabLive={subTabLive}
          onSwitchSubTab={handleSwitchSubTab}
        />
      )}

      {mainTab === "assessment" && (
        <AssessmentTab
          courses={courses}
          subTabAssess={subTabAssess}
          onSwitchSubTab={handleSwitchSubTab}
        />
      )}

      

      <ImportStudentsModal
        isOpen={isImportModalOpen}
        course={targetCourseForImport}
        onClose={() => {
          setIsImportModalOpen(false);
          setTargetCourseForImport(null);
        }}
        onSuccess={fetchAllData}
      />
    </div>
  );
}