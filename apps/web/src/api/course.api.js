import { courseApi } from './axios';

export const courseService = {
  // 1. QUẢN LÝ LỚP HỌC & KIỂM DUYỆT (Tương thích cả teacherId lẫn params object)
  getAllCourses: async (paramOrId) => {
    let params = {};
    if (typeof paramOrId === 'object' && paramOrId !== null) {
      params = paramOrId;
    } else if (paramOrId) {
      params = { teacher_id: paramOrId };
    }
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
  updateCourseStatus: async (id, statusData) => {
    const response = await courseApi.patch(`/courses/${id}/status`, statusData);
    return response.data;
  },
  deleteCourse: async (id) => {
    const response = await courseApi.delete(`/courses/${id}`);
    return response.data;
  },

  // 2. BÀI GIẢNG & TIẾN ĐỘ HỌC TẬP
  getLessonsByCourse: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/lessons`);
    return response.data;
  },
  createLesson: async (courseId, lessonData) => {
    const response = await courseApi.post(`/courses/${courseId}/lessons`, lessonData);
    return response.data;
  },
  updateLesson: async (lessonId, lessonData) => {
    const response = await courseApi.put(`/lessons/${lessonId}`, lessonData);
    return response.data;
  },
  deleteLesson: async (lessonId) => {
    const response = await courseApi.delete(`/lessons/${lessonId}`);
    return response.data;
  },
  markLessonProgress: async (lessonId, progressData) => {
    const response = await courseApi.post(`/lessons/${lessonId}/progress`, progressData);
    return response.data;
  },
  getStudentCourseProgress: async (courseId, studentId) => {
    const response = await courseApi.get(`/courses/${courseId}/progress/${studentId}`);
    return response.data;
  },

  // 3. BÀI TẬP VỀ NHÀ & NỘP BÀI
  getAssignmentsByCourse: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/assignments`);
    return response.data;
  },
  createAssignment: async (courseId, assignmentData) => {
    const response = await courseApi.post(`/courses/${courseId}/assignments`, assignmentData);
    return response.data;
  },
  updateAssignment: async (assignmentId, assignmentData) => {
    const response = await courseApi.put(`/assignments/${assignmentId}`, assignmentData);
    return response.data;
  },
  deleteAssignment: async (assignmentId) => {
    const response = await courseApi.delete(`/assignments/${assignmentId}`);
    return response.data;
  },
  submitAssignment: async (assignmentId, submissionData) => {
    const response = await courseApi.post(`/assignments/${assignmentId}/submit`, submissionData);
    return response.data;
  },
  getSubmissionsByAssignment: async (assignmentId) => {
    const response = await courseApi.get(`/assignments/${assignmentId}/submissions`);
    return response.data;
  },

  // 4. BÀI KIỂM TRA / THI TRẮC NGHIỆM
  getQuizzesByCourse: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/quizzes`);
    return response.data;
  },
  createQuiz: async (courseId, quizData) => {
    const response = await courseApi.post(`/courses/${courseId}/quizzes`, quizData);
    return response.data;
  },
  updateQuiz: async (quizId, quizData) => {
    const response = await courseApi.put(`/quizzes/${quizId}`, quizData);
    return response.data;
  },
  deleteQuiz: async (quizId) => {
    const response = await courseApi.delete(`/quizzes/${quizId}`);
    return response.data;
  },
  submitQuizResult: async (quizId, resultData) => {
    const response = await courseApi.post(`/quizzes/${quizId}/submit`, resultData);
    return response.data;
  },
  getQuizSubmissions: async (quizId) => {
    const response = await courseApi.get(`/quizzes/${quizId}/submissions`);
    return response.data;
  },

  // 5. ĐIỂM DANH LIVE MEET
  recordJoinAttendance: async (joinData) => {
    const response = await courseApi.post('/attendance/join', joinData);
    return response.data;
  },
  recordLeaveAttendance: async (logId) => {
    const response = await courseApi.post('/attendance/leave', { log_id: logId });
    return response.data;
  },
  getCourseAttendanceLogs: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/attendance`);
    return response.data;
  },
  getAllAttendanceLogs: async () => {
    const response = await courseApi.get('/attendance/all');
    return response.data;
  },

  // 6. THÀNH VIÊN LỚP HỌC
  getStudentsByCourse: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/students`);
    return response.data;
  },
  joinCourse: async (courseId, studentData) => {
    const response = await courseApi.post(`/courses/${courseId}/join`, studentData);
    return response.data;
  },
  getStudentJoinedCourses: async (studentId) => {
    const response = await courseApi.get(`/students/${studentId}/courses`);
    return response.data;
  },

  // 7. DIỄN ĐÀN / THẢO LUẬN
  getCourseDiscussions: async (courseId) => {
    const response = await courseApi.get(`/courses/${courseId}/discussions`);
    return response.data;
  },
  createDiscussion: async (courseId, discussionData) => {
    const response = await courseApi.post(`/courses/${courseId}/discussions`, discussionData);
    return response.data;
  }
};