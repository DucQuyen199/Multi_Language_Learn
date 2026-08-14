package dashboard

import (
	"context"
	"database/sql"
	"fmt"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Summary(ctx context.Context, userID, language string) (Summary, error) {
	var summary Summary
	var firstName string
	if err := r.db.QueryRowContext(ctx, `SELECT COALESCE(up.first_name, 'Learner') FROM users u LEFT JOIN user_profiles up ON up.user_id = u.id WHERE u.id = ?`, userID).Scan(&firstName); err != nil && err != sql.ErrNoRows {
		return Summary{}, fmt.Errorf("load profile: %w", err)
	}
	summary.Greeting = firstName
	summary.TargetLanguage = language
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM vocabulary_items vi JOIN dictionary_entries de ON de.id = vi.entry_id JOIN languages l ON l.id = de.language_id WHERE vi.user_id = ? AND l.code = ? AND vi.deleted_at IS NULL`, userID, language).Scan(&summary.WordsLearned); err != nil {
		return Summary{}, fmt.Errorf("count words: %w", err)
	}
	if err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM review_schedules rs JOIN vocabulary_items vi ON vi.id = rs.vocabulary_item_id WHERE rs.user_id = ? AND vi.deleted_at IS NULL AND rs.next_review_at <= UTC_TIMESTAMP()`, userID).Scan(&summary.DueReviews); err != nil {
		return Summary{}, fmt.Errorf("count reviews: %w", err)
	}
	if err := r.db.QueryRowContext(ctx, `SELECT COALESCE(SUM(minutes), 0) FROM learning_sessions WHERE user_id = ? AND studied_at >= UTC_DATE()`, userID).Scan(&summary.StudyMinutes); err != nil {
		return Summary{}, fmt.Errorf("sum study minutes: %w", err)
	}
	if err := r.db.QueryRowContext(ctx, `SELECT COALESCE(SUM(xp), 0) FROM learning_sessions WHERE user_id = ? AND studied_at >= UTC_DATE()`, userID).Scan(&summary.DailyXP); err != nil {
		return Summary{}, fmt.Errorf("sum xp: %w", err)
	}
	if err := r.db.QueryRowContext(ctx, `SELECT COALESCE(MAX(current_streak), 0), COALESCE(MAX(daily_goal), 50), COALESCE(MAX(cefr_level), 'B1') FROM user_languages WHERE user_id = ? AND language_id = (SELECT id FROM languages WHERE code = ?)`, userID, language).Scan(&summary.StreakDays, &summary.DailyGoal, &summary.CurrentLevel); err != nil {
		return Summary{}, fmt.Errorf("load learner level: %w", err)
	}
	summary.LevelProgress = 68
	summary.Skills = Skills{Listening: 62, Speaking: 54, Reading: 78, Writing: 64}
	return summary, nil
}
