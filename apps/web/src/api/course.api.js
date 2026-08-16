import { courseApi } from "./axios";

export const courseService = {
  // ==========================================
  // 1. QUẢN LÝ LỚP HỌC & KIỂM DUYỆT (ADMIN / TEACHER)
  // ==========================================
  getAllCourses: async (paramOrId) => {
    let params = {};
    if (typeof paramOrId === "object" && paramOrId !== null) {
      params = paramOrId;
    } else if (paramOrId) {
      params = { teacher_id: paramOrId };
    }
    const response = await courseApi.get("/courses", { params });
    return response.data?.data || response.data || [];
  },

  getCourseById: async (id) => {
    const response = await courseApi.get(`/courses/${id}`);
    return response.data?.data || response.data;
  },

  createCourse: async (courseData) => {
    const response = await courseApi.post("/courses", courseData);
    return response.data?.data || response.data;
  },

  updateCourseMeet: async (id, meetData) => {
    const response = await courseApi.patch(`/courses/${id}/meet`, meetData);
    return response.data?.data || response.data;
  },

  updateCourseStatus: async (id, statusData) => {
    const response = await courseApi.patch(`/courses/${id}/status`, statusData);
    return response.data?.data || response.data;
  },

  deleteCourse: async (id) => {
    const response = await courseApi.delete(`/courses/${id}`);
    return response.data?.data || response.data;
  },

  // 🎯 Lấy danh sách môn học/lĩnh vực được phân công của giáo viên từ bảng teacher_subjects
  getTeacherSubjects: async (teacherId) => {
    try {
      const response = await courseApi.get(`/teachers/${teacherId}/subjects`);
      return response.data?.data || response.data || [];
    } catch {
      // Fallback query nếu backend dùng route dạng query params
      try {
        const response = await courseApi.get("/teacher-subjects", {
          params: { teacher_id: teacherId }
        });
        return response.data?.data || response.data || [];
      } catch {
        return [];
      }
    }
  },

  // ==========================================
  // 2. BÀI GIẢNG & TIẾN ĐỘ HỌC TẬP
  // ==========================================
  getLessonsByCourse: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/lessons`);
    return response.data?.data || response.data || [];
  },

  createLesson: async (courseId, lessonData) => {
    const response = await courseApi.post(`/courses/${courseId}/lessons`, lessonData);
    return response.data?.data || response.data;
  },

  updateLesson: async (lessonId, lessonData) => {
    const response = await courseApi.put(`/lessons/${lessonId}`, lessonData);
    return response.data?.data || response.data;
  },

  deleteLesson: async (lessonId) => {
    const response = await courseApi.delete(`/lessons/${lessonId}`);
    return response.data?.data || response.data;
  },

  markLessonProgress: async (lessonId, progressData) => {
    const response = await courseApi.post(`/lessons/${lessonId}/progress`, progressData);
    return response.data?.data || response.data;
  },

  getStudentCourseProgress: async (courseId, studentId) => {
    const response = await courseApi.get(`/courses/${courseId}/progress/${studentId}`);
    return response.data?.data || response.data;
  },

  // ==========================================
  // 3. BÀI TẬP VỀ NHÀ & NỘP BÀI
  // ==========================================
  getAssignmentsByCourse: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/assignments`);
    return response.data?.data || response.data || [];
  },

  createAssignment: async (courseId, assignmentData) => {
    const response = await courseApi.post(`/courses/${courseId}/assignments`, assignmentData);
    return response.data?.data || response.data;
  },

  updateAssignment: async (assignmentId, assignmentData) => {
    const response = await courseApi.put(`/assignments/${assignmentId}`, assignmentData);
    return response.data?.data || response.data;
  },

  deleteAssignment: async (assignmentId) => {
    const response = await courseApi.delete(`/assignments/${assignmentId}`);
    return response.data?.data || response.data;
  },

  submitAssignment: async (assignmentId, submissionData) => {
    const response = await courseApi.post(`/assignments/${assignmentId}/submit`, submissionData);
    return response.data?.data || response.data;
  },

  getSubmissionsByAssignment: async (assignmentId) => {
    const response = await courseApi.get(`/assignments/${assignmentId}/submissions`);
    return response.data?.data || response.data || [];
  },

  // ==========================================
  // 4. BÀI KIỂM TRA / THI TRẮC NGHIỆM
  // ==========================================
  getQuizzesByCourse: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/quizzes`);
    return response.data?.data || response.data || [];
  },

  createQuiz: async (courseId, quizData) => {
    const response = await courseApi.post(`/courses/${courseId}/quizzes`, quizData);
    return response.data?.data || response.data;
  },

  updateQuiz: async (quizId, quizData) => {
    const response = await courseApi.put(`/quizzes/${quizId}`, quizData);
    return response.data?.data || response.data;
  },

  deleteQuiz: async (quizId) => {
    const response = await courseApi.delete(`/quizzes/${quizId}`);
    return response.data?.data || response.data;
  },

  submitQuizResult: async (quizId, resultData) => {
    const response = await courseApi.post(`/quizzes/${quizId}/submit`, resultData);
    return response.data?.data || response.data;
  },

  getQuizSubmissions: async (quizId) => {
    const response = await courseApi.get(`/quizzes/${quizId}/submissions`);
    return response.data?.data || response.data || [];
  },

  // ==========================================
  // 5. ĐIỂM DANH LIVE MEET
  // ==========================================
  recordJoinAttendance: async (joinData) => {
    const response = await courseApi.post("/attendance/join", joinData);
    return response.data?.data || response.data;
  },

  recordLeaveAttendance: async (logId) => {
    const response = await courseApi.post("/attendance/leave", { log_id: logId });
    return response.data?.data || response.data;
  },

  getCourseAttendanceLogs: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/attendance`);
    return response.data?.data || response.data || [];
  },

  getAllAttendanceLogs: async () => {
    const response = await courseApi.get("/attendance/all");
    return response.data?.data || response.data || [];
  },

  // ==========================================
  // 6. THÀNH VIÊN LỚP HỌC & GHI DANH
  // ==========================================
  getStudentsByCourse: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/students`);
    return response.data?.data || response.data || [];
  },

  getCourseStudents: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/students`);
    return response.data?.data || response.data || [];
  },

  joinCourse: async (courseId, studentData) => {
    const response = await courseApi.post(`/courses/${courseId}/join`, studentData);
    return response.data?.data || response.data;
  },

  joinCourseByCode: async (code) => {
    const response = await courseApi.get("/courses");
    const courses = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    
    const matchedCourse = courses.find(
      (c) => (c.code || "").trim().toUpperCase() === code.trim().toUpperCase()
    );

    if (!matchedCourse) {
      throw new Error("Mã lớp không hợp lệ hoặc không tồn tại!");
    }

    if (matchedCourse.type === "school") {
      throw new Error("Đây là Lớp học trường chính quy! Danh sách học viên được Admin phân bổ trực tiếp từ Nhà trường, không thể tự ý nhập mã tham gia.");
    }

    return matchedCourse;
  },

  getStudentJoinedCourses: async (studentId) => {
    const response = await courseApi.get(`/students/${studentId}/courses`);
    return response.data?.data || response.data || [];
  },

  importStudentsBatch: async (courseId, students) => {
    const response = await courseApi.post(`/courses/${courseId}/students/import`, { students });
    return response.data?.data || response.data;
  },

  // ==========================================
  // 7. DIỄN ĐÀN / THẢO LUẬN
  // ==========================================
  getCourseDiscussions: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/discussions`);
    return response.data?.data || response.data || [];
  },

  createDiscussion: async (courseId, discussionData) => {
    const response = await courseApi.post(`/courses/${courseId}/discussions`, discussionData);
    return response.data?.data || response.data;
  },

  deleteDiscussion: async (discussionId) => {
    const response = await courseApi.delete(`/discussions/${discussionId}`);
    return response.data?.data || response.data;
  }
};

export default courseService;