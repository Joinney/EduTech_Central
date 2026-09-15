package configs

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
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
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("❌ Lỗi kết nối PostgreSQL (payment_service): %v", err)
	}

	fmt.Println("💳 [payment-service] Kết nối thành công PostgreSQL Database (payment_service)!")
}