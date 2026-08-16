package instructor

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"unicode/utf8"

	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/auth"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/platform"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/transport"
)

var (
	ErrQuestionFormat = errors.New("instructor: a question needs 2-4 options, a correct answer, and 5-500 characters of text")
	ErrInvalidSkill   = errors.New("instructor: unknown skill")
)

var validSkills = map[string]bool{
	"listening": true, "speaking": true, "reading": true,
	"writing": true, "vocabulary": true, "grammar": true,
}

/* ---------------------------------- models --------------------------------- */

type CourseSkill struct {
	Skill string `json:"skill"`
	Note  string `json:"note"`
}

type Question struct {
	ID            string   `json:"id"`
	Order         int      `json:"order"`
	Question      string   `json:"question"`
	Options       []string `json:"options"`
	CorrectIndex  int      `json:"correct_index"`
	Explanation   string   `json:"explanation"`
}

type QuestionInput struct {
	Question     string   `json:"question"`
	Options      []string `json:"options"`
	CorrectIndex int      `json:"correct_index"`
	Explanation  string   `json:"explanation"`
}

type Exam struct {
	ID              string `json:"id"`
	CourseID        string `json:"course_id"`
	CourseTitle     string `json:"course_title"`
	Title           string `json:"title"`
	Description     string `json:"description"`
	PassScore       int    `json:"pass_score"`
	DurationMinutes int    `json:"duration_minutes"`
	Status          string `json:"status"`
	QuestionCount   int    `json:"question_count"`
}

type ExamInput struct {
	Title           string `json:"title"`
	Description     string `json:"description"`
	PassScore       int    `json:"pass_score"`
	DurationMinutes int    `json:"duration_minutes"`
	Status          string `json:"status"`
}

type UpdateExamInput struct {
	Title           *string `json:"title"`
	Description     *string `json:"description"`
	PassScore       *int    `json:"pass_score"`
	DurationMinutes *int    `json:"duration_minutes"`
	Status          *string `json:"status"`
}

/* ------------------------------- repository -------------------------------- */

const questionColumns = `id, question_order, question, options, correct_index, explanation`

func scanQuestion(row interface{ Scan(...any) error }) (Question, error) {
	var question Question
	var optionsJSON string
	if err := row.Scan(&question.ID, &question.Order, &question.Question, &optionsJSON, &question.CorrectIndex, &question.Explanation); err != nil {
		return Question{}, err
	}
	question.Options = []string{}
	_ = json.Unmarshal([]byte(optionsJSON), &question.Options)
	return question, nil
}

func (r *Repository) lessonQuestions(ctx context.Context, lessonID string) ([]Question, error) {
	rows, err := r.db.QueryContext(ctx, fmt.Sprintf(
		`SELECT %s FROM quiz_questions WHERE lesson_id = ? ORDER BY question_order`, questionColumns), lessonID)
	if err != nil {
		return nil, fmt.Errorf("list lesson questions: %w", err)
	}
	defer rows.Close()
	questions := make([]Question, 0)
	for rows.Next() {
		question, err := scanQuestion(rows)
		if err != nil {
			return nil, fmt.Errorf("scan lesson question: %w", err)
		}
		questions = append(questions, question)
	}
	return questions, rows.Err()
}

func (r *Repository) addLessonQuestion(ctx context.Context, lessonID string, input QuestionInput, order int) (string, error) {
	id := platform.NewIDOrPanic()
	optionsJSON, err := json.Marshal(input.Options)
	if err != nil {
		return "", err
	}
	if _, err := r.db.ExecContext(ctx, `
		INSERT INTO quiz_questions (id, lesson_id, question_order, question, options, correct_index, explanation)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		id, lessonID, order, input.Question, string(optionsJSON), input.CorrectIndex, input.Explanation); err != nil {
		return "", fmt.Errorf("insert quiz question: %w", err)
	}
	return id, nil
}

func (r *Repository) deleteQuestion(ctx context.Context, table, id string) error {
	result, err := r.db.ExecContext(ctx, fmt.Sprintf(`DELETE FROM %s WHERE id = ?`, table), id)
	if err != nil {
		return fmt.Errorf("delete question: %w", err)
	}
	if affected, _ := result.RowsAffected(); affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *Repository) replaceSkills(ctx context.Context, courseID string, skills []CourseSkill) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin skills: %w", err)
	}
	defer func() { _ = tx.Rollback() }()
	if _, err := tx.ExecContext(ctx, `DELETE FROM course_skills WHERE course_id = ?`, courseID); err != nil {
		return fmt.Errorf("clear skills: %w", err)
	}
	for _, skill := range skills {
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO course_skills (id, course_id, skill, note) VALUES (?, ?, ?, ?)`,
			platform.NewIDOrPanic(), courseID, skill.Skill, skill.Note); err != nil {
			return fmt.Errorf("insert skill: %w", err)
		}
	}
	return tx.Commit()
}

