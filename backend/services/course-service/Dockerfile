FROM golang:alpine AS builder

WORKDIR /app

RUN apk add --no-cache git
RUN go install github.com/swaggo/swag/cmd/swag@latest

# Copy toàn bộ source code vào
COPY . .

RUN go mod tidy
# Tự động tạo thư mục docs trước khi build
RUN swag init

RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# --- STAGE 2: Chạy ứng dụng ---
FROM alpine:latest
WORKDIR /root/

# Chỉ copy file thực thi (main) từ stage builder
COPY --from=builder /app/main .
# 🎯 ĐÃ XÓA LỆNH COPY .env Ở ĐÂY (Để bảo mật và fix lỗi)

EXPOSE 8002
CMD ["./main"]