import { courseApi } from './axios';

export const courseService = {
  // ==========================================
  // 1. QUẢN LÝ LỚP HỌC / KHÓA HỌC CHUNG
  // ==========================================
  getAllCourses: async () => {
    const response = await courseApi.get('/courses');
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
  
  // Kéo danh sách các lớp học mà Student đang tham gia
  getStudentCourses: async () => {
    const response = await courseApi.get('/courses');
    return response.data;
  },

  // Tham gia lớp học bằng mã Code (VD: CLASS-9A2B)
  joinCourseByCode: async (code) => {
    // Bước 1: Tìm lớp học có mã code tương ứng
    const response = await courseApi.get('/courses');
    const matchedCourse = response.data.find(c => c.code.toUpperCase() === code.toUpperCase());
    
    if (!matchedCourse) {
      throw new Error("Mã lớp không hợp lệ hoặc không tồn tại!");
    }

    // Bước 2: Bắn API xuống Golang để lưu sinh viên vào bảng course_students
    await courseApi.post(`/courses/${matchedCourse.id}/join`, {});

    return matchedCourse;
  },

  // ==========================================
  // 4. QUẢN LÝ HỌC VIÊN TRONG LỚP (GIÁO VIÊN)
  // ==========================================
  
  getStudentsByCourse: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/students`);
    return response.data;
  },

  joinCourse: async (courseId, studentData) => {
    const response = await courseApi.post(`/courses/${courseId}/join`, studentData);
    return response.data;
  }
};