func (r *Repository) listExams(ctx context.Context, courseID string) ([]Exam, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT e.id, e.course_id, c.title, e.title, e.description, e.pass_score, e.duration_minutes, e.status,
		       (SELECT COUNT(*) FROM exam_questions eq WHERE eq.exam_id = e.id)
		FROM exams e
		JOIN courses c ON c.id = e.course_id
		WHERE e.course_id = ?
		ORDER BY e.created_at DESC`, courseID)
	if err != nil {
		return nil, fmt.Errorf("list exams: %w", err)
	}
	defer rows.Close()
	exams := make([]Exam, 0)
	for rows.Next() {
		var exam Exam
		if err := rows.Scan(&exam.ID, &exam.CourseID, &exam.CourseTitle, &exam.Title, &exam.Description,
			&exam.PassScore, &exam.DurationMinutes, &exam.Status, &exam.QuestionCount); err != nil {
			return nil, fmt.Errorf("scan exam: %w", err)
		}
		exams = append(exams, exam)
	}
	return exams, rows.Err()
}

func (r *Repository) findExam(ctx context.Context, examID, instructorID string, includeAll bool) (Exam, error) {
	query := `
		SELECT e.id, e.course_id, c.title, e.title, e.description, e.pass_score, e.duration_minutes, e.status,
		       (SELECT COUNT(*) FROM exam_questions eq WHERE eq.exam_id = e.id)
		FROM exams e
		JOIN courses c ON c.id = e.course_id
		WHERE e.id = ?`
	args := []any{examID}
	if !includeAll {
		query += ` AND c.instructor_id = ?`
		args = append(args, instructorID)
	}
	var exam Exam
	err := r.db.QueryRowContext(ctx, query, args...).Scan(&exam.ID, &exam.CourseID, &exam.CourseTitle, &exam.Title, &exam.Description,
		&exam.PassScore, &exam.DurationMinutes, &exam.Status, &exam.QuestionCount)
	if err != nil {
		return Exam{}, err
	}
	return exam, nil
}

func (r *Repository) createExam(ctx context.Context, examID, courseID string, input ExamInput) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO exams (id, course_id, title, description, pass_score, duration_minutes, status)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		examID, courseID, input.Title, input.Description, input.PassScore, input.DurationMinutes, input.Status)
	if err != nil {
		return fmt.Errorf("insert exam: %w", err)
	}
	return nil
}

func (r *Repository) updateExam(ctx context.Context, examID string, input UpdateExamInput) error {
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
	if input.PassScore != nil {
		assignments = append(assignments, "pass_score = ?")
		args = append(args, *input.PassScore)
	}
	if input.DurationMinutes != nil {
		assignments = append(assignments, "duration_minutes = ?")
		args = append(args, *input.DurationMinutes)
	}
	if input.Status != nil {
		assignments = append(assignments, "status = ?")
		args = append(args, *input.Status)
	}
	if len(assignments) == 0 {
		return nil
	}
	args = append(args, examID)
	result, err := r.db.ExecContext(ctx, "UPDATE exams SET "+strings.Join(assignments, ", ")+" WHERE id = ?", args...)
	if err != nil {
		return fmt.Errorf("update exam: %w", err)
	}
	if affected, _ := result.RowsAffected(); affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *Repository) deleteExam(ctx context.Context, examID string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM exams WHERE id = ?`, examID)
	if err != nil {
		return fmt.Errorf("delete exam: %w", err)
	}
	if affected, _ := result.RowsAffected(); affected == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *Repository) examQuestions(ctx context.Context, examID string) ([]Question, error) {
	rows, err := r.db.QueryContext(ctx, fmt.Sprintf(
		`SELECT %s FROM exam_questions WHERE exam_id = ? ORDER BY question_order`, questionColumns), examID)
	if err != nil {
		return nil, fmt.Errorf("list exam questions: %w", err)
	}
	defer rows.Close()
	questions := make([]Question, 0)
	for rows.Next() {
		question, err := scanQuestion(rows)
		if err != nil {
			return nil, fmt.Errorf("scan exam question: %w", err)
		}
		questions = append(questions, question)
	}
	return questions, rows.Err()
}

