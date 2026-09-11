package configs

import (
	"edutech/course-service/models"
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"


	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB
var AuthDB *gorm.DB

func InitDB() {
	host := getEnv("DB_HOST", "postgres")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "postgrespassword")
	courseDBName := getEnv("DB_NAME", "course_service")
	authDBName := getEnv("AUTH_DB_NAME", "auth_service")

	dsnCourse := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Ho_Chi_Minh",
		host, user, password, courseDBName, port)

	var err error
	for i := 1; i <= 10; i++ {
		DB, err = gorm.Open(postgres.Open(dsnCourse), &gorm.Config{})
		if err == nil {
			log.Println("✅ [course-service] Kết nối thành công đến database course_service!")
			break
		}
		time.Sleep(3 * time.Second)
	}
	if err != nil {
		log.Fatalf("❌ KHÔNG THỂ kết nối đến database course_service: %v", err)
	}

	dsnAuth := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Ho_Chi_Minh",
		host, user, password, authDBName, port)

	AuthDB, err = gorm.Open(postgres.Open(dsnAuth), &gorm.Config{})
	if err != nil {
		log.Printf("⚠️ Lỗi kết nối database auth_service: %v", err)
		AuthDB = DB
	} else {
		log.Println("✅ [course-service] Kết nối thành công đến database auth_service!")
	}

	DB.AutoMigrate(
		&models.CourseCategory{},
		&models.Course{},
		&models.Lesson{},
		&models.Assignment{},
		&models.Quiz{},
		&models.CourseStudent{},
		&models.Submission{},
		&models.AttendanceLog{},
		&models.LessonProgress{},
		&models.QuizSubmission{},
		&models.CourseDiscussion{},
		&models.TeacherSubject{},
		&models.CourseSchedule{},
		&models.SharedDocument{},
	)
	log.Println("✅ AutoMigrate toàn bộ bảng LCMS thành công!")

	seedTeacherSubjects()
}

func seedTeacherSubjects() {
	var count int64
	DB.Model(&models.TeacherSubject{}).Count(&count)
	if count == 0 {
		sampleSubjects := []models.TeacherSubject{
			{TeacherID: 1, TeacherName: "Phan Thuận", Subject: "Toán Học"},
			{TeacherID: 1, TeacherName: "Phan Thuận", Subject: "Tin Học"},
			{TeacherID: 1, TeacherName: "Phan Thuận", Subject: "Lập trình Web"},
			{TeacherID: 7, TeacherName: "Nguyễn Thị Huyền Diệu", Subject: "Tiếng Anh"},
			{TeacherID: 7, TeacherName: "Nguyễn Thị Huyền Diệu", Subject: "Ngữ Văn"},
			{TeacherID: 11, TeacherName: "Võ Duy Toàn", Subject: "Vật Lý"},
			{TeacherID: 11, TeacherName: "Võ Duy Toàn", Subject: "Hóa Học"},
			{TeacherID: 14, TeacherName: "Phan Thuận (GV)", Subject: "Toán Học"},
			{TeacherID: 14, TeacherName: "Phan Thuận (GV)", Subject: "Hóa Học"},
		}
		DB.Create(&sampleSubjects)
		log.Println("🌱 Khởi tạo dữ liệu teacher_subjects thành công!")
	}
}

func DeleteCloudinaryFile(fileURL string) {
	if fileURL == "" {
		return
	}
	parts := strings.Split(fileURL, "/upload/")
	if len(parts) < 2 {
		return
	}
	subParts := strings.Split(parts[1], "/")
	if len(subParts) < 2 {
		return
	}
	publicIDWithExt := strings.Join(subParts[1:], "/")
	publicID := publicIDWithExt
	resourceType := "raw"
	ext := strings.ToLower(filepath.Ext(fileURL))
	if ext == ".jpg" || ext == ".png" || ext == ".jpeg" || ext == ".webp" {
		resourceType = "image"
		publicID = strings.TrimSuffix(publicIDWithExt, filepath.Ext(publicIDWithExt))
	}

	apiSecret := getEnv("CLOUDINARY_API_SECRET", "nLVorN1p_FsHc3M3iQiuZs00xhc")
	apiKey := getEnv("CLOUDINARY_API_KEY", "434219145345683")
	cloudName := getEnv("CLOUDINARY_CLOUD_NAME", "z9ax76tw")

	timestamp := fmt.Sprintf("%d", time.Now().Unix())
	toSign := fmt.Sprintf("public_id=%s&timestamp=%s%s", publicID, timestamp, apiSecret)

	hash := sha1.New()
	hash.Write([]byte(toSign))
	signature := hex.EncodeToString(hash.Sum(nil))

	apiURL := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/%s/destroy", cloudName, resourceType)

	formData := url.Values{}
	formData.Set("public_id", publicID)
	formData.Set("timestamp", timestamp)
	formData.Set("api_key", apiKey)
	formData.Set("signature", signature)

	go func() {
		resp, err := http.PostForm(apiURL, formData)
		if err != nil {
			log.Printf("❌ Lỗi xóa file Cloudinary: %v", err)
			return
		}
		defer resp.Body.Close()
		log.Printf("🗑️ Đã xóa file Cloudinary [%s]: Status %d", publicID, resp.StatusCode)
	}()
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}