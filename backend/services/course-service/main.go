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
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Cấu hình Cloudinary chuyên dùng cho File Document
const (
	CloudinaryCloudName = "j3iibkjc"
	CloudinaryAPIKey    = "923999593653689"
	CloudinaryAPISecret = "7dnI1NUEFe_x-xl3Q4jHzqdmnfE"
)

// ==========================================
// 1. MODELS DATABASE (LCMS & AUTH)
// ==========================================

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
	Status        string       `gorm:"size:50;default:'APPROVED'" json:"status"`
	Price         float64      `gorm:"type:numeric(12,2);default:0" json:"price"`
	AdminNote     string       `gorm:"type:text" json:"admin_note"`
	IsPublished   bool         `gorm:"default:true" json:"is_published"`
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
	ID             uint             `gorm:"primaryKey" json:"id"`
	CourseID       uint             `json:"courseId"`
	Title          string           `gorm:"size:255;not null" json:"title"`
	Duration       string           `gorm:"size:50" json:"duration"`
	TotalQuestions int              `gorm:"default:10" json:"totalQuestions"`
	PassScore      int              `gorm:"default:5" json:"passScore"`
	Description    string           `gorm:"type:text" json:"description"`
	FileURL        string           `gorm:"type:text" json:"fileUrl"`
	FileName       string           `gorm:"size:255" json:"fileName"`
	IsVisible      bool             `gorm:"default:true" json:"isVisible"`
	Submissions    []QuizSubmission `gorm:"foreignKey:QuizID;constraint:OnDelete:CASCADE" json:"submissions"`
	CreatedAt      time.Time        `json:"createdAt"`
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

type AttendanceLog struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	CourseID        uint       `json:"course_id"`
	StudentID       uint       `json:"student_id"`
	StudentName     string     `gorm:"size:255" json:"student_name"`
	RoomName        string     `gorm:"size:255" json:"room_name"`
	JoinedAt        time.Time  `json:"joined_at"`
	LeftAt          *time.Time `json:"left_at"`
	DurationMinutes int        `gorm:"default:0" json:"duration_minutes"`
	CreatedAt       time.Time  `json:"created_at"`
}

type LessonProgress struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	CourseID    uint       `json:"course_id"`
	LessonID    uint       `gorm:"uniqueIndex:idx_lesson_student" json:"lesson_id"`
	StudentID   uint       `gorm:"uniqueIndex:idx_lesson_student" json:"student_id"`
	IsCompleted bool       `gorm:"default:false" json:"is_completed"`
	CompletedAt *time.Time `json:"completed_at"`
}

type QuizSubmission struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	QuizID           uint      `json:"quiz_id"`
	StudentID        uint      `json:"student_id"`
	StudentName      string    `gorm:"size:255" json:"student_name"`
	Score            float64   `gorm:"type:numeric(4,2);default:0" json:"score"`
	TotalCorrect     int       `gorm:"default:0" json:"total_correct"`
	TotalQuestions   int       `gorm:"default:0" json:"total_questions"`
	TimeSpentSeconds int       `gorm:"default:0" json:"time_spent_seconds"`
	FileURL          string    `gorm:"type:text" json:"file_url"`
	FileName         string    `gorm:"size:255" json:"file_name"`
	SubmittedAt      time.Time `json:"submitted_at"`
}

type CourseDiscussion struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	CourseID   uint      `json:"course_id"`
	LessonID   *uint     `json:"lesson_id"`
	UserID     uint      `json:"user_id"`
	UserName   string    `gorm:"size:255" json:"user_name"`
	UserRole   string    `gorm:"size:50;default:'student'" json:"user_role"`
	AvatarURL  string    `gorm:"type:text" json:"avatar_url"`
	Content    string    `gorm:"type:text;not null" json:"content"`
	IsApproved bool      `gorm:"default:true" json:"is_approved"`
	CreatedAt  time.Time `json:"created_at"`
}

