package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"edutech/payment-service/configs"
	"edutech/payment-service/models"
	"edutech/payment-service/services"
)

type PaymentController struct {
	VNPay *services.VNPayHelper
}

func NewPaymentController(vnp *services.VNPayHelper) *PaymentController {
	return &PaymentController{VNPay: vnp}
}

// 🎯 1. Tạo URL thanh toán VNPay
func (pc *PaymentController) CreateVNPayURL(c *gin.Context) {
	var req struct {
		UserID      uint    `json:"user_id" binding:"required"`
		UserName    string  `json:"user_name"`
		UserEmail   string  `json:"user_email"`
		UserAvatar  string  `json:"user_avatar"`
		CourseID    uint    `json:"course_id" binding:"required"`
		CourseTitle string  `json:"course_title" binding:"required"`
		Amount      float64 `json:"amount" binding:"required"`
		BankCode    string  `json:"bank_code"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu thanh toán không hợp lệ: " + err.Error()})
		return
	}

	txnRef := fmt.Sprintf("EDUPAY_%d_%d_%d", req.UserID, req.CourseID, time.Now().Unix())
	orderInfo := fmt.Sprintf("Thanh toan khoa hoc: %s", req.CourseTitle)

	clientIP := c.ClientIP()
	if clientIP == "" || clientIP == "::1" || clientIP == "127.0.0.1" {
		clientIP = "127.0.0.1"
	}

	tx := models.PaymentTransaction{
		TxnRef:      txnRef,
		UserID:      req.UserID,
		UserName:    req.UserName,
		UserEmail:   req.UserEmail,
		UserAvatar:  req.UserAvatar,
		CourseID:    req.CourseID,
		CourseTitle: req.CourseTitle,
		Amount:      req.Amount,
		BankCode:    req.BankCode,
		OrderInfo:   orderInfo,
		Status:      "PENDING",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := configs.DB.Create(&tx).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo phiên giao dịch: " + err.Error()})
		return
	}

	paymentURL := pc.VNPay.CreatePaymentURL(txnRef, req.Amount, orderInfo, clientIP)

	c.JSON(http.StatusOK, gin.H{
		"payment_url": paymentURL,
		"txn_ref":     txnRef,
	})
}

// 🎯 2. Xác thực Callback từ VNPay
func (pc *PaymentController) VNPayCallback(c *gin.Context) {
	var params map[string]string
	if err := c.ShouldBindJSON(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	urlParams := make(map[string][]string)
	for k, v := range params {
		urlParams[k] = []string{v}
	}

	isValid := pc.VNPay.VerifyReturn(urlParams)
	if !isValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Chữ ký bảo mật không hợp lệ (Invalid SecureHash)!"})
		return
	}

	txnRef := params["vnp_TxnRef"]
	responseCode := params["vnp_ResponseCode"]
	transactionNo := params["vnp_TransactionNo"]
	bankCode := params["vnp_BankCode"]

	var tx models.PaymentTransaction
	if err := configs.DB.Where("txn_ref = ?", txnRef).First(&tx).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy thông tin giao dịch"})
		return
	}

	if responseCode == "00" {
		tx.Status = "SUCCESS"
		tx.VnpTransactionNo = transactionNo
		tx.VnpResponseCode = responseCode
		tx.BankCode = bankCode
		tx.UpdatedAt = time.Now()
		configs.DB.Save(&tx)

		// Gọi Course Service để ghi danh
		go services.EnrollStudentToCourse(tx.CourseID, tx.UserID, tx.UserName, tx.UserEmail)

		c.JSON(http.StatusOK, gin.H{
			"message": "Thanh toán thành công!",
			"status":  "SUCCESS",
			"data":    tx,
		})
	} else {
		tx.Status = "FAILED"
		tx.VnpResponseCode = responseCode
		tx.UpdatedAt = time.Now()
		configs.DB.Save(&tx)

		c.JSON(http.StatusOK, gin.H{
			"message": "Giao dịch không thành công hoặc bị hủy.",
			"status":  "FAILED",
			"data":    tx,
		})
	}
}

// 🎯 3. Lấy toàn bộ lịch sử giao dịch (Admin)
func (pc *PaymentController) GetAllTransactions(c *gin.Context) {
	var list []models.PaymentTransaction
	configs.DB.Order("created_at desc").Find(&list)
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// 🎯 4. Lấy lịch sử giao dịch của 1 sinh viên
func (pc *PaymentController) GetStudentTransactions(c *gin.Context) {
	userID := c.Param("user_id")
	var list []models.PaymentTransaction
	configs.DB.Where("user_id = ?", userID).Order("created_at desc").Find(&list)
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// 🎯 5. Kiểm tra học sinh đã thanh toán chưa
func (pc *PaymentController) CheckStudentEnrollment(c *gin.Context) {
	userID := c.Param("user_id")
	courseID := c.Param("course_id")

	var tx models.PaymentTransaction
	err := configs.DB.Where("user_id = ? AND course_id = ? AND status = 'SUCCESS'", userID, courseID).First(&tx).Error
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"is_paid": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"is_paid": true, "data": tx})
}