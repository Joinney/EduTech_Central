/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  ArrowLeft, 
  BookOpen, 
  Users, 
  Clock, 
  PlusCircle, 
  FileText, 
  HelpCircle, 
  Building2, 
  Plus, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Download, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Video, 
  Radio, 
  Paperclip, 
  Loader2, 
  FileCheck, 
  Award,
  Check
} from "lucide-react"

import { courseService } from "../../../../api/course.api"
import { quizApi } from "../../../../api/quiz.api"
import LiveMeetingRoom from "./LiveMeetingRoom.jsx"

const CLOUD_NAME = "j3iibkjc";
const UPLOAD_PRESET = "ml_default"; 

const uploadDocumentFile = async (file) => {
  if (!file) return null;
  const isDoc = file.name.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/i);
  const resourceType = isDoc ? "raw" : "image";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      { method: "POST", body: formData }
    );
    const data = await response.json();
    if (data.secure_url) {
      return { url: data.secure_url, fileName: file.name };
    }
    return null;
  } catch (error) {
    console.error("Lỗi upload Cloudinary Document:", error);
    return null;
  }
};

const formatDateTime = (val) => {
  if (!val) return "Chưa đặt lịch";
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }
  return val;
};

const formatForDateTimeInput = (val) => {
  if (!val) return "";
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }
  return val.slice(0, 16);
};

