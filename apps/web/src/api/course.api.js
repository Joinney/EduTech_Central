import { courseApi } from './axios';

export const courseService = {
  // ==========================================
  // 1. QUẢN LÝ LỚP HỌC / KHÓA HỌC CHUNG
  // ==========================================
  getAllCourses: async (teacherId) => {
    const params = teacherId ? { teacher_id: teacherId } : {};
    const response = await courseApi.get('/courses', { params });
    return response.data;
  },

  getCourseById: async (id) => {
    const response = await courseApi.get(`/courses/${id}`);
    return response.data;
  },

  createCourse: async (courseData) => {
    const response = await courseApi.post('/courses', courseData);
    return response.data;
  },

  updateCourseMeet: async (id, meetData) => {
    const response = await courseApi.patch(`/courses/${id}/meet`, meetData);
    return response.data;
  },

  deleteCourse: async (id) => {
    const response = await courseApi.delete(`/courses/${id}`);
    return response.data;
  },

  // ==========================================
  // 2. QUẢN LÝ TÀI NGUYÊN BÊN TRONG LỚP (TABS)
  // ==========================================
  getLessonsByCourse: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/lessons`);
    return response.data;
  },

  createLesson: async (courseId, lessonData) => {
    const response = await courseApi.post(`/courses/${courseId}/lessons`, lessonData);
    return response.data;
  },

  getAssignmentsByCourse: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/assignments`);
    return response.data;
  },

  createAssignment: async (courseId, assignmentData) => {
    const response = await courseApi.post(`/courses/${courseId}/assignments`, assignmentData);
    return response.data;
  },

  getQuizzesByCourse: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/quizzes`);
    return response.data;
  },

  createQuiz: async (courseId, quizData) => {
    const response = await courseApi.post(`/courses/${courseId}/quizzes`, quizData);
    return response.data;
  },

  // ==========================================
  // 3. API DÀNH CHO HỌC VIÊN (STUDENT)
  // ==========================================
  
  // Kéo danh sách toàn bộ các lớp học
  getStudentCourses: async () => {
    const response = await courseApi.get('/courses');
    return response.data;
  },

  // Lấy danh sách các lớp học mà sinh viên đã tham gia từ DB
  getStudentJoinedCourses: async (studentId) => {
    const response = await courseApi.get(`/students/${studentId}/courses`);
    return response.data;
  },

  // Tìm lớp học bằng mã Code (VD: CLASS-9A2B)
  joinCourseByCode: async (code) => {
    const response = await courseApi.get('/courses');
    const matchedCourse = response.data.find(c => c.code.toUpperCase() === code.toUpperCase());
    
    if (!matchedCourse) {
      throw new Error("Mã lớp không hợp lệ hoặc không tồn tại!");
    }

    return matchedCourse;
  },

  // Học sinh nộp bài tập (Word/PDF)
  submitAssignment: async (assignmentId, submissionData) => {
    const response = await courseApi.post(`/assignments/${assignmentId}/submit`, submissionData);
    return response.data;
  },

  // ==========================================
  // 4. QUẢN LÝ HỌC VIÊN & BÀI NỘP (GIÁO VIÊN)
  // ==========================================
  
  getStudentsByCourse: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/students`);
    return response.data;
  },

  joinCourse: async (courseId, studentData) => {
    const response = await courseApi.post(`/courses/${courseId}/join`, studentData);
    return response.data;
  },

  getSubmissionsByAssignment: async (assignmentId) => {
    const response = await courseApi.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
  }
};