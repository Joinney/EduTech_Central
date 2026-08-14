package main

import (
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Cấu hình Cloudinary chuyên dùng cho File Document
const (
	CloudinaryCloudName = "j3iibkjc"
	CloudinaryAPIKey    = "923999593653689"
	CloudinaryAPISecret = "7dnI1NUEFe_x-xl3Q4jHzqdmnfE"
)

type Course struct {
	ID            uint         `gorm:"primaryKey" json:"id"`
	TeacherID     uint         `json:"teacher_id"`
	TeacherName   string       `gorm:"size:255" json:"teacher_name"`
	Type          string       `gorm:"size:50;default:'school'" json:"type"`
	Title         string       `gorm:"size:255;not null" json:"title"`
	Code          string       `gorm:"size:50;unique;not null" json:"code"`
	Subject       string       `gorm:"size:100;not null" json:"subject"`
	SchoolName    string       `gorm:"size:255;not null" json:"schoolName"`
	Grade         string       `gorm:"size:50" json:"grade"`
	MaxStudents   int          `gorm:"default:30" json:"maxStudents"`
	StudentsCount int          `gorm:"default:0" json:"studentsCount"`
	Schedule      string       `gorm:"size:255" json:"schedule"`
	Thumbnail     string       `gorm:"type:text" json:"thumbnail"`
	Description   string       `gorm:"type:text" json:"description"`
	MeetTitle     string       `gorm:"size:255" json:"meetTitle"`
	MeetLink      string       `gorm:"type:text" json:"meetLink"`
	MeetStartTime string       `gorm:"size:100" json:"meetStartTime"`
	MeetIsActive  bool         `gorm:"default:false" json:"meetIsActive"`
	Lessons       []Lesson     `gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE" json:"lessons"`
	Assignments   []Assignment `gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE" json:"assignments"`
	Quizzes       []Quiz       `gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE" json:"quizzes"`
	CreatedAt     time.Time    `json:"createdAt"`
	UpdatedAt     time.Time    `json:"updatedAt"`
}

type Lesson struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CourseID  uint      `json:"courseId"`
	Title     string    `gorm:"size:255;not null" json:"title"`
	Duration  string    `gorm:"size:50" json:"duration"`
	Content   string    `gorm:"type:text" json:"content"`
	FileURL   string    `gorm:"type:text" json:"fileUrl"`
	FileName  string    `gorm:"size:255" json:"fileName"`
	IsVisible bool      `gorm:"default:true" json:"isVisible"`
	CreatedAt time.Time `json:"createdAt"`
}

type Assignment struct {
	ID             uint         `gorm:"primaryKey" json:"id"`
	CourseID       uint         `json:"courseId"`
	Title          string       `gorm:"size:255;not null" json:"title"`
	DueDate        string       `gorm:"size:50" json:"dueDate"`
	MaxScore       int          `gorm:"default:10" json:"maxScore"`
	SubmittedCount int          `gorm:"default:0" json:"submittedCount"`
	Description    string       `gorm:"type:text" json:"description"`
	FileURL        string       `gorm:"type:text" json:"fileUrl"`
	FileName       string       `gorm:"size:255" json:"fileName"`
	IsVisible      bool         `gorm:"default:true" json:"isVisible"`
	Submissions    []Submission `gorm:"foreignKey:AssignmentID;constraint:OnDelete:CASCADE" json:"submissions"`
	CreatedAt      time.Time    `json:"createdAt"`
}

type Quiz struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	CourseID       uint      `json:"courseId"`
	Title          string    `gorm:"size:255;not null" json:"title"`
	Duration       string    `gorm:"size:50" json:"duration"`
	TotalQuestions int       `gorm:"default:10" json:"totalQuestions"`
	PassScore      int       `gorm:"default:5" json:"passScore"`
	Description    string    `gorm:"type:text" json:"description"`
	FileURL        string    `gorm:"type:text" json:"fileUrl"`
	FileName       string    `gorm:"size:255" json:"fileName"`
	IsVisible      bool      `gorm:"default:true" json:"isVisible"`
	CreatedAt      time.Time `json:"createdAt"`
}

