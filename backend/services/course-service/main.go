package main

import (
	"net/http"
	"os"

	"edutech/course-service/configs"
	_ "edutech/course-service/docs"
	"edutech/course-service/routes"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           EduTech Central - Course Service API
// @version         1.0
// @description     Hệ thống API quản lý khóa học, bài học, bài tập, đề thi và danh mục học tập của EduTech Central.
// @host            localhost:8002
// @BasePath        /api/v1
// @schemes         http https

func main() {
	configs.InitDB()

	r := gin.Default()

	// Cấu hình CORS
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		} else {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		}
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// 🎯 TRANG CHỦ LANDING STATUS (Tông cam EduTech Central)
	r.GET("/", func(c *gin.Context) {
		htmlContent := `
		<!DOCTYPE html>
		<html lang="vi">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>EduTech Central - Course Service</title>
			<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
			<style>
				* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
				body {
					min-height: 100vh;
					display: flex;
					align-items: center;
					justify-content: center;
					background: #f8fafc;
					padding: 24px;
				}
				.card {
					background: #ffffff;
					border: 1px solid #fed7aa;
					border-radius: 28px;
					padding: 56px 40px;
					max-width: 600px;
					width: 100%;
					text-align: center;
					box-shadow: 0 20px 40px -15px rgba(234, 88, 12, 0.08);
				}
				.badge {
					display: inline-flex;
					align-items: center;
					gap: 6px;
					background: #fff7ed;
					border: 1px solid #ffedd5;
					color: #ea580c;
					padding: 6px 14px;
					border-radius: 9999px;
					font-size: 12px;
					font-weight: 800;
					text-transform: uppercase;
					letter-spacing: 0.5px;
					margin-bottom: 20px;
				}
				.badge-dot {
					width: 8px;
					height: 8px;
					background: #ea580c;
					border-radius: 50%;
					box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.2);
				}
				h1 {
					font-size: 30px;
					font-weight: 800;
					color: #ea580c;
					margin-bottom: 12px;
					letter-spacing: -0.5px;
				}
				p {
					font-size: 15px;
					font-weight: 600;
					color: #64748b;
					margin-bottom: 32px;
				}
				.btn {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					gap: 8px;
					background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
					color: #ffffff;
					font-size: 14px;
					font-weight: 800;
					padding: 14px 28px;
					border-radius: 14px;
					text-decoration: none;
					box-shadow: 0 10px 20px -5px rgba(234, 88, 12, 0.4);
					transition: all 0.2s ease;
				}
				.btn:hover {
					transform: translateY(-2px);
					box-shadow: 0 14px 24px -5px rgba(234, 88, 12, 0.5);
					background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
				}
			</style>
		</head>
		<body>
			<div class="card">
				<div class="badge">
					<span class="badge-dot"></span>
					<span>Microservice Online</span>
				</div>
				<h1>EduTech Central Course Service</h1>
				<p>Hệ thống quản lý khóa học & đào tạo đang hoạt động mượt mà! 🚀</p>
				<a href="/api-docs/index.html" class="btn">Vào Swagger xem API &rarr;</a>
			</div>
		</body>
		</html>
		`
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(htmlContent))
	})

	// 🎯 ROUTE SWAGGER GỐC (Dùng WrapHandler chuẩn, tương thích 100% mọi phiên bản)
	r.GET("/api-docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Đăng ký các route API nghiệp vụ
	routes.SetupRoutes(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8002"
	}
	r.Run(":" + port)
}