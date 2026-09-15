package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"quiz-service/controllers"
)

const openAPISpecJSON = `{
  "openapi": "3.1.0",
  "info": {
    "title": "EduTech Quiz Service API",
    "version": "1.0.0",
    "description": "Microservice quản lý bài kiểm tra, bóc tách đề thi docx và chấm điểm trực tuyến."
  },
  "paths": {
    "/api/v1/quizzes/create": {
      "post": {
        "tags": ["Quiz Management"],
        "summary": "Tạo bài thi mới",
        "responses": { "200": { "description": "Tạo bài thi thành công" } }
      }
    },
    "/api/v1/quizzes/parse-preview": {
      "post": {
        "tags": ["Quiz Management"],
        "summary": "Bóc tách câu hỏi từ file docx",
        "responses": { "200": { "description": "Danh sách câu hỏi trích xuất" } }
      }
    },
    "/api/v1/quizzes/course/{course_id}": {
      "get": {
        "tags": ["Quiz Management"],
        "summary": "Lấy danh sách đề thi theo ID khóa học",
        "parameters": [
          { "name": "course_id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": { "200": { "description": "Danh sách đề thi" } }
      }
    },
    "/api/v1/quizzes/{exam_id}": {
      "get": {
        "tags": ["Student Exam"],
        "summary": "Học sinh lấy đề thi (ẩn đáp án đúng)",
        "parameters": [
          { "name": "exam_id", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "responses": { "200": { "description": "Nội dung đề thi cho học sinh" } }
      }
    },
    "/api/v1/quizzes/{exam_id}/full": {
      "get": {
        "tags": ["Teacher Exam"],
        "summary": "Giáo viên lấy đề thi đầy đủ (kèm đáp án đúng)",
        "parameters": [
          { "name": "exam_id", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "responses": { "200": { "description": "Nội dung đề thi đầy đủ" } }
      }
    },
    "/api/v1/quizzes/{exam_id}/start": {
      "post": {
        "tags": ["Exam Session"],
        "summary": "Bắt đầu hoặc tiếp tục phiên làm bài (tính giờ server)",
        "parameters": [
          { "name": "exam_id", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "responses": { "200": { "description": "Thông tin phiên làm bài" } }
      }
    },
    "/api/v1/quizzes/{exam_id}/save-progress": {
      "post": {
        "tags": ["Exam Session"],
        "summary": "Lưu tiến độ làm bài thi định kỳ",
        "parameters": [
          { "name": "exam_id", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "responses": { "200": { "description": "Lưu tiến độ thành công" } }
      }
    },
    "/api/v1/quizzes/{exam_id}/submit": {
      "post": {
        "tags": ["Exam Submission"],
        "summary": "Nộp bài thi và chấm điểm",
        "parameters": [
          { "name": "exam_id", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "responses": { "200": { "description": "Kết quả bài nộp" } }
      }
    },
    "/api/v1/quizzes/{exam_id}/submission/{student_id}": {
      "get": {
        "tags": ["Exam Submission"],
        "summary": "Lấy kết quả bài thi của học sinh theo student_id",
        "parameters": [
          { "name": "exam_id", "in": "path", "required": true, "schema": { "type": "string" } },
          { "name": "student_id", "in": "path", "required": true, "schema": { "type": "integer" } }
        ],
        "responses": { "200": { "description": "Kết quả bài nộp" } }
      }
    },
    "/api/v1/quizzes/{exam_id}/submissions": {
      "get": {
        "tags": ["Exam Submission"],
        "summary": "Lấy toàn bộ bài thi đã nộp và các phiên đang hoạt động",
        "parameters": [
          { "name": "exam_id", "in": "path", "required": true, "schema": { "type": "string" } }
        ],
        "responses": { "200": { "description": "Danh sách nộp bài" } }
      }
    }
  }
}`

const swaggerPageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EduTech Quiz Service - Swagger UI</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style>
    body { margin: 0; background: #fafafa; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ]
      });
    };
  </script>
</body>
</html>`

func RegisterQuizRoutes(r *gin.Engine) {
	// Swagger & OpenAPI endpoints
	r.GET("/openapi.json", func(c *gin.Context) {
		c.Data(http.StatusOK, "application/json; charset=utf-8", []byte(openAPISpecJSON))
	})

	r.GET("/docs", func(c *gin.Context) {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(swaggerPageHTML))
	})

	api := r.Group("/api/v1/quizzes")
	{
		api.POST("/create", controllers.CreateExamHandler)
		api.POST("/parse-preview", controllers.ParsePreviewHandler)
		api.GET("/course/:course_id", controllers.GetExamsByCourseHandler)

		// API lấy đề
		api.GET("/:exam_id", controllers.GetExamDetailHandler)
		api.GET("/:exam_id/full", controllers.GetExamFullDetailHandler)

		// Phiên làm bài & Tự lưu tiến độ
		api.POST("/:exam_id/start", controllers.StartOrResumeSessionHandler)
		api.POST("/:exam_id/save-progress", controllers.SaveSessionProgressHandler)

		// Nộp bài & Thống kê
		api.POST("/:exam_id/submit", controllers.SubmitExamHandler)
		api.GET("/:exam_id/submission/:student_id", controllers.GetStudentSubmissionHandler)
		api.GET("/:exam_id/submissions", controllers.GetAllSubmissionsHandler)
	}
}