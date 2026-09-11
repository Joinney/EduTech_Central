package controllers

import (
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"edutech/course-service/configs"
	"edutech/course-service/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func parseUint(s string) uint {
	val, _ := strconv.ParseUint(s, 10, 32)
	return uint(val)
}

// @Summary      Lấy danh sách danh mục khóa học
// @Description  Trả về danh sách danh mục phân loại môn học
// @Tags         Categories
// @Produce      json
// @Success      200  {object}  map[string]interface{}
// @Router       /categories [get]

func GetCategories(c *gin.Context) {
	var categories []models.CourseCategory
	if err := configs.DB.Order("id asc").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi lấy danh mục"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": categories})
}

// @Summary      Lấy danh sách khóa học
// @Description  Truy vấn danh sách khóa học kèm bộ lọc theo giáo viên, trạng thái, danh mục
// @Tags         Courses
// @Produce      json
// @Param        teacher_id  query     string  false  "ID giáo viên"
// @Param        status      query     string  false  "Trạng thái (APPROVED, PENDING)"
// @Param        category    query     string  false  "Slug danh mục khóa học"
// @Success      200         {array}   models.Course
// @Router       /courses [get]

func GetCourses(c *gin.Context) {
	var courses []models.Course
	teacherID := c.Query("teacher_id")
	status := c.Query("status")
	categorySlug := c.Query("category")

	query := configs.DB.Preload("Category").Preload("Lessons").Preload("Assignments").Preload("Quizzes").Order("created_at desc")

	if teacherID != "" && teacherID != "undefined" && teacherID != "null" {
		query = query.Where("teacher_id = ?", teacherID)
	}

	if status != "" && status != "all" && status != "ALL" && status != "Tất cả" {
		query = query.Where("status = ?", status)
	}

	if categorySlug != "" {
		query = query.Joins("JOIN course_categories ON course_categories.id = courses.category_id").
			Where("course_categories.slug = ?", categorySlug)
	}

	if err := query.Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi truy vấn danh sách khóa học"})
		return
	}

	for i := range courses {
		var actualCount int64
		configs.DB.Model(&models.CourseStudent{}).Where("course_id = ?", courses[i].ID).Count(&actualCount)
		courses[i].StudentsCount = int(actualCount)
	}

	c.JSON(http.StatusOK, courses)
}

// @Summary      Tạo khóa học mới
// @Description  Giáo viên gửi yêu cầu mở khóa học hoặc tạo lớp chính quy
// @Tags         Courses
// @Accept       json
// @Produce      json
// @Param        request body models.Course true "Thông tin khóa học"
// @Success      201     {object} models.Course
// @Failure      400     {object} map[string]interface{}
// @Router       /courses [post]

