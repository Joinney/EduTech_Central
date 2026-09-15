package controllers

import (
	"context"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	"quiz-service/configs"
	"quiz-service/services"
)

func GetExamFullDetailHandler(c *gin.Context) {
	examIDStr := c.Param("exam_id")
	objID, err := primitive.ObjectIDFromHex(examIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Exam ID không hợp lệ"})
		return
	}

	var exam services.ExamDocument
	err = configs.ExamsCol.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&exam)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy bài thi"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": exam})
}

func GetExamDetailHandler(c *gin.Context) {
	examIDStr := c.Param("exam_id")
	objID, err := primitive.ObjectIDFromHex(examIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Exam ID không hợp lệ"})
		return
	}

	var exam services.ExamDocument
	err = configs.ExamsCol.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&exam)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy bài thi"})
		return
	}

	safeQuestions := make([]services.QuestionItem, len(exam.Questions))
	for i, q := range exam.Questions {
		safeQuestions[i] = services.QuestionItem{
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

func StartOrResumeSessionHandler(c *gin.Context) {
	examIDStr := c.Param("exam_id")
	objID, err := primitive.ObjectIDFromHex(examIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Exam ID không hợp lệ"})
		return
	}

	var req struct {
		StudentID   uint   `json:"student_id" binding:"required"`
		StudentName string `json:"student_name"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Thiếu thông tin học sinh"})
		return
	}

	var existingSubmission services.StudentSubmission
	err = configs.SubmissionsCol.FindOne(context.Background(), bson.M{
		"exam_id":    objID,
		"student_id": req.StudentID,
	}).Decode(&existingSubmission)
	if err == nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error":        "Bạn đã hoàn thành bài thi này trước đó!",
			"is_submitted": true,
		})
		return
	}

	var exam services.ExamDocument
	if err := configs.ExamsCol.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&exam); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy đề thi"})
		return
	}

	totalDurationSecs := exam.DurationMins * 60
	if totalDurationSecs <= 0 {
		totalDurationSecs = 15 * 60
	}

	var session services.StudentExamSession
	err = configs.SessionsCol.FindOne(context.Background(), bson.M{
		"exam_id":    objID,
		"student_id": req.StudentID,
	}).Decode(&session)

	now := time.Now()

	if err != nil {
		session = services.StudentExamSession{
			ID:               primitive.NewObjectID(),
			ExamID:           objID,
			StudentID:        req.StudentID,
			StudentName:      req.StudentName,
			Answers:          make(map[string]int),
			FlaggedQuestions: []int{},
			ViolationsCount:  0,
			ViolationLogs:    []services.TabViolationLog{},
			StartedAt:        now,
			LastUpdatedAt:    now,
		}
		configs.SessionsCol.InsertOne(context.Background(), session)
	}

	elapsedSecs := int(now.Sub(session.StartedAt).Seconds())
	remainingSecs := totalDurationSecs - elapsedSecs
	isExpired := false

	if remainingSecs <= 0 {
		remainingSecs = 0
		isExpired = true
	}

	safeQuestions := make([]services.QuestionItem, len(exam.Questions))
	for i, q := range exam.Questions {
		safeQuestions[i] = services.QuestionItem{
			QuestionID: q.QuestionID,
			Question:   q.Question,
			Options:    q.Options,
			Points:     q.Points,
			CorrectAns: -1,
		}
	}
	exam.Questions = safeQuestions

	c.JSON(http.StatusOK, gin.H{
		"exam":              exam,
		"session_id":        session.ID.Hex(),
		"started_at":        session.StartedAt,
		"remaining_seconds": remainingSecs,
		"is_expired":        isExpired,
		"saved_answers":     session.Answers,
		"saved_flagged":     session.FlaggedQuestions,
		"violations_count":  session.ViolationsCount,
		"violation_logs":    session.ViolationLogs,
	})
}

func SaveSessionProgressHandler(c *gin.Context) {
	examIDStr := c.Param("exam_id")
	objID, err := primitive.ObjectIDFromHex(examIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Exam ID không hợp lệ"})
		return
	}

	var req struct {
		StudentID        uint                      `json:"student_id" binding:"required"`
		Answers          map[string]int            `json:"answers"`
		FlaggedQuestions []int                     `json:"flagged_questions"`
		ViolationsCount  int                       `json:"violations_count"`
		ViolationLogs    []services.TabViolationLog `json:"violation_logs"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu cập nhật không hợp lệ"})
		return
	}

	filter := bson.M{
		"exam_id":    objID,
		"student_id": req.StudentID,
	}

	update := bson.M{
		"$set": bson.M{
			"answers":           req.Answers,
			"flagged_questions": req.FlaggedQuestions,
			"violations_count":  req.ViolationsCount,
			"violation_logs":    req.ViolationLogs,
			"last_updated_at":   time.Now(),
		},
	}

	opts := options.Update().SetUpsert(false)
	_, err = configs.SessionsCol.UpdateOne(context.Background(), filter, update, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu tiến độ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Đã lưu tiến độ thành công"})
}

func ParsePreviewHandler(c *gin.Context) {
	var req struct {
		FileDocURL string `json:"file_doc_url" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Vui lòng cung cấp file_doc_url"})
		return
	}

	questions, err := services.ParseDocxQuestionsFromURL(req.FileDocURL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Lỗi đọc file Word: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":            questions,
		"total_questions": len(questions),
	})
}

func CreateExamHandler(c *gin.Context) {
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

	var questions []services.QuestionItem

	if req.Type == "QUIZ" && req.FileDocURL != "" {
		parsed, err := services.ParseDocxQuestionsFromURL(req.FileDocURL)
		if err == nil && len(parsed) > 0 {
			questions = parsed
			req.TotalQuestions = len(parsed)
		}
	}

	doc := services.ExamDocument{
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

	_, err := configs.ExamsCol.InsertOne(context.Background(), doc)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu đề thi vào MongoDB Atlas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Khởi tạo bài thi thành công",
		"data":    doc,
	})
}

func GetExamsByCourseHandler(c *gin.Context) {
	cIDStr := c.Param("course_id")
	courseID, _ := strconv.Atoi(cIDStr)

	cursor, err := configs.ExamsCol.Find(context.Background(), bson.M{"course_id": uint(courseID)})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi truy vấn MongoDB"})
		return
	}
	defer cursor.Close(context.Background())

	var list []services.ExamDocument
	if err := cursor.All(context.Background(), &list); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi parse dữ liệu"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": list})
}

func SubmitExamHandler(c *gin.Context) {
	examIDStr := c.Param("exam_id")
	objID, err := primitive.ObjectIDFromHex(examIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Exam ID không hợp lệ"})
		return
	}

	var req struct {
		StudentID       uint                      `json:"student_id" binding:"required"`
		StudentName     string                    `json:"student_name"`
		Answers         map[string]int            `json:"answers"`
		ViolationsCount int                       `json:"violations_count"`
		ViolationLogs   []services.TabViolationLog `json:"violation_logs"`
		TimeSpentSecs   int                       `json:"time_spent_secs"`
		EssayFileURL    string                    `json:"essay_file_url"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu nộp bài không hợp lệ"})
		return
	}

	var existing services.StudentSubmission
	err = configs.SubmissionsCol.FindOne(context.Background(), bson.M{
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

	var exam services.ExamDocument
	if err := configs.ExamsCol.FindOne(context.Background(), bson.M{"_id": objID}).Decode(&exam); err != nil {
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

	sub := services.StudentSubmission{
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

	_, err = configs.SubmissionsCol.InsertOne(context.Background(), sub)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Không thể lưu kết quả bài thi"})
		return
	}

	configs.SessionsCol.DeleteOne(context.Background(), bson.M{
		"exam_id":    objID,
		"student_id": req.StudentID,
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "Nộp bài thi thành công",
		"data":    sub,
	})
}

func GetStudentSubmissionHandler(c *gin.Context) {
	examIDStr := c.Param("exam_id")
	objID, _ := primitive.ObjectIDFromHex(examIDStr)
	sIDStr := c.Param("student_id")
	studentID, _ := strconv.Atoi(sIDStr)

	var sub services.StudentSubmission
	err := configs.SubmissionsCol.FindOne(context.Background(), bson.M{
		"exam_id":    objID,
		"student_id": uint(studentID),
	}).Decode(&sub)

	if err != nil {
		c.JSON(http.StatusOK, gin.H{"has_submitted": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"has_submitted": true, "data": sub})
}

func GetAllSubmissionsHandler(c *gin.Context) {
	examIDStr := c.Param("exam_id")
	objID, err := primitive.ObjectIDFromHex(examIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Exam ID không hợp lệ"})
		return
	}

	cursor, err := configs.SubmissionsCol.Find(context.Background(), bson.M{"exam_id": objID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi truy vấn danh sách nộp bài"})
		return
	}
	defer cursor.Close(context.Background())

	var subsList []services.StudentSubmission
	cursor.All(context.Background(), &subsList)

	sessCursor, err := configs.SessionsCol.Find(context.Background(), bson.M{"exam_id": objID})
	var activeSessions []services.StudentExamSession
	if err == nil {
		defer sessCursor.Close(context.Background())
		sessCursor.All(context.Background(), &activeSessions)
	}

	c.JSON(http.StatusOK, gin.H{
		"data":            subsList,
		"active_sessions": activeSessions,
	})
}