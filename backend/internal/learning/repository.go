package learning

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/platform"
)

type Repository struct{ db *sql.DB }

func NewRepository(db *sql.DB) *Repository { return &Repository{db: db} }

const courseCardColumns = `
	c.id, c.slug, c.title, c.description, c.cefr, l.code, l.name, l.flag_emoji,
	COALESCE(c.instructor_id, ''), COALESCE(up.first_name, ''),
	c.lesson_count, c.duration_minutes,
	(SELECT COUNT(*) FROM enrollments e2 WHERE e2.course_id = c.id),
	c.status`

func (r *Repository) PublishedCourses(ctx context.Context, language string) ([]CourseCard, error) {
	rows, err := r.db.QueryContext(ctx, fmt.Sprintf(`
		SELECT %s FROM courses c
		JOIN languages l ON l.id = c.language_id
		LEFT JOIN user_profiles up ON up.user_id = c.instructor_id
		WHERE c.status = 'published' AND (? = '' OR l.code = ?)
		ORDER BY c.cefr, c.title`, courseCardColumns), language, language)
	if err != nil {
		return nil, fmt.Errorf("list published courses: %w", err)
	}
	return scanCourseCards(rows)
}

func (r *Repository) EnrolledCourses(ctx context.Context, userID string) ([]CourseCard, error) {
	rows, err := r.db.QueryContext(ctx, fmt.Sprintf(`
		SELECT %s FROM enrollments e
		JOIN courses c ON c.id = e.course_id
		JOIN languages l ON l.id = c.language_id
		LEFT JOIN user_profiles up ON up.user_id = c.instructor_id
		WHERE e.user_id = ? AND c.status <> 'archived'
		ORDER BY e.enrolled_at DESC`, courseCardColumns), userID)
	if err != nil {
		return nil, fmt.Errorf("list enrolled courses: %w", err)
	}
	return scanCourseCards(rows)
}

func scanCourseCards(rows *sql.Rows) ([]CourseCard, error) {
	defer rows.Close()
	courses := make([]CourseCard, 0)
	for rows.Next() {
		var course CourseCard
		if err := rows.Scan(
			&course.ID, &course.Slug, &course.Title, &course.Description, &course.CEFR,
			&course.LanguageCode, &course.LanguageName, &course.FlagEmoji,
			&course.InstructorID, &course.InstructorName, &course.LessonCount, &course.DurationMinutes,
			&course.EnrollmentCount, &course.Status,
		); err != nil {
			return nil, fmt.Errorf("scan course card: %w", err)
		}
		courses = append(courses, course)
	}
	return courses, rows.Err()
}

func (r *Repository) CourseBySlug(ctx context.Context, slug string) (CourseCard, error) {
	var course CourseCard
	err := r.db.QueryRowContext(ctx, fmt.Sprintf(`
		SELECT %s FROM courses c
		JOIN languages l ON l.id = c.language_id
		LEFT JOIN user_profiles up ON up.user_id = c.instructor_id
		WHERE c.slug = ?`, courseCardColumns), slug).
		Scan(
			&course.ID, &course.Slug, &course.Title, &course.Description, &course.CEFR,
			&course.LanguageCode, &course.LanguageName, &course.FlagEmoji,
			&course.InstructorID, &course.InstructorName, &course.LessonCount, &course.DurationMinutes,
			&course.EnrollmentCount, &course.Status,
		)
	if err != nil {
		return CourseCard{}, err
	}
	return course, nil
}

func (r *Repository) IsEnrolled(ctx context.Context, userID, courseID string) (bool, error) {
	var exists int
	err := r.db.QueryRowContext(ctx, `SELECT 1 FROM enrollments WHERE user_id = ? AND course_id = ?`, userID, courseID).Scan(&exists)
	if err != nil {
		return false, nil
	}
	return true, nil
}

type enrollmentStateRow struct {
	enrolled  bool
	completed int
}

