package configs

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	MongoClient    *mongo.Client
	QuizDB         *mongo.Database
	ExamsCol       *mongo.Collection
	SubmissionsCol *mongo.Collection
	SessionsCol    *mongo.Collection
)

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
	SessionsCol = QuizDB.Collection("exam_sessions")

	fmt.Println("🍃 [quiz-service] Kết nối thành công tới MongoDB Atlas (edutech_quiz_db)!")
}