func (r *Repository) addExamQuestion(ctx context.Context, examID string, input QuestionInput, order int) (string, error) {
	id := platform.NewIDOrPanic()
	optionsJSON, err := json.Marshal(input.Options)
	if err != nil {
		return "", err
	}
	if _, err := r.db.ExecContext(ctx, `
		INSERT INTO exam_questions (id, exam_id, question_order, question, options, correct_index, explanation)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		id, examID, order, input.Question, string(optionsJSON), input.CorrectIndex, input.Explanation); err != nil {
		return "", fmt.Errorf("insert exam question: %w", err)
	}
	return id, nil
}

func (r *Repository) nextQuestionOrder(ctx context.Context, table, ownerColumn, ownerID string) (int, error) {
	var current int
	err := r.db.QueryRowContext(ctx, fmt.Sprintf(
		`SELECT COALESCE(MAX(question_order), 0) FROM %s WHERE %s = ?`, table, ownerColumn), ownerID).Scan(&current)
	return current + 1, err
}

func (r *Repository) questionOwner(ctx context.Context, table, idColumn, questionID string) (string, error) {
	var ownerID string
	err := r.db.QueryRowContext(ctx, fmt.Sprintf(`SELECT %s FROM %s WHERE id = ?`, idColumn, table), questionID).Scan(&ownerID)
	if errors.Is(err, sql.ErrNoRows) {
		return "", ErrNotFound
	}
	if err != nil {
		return "", err
	}
	return ownerID, nil
}

/* --------------------------------- service --------------------------------- */

func normalizeQuestion(input QuestionInput) (QuestionInput, error) {
	question := platform.SanitizeLine(input.Question)
	if utf8.RuneCountInString(question) < 5 || utf8.RuneCountInString(question) > 500 {
		return QuestionInput{}, ErrQuestionFormat
	}
	options := make([]string, 0, len(input.Options))
	for _, option := range input.Options {
		cleaned := platform.SanitizeLine(option)
		if cleaned == "" {
			continue
		}
		options = append(options, cleaned)
	}
	if len(options) < 2 || len(options) > 4 {
		return QuestionInput{}, ErrQuestionFormat
	}
	if input.CorrectIndex < 0 || input.CorrectIndex >= len(options) {
		return QuestionInput{}, ErrQuestionFormat
	}
	return QuestionInput{
		Question:     question,
		Options:      options,
		CorrectIndex: input.CorrectIndex,
		Explanation:  trimTo(platform.SanitizeLine(input.Explanation), 500),
	}, nil
}

func (s *Service) SetSkills(ctx context.Context, actor auth.User, courseID string, skills []CourseSkill) ([]CourseSkill, error) {
	if _, err := s.authorizeCourse(ctx, actor, courseID); err != nil {
		return nil, err
	}
	cleaned := make([]CourseSkill, 0, len(skills))
	seen := make(map[string]bool)
	for _, skill := range skills {
		name := strings.ToLower(strings.TrimSpace(skill.Skill))
		if !validSkills[name] || seen[name] {
			return nil, ErrInvalidSkill
		}
		seen[name] = true
		cleaned = append(cleaned, CourseSkill{Skill: name, Note: trimTo(platform.SanitizeLine(skill.Note), 300)})
	}
	if err := s.repo.replaceSkills(ctx, courseID, cleaned); err != nil {
		return nil, err
	}
	return cleaned, nil
}

func (s *Service) LessonQuestions(ctx context.Context, actor auth.User, lessonID string) ([]Question, error) {
	if _, err := s.authorizeLesson(ctx, actor, lessonID); err != nil {
		return nil, err
	}
	return s.repo.lessonQuestions(ctx, lessonID)
}

func (s *Service) authorizeLesson(ctx context.Context, actor auth.User, lessonID string) (Lesson, error) {
	lesson, err := s.repo.FindLesson(ctx, lessonID, actor.ID, actor.HasRole(auth.RoleAdmin))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Lesson{}, ErrNotFound
		}
		return Lesson{}, err
	}
	return lesson, nil
}

func (s *Service) AddLessonQuestion(ctx context.Context, actor auth.User, lessonID string, input QuestionInput) (Question, error) {
	if _, err := s.authorizeLesson(ctx, actor, lessonID); err != nil {
		return Question{}, err
	}
	normalized, err := normalizeQuestion(input)
	if err != nil {
		return Question{}, err
	}
	order, err := s.repo.nextQuestionOrder(ctx, "quiz_questions", "lesson_id", lessonID)
	if err != nil {
		return Question{}, err
	}
	if _, err := s.repo.addLessonQuestion(ctx, lessonID, normalized, order); err != nil {
		return Question{}, err
	}
	questions, err := s.repo.lessonQuestions(ctx, lessonID)
	if err != nil {
		return Question{}, err
	}
	return questions[len(questions)-1], nil
}

func (s *Service) DeleteLessonQuestion(ctx context.Context, actor auth.User, questionID string) error {
	lessonID, err := s.repo.questionOwner(ctx, "quiz_questions", "lesson_id", questionID)
	if err != nil {
		return err
	}
	if _, err := s.authorizeLesson(ctx, actor, lessonID); err != nil {
		return err
	}
	return s.repo.deleteQuestion(ctx, "quiz_questions", questionID)
}

func (s *Service) Exams(ctx context.Context, actor auth.User, courseID string) ([]Exam, error) {
	if _, err := s.authorizeCourse(ctx, actor, courseID); err != nil {
		return nil, err
	}
	return s.repo.listExams(ctx, courseID)
}

func (s *Service) ExamQuestions(ctx context.Context, actor auth.User, examID string) ([]Question, error) {
	if _, err := s.authorizeExam(ctx, actor, examID); err != nil {
		return nil, err
	}
	return s.repo.examQuestions(ctx, examID)
}

func (s *Service) authorizeExam(ctx context.Context, actor auth.User, examID string) (Exam, error) {
	exam, err := s.repo.findExam(ctx, examID, actor.ID, actor.HasRole(auth.RoleAdmin))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Exam{}, ErrNotFound
		}
		return Exam{}, err
	}
	return exam, nil
}

func (s *Service) CreateExam(ctx context.Context, actor auth.User, courseID string, input ExamInput) (Exam, error) {
	if _, err := s.authorizeCourse(ctx, actor, courseID); err != nil {
		return Exam{}, err
	}
	normalized, err := normalizeExamInput(input)
	if err != nil {
		return Exam{}, err
	}
	examID := platform.NewIDOrPanic()
	if err := s.repo.createExam(ctx, examID, courseID, normalized); err != nil {
		return Exam{}, err
	}
	return s.repo.findExam(ctx, examID, actor.ID, true)
}

func (s *Service) UpdateExam(ctx context.Context, actor auth.User, examID string, input UpdateExamInput) (Exam, error) {
	if _, err := s.authorizeExam(ctx, actor, examID); err != nil {
		return Exam{}, err
	}
	if input.Title != nil {
		title := platform.SanitizeLine(*input.Title)
		if utf8.RuneCountInString(title) < 3 || utf8.RuneCountInString(title) > 180 {
			return Exam{}, fmt.Errorf("%w: title must be 3-180 characters", ErrValidation)
		}
		input.Title = &title
	}
	if input.Status != nil {
		status := strings.ToLower(strings.TrimSpace(*input.Status))
		if status != "draft" && status != "published" {
			return Exam{}, fmt.Errorf("%w: status must be draft or published", ErrValidation)
		}
		input.Status = &status
	}
	if input.PassScore != nil && (*input.PassScore < 10 || *input.PassScore > 100) {
		return Exam{}, fmt.Errorf("%w: pass_score must be 10-100", ErrValidation)
	}
	if err := s.repo.updateExam(ctx, examID, input); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Exam{}, ErrNotFound
		}
		return Exam{}, err
	}
	return s.authorizeExam(ctx, actor, examID)
}

func (s *Service) DeleteExam(ctx context.Context, actor auth.User, examID string) error {
	if _, err := s.authorizeExam(ctx, actor, examID); err != nil {
		return err
	}
	return s.repo.deleteExam(ctx, examID)
}

func (s *Service) AddExamQuestion(ctx context.Context, actor auth.User, examID string, input QuestionInput) (Question, error) {
	if _, err := s.authorizeExam(ctx, actor, examID); err != nil {
		return Question{}, err
	}
	normalized, err := normalizeQuestion(input)
	if err != nil {
		return Question{}, err
	}
	order, err := s.repo.nextQuestionOrder(ctx, "exam_questions", "exam_id", examID)
	if err != nil {
		return Question{}, err
	}
	if _, err := s.repo.addExamQuestion(ctx, examID, normalized, order); err != nil {
		return Question{}, err
	}
	questions, err := s.repo.examQuestions(ctx, examID)
	if err != nil {
		return Question{}, err
	}
	return questions[len(questions)-1], nil
}

func (s *Service) DeleteExamQuestion(ctx context.Context, actor auth.User, questionID string) error {
	examID, err := s.repo.questionOwner(ctx, "exam_questions", "exam_id", questionID)
	if err != nil {
		return err
	}
	if _, err := s.authorizeExam(ctx, actor, examID); err != nil {
		return err
	}
	return s.repo.deleteQuestion(ctx, "exam_questions", questionID)
}

func normalizeExamInput(input ExamInput) (ExamInput, error) {
	title := platform.SanitizeLine(input.Title)
	if utf8.RuneCountInString(title) < 3 || utf8.RuneCountInString(title) > 180 {
		return ExamInput{}, fmt.Errorf("%w: title must be 3-180 characters", ErrValidation)
	}
	passScore := input.PassScore
	if passScore < 10 || passScore > 100 {
		passScore = 70
	}
	duration := input.DurationMinutes
	if duration <= 0 || duration > 180 {
		duration = 20
	}
	status := strings.ToLower(strings.TrimSpace(input.Status))
	if status != "draft" && status != "published" {
		status = "draft"
	}
	return ExamInput{
		Title:           title,
		Description:     trimTo(platform.SanitizeLine(input.Description), 500),
		PassScore:       passScore,
		DurationMinutes: duration,
		Status:          status,
	}, nil
}

/* --------------------------------- handler --------------------------------- */

func (h *Handler) writeQuestionError(w http.ResponseWriter, err error) {
	if errors.Is(err, ErrQuestionFormat) || errors.Is(err, ErrInvalidSkill) {
		transport.WriteError(w, http.StatusBadRequest, "VALIDATION_ERROR", strings.TrimPrefix(err.Error(), "instructor: "))
		return
	}
	h.writeError(w, err)
}

func (h *Handler) SetSkills(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	var input struct {
		Skills []CourseSkill `json:"skills"`
	}
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	skills, err := h.service.SetSkills(r.Context(), actor, r.PathValue("id"), input.Skills)
	if err != nil {
		h.writeQuestionError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, skills)
}

func (h *Handler) LessonQuestions(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	questions, err := h.service.LessonQuestions(r.Context(), actor, r.PathValue("id"))
	if err != nil {
		h.writeQuestionError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, questions)
}

func (h *Handler) AddLessonQuestion(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	var input QuestionInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	question, err := h.service.AddLessonQuestion(r.Context(), actor, r.PathValue("id"), input)
	if err != nil {
		h.writeQuestionError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusCreated, question)
}

func (h *Handler) DeleteLessonQuestion(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	if err := h.service.DeleteLessonQuestion(r.Context(), actor, r.PathValue("id")); err != nil {
		h.writeQuestionError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

func (h *Handler) Exams(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	exams, err := h.service.Exams(r.Context(), actor, r.PathValue("id"))
	if err != nil {
		h.writeQuestionError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, exams)
}

func (h *Handler) CreateExam(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	var input ExamInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	exam, err := h.service.CreateExam(r.Context(), actor, r.PathValue("id"), input)
	if err != nil {
		h.writeQuestionError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusCreated, exam)
}

func (h *Handler) UpdateExam(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	var input UpdateExamInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	exam, err := h.service.UpdateExam(r.Context(), actor, r.PathValue("id"), input)
	if err != nil {
		h.writeQuestionError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, exam)
}

func (h *Handler) DeleteExam(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	if err := h.service.DeleteExam(r.Context(), actor, r.PathValue("id")); err != nil {
		h.writeQuestionError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

func (h *Handler) ExamQuestions(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	questions, err := h.service.ExamQuestions(r.Context(), actor, r.PathValue("id"))
	if err != nil {
		h.writeQuestionError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, questions)
}

func (h *Handler) AddExamQuestion(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	var input QuestionInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	question, err := h.service.AddExamQuestion(r.Context(), actor, r.PathValue("id"), input)
	if err != nil {
		h.writeQuestionError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusCreated, question)
}

func (h *Handler) DeleteExamQuestion(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	if err := h.service.DeleteExamQuestion(r.Context(), actor, r.PathValue("id")); err != nil {
		h.writeQuestionError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}