export default function CourseDetail({ course, onBack }) {
  const navigate = useNavigate();

  // Thứ tự tab mặc định: Bài giảng
  const [activeTab, setActiveTab] = useState("lessons") // "lessons" | "assignments" | "quizzes" | "students"
  const [isInMeeting, setIsInMeeting] = useState(false)
  const [previewFile, setPreviewFile] = useState(null)

  const [meetInfo, setMeetInfo] = useState({
    title: `Buổi học Trực tuyến: ${course?.title || "Ôn tập & Giải đáp thắc mắc"}`,
    link: `https://meet.jit.si/EduTech-${course?.code || "Room"}-${course?.id || "Live"}`,
    startTime: "19:30 - 21:00",
    isActive: true
  })

  const [lessons, setLessons] = useState(course?.lessons || [])
  const [assignments, setAssignments] = useState(course?.assignments || [])
  const [quizzes, setQuizzes] = useState([])
  const [students, setStudents] = useState([])

  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  // Danh sách nộp bài tập (Postgres)
  const [viewSubmissionsAssignment, setViewSubmissionsAssignment] = useState(null)
  const [submissionsList, setSubmissionsList] = useState([])
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false)

  // State Xem Trước Đề Thi Thật Bóc Tách từ File Word
  const [previewStudentExam, setPreviewStudentExam] = useState(false)
  const [parsedPreviewQuestions, setParsedPreviewQuestions] = useState([])
  const [isParsingPreview, setIsParsingPreview] = useState(false)

  const [modalType, setModalType] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formCategory, setFormCategory] = useState("lesson") 

  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    startTime: "",
    endTime: "",
    durationMins: 15,
    examType: "QUIZ",
    content: "",
    dueDate: "",
    maxScore: 10,
    totalQuestions: 10,
    passScore: 5,
    description: ""
  })

  const [meetForm, setMeetForm] = useState({
    title: meetInfo.title,
    link: meetInfo.link,
    startTime: meetInfo.startTime
  })

  // Tải dữ liệu từ Postgres và MongoDB
  const fetchAllCourseDetails = async () => {
    if (!course?.id) return;
    const baseUrl = import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1";

    try {
      const [resL, resA, resS, mongoExams] = await Promise.all([
        fetch(`${baseUrl}/courses/${course.id}/lessons`).then(r => r.json()).catch(() => []),
        fetch(`${baseUrl}/courses/${course.id}/assignments`).then(r => r.json()).catch(() => []),
        fetch(`${baseUrl}/courses/${course.id}/students`).then(r => r.json()).catch(() => []),
        quizApi.getExamsByCourse(course.id).catch(() => [])
      ]);

      setLessons(Array.isArray(resL) ? resL : resL?.data || []);
      setAssignments(Array.isArray(resA) ? resA : resA?.data || []);
      setStudents(Array.isArray(resS) ? resS : resS?.data || []);
      setQuizzes(mongoExams || []);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết lớp học:", error);
    }
  };

  useEffect(() => {
    fetchAllCourseDetails();
  }, [course?.id]);

  const handleOpenSubmissions = async (assignment) => {
    setViewSubmissionsAssignment(assignment);
    setIsLoadingSubmissions(true);
    const baseUrl = import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1";
    try {
      const res = await fetch(`${baseUrl}/assignments/${assignment.id}/submissions`);
      if (res.ok) {
        const data = await res.json();
        setSubmissionsList(data.data || []);
      }
    } catch (err) {
      console.error("Lỗi lấy bài nộp:", err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  // 🎯 ĐIỀU HƯỚNG SANG TRANG RIÊNG BIỆT ĐỂ XEM DANH SÁCH BÀI LÀM
  const handleOpenExamSubmissions = (quiz) => {
    const examId = quiz.id || quiz._id;
    navigate(`/teacher/exam/${examId}`);
  };

  const handleSaveMeet = (e) => {
    e.preventDefault();
    setMeetInfo({ ...meetForm, isActive: true });
    setModalType(null);
    alert("Đã cập nhật phòng học Live thành công!");
  };

  const handleOpenCreate = (category) => {
    setFormCategory(category);
    setSelectedFile(null);
    setPreviewStudentExam(false);
    setParsedPreviewQuestions([]);

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const currentDateTime = now.toISOString().slice(0, 16);

    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 3);
    defaultEndDate.setMinutes(defaultEndDate.getMinutes() - defaultEndDate.getTimezoneOffset());
    const endDateTime = defaultEndDate.toISOString().slice(0, 16);

    setFormData({
      title: "",
      duration: currentDateTime,
      startTime: currentDateTime,
      endTime: endDateTime,
      durationMins: 15,
      examType: "QUIZ",
      content: "",
      dueDate: endDateTime,
      maxScore: 10,
      totalQuestions: 10,
      passScore: 5,
      description: ""
    });
    setModalType("create");
  };

  const handleOpenEdit = (category, item) => {
    setFormCategory(category);
    setSelectedItem(item);
    setSelectedFile(null);
    setFormData({
      title: item.title || "",
      duration: formatForDateTimeInput(item.duration),
      startTime: formatForDateTimeInput(item.start_time || item.duration),
      endTime: formatForDateTimeInput(item.end_time || item.dueDate || item.due_date),
      durationMins: item.duration_mins || 15,
      examType: item.type || "QUIZ",
      content: item.content || "",
      dueDate: formatForDateTimeInput(item.dueDate || item.due_date),
      maxScore: item.maxScore || item.max_score || 10,
      totalQuestions: item.totalQuestions || item.total_questions || 10,
      passScore: item.passScore || item.pass_score || 5,
      description: item.description || ""
    });
    setModalType("edit");
  };

  const handleOpenView = (category, item) => {
    setFormCategory(category);
    setSelectedItem(item);
    setModalType("view");
  };

  const handleTriggerPreview = async () => {
    if (!selectedFile) {
      alert("Vui lòng chọn file Word (.docx) trước!");
      return;
    }

    try {
      setIsParsingPreview(true);
      const uploadRes = await uploadDocumentFile(selectedFile);
      if (uploadRes?.url) {
        const parsedData = await quizApi.parsePreview(uploadRes.url);
        setParsedPreviewQuestions(parsedData || []);
        setPreviewStudentExam(true);
      }
    } catch (err) {
      console.error("Lỗi xem trước đề thi:", err);
      alert("Không thể đọc file Word này. Hãy kiểm tra lại định dạng file .docx!");
    } finally {
      setIsParsingPreview(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const baseUrl = import.meta.env.VITE_API_COURSE_URL || "http://localhost:8002/api/v1";

    try {
      setIsUploading(true);
      let uploadedFile = { 
        url: selectedItem?.fileUrl || selectedItem?.file_url || selectedItem?.file_doc_url || "", 
        fileName: selectedItem?.fileName || selectedItem?.file_name || "" 
      };

      if (selectedFile) {
        const uploadRes = await uploadDocumentFile(selectedFile);
        if (uploadRes) {
          uploadedFile = { url: uploadRes.url, fileName: uploadRes.fileName };
        }
      }

      if (formCategory === "lesson") {
        if (modalType === "create") {
          const response = await fetch(`${baseUrl}/courses/${course.id}/lessons`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formData.title,
              duration: formData.duration,
              content: formData.description,
              fileUrl: uploadedFile.url,
              fileName: uploadedFile.fileName,
            }),
          });
          if (response.ok) {
            const newLesson = await response.json();
            setLessons([...lessons, newLesson.data || newLesson]); 
          }
        } else if (modalType === "edit") {
          const response = await fetch(`${baseUrl}/lessons/${selectedItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formData.title,
              duration: formData.duration,
              content: formData.description,
              fileUrl: uploadedFile.url,
              fileName: uploadedFile.fileName,
            }),
          });
          if (response.ok) fetchAllCourseDetails();
        }
      } 
      else if (formCategory === "assignment") {
        const payload = {
          title: formData.title,
          dueDate: formData.dueDate,
          due_date: formData.dueDate,
          maxScore: Number(formData.maxScore),
          max_score: Number(formData.maxScore),
          description: formData.description,
          fileUrl: uploadedFile.url,
          fileName: uploadedFile.fileName,
        };

        if (modalType === "create") {
          const response = await fetch(`${baseUrl}/courses/${course.id}/assignments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (response.ok) {
            const newAssignment = await response.json();
            setAssignments([...assignments, newAssignment.data || newAssignment]);
          }
        } else if (modalType === "edit") {
          const response = await fetch(`${baseUrl}/assignments/${selectedItem.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (response.ok) fetchAllCourseDetails();
        }
      }
      else if (formCategory === "quiz") {
        const payload = {
          course_id: Number(course.id || course.id_course || 1),
          course_title: course.title || "",
          title: formData.title,
          type: formData.examType || "QUIZ",
          duration_mins: Number(formData.durationMins) || 15,
          start_time: formData.startTime || formData.duration || "",
          end_time: formData.endTime || formData.dueDate || "",
          total_questions: Number(formData.totalQuestions) || 10,
          pass_score: Number(formData.passScore) || 5.0,
          file_doc_url: uploadedFile.url || "",
          description: formData.description || ""
        };

        await quizApi.createExam(payload);
        alert(`🎉 Đã tạo đề thi "${formData.title}" thành công!`);
        fetchAllCourseDetails();
      }

      setModalType(null);
      setSelectedFile(null);
      setSelectedItem(null);
      setPreviewStudentExam(false);
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
      alert("Lỗi kết nối khi lưu đề thi!");
    } finally {
      setIsUploading(false);
    }
  };

  const toggleVisibility = (category, id) => {
    if (category === "lesson") setLessons(lessons.map(l => l.id === id ? { ...l, isVisible: !l.isVisible } : l));
    if (category === "assignment") setAssignments(assignments.map(a => a.id === id ? { ...a, isVisible: !a.isVisible } : a));
  };

  const handleDelete = async (category, id) => {
    if (window.confirm("Thầy/Cô có chắc chắn muốn xóa mục này?")) {
      try {
        if (category === "lesson") {
          await courseService.deleteLesson(id);
          setLessons(lessons.filter(l => l.id !== id));
        } else if (category === "assignment") {
          await courseService.deleteAssignment(id);
          setAssignments(assignments.filter(a => a.id !== id));
        }
      } catch (error) {
        console.error("Lỗi khi xóa:", error);
        alert("Không thể xóa lúc này!");
      }
    }
  };

  if (isInMeeting) {
    return (
      <LiveMeetingRoom
        course={course}
        meetInfo={meetInfo}
        onLeave={() => setIsInMeeting(false)}
      />
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Quay lại */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-orange-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh sách lớp</span>
        </button>

        <span className="px-3 py-1 bg-orange-100 text-orange-600 font-mono font-extrabold text-xs rounded-lg">
          Mã lớp: {course.code}
        </span>
      </div>

      {/* Thông tin Lớp học */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-orange-500 text-white text-[10px] font-black uppercase rounded-md">
                {course.subject}
              </span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Đơn vị: <strong className="text-slate-700">{course.schoolName || "EduTech"}</strong>
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">{course.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setModalType("meet")}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-500 hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Video className="w-4 h-4 animate-pulse" />
              <span>Tạo / Mở Phòng Meet</span>
            </button>

            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-bold flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-orange-500" />
              <span>Sĩ số: {students.length}/{course.maxStudents || 45}</span>
            </div>
          </div>
        </div>

        {meetInfo.isActive && (
          <div className="p-3.5 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border border-red-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  {meetInfo.title}
                  <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-extrabold rounded-md uppercase">Live</span>
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5">Khung giờ: {meetInfo.startTime}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsInMeeting(true)}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer active:scale-95"
              >
                <span>Vào Phòng Học</span>
                <Video className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>
      </div>

      {/* Tabs Chức Năng */}
      <div className="flex border-b border-slate-200 space-x-6 overflow-x-auto">
        {[
          { id: "lessons", label: `Nội dung Bài giảng (${lessons.length})`, icon: BookOpen },
          { id: "assignments", label: `Bài tập về nhà (${assignments.length})`, icon: FileText },
          { id: "quizzes", label: `Khảo thí & Quản trị đề thi (${quizzes.length})`, icon: HelpCircle },
          { id: "students", label: `Danh sách Học viên (${students.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: BÀI GIẢNG ================= */}
      {activeTab === "lessons" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Danh sách bài học & tài liệu học tập</h3>
            <button 
              onClick={() => handleOpenCreate("lesson")}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Thêm Bài Học Mới</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {lessons.map((lesson, idx) => (
              <div 
                key={lesson.id} 
                className={`p-4 rounded-2xl border shadow-2xs flex items-center justify-between transition-all ${
                  lesson.isVisible !== false ? "bg-white border-slate-200/80" : "bg-slate-50/80 border-slate-200 opacity-75"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-900">{lesson.title}</h4>
                      {lesson.isVisible === false && (
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded">
                          Đã ẩn
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      📅 Lịch học: <strong className="text-slate-700">{formatDateTime(lesson.duration)}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button onClick={() => handleOpenView("lesson", lesson)} className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl cursor-pointer"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => toggleVisibility("lesson", lesson.id)} className={`p-2 rounded-xl text-xs font-bold cursor-pointer ${lesson.isVisible !== false ? "bg-emerald-50 text-emerald-600" : "bg-slate-200 text-slate-600"}`}>{lesson.isVisible !== false ? <CheckCircle2 className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                  <button onClick={() => handleOpenEdit("lesson", lesson)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete("lesson", lesson.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: BÀI TẬP VỀ NHÀ ================= */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Danh sách bài tập giao cho học viên</h3>
            <button onClick={() => handleOpenCreate("assignment")} className="flex items-center space-x-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Giao Bài Tập Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((item) => (
              <div key={item.id} className={`p-4 rounded-2xl border shadow-2xs space-y-3 ${item.isVisible !== false ? "bg-white border-slate-200" : "bg-slate-50 opacity-75"}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">
                      ⏰ Hạn nộp: <strong className="text-red-600">{formatDateTime(item.dueDate || item.due_date)}</strong>
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.isVisible !== false ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                    {item.isVisible !== false ? "Đang mở" : "Đã ẩn"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => handleOpenSubmissions(item)}
                    className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 font-bold bg-orange-50 px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Đã nộp: {item.submittedCount || item.submissions?.length || 0}/{students.length || 0}</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button onClick={() => handleOpenView("assignment", item)} className="p-1.5 text-slate-500 hover:text-orange-600 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => toggleVisibility("assignment", item.id)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg">{item.isVisible !== false ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                    <button onClick={() => handleOpenEdit("assignment", item)} className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete("assignment", item.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: KHẢO THÍ & QUẢN TRỊ ĐỀ THI ================= */}
      {activeTab === "quizzes" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Khảo thí & Quản trị đề thi</h3>
              <p className="text-[11px] text-slate-500">Quản lý các bài kiểm tra trắc nghiệm bóc tách từ file Word và bài thi tự luận.</p>
            </div>
            <button 
              onClick={() => handleOpenCreate("quiz")}
              className="flex items-center space-x-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Đề Thi Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => {
              const isQuiz = quiz.type === "QUIZ";
              return (
                <div key={quiz.id || quiz._id} className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between hover:border-orange-300 transition-all">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                        isQuiz ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {isQuiz ? "Trắc nghiệm (File Word)" : "Tự luận"}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <span>{quiz.duration_mins} phút</span>
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 leading-snug">{quiz.title}</h4>
                    
                    <div className="space-y-1 text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span>Thời gian mở:</span>
                        <strong className="text-slate-700">{formatDateTime(quiz.start_time || quiz.duration)}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Hạn chót đóng đề:</span>
                        <strong className="text-rose-600">{formatDateTime(quiz.end_time || quiz.dueDate)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => handleOpenExamSubmissions(quiz)}
                      className="px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Xem Danh Sách Bài Làm</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {quizzes.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200 text-xs">
                Chưa có đề thi nào trong danh mục này.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: DANH SÁCH HỌC VIÊN ================= */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Học viên đang tham gia lớp</h3>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="grid grid-cols-1 divide-y divide-slate-100">
              {students.map((student, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={student.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name || "Học viên")}&background=random`} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{student.name || student.email?.split('@')[0] || "Chưa cập nhật tên"}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{student.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] font-medium text-slate-400">
                      Tham gia: {student.joined_at ? new Date(student.joined_at).toLocaleDateString("vi-VN") : "--"}
                    </span>
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer" title="Mời khỏi lớp">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {students.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500 font-medium">
                  Chưa có học viên nào tham gia lớp học này.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL TẠO ĐỀ THI & XEM TRƯỚC CÂU HỎI THẬT ================= */}
      {modalType === "create" && formCategory === "quiz" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <h3 className="font-extrabold text-sm">Tạo Đề Thi Mới</h3>
              </div>
              <button onClick={() => setModalType(null)} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1.5">Loại đề kiểm tra *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, examType: "QUIZ" })}
                    className={`py-2.5 rounded-xl font-bold border transition ${
                      formData.examType === "QUIZ"
                        ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    📝 Trắc Nghiệm (File Word)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, examType: "ESSAY" })}
                    className={`py-2.5 rounded-xl font-bold border transition ${
                      formData.examType === "ESSAY"
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    📄 Tự Luận (Nộp File)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1">Tên bài thi / đề kiểm tra *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="VD: Kiểm tra chuyên đề Chương 2..."
                  className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl font-medium focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Bắt đầu mở đề thi *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Hạn chót đóng đề *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-rose-600 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Thời lượng làm bài (Phút) *</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    required
                    value={formData.durationMins}
                    onChange={(e) => setFormData({ ...formData, durationMins: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">Điểm chuẩn đạt (/10)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.passScore}
                    onChange={(e) => setFormData({ ...formData, passScore: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* NẠP FILE WORD ĐỀ THI & NÚT XEM TRƯỚC CÂU HỎI THẬT */}
              <div className="p-4 bg-orange-50/60 border border-dashed border-orange-300 rounded-2xl space-y-2">
                <label className="font-bold text-slate-800 uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4 text-orange-600" />
                    <span>Nạp tệp đề bài (.docx / .pdf) *</span>
                  </span>
                  {selectedFile && formData.examType === "QUIZ" && (
                    <button
                      type="button"
                      onClick={handleTriggerPreview}
                      disabled={isParsingPreview}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-extrabold flex items-center space-x-1 cursor-pointer transition shadow-2xs"
                    >
                      {isParsingPreview ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                      <span>{isParsingPreview ? "Đang quét file..." : "Xem trước câu hỏi bóc tách"}</span>
                    </button>
                  )}
                </label>
                <input
                  type="file"
                  required
                  accept=".docx,.doc,.pdf"
                  onChange={(e) => {
                    setSelectedFile(e.target.files[0]);
                    setParsedPreviewQuestions([]);
                  }}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
                {selectedFile && (
                  <p className="text-[11px] text-emerald-700 font-bold">✓ Đã nhận diện tệp: {selectedFile.name}</p>
                )}
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer">Hủy</button>
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold cursor-pointer shadow-md shadow-orange-500/20 flex items-center space-x-1.5"
                >
                  {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isUploading ? "Đang lưu đề thi..." : "Phát Hành Đề Thi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL XEM TRƯỚC CÂU HỎI THẬT BÓC TÁCH TỪ FILE WORD ================= */}
      {previewStudentExam && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
              <div>
                <span className="px-2 py-0.5 bg-purple-500 text-white text-[9px] font-black uppercase rounded">
                  Kết quả bóc tách từ file: {selectedFile?.name}
                </span>
                <h4 className="font-extrabold text-sm text-white mt-1">
                  Đã nhận diện thành công: {parsedPreviewQuestions.length} câu hỏi
                </h4>
              </div>
              <button onClick={() => setPreviewStudentExam(false)} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                💡 <strong>Kiểm tra đáp án:</strong> Các đáp án được viền <span className="text-emerald-700 font-bold">Xanh Lá (✓)</span> là đáp án đúng mà hệ thống đã tự động nhận diện từ ký hiệu <code>*</code> hoặc <code>[x]</code> trong file Word của bạn.
              </div>

              {parsedPreviewQuestions.map((q, qIdx) => (
                <div key={qIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h5 className="font-bold text-slate-900 text-xs leading-relaxed">{q.question}</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(q.options || []).map((opt, oIdx) => {
                      const isCorrect = q.correct_ans === oIdx;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border font-medium flex items-center justify-between ${
                            isCorrect
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                              : "bg-white text-slate-700 border-slate-200"
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {parsedPreviewQuestions.length === 0 && (
                <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed">
                  Không tìm thấy câu hỏi nào. Hãy chắc chắn các câu trong file Word bắt đầu bằng <code>Câu 1:</code>, <code>Câu 2:</code> và đáp án có dạng <code>A.</code>, <code>B.</code>, <code>C.</code>, <code>D.</code>.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button onClick={() => setPreviewStudentExam(false)} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer">
                Đóng Xem Trước
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL XEM CÁC BÀI TẬP HỌC SINH ĐÃ NỘP (POSTGRES) ================= */}
      {viewSubmissionsAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-sm">Danh sách Bài làm đã nộp: {viewSubmissionsAssignment.title}</h3>
              <button onClick={() => setViewSubmissionsAssignment(null)} className="p-1 hover:bg-white/20 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto flex-1 text-xs">
              {isLoadingSubmissions ? (
                <div className="p-8 text-center flex justify-center items-center space-x-2 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                  <span>Đang tải danh sách bài nộp...</span>
                </div>
              ) : submissionsList.length === 0 ? (
                <div className="p-8 text-center text-slate-400">Chưa có học sinh nào nộp bài tập này.</div>
              ) : (
                submissionsList.map((sub, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-slate-900">{sub.student_name}</h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">Nộp lúc: {new Date(sub.created_at).toLocaleString("vi-VN")}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setPreviewFile({
                          url: sub.fileUrl || sub.file_url,
                          name: sub.fileName || sub.file_name || `Bài làm của ${sub.student_name}`
                        })}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-[11px] flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem trực tiếp</span>
                      </button>

                      <a 
                        href={sub.fileUrl || sub.file_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        download
                        className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[11px]"
                        title="Tải về máy"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL TẠO / SỬA MEET ================= */}
      {modalType === "meet" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-orange-500 p-4 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-sm">Cấu Hình Phòng Meet</h3>
              <button onClick={() => setModalType(null)} className="p-1 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveMeet} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase">Tiêu đề buổi Live *</label>
                <input
                  type="text"
                  required
                  value={meetForm.title}
                  onChange={(e) => setMeetForm({ ...meetForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase">Link Meet / Zoom URL *</label>
                <input
                  type="url"
                  required
                  value={meetForm.link}
                  onChange={(e) => setMeetForm({ ...meetForm, link: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>
              <div className="pt-2 flex justify-end space-x-2">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 bg-slate-100 rounded-xl font-bold">Hủy</button>
                <button type="submit" className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold">Bắt Đầu Live</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}