func CreateCourse(c *gin.Context) {
	var req struct {
		models.Course
		DaysOfWeek string `json:"days_of_week"`
		TimeSlot   string `json:"time_slot"`
		SchoolLogo string `json:"school_logo"`
		TeacherImg string `json:"teacher_img"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	course := req.Course
	course.SchoolLogo = req.SchoolLogo
	course.TeacherImg = req.TeacherImg

	var matchSubject models.TeacherSubject
	errSub := configs.DB.Where("teacher_id = ? AND LOWER(subject) = ?",
		course.TeacherID, strings.ToLower(strings.TrimSpace(course.Subject))).First(&matchSubject).Error

	if errSub != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Giáo viên %s không thuộc lĩnh vực '%s'!", course.TeacherName, course.Subject),
		})
		return
	}

	scheduleStr := course.Schedule
	if scheduleStr == "" && req.DaysOfWeek != "" {
		scheduleStr = fmt.Sprintf("%s (%s)", req.DaysOfWeek, req.TimeSlot)
		course.Schedule = scheduleStr
	}

	if req.DaysOfWeek != "" && req.TimeSlot != "" {
		var conflict models.CourseSchedule
		errConf := configs.DB.Where("teacher_id = ? AND day_of_week LIKE ? AND time_slot LIKE ?",
			course.TeacherID, "%"+req.DaysOfWeek+"%", "%"+req.TimeSlot+"%").First(&conflict).Error

		if errConf == nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Trùng lịch dạy với lớp '%s'!", conflict.CourseTitle),
			})
			return
		}
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

	if err := configs.DB.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể tạo khóa học"})
		return
	}

	if req.DaysOfWeek != "" && req.TimeSlot != "" {
		sch := models.CourseSchedule{
			CourseID:    course.ID,
			CourseTitle: course.Title,
			TeacherID:   course.TeacherID,
			DayOfWeek:   req.DaysOfWeek,
			TimeSlot:    req.TimeSlot,
			Type:        course.Type,
			CreatedAt:   time.Now(),
		}
		configs.DB.Create(&sch)
	}

	c.JSON(http.StatusCreated, course)
}

// @Summary      Chi tiết khóa học
// @Description  Lấy thông tin chi tiết một khóa học theo ID
// @Tags         Courses
// @Produce      json
// @Param        id   path      int  true  "Course ID"
// @Success      200  {object}  models.Course
// @Failure      404  {object}  map[string]interface{}
// @Router       /courses/{id} [get]

func GetCourseByID(c *gin.Context) {
	id := c.Param("id")
	var course models.Course
	if err := configs.DB.Preload("Category").Preload("Lessons").Preload("Assignments").Preload("Quizzes").Preload("Schedules").First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy lớp học"})
		return
	}
	c.JSON(http.StatusOK, course)
}

// @Summary      Xóa khóa học
// @Description  Xóa khóa học và dọn dẹp các tệp liên quan
// @Tags         Courses
// @Produce      json
// @Param        id   path      int  true  "Course ID"
// @Success      200  {object}  map[string]interface{}
// @Router       /courses/{id} [delete]

func DeleteCourse(c *gin.Context) {
	id := c.Param("id")
	var course models.Course
	if err := configs.DB.Preload("Lessons").Preload("Assignments").Preload("Quizzes").First(&course, id).Error; err == nil {
		for _, l := range course.Lessons {
			configs.DeleteCloudinaryFile(l.FileURL)
		}
		for _, a := range course.Assignments {
			configs.DeleteCloudinaryFile(a.FileURL)
		}
		for _, q := range course.Quizzes {
			configs.DeleteCloudinaryFile(q.FileURL)
		}
	}
	configs.DB.Where("course_id = ?", id).Delete(&models.CourseSchedule{})
	configs.DB.Delete(&models.Course{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Xóa lớp học thành công"})
}

// @Summary      Cập nhật trạng thái duyệt khóa học
// @Description  Admin phê duyệt hoặc từ chối khóa học
// @Tags         Courses
// @Accept       json
// @Produce      json
// @Param        id      path  int     true  "Course ID"
// @Param        request body  object  true  "Trạng thái và ghi chú"
// @Success      200     {object} map[string]interface{}
// @Router       /courses/{id}/status [patch]

func UpdateCourseStatus(c *gin.Context) {
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
	configs.DB.Model(&models.Course{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":       req.Status,
		"admin_note":   req.AdminNote,
		"is_published": isPublished,
	})
	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật trạng thái thành công"})
}

// @Summary      Cấu hình phòng học trực tuyến (Live Meet)
// @Description  Cập nhật link và thời gian diễn ra buổi học trực tuyến
// @Tags         Courses
// @Accept       json
// @Produce      json
// @Param        id      path  int     true  "Course ID"
// @Param        request body  object  true  "Thông tin phòng học"
// @Success      200     {object} map[string]interface{}
// @Router       /courses/{id}/meet [patch]

func UpdateCourseMeet(c *gin.Context) {
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
	configs.DB.Model(&models.Course{}).Where("id = ?", id).Updates(map[string]interface{}{
		"meet_title":      req.MeetTitle,
		"meet_link":       req.MeetLink,
		"meet_start_time": req.MeetStartTime,
		"meet_is_active":  req.MeetIsActive,
	})
	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật phòng Meet thành công"})
}

// @Summary      Lọc danh sách giáo viên đạt điều kiện
// @Description  Tìm giáo viên theo chuyên môn và kiểm tra xung đột lịch dạy
// @Tags         Teachers
// @Produce      json
// @Param        subject      query     string  true   "Môn học"
// @Param        day_of_week  query     string  false  "Thứ trong tuần"
// @Param        time_slot    query     string  false  "Khung giờ"
// @Success      200          {object}  map[string]interface{}
// @Router       /teachers/qualified [get]

func GetQualifiedTeachers(c *gin.Context) {
	subject := c.Query("subject")
	dayOfWeek := c.Query("day_of_week")
	timeSlot := c.Query("time_slot")

	if subject == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Vui lòng chọn môn học"})
		return
	}

	var qualified []models.TeacherSubject
	configs.DB.Where("LOWER(subject) = ?", strings.ToLower(strings.TrimSpace(subject))).Find(&qualified)

	type TeacherResponse struct {
		TeacherID    uint     `json:"teacher_id"`
		TeacherName  string   `json:"teacher_name"`
		Email        string   `json:"email"`
		Avatar       string   `json:"avatar"`
		Subject      string   `json:"subject"`
		AllSubjects  []string `json:"all_subjects"`
		TotalCourses int64    `json:"total_courses"`
		IsAvailable  bool     `json:"is_available"`
		ConflictMsg  string   `json:"conflict_msg"`
	}

	var results []TeacherResponse
	targetAuthDB := configs.AuthDB
	if targetAuthDB == nil {
		targetAuthDB = configs.DB
	}

	for _, t := range qualified {
		isAvail := true
		conflictInfo := ""

		if dayOfWeek != "" && timeSlot != "" {
			var conflicts []models.CourseSchedule
			configs.DB.Where("teacher_id = ? AND day_of_week LIKE ? AND time_slot LIKE ?",
				t.TeacherID, "%"+dayOfWeek+"%", "%"+timeSlot+"%").Find(&conflicts)

			if len(conflicts) > 0 {
				isAvail = false
				conflictInfo = fmt.Sprintf("Bận dạy: %s", conflicts[0].CourseTitle)
			}
		}

		var u models.User
		targetAuthDB.Table("users").Where("id_users = ?", t.TeacherID).First(&u)
		avatar := u.Avatar
		if avatar == "" {
			avatar = fmt.Sprintf("https://ui-avatars.com/api/?name=%s&background=0284c7&color=ffffff&bold=true", url.QueryEscape(t.TeacherName))
		}

		var allSubs []string
		configs.DB.Model(&models.TeacherSubject{}).Where("teacher_id = ?", t.TeacherID).Pluck("subject", &allSubs)

		var totalClasses int64
		configs.DB.Model(&models.Course{}).Where("teacher_id = ?", t.TeacherID).Count(&totalClasses)

		results = append(results, TeacherResponse{
			TeacherID:    t.TeacherID,
			TeacherName:  t.TeacherName,
			Email:        u.Email,
			Avatar:       avatar,
			Subject:      t.Subject,
			AllSubjects:  allSubs,
			TotalCourses: totalClasses,
			IsAvailable:  isAvail,
			ConflictMsg:  conflictInfo,
		})
	}
	c.JSON(http.StatusOK, gin.H{"data": results})
}

// @Summary      Danh sách bài học của khóa học
// @Description  Lấy toàn bộ bài học thuộc một khóa học
// @Tags         Lessons
// @Produce      json
// @Param        id   path      int  true  "Course ID"
// @Success      200  {array}   models.Lesson
// @Router       /courses/{id}/lessons [get]

func GetLessons(c *gin.Context) {
	courseID := c.Param("id")
	var lessons []models.Lesson
	configs.DB.Where("course_id = ?", courseID).Order("id asc").Find(&lessons)
	c.JSON(http.StatusOK, lessons)
}

// @Summary      Tạo bài học mới
// @Description  Thêm bài giảng vào khóa học
// @Tags         Lessons
// @Accept       json
// @Produce      json
// @Param        id      path  int            true  "Course ID"
// @Param        request body  models.Lesson  true  "Thông tin bài học"
// @Success      201     {object} models.Lesson
// @Router       /courses/{id}/lessons [post]

func CreateLesson(c *gin.Context) {
	courseID, _ := strconv.Atoi(c.Param("id"))
	var lesson models.Lesson
	if err := c.ShouldBindJSON(&lesson); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	lesson.CourseID = uint(courseID)
	configs.DB.Create(&lesson)
	c.JSON(http.StatusCreated, lesson)
}

func DeleteLesson(c *gin.Context) {
	id := c.Param("id")
	var lesson models.Lesson
	if err := configs.DB.First(&lesson, id).Error; err == nil {
		configs.DeleteCloudinaryFile(lesson.FileURL)
		configs.DB.Delete(&lesson)
	}
	c.JSON(http.StatusOK, gin.H{"message": "Xóa bài học thành công"})
}

func UpdateLesson(c *gin.Context) {
	id := c.Param("id")
	var req models.Lesson
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var lesson models.Lesson
	if err := configs.DB.First(&lesson, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy bài học"})
		return
	}
	if req.FileURL != "" && req.FileURL != lesson.FileURL {
		configs.DeleteCloudinaryFile(lesson.FileURL)
	}
	configs.DB.Model(&lesson).Updates(map[string]interface{}{
		"title":     req.Title,
		"duration":  req.Duration,
		"content":   req.Content,
		"file_url":  req.FileURL,
		"file_name": req.FileName,
	})
	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật bài học thành công", "data": lesson})
}

func MarkLessonProgress(c *gin.Context) {
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

	lID := uint(parseUint(lessonID))
	now := time.Now()

	var progress models.LessonProgress
	err := configs.DB.Where("lesson_id = ? AND student_id = ?", lID, req.StudentID).First(&progress).Error
	if err != nil {
		progress = models.LessonProgress{
			CourseID:    req.CourseID,
			LessonID:    lID,
			StudentID:   req.StudentID,
			IsCompleted: req.IsCompleted,
			CompletedAt: &now,
		}
		configs.DB.Create(&progress)
	} else {
		configs.DB.Model(&progress).Updates(map[string]interface{}{
			"is_completed": req.IsCompleted,
			"completed_at": now,
		})
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật tiến độ thành công", "data": progress})
}

func GetStudentCourseProgress(c *gin.Context) {
	courseID := c.Param("id")
	studentID := c.Param("student_id")
	var completedLessons []models.LessonProgress
	configs.DB.Where("course_id = ? AND student_id = ? AND is_completed = true", courseID, studentID).Find(&completedLessons)

	var totalLessons int64
	configs.DB.Model(&models.Lesson{}).Where("course_id = ?", courseID).Count(&totalLessons)

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

// @Summary      Danh sách bài tập của khóa học
// @Description  Lấy danh sách bài tập về nhà
// @Tags         Assignments
// @Produce      json
// @Param        id   path      int  true  "Course ID"
// @Success      200  {array}   models.Assignment
// @Router       /courses/{id}/assignments [get]

func GetAssignments(c *gin.Context) {
	courseID := c.Param("id")
	var assignments []models.Assignment
	configs.DB.Where("course_id = ?", courseID).Order("id asc").Find(&assignments)
	c.JSON(http.StatusOK, assignments)
}

// @Summary      Giao bài tập mới
// @Description  Tạo bài tập về nhà cho lớp
// @Tags         Assignments
// @Accept       json
// @Produce      json
// @Param        id      path  int                true  "Course ID"
// @Param        request body  models.Assignment  true  "Thông tin bài tập"
// @Success      201     {object} models.Assignment
// @Router       /courses/{id}/assignments [post]

func CreateAssignment(c *gin.Context) {
	courseID, _ := strconv.Atoi(c.Param("id"))
	var assignment models.Assignment
	if err := c.ShouldBindJSON(&assignment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	assignment.CourseID = uint(courseID)
	configs.DB.Create(&assignment)
	c.JSON(http.StatusCreated, assignment)
}

func DeleteAssignment(c *gin.Context) {
	id := c.Param("id")
	var assignment models.Assignment
	if err := configs.DB.Preload("Submissions").First(&assignment, id).Error; err == nil {
		configs.DeleteCloudinaryFile(assignment.FileURL)
		for _, s := range assignment.Submissions {
			configs.DeleteCloudinaryFile(s.FileURL)
		}
		configs.DB.Delete(&assignment)
	}
	c.JSON(http.StatusOK, gin.H{"message": "Xóa bài tập thành công"})
}

func UpdateAssignment(c *gin.Context) {
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
	var assignment models.Assignment
	if err := configs.DB.First(&assignment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy bài tập"})
		return
	}
	if req.FileURL != "" && req.FileURL != assignment.FileURL {
		configs.DeleteCloudinaryFile(assignment.FileURL)
	}
	finalDueDate := req.DueDate
	if finalDueDate == "" {
		finalDueDate = req.DueDateAlt
	}
	finalMaxScore := req.MaxScore
	if finalMaxScore == 0 {
		finalMaxScore = req.MaxScoreAlt
	}
	configs.DB.Model(&assignment).Updates(map[string]interface{}{
		"title":       req.Title,
		"due_date":    finalDueDate,
		"max_score":   finalMaxScore,
		"description": req.Description,
		"file_url":    req.FileURL,
		"file_name":   req.FileName,
	})
	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật bài tập thành công", "data": assignment})
}

func SubmitAssignment(c *gin.Context) {
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
	submission := models.Submission{
		AssignmentID: uint(parseUint(assignmentID)),
		StudentID:    req.StudentID,
		StudentName:  req.StudentName,
		FileURL:      req.FileURL,
		FileName:     req.FileName,
	}
	if err := configs.DB.Create(&submission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu bài nộp"})
		return
	}
	configs.DB.Model(&models.Assignment{}).Where("id = ?", assignmentID).UpdateColumn("submitted_count", gorm.Expr("submitted_count + ?", 1))
	c.JSON(http.StatusCreated, gin.H{"message": "Nộp bài tập thành công!", "data": submission})
}

func GetSubmissions(c *gin.Context) {
	assignmentID := c.Param("id")
	var submissions []models.Submission
	configs.DB.Where("assignment_id = ?", assignmentID).Order("created_at desc").Find(&submissions)
	c.JSON(http.StatusOK, gin.H{"data": submissions})
}

// @Summary      Danh sách bài kiểm tra (Quizzes)
// @Description  Lấy danh sách đề thi/kiểm tra của khóa học
// @Tags         Quizzes
// @Produce      json
// @Param        id   path      int  true  "Course ID"
// @Success      200  {array}   models.Quiz
// @Router       /courses/{id}/quizzes [get]

func GetQuizzes(c *gin.Context) {
	courseID := c.Param("id")
	var quizzes []models.Quiz
	configs.DB.Where("course_id = ?", courseID).Order("id asc").Find(&quizzes)
	c.JSON(http.StatusOK, quizzes)
}

// @Summary      Tạo đề thi mới
// @Description  Tạo bài thi hoặc khảo thí
// @Tags         Quizzes
// @Accept       json
// @Produce      json
// @Param        id      path  int          true  "Course ID"
// @Param        request body  models.Quiz  true  "Thông tin đề thi"
// @Success      201     {object} models.Quiz
// @Router       /courses/{id}/quizzes [post]
func CreateQuiz(c *gin.Context) {
	courseID, _ := strconv.Atoi(c.Param("id"))
	var quiz models.Quiz
	if err := c.ShouldBindJSON(&quiz); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	quiz.CourseID = uint(courseID)
	configs.DB.Create(&quiz)
	c.JSON(http.StatusCreated, quiz)
}

func DeleteQuiz(c *gin.Context) {
	id := c.Param("id")
	var quiz models.Quiz
	if err := configs.DB.First(&quiz, id).Error; err == nil {
		configs.DeleteCloudinaryFile(quiz.FileURL)
		configs.DB.Delete(&quiz)
	}
	c.JSON(http.StatusOK, gin.H{"message": "Xóa bài thi thành công"})
}

func UpdateQuiz(c *gin.Context) {
	id := c.Param("id")
	var req models.Quiz
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var quiz models.Quiz
	if err := configs.DB.First(&quiz, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy bài kiểm tra"})
		return
	}
	if req.FileURL != "" && req.FileURL != quiz.FileURL {
		configs.DeleteCloudinaryFile(quiz.FileURL)
	}
	configs.DB.Model(&quiz).Updates(map[string]interface{}{
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

func SubmitQuizResult(c *gin.Context) {
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

	qID := uint(parseUint(quizID))
	sub := models.QuizSubmission{
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

	if err := configs.DB.Create(&sub).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu bài thi"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Đã lưu kết quả thi!", "data": sub})
}

func GetQuizSubmissions(c *gin.Context) {
	quizID := c.Param("id")
	var subs []models.QuizSubmission
	configs.DB.Where("quiz_id = ?", quizID).Order("submitted_at desc").Find(&subs)
	c.JSON(http.StatusOK, gin.H{"data": subs})
}

func RecordJoinAttendance(c *gin.Context) {
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
	logRecord := models.AttendanceLog{
		CourseID:    req.CourseID,
		StudentID:   req.StudentID,
		StudentName: req.StudentName,
		RoomName:    req.RoomName,
		JoinedAt:    time.Now(),
		CreatedAt:   time.Now(),
	}
	configs.DB.Create(&logRecord)
	c.JSON(http.StatusCreated, gin.H{"log_id": logRecord.ID, "message": "Ghi nhận vào phòng học thành công"})
}

func RecordLeaveAttendance(c *gin.Context) {
	var req struct {
		LogID uint `json:"log_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var logRecord models.AttendanceLog
	if err := configs.DB.First(&logRecord, req.LogID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy phiên học"})
		return
	}
	now := time.Now()
	duration := int(now.Sub(logRecord.JoinedAt).Minutes())
	if duration < 1 {
		duration = 1
	}
	configs.DB.Model(&logRecord).Updates(map[string]interface{}{
		"left_at":          now,
		"duration_minutes": duration,
	})
	c.JSON(http.StatusOK, gin.H{"message": "Ghi nhận rời phòng thành công", "duration": duration})
}

func GetCourseAttendanceLogs(c *gin.Context) {
	courseID := c.Param("id")
	var logs []models.AttendanceLog
	configs.DB.Where("course_id = ?", courseID).Order("joined_at desc").Find(&logs)
	c.JSON(http.StatusOK, gin.H{"data": logs})
}

func GetAllAttendanceLogs(c *gin.Context) {
	var logs []models.AttendanceLog
	configs.DB.Order("joined_at desc").Limit(100).Find(&logs)
	c.JSON(http.StatusOK, gin.H{"data": logs})
}

func GetCourseDiscussions(c *gin.Context) {
	courseID := c.Param("id")
	var discussions []models.CourseDiscussion
	configs.DB.Where("course_id = ?", courseID).Order("is_pinned desc, created_at desc").Find(&discussions)
	c.JSON(http.StatusOK, gin.H{"data": discussions})
}

func CreateDiscussion(c *gin.Context) {
	courseID, _ := strconv.Atoi(c.Param("id"))
	var req struct {
		UserID    uint   `json:"user_id"`
		UserName  string `json:"user_name"`
		UserRole  string `json:"user_role"`
		AvatarURL string `json:"avatar_url"`
		Content   string `json:"content"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	isPinned := false
	if req.UserRole == "admin" || req.UserRole == "teacher" {
		isPinned = true
	}

	discussion := models.CourseDiscussion{
		CourseID:   uint(courseID),
		UserID:     req.UserID,
		UserName:   req.UserName,
		UserRole:   req.UserRole,
		AvatarURL:  req.AvatarURL,
		Content:    req.Content,
		IsPinned:   isPinned,
		CreatedAt:  time.Now(),
	}

	if err := configs.DB.Create(&discussion).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu thảo luận"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Đăng thảo luận thành công", "data": discussion})
}

func DeleteDiscussion(c *gin.Context) {
	id := c.Param("id")
	if err := configs.DB.Delete(&models.CourseDiscussion{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể xóa thảo luận"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Đã xóa thảo luận thành công"})
}

// @Summary      Đăng ký tham gia lớp học
// @Description  Học viên đăng ký vào một khóa học mở rộng
// @Tags         Enrollment
// @Accept       json
// @Produce      json
// @Param        id      path  int     true  "Course ID"
// @Param        request body  object  true  "Thông tin học viên"
// @Success      201     {object} map[string]interface{}
// @Router       /courses/{id}/join [post]
func JoinCourse(c *gin.Context) {
	courseID := c.Param("id")
	var req struct {
		StudentID    uint   `json:"student_id"`
		StudentName  string `json:"student_name"`
		StudentEmail string `json:"student_email"`
		AvatarURL    string `json:"avatar_url"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	var course models.Course
	if err := configs.DB.First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy lớp học"})
		return
	}

	if course.Type == "school" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Đây là lớp chính quy, do Nhà trường phân bổ!",
		})
		return
	}

	var existing models.CourseStudent
	if err := configs.DB.Where("course_id = ? AND (student_id = ? OR student_email = ?)", course.ID, req.StudentID, req.StudentEmail).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bạn đã tham gia lớp học này rồi!"})
		return
	}

	enrollment := models.CourseStudent{
		CourseID:     course.ID,
		StudentID:    req.StudentID,
		StudentName:  req.StudentName,
		StudentEmail: req.StudentEmail,
		AvatarURL:    req.AvatarURL,
		CreatedAt:    time.Now(),
	}

	if err := configs.DB.Create(&enrollment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu dữ liệu tham gia"})
		return
	}

	var actualCount int64
	configs.DB.Model(&models.CourseStudent{}).Where("course_id = ?", course.ID).Count(&actualCount)
	configs.DB.Model(&course).UpdateColumn("students_count", actualCount)

	c.JSON(http.StatusCreated, gin.H{"message": "Đăng ký tham gia lớp thành công!", "data": enrollment})
}

