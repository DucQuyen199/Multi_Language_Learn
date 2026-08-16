package admin

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
)

type Repository struct{ db *sql.DB }

func NewRepository(db *sql.DB) *Repository { return &Repository{db: db} }

func (r *Repository) Overview(ctx context.Context) (Overview, error) {
	var overview Overview
	err := r.db.QueryRowContext(ctx, `
		SELECT
			COUNT(*),
			SUM(role = 'student'),
			SUM(role = 'instructor'),
			SUM(role = 'admin'),
			SUM(created_at >= DATE_SUB(UTC_TIMESTAMP(6), INTERVAL 7 DAY))
		FROM users WHERE deleted_at IS NULL`).
		Scan(&overview.Users.Total, &overview.Users.Students, &overview.Users.Instructors, &overview.Users.Admins, &overview.Users.NewThisWeek)
	if err != nil {
		return Overview{}, fmt.Errorf("count users: %w", err)
	}
	err = r.db.QueryRowContext(ctx, `
		SELECT COUNT(*), SUM(status = 'published'), SUM(status = 'draft'), SUM(status = 'pending'), SUM(status = 'archived')
		FROM courses`).
		Scan(&overview.Courses.Total, &overview.Courses.Published, &overview.Courses.Draft, &overview.Courses.Pending, &overview.Courses.Archived)
	if err != nil {
		return Overview{}, fmt.Errorf("count courses: %w", err)
	}
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM lessons`).Scan(&overview.Lessons); err != nil {
		return Overview{}, fmt.Errorf("count lessons: %w", err)
	}
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM enrollments`).Scan(&overview.Enrollments); err != nil {
		return Overview{}, fmt.Errorf("count enrollments: %w", err)
	}
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM lesson_completions`).Scan(&overview.LessonCompletions); err != nil {
		return Overview{}, fmt.Errorf("count completions: %w", err)
	}
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM dictionary_entries WHERE deleted_at IS NULL`).Scan(&overview.DictionaryWords); err != nil {
		return Overview{}, fmt.Errorf("count dictionary: %w", err)
	}
	if err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(DISTINCT user_id) FROM learning_sessions
		WHERE studied_at >= UTC_DATE()`).Scan(&overview.ActiveToday); err != nil {
		return Overview{}, fmt.Errorf("count active learners: %w", err)
	}

	if users, err := r.recentUsers(ctx, 5); err == nil {
		overview.RecentUsers = users
	}
	if enrollments, err := r.recentEnrollments(ctx, 6); err == nil {
		overview.RecentEnrollments = enrollments
	}
	return overview, nil
}

func (r *Repository) recentUsers(ctx context.Context, limit int) ([]Account, error) {
	rows, err := r.db.QueryContext(ctx, accountQuery+`
		WHERE u.deleted_at IS NULL
		ORDER BY u.created_at DESC
		LIMIT ?`, limit)
	if err != nil {
		return nil, fmt.Errorf("list recent users: %w", err)
	}
	return scanAccounts(rows)
}

func (r *Repository) recentEnrollments(ctx context.Context, limit int) ([]EnrollmentEvent, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT e.id, COALESCE(up.first_name, 'Learner'), u.email, c.title,
		       COALESCE(ui.first_name, 'Unassigned'), e.enrolled_at
		FROM enrollments e
		JOIN users u ON u.id = e.user_id
		LEFT JOIN user_profiles up ON up.user_id = u.id
		JOIN courses c ON c.id = e.course_id
		LEFT JOIN user_profiles ui ON ui.user_id = c.instructor_id
		ORDER BY e.enrolled_at DESC
		LIMIT ?`, limit)
	if err != nil {
		return nil, fmt.Errorf("list recent enrollments: %w", err)
	}
	defer rows.Close()
	events := make([]EnrollmentEvent, 0)
	for rows.Next() {
		var event EnrollmentEvent
		if err := rows.Scan(&event.ID, &event.StudentName, &event.StudentEmail, &event.CourseTitle, &event.InstructorName, &event.EnrolledAt); err != nil {
			return nil, fmt.Errorf("scan enrollment event: %w", err)
		}
		events = append(events, event)
	}
	return events, rows.Err()
}

const accountQuery = `
	SELECT u.id, u.email, COALESCE(up.first_name, 'Learner'), u.role, u.email_verified_at, u.created_at,
	       (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id),
	       (SELECT COUNT(*) FROM courses c WHERE c.instructor_id = u.id),
	       (SELECT COUNT(*) FROM lesson_completions lc WHERE lc.user_id = u.id)
	FROM users u
	LEFT JOIN user_profiles up ON up.user_id = u.id`

