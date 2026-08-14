package vocabulary

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

func (r *Repository) List(ctx context.Context, userID string) ([]Item, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT vi.id, vi.entry_id, de.word, de.ipa, de.part_of_speech, de.cefr,
		       COALESCE((SELECT wt.translation FROM word_translations wt
		          JOIN word_meanings wm ON wm.id = wt.meaning_id
		          JOIN languages tl ON tl.id = wt.language_id
		          WHERE wm.entry_id = de.id AND tl.code = 'vi' ORDER BY wm.sense_order LIMIT 1), ''),
		       COALESCE(vi.note, ''), COALESCE(rs.mastery, 0),
		       COALESCE(DATE_FORMAT(rs.next_review_at, '%Y-%m-%dT%H:%i:%sZ'), ''),
		       DATE_FORMAT(vi.created_at, '%Y-%m-%dT%H:%i:%sZ')
		FROM vocabulary_items vi
		JOIN dictionary_entries de ON de.id = vi.entry_id
		LEFT JOIN review_schedules rs ON rs.vocabulary_item_id = vi.id
		WHERE vi.user_id = ? AND vi.deleted_at IS NULL
		ORDER BY vi.created_at DESC`, userID)
	if err != nil {
		return nil, fmt.Errorf("list vocabulary: %w", err)
	}
	defer rows.Close()
	items := make([]Item, 0)
	for rows.Next() {
		var item Item
		if err := rows.Scan(&item.ID, &item.EntryID, &item.Word, &item.IPA, &item.PartOfSpeech, &item.CEFR, &item.Translation, &item.Note, &item.Mastery, &item.NextReviewAt, &item.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan vocabulary: %w", err)
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *Repository) Save(ctx context.Context, input SaveInput) (Item, error) {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO vocabulary_items (id, user_id, entry_id, note)
		VALUES (UUID(), ?, ?, NULLIF(?, ''))
		ON DUPLICATE KEY UPDATE deleted_at = NULL, note = NULLIF(?, '')`, input.UserID, input.EntryID, input.Note, input.Note)
	if err != nil {
		return Item{}, fmt.Errorf("save vocabulary: %w", err)
	}
	items, err := r.List(ctx, input.UserID)
	if err != nil {
		return Item{}, err
	}
	for _, item := range items {
		if item.EntryID == input.EntryID {
			return item, nil
		}
	}
	return Item{}, sql.ErrNoRows
}

func (r *Repository) Delete(ctx context.Context, userID, entryID string) error {
	result, err := r.db.ExecContext(ctx, `UPDATE vocabulary_items SET deleted_at = UTC_TIMESTAMP() WHERE user_id = ? AND entry_id = ? AND deleted_at IS NULL`, userID, entryID)
	if err != nil {
		return fmt.Errorf("remove vocabulary: %w", err)
	}
	if affected, _ := result.RowsAffected(); affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}