func ImportStudentsBatch(c *gin.Context) {
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	var course models.Course
	if err := configs.DB.First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy lớp học"})
		return
	}

	cID := uint(parseUint(courseID))
	importedCount := 0
	alreadyInClassCount := 0
	createdUserCount := 0
	var errorLogs []string

	targetAuthDB := configs.AuthDB
	if targetAuthDB == nil {
		targetAuthDB = configs.DB
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

		var existingUser models.User
		errFind := targetAuthDB.Table("users").Where("email = ?", email).First(&existingUser).Error
		finalStudentID := existingUser.IDUsers

		if errFind != nil || finalStudentID == 0 {
			hashedPassBytes, hashErr := bcrypt.GenerateFromPassword([]byte(rawPass), bcrypt.DefaultCost)
			var hashedPass string
			if hashErr != nil {
				hashedPass = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
			} else {
				hashedPass = string(hashedPassBytes)
			}

			now := time.Now()
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
				var createdUser models.User
				targetAuthDB.Table("users").Where("email = ?", email).First(&createdUser)
				finalStudentID = createdUser.IDUsers

				if finalStudentID > 0 {
					createdUserCount++
					targetAuthDB.Table("student_profiles").Create(map[string]interface{}{
						"user_id":    finalStudentID,
						"grade":      course.Grade,
						"school":     course.SchoolName,
						"created_at": now,
						"updated_at": now,
					})
				}
			} else {
				errorLogs = append(errorLogs, fmt.Sprintf("Lỗi tạo user %s: %v", email, errInsert))
			}
		}

		if finalStudentID == 0 {
			finalStudentID = s.StudentID
		}

		var existing models.CourseStudent
		if err := configs.DB.Where("course_id = ? AND student_email = ?", cID, email).First(&existing).Error; err == nil {
			alreadyInClassCount++
			continue
		}

		enrollment := models.CourseStudent{
			CourseID:     cID,
			StudentID:    finalStudentID,
			StudentName:  name,
			StudentEmail: email,
			AvatarURL:    avatar,
			CreatedAt:    time.Now(),
		}

		if err := configs.DB.Create(&enrollment).Error; err == nil {
			importedCount++
		}
	}

	var totalCount int64
	configs.DB.Model(&models.CourseStudent{}).Where("course_id = ?", cID).Count(&totalCount)
	configs.DB.Model(&course).UpdateColumn("students_count", totalCount)

	c.JSON(http.StatusOK, gin.H{
		"message":            "Hoàn tất import học viên!",
		"imported_count":     importedCount,
		"created_user_count": createdUserCount,
		"total_students":     totalCount,
	})
}