type Submission struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	AssignmentID uint      `json:"assignment_id"`
	StudentID    uint      `json:"student_id"`
	StudentName  string    `json:"student_name"`
	FileURL      string    `gorm:"type:text;not null" json:"fileUrl"`
	FileName     string    `gorm:"size:255" json:"fileName"`
	Score        float64   `gorm:"default:-1" json:"score"`
	CreatedAt    time.Time `json:"created_at"`
}

type CourseStudent struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	CourseID     uint      `json:"course_id"`
	StudentID    uint      `json:"student_id"`
	StudentName  string    `json:"student_name"`
	StudentEmail string    `json:"student_email"`
	AvatarURL    string    `json:"avatar_url"`
	CreatedAt    time.Time `json:"created_at"`
}

var db *gorm.DB

func initDB() {
	host := os.Getenv("DB_HOST")
	if host == "" { host = "postgres" }
	port := os.Getenv("DB_PORT")
	if port == "" { port = "5432" }
	user := os.Getenv("DB_USER")
	if user == "" { user = "postgres" }
	password := os.Getenv("DB_PASSWORD")
	if password == "" { password = "postgrespassword" }
	dbname := os.Getenv("DB_NAME")
	if dbname == "" { dbname = "auth_service" }

	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Ho_Chi_Minh",
		host, user, password, dbname, port)

	var err error
	for i := 1; i <= 10; i++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			log.Println("✅ Đã kết nối thành công đến PostgreSQL!")
			break
		}
		time.Sleep(3 * time.Second)
	}

	if err != nil {
		log.Fatalf("❌ KHÔNG THỂ kết nối đến Postgres DB sau 10 lần thử: %v", err)
	}

	db.AutoMigrate(&Course{}, &Lesson{}, &Assignment{}, &Quiz{}, &CourseStudent{}, &Submission{})
	log.Println("✅ AutoMigrate các bảng thành công!")
}

// Hàm xóa file vật lý trên Cloudinary bằng REST API
func deleteCloudinaryFile(fileURL string) {
	if fileURL == "" {
		return
	}

	// Trích xuất public_id từ fileURL (VD: .../upload/v123456/sample.pdf -> sample.pdf)
	parts := strings.Split(fileURL, "/upload/")
	if len(parts) < 2 {
		return
	}
	subParts := strings.Split(parts[1], "/")
	if len(subParts) < 2 {
		return
	}
	// Bỏ phần version (v123456)
	publicIDWithExt := strings.Join(subParts[1:], "/")
	// Lấy publicID
	publicID := publicIDWithExt
	// Nếu là resource_type image thì bỏ ext, raw thì giữ nguyên ext
	resourceType := "raw"
	ext := strings.ToLower(filepath.Ext(fileURL))
	if ext == ".jpg" || ext == ".png" || ext == ".jpeg" || ext == ".webp" {
		resourceType = "image"
		publicID = strings.TrimSuffix(publicIDWithExt, filepath.Ext(publicIDWithExt))
	}

	timestamp := fmt.Sprintf("%d", time.Now().Unix())
	toSign := fmt.Sprintf("public_id=%s&timestamp=%s%s", publicID, timestamp, CloudinaryAPISecret)
	
	hash := sha1.New()
	hash.Write([]byte(toSign))
	signature := hex.EncodeToString(hash.Sum(nil))

	apiURL := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/%s/destroy", CloudinaryCloudName, resourceType)

	formData := url.Values{}
	formData.Set("public_id", publicID)
	formData.Set("timestamp", timestamp)
	formData.Set("api_key", CloudinaryAPIKey)
	formData.Set("signature", signature)

	go func() {
		resp, err := http.PostForm(apiURL, formData)
		if err != nil {
			log.Printf("❌ Lỗi xóa file Cloudinary: %v", err)
			return
		}
		defer resp.Body.Close()
		log.Printf("🗑️ Đã kích hoạt xóa file Cloudinary [%s]: Status %d", publicID, resp.StatusCode)
	}()
}

