package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Course struct {
	ID            uint         `gorm:"primaryKey" json:"id"`
	TeacherID     uint         `json:"teacher_id"`
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
	IsVisible bool      `gorm:"default:true" json:"isVisible"`
	CreatedAt time.Time `json:"createdAt"`
}

type Assignment struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	CourseID       uint      `json:"courseId"`
	Title          string    `gorm:"size:255;not null" json:"title"`
	DueDate        string    `gorm:"size:50" json:"dueDate"`
	MaxScore       int       `gorm:"default:10" json:"maxScore"`
	SubmittedCount int       `gorm:"default:0" json:"submittedCount"`
	Description    string    `gorm:"type:text" json:"description"`
	IsVisible      bool      `gorm:"default:true" json:"isVisible"`
	CreatedAt      time.Time `json:"createdAt"`
}

type Quiz struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	CourseID       uint      `json:"courseId"`
	Title          string    `gorm:"size:255;not null" json:"title"`
	Duration       string    `gorm:"size:50" json:"duration"`
	TotalQuestions int       `gorm:"default:10" json:"totalQuestions"`
	PassScore      int       `gorm:"default:5" json:"passScore"`
	Description    string    `gorm:"type:text" json:"description"`
	IsVisible      bool      `gorm:"default:true" json:"isVisible"`
	CreatedAt      time.Time `json:"createdAt"`
}

// Model lưu trữ Học viên tham gia Lớp (Many-to-Many Bridge Table)
// Bạn tìm struct CourseStudent và sửa lại thế này:
type CourseStudent struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	CourseID     uint      `json:"course_id"`
	StudentID    uint      `json:"student_id"`
	StudentName  string    `json:"student_name"`  // Thêm Tên thật
	StudentEmail string    `json:"student_email"` // Thêm Email thật
	AvatarURL    string    `json:"avatar_url"`    // Thêm Avatar
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
		log.Printf("⏳ Đang đợi PostgreSQL khởi động (Lần %d/10)... Lỗi: %v", i, err)
		time.Sleep(3 * time.Second)
	}

	if err != nil {
		log.Fatalf("❌ KHÔNG THỂ kết nối đến Postgres DB sau 10 lần thử: %v", err)
	}

	// Đưa CourseStudent vào danh sách AutoMigrate để DB tự tạo bảng
	db.AutoMigrate(&Course{}, &Lesson{}, &Assignment{}, &Quiz{}, &CourseStudent{})
	log.Println("✅ AutoMigrate các bảng thành công!")
}

func main() {
	initDB()

	r := gin.Default()

	// MIDDLEWARE CORS
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

		api.GET("/courses/:id/assignments", getAssignments)
		api.POST("/courses/:id/assignments", createAssignment)

		api.GET("/courses/:id/quizzes", getQuizzes)
		api.POST("/courses/:id/quizzes", createQuiz)

		// Ráp nối 2 API Mới Cho Luồng Học Viên
		api.POST("/courses/:id/join", joinCourse)
		api.GET("/courses/:id/students", getCourseStudents)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8002"
	}

	r.Run(":" + port)
}

// ==========================================
// CÁC HANDLER QUẢN LÝ LỚP HỌC & TÀI NGUYÊN
// ==========================================

func getCourses(c *gin.Context) {
	var courses []Course
	db.Preload("Lessons").Preload("Assignments").Preload("Quizzes").Order("created_at desc").Find(&courses)
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

// ==========================================
// CÁC HANDLER QUẢN LÝ HỌC VIÊN
// ==========================================

// 1. Logic Sinh Viên tham gia lớp
func joinCourse(c *gin.Context) {
	courseID := c.Param("id")
	
	// Khai báo struct để nhận data THẬT từ React gửi lên
	var req struct {
		StudentID    uint   `json:"student_id"`
		StudentName  string `json:"student_name"`
		StudentEmail string `json:"student_email"`
		AvatarURL    string `json:"avatar_url"`
	}
	
	// Đọc dữ liệu từ React
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu tham gia không hợp lệ"})
		return
	}

	var course Course
	if err := db.First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy lớp học"})
		return
	}

	// Check trùng (Dùng ID thật của sinh viên)
	var existing CourseStudent
	if err := db.Where("course_id = ? AND student_id = ?", course.ID, req.StudentID).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bạn đã tham gia lớp học này rồi!"})
		return
	}

	// LƯU DATA THẬT VÀO DATABASE
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

	// Thay vì cộng 1 mù quáng, ta đếm số lượng THỰC TẾ trong bảng CourseStudent
	var actualCount int64
	db.Model(&CourseStudent{}).Where("course_id = ?", course.ID).Count(&actualCount)
	
	// Cập nhật con số chính xác tuyệt đối vào bảng Course
	db.Model(&course).UpdateColumn("students_count", actualCount)

	c.JSON(http.StatusCreated, gin.H{"message": "Đăng ký tham gia lớp thành công!", "data": enrollment})
}
// 2. Logic Trả về danh sách sinh viên cho màn hình của Giáo viên
func getCourseStudents(c *gin.Context) {
	courseID := c.Param("id")
	var enrollments []CourseStudent

	if err := db.Where("course_id = ?", courseID).Find(&enrollments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi lấy dữ liệu danh sách học viên"})
		return
	}

	// Trả về DỮ LIỆU THẬT đã lưu trong Database
	realStudents := []map[string]interface{}{}
	for _, e := range enrollments {
		realStudents = append(realStudents, map[string]interface{}{
			"id":         e.StudentID,
			"name":       e.StudentName,  // <--- Data thật
			"email":      e.StudentEmail, // <--- Data thật
			"joined_at":  e.CreatedAt,
			"avatar_url": e.AvatarURL,    // <--- Data thật
		})
	}

	c.JSON(http.StatusOK, gin.H{"data": realStudents})
}