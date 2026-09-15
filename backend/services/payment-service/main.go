package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"edutech/payment-service/configs"
	"edutech/payment-service/controllers"
	"edutech/payment-service/models"
	"edutech/payment-service/routes"
	"edutech/payment-service/services"
)

func main() {
	// 1. Kết nối Database PostgreSQL
	configs.InitDB()

	// 2. Tự động Migrate bảng
	if err := configs.DB.AutoMigrate(&models.PaymentTransaction{}); err != nil {
		log.Printf("⚠️ AutoMigrate error: %v", err)
	}

	// 3. Khởi tạo VNPay Helper
	tmnCode := os.Getenv("VNP_TMN_CODE")
	if tmnCode == "" {
		tmnCode = "2QXUIISW"
	}
	hashSecret := os.Getenv("VNP_HASH_SECRET")
	if hashSecret == "" {
		hashSecret = "9O6E27MXV4LCOZJWQ4M9RFEZ9C1QW2L4"
	}
	vnpURL := os.Getenv("VNP_URL")
	if vnpURL == "" {
		vnpURL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
	}
	returnURL := os.Getenv("VNP_RETURN_URL")
	if returnURL == "" {
		returnURL = "http://localhost:5173/student/payment-result"
	}

	vnpayHelper := services.NewVNPayHelper(tmnCode, hashSecret, vnpURL, returnURL)

	// 4. Khởi tạo Gin & CORS
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 5. Đăng ký controller & routes
	paymentController := controllers.NewPaymentController(vnpayHelper)
	routes.RegisterPaymentRoutes(r, paymentController)

	// 6. Lắng nghe Port
	port := os.Getenv("PORT")
	if port == "" {
		port = "8004"
	}
	r.Run(":" + port)
}