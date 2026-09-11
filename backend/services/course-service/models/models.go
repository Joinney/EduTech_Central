package models

import "time"

type CourseCategory struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:150;not null" json:"name"`
	Slug        string    `gorm:"size:100;unique;not null" json:"slug"`
	Description string    `gorm:"type:text" json:"description"`
	Icon        string    `gorm:"size:50;default:'BookOpen'" json:"icon"`
	CreatedAt   time.Time `json:"createdAt"`
}

func (CourseCategory) TableName() string { return "course_categories" }

type Course struct {
	ID            uint             `gorm:"primaryKey" json:"id"`
	TeacherID     uint             `json:"teacher_id"`
	TeacherName   string           `gorm:"size:255" json:"teacher_name"`
	Type          string           `gorm:"size:50;default:'school'" json:"type"`
	Title         string           `gorm:"size:255;not null" json:"title"`
	Code          string           `gorm:"size:50;unique;not null" json:"code"`
	Subject       string           `gorm:"size:100;not null" json:"subject"`
	CategoryID    *uint            `gorm:"column:category_id" json:"category_id"`
	Category      *CourseCategory  `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	SchoolName    string           `gorm:"size:255;not null" json:"schoolName"`
	SchoolLogo    string           `gorm:"column:school_logo;type:text" json:"school_logo"`
	TeacherImg    string           `gorm:"column:teacher_img;type:text" json:"teacher_img"`
	Grade         string           `gorm:"size:50" json:"grade"`
	MaxStudents   int              `gorm:"default:30" json:"maxStudents"`
	StudentsCount int              `gorm:"default:0" json:"studentsCount"`
	Schedule      string           `gorm:"size:255" json:"schedule"`
	Thumbnail     string           `gorm:"type:text" json:"thumbnail"`
	Description   string           `gorm:"type:text" json:"description"`
	Status        string           `gorm:"size:50;default:'APPROVED'" json:"status"`
	Price         float64          `gorm:"type:numeric(12,2);default:0" json:"price"`
	AdminNote     string           `gorm:"type:text" json:"admin_note"`
	IsPublished   bool             `gorm:"default:true" json:"is_published"`
	MeetTitle     string           `gorm:"size:255" json:"meetTitle"`
	MeetLink      string           `gorm:"type:text" json:"meetLink"`
	MeetStartTime string           `gorm:"size:100" json:"meetStartTime"`
	MeetIsActive  bool             `gorm:"default:false" json:"meetIsActive"`
	Lessons       []Lesson         `gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE" json:"lessons"`
	Assignments   []Assignment     `gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE" json:"assignments"`
	Quizzes       []Quiz           `gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE" json:"quizzes"`
	Schedules     []CourseSchedule `gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE" json:"schedules"`
	CreatedAt     time.Time        `json:"createdAt"`
	UpdatedAt     time.Time        `json:"updatedAt"`
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

func (CourseStudent) TableName() string { return "course_students" }

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

func (AttendanceLog) TableName() string { return "attendance_logs" }

type LessonProgress struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	CourseID    uint       `json:"course_id"`
	LessonID    uint       `gorm:"uniqueIndex:idx_lesson_student" json:"lesson_id"`
	StudentID   uint       `gorm:"uniqueIndex:idx_lesson_student" json:"student_id"`
	IsCompleted bool       `gorm:"default:false" json:"is_completed"`
	CompletedAt *time.Time `json:"completed_at"`
}

func (LessonProgress) TableName() string { return "lesson_progress" }

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

func (QuizSubmission) TableName() string { return "quiz_submissions" }

type CourseDiscussion struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	CourseID   uint      `json:"course_id"`
	LessonID   *uint     `json:"lesson_id"`
	UserID     uint      `json:"user_id"`
	UserName   string    `gorm:"size:255" json:"user_name"`
	UserRole   string    `gorm:"size:50;default:'student'" json:"user_role"`
	AvatarURL  string    `gorm:"type:text" json:"avatar_url"`
	Content    string    `gorm:"type:text;not null" json:"content"`
	IsPinned   bool      `gorm:"default:false" json:"is_pinned"`
	IsApproved bool      `gorm:"default:true" json:"is_approved"`
	CreatedAt  time.Time `json:"created_at"`
}