func main() {
	initDB()

	r := gin.Default()

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

	api := r.Group("/api/v1")
	{
		api.GET("/courses", getCourses)
		api.POST("/courses", createCourse)
		api.GET("/courses/:id", getCourseByID)
		api.DELETE("/courses/:id", deleteCourse)
		api.PATCH("/courses/:id/meet", updateCourseMeet)

		api.GET("/courses/:id/lessons", getLessons)
		api.POST("/courses/:id/lessons", createLesson)
		api.PUT("/lessons/:id", updateLesson)
		api.DELETE("/lessons/:id", deleteLesson) 

		api.GET("/courses/:id/assignments", getAssignments)
		api.POST("/courses/:id/assignments", createAssignment)
		api.PUT("/assignments/:id", updateAssignment)
		api.DELETE("/assignments/:id", deleteAssignment) 

		api.GET("/courses/:id/quizzes", getQuizzes)
		api.POST("/courses/:id/quizzes", createQuiz)
		api.PUT("/quizzes/:id", updateQuiz)
		api.DELETE("/quizzes/:id", deleteQuiz)

		api.POST("/assignments/:id/submit", submitAssignment)
		api.GET("/assignments/:id/submissions", getSubmissions)

		api.POST("/courses/:id/join", joinCourse)
		api.GET("/courses/:id/students", getCourseStudents)
		api.GET("/students/:student_id/courses", getStudentJoinedCourses)
	}

	port := os.Getenv("PORT")
	if port == "" { port = "8002" }
	r.Run(":" + port)
}

func getCourses(c *gin.Context) {
	var courses []Course
	teacherID := c.Query("teacher_id")
	query := db.Preload("Lessons").Preload("Assignments").Preload("Quizzes").Order("created_at desc")
	if teacherID != "" {
		query = query.Where("teacher_id = ?", teacherID)
	}
	query.Find(&courses)
	c.JSON(http.StatusOK, courses)
}

func createCourse(c *gin.Context) {
	var course Course
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if course.Code == "" {
		course.Code = fmt.Sprintf("CLASS-%d", time.Now().Unix()%10000)
	}
	db.Create(&course)
	c.JSON(http.StatusCreated, course)
}

func getCourseByID(c *gin.Context) {
	id := c.Param("id")
	var course Course
	if err := db.Preload("Lessons").Preload("Assignments").Preload("Quizzes").First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy lớp học"})
		return
	}
	c.JSON(http.StatusOK, course)
}