// @Summary      Danh sách học viên trong lớp
// @Description  Lấy thông tin tất cả học viên đã tham gia khóa học
// @Tags         Enrollment
// @Produce      json
// @Param        id   path      int  true  "Course ID"
// @Success      200  {object}  map[string]interface{}
// @Router       /courses/{id}/students [get]
func GetCourseStudents(c *gin.Context) {
	courseID := c.Param("id")
	var enrollments []models.CourseStudent
	if err := configs.DB.Where("course_id = ?", courseID).Find(&enrollments).Error; err != nil {
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

func GetStudentJoinedCourses(c *gin.Context) {
	studentID := c.Param("student_id")
	studentEmail := c.Query("email")

	var enrollments []models.CourseStudent
	query := configs.DB.Where("student_id = ?", studentID)
	if studentEmail != "" {
		query = configs.DB.Where("student_id = ? OR student_email = ?", studentID, strings.ToLower(studentEmail))
	}

	if err := query.Find(&enrollments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi lấy dữ liệu"})
		return
	}

	if len(enrollments) == 0 {
		c.JSON(http.StatusOK, []models.Course{})
		return
	}

	var courseIDs []uint
	for _, e := range enrollments {
		courseIDs = append(courseIDs, e.CourseID)
	}

	var courses []models.Course
	configs.DB.Preload("Lessons").Preload("Assignments").Preload("Quizzes").Preload("Schedules").Where("id IN ?", courseIDs).Order("created_at desc").Find(&courses)
	c.JSON(http.StatusOK, courses)
}

func GetTeacherSubjectsHandler(c *gin.Context) {
	teacherID := c.Query("teacher_id")
	if teacherID == "" {
		teacherID = c.Param("teacher_id")
	}

	if teacherID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Thiếu teacher_id"})
		return
	}

	type TeacherSub struct {
		ID          uint   `json:"id" gorm:"column:id"`
		TeacherID   uint   `json:"teacher_id" gorm:"column:teacher_id"`
		TeacherName string `json:"teacher_name" gorm:"column:teacher_name"`
		Subject     string `json:"subject" gorm:"column:subject"`
	}

	var list []TeacherSub
	configs.DB.Table("teacher_subjects").Where("teacher_id = ?", teacherID).Find(&list)

	if len(list) == 0 {
		var spec string
		configs.DB.Table("teacher_profiles").Select("specialization").Where("user_id = ?", teacherID).Scan(&spec)
		if spec != "" {
			list = append(list, TeacherSub{
				TeacherID: 0,
				Subject:   spec,
			})
		}
	}
	c.JSON(http.StatusOK, gin.H{"data": list})
}

// @Summary      Lấy danh sách tài liệu chia sẻ cộng đồng
// @Description  Kho tài liệu Studocu chia sẻ sinh viên
// @Tags         Shared Documents
// @Produce      json
// @Param        subject   query     string  false  "Môn học"
// @Param        category  query     string  false  "Danh mục tài liệu"
// @Success      200       {object}  map[string]interface{}
// @Router       /shared-documents [get]

func GetSharedDocuments(c *gin.Context) {
	var docs []models.SharedDocument
	query := configs.DB.Preload("CategoryRel").Model(&models.SharedDocument{})

	if subject := c.Query("subject"); subject != "" {
		query = query.Where("subject = ?", subject)
	}

	if category := c.Query("category"); category != "" {
		query = query.Joins("LEFT JOIN document_categories ON document_categories.id = shared_documents.category_id").
			Where("document_categories.slug = ? OR shared_documents.category ILIKE ?", category, "%"+category+"%")
	}

	// Chỉ học sinh xem: phải được duyệt VÀ đang ở chế độ công khai
	if c.Query("all") != "true" {
		query = query.Where("is_approved = ? AND is_public = ?", true, true)
	}

	if err := query.Order("created_at desc").Find(&docs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi truy xuất dữ liệu"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": docs})
}

