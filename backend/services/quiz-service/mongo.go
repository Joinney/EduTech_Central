package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	MongoClient    *mongo.Client
	QuizDB         *mongo.Database
	ExamsCol       *mongo.Collection
	SubmissionsCol *mongo.Collection
)

// 1. Cấu trúc câu hỏi trắc nghiệm
type QuestionItem struct {
	QuestionID int      `json:"question_id" bson:"question_id"`
	Question   string   `json:"question" bson:"question"`
	Options    []string `json:"options" bson:"options"`         // A, B, C, D
	CorrectAns int      `json:"correct_ans" bson:"correct_ans"` // Index 0 (A), 1 (B), 2 (C), 3 (D)
	Points     float64  `json:"points" bson:"points"`
}

// 2. Cấu trúc Đề thi trong MongoDB
type ExamDocument struct {
	ID             primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	CourseID       uint               `json:"course_id" bson:"course_id"`
	CourseTitle    string             `json:"course_title" bson:"course_title"`
	Title          string             `json:"title" bson:"title"`
	Type           string             `json:"type" bson:"type"` // "QUIZ" hoặc "ESSAY"
	DurationMins   int                `json:"duration_mins" bson:"duration_mins"`
	StartTime      string             `json:"start_time" bson:"start_time"`
	EndTime        string             `json:"end_time" bson:"end_time"`
	TotalQuestions int                `json:"total_questions" bson:"total_questions"`
	PassScore      float64            `json:"pass_score" bson:"pass_score"`
	FileDocURL     string             `json:"file_doc_url" bson:"file_doc_url"`
	Description    string             `json:"description" bson:"description"`
	Questions      []QuestionItem     `json:"questions" bson:"questions"`
	CreatedAt      time.Time          `json:"created_at" bson:"created_at"`
}

// 3. Cấu trúc Nhật ký vi phạm chuyển Tab
type TabViolationLog struct {
	Timestamp  time.Time `json:"timestamp" bson:"timestamp"`
	Action     string    `json:"action" bson:"action"`
	WarningMsg string    `json:"warning_msg" bson:"warning_msg"`
}

// 4. Cấu trúc Bài làm của học sinh
type StudentSubmission struct {
	ID              primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	ExamID          primitive.ObjectID `json:"exam_id" bson:"exam_id"`
	CourseID        uint               `json:"course_id" bson:"course_id"`
	StudentID       uint               `json:"student_id" bson:"student_id"`
	StudentName     string             `json:"student_name" bson:"student_name"`
	Answers         map[string]int     `json:"answers" bson:"answers"`
	TotalCorrect    int                `json:"total_correct" bson:"total_correct"`
	Score           float64            `json:"score" bson:"score"`
	ViolationsCount int                `json:"violations_count" bson:"violations_count"`
	ViolationLogs   []TabViolationLog  `json:"violation_logs" bson:"violation_logs"`
	TimeSpentSecs   int                `json:"time_spent_secs" bson:"time_spent_secs"`
	EssayFileURL    string             `json:"essay_file_url" bson:"essay_file_url"`
	SubmittedAt     time.Time          `json:"submitted_at" bson:"submitted_at"`
}

func InitMongoDB() {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb+srv://thugoodcat_db_user:BVpl3MX7cQ05zEqS@edutech.u4syj9y.mongodb.net/edutech_quiz_db?retryWrites=true&w=majority&appName=EduTech"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("❌ Lỗi kết nối MongoDB Atlas: %v", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("❌ Không thể Ping MongoDB Atlas: %v", err)
	}

	MongoClient = client
	QuizDB = client.Database("edutech_quiz_db")
	ExamsCol = QuizDB.Collection("exams")
	SubmissionsCol = QuizDB.Collection("submissions")

	fmt.Println("🍃 [quiz-service] Kết nối thành công tới MongoDB Atlas (edutech_quiz_db)!")
}