func deleteCourse(c *gin.Context) {
	id := c.Param("id")
	var course Course
	if err := db.Preload("Lessons").Preload("Assignments").Preload("Quizzes").First(&course, id).Error; err == nil {
		for _, l := range course.Lessons { deleteCloudinaryFile(l.FileURL) }
		for _, a := range course.Assignments { deleteCloudinaryFile(a.FileURL) }
		for _, q := range course.Quizzes { deleteCloudinaryFile(q.FileURL) }
	}
	db.Delete(&Course{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Xóa lớp học thành công"})
}

func updateCourseMeet(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		MeetTitle     string `json:"meetTitle"`
		MeetLink      string `json:"meetLink"`
		MeetStartTime string `json:"meetStartTime"`
		MeetIsActive  bool   `json:"meetIsActive"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.Model(&Course{}).Where("id = ?", id).Updates(map[string]interface{}{
		"meet_title":      req.MeetTitle,
		"meet_link":       req.MeetLink,
		"meet_start_time": req.MeetStartTime,
		"meet_is_active":  req.MeetIsActive,
	})
	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật phòng Meet thành công"})
}

func getLessons(c *gin.Context) {
	courseID := c.Param("id")
	var lessons []Lesson
	db.Where("course_id = ?", courseID).Find(&lessons)
	c.JSON(http.StatusOK, lessons)
}

func createLesson(c *gin.Context) {
	courseID, _ := strconv.Atoi(c.Param("id"))
	var lesson Lesson
	if err := c.ShouldBindJSON(&lesson); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	lesson.CourseID = uint(courseID)
	db.Create(&lesson)
	c.JSON(http.StatusCreated, lesson)
}

func deleteLesson(c *gin.Context) {
	id := c.Param("id")
	var lesson Lesson
	if err := db.First(&lesson, id).Error; err == nil {
		deleteCloudinaryFile(lesson.FileURL)
		db.Delete(&lesson)
	}
	c.JSON(http.StatusOK, gin.H{"message": "Xóa bài học thành công"})
}

func getAssignments(c *gin.Context) {
	courseID := c.Param("id")
	var assignments []Assignment
	db.Where("course_id = ?", courseID).Find(&assignments)
	c.JSON(http.StatusOK, assignments)
}

func createAssignment(c *gin.Context) {
	courseID, _ := strconv.Atoi(c.Param("id"))
	var assignment Assignment
	if err := c.ShouldBindJSON(&assignment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	assignment.CourseID = uint(courseID)
	db.Create(&assignment)
	c.JSON(http.StatusCreated, assignment)
}

func deleteAssignment(c *gin.Context) {
	id := c.Param("id")
	var assignment Assignment
	if err := db.Preload("Submissions").First(&assignment, id).Error; err == nil {
		deleteCloudinaryFile(assignment.FileURL)
		for _, s := range assignment.Submissions {
			deleteCloudinaryFile(s.FileURL)
		}
		db.Delete(&assignment)
	}
	c.JSON(http.StatusOK, gin.H{"message": "Xóa bài tập thành công"})
}

func getQuizzes(c *gin.Context) {
	courseID := c.Param("id")
	var quizzes []Quiz
	db.Where("course_id = ?", courseID).Find(&quizzes)
	c.JSON(http.StatusOK, quizzes)
}

func createQuiz(c *gin.Context) {
	courseID, _ := strconv.Atoi(c.Param("id"))
	var quiz Quiz
	if err := c.ShouldBindJSON(&quiz); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	quiz.CourseID = uint(courseID)
	db.Create(&quiz)
	c.JSON(http.StatusCreated, quiz)
}

func deleteQuiz(c *gin.Context) {
	id := c.Param("id")
	var quiz Quiz
	if err := db.First(&quiz, id).Error; err == nil {
		deleteCloudinaryFile(quiz.FileURL)
		db.Delete(&quiz)
	}
	c.JSON(http.StatusOK, gin.H{"message": "Xóa bài thi thành công"})
}

func joinCourse(c *gin.Context) {
	courseID := c.Param("id")
	var req struct {
		StudentID    uint   `json:"student_id"`
		StudentName  string `json:"student_name"`
		StudentEmail string `json:"student_email"`
		AvatarURL    string `json:"avatar_url"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu tham gia không hợp lệ"})
		return
	}

	var course Course
	if err := db.First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy lớp học"})
		return
	}

	var existing CourseStudent
	if err := db.Where("course_id = ? AND student_id = ?", course.ID, req.StudentID).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bạn đã tham gia lớp học này rồi!"})
		return
	}

	enrollment := CourseStudent{
		CourseID:     course.ID,
		StudentID:    req.StudentID,
		StudentName:  req.StudentName,
		StudentEmail: req.StudentEmail,
		AvatarURL:    req.AvatarURL,
	}

	if err := db.Create(&enrollment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu dữ liệu tham gia"})
		return
	}

	var actualCount int64
	db.Model(&CourseStudent{}).Where("course_id = ?", course.ID).Count(&actualCount)
	db.Model(&course).UpdateColumn("students_count", actualCount)

	c.JSON(http.StatusCreated, gin.H{"message": "Đăng ký tham gia lớp thành công!", "data": enrollment})
}

