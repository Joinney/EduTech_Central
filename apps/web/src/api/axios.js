import axios from "axios";

// Biến cờ kiểm soát hàng đợi tránh xung đột gọi trùng lặp refresh token ngầm khi chạy concurrent requests (Promise.all)
let isRefreshing = false;
let refreshSubscribers = [];

// Đăng ký các request bị 401 chờ Token mới
const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

// Khi có Token mới: Thực thi lại toàn bộ request trong hàng đợi
const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(null, token));
  refreshSubscribers = [];
};

// Khi Refresh Token thất bại: Giải phóng hàng đợi và báo lỗi
const onRefreshFailed = (error) => {
  refreshSubscribers.forEach((cb) => cb(error, null));
  refreshSubscribers = [];
};

// Hàm khởi tạo Axios Instance linh hoạt
const createInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
  });

  // --- INTERCEPTOR REQUEST: Tự động đính kèm Token mới nhất ---
  instance.interceptors.request.use(
    (config) => {
      let token = localStorage.getItem("adminToken") || localStorage.getItem("token");

      if (token) {
        token = String(token).replace(/^"|"$/g, "").trim();
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (config.data && !(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // --- INTERCEPTOR RESPONSE: Tự động Refresh Token chống race-condition ---
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const currentPath = window.location.pathname;

      // 1. Không kích hoạt Refresh Token nếu đang truy cập các trang Đăng nhập
      if (currentPath.includes("/login") || currentPath.includes("/signin")) {
        return Promise.reject(error);
      }

      // 2. Xử lý khi nhận mã lỗi 401 (Unauthorized)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const localRefreshToken = localStorage.getItem("refreshToken");

        if (localRefreshToken) {
          if (!isRefreshing) {
            isRefreshing = true;

            const isLocalHost =
              window.location.hostname === "localhost" ||
              window.location.hostname === "127.0.0.1";

            const authUrl = isLocalHost
              ? import.meta.env.VITE_API_AUTH_URL || "http://localhost:5000/api/v1"
              : "https://api-gateway-vuyo.onrender.com/api/v1";

            axios
              .post(`${authUrl}/auth/refresh-token`, { refreshToken: localRefreshToken })
              .then((refreshResponse) => {
                isRefreshing = false;
                
                // Trích xuất Token linh hoạt theo nhiều định dạng Response
                const newToken =
                  refreshResponse.data?.data?.token ||
                  refreshResponse.data?.token ||
                  refreshResponse.data?.accessToken;

                if (localStorage.getItem("adminToken")) {
                  localStorage.setItem("adminToken", newToken);
                }
                localStorage.setItem("token", newToken);

                onRefreshed(newToken);
              })
              .catch((refreshError) => {
                isRefreshing = false;
                onRefreshFailed(refreshError);

                // Xóa dữ liệu phiên làm việc khi Refresh Token cũng bị hết hạn
                localStorage.removeItem("adminToken");
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");
                localStorage.removeItem("role");

                // Điều hướng về trang Login tương ứng theo Route hiện tại
                if (currentPath.startsWith("/admin")) {
                  window.location.href = "/admin/login";
                } else {
                  window.location.href = "/login";
                }
              });
          }

          // Đưa request hiện tại vào hàng đợi chờ Token mới
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh((err, token) => {
              if (err) {
                return reject(err);
              }
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(instance(originalRequest));
            });
          });
        } else {
          // Không có Refresh Token -> Đăng xuất lập tức
          localStorage.clear();
          if (currentPath.startsWith("/admin")) {
            window.location.href = "/admin/login";
          } else {
            window.location.href = "/login";
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// =========================================================================
// QUY TỤ TOÀN BỘ ENDPOINT VỀ GATEWAY (TỰ ĐỘNG PHÁT HIỆN MÔI TRƯỜNG)
// =========================================================================
const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const gateway = isLocal
  ? import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8001/api/v1"
  : "https://auth-service-m6zz.onrender.com/api/v1";

// 🟢 EXPORT CÁC INSTANCE THEO PHÂN HỆ
export const authApi = createInstance(gateway);
export const adminApi = createInstance(gateway);
export const courseApi = createInstance(gateway);
export const quizApi = createInstance(gateway);
export const studentApi = createInstance(gateway);
export const teacherApi = createInstance(gateway);
export const notificationApi = createInstance(gateway);

// Export mặc định cho toàn bộ ứng dụng
export default authApi;