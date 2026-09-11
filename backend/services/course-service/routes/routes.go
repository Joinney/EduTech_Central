package routes

import (
	"edutech/course-service/controllers"
	

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api/v1")
	{
		// --- KHÓA HỌC & KIỂM DUYỆT ---
		api.GET("/courses", controllers.GetCourses)
		api.POST("/courses", controllers.CreateCourse)
		api.GET("/courses/:id", controllers.GetCourseByID)
		api.DELETE("/courses/:id", controllers.DeleteCourse)
		api.PATCH("/courses/:id/meet", controllers.UpdateCourseMeet)
		api.PATCH("/courses/:id/status", controllers.UpdateCourseStatus)

		// --- NGHIỆP VỤ BỔ NHIỆM & KIỂM TRA LỊCH GIÁO VIÊN ---
		api.GET("/teachers/qualified", controllers.GetQualifiedTeachers)

		// --- BÀI HỌC & TIẾN ĐỘ ---
		api.GET("/courses/:id/lessons", controllers.GetLessons)
		api.POST("/courses/:id/lessons", controllers.CreateLesson)
		api.PUT("/lessons/:id", controllers.UpdateLesson)
		api.DELETE("/lessons/:id", controllers.DeleteLesson)
		api.POST("/lessons/:id/progress", controllers.MarkLessonProgress)
		api.GET("/courses/:id/progress/:student_id", controllers.GetStudentCourseProgress)

		// --- BÀI TẬP & NỘP BÀI ---
		api.GET("/courses/:id/assignments", controllers.GetAssignments)
		api.POST("/courses/:id/assignments", controllers.CreateAssignment)
		api.PUT("/assignments/:id", controllers.UpdateAssignment)
		api.DELETE("/assignments/:id", controllers.DeleteAssignment)
		api.POST("/assignments/:id/submit", controllers.SubmitAssignment)
		api.GET("/assignments/:id/submissions", controllers.GetSubmissions)

		// --- BÀI THI TRẮC NGHIỆM / QUIZ ---
		api.GET("/courses/:id/quizzes", controllers.GetQuizzes)
		api.POST("/courses/:id/quizzes", controllers.CreateQuiz)
		api.PUT("/quizzes/:id", controllers.UpdateQuiz)
		api.DELETE("/quizzes/:id", controllers.DeleteQuiz)
		api.POST("/quizzes/:id/submit", controllers.SubmitQuizResult)
		api.GET("/quizzes/:id/submissions", controllers.GetQuizSubmissions)

		// --- THÀNH VIÊN LỚP HỌC & GHI DANH ---
		api.POST("/courses/:id/join", controllers.JoinCourse)
		api.GET("/courses/:id/students", controllers.GetCourseStudents)
		api.GET("/students/:student_id/courses", controllers.GetStudentJoinedCourses)
		api.POST("/courses/:id/students/import", controllers.ImportStudentsBatch)

		// --- ĐIỂM DANH LIVE MEET ---
		api.POST("/attendance/join", controllers.RecordJoinAttendance)
		api.POST("/attendance/leave", controllers.RecordLeaveAttendance)
		api.GET("/courses/:id/attendance", controllers.GetCourseAttendanceLogs)
		api.GET("/attendance/all", controllers.GetAllAttendanceLogs)

		// --- THẢO LUẬN / DIỄN ĐÀN ---
		api.GET("/courses/:id/discussions", controllers.GetCourseDiscussions)
		api.POST("/courses/:id/discussions", controllers.CreateDiscussion)
		api.DELETE("/discussions/:id", controllers.DeleteDiscussion)

		// --- CHIA SẺ TÀI LIỆU (STUDOCU CLONE) ---
		api.GET("/shared-documents", controllers.GetSharedDocuments)
		api.POST("/shared-documents", controllers.CreateSharedDocument)
		api.PUT("/shared-documents/:id/approve", controllers.ApproveSharedDocument)
		api.DELETE("/shared-documents/:id", controllers.DeleteSharedDocument)

		// --- THÔNG TIN CHUYÊN MÔN GIÁO VIÊN ---
		api.GET("/teacher-subjects", controllers.GetTeacherSubjectsHandler)
		api.GET("/teachers/:teacher_id/subjects", controllers.GetTeacherSubjectsHandler)

		// --- DANH MỤC KHÓA HỌC ---
		api.GET("/categories", controllers.GetCategories)

		// --- DANH MỤC TÀI LIỆU ---
		api.GET("/document-categories", controllers.GetDocumentCategories)
	}
}