func CreateSharedDocument(c *gin.Context) {
    var req struct {
        StudentID   uint   `json:"student_id"`
        StudentName string `json:"student_name"`
        Title       string `json:"title"`
        Description string `json:"description"`
        FileURL     string `json:"file_url"`
        Category    string `json:"category"`
        CategoryID  *uint  `json:"category_id"`
        Subject     string `json:"subject"`
        IsPublic    *bool  `json:"is_public"`
    }

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
        return
    }

    // Nếu frontend không gửi is_public thì mặc định true, nếu gửi false thì giữ nguyên false
    isPublicVal := true
    if req.IsPublic != nil {
        isPublicVal = *req.IsPublic
    }

    input := models.SharedDocument{
        StudentID:   req.StudentID,
        StudentName: req.StudentName,
        Title:       req.Title,
        Description: req.Description,
        FileURL:     req.FileURL,
        Category:    req.Category,
        CategoryID:  req.CategoryID,
        Subject:     req.Subject,
        CreatedAt:   time.Now(),
        IsApproved:  false,
        IsPublic:    &isPublicVal, // Truyền con trỏ boolean vào
    }

    // Tự động map category_id
    if input.CategoryID == nil && input.Category != "" {
        var docCat models.DocumentCategory
        catLower := strings.ToLower(strings.TrimSpace(input.Category))
        err := configs.DB.Where("LOWER(name) = ? OR slug = ?", catLower, catLower).First(&docCat).Error
        if err == nil {
            input.CategoryID = &docCat.ID
        }
    }

    // Lưu vào database
    if err := configs.DB.Create(&input).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi lưu tài liệu"})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"message": "Đăng tài liệu thành công!", "data": input})
}

