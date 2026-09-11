FROM golang:alpine AS builder

WORKDIR /app

RUN apk add --no-cache git
RUN go install github.com/swaggo/swag/cmd/swag@latest

COPY . .

RUN go mod tidy
# Tự động tạo thư mục docs trước khi build
RUN swag init

RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main .
COPY --from=builder /app/.env .

EXPOSE 8002
CMD ["./main"]