func (r *Repository) enrollmentStates(ctx context.Context, userID string, courseIDs []string) (map[string]enrollmentStateRow, error) {
	states := make(map[string]enrollmentStateRow, len(courseIDs))
	if len(courseIDs) == 0 {
		return states, nil
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT ls.course_id, COUNT(lc.id)
		FROM lessons ls
		LEFT JOIN lesson_completions lc ON lc.lesson_id = ls.id AND lc.user_id = ?
		WHERE ls.course_id IN (`+placeholders(len(courseIDs))+`) AND ls.status = 'published'
		GROUP BY ls.course_id`, append([]any{userID}, argsOf(courseIDs)...)...)
	if err != nil {
		return nil, fmt.Errorf("count completions: %w", err)
	}
	defer rows.Close()
	for rows.Next() {
		var courseID string
		var completed int
		if err := rows.Scan(&courseID, &completed); err != nil {
			return nil, fmt.Errorf("scan completion count: %w", err)
		}
		states[courseID] = enrollmentStateRow{completed: completed}
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	enrolledRows, err := r.db.QueryContext(ctx, `
		SELECT course_id FROM enrollments WHERE user_id = ?`, userID)
	if err != nil {
		return nil, fmt.Errorf("load enrollments: %w", err)
	}
	defer enrolledRows.Close()
	for enrolledRows.Next() {
		var courseID string
		if err := enrolledRows.Scan(&courseID); err != nil {
			return nil, fmt.Errorf("scan enrollment: %w", err)
		}
		if state, ok := states[courseID]; ok {
			state.enrolled = true
			states[courseID] = state
		}
	}
	return states, enrolledRows.Err()
}

func argsOf(values []string) []any {
	args := make([]any, 0, len(values))
	for _, value := range values {
		args = append(args, value)
	}
	return args
}

func placeholders(count int) string {
	result := "?,"
	for index := 1; index < count; index++ {
		result += "?,"
	}
	return result[:len(result)-1]
}

func (r *Repository) LessonSummaries(ctx context.Context, courseID, userID string, includeDrafts bool) ([]LessonSummary, error) {
	query := `
		SELECT ls.id, ls.slug, ls.title, ls.summary, ls.duration_minutes, ls.lesson_order
		FROM lessons ls
		WHERE ls.course_id = ?`
	if !includeDrafts {
		query += ` AND ls.status = 'published'`
	}
	query += ` ORDER BY ls.lesson_order, ls.created_at`
	rows, err := r.db.QueryContext(ctx, query, courseID)
	if err != nil {
		return nil, fmt.Errorf("list course lessons: %w", err)
	}
	defer rows.Close()
	lessons := make([]LessonSummary, 0)
	for rows.Next() {
		var lesson LessonSummary
		if err := rows.Scan(&lesson.ID, &lesson.Slug, &lesson.Title, &lesson.Summary, &lesson.DurationMinutes, &lesson.LessonOrder); err != nil {
			return nil, fmt.Errorf("scan lesson summary: %w", err)
		}
		lessons = append(lessons, lesson)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if userID != "" {
		completions, err := r.completionsFor(ctx, userID, courseID)
		if err != nil {
			return nil, err
		}
		for index := range lessons {
			if record, ok := completions[lessons[index].ID]; ok {
				lessons[index].Completed = true
				lessons[index].Score = record.score
				lessons[index].CompletedAt = record.completedAt
			}
		}
	}
	return lessons, nil
}

type completionRecord struct {
	score       *int
	completedAt *time.Time
}

func (r *Repository) completionsFor(ctx context.Context, userID, courseID string) (map[string]completionRecord, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT lc.lesson_id, lc.score, lc.completed_at
		FROM lesson_completions lc
		JOIN lessons ls ON ls.id = lc.lesson_id
		WHERE lc.user_id = ? AND ls.course_id = ?`, userID, courseID)
	if err != nil {
		return nil, fmt.Errorf("load completions: %w", err)
	}
	defer rows.Close()
	records := make(map[string]completionRecord)
	for rows.Next() {
		var lessonID string
		var score sql.NullInt64
		var completedAt sql.NullTime
		if err := rows.Scan(&lessonID, &score, &completedAt); err != nil {
			return nil, fmt.Errorf("scan completion: %w", err)
		}
		record := completionRecord{}
		if score.Valid {
			value := int(score.Int64)
			record.score = &value
		}
		if completedAt.Valid {
			finished := completedAt.Time
			record.completedAt = &finished
		}
		records[lessonID] = record
	}
	return records, rows.Err()
}