func scanAccounts(rows *sql.Rows) ([]Account, error) {
	defer rows.Close()
	accounts := make([]Account, 0)
	for rows.Next() {
		var account Account
		var verifiedAt sql.NullTime
		if err := rows.Scan(
			&account.ID, &account.Email, &account.FirstName, &account.Role, &verifiedAt, &account.CreatedAt,
			&account.EnrolledCount, &account.TeachingCount, &account.CompletedLessons,
		); err != nil {
			return nil, fmt.Errorf("scan account: %w", err)
		}
		account.EmailVerified = verifiedAt.Valid
		accounts = append(accounts, account)
	}
	return accounts, rows.Err()
}

func (r *Repository) Users(ctx context.Context, role, search string, limit, offset int) (UserList, error) {
	where := " WHERE u.deleted_at IS NULL"
	args := []any{}
	if role != "" {
		where += " AND u.role = ?"
		args = append(args, role)
	}
	if search != "" {
		// Escape LIKE wildcards so a "%" or "_" in the query cannot widen the filter.
		where += " AND (u.email LIKE ? ESCAPE '\\\\' OR up.first_name LIKE ? ESCAPE '\\\\')"
		pattern := "%" + escapeLikeWildcards(search) + "%"
		args = append(args, pattern, pattern)
	}

	var total int
	if err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM users u LEFT JOIN user_profiles up ON up.user_id = u.id`+where, args...).
		Scan(&total); err != nil {
		return UserList{}, fmt.Errorf("count filtered users: %w", err)
	}

	query := accountQuery + where + " ORDER BY u.created_at DESC LIMIT ? OFFSET ?"
	args = append(args, limit, offset)
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return UserList{}, fmt.Errorf("list users: %w", err)
	}
	accounts, err := scanAccounts(rows)
	if err != nil {
		return UserList{}, err
	}
	return UserList{Items: accounts, Total: total, Limit: limit, Offset: offset}, nil
}

func (r *Repository) FindUser(ctx context.Context, userID string) (Account, error) {
	rows, err := r.db.QueryContext(ctx, accountQuery+" WHERE u.id = ? AND u.deleted_at IS NULL", userID)
	if err != nil {
		return Account{}, fmt.Errorf("find user: %w", err)
	}
	accounts, err := scanAccounts(rows)
	if err != nil {
		return Account{}, err
	}
	if len(accounts) == 0 {
		return Account{}, sql.ErrNoRows
	}
	return accounts[0], nil
}

func (r *Repository) UpdateUser(ctx context.Context, userID, role, firstName string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin update user: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	if role != "" {
		if _, err := tx.ExecContext(ctx, `UPDATE users SET role = ? WHERE id = ? AND deleted_at IS NULL`, role, userID); err != nil {
			return fmt.Errorf("update role: %w", err)
		}
		if role != "instructor" {
			if _, err := tx.ExecContext(ctx, `UPDATE courses SET instructor_id = NULL WHERE instructor_id = ?`, userID); err != nil {
				return fmt.Errorf("detach courses: %w", err)
			}
		}
	}
	if firstName != "" {
		result, err := tx.ExecContext(ctx, `UPDATE user_profiles SET first_name = ? WHERE user_id = ?`, firstName, userID)
		if err != nil {
			return fmt.Errorf("update first name: %w", err)
		}
		if affected, _ := result.RowsAffected(); affected == 0 {
			if _, err := tx.ExecContext(ctx, `INSERT INTO user_profiles (user_id, first_name) VALUES (?, ?)`, userID, firstName); err != nil {
				return fmt.Errorf("insert profile: %w", err)
			}
		}
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit user update: %w", err)
	}
	return nil
}

func (r *Repository) SoftDeleteUser(ctx context.Context, userID string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin delete user: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	result, err := tx.ExecContext(ctx, `UPDATE users SET deleted_at = UTC_TIMESTAMP(6) WHERE id = ? AND deleted_at IS NULL`, userID)
	if err != nil {
		return fmt.Errorf("soft delete user: %w", err)
	}
	if affected, _ := result.RowsAffected(); affected == 0 {
		return sql.ErrNoRows
	}
	if _, err := tx.ExecContext(ctx, `
		UPDATE auth_access_tokens SET revoked_at = COALESCE(revoked_at, UTC_TIMESTAMP(6)) WHERE user_id = ?
	`, userID); err != nil {
		return fmt.Errorf("revoke access tokens: %w", err)
	}
	if _, err := tx.ExecContext(ctx, `
		UPDATE auth_refresh_tokens SET revoked_at = COALESCE(revoked_at, UTC_TIMESTAMP(6)) WHERE user_id = ?
	`, userID); err != nil {
		return fmt.Errorf("revoke refresh tokens: %w", err)
	}
	if _, err := tx.ExecContext(ctx, `UPDATE courses SET instructor_id = NULL WHERE instructor_id = ?`, userID); err != nil {
		return fmt.Errorf("detach courses: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit delete user: %w", err)
	}
	return nil
}

func (r *Repository) Courses(ctx context.Context) ([]CourseRow, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT c.id, c.slug, c.title, c.description, c.cefr, c.status, c.review_note, l.code,
		       COALESCE(c.instructor_id, ''), COALESCE(up.first_name, 'Unassigned'),
		       c.lesson_count, c.duration_minutes,
		       (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id)
		FROM courses c
		JOIN languages l ON l.id = c.language_id
		LEFT JOIN user_profiles up ON up.user_id = c.instructor_id
		ORDER BY FIELD(c.status, 'pending', 'draft', 'published', 'archived'), c.created_at DESC`)
	if err != nil {
		return nil, fmt.Errorf("list admin courses: %w", err)
	}
	defer rows.Close()
	courses := make([]CourseRow, 0)
	for rows.Next() {
		var course CourseRow
		if err := rows.Scan(
			&course.ID, &course.Slug, &course.Title, &course.Description, &course.CEFR, &course.Status, &course.ReviewNote, &course.LanguageCode,
			&course.InstructorID, &course.InstructorName, &course.LessonCount, &course.DurationMinutes, &course.EnrollmentCount,
		); err != nil {
			return nil, fmt.Errorf("scan admin course: %w", err)
		}
		courses = append(courses, course)
	}
	return courses, rows.Err()
}

