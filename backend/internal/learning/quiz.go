package learning

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/auth"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/platform"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/transport"
)

/* --------------------------------- models ---------------------------------- */

// LearnerQuestion deliberately omits the correct answer: grading happens on
// the server so answers cannot be scraped from the API response.
type LearnerQuestion struct {
	ID       string   `json:"id"`
	Order    int      `json:"order"`
	Question string   `json:"question"`
	Options  []string `json:"options"`
}

type AnswerInput struct {
	QuestionID string `json:"question_id"`
	Choice     int    `json:"choice"`
}

type QuizSubmitInput struct {
	Answers []AnswerInput `json:"answers"`
}

type GradedAnswer struct {
	QuestionID   string `json:"question_id"`
	Choice       int    `json:"choice"`
	CorrectIndex int    `json:"correct_index"`
	IsCorrect    bool   `json:"is_correct"`
	Explanation  string `json:"explanation"`
}

type QuizResult struct {
	Score      int            `json:"score"` // percent
	Correct    int            `json:"correct"`
	Total      int            `json:"total"`
	Details    []GradedAnswer `json:"details"`
	LessonDone bool           `json:"lesson_done"`
}

type LearnerExam struct {
	ID              string            `json:"id"`
	CourseID        string            `json:"course_id"`
	CourseTitle     string            `json:"course_title"`
	CourseSlug      string            `json:"course_slug"`
	Title           string            `json:"title"`
	Description     string            `json:"description"`
	PassScore       int               `json:"pass_score"`
	DurationMinutes int               `json:"duration_minutes"`
	QuestionCount   int               `json:"question_count"`
	Questions       []LearnerQuestion `json:"questions"`
	BestScore       *int              `json:"best_score"`
	Passed          bool              `json:"passed"`
}

type ExamResult struct {
	AttemptID string         `json:"attempt_id"`
	Score     int            `json:"score"`
	Passed    bool           `json:"passed"`
	PassScore int            `json:"pass_score"`
	Correct   int            `json:"correct"`
	Total     int            `json:"total"`
	Details   []GradedAnswer `json:"details"`
}

/* ------------------------------- repository -------------------------------- */

type storedQuestion struct {
	id, question, explanation string
	order, correct            int
	options                   []string
}

func (r *Repository) loadQuestions(ctx context.Context, table, ownerColumn, ownerID string) ([]storedQuestion, error) {
	rows, err := r.db.QueryContext(ctx, fmt.Sprintf(
		`SELECT id, question_order, question, options, correct_index, explanation FROM %s WHERE %s = ? ORDER BY question_order`,
		table, ownerColumn), ownerID)
	if err != nil {
		return nil, fmt.Errorf("load questions: %w", err)
	}
	defer rows.Close()
	questions := make([]storedQuestion, 0)
	for rows.Next() {
		var question storedQuestion
		var optionsJSON string
		if err := rows.Scan(&question.id, &question.order, &question.question, &optionsJSON, &question.correct, &question.explanation); err != nil {
			return nil, fmt.Errorf("scan question: %w", err)
		}
		question.options = []string{}
		_ = json.Unmarshal([]byte(optionsJSON), &question.options)
		questions = append(questions, question)
	}
	return questions, rows.Err()
}

func (r *Repository) findExam(ctx context.Context, examID string) (LearnerExam, error) {
	var exam LearnerExam
	err := r.db.QueryRowContext(ctx, `
		SELECT e.id, e.course_id, c.title, c.slug, e.title, e.description, e.pass_score, e.duration_minutes,
		       (SELECT COUNT(*) FROM exam_questions eq WHERE eq.exam_id = e.id)
		FROM exams e
		JOIN courses c ON c.id = e.course_id
		WHERE e.id = ? AND e.status = 'published' AND c.status = 'published'`, examID).
		Scan(&exam.ID, &exam.CourseID, &exam.CourseTitle, &exam.CourseSlug, &exam.Title, &exam.Description,
			&exam.PassScore, &exam.DurationMinutes, &exam.QuestionCount)
	if err != nil {
		return LearnerExam{}, err
	}
	return exam, nil
}

func (r *Repository) bestAttempt(ctx context.Context, examID, userID string) (*int, error) {
	var best sql.NullInt64
	err := r.db.QueryRowContext(ctx, `
		SELECT MAX(score) FROM exam_attempts WHERE exam_id = ? AND user_id = ?`, examID, userID).Scan(&best)
	if err != nil {
		return nil, err
	}
	if !best.Valid {
		return nil, nil
	}
	value := int(best.Int64)
	return &value, nil
}

func (r *Repository) saveAttempt(ctx context.Context, examID, userID string, score int, passed bool) (string, error) {
	id := platform.NewIDOrPanic()
	if _, err := r.db.ExecContext(ctx, `
		INSERT INTO exam_attempts (id, exam_id, user_id, score, passed)
		VALUES (?, ?, ?, ?, ?)`, id, examID, userID, score, passed); err != nil {
		return "", fmt.Errorf("save attempt: %w", err)
	}
	return id, nil
}

func (r *Repository) publishedExamSummary(ctx context.Context, courseID string) (id, title string, pass int, err error) {
	err = r.db.QueryRowContext(ctx, `
		SELECT id, title, pass_score FROM exams
		WHERE course_id = ? AND status = 'published'
		ORDER BY created_at DESC LIMIT 1`, courseID).Scan(&id, &title, &pass)
	return id, title, pass, err
}

/* --------------------------------- service --------------------------------- */

