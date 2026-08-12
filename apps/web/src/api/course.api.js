import { courseApi } from './axios';

export const courseService = {
  // ==========================================
  // 1. QUẢN LÝ LỚP HỌC / KHÓA HỌC CHUNG
  // ==========================================

  // Lấy toàn bộ danh sách lớp học
  getAllCourses: async () => {
    const response = await courseApi.get('/courses');
    return response.data;
  },

  // Lấy chi tiết một lớp học cụ thể theo ID
  getCourseById: async (id) => {
    const response = await courseApi.get(`/courses/${id}`);
    return response.data;
  },

  // Tạo mới một lớp học
  createCourse: async (courseData) => {
    const response = await courseApi.post('/courses', courseData);
    return response.data;
  },

  // Cập nhật cấu hình phòng Meet của lớp học
  updateCourseMeet: async (id, meetData) => {
    const response = await courseApi.patch(`/courses/${id}/meet`, meetData);
    return response.data;
  },

  // Xóa một lớp học
  deleteCourse: async (id) => {
    const response = await courseApi.delete(`/courses/${id}`);
    return response.data;
  },

  // ==========================================
  // 2. QUẢN LÝ TÀI NGUYÊN BÊN TRONG LỚP (TABS)
  // ==========================================

  // --- BÀI GIẢNG (LESSONS) ---
  getLessonsByCourse: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/lessons`);
    return response.data;
  },
  
  createLesson: async (courseId, lessonData) => {
    const response = await courseApi.post(`/courses/${courseId}/lessons`, lessonData);
    return response.data;
  },

  // --- BÀI TẬP VỀ NHÀ (ASSIGNMENTS) ---
  getAssignmentsByCourse: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/assignments`);
    return response.data;
  },

  createAssignment: async (courseId, assignmentData) => {
    const response = await courseApi.post(`/courses/${courseId}/assignments`, assignmentData);
    return response.data;
  },

  // --- BÀI KIỂM TRA (QUIZZES) ---
  getQuizzesByCourse: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/quizzes`);
    return response.data;
  },

  createQuiz: async (courseId, quizData) => {
    const response = await courseApi.post(`/courses/${courseId}/quizzes`, quizData);
    return response.data;
  }
};