func getCourseStudents(c *gin.Context) {
	courseID := c.Param("id")
	var enrollments []CourseStudent
	if err := db.Where("course_id = ?", courseID).Find(&enrollments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi lấy dữ liệu danh sách học viên"})
		return
	}
	realStudents := []map[string]interface{}{}
	for _, e := range enrollments {
		realStudents = append(realStudents, map[string]interface{}{
			"id":         e.StudentID,
			"name":       e.StudentName,
			"email":      e.StudentEmail,
			"joined_at":  e.CreatedAt,
			"avatar_url": e.AvatarURL,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": realStudents})
}

func submitAssignment(c *gin.Context) {
	assignmentID := c.Param("id")
	var req struct {
		StudentID   uint   `json:"student_id"`
		StudentName string `json:"student_name"`
		FileURL     string `json:"fileUrl"`
		FileName    string `json:"fileName"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}
	submission := Submission{
		AssignmentID: uint(parseUint(assignmentID)),
		StudentID:    req.StudentID,
		StudentName:  req.StudentName,
		FileURL:      req.FileURL,
		FileName:     req.FileName,
	}
	if err := db.Create(&submission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu bài nộp"})
		return
	}
	db.Model(&Assignment{}).Where("id = ?", assignmentID).UpdateColumn("submitted_count", gorm.Expr("submitted_count + ?", 1))
	c.JSON(http.StatusCreated, gin.H{"message": "Nộp bài tập thành công!", "data": submission})
}

func getSubmissions(c *gin.Context) {
	assignmentID := c.Param("id")
	var submissions []Submission
	db.Where("assignment_id = ?", assignmentID).Order("created_at desc").Find(&submissions)
	c.JSON(http.StatusOK, gin.H{"data": submissions})
}

func parseUint(s string) uint {
	val, _ := strconv.ParseUint(s, 10, 32)
	return uint(val)
}

func getStudentJoinedCourses(c *gin.Context) {
	studentID := c.Param("student_id")
	var enrollments []CourseStudent
	if err := db.Where("student_id = ?", studentID).Find(&enrollments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi lấy dữ liệu"})
		return
	}
	if len(enrollments) == 0 {
		c.JSON(http.StatusOK, []Course{})
		return
	}
	var courseIDs []uint
	for _, e := range enrollments {
		courseIDs = append(courseIDs, e.CourseID)
	}
	var courses []Course
	db.Preload("Lessons").Preload("Assignments").Preload("Quizzes").Where("id IN ?", courseIDs).Order("created_at desc").Find(&courses)
	c.JSON(http.StatusOK, courses)
}

// Cập nhật Bài giảng
func updateLesson(c *gin.Context) {
	id := c.Param("id")
	var req Lesson
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var lesson Lesson
	if err := db.First(&lesson, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy bài học"})
		return
	}

	// Nếu có đổi file mới, xóa file cũ trên Cloudinary
	if req.FileURL != "" && req.FileURL != lesson.FileURL {
		deleteCloudinaryFile(lesson.FileURL)
	}

	db.Model(&lesson).Updates(map[string]interface{}{
		"title":     req.Title,
		"duration":  req.Duration,
		"content":   req.Content,
		"file_url":  req.FileURL,
		"file_name": req.FileName,
	})

	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật bài học thành công", "data": lesson})
}

// Cập nhật Bài tập về nhà (Đã fix nhận cả dueDate và due_date)
func updateAssignment(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Title       string `json:"title"`
		DueDate     string `json:"dueDate"`
		DueDateAlt  string `json:"due_date"`
		MaxScore    int    `json:"maxScore"`
		MaxScoreAlt int    `json:"max_score"`
		Description string `json:"description"`
		FileURL     string `json:"fileUrl"`
		FileName    string `json:"fileName"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var assignment Assignment
	if err := db.First(&assignment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy bài tập"})
		return
	}

	if req.FileURL != "" && req.FileURL != assignment.FileURL {
		deleteCloudinaryFile(assignment.FileURL)
	}

	// Lấy giá trị ngày giờ chuẩn dù gửi theo kiểu nào
	finalDueDate := req.DueDate
	if finalDueDate == "" {
		finalDueDate = req.DueDateAlt
	}

	finalMaxScore := req.MaxScore
	if finalMaxScore == 0 {
		finalMaxScore = req.MaxScoreAlt
	}

	db.Model(&assignment).Updates(map[string]interface{}{
		"title":       req.Title,
		"due_date":    finalDueDate,
		"max_score":   finalMaxScore,
		"description": req.Description,
		"file_url":    req.FileURL,
		"file_name":   req.FileName,
	})

	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật bài tập thành công", "data": assignment})
}

// Cập nhật Bài kiểm tra / Quiz
func updateQuiz(c *gin.Context) {
	id := c.Param("id")
	var req Quiz
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var quiz Quiz
	if err := db.First(&quiz, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy bài kiểm tra"})
		return
	}

	if req.FileURL != "" && req.FileURL != quiz.FileURL {
		deleteCloudinaryFile(quiz.FileURL)
	}

	db.Model(&quiz).Updates(map[string]interface{}{
		"title":           req.Title,
		"duration":        req.Duration,
		"total_questions": req.TotalQuestions,
		"pass_score":      req.PassScore,
		"description":     req.Description,
		"file_url":        req.FileURL,
		"file_name":       req.FileName,
	})

	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật bài kiểm tra thành công", "data": quiz})
}