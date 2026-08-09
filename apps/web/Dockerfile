# ==========================================
# STAGE 1: Build ứng dụng React / Vite
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app/apps/web

# 1. Copy file định nghĩa thư viện trước để tối ưu Docker Layer Cache
COPY apps/web/package.json apps/web/package-lock.json* ./

# 2. Cài đặt toàn bộ dependencies (bao gồm cả devDependencies phục vụ Vite/Tailwind build)
RUN npm install

# 3. Copy toàn bộ mã nguồn của apps/web vào container
COPY apps/web/ ./

# 4. Thực hiện biên dịch ứng dụng thành các file tĩnh (dist)
RUN npm run build

# ==========================================
# STAGE 2: Nginx Web Server (Phục vụ Production)
# ==========================================
FROM nginx:alpine AS runner

# Xóa trang mặc định của Nginx và file cấu hình cũ
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy file cấu hình Nginx tùy chỉnh của dự án
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copy các file build tĩnh từ STAGE 1 sang thư mục Nginx
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Mở cổng 5173 (khớp với file nginx.conf của bạn)
EXPOSE 5173

# Khởi chạy Nginx ở chế độ foreground
CMD ["nginx", "-g", "daemon off;"]