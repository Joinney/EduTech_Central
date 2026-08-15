import axios from "axios";

const QUIZ_API_URL = import.meta.env.VITE_API_QUIZ_URL || "http://localhost:8003/api/v1/quizzes";

export const quizApi = {
  // Giảng viên tạo đề thi
  createExam: async (examData) => {
    const res = await axios.post(`${QUIZ_API_URL}/create`, examData);
    return res.data;
  },

  // Giảng viên xem trước bóc tách câu hỏi từ file Word
  parsePreview: async (fileDocUrl) => {
    const res = await axios.post(`${QUIZ_API_URL}/parse-preview`, { file_doc_url: fileDocUrl });
    return res.data?.data || [];
  },

  // Lấy danh sách bài thi theo môn học
  getExamsByCourse: async (courseId) => {
    const res = await axios.get(`${QUIZ_API_URL}/course/${courseId}`);
    return res.data?.data || [];
  },

  // Lấy chi tiết đề thi
  getExamDetail: async (examId) => {
    const res = await axios.get(`${QUIZ_API_URL}/${examId}`);
    return res.data?.data || null;
  },

  // Học sinh nộp bài thi
  submitExam: async (examId, submissionData) => {
    const res = await axios.post(`${QUIZ_API_URL}/${examId}/submit`, submissionData);
    return res.data;
  },

  // Kiểm tra trạng thái nộp bài
  checkStudentSubmission: async (examId, studentId) => {
    const res = await axios.get(`${QUIZ_API_URL}/${examId}/submission/${studentId}`);
    return res.data;
  },

  // Giảng viên xem danh sách bài làm
  getAllSubmissions: async (examId) => {
    const res = await axios.get(`${QUIZ_API_URL}/${examId}/submissions`);
    return res.data?.data || [];
  }
};