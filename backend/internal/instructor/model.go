package instructor

import "time"

type Course struct {
	ID              string    `json:"id"`
	Slug            string    `json:"slug"`
	Title           string    `json:"title"`
	Description     string    `json:"description"`
	CEFR            string    `json:"cefr"`
	Status          string    `json:"status"`
	ReviewNote      string    `json:"review_note"`
	CoverImageURL   string    `json:"cover_image_url"`
	LanguageCode    string    `json:"language_code"`
	LanguageName    string    `json:"language_name"`
	FlagEmoji       string    `json:"flag_emoji"`
	LessonCount     int       `json:"lesson_count"`
	DurationMinutes int       `json:"duration_minutes"`
	EnrollmentCount int       `json:"enrollment_count"`
	CompletionCount int       `json:"completion_count"`
	AvgProgress     float64   `json:"avg_progress"`
	Skills          []string  `json:"skills"`
	ExamCount       int       `json:"exam_count"`
	CreatedAt       time.Time `json:"created_at"`
}

type Lesson struct {
	ID              string    `json:"id"`
	CourseID        string    `json:"course_id"`
	CourseTitle     string    `json:"course_title"`
	Slug            string    `json:"slug"`
	Title           string    `json:"title"`
	Summary         string    `json:"summary"`
	Content         string    `json:"content"`
	VideoURL        string    `json:"video_url"`
	ImageURL        string    `json:"image_url"`
	Skill           string    `json:"skill"`
	DurationMinutes int       `json:"duration_minutes"`
	LessonOrder     int       `json:"lesson_order"`
	Status          string    `json:"status"`
	CompletionCount int       `json:"completion_count"`
	QuestionCount   int       `json:"question_count"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type Student struct {
	ID               string     `json:"id"`
	Name             string     `json:"name"`
	Email            string     `json:"email"`
	CourseID         string     `json:"course_id"`
	CourseTitle      string     `json:"course_title"`
	LessonsCompleted int        `json:"lessons_completed"`
	LessonsTotal     int        `json:"lessons_total"`
	Progress         float64    `json:"progress"`
	EnrolledAt       time.Time  `json:"enrolled_at"`
	LastActivity     *time.Time `json:"last_activity"`
}

type Overview struct {
	CourseCount      int       `json:"course_count"`
	PublishedCount   int       `json:"published_count"`
	LessonCount      int       `json:"lesson_count"`
	StudentCount     int       `json:"student_count"`
	TotalCompletions int       `json:"total_completions"`
	AvgProgress      float64   `json:"avg_progress"`
	TopCourses       []Course  `json:"top_courses"`
	RecentStudents   []Student `json:"recent_students"`
}

type CreateCourseInput struct {
	LanguageCode string `json:"language_code"`
	Title        string `json:"title"`
	Description  string `json:"description"`
	CEFR         string `json:"cefr"`
}

type UpdateCourseInput struct {
	Title          *string `json:"title"`
	Description    *string `json:"description"`
	CEFR           *string `json:"cefr"`
	Status         *string `json:"status"`
	CoverImageURL  *string `json:"cover_image_url"`
}

type LessonInput struct {
	Title           string  `json:"title"`
	Summary         string  `json:"summary"`
	Content         string  `json:"content"`
	VideoURL        *string `json:"video_url"`
	ImageURL        *string `json:"image_url"`
	Skill           string  `json:"skill"`
	DurationMinutes int     `json:"duration_minutes"`
	LessonOrder     int     `json:"lesson_order"`
	Status          string  `json:"status"`
}
