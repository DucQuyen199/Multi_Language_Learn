package instructor

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
)

type Repository struct{ db *sql.DB }

func NewRepository(db *sql.DB) *Repository { return &Repository{db: db} }

const courseColumns = `
	c.id, c.slug, c.title, c.description, c.cefr, c.status, c.review_note, COALESCE(c.cover_image_url, ''),
	l.code, l.name, l.flag_emoji,
	(SELECT COUNT(*) FROM lessons ls WHERE ls.course_id = c.id AND ls.status = 'published'),
	c.duration_minutes,
	(SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id),
	(SELECT COUNT(*) FROM lesson_completions lc JOIN lessons ls2 ON ls2.id = lc.lesson_id WHERE ls2.course_id = c.id),
	(SELECT COUNT(*) FROM exams ex WHERE ex.course_id = c.id AND ex.status = 'published'),
	c.created_at`

const lessonColumns = `
	ls.id, ls.course_id, c.title, ls.slug, ls.title, ls.summary, ls.content,
	COALESCE(ls.video_url, ''), COALESCE(ls.image_url, ''), COALESCE(ls.skill, ''),
	ls.duration_minutes, ls.lesson_order, ls.status,
	(SELECT COUNT(*) FROM lesson_completions lc WHERE lc.lesson_id = ls.id),
	(SELECT COUNT(*) FROM quiz_questions qq WHERE qq.lesson_id = ls.id),
	ls.updated_at`

func (r *Repository) scanCourse(scan interface{ Scan(...any) error }) (Course, error) {
	var course Course
	err := scan.Scan(
		&course.ID, &course.Slug, &course.Title, &course.Description, &course.CEFR, &course.Status,
		&course.ReviewNote, &course.CoverImageURL,
		&course.LanguageCode, &course.LanguageName, &course.FlagEmoji, &course.LessonCount,
		&course.DurationMinutes, &course.EnrollmentCount, &course.CompletionCount, &course.ExamCount,
		&course.CreatedAt,
	)
	return course, err
}

func (r *Repository) scanLesson(scan interface{ Scan(...any) error }) (Lesson, error) {
	var lesson Lesson
	err := scan.Scan(
		&lesson.ID, &lesson.CourseID, &lesson.CourseTitle, &lesson.Slug, &lesson.Title, &lesson.Summary, &lesson.Content,
		&lesson.VideoURL, &lesson.ImageURL, &lesson.Skill, &lesson.DurationMinutes, &lesson.LessonOrder, &lesson.Status,
		&lesson.CompletionCount, &lesson.QuestionCount, &lesson.UpdatedAt,
	)
	return lesson, err
}

func (r *Repository) loadCourseSkills(ctx context.Context, courses []Course) {
	if len(courses) == 0 {
		return
	}
	rows, err := r.db.QueryContext(ctx, `SELECT course_id, skill FROM course_skills`)
	if err != nil {
		return
	}
	defer rows.Close()
	index := make(map[string]int, len(courses))
	for i, course := range courses {
		course.Skills = []string{}
		index[course.ID] = i
	}
	for rows.Next() {
		var courseID, skill string
		if err := rows.Scan(&courseID, &skill); err != nil {
			return
		}
		if i, ok := index[courseID]; ok {
			courses[i].Skills = append(courses[i].Skills, skill)
		}
	}
}

func (r *Repository) Courses(ctx context.Context, instructorID string, includeAll bool) ([]Course, error) {
	query := fmt.Sprintf(`SELECT %s FROM courses c JOIN languages l ON l.id = c.language_id`, courseColumns)
	args := []any{}
	if !includeAll {
		query += ` WHERE c.instructor_id = ?`
		args = append(args, instructorID)
	}
	query += ` ORDER BY c.created_at DESC`
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list instructor courses: %w", err)
	}
	defer rows.Close()
	courses := make([]Course, 0)
	for rows.Next() {
		course, err := r.scanCourse(rows)
		if err != nil {
			return nil, fmt.Errorf("scan instructor course: %w", err)
		}
		courses = append(courses, course)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	r.loadCourseSkills(ctx, courses)
	progress, err := r.courseProgress(ctx, instructorID, includeAll)
	if err != nil {
		return nil, err
	}
	for index := range courses {
		courses[index].AvgProgress = progress[courses[index].ID]
	}
	return courses, nil
}

func (r *Repository) courseProgress(ctx context.Context, instructorID string, includeAll bool) (map[string]float64, error) {
	query := `
		SELECT c.id,
		       (SELECT COUNT(*) FROM lesson_completions lc JOIN lessons ls ON ls.id = lc.lesson_id
		         WHERE ls.course_id = c.id AND lc.user_id = e.user_id),
		       (SELECT COUNT(*) FROM lessons ls WHERE ls.course_id = c.id AND ls.status = 'published')
		FROM enrollments e
		JOIN courses c ON c.id = e.course_id`
	args := []any{}
	if !includeAll {
		query += ` WHERE c.instructor_id = ?`
		args = append(args, instructorID)
	}
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("compute course progress: %w", err)
	}
	defer rows.Close()
	totals := make(map[string][]float64)
	for rows.Next() {
		var courseID string
		var completed, published int
		if err := rows.Scan(&courseID, &completed, &published); err != nil {
			return nil, fmt.Errorf("scan progress row: %w", err)
		}
		ratio := 0.0
		if published > 0 {
			ratio = float64(completed) / float64(published)
		}
		totals[courseID] = append(totals[courseID], ratio)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	progress := make(map[string]float64, len(totals))
	for courseID, ratios := range totals {
		sum := 0.0
		for _, ratio := range ratios {
			sum += ratio
		}
		progress[courseID] = sum / float64(len(ratios))
	}
	return progress, nil
}