func ApproveSharedDocument(c *gin.Context) {
	id := c.Param("id")
	if err := configs.DB.Model(&models.SharedDocument{}).Where("id = ?", id).Update("is_approved", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi duyệt"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Đã phê duyệt tài liệu"})
}

func DeleteSharedDocument(c *gin.Context) {
	id := c.Param("id")
	var doc models.SharedDocument
	if err := configs.DB.First(&doc, id).Error; err == nil {
		configs.DeleteCloudinaryFile(doc.FileURL)
	}
	if err := configs.DB.Delete(&models.SharedDocument{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi xóa"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Đã xóa tài liệu"})
}

// @Summary      Danh mục tài liệu
// @Description  Lấy danh sách các danh mục tài liệu học thuật
// @Tags         Document Categories
// @Produce      json
// @Success      200  {object}  map[string]interface{}
// @Router       /document-categories [get]
func GetDocumentCategories(c *gin.Context) {
	var categories []models.DocumentCategory
	if err := configs.DB.Order("id asc").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi lấy danh mục tài liệu"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": categories})
}

// @Summary      Chi tiết tài liệu chia sẻ
// @Description  Lấy thông tin 1 tài liệu theo ID và tăng lượt xem
// @Tags         Shared Documents
// @Produce      json
// @Param        id   path      int  true  "Document ID"
// @Success      200  {object}  models.SharedDocument
// @Failure      404  {object}  map[string]interface{}
// @Router       /shared-documents/{id} [get]
func GetSharedDocumentByID(c *gin.Context) {
	id := c.Param("id")
	var doc models.SharedDocument

	if err := configs.DB.Preload("CategoryRel").First(&doc, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy tài liệu"})
		return
	}

	// Tự động tăng lượt xem
	configs.DB.Model(&doc).UpdateColumn("views", gorm.Expr("views + ?", 1))
	doc.Views++

	c.JSON(http.StatusOK, gin.H{"data": doc})
}