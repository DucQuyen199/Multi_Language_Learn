package learning

import "time"

type CourseCard struct {
	ID              string  `json:"id"`
	Slug            string  `json:"slug"`
	Title           string  `json:"title"`
	Description     string  `json:"description"`
	CEFR            string  `json:"cefr"`
	LanguageCode    string  `json:"language_code"`
	LanguageName    string  `json:"language_name"`
	FlagEmoji       string  `json:"flag_emoji"`
	InstructorID    string  `json:"instructor_id"`
	InstructorName  string  `json:"instructor_name"`
	LessonCount     int     `json:"lesson_count"`
	DurationMinutes int     `json:"duration_minutes"`
	EnrollmentCount int     `json:"enrollment_count"`
	Status          string  `json:"status"`
	IsEnrolled      bool    `json:"is_enrolled"`
	CompletedLessons int    `json:"completed_lessons"`
	Progress        float64 `json:"progress"`
	Skills          []string `json:"skills"`
	ExamID          string  `json:"exam_id"`
	ExamTitle       string  `json:"exam_title"`
	ExamPassScore   int     `json:"exam_pass_score"`
}

type LessonSummary struct {
	ID              string     `json:"id"`
	Slug            string     `json:"slug"`
	Title           string     `json:"title"`
	Summary         string     `json:"summary"`
	DurationMinutes int        `json:"duration_minutes"`
	LessonOrder     int        `json:"lesson_order"`
	Completed       bool       `json:"completed"`
	Score           *int       `json:"score"`
	CompletedAt     *time.Time `json:"completed_at"`
}

type LessonDetail struct {
	ID              string            `json:"id"`
	CourseID        string            `json:"course_id"`
	CourseSlug      string            `json:"course_slug"`
	CourseTitle     string            `json:"course_title"`
	Title           string            `json:"title"`
	Summary         string            `json:"summary"`
	Content         string            `json:"content"`
	VideoURL        string            `json:"video_url"`
	ImageURL        string            `json:"image_url"`
	Skill           string            `json:"skill"`
	DurationMinutes int               `json:"duration_minutes"`
	LessonOrder     int               `json:"lesson_order"`
	Completed       bool              `json:"completed"`
	Score           *int              `json:"score"`
	Questions       []LearnerQuestion `json:"questions"`
}

type CourseDetail struct {
	Course  CourseCard     `json:"course"`
	Lessons []LessonSummary `json:"lessons"`
	NextLesson *LessonSummary `json:"next_lesson"`
}

type CompleteInput struct {
	Score *int `json:"score"`
}
