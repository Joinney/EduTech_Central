package main

import (
	"context"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func main() {
	InitMongoDB()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := r.Group("/api/v1/quizzes")
	{
		api.POST("/create", createExamHandler)
		api.POST("/parse-preview", parsePreviewHandler)
		api.GET("/course/:course_id", getExamsByCourseHandler)
		api.GET("/:exam_id", getExamDetailHandler)
		api.POST("/:exam_id/submit", submitExamHandler)
		api.GET("/:exam_id/submission/:student_id", getStudentSubmissionHandler)
		api.GET("/:exam_id/submissions", getAllSubmissionsHandler)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8003"
	}
	r.Run(":" + port)
}

func parsePreviewHandler(c *gin.Context) {
	var req struct {
		FileDocURL string `json:"file_doc_url" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Vui lòng cung cấp file_doc_url"})
		return
	}

	questions, err := ParseDocxQuestionsFromURL(req.FileDocURL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Lỗi đọc file Word: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":            questions,
		"total_questions": len(questions),
	})
}

func createExamHandler(c *gin.Context) {
	var req struct {
		CourseID       uint    `json:"course_id"`
		CourseTitle    string  `json:"course_title"`
		Title          string  `json:"title" binding:"required"`
		Type           string  `json:"type"`
		DurationMins   int     `json:"duration_mins"`
		StartTime      string  `json:"start_time"`
		EndTime        string  `json:"end_time"`
		TotalQuestions int     `json:"total_questions"`
		PassScore      float64 `json:"pass_score"`
		FileDocURL     string  `json:"file_doc_url"`
		Description    string  `json:"description"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ: " + err.Error()})
		return
	}

	if req.Type == "" {
		req.Type = "QUIZ"
	}
	if req.DurationMins == 0 {
		req.DurationMins = 15
	}
	if req.PassScore == 0 {
		req.PassScore = 5.0
	}

	var questions []QuestionItem

	if req.Type == "QUIZ" && req.FileDocURL != "" {
		parsed, err := ParseDocxQuestionsFromURL(req.FileDocURL)
		if err == nil && len(parsed) > 0 {
			questions = parsed
			req.TotalQuestions = len(parsed)
		}
	}

	doc := ExamDocument{
		ID:             primitive.NewObjectID(),
		CourseID:       req.CourseID,
		CourseTitle:    req.CourseTitle,
		Title:          req.Title,
		Type:           req.Type,
		DurationMins:   req.DurationMins,
		StartTime:      req.StartTime,
		EndTime:        req.EndTime,
		TotalQuestions: req.TotalQuestions,
		PassScore:      req.PassScore,
		FileDocURL:     req.FileDocURL,
		Description:    req.Description,
		Questions:      questions,
		CreatedAt:      time.Now(),
	}

	_, err := ExamsCol.InsertOne(context.Background(), doc)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu đề thi vào MongoDB Atlas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Khởi tạo bài thi thành công",
		"data":    doc,
	})
}

func getExamsByCourseHandler(c *gin.Context) {
	cIDStr := c.Param("course_id")
	courseID, _ := strconv.Atoi(cIDStr)

	cursor, err := ExamsCol.Find(context.Background(), bson.M{"course_id": uint(courseID)})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi truy vấn MongoDB"})
		return
	}
	defer cursor.Close(context.Background())

	var list []ExamDocument
	if err := cursor.All(context.Background(), &list); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi parse dữ liệu"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": list})
}

func getExamDetailHandler(c *gin.Context) {
	examIDStr := c.Param("exam_id")
	objID, err := primitive.ObjectIDFromHex(examIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Exam ID không hợp lệ"})
		return
	}

	var exam ExamDocument
	err = ExamsCol.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&exam)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy bài thi"})
		return
	}

	safeQuestions := make([]QuestionItem, len(exam.Questions))
	for i, q := range exam.Questions {
		safeQuestions[i] = QuestionItem{
			QuestionID: q.QuestionID,
			Question:   q.Question,
			Options:    q.Options,
			Points:     q.Points,
			CorrectAns: -1,
		}
	}
	exam.Questions = safeQuestions

	c.JSON(http.StatusOK, gin.H{"data": exam})
}

func submitExamHandler(c *gin.Context) {
	examIDStr := c.Param("exam_id")
	objID, err := primitive.ObjectIDFromHex(examIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Exam ID không hợp lệ"})
		return
	}

	var req struct {
		StudentID       uint              `json:"student_id" binding:"required"`
		StudentName     string            `json:"student_name"`
		Answers         map[string]int    `json:"answers"`
		ViolationsCount int               `json:"violations_count"`
		ViolationLogs   []TabViolationLog `json:"violation_logs"`
		TimeSpentSecs   int               `json:"time_spent_secs"`
		EssayFileURL    string            `json:"essay_file_url"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu nộp bài không hợp lệ"})
		return
	}

	var existing StudentSubmission
	err = SubmissionsCol.FindOne(context.Background(), bson.M{
		"exam_id":    objID,
		"student_id": req.StudentID,
	}).Decode(&existing)

	if err == nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Bạn đã hoàn thành bài thi này trước đó và không được phép làm lại!",
			"data":  existing,
		})
		return
	}

	var exam ExamDocument
	if err := ExamsCol.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&exam); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bài thi không tồn tại"})
		return
	}

	totalCorrect := 0
	finalScore := 0.0

	if exam.Type == "QUIZ" && len(exam.Questions) > 0 {
		for i, q := range exam.Questions {
			key := strconv.Itoa(i)
			if studentAns, exists := req.Answers[key]; exists && studentAns == q.CorrectAns {
				totalCorrect++
			}
		}
		finalScore = float64(totalCorrect) / float64(len(exam.Questions)) * 10.0
		finalScore = float64(int(finalScore*10)) / 10.0
	}

	sub := StudentSubmission{
		ID:              primitive.NewObjectID(),
		ExamID:          objID,
		CourseID:        exam.CourseID,
		StudentID:       req.StudentID,
		StudentName:     req.StudentName,
		Answers:         req.Answers,
		TotalCorrect:    totalCorrect,
		Score:           finalScore,
		ViolationsCount: req.ViolationsCount,
		ViolationLogs:   req.ViolationLogs,
		TimeSpentSecs:   req.TimeSpentSecs,
		EssayFileURL:    req.EssayFileURL,
		SubmittedAt:     time.Now(),
	}

	_, err = SubmissionsCol.InsertOne(context.Background(), sub)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu kết quả bài thi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Nộp bài thi thành công",
		"data":    sub,
	})
}

func getStudentSubmissionHandler(c *gin.Context) {
	examIDStr := c.Param("exam_id")
	objID, _ := primitive.ObjectIDFromHex(examIDStr)
	sIDStr := c.Param("student_id")
	studentID, _ := strconv.Atoi(sIDStr)

	var sub StudentSubmission
	err := SubmissionsCol.FindOne(context.Background(), bson.M{
		"exam_id":    objID,
		"student_id": uint(studentID),
	}).Decode(&sub)

	if err != nil {
		c.JSON(http.StatusOK, gin.H{"has_submitted": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"has_submitted": true, "data": sub})
}

func getAllSubmissionsHandler(c *gin.Context) {
	examIDStr := c.Param("exam_id")
	objID, _ := primitive.ObjectIDFromHex(examIDStr)

	cursor, err := SubmissionsCol.Find(context.Background(), bson.M{"exam_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi truy vấn danh sách nộp bài"})
		return
	}
	defer cursor.Close(context.Background())

	var list []StudentSubmission
	cursor.All(context.Background(), &list)

	c.JSON(http.StatusOK, gin.H{"data": list})
}