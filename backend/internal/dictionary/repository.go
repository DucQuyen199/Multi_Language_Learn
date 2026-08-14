package dictionary

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Search(ctx context.Context, language, query string, limit int) ([]SearchResult, error) {
	query = strings.TrimSpace(query)
	if query == "" {
		return []SearchResult{}, nil
	}
	if limit <= 0 || limit > 30 {
		limit = 12
	}
	pattern := "%" + query + "%"
	sqlQuery := `
		SELECT de.id, l.code, de.word, de.slug, de.ipa, de.part_of_speech, de.cefr,
		       de.frequency, COALESCE(wm.definition, ''), COALESCE(wt.translation, '')
		FROM dictionary_entries de
		JOIN languages l ON l.id = de.language_id
		LEFT JOIN word_meanings wm ON wm.entry_id = de.id AND wm.sense_order = 1
		LEFT JOIN word_translations wt ON wt.meaning_id = wm.id AND wt.language_id = (SELECT id FROM languages WHERE code = 'vi')
		WHERE l.code = ?
		  AND (de.word LIKE ? OR de.lemma LIKE ? OR MATCH(de.word, de.lemma) AGAINST(? IN NATURAL LANGUAGE MODE))
		ORDER BY CASE WHEN de.word = ? THEN 0 WHEN de.word LIKE ? THEN 1 ELSE 2 END, de.frequency DESC
		LIMIT ?`
	rows, err := r.db.QueryContext(ctx, sqlQuery, language, pattern, pattern, query, query, pattern, limit)
	if err != nil {
		return nil, fmt.Errorf("search dictionary: %w", err)
	}
	defer rows.Close()

	results := make([]SearchResult, 0, limit)
	for rows.Next() {
		var item SearchResult
		if err := rows.Scan(&item.ID, &item.LanguageCode, &item.Word, &item.Slug, &item.IPA, &item.PartOfSpeech, &item.CEFR, &item.Frequency, &item.Definition, &item.Translation); err != nil {
			return nil, fmt.Errorf("scan dictionary result: %w", err)
		}
		results = append(results, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate dictionary results: %w", err)
	}
	return results, nil
}

func (r *Repository) FindBySlug(ctx context.Context, language, slug string) (Entry, error) {
	var entry Entry
	row := r.db.QueryRowContext(ctx, `
		SELECT de.id, l.code, l.name, de.word, de.slug, de.lemma, de.ipa,
		       de.part_of_speech, de.cefr, de.academic_level, de.frequency,
		       de.domain, de.formality
		FROM dictionary_entries de
		JOIN languages l ON l.id = de.language_id
		WHERE l.code = ? AND de.slug = ? AND de.deleted_at IS NULL`, language, slug)
	if err := row.Scan(&entry.ID, &entry.LanguageCode, &entry.LanguageName, &entry.Word, &entry.Slug, &entry.Lemma, &entry.IPA, &entry.PartOfSpeech, &entry.CEFR, &entry.AcademicLevel, &entry.Frequency, &entry.Domain, &entry.Formality); err != nil {
		if err == sql.ErrNoRows {
			return Entry{}, ErrNotFound
		}
		return Entry{}, fmt.Errorf("find dictionary entry: %w", err)
	}

	meaningRows, err := r.db.QueryContext(ctx, `SELECT id, sense_order, definition FROM word_meanings WHERE entry_id = ? ORDER BY sense_order`, entry.ID)
	if err != nil {
		return Entry{}, fmt.Errorf("load meanings: %w", err)
	}
	defer meaningRows.Close()
	for meaningRows.Next() {
		var meaning Meaning
		if err := meaningRows.Scan(&meaning.ID, &meaning.Order, &meaning.Definition); err != nil {
			return Entry{}, fmt.Errorf("scan meaning: %w", err)
		}
		translationRows, err := r.db.QueryContext(ctx, `SELECT translation FROM word_translations WHERE meaning_id = ? ORDER BY language_id`, meaning.ID)
		if err != nil {
			return Entry{}, fmt.Errorf("load translations: %w", err)
		}
		for translationRows.Next() {
			var translation string
			if err := translationRows.Scan(&translation); err != nil {
				translationRows.Close()
				return Entry{}, fmt.Errorf("scan translation: %w", err)
			}
			meaning.Translations = append(meaning.Translations, translation)
		}
		translationRows.Close()

		exampleRows, err := r.db.QueryContext(ctx, `SELECT id, sentence, COALESCE(translation, '') FROM word_examples WHERE meaning_id = ? ORDER BY example_order`, meaning.ID)
		if err != nil {
			return Entry{}, fmt.Errorf("load examples: %w", err)
		}
		for exampleRows.Next() {
			var example Example
			if err := exampleRows.Scan(&example.ID, &example.Sentence, &example.Translation); err != nil {
				exampleRows.Close()
				return Entry{}, fmt.Errorf("scan example: %w", err)
			}
			meaning.Examples = append(meaning.Examples, example)
		}
		exampleRows.Close()
		entry.Meanings = append(entry.Meanings, meaning)
	}
	if err := meaningRows.Err(); err != nil {
		return Entry{}, fmt.Errorf("iterate meanings: %w", err)
	}

	pronunciationRows, err := r.db.QueryContext(ctx, `SELECT accent, ipa, COALESCE(audio_url, '') FROM word_pronunciations WHERE entry_id = ? ORDER BY accent`, entry.ID)
	if err != nil {
		return Entry{}, fmt.Errorf("load pronunciations: %w", err)
	}
	defer pronunciationRows.Close()
	for pronunciationRows.Next() {
		var pronunciation Pronunciation
		if err := pronunciationRows.Scan(&pronunciation.Accent, &pronunciation.IPA, &pronunciation.Audio); err != nil {
			return Entry{}, fmt.Errorf("scan pronunciation: %w", err)
		}
		entry.Pronunciations = append(entry.Pronunciations, pronunciation)
	}
	return entry, nil
}
