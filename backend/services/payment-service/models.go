package main

import (
	"time"
)

type PaymentTransaction struct {
	ID             uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	TxnRef         string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"txn_ref"` // Mã giao dịch VNPay
	UserID         uint      `gorm:"not null;index" json:"user_id"`
	UserName       string    `gorm:"type:varchar(255)" json:"user_name"`
	UserEmail      string    `gorm:"type:varchar(255)" json:"user_email"`
	CourseID       uint      `gorm:"not null;index" json:"course_id"`
	CourseTitle    string    `gorm:"type:varchar(255)" json:"course_title"`
	Amount         float64   `gorm:"type:numeric(15,2);not null" json:"amount"`
	BankCode       string    `gorm:"type:varchar(50)" json:"bank_code"`
	OrderInfo      string    `gorm:"type:text" json:"order_info"`
	Status         string    `gorm:"type:varchar(50);default:'PENDING'" json:"status"` // PENDING, SUCCESS, FAILED
	VnpTransactionNo string  `gorm:"type:varchar(100)" json:"vnp_transaction_no"`
	VnpResponseCode  string  `gorm:"type:varchar(20)" json:"vnp_response_code"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}