// Model User & StudentProfile thuộc database auth_service
type User struct {
	IDUsers     uint      `gorm:"primaryKey;column:id_users" json:"id_users"`
	Email       string    `gorm:"size:255;unique;not null" json:"email"`
	Password    string    `gorm:"size:255;not null" json:"password"`
	FullName    string    `gorm:"size:255;not null" json:"full_name"`
	Role        string    `gorm:"size:50;default:'student'" json:"role"`
	Status      string    `gorm:"size:50;default:'active'" json:"status"`
	Avatar      string    `gorm:"type:text" json:"avatar"`
	IsOnboarded bool      `gorm:"default:true" json:"is_onboarded"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type StudentProfile struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"column:user_id;uniqueIndex" json:"user_id"`
	Grade     string    `gorm:"size:50" json:"grade"`
	School    string    `gorm:"size:255" json:"school"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Cố định tên bảng chuẩn trong PostgreSQL
func (User) TableName() string             { return "users" }
func (StudentProfile) TableName() string   { return "student_profiles" }
func (CourseStudent) TableName() string    { return "course_students" }
func (LessonProgress) TableName() string   { return "lesson_progress" }
func (QuizSubmission) TableName() string   { return "quiz_submissions" }
func (AttendanceLog) TableName() string    { return "attendance_logs" }
func (CourseDiscussion) TableName() string { return "course_discussions" }

var db *gorm.DB
var authDB *gorm.DB

func initDB() {
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "postgres"
	}
	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}
	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}
	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "postgrespassword"
	}

	// 1. Kết nối Database course_service (Quản lý khóa học, bài giảng, điểm số)
	courseDBName := os.Getenv("DB_NAME")
	if courseDBName == "" {
		courseDBName = "course_service"
	}
	dsnCourse := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Ho_Chi_Minh",
		host, user, password, courseDBName, port)

	var err error
	for i := 1; i <= 10; i++ {
		db, err = gorm.Open(postgres.Open(dsnCourse), &gorm.Config{})
		if err == nil {
			log.Println("✅ [course-service] Kết nối thành công đến database course_service!")
			break
		}
		time.Sleep(3 * time.Second)
	}

	if err != nil {
		log.Fatalf("❌ KHÔNG THỂ kết nối đến database course_service: %v", err)
	}

	// 2. Kết nối Database auth_service (Quản lý tài khoản Users để đồng bộ đăng nhập)
	dsnAuth := fmt.Sprintf("host=%s user=%s password=%s dbname=auth_service port=%s sslmode=disable TimeZone=Asia/Ho_Chi_Minh",
		host, user, password, port)

	authDB, err = gorm.Open(postgres.Open(dsnAuth), &gorm.Config{})
	if err != nil {
		log.Printf("⚠️ Lỗi kết nối database auth_service (sẽ dùng chung db hiện tại): %v", err)
		authDB = db
	} else {
		log.Println("✅ [course-service] Kết nối thành công đến database auth_service!")
	}

	// AutoMigrate toàn bộ bảng LCMS
	db.AutoMigrate(
		&Course{},
		&Lesson{},
		&Assignment{},
		&Quiz{},
		&CourseStudent{},
		&Submission{},
		&AttendanceLog{},
		&LessonProgress{},
		&QuizSubmission{},
		&CourseDiscussion{},
	)
	log.Println("✅ AutoMigrate toàn bộ 10 bảng LCMS thành công!")
}

// Xóa file Cloudinary
func deleteCloudinaryFile(fileURL string) {
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
		log.Printf("🗑️ Đã xóa file Cloudinary [%s]: Status %d", publicID, resp.StatusCode)
	}()
}

// ==========================================
// 2. MAIN & ROUTES
// ==========================================

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
		// --- KHÓA HỌC & KIỂM DUYỆT ---
		api.GET("/courses", getCourses)
		api.POST("/courses", createCourse)
		api.GET("/courses/:id", getCourseByID)
		api.DELETE("/courses/:id", deleteCourse)
		api.PATCH("/courses/:id/meet", updateCourseMeet)
		api.PATCH("/courses/:id/status", updateCourseStatus)

		// --- BÀI HỌC & TIẾN ĐỘ ---
		api.GET("/courses/:id/lessons", getLessons)
		api.POST("/courses/:id/lessons", createLesson)
		api.PUT("/lessons/:id", updateLesson)
		api.DELETE("/lessons/:id", deleteLesson)
		api.POST("/lessons/:id/progress", markLessonProgress)
		api.GET("/courses/:id/progress/:student_id", getStudentCourseProgress)

		// --- BÀI TẬP & NỘP BÀI ---
		api.GET("/courses/:id/assignments", getAssignments)
		api.POST("/courses/:id/assignments", createAssignment)
		api.PUT("/assignments/:id", updateAssignment)
		api.DELETE("/assignments/:id", deleteAssignment)
		api.POST("/assignments/:id/submit", submitAssignment)
		api.GET("/assignments/:id/submissions", getSubmissions)

		// --- BÀI THI TRẮC NGHIỆM / QUIZ ---
		api.GET("/courses/:id/quizzes", getQuizzes)
		api.POST("/courses/:id/quizzes", createQuiz)
		api.PUT("/quizzes/:id", updateQuiz)
		api.DELETE("/quizzes/:id", deleteQuiz)
		api.POST("/quizzes/:id/submit", submitQuizResult)
		api.GET("/quizzes/:id/submissions", getQuizSubmissions)

		// --- THÀNH VIÊN LỚP HỌC & GHI DANH ---
		api.POST("/courses/:id/join", joinCourse)
		api.GET("/courses/:id/students", getCourseStudents)
		api.GET("/students/:student_id/courses", getStudentJoinedCourses)
		api.POST("/courses/:id/students/import", importStudentsBatch) // 👈 Admin Import Excel

		// --- ĐIỂM DANH LIVE MEET ---
		api.POST("/attendance/join", recordJoinAttendance)
		api.POST("/attendance/leave", recordLeaveAttendance)
		api.GET("/courses/:id/attendance", getCourseAttendanceLogs)
		api.GET("/attendance/all", getAllAttendanceLogs)

		// --- THẢO LUẬN / DIỄN ĐÀN ---
		api.GET("/courses/:id/discussions", getCourseDiscussions)
		api.POST("/courses/:id/discussions", createDiscussion)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8002"
	}
	r.Run(":" + port)
}

// ==========================================
// 3. CONTROLLERS & LOGIC
// ==========================================

func getCourses(c *gin.Context) {
	var courses []Course
	teacherID := c.Query("teacher_id")
	status := c.Query("status")

	query := db.Preload("Lessons").Preload("Assignments").Preload("Quizzes").Order("created_at desc")

	if teacherID != "" && teacherID != "undefined" && teacherID != "null" {
		query = query.Where("teacher_id = ?", teacherID)
	}

	if status != "" && status != "all" && status != "ALL" && status != "Tất cả" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi truy vấn danh sách khóa học"})
		return
	}

	c.JSON(http.StatusOK, courses)
}

func createCourse(c *gin.Context) {
	var course Course
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if course.Code == "" {
		prefix := "CLASS"
		if course.Type == "external" {
			prefix = "SKILL"
		}
		course.Code = fmt.Sprintf("%s-%d", prefix, time.Now().Unix()%10000)
	}
	if course.Status == "" {
		if course.Type == "school" {
			course.Status = "APPROVED"
			course.IsPublished = true
		} else {
			course.Status = "PENDING"
			course.IsPublished = false
		}
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
		for _, l := range course.Lessons {
			deleteCloudinaryFile(l.FileURL)
		}
		for _, a := range course.Assignments {
			deleteCloudinaryFile(a.FileURL)
		}
		for _, q := range course.Quizzes {
			deleteCloudinaryFile(q.FileURL)
		}
	}
	db.Delete(&Course{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Xóa lớp học thành công"})
}

func updateCourseStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status    string `json:"status"`
		AdminNote string `json:"admin_note"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	isPublished := req.Status == "APPROVED"

	db.Model(&Course{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":       req.Status,
		"admin_note":   req.AdminNote,
		"is_published": isPublished,
	})
	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật trạng thái kiểm duyệt thành công"})
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
	db.Where("course_id = ?", courseID).Order("id asc").Find(&lessons)
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

// 🎯 ĐÁNH DẤU TIẾN ĐỘ HỌC TẬP
func markLessonProgress(c *gin.Context) {
	lessonID := c.Param("id")
	var req struct {
		CourseID    uint `json:"course_id"`
		StudentID   uint `json:"student_id"`
		IsCompleted bool `json:"is_completed"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("❌ Lỗi Bind JSON Tiến độ: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	lID := uint(parseUint(lessonID))
	now := time.Now()

	var progress LessonProgress
	err := db.Where("lesson_id = ? AND student_id = ?", lID, req.StudentID).First(&progress).Error
	if err != nil {
		progress = LessonProgress{
			CourseID:    req.CourseID,
			LessonID:    lID,
			StudentID:   req.StudentID,
			IsCompleted: req.IsCompleted,
			CompletedAt: &now,
		}
		if createErr := db.Create(&progress).Error; createErr != nil {
			log.Printf("❌ Lỗi INSERT lesson_progress: %v", createErr)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu tiến độ"})
			return
		}
		log.Printf("✅ Đã lưu tiến độ bài học ID=%d cho StudentID=%d", lID, req.StudentID)
	} else {
		db.Model(&progress).Updates(map[string]interface{}{
			"is_completed": req.IsCompleted,
			"completed_at": now,
		})
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật tiến độ thành công", "data": progress})
}

func getStudentCourseProgress(c *gin.Context) {
	courseID := c.Param("id")
	studentID := c.Param("student_id")
	var completedLessons []LessonProgress
	db.Where("course_id = ? AND student_id = ? AND is_completed = true", courseID, studentID).Find(&completedLessons)

	var totalLessons int64
	db.Model(&Lesson{}).Where("course_id = ?", courseID).Count(&totalLessons)

	percent := 0.0
	if totalLessons > 0 {
		percent = (float64(len(completedLessons)) / float64(totalLessons)) * 100
	}

	c.JSON(http.StatusOK, gin.H{
		"completed_count": len(completedLessons),
		"total_lessons":   totalLessons,
		"percent":         percent,
		"progress_list":   completedLessons,
	})
}

func getAssignments(c *gin.Context) {
	courseID := c.Param("id")
	var assignments []Assignment
	db.Where("course_id = ?", courseID).Order("id asc").Find(&assignments)
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

func getQuizzes(c *gin.Context) {
	courseID := c.Param("id")
	var quizzes []Quiz
	db.Where("course_id = ?", courseID).Order("id asc").Find(&quizzes)
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

// 🎯 NỘP BÀI THI TRẮC NGHIỆM / QUIZ RESULT
func submitQuizResult(c *gin.Context) {
	quizID := c.Param("id")
	var req struct {
		StudentID        uint    `json:"student_id"`
		StudentName      string  `json:"student_name"`
		Score            float64 `json:"score"`
		TotalCorrect     int     `json:"total_correct"`
		TotalQuestions   int     `json:"total_questions"`
		TimeSpentSeconds int     `json:"time_spent_seconds"`
		FileURL          string  `json:"file_url"`
		FileName         string  `json:"file_name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("❌ Lỗi Bind JSON Quiz: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	qID := uint(parseUint(quizID))
	sub := QuizSubmission{
		QuizID:           qID,
		StudentID:        req.StudentID,
		StudentName:      req.StudentName,
		Score:            req.Score,
		TotalCorrect:     req.TotalCorrect,
		TotalQuestions:   req.TotalQuestions,
		TimeSpentSeconds: req.TimeSpentSeconds,
		FileURL:          req.FileURL,
		FileName:         req.FileName,
		SubmittedAt:      time.Now(),
	}

	if err := db.Create(&sub).Error; err != nil {
		log.Printf("❌ Lỗi INSERT quiz_submissions: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu bài thi"})
		return
	}

	log.Printf("🎉 ĐÃ LƯU kết quả thi ID=%d (Điểm: %.1f, HS: %s)", sub.ID, sub.Score, sub.StudentName)
	c.JSON(http.StatusCreated, gin.H{"message": "Đã lưu kết quả thi!", "data": sub})
}

func getQuizSubmissions(c *gin.Context) {
	quizID := c.Param("id")
	var subs []QuizSubmission
	db.Where("quiz_id = ?", quizID).Order("submitted_at desc").Find(&subs)
	c.JSON(http.StatusOK, gin.H{"data": subs})
}

// 🎯 ĐIỂM DANH LIVE MEET (JOIN & LEAVE)
func recordJoinAttendance(c *gin.Context) {
	var req struct {
		CourseID    uint   `json:"course_id"`
		StudentID   uint   `json:"student_id"`
		StudentName string `json:"student_name"`
		RoomName    string `json:"room_name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	logRecord := AttendanceLog{
		CourseID:    req.CourseID,
		StudentID:   req.StudentID,
		StudentName: req.StudentName,
		RoomName:    req.RoomName,
		JoinedAt:    time.Now(),
		CreatedAt:   time.Now(),
	}
	db.Create(&logRecord)
	c.JSON(http.StatusCreated, gin.H{"log_id": logRecord.ID, "message": "Ghi nhận vào phòng học thành công"})
}

func recordLeaveAttendance(c *gin.Context) {
	var req struct {
		LogID uint `json:"log_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var logRecord AttendanceLog
	if err := db.First(&logRecord, req.LogID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy phiên học"})
		return
	}
	now := time.Now()
	duration := int(now.Sub(logRecord.JoinedAt).Minutes())
	if duration < 1 {
		duration = 1
	}
	db.Model(&logRecord).Updates(map[string]interface{}{
		"left_at":          now,
		"duration_minutes": duration,
	})
	c.JSON(http.StatusOK, gin.H{"message": "Ghi nhận rời phòng thành công", "duration": duration})
}

func getCourseAttendanceLogs(c *gin.Context) {
	courseID := c.Param("id")
	var logs []AttendanceLog
	db.Where("course_id = ?", courseID).Order("joined_at desc").Find(&logs)
	c.JSON(http.StatusOK, gin.H{"data": logs})
}

func getAllAttendanceLogs(c *gin.Context) {
	var logs []AttendanceLog
	db.Order("joined_at desc").Limit(100).Find(&logs)
	c.JSON(http.StatusOK, gin.H{"data": logs})
}

// 🎯 DIỄN ĐÀN & THẢO LUẬN
func getCourseDiscussions(c *gin.Context) {
	courseID := c.Param("id")
	var discussions []CourseDiscussion
	db.Where("course_id = ?", courseID).Order("created_at desc").Find(&discussions)
	c.JSON(http.StatusOK, gin.H{"data": discussions})
}

func createDiscussion(c *gin.Context) {
	courseID, _ := strconv.Atoi(c.Param("id"))
	var discussion CourseDiscussion
	if err := c.ShouldBindJSON(&discussion); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	discussion.CourseID = uint(courseID)
	discussion.CreatedAt = time.Now()
	db.Create(&discussion)
	c.JSON(http.StatusCreated, gin.H{"message": "Đăng thảo luận thành công", "data": discussion})
}

// 🎯 THAM GIA LỚP HỌC (CHỈ ÁP DỤNG CHO KHÓA TỰ DO)
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

	// 🔒 RÀNG BUỘC NGHIỆP VỤ: Lớp chính quy không cho tự nhập mã
	if course.Type == "school" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Đây là Lớp học trường chính quy! Danh sách học viên được Admin phân bổ trực tiếp từ Nhà trường, không thể tự ý nhập mã tham gia.",
		})
		return
	}

	var existing CourseStudent
	if err := db.Where("course_id = ? AND (student_id = ? OR student_email = ?)", course.ID, req.StudentID, req.StudentEmail).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bạn đã tham gia lớp học này rồi!"})
		return
	}

	enrollment := CourseStudent{
		CourseID:     course.ID,
		StudentID:    req.StudentID,
		StudentName:  req.StudentName,
		StudentEmail: req.StudentEmail,
		AvatarURL:    req.AvatarURL,
		CreatedAt:    time.Now(),
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

// 🎯 ADMIN IMPORT EXCEL: TỰ ĐỘNG TẠO USER (BCRYPT) VÀ GHI DANH VÀO LỚP
func importStudentsBatch(c *gin.Context) {
	courseID := c.Param("id")
	var req struct {
		Students []struct {
			StudentID    uint   `json:"student_id"`
			StudentName  string `json:"student_name"`
			StudentEmail string `json:"student_email"`
			Password     string `json:"password"`
			AvatarURL    string `json:"avatar_url"`
		} `json:"students"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu danh sách học viên không hợp lệ"})
		return
	}

	var course Course
	if err := db.First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy lớp học"})
		return
	}

	cID := uint(parseUint(courseID))
	importedCount := 0
	alreadyInClassCount := 0
	createdUserCount := 0
	var errorLogs []string // 👈 Mảng lưu vết lỗi để báo ra màn hình Admin

	targetAuthDB := authDB
	if targetAuthDB == nil {
		targetAuthDB = db
	}

	for _, s := range req.Students {
		if strings.TrimSpace(s.StudentEmail) == "" || strings.TrimSpace(s.StudentName) == "" {
			continue
		}

		email := strings.TrimSpace(strings.ToLower(s.StudentEmail))
		name := strings.TrimSpace(s.StudentName)
		rawPass := strings.TrimSpace(s.Password)
		if rawPass == "" {
			rawPass = "123456"
		}

		avatar := s.AvatarURL
		if avatar == "" {
			avatar = fmt.Sprintf("https://ui-avatars.com/api/?name=%s&background=0284c7&color=ffffff&bold=true", url.QueryEscape(name))
		}

		// 1. KIỂM TRA TÀI KHOẢN TRONG BẢNG USERS CỦA AUTH_SERVICE
		var existingUser User
		errFind := targetAuthDB.Table("users").Where("email = ?", email).First(&existingUser).Error

		finalStudentID := existingUser.IDUsers

		// Nếu không tìm thấy -> Tạo tài khoản mới
		if errFind != nil || finalStudentID == 0 {
			// Mã hóa mật khẩu bằng Bcrypt chuẩn
			hashedPassBytes, hashErr := bcrypt.GenerateFromPassword([]byte(rawPass), bcrypt.DefaultCost)
			var hashedPass string
			if hashErr != nil {
				hashedPass = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy" // Fallback hash 123456
			} else {
				hashedPass = string(hashedPassBytes)
			}

			now := time.Now()
			
			// Tạo bằng Map để bỏ qua các lỗi liên quan đến Struct GORM
			newUser := map[string]interface{}{
				"email":        email,
				"password":     hashedPass,
				"full_name":    name,
				"role":         "student",
				"status":       "active",
				"avatar":       avatar,
				"is_onboarded": true,
				"created_at":   now,
				"updated_at":   now,
			}

			errInsert := targetAuthDB.Table("users").Create(&newUser).Error
			
			if errInsert == nil {
				// Lấy lại ID vừa tạo
				var createdUser User
				targetAuthDB.Table("users").Where("email = ?", email).First(&createdUser)
				finalStudentID = createdUser.IDUsers

				if finalStudentID > 0 {
					createdUserCount++
					log.Printf("🎉 [auth_service] ĐÃ TẠO TÀI KHOẢN: %s (id: %d)", email, finalStudentID)
					
					// Tạo profile học sinh
					targetAuthDB.Table("student_profiles").Create(map[string]interface{}{
						"user_id":    finalStudentID,
						"grade":      course.Grade,
						"school":     course.SchoolName,
						"created_at": now,
						"updated_at": now,
					})
				}
			} else {
				// Nếu lỗi, ghi nhận lại để báo cho Admin biết
				errorMsg := fmt.Sprintf("Lỗi tạo user %s: %v", email, errInsert)
				log.Println("❌", errorMsg)
				errorLogs = append(errorLogs, errorMsg)
			}
		}

		if finalStudentID == 0 {
			finalStudentID = s.StudentID
		}

		// 2. GHI DANH HỌC VIÊN VÀO BẢNG course_students
		var existing CourseStudent
		if err := db.Where("course_id = ? AND student_email = ?", cID, email).First(&existing).Error; err == nil {
			alreadyInClassCount++
			continue
		}

		enrollment := CourseStudent{
			CourseID:     cID,
			StudentID:    finalStudentID,
			StudentName:  name,
			StudentEmail: email,
			AvatarURL:    avatar,
			CreatedAt:    time.Now(),
		}

		if err := db.Create(&enrollment).Error; err == nil {
			importedCount++
		}
	}

	// 3. Cập nhật lại tổng sĩ số
	var totalCount int64
	db.Model(&CourseStudent{}).Where("course_id = ?", cID).Count(&totalCount)
	db.Model(&course).UpdateColumn("students_count", totalCount)

	// Ghi kèm lỗi (nếu có) vào màn hình Alert
	msg := fmt.Sprintf("✅ Kết quả Import:\n• Thêm mới vào lớp: %d học viên\n• Đã có sẵn trong lớp: %d học viên\n• Tạo tài khoản mới: %d\n• Tổng sĩ số lớp hiện tại: %d/%d",
		importedCount, alreadyInClassCount, createdUserCount, totalCount, course.MaxStudents)

	if len(errorLogs) > 0 {
		msg += "\n\n⚠️ Chi tiết lỗi DB (Gửi báo cáo này cho IT):\n" + strings.Join(errorLogs, "\n")
	}

	c.JSON(http.StatusOK, gin.H{
		"message":            msg,
		"imported_count":     importedCount,
		"created_user_count": createdUserCount,
		"total_students":     totalCount,
	})
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

func getStudentJoinedCourses(c *gin.Context) {
	studentID := c.Param("student_id")
	studentEmail := c.Query("email")

	var enrollments []CourseStudent
	query := db.Where("student_id = ?", studentID)
	if studentEmail != "" {
		query = db.Where("student_id = ? OR student_email = ?", studentID, strings.ToLower(studentEmail))
	}

	if err := query.Find(&enrollments).Error; err != nil {
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

func parseUint(s string) uint {
	val, _ := strconv.ParseUint(s, 10, 32)
	return uint(val)
}