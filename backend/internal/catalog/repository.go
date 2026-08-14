package catalog

import (
	"context"
	"database/sql"
	"fmt"
)

type Repository struct { db *sql.DB }

func NewRepository(db *sql.DB) *Repository { return &Repository{db: db} }

func (r *Repository) Grammar(ctx context.Context, language, level string) ([]GrammarTopic, error) {
	query := `SELECT gt.id, gt.slug, gt.title, gt.cefr, gt.summary FROM grammar_topics gt JOIN languages l ON l.id = gt.language_id WHERE l.code = ?`
	args := []any{language}
	if level != "" {
		query += " AND gt.cefr = ?"
		args = append(args, level)
	}
	query += " ORDER BY FIELD(gt.cefr, 'A1','A2','B1','B2','C1','C2'), gt.title"
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil { return nil, fmt.Errorf("list grammar topics: %w", err) }
	defer rows.Close()
	items := make([]GrammarTopic, 0)
	for rows.Next() {
		var item GrammarTopic
		if err := rows.Scan(&item.ID, &item.Slug, &item.Title, &item.CEFR, &item.Summary); err != nil { return nil, fmt.Errorf("scan grammar topic: %w", err) }
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) Courses(ctx context.Context, language string) ([]Course, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT c.id, c.slug, c.title, c.description, c.cefr, c.lesson_count, c.duration_minutes FROM courses c JOIN languages l ON l.id = c.language_id WHERE l.code = ? ORDER BY c.cefr, c.title`, language)
	if err != nil { return nil, fmt.Errorf("list courses: %w", err) }
	defer rows.Close()
	items := make([]Course, 0)
	for rows.Next() {
		var item Course
		if err := rows.Scan(&item.ID, &item.Slug, &item.Title, &item.Description, &item.CEFR, &item.LessonCount, &item.DurationMinutes); err != nil { return nil, fmt.Errorf("scan course: %w", err) }
		items = append(items, item)
	}
	return items, rows.Err()
}
