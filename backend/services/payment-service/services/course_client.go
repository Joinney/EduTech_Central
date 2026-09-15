package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"
)

func EnrollStudentToCourse(courseID, studentID uint, name, email string) {
	courseServiceURL := os.Getenv("COURSE_SERVICE_URL")
	if courseServiceURL == "" {
		courseServiceURL = "http://course-service:8002/api/v1"
	}

	reqBody, _ := json.Marshal(map[string]interface{}{
		"student_id":    studentID,
		"student_name":  name,
		"student_email": email,
		"email":         email,
	})

	url := fmt.Sprintf("%s/courses/%d/join", courseServiceURL, courseID)
	log.Printf("🔄 [payment-service] Đang gửi yêu cầu ghi danh: %s với student_id=%d", url, studentID)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(url, "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		log.Printf("❌ [payment-service] Lỗi gọi ghi danh sang course-service: %v", err)
		return
	}
	defer resp.Body.Close()

	log.Printf("✅ [payment-service] Kết quả ghi danh từ course-service: HTTP Status %d", resp.StatusCode)
}