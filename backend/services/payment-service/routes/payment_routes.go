package routes

import (
	"github.com/gin-gonic/gin"
	"edutech/payment-service/controllers"
)

func RegisterPaymentRoutes(r *gin.Engine, pc *controllers.PaymentController) {
	api := r.Group("/api/v1/payments")
	{
		api.POST("/create-vnpay-url", pc.CreateVNPayURL)
		api.POST("/vnpay-callback", pc.VNPayCallback)
		api.GET("/transactions", pc.GetAllTransactions)
		api.GET("/my-transactions/:user_id", pc.GetStudentTransactions)
		api.GET("/check-enrollment/:user_id/:course_id", pc.CheckStudentEnrollment)
	}
}