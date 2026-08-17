import axios from "axios";

const PAYMENT_API_URL = import.meta.env.VITE_API_PAYMENT_URL || "http://localhost:8004/api/v1/payments";

export const paymentApi = {
  // Tạo URL thanh toán VNPay Sandbox
  createPaymentUrl: async (payload) => {
    const res = await axios.post(`${PAYMENT_API_URL}/create-vnpay-url`, payload);
    return res.data;
  },

  // Xác thực kết quả giao dịch sau khi VNPay trả về
  verifyCallback: async (params) => {
    const res = await axios.post(`${PAYMENT_API_URL}/vnpay-callback`, params);
    return res.data;
  },

  // Lấy toàn bộ lịch sử thanh toán (Admin)
  getAllTransactions: async () => {
    const res = await axios.get(`${PAYMENT_API_URL}/transactions`);
    return res.data?.data || [];
  },

  // Lấy lịch sử thanh toán của học sinh
  getMyTransactions: async (userId) => {
    const res = await axios.get(`${PAYMENT_API_URL}/my-transactions/${userId}`);
    return res.data?.data || [];
  },

  // Kiểm tra học sinh đã mua khóa học chưa
  checkEnrollment: async (userId, courseId) => {
    const res = await axios.get(`${PAYMENT_API_URL}/check-enrollment/${userId}/${courseId}`);
    return res.data;
  }
};