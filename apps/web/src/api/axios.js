import axios from "axios";

const API_AUTH_URL = import.meta.env.VITE_API_AUTH_URL || "http://localhost:8001/api/v1";

const api = axios.create({
  baseURL: API_AUTH_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor Request: Tự động gắn token vào Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor Response: Tự động Refresh Token khi gặp lỗi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu gặp lỗi 401 và chưa từng thử lại (Tránh lặp vô tận)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          // Gọi API làm mới token
          const res = await axios.post(`${API_AUTH_URL}/auth/refresh-token`, { refreshToken });

          if (res.data?.success && res.data?.data?.token) {
            const newToken = res.data.data.token;
            localStorage.setItem("token", newToken);

            // Thử lại request ban đầu với token mới
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Nếu refresh token cũng hết hạn -> Đăng xuất người dùng
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          localStorage.removeItem("role");
          window.location.href = "/login";
        }
      } else {
        // Không có refreshToken -> Chuyển về login
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;