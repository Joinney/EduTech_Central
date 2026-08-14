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
	"gorm.io/gorm/clause"
)

// Cấu hình Cloudinary chuyên dùng cho File Document
const (
	CloudinaryCloudName = "j3iibkjc"
	CloudinaryAPIKey    = "923999593653689"
	CloudinaryAPISecret = "7dnI1NUEFe_x-xl3Q4jHzqdmnfE"
)

// ==========================================
// 1. MODELS DATABASE
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
	Status        string       `gorm:"size:50;default:'APPROVED'" json:"status"` // 'PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'
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

// Bảng điểm danh Live Meet
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

// Bảng tiến độ học bài
type LessonProgress struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	CourseID    uint       `json:"course_id"`
	LessonID    uint       `gorm:"uniqueIndex:idx_lesson_student" json:"lesson_id"`
	StudentID   uint       `gorm:"uniqueIndex:idx_lesson_student" json:"student_id"`
	IsCompleted bool       `gorm:"default:false" json:"is_completed"`
	CompletedAt *time.Time `json:"completed_at"`
}

// Bảng kết quả thi trắc nghiệm
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

// Bảng thảo luận lớp học
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

var db *gorm.DB

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
	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "auth_service"
	}

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

	// Tự động đồng bộ các bảng
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
		// --- KHÓA HỌC ---
		api.GET("/courses", getCourses)
		api.POST("/courses", createCourse)
		api.GET("/courses/:id", getCourseByID)
		api.DELETE("/courses/:id", deleteCourse)
		api.PATCH("/courses/:id/meet", updateCourseMeet)
		api.PATCH("/courses/:id/status", updateCourseStatus) // 👈 Admin duyệt khóa

		// --- BÀI HỌC & TIẾN ĐỘ ---
		api.GET("/courses/:id/lessons", getLessons)
		api.POST("/courses/:id/lessons", createLesson)
		api.PUT("/lessons/:id", updateLesson)
		api.DELETE("/lessons/:id", deleteLesson)
		api.POST("/lessons/:id/progress", markLessonProgress)                 // 👈 Ghi nhận học xong bài
		api.GET("/courses/:id/progress/:student_id", getStudentCourseProgress) // 👈 Lấy tiến độ học viên

		// --- BÀI TẬP & NỘP BÀI ---
		api.GET("/courses/:id/assignments", getAssignments)
		api.POST("/courses/:id/assignments", createAssignment)
		api.PUT("/assignments/:id", updateAssignment)
		api.DELETE("/assignments/:id", deleteAssignment)
		api.POST("/assignments/:id/submit", submitAssignment)
		api.GET("/assignments/:id/submissions", getSubmissions)

		// --- BÀI THI / QUIZ ---
		api.GET("/courses/:id/quizzes", getQuizzes)
		api.POST("/courses/:id/quizzes", createQuiz)
		api.PUT("/quizzes/:id", updateQuiz)
		api.DELETE("/quizzes/:id", deleteQuiz)
		api.POST("/quizzes/:id/submit", submitQuizResult)       // 👈 Nộp điểm thi trắc nghiệm
		api.GET("/quizzes/:id/submissions", getQuizSubmissions) // 👈 Xem bảng điểm quiz

		// --- THÀNH VIÊN LỚP HỌC ---
		api.POST("/courses/:id/join", joinCourse)
		api.GET("/courses/:id/students", getCourseStudents)
		api.GET("/students/:student_id/courses", getStudentJoinedCourses)

		// --- ĐIỂM DANH LIVE MEET ---
		api.POST("/attendance/join", recordJoinAttendance)    // 👈 Vào phòng Meet
		api.POST("/attendance/leave", recordLeaveAttendance)  // 👈 Rời phòng Meet
		api.GET("/courses/:id/attendance", getCourseAttendanceLogs) // 👈 Xem nhật ký điểm danh lớp
		api.GET("/attendance/all", getAllAttendanceLogs)      // 👈 Admin xem toàn bộ nhật ký

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
	
	// Nếu có truyền teacher_id thì lọc theo giáo viên đó
	if teacherID != "" && teacherID != "undefined" && teacherID != "null" {
		query = query.Where("teacher_id = ?", teacherID)
	}
	
	// Nếu có truyền status cụ thể (ví dụ Admin muốn lọc) thì mới áp dụng
	if status != "" && status != "all" && status != "Tất cả" {
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
		course.Code = fmt.Sprintf("CLASS-%d", time.Now().Unix()%10000)
	}
	if course.Status == "" {
		course.Status = "APPROVED" // Mặc định mở luôn hoặc PENDING nếu cần duyệt
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
	db.Model(&Course{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":     req.Status,
		"admin_note": req.AdminNote,
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	now := time.Now()
	progress := LessonProgress{
		CourseID:    req.CourseID,
		LessonID:    uint(parseUint(lessonID)),
		StudentID:   req.StudentID,
		IsCompleted: req.IsCompleted,
		CompletedAt: &now,
	}
	// Upsert nếu đã tồn tại
	db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "lesson_id"}, {Name: "student_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"is_completed", "completed_at"}),
	}).Create(&progress)

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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	sub := QuizSubmission{
		QuizID:           uint(parseUint(quizID)),
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
	db.Create(&sub)
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

func parseUint(s string) uint {
	val, _ := strconv.ParseUint(s, 10, 32)
	return uint(val)
}