func (r *Repository) Enroll(ctx context.Context, userID, courseID string) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT IGNORE INTO enrollments (id, user_id, course_id)
		VALUES (?, ?, ?)`, platform.NewIDOrPanic(), userID, courseID)
	if err != nil {
		return fmt.Errorf("enroll: %w", err)
	}
	return nil
}

func (r *Repository) Unenroll(ctx context.Context, userID, courseID string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM enrollments WHERE user_id = ? AND course_id = ?`, userID, courseID)
	if err != nil {
		return fmt.Errorf("unenroll: %w", err)
	}
	return nil
}

func (r *Repository) LessonByID(ctx context.Context, lessonID string) (LessonDetail, error) {
	var lesson LessonDetail
	var videoURL, imageURL, skill sql.NullString
	err := r.db.QueryRowContext(ctx, `
		SELECT ls.id, ls.course_id, c.slug, c.title, ls.title, ls.summary, ls.content,
		       ls.video_url, ls.image_url, ls.skill, ls.duration_minutes, ls.lesson_order
		FROM lessons ls
		JOIN courses c ON c.id = ls.course_id
		WHERE ls.id = ? AND ls.status = 'published'`, lessonID).
		Scan(&lesson.ID, &lesson.CourseID, &lesson.CourseSlug, &lesson.CourseTitle, &lesson.Title, &lesson.Summary, &lesson.Content,
			&videoURL, &imageURL, &skill, &lesson.DurationMinutes, &lesson.LessonOrder)
	if err != nil {
		return LessonDetail{}, err
	}
	lesson.VideoURL = videoURL.String
	lesson.ImageURL = imageURL.String
	lesson.Skill = skill.String
	return lesson, nil
}

func (r *Repository) courseSkills(ctx context.Context, courseID string) []string {
	rows, err := r.db.QueryContext(ctx, `SELECT skill FROM course_skills WHERE course_id = ?`, courseID)
	if err != nil {
		return []string{}
	}
	defer rows.Close()
	skills := make([]string, 0)
	for rows.Next() {
		var skill string
		if err := rows.Scan(&skill); err != nil {
			return skills
		}
		skills = append(skills, skill)
	}
	return skills
}

func (r *Repository) LessonCompletion(ctx context.Context, userID, lessonID string) (*int, error) {
	var score sql.NullInt64
	err := r.db.QueryRowContext(ctx, `
		SELECT score FROM lesson_completions WHERE user_id = ? AND lesson_id = ?`, userID, lessonID).Scan(&score)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	if !score.Valid {
		return nil, nil
	}
	value := int(score.Int64)
	return &value, nil
}

func (r *Repository) RecordCompletion(ctx context.Context, userID, lessonID string, score *int, minutes, xp int) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin completion: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO lesson_completions (id, user_id, lesson_id, score)
		VALUES (?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE score = COALESCE(VALUES(score), score), completed_at = UTC_TIMESTAMP(6)`,
		platform.NewIDOrPanic(), userID, lessonID, score); err != nil {
		return fmt.Errorf("insert completion: %w", err)
	}
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO learning_sessions (id, user_id, language_id, minutes, xp, skill)
		SELECT ?, ?, c.language_id, ?, ?, 'course'
		FROM lessons ls JOIN courses c ON c.id = ls.course_id
		WHERE ls.id = ?`,
		platform.NewIDOrPanic(), userID, minutes, xp, lessonID); err != nil {
		return fmt.Errorf("insert learning session: %w", err)
	}
	return tx.Commit()
}
