FROM node:20-alpine

WORKDIR /app

# Cài đặt OpenSSL cho Prisma Client hoạt động trên Alpine Linux
RUN apk add --no-cache openssl

# Copy file định nghĩa dependency
COPY backend/services/auth-service/package*.json ./

# Cài đặt các gói npm
RUN npm install

# Copy mã nguồn dịch vụ
COPY backend/services/auth-service/ ./

# Sinh mã Prisma Client
RUN npx prisma generate

# Mở cổng dịch vụ
EXPOSE 8001

# 🟢 TRỌNG TÂM: Sử dụng npm start (node server.js) thay vì dev (nodemon)
CMD ["npm", "start"]