func (r *Repository) FindCourse(ctx context.Context, courseID, instructorID string, includeAll bool) (Course, error) {
	query := fmt.Sprintf(`SELECT %s FROM courses c JOIN languages l ON l.id = c.language_id WHERE c.id = ?`, courseColumns)
	args := []any{courseID}
	if !includeAll {
		query += ` AND c.instructor_id = ?`
		args = append(args, instructorID)
	}
	course, err := r.scanCourse(r.db.QueryRowContext(ctx, query, args...))
	if err != nil {
		return Course{}, err
	}
	holder := []Course{course}
	r.loadCourseSkills(ctx, holder)
	return holder[0], nil
}

func (r *Repository) LanguageIDByCode(ctx context.Context, code string) (string, error) {
	var id string
	err := r.db.QueryRowContext(ctx, `SELECT id FROM languages WHERE code = ? AND is_active = TRUE`, strings.ToLower(strings.TrimSpace(code))).Scan(&id)
	return id, err
}

func (r *Repository) SlugExists(ctx context.Context, languageID, slug string) (bool, error) {
	var exists int
	err := r.db.QueryRowContext(ctx, `SELECT 1 FROM courses WHERE language_id = ? AND slug = ?`, languageID, slug).Scan(&exists)
	if err != nil {
		return false, nil
	}
	return true, nil
}

func (r *Repository) CreateCourse(ctx context.Context, courseID, instructorID, languageID, slug, title, description, cefr string) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO courses (id, language_id, slug, title, description, cefr, lesson_count, duration_minutes, instructor_id, status)
		VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, 'draft')`,
		courseID, languageID, slug, title, description, cefr, instructorID)
	if err != nil {
		return fmt.Errorf("insert course: %w", err)
	}
	return nil
}

func (r *Repository) UpdateCourse(ctx context.Context, courseID string, input UpdateCourseInput) error {
	assignments := []string{}
	args := []any{}
	if input.Title != nil {
		assignments = append(assignments, "title = ?")
		args = append(args, *input.Title)
	}
	if input.Description != nil {
		assignments = append(assignments, "description = ?")
		args = append(args, *input.Description)
	}
	if input.CEFR != nil {
		assignments = append(assignments, "cefr = ?")
		args = append(args, *input.CEFR)
	}
	if input.Status != nil {
		assignments = append(assignments, "status = ?")
		args = append(args, *input.Status)
	}
	if input.CoverImageURL != nil {
		assignments = append(assignments, "cover_image_url = NULLIF(?, '')")
		args = append(args, *input.CoverImageURL)
	}
	if len(assignments) == 0 {
		return nil
	}
	args = append(args, courseID)
	query := "UPDATE courses SET " + strings.Join(assignments, ", ") + " WHERE id = ?"
	result, err := r.db.ExecContext(ctx, query, args...)
	if err != nil {
		return fmt.Errorf("update course: %w", err)
	}
	if affected, _ := result.RowsAffected(); affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *Repository) Lessons(ctx context.Context, courseID string) ([]Lesson, error) {
	rows, err := r.db.QueryContext(ctx, fmt.Sprintf(`
		SELECT %s FROM lessons ls JOIN courses c ON c.id = ls.course_id
		WHERE ls.course_id = ? ORDER BY ls.lesson_order, ls.created_at`, lessonColumns), courseID)
	if err != nil {
		return nil, fmt.Errorf("list lessons: %w", err)
	}
	defer rows.Close()
	lessons := make([]Lesson, 0)
	for rows.Next() {
		lesson, err := r.scanLesson(rows)
		if err != nil {
			return nil, fmt.Errorf("scan lesson: %w", err)
		}
		lessons = append(lessons, lesson)
	}
	return lessons, rows.Err()
}

func (r *Repository) FindLesson(ctx context.Context, lessonID, instructorID string, includeAll bool) (Lesson, error) {
	query := fmt.Sprintf(`
		SELECT %s FROM lessons ls JOIN courses c ON c.id = ls.course_id
		WHERE ls.id = ?`, lessonColumns)
	args := []any{lessonID}
	if !includeAll {
		query += ` AND c.instructor_id = ?`
		args = append(args, instructorID)
	}
	lesson, err := r.scanLesson(r.db.QueryRowContext(ctx, query, args...))
	if err != nil {
		return Lesson{}, err
	}
	return lesson, nil
}

func (r *Repository) LessonSlugExists(ctx context.Context, courseID, slug string, excludeLessonID string) (bool, error) {
	query := `SELECT 1 FROM lessons WHERE course_id = ? AND slug = ?`
	args := []any{courseID, slug}
	if excludeLessonID != "" {
		query += ` AND id <> ?`
		args = append(args, excludeLessonID)
	}
	var exists int
	err := r.db.QueryRowContext(ctx, query, args...).Scan(&exists)
	if err != nil {
		return false, nil
	}
	return true, nil
}

func (r *Repository) NextLessonOrder(ctx context.Context, courseID string) (int, error) {
	var current int
	err := r.db.QueryRowContext(ctx, `SELECT COALESCE(MAX(lesson_order), 0) FROM lessons WHERE course_id = ?`, courseID).Scan(&current)
	return current + 1, err
}

func (r *Repository) SyncCourseLessonCount(ctx context.Context, courseID string) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE courses c
		SET c.lesson_count = (SELECT COUNT(*) FROM lessons ls WHERE ls.course_id = c.id AND ls.status = 'published'),
		    c.duration_minutes = (SELECT COALESCE(SUM(ls.duration_minutes), 0) FROM lessons ls WHERE ls.course_id = c.id AND ls.status = 'published')
		WHERE c.id = ?`, courseID)
	if err != nil {
		return fmt.Errorf("sync lesson count: %w", err)
	}
	return nil
}

