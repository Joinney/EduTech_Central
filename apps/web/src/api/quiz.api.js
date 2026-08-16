import axios from "axios";

const QUIZ_API_URL = import.meta.env.VITE_API_QUIZ_URL || "http://localhost:8003/api/v1/quizzes";

export const quizApi = {
  createExam: async (examData) => {
    const res = await axios.post(`${QUIZ_API_URL}/create`, examData);
    return res.data;
  },

  parsePreview: async (fileDocUrl) => {
    const res = await axios.post(`${QUIZ_API_URL}/parse-preview`, { file_doc_url: fileDocUrl });
    return res.data?.data || [];
  },

  getExamsByCourse: async (courseId) => {
    const res = await axios.get(`${QUIZ_API_URL}/course/${courseId}`);
    return res.data?.data || [];
  },

  getExamDetail: async (examId) => {
    const res = await axios.get(`${QUIZ_API_URL}/${examId}`);
    return res.data?.data || null;
  },

  // 🎯 Khởi tạo hoặc Tiếp tục phiên làm bài (Lấy giờ thực tế từ Server)
  startOrResumeSession: async (examId, studentId, studentName) => {
    const res = await axios.post(`${QUIZ_API_URL}/${examId}/start`, {
      student_id: Number(studentId),
      student_name: studentName
    });
    return res.data;
  },

  // 🎯 Tự động lưu tiến độ (Answers, Flagged, Violations) lên MongoDB
  saveSessionProgress: async (examId, progressData) => {
    const res = await axios.post(`${QUIZ_API_URL}/${examId}/save-progress`, progressData);
    return res.data;
  },

  submitExam: async (examId, submissionData) => {
    const res = await axios.post(`${QUIZ_API_URL}/${examId}/submit`, submissionData);
    return res.data;
  },

  checkStudentSubmission: async (examId, studentId) => {
    const res = await axios.get(`${QUIZ_API_URL}/${examId}/submission/${studentId}`);
    return res.data;
  },

  getAllSubmissions: async (examId) => {
    const res = await axios.get(`${QUIZ_API_URL}/${examId}/submissions`);
    return res.data?.data || [];
  }
};