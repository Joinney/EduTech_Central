# EduTech Central - Nền Tảng Học Tập Trực Tuyến Đa Dịch Vụ

<p align="center">
  <img src="./screenshots/banner.jpg" alt="EduTech Central Banner" width="100%">
</p>

> Nền tảng giáo dục trực tuyến toàn diện được xây dựng theo kiến trúc **Microservices** và quản lý mã nguồn **Monorepo**. Hệ thống tích hợp **Frontend React (Vite)**, **Backend Node.js**, cơ sở dữ liệu **PostgreSQL (Prisma ORM)** cùng hệ sinh thái **Trợ lý AI (DeepSeek, Qwen)** giúp tối ưu hóa trải nghiệm dạy và học.

---

## 🔗 Liên Kết & Tài Liệu
* **Website Demo (Live):** [https://edutech-central.onrender.com](https://edutech-central.onrender.com)
* **API Documentation (Swagger):** `http://localhost:8000/api-docs`

---

## 🛠 Công Nghệ Sử Dụng (Tech Stack)

### Frontend (Web App)
* **Core:** React.js, Vite, JavaScript
* **UI/UX & Styling:** Tailwind CSS, Responsive Design
* **State Management & Fetching:** Axios, React Router

### Backend & Microservices
* **Core:** Node.js, Express.js
* **Database & ORM:** PostgreSQL, Prisma ORM
* **Kiến trúc (Architecture):** Microservices Pattern 
* **Tích hợp bên thứ ba:** 
  * Cổng thanh toán **VNPay Sandbox**
  * Lớp học trực tuyến **Google Meet API**

### AI Service (Trợ lý học tập)
* Tích hợp đa mô hình LLM & Vision AI (DeepSeek, GLM, Qwen).
* Hỗ trợ giải đáp thắc mắc tự động, tóm tắt bài giảng và tự động hóa chấm thi.

### DevOps & Quản lý mã nguồn
* **Monorepo Manager:** `pnpm-workspace`
* **Containerization:** Docker, Docker Compose
* **Web Server:** NGINX

---

## 📸 Giao Diện Hệ Thống (Screenshots)

| Giao diện Học viên (Tìm kiếm & Khóa học) | Giao diện Quản trị viên (Dashboard & Kiểm duyệt) |
| :---: | :---: |
| ![Student View](./screenshots/student.png) | ![Admin View](./screenshots/admin.png) |

---

## 🔑 Tính Năng Nổi Bật & Phân Quyền (Roles & Permissions)

### Học viên (Student)
* **Tìm kiếm & Bộ lọc thông minh:** Tìm kiếm khóa học, tài liệu PDF, Video nhanh chóng theo danh mục, chuyên ngành, giá tiền.
* **Tương tác nội dung:** Đọc tài liệu bảo mật (chặn tải xuống tùy quyền), xem video khóa học.
* **Thanh toán tự động:** Đăng ký và thanh toán khóa học an toàn qua VNPay.
* **Trợ lý AI:** Đặt câu hỏi trực tiếp cho AI trong quá trình học để được giải đáp 24/7.

### Giảng viên (Teacher)
* **Quản lý học liệu:** Upload đa dạng định dạng file (PDF, Video MP4, Slide PPTX) lên hệ thống lưu trữ.
* **Thiết kế bài giảng:** Lên cấu trúc bài học, tạo phòng học trực tuyến qua Google Meet.

### Quản trị viên (Admin)
* **Kiểm duyệt nội dung:** Phê duyệt, yêu cầu chỉnh sửa hoặc từ chối các khóa học/tài liệu từ giảng viên.
* **Quản lý toàn diện:** Theo dõi lưu lượng truy cập, quản lý tài khoản người dùng và đối soát lịch sử giao dịch thanh toán.

---

## 📂 Cấu Trúc Dự Án (Monorepo Workspace)

Dự án được tổ chức chặt chẽ theo mô hình Monorepo sử dụng `pnpm-workspace`, phân tách rõ ràng giữa Frontend và Backend. Dưới đây là cấu trúc chi tiết:

```text
EduTech_Central/
├── apps/
│   └── web/                        # Ứng dụng Web Frontend (React + Vite)
│       ├── public/                 # Tài nguyên tĩnh (ảnh, icon...)
│       ├── src/                    # Mã nguồn chính của giao diện
│       │   ├── admindb/            # Phân hệ giao diện dành cho Quản trị viên
│       │   ├── api/                # Cấu hình gọi API (Axios/Fetch) tới Backend
│       │   ├── components/         # Các UI component dùng chung (Tái sử dụng)
│       │   ├── pages/              # Các trang giao diện chung (Home, About...)
│       │   ├── userdb/             # Phân hệ giao diện dành cho Học viên/Giảng viên
│       │   ├── App.jsx             # File Component gốc, cấu hình Routing
│       │   ├── globals.css         # Cấu hình CSS toàn cục & Tailwind base
│       │   └── main.jsx            # Điểm khởi chạy của ứng dụng React
│       ├── Dockerfile              # Kịch bản build Docker cho Frontend
│       ├── nginx.conf              # Cấu hình web server Nginx
│       ├── tailwind.config.js      # Cấu hình bộ khung Tailwind CSS
│       ├── vite.config.js          # Cấu hình trình biên dịch Vite
│       └── package.json            # Quản lý dependencies của Frontend
│
├── backend/
│   └── services/                   # Cụm Backend Microservices
│       ├── ai-service/             # Xử lý tương tác LLM Chatbot & Chấm bài tự động
│       ├── api-gateway/            # Cổng định tuyến API (Tiếp nhận mọi Request)
│       ├── auth-service/           # Dịch vụ Xác thực & Quản lý phiên đăng nhập
│       ├── course-service/         # Dịch vụ Quản lý khóa học, bài giảng, file số
│       ├── enrollment-service/     # Dịch vụ Quản lý ghi danh khóa học
│       ├── notification-service/   # Dịch vụ Gửi thông báo (Email/Push)
│       ├── payment-service/        # Dịch vụ Tích hợp thanh toán VNPay
│       ├── quiz-service/           # Dịch vụ Quản lý ngân hàng câu hỏi & Thi trắc nghiệm
│       └── user-service/           # Dịch vụ Quản lý hồ sơ người dùng (Profiles)
│
├── docker-compose.yml              # Khởi chạy toàn bộ hạ tầng (DB, Services, Web) bằng 1 lệnh
├── package.json                    # Cấu hình dependencies gốc cho toàn workspace
├── pnpm-workspace.yaml             # Khai báo không gian làm việc Monorepo
├── prisma.config.ts                # Cấu hình kết nối ORM trung tâm với PostgreSQL
└── README.md                       # Tài liệu dự án