func (r *Repository) ReviewCourse(ctx context.Context, courseID, status, note string) error {
	result, err := r.db.ExecContext(ctx, `
		UPDATE courses SET status = ?, review_note = ? WHERE id = ?`, status, note, courseID)
	if err != nil {
		return fmt.Errorf("review course: %w", err)
	}
	if affected, _ := result.RowsAffected(); affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *Repository) FindCourseStatus(ctx context.Context, courseID string) (string, error) {
	var status string
	err := r.db.QueryRowContext(ctx, `SELECT status FROM courses WHERE id = ?`, courseID).Scan(&status)
	return status, err
}

func (r *Repository) UpdateCourseStatus(ctx context.Context, courseID, status string) error {
	result, err := r.db.ExecContext(ctx, `UPDATE courses SET status = ? WHERE id = ?`, status, courseID)
	if err != nil {
		return fmt.Errorf("update course status: %w", err)
	}
	if affected, _ := result.RowsAffected(); affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *Repository) Languages(ctx context.Context) ([]LanguageRow, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT l.id, l.code, l.name, l.native_name, l.flag_emoji, l.is_active,
		       (SELECT COUNT(*) FROM dictionary_entries de WHERE de.language_id = l.id AND de.deleted_at IS NULL),
		       (SELECT COUNT(*) FROM courses c WHERE c.language_id = l.id),
		       (SELECT COUNT(*) FROM user_languages ul WHERE ul.language_id = l.id)
		FROM languages l
		ORDER BY l.name`)
	if err != nil {
		return nil, fmt.Errorf("list languages: %w", err)
	}
	defer rows.Close()
	languages := make([]LanguageRow, 0)
	for rows.Next() {
		var language LanguageRow
		if err := rows.Scan(
			&language.ID, &language.Code, &language.Name, &language.NativeName, &language.FlagEmoji, &language.IsActive,
			&language.WordCount, &language.CourseCount, &language.LearnerCount,
		); err != nil {
			return nil, fmt.Errorf("scan language: %w", err)
		}
		languages = append(languages, language)
	}
	return languages, rows.Err()
}

func (r *Repository) UpdateLanguageActive(ctx context.Context, languageID string, active bool) error {
	result, err := r.db.ExecContext(ctx, `UPDATE languages SET is_active = ? WHERE id = ?`, active, languageID)
	if err != nil {
		return fmt.Errorf("update language: %w", err)
	}
	if affected, _ := result.RowsAffected(); affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *Repository) CountAdminsBesides(ctx context.Context, excludedUserID string) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM users
		WHERE role = 'admin' AND deleted_at IS NULL AND id <> ?`, excludedUserID).
		Scan(&count)
	return count, err
}

func validCourseStatus(status string) bool {
	switch strings.ToLower(strings.TrimSpace(status)) {
	case "draft", "published", "archived":
		return true
	}
	return false
}

var likeWildcardEscaper = strings.NewReplacer(`\`, `\\`, `%`, `\%`, `_`, `\_`)

func escapeLikeWildcards(value string) string {
	return likeWildcardEscaper.Replace(value)
}

func normalizeCourseStatus(status string) string { return strings.ToLower(strings.TrimSpace(status)) }