func grade(questions []storedQuestion, answers []AnswerInput) (QuizResult, error) {
	choices := make(map[string]int, len(answers))
	for _, answer := range answers {
		choices[answer.QuestionID] = answer.Choice
	}
	result := QuizResult{Details: make([]GradedAnswer, 0, len(questions))}
	for _, question := range questions {
		choice, answered := choices[question.id]
		if !answered {
			choice = -1
		}
		detail := GradedAnswer{
			QuestionID:   question.id,
			Choice:       choice,
			CorrectIndex: question.correct,
			IsCorrect:    choice == question.correct,
			Explanation:  question.explanation,
		}
		result.Total++
		if detail.IsCorrect {
			result.Correct++
		}
		result.Details = append(result.Details, detail)
	}
	if result.Total > 0 {
		result.Score = result.Correct * 100 / result.Total
	}
	return result, nil
}

func (s *Service) LessonQuizQuestions(ctx context.Context, lessonID string) ([]LearnerQuestion, error) {
	if _, err := s.repo.LessonByID(ctx, lessonID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	questions, err := s.repo.loadQuestions(ctx, "quiz_questions", "lesson_id", lessonID)
	if err != nil {
		return nil, err
	}
	return toLearnerQuestions(questions), nil
}

func toLearnerQuestions(questions []storedQuestion) []LearnerQuestion {
	result := make([]LearnerQuestion, 0, len(questions))
	for _, question := range questions {
		result = append(result, LearnerQuestion{ID: question.id, Order: question.order, Question: question.question, Options: question.options})
	}
	return result
}

func (s *Service) SubmitLessonQuiz(ctx context.Context, userID, lessonID string, input QuizSubmitInput) (QuizResult, error) {
	if _, err := s.repo.LessonByID(ctx, lessonID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return QuizResult{}, ErrNotFound
		}
		return QuizResult{}, err
	}
	questions, err := s.repo.loadQuestions(ctx, "quiz_questions", "lesson_id", lessonID)
	if err != nil {
		return QuizResult{}, err
	}
	if len(questions) == 0 {
		return QuizResult{}, ErrNotFound
	}
	result, err := grade(questions, input.Answers)
	if err != nil {
		return QuizResult{}, err
	}
	// A solid quiz pass marks the lesson complete and credits XP like the manual button.
	if result.Score >= 60 {
		if _, err := s.Complete(ctx, userID, lessonID, CompleteInput{Score: &result.Score}); err == nil {
			result.LessonDone = true
		}
	}
	return result, nil
}

func (s *Service) Exam(ctx context.Context, examID, userID string) (LearnerExam, error) {
	exam, err := s.repo.findExam(ctx, examID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return LearnerExam{}, ErrNotFound
		}
		return LearnerExam{}, err
	}
	questions, err := s.repo.loadQuestions(ctx, "exam_questions", "exam_id", examID)
	if err != nil {
		return LearnerExam{}, err
	}
	if len(questions) == 0 {
		return LearnerExam{}, ErrNotFound
	}
	exam.Questions = toLearnerQuestions(questions)
	if userID != "" {
		best, err := s.repo.bestAttempt(ctx, examID, userID)
		if err == nil && best != nil {
			exam.BestScore = best
			exam.Passed = *best >= exam.PassScore
		}
	}
	return exam, nil
}

func (s *Service) SubmitExam(ctx context.Context, userID, examID string, input QuizSubmitInput) (ExamResult, error) {
	exam, err := s.repo.findExam(ctx, examID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ExamResult{}, ErrNotFound
		}
		return ExamResult{}, err
	}
	questions, err := s.repo.loadQuestions(ctx, "exam_questions", "exam_id", examID)
	if err != nil {
		return ExamResult{}, err
	}
	if len(questions) == 0 {
		return ExamResult{}, ErrNotFound
	}
	graded, err := grade(questions, input.Answers)
	if err != nil {
		return ExamResult{}, err
	}
	result := ExamResult{
		Score:     graded.Score,
		Passed:    graded.Score >= exam.PassScore,
		PassScore: exam.PassScore,
		Correct:   graded.Correct,
		Total:     graded.Total,
		Details:   graded.Details,
	}
	result.AttemptID, err = s.repo.saveAttempt(ctx, examID, userID, result.Score, result.Passed)
	if err != nil {
		return ExamResult{}, err
	}
	return result, nil
}

/* --------------------------------- handler --------------------------------- */

func (h *Handler) LessonQuiz(w http.ResponseWriter, r *http.Request) {
	questions, err := h.service.LessonQuizQuestions(r.Context(), r.PathValue("id"))
	if err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, questions)
}

func (h *Handler) SubmitLessonQuiz(w http.ResponseWriter, r *http.Request) {
	var input QuizSubmitInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	result, err := h.service.SubmitLessonQuiz(r.Context(), h.requiredUserID(r, w), r.PathValue("id"), input)
	if err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, result)
}

func (h *Handler) Exam(w http.ResponseWriter, r *http.Request) {
	exam, err := h.service.Exam(r.Context(), r.PathValue("id"), h.userID(r))
	if err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, exam)
}

func (h *Handler) SubmitExam(w http.ResponseWriter, r *http.Request) {
	var input QuizSubmitInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	actor, ok := auth.UserFromContext(r.Context())
	if !ok {
		transport.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Please sign in to continue")
		return
	}
	result, err := h.service.SubmitExam(r.Context(), actor.ID, r.PathValue("id"), input)
	if err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, result)
}
