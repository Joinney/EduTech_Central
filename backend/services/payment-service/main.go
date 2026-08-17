package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var (
	db          *gorm.DB
	vnpayHelper *VNPayHelper
)

func initDB() {
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "aws-0-ap-southeast-1.pooler.supabase.com"
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres.ieqfabmuxoigwpiwvwmw"
	}
	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "edutech@2026"
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "payment_service"
	}

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Ho_Chi_Minh",
		dbHost, dbUser, dbPassword, dbName, dbPort)

	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("❌ Lỗi kết nối PostgreSQL (payment_service): %v", err)
	}

	// Tự động tạo bảng payments nếu chưa có
	err = db.AutoMigrate(&PaymentTransaction{})
	if err != nil {
		log.Printf("⚠️ AutoMigrate error: %v", err)
	}

	fmt.Println("💳 [payment-service] Kết nối thành công PostgreSQL Database (payment_service)!")
}

func main() {
	initDB()

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

	vnpayHelper = NewVNPayHelper(tmnCode, hashSecret, vnpURL, returnURL)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api/v1/payments")
	{
		api.POST("/create-vnpay-url", createVNPayURLHandler)
		api.POST("/vnpay-callback", vnpayCallbackHandler)
		api.GET("/transactions", getAllTransactionsHandler)
		api.GET("/my-transactions/:user_id", getStudentTransactionsHandler)
		api.GET("/check-enrollment/:user_id/:course_id", checkStudentEnrollmentHandler)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8004"
	}
	r.Run(":" + port)
}

// 🎯 1. API: Tạo URL thanh toán VNPay
func createVNPayURLHandler(c *gin.Context) {
	var req struct {
		UserID      uint    `json:"user_id" binding:"required"`
		UserName    string  `json:"user_name"`
		UserEmail   string  `json:"user_email"`
		CourseID    uint    `json:"course_id" binding:"required"`
		CourseTitle string  `json:"course_title" binding:"required"`
		Amount      float64 `json:"amount" binding:"required"`
		BankCode    string  `json:"bank_code"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu thanh toán không hợp lệ: " + err.Error()})
		return
	}

	// Tạo mã giao dịch duy nhất
	txnRef := fmt.Sprintf("EDUPAY_%d_%d_%d", req.UserID, req.CourseID, time.Now().Unix())
	orderInfo := fmt.Sprintf("Thanh toan khoa hoc: %s", req.CourseTitle)

	clientIP := c.ClientIP()
	if clientIP == "::1" || clientIP == "127.0.0.1" {
		clientIP = "13.160.92.202" // IP public hợp lệ cho VNPay Sandbox
	}

	// Lưu giao dịch trạng thái PENDING
	tx := PaymentTransaction{
		TxnRef:      txnRef,
		UserID:      req.UserID,
		UserName:    req.UserName,
		UserEmail:   req.UserEmail,
		CourseID:    req.CourseID,
		CourseTitle: req.CourseTitle,
		Amount:      req.Amount,
		BankCode:    req.BankCode,
		OrderInfo:   orderInfo,
		Status:      "PENDING",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := db.Create(&tx).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo phiên giao dịch: " + err.Error()})
		return
	}

	paymentURL := vnpayHelper.CreatePaymentURL(txnRef, req.Amount, orderInfo, clientIP)
	log.Printf("🔗 [VNPay] Generated URL (TMN: %s): %s", vnpayHelper.TmnCode, paymentURL)

	c.JSON(http.StatusOK, gin.H{
		"payment_url": paymentURL,
		"txn_ref":     txnRef,
	})
}

// 🎯 2. API: Xác thực kết quả VNPay và tự động ghi danh vào lớp
func vnpayCallbackHandler(c *gin.Context) {
	var params map[string]string
	if err := c.ShouldBindJSON(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	urlParams := make(map[string][]string)
	for k, v := range params {
		urlParams[k] = []string{v}
	}

	isValid := vnpayHelper.VerifyReturn(urlParams)
	if !isValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Chữ ký bảo mật không hợp lệ (Invalid SecureHash)!"})
		return
	}

	txnRef := params["vnp_TxnRef"]
	responseCode := params["vnp_ResponseCode"]
	transactionNo := params["vnp_TransactionNo"]
	bankCode := params["vnp_BankCode"]

	var tx PaymentTransaction
	if err := db.Where("txn_ref = ?", txnRef).First(&tx).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy thông tin giao dịch"})
		return
	}

	if responseCode == "00" {
		tx.Status = "SUCCESS"
		tx.VnpTransactionNo = transactionNo
		tx.VnpResponseCode = responseCode
		tx.BankCode = bankCode
		tx.UpdatedAt = time.Now()
		db.Save(&tx)

		// 🚀 Gọi Course Service để tự động ghi danh học sinh vào lớp học
		go enrollStudentToCourse(tx.CourseID, tx.UserID, tx.UserName, tx.UserEmail)

		c.JSON(http.StatusOK, gin.H{
			"message": "Thanh toán thành công!",
			"status":  "SUCCESS",
			"data":    tx,
		})
	} else {
		tx.Status = "FAILED"
		tx.VnpResponseCode = responseCode
		tx.UpdatedAt = time.Now()
		db.Save(&tx)

		c.JSON(http.StatusOK, gin.H{
			"message": "Giao dịch không thành công hoặc bị hủy.",
			"status":  "FAILED",
			"data":    tx,
		})
	}
}

// Gọi REST sang course-service để ghi danh
func enrollStudentToCourse(courseID, studentID uint, name, email string) {
	courseServiceURL := os.Getenv("COURSE_SERVICE_URL")
	if courseServiceURL == "" {
		courseServiceURL = "http://course-service:8002/api/v1"
	}

	reqBody, _ := json.Marshal(map[string]interface{}{
		"student_id":   studentID,
		"student_name": name,
		"email":        email,
	})

	url := fmt.Sprintf("%s/courses/%d/join", courseServiceURL, courseID)
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		log.Printf("⚠️ Lỗi gọi ghi danh sang course-service: %v", err)
		return
	}
	defer resp.Body.Close()
}

// 🎯 3. API: Lấy toàn bộ lịch sử thanh toán (Admin)
func getAllTransactionsHandler(c *gin.Context) {
	var list []PaymentTransaction
	db.Order("created_at desc").Find(&list)
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// 🎯 4. API: Lấy lịch sử thanh toán của 1 sinh viên
func getStudentTransactionsHandler(c *gin.Context) {
	userID := c.Param("user_id")
	var list []PaymentTransaction
	db.Where("user_id = ?", userID).Order("created_at desc").Find(&list)
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// 🎯 5. API: Kiểm tra sinh viên đã thanh toán khóa học hay chưa
func checkStudentEnrollmentHandler(c *gin.Context) {
	userID := c.Param("user_id")
	courseID := c.Param("course_id")

	var tx PaymentTransaction
	err := db.Where("user_id = ? AND course_id = ? AND status = 'SUCCESS'", userID, courseID).First(&tx).Error
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"is_paid": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"is_paid": true, "data": tx})
}