func (r *Repository) CreateLesson(ctx context.Context, lessonID, courseID, slug string, input LessonInput, order int) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO lessons (id, course_id, slug, title, summary, content, video_url, image_url, skill, duration_minutes, lesson_order, status)
		VALUES (?, ?, ?, ?, ?, ?, NULLIF(?, ''), NULLIF(?, ''), NULLIF(?, ''), ?, ?, ?)`,
		lessonID, courseID, slug, input.Title, input.Summary, input.Content,
		derefString(input.VideoURL), derefString(input.ImageURL), input.Skill,
		input.DurationMinutes, order, input.Status)
	if err != nil {
		return fmt.Errorf("insert lesson: %w", err)
	}
	return nil
}

func (r *Repository) UpdateLesson(ctx context.Context, lessonID string, input LessonInput) error {
	result, err := r.db.ExecContext(ctx, `
		UPDATE lessons
		SET title = ?, summary = ?, content = ?, video_url = NULLIF(?, ''), image_url = NULLIF(?, ''), skill = NULLIF(?, ''),
		    duration_minutes = ?, lesson_order = ?, status = ?
		WHERE id = ?`,
		input.Title, input.Summary, input.Content, derefString(input.VideoURL), derefString(input.ImageURL),
		input.Skill, input.DurationMinutes, input.LessonOrder, input.Status, lessonID)
	if err != nil {
		return fmt.Errorf("update lesson: %w", err)
	}
	if affected, _ := result.RowsAffected(); affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *Repository) DeleteLesson(ctx context.Context, lessonID string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM lessons WHERE id = ?`, lessonID)
	if err != nil {
		return fmt.Errorf("delete lesson: %w", err)
	}
	if affected, _ := result.RowsAffected(); affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *Repository) Students(ctx context.Context, instructorID string, includeAll bool, limit int) ([]Student, error) {
	query := `
		SELECT u.id, COALESCE(up.first_name, 'Learner'), u.email, c.id, c.title,
		       (SELECT COUNT(*) FROM lesson_completions lc JOIN lessons ls ON ls.id = lc.lesson_id
		         WHERE ls.course_id = c.id AND lc.user_id = u.id),
		       (SELECT COUNT(*) FROM lessons ls WHERE ls.course_id = c.id AND ls.status = 'published'),
		       e.enrolled_at,
		       (SELECT MAX(lc.completed_at) FROM lesson_completions lc JOIN lessons ls ON ls.id = lc.lesson_id
		         WHERE ls.course_id = c.id AND lc.user_id = u.id)
		FROM enrollments e
		JOIN users u ON u.id = e.user_id
		LEFT JOIN user_profiles up ON up.user_id = u.id
		JOIN courses c ON c.id = e.course_id`
	args := []any{}
	if !includeAll {
		query += ` WHERE c.instructor_id = ?`
		args = append(args, instructorID)
	}
	query += ` ORDER BY e.enrolled_at DESC`
	if limit > 0 {
		query += ` LIMIT ?`
		args = append(args, limit)
	}
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("list instructor students: %w", err)
	}
	defer rows.Close()
	students := make([]Student, 0)
	for rows.Next() {
		var student Student
		var lastActivity sql.NullTime
		if err := rows.Scan(
			&student.ID, &student.Name, &student.Email, &student.CourseID, &student.CourseTitle,
			&student.LessonsCompleted, &student.LessonsTotal, &student.EnrolledAt, &lastActivity,
		); err != nil {
			return nil, fmt.Errorf("scan student: %w", err)
		}
		if student.LessonsTotal > 0 {
			student.Progress = float64(student.LessonsCompleted) / float64(student.LessonsTotal)
		}
		if lastActivity.Valid {
			completed := lastActivity.Time
			student.LastActivity = &completed
		}
		students = append(students, student)
	}
	return students, rows.Err()
}

func derefString(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}
