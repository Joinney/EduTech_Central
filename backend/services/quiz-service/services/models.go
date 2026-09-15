package services

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type QuestionItem struct {
	QuestionID int      `json:"question_id" bson:"question_id"`
	Question   string   `json:"question" bson:"question"`
	Options    []string `json:"options" bson:"options"`
	CorrectAns int      `json:"correct_ans" bson:"correct_ans"`
	Points     float64  `json:"points" bson:"points"`
}

type ExamDocument struct {
	ID             primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	CourseID       uint               `json:"course_id" bson:"course_id"`
	CourseTitle    string             `json:"course_title" bson:"course_title"`
	Title          string             `json:"title" bson:"title"`
	Type           string             `json:"type" bson:"type"`
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

type TabViolationLog struct {
	Timestamp  time.Time `json:"timestamp" bson:"timestamp"`
	Action     string    `json:"action" bson:"action"`
	WarningMsg string    `json:"warning_msg" bson:"warning_msg"`
}

type StudentExamSession struct {
	ID               primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	ExamID           primitive.ObjectID `json:"exam_id" bson:"exam_id"`
	StudentID        uint               `json:"student_id" bson:"student_id"`
	StudentName      string             `json:"student_name" bson:"student_name"`
	Answers          map[string]int     `json:"answers" bson:"answers"`
	FlaggedQuestions []int              `json:"flagged_questions" bson:"flagged_questions"`
	ViolationsCount  int                `json:"violations_count" bson:"violations_count"`
	ViolationLogs    []TabViolationLog  `json:"violation_logs" bson:"violation_logs"`
	StartedAt        time.Time          `json:"started_at" bson:"started_at"`
	LastUpdatedAt    time.Time          `json:"last_updated_at" bson:"last_updated_at"`
}

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