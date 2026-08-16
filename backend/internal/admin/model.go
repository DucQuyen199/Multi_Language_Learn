package admin

import "time"

type UserCounts struct {
	Total       int `json:"total"`
	Students    int `json:"students"`
	Instructors int `json:"instructors"`
	Admins      int `json:"admins"`
	NewThisWeek int `json:"new_this_week"`
}

type CourseCounts struct {
	Total     int `json:"total"`
	Published int `json:"published"`
	Draft     int `json:"draft"`
	Pending   int `json:"pending"`
	Archived  int `json:"archived"`
}

type Account struct {
	ID              string    `json:"id"`
	Email           string    `json:"email"`
	FirstName       string    `json:"first_name"`
	Role            string    `json:"role"`
	EmailVerified   bool      `json:"email_verified"`
	CreatedAt       time.Time `json:"created_at"`
	EnrolledCount   int       `json:"enrolled_courses"`
	TeachingCount   int       `json:"teaching_courses"`
	CompletedLessons int      `json:"completed_lessons"`
}

type CourseRow struct {
	ID               string `json:"id"`
	Slug             string `json:"slug"`
	Title            string `json:"title"`
	Description      string `json:"description"`
	CEFR             string `json:"cefr"`
	Status           string `json:"status"`
	ReviewNote       string `json:"review_note"`
	LanguageCode     string `json:"language_code"`
	InstructorID     string `json:"instructor_id"`
	InstructorName   string `json:"instructor_name"`
	LessonCount      int    `json:"lesson_count"`
	DurationMinutes  int    `json:"duration_minutes"`
	EnrollmentCount  int    `json:"enrollment_count"`
}

type LanguageRow struct {
	ID           string `json:"id"`
	Code         string `json:"code"`
	Name         string `json:"name"`
	NativeName   string `json:"native_name"`
	FlagEmoji    string `json:"flag_emoji"`
	IsActive     bool   `json:"is_active"`
	WordCount    int    `json:"word_count"`
	CourseCount  int    `json:"course_count"`
	LearnerCount int    `json:"learner_count"`
}

type Overview struct {
	Users            UserCounts          `json:"users"`
	Courses          CourseCounts        `json:"courses"`
	Lessons          int                 `json:"lessons"`
	Enrollments      int                 `json:"enrollments"`
	LessonCompletions int                `json:"lesson_completions"`
	DictionaryWords  int                 `json:"dictionary_words"`
	ActiveToday      int                 `json:"active_learners_today"`
	RecentUsers      []Account           `json:"recent_users"`
	RecentEnrollments []EnrollmentEvent  `json:"recent_enrollments"`
}

type EnrollmentEvent struct {
	ID             string    `json:"id"`
	StudentName    string    `json:"student_name"`
	StudentEmail   string    `json:"student_email"`
	CourseTitle    string    `json:"course_title"`
	InstructorName string    `json:"instructor_name"`
	EnrolledAt     time.Time `json:"enrolled_at"`
}

type UserList struct {
	Items  []Account `json:"items"`
	Total  int       `json:"total"`
	Limit  int       `json:"limit"`
	Offset int       `json:"offset"`
}

type UpdateUserInput struct {
	Role      *string `json:"role"`
	FirstName *string `json:"first_name"`
}

type UpdateCourseInput struct {
	Status *string `json:"status"`
}

type ReviewInput struct {
	Action string `json:"action"` // "approve" | "reject"
	Note   string `json:"note"`
}

type UpdateLanguageInput struct {
	IsActive *bool `json:"is_active"`
}