func (CourseDiscussion) TableName() string { return "course_discussions" }

type TeacherSubject struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	TeacherID   uint      `gorm:"index;not null" json:"teacher_id"`
	TeacherName string    `gorm:"size:255;not null" json:"teacher_name"`
	Subject     string    `gorm:"size:100;not null" json:"subject"`
	CreatedAt   time.Time `json:"created_at"`
}

func (TeacherSubject) TableName() string { return "teacher_subjects" }

type CourseSchedule struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	CourseID    uint      `gorm:"index;not null" json:"course_id"`
	CourseTitle string    `gorm:"size:255" json:"course_title"`
	TeacherID   uint      `gorm:"index;not null" json:"teacher_id"`
	DayOfWeek   string    `gorm:"size:50;not null" json:"day_of_week"`
	TimeSlot    string    `gorm:"size:50;not null" json:"time_slot"`
	Type        string    `gorm:"size:50" json:"type"`
	CreatedAt   time.Time `json:"created_at"`
}

func (CourseSchedule) TableName() string { return "course_schedules" }

type SharedDocument struct {
    ID          uint              `gorm:"primaryKey" json:"id"`
    StudentID   uint              `json:"student_id"`
    StudentName string            `gorm:"size:255" json:"student_name"`
    Title       string            `gorm:"size:255;not null" json:"title"`
    Description string            `gorm:"type:text" json:"description"`
    FileURL     string            `gorm:"type:text;not null" json:"file_url"`
    Category    string            `gorm:"size:100" json:"category"`
    CategoryID  *uint             `gorm:"column:category_id" json:"category_id"`
    CategoryRel *DocumentCategory `gorm:"foreignKey:CategoryID" json:"category_rel,omitempty"`
    Subject     string            `gorm:"size:100" json:"subject"`
    Views       int               `gorm:"default:0" json:"views"`
    Downloads   int               `gorm:"default:0" json:"downloads"`
    IsApproved  bool              `gorm:"default:false" json:"is_approved"`
    
    // SỬA DÒNG NÀY: Đổi sang *bool để GORM không kích hoạt default:true khi giá trị là false
    IsPublic    *bool             `gorm:"default:true" json:"is_public"` 
    
    CreatedAt   time.Time         `json:"created_at"`
}

func (SharedDocument) TableName() string { return "shared_documents" }

type User struct {
	IDUsers     uint      `gorm:"primaryKey;column:id_users" json:"id_users"`
	Email       string    `gorm:"size:255;unique;not null" json:"email"`
	Password    string    `gorm:"size:255;not null" json:"password"`
	FullName    string    `gorm:"size:255;not null" json:"full_name"`
	Role        string    `gorm:"size:50;default:'student'" json:"role"`
	Status      string    `gorm:"size:50;default:'active'" json:"status"`
	Avatar      string    `gorm:"type:text" json:"avatar"`
	IsOnboarded bool      `gorm:"default:true" json:"is_onboarded"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (User) TableName() string { return "users" }

type StudentProfile struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"column:user_id;uniqueIndex" json:"user_id"`
	Grade     string    `gorm:"size:50" json:"grade"`
	School    string    `gorm:"size:255" json:"school"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (StudentProfile) TableName() string { return "student_profiles" }

type DocumentCategory struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:150;not null" json:"name"`
	Slug        string    `gorm:"size:100;unique;not null" json:"slug"`
	Description string    `gorm:"type:text" json:"description"`
	Icon        string    `gorm:"size:50;default:'FileText'" json:"icon"`
	CreatedAt   time.Time `json:"createdAt"`
}

func (DocumentCategory) TableName() string { return "document_categories" }

