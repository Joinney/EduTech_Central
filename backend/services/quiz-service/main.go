package main

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"

	"quiz-service/configs"
	"quiz-service/middlewares"
	"quiz-service/routes"
)

const landingHTML = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>EduTech Quiz Service</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .card {
      background: #fff;
      border: 1px solid #fed7aa;
      border-radius: 24px;
      padding: 56px 48px;
      text-align: center;
      max-width: 580px;
      box-shadow: 0 10px 30px rgba(251, 146, 60, 0.08);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 14px;
      border-radius: 999px;
      background: #ffedd5;
      color: #ea580c;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 24px;
    }
    .dot {
      width: 7px;
      height: 7px;
      background: #ea580c;
      border-radius: 50%;
    }
    h1 {
      color: #ea580c;
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 16px;
    }
    p {
      color: #4b5563;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 32px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(234, 88, 12, 0.45);
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">
      <span class="dot"></span> MICROSERVICE ONLINE
    </div>
    <h1>EduTech Quiz Service</h1>
    <p>Hệ thống trắc nghiệm, quản lý đề thi & giám sát phiên thi trực tuyến! 🚀</p>
    <a href="/docs" class="btn">Vào Swagger xem API &rarr;</a>
  </div>
</body>
</html>`

func main() {
	configs.InitMongoDB()

	r := gin.Default()
	r.Use(middlewares.CORSMiddleware())

	// Landing Page trang chủ
	r.GET("/", func(c *gin.Context) {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(landingHTML))
	})

	// Đăng ký toàn bộ Quiz APIs + Swagger UI
	routes.RegisterQuizRoutes(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8003"
	}
	r.Run(":" + port)
}