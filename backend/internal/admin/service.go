package admin

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"unicode/utf8"

	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/auth"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/platform"
)

var (
	ErrNotFound       = errors.New("admin: record not found")
	ErrInvalidRole    = errors.New("admin: role must be student, instructor, or admin")
	ErrInvalidStatus  = errors.New("admin: status must be draft, published, or archived")
	ErrSelfTarget     = errors.New("admin: you cannot modify or delete your own account here")
	ErrLastAdmin      = errors.New("admin: the platform must keep at least one other administrator")
	ErrInvalidName    = errors.New("admin: first_name must be 1-100 characters")
)

type Service struct{ repo *Repository }

func NewService(repo *Repository) *Service { return &Service{repo: repo} }

func (s *Service) Overview(ctx context.Context) (Overview, error) {
	return s.repo.Overview(ctx)
}

func (s *Service) Users(ctx context.Context, role, search string, limit, offset int) (UserList, error) {
	role = strings.ToLower(strings.TrimSpace(role))
	if role != "" && !auth.IsValidRole(role) {
		return UserList{}, ErrInvalidRole
	}
	if limit <= 0 || limit > 100 {
		limit = 25
	}
	if offset < 0 {
		offset = 0
	}
	return s.repo.Users(ctx, role, strings.TrimSpace(search), limit, offset)
}

func (s *Service) UpdateUser(ctx context.Context, actorID string, targetID string, input UpdateUserInput) (Account, error) {
	if actorID == targetID {
		return Account{}, ErrSelfTarget
	}
	role := ""
	if input.Role != nil {
		role = auth.NormalizeRole(*input.Role)
		if !auth.IsValidRole(role) {
			return Account{}, ErrInvalidRole
		}
	}
	firstName := ""
	if input.FirstName != nil {
		firstName = platform.SanitizeLine(*input.FirstName)
		if firstName == "" || utf8.RuneCountInString(firstName) > 100 {
			return Account{}, ErrInvalidName
		}
	}
	if role == "" && firstName == "" {
		return Account{}, errors.New("admin: nothing to update")
	}
	if role == "student" || role == "admin" {
		// Demoting an instructor detaches their courses; require a valid target first.
		if _, err := s.repo.FindUser(ctx, targetID); err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return Account{}, ErrNotFound
			}
			return Account{}, err
		}
	}
	if err := s.repo.UpdateUser(ctx, targetID, role, firstName); err != nil {
		return Account{}, fmt.Errorf("update user: %w", err)
	}
	account, err := s.repo.FindUser(ctx, targetID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Account{}, ErrNotFound
		}
		return Account{}, err
	}
	return account, nil
}

func (s *Service) DeleteUser(ctx context.Context, actorID, targetID string) error {
	if actorID == targetID {
		return ErrSelfTarget
	}
	target, err := s.repo.FindUser(ctx, targetID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}
	if target.Role == auth.RoleAdmin {
		remaining, err := s.repo.CountAdminsBesides(ctx, targetID)
		if err != nil {
			return err
		}
		if remaining == 0 {
			return ErrLastAdmin
		}
	}
	return s.repo.SoftDeleteUser(ctx, targetID)
}

func (s *Service) Courses(ctx context.Context) ([]CourseRow, error) {
	return s.repo.Courses(ctx)
}

func (s *Service) UpdateCourseStatus(ctx context.Context, courseID string, status string) error {
	if !validCourseStatus(status) {
		return ErrInvalidStatus
	}
	if err := s.repo.UpdateCourseStatus(ctx, courseID, normalizeCourseStatus(status)); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}
	return nil
}

// ReviewCourse is the moderation gate: approve publishes a pending course and
// clears the note; reject sends it back to draft with the reviewer's note so
// the instructor knows what to fix.
func (s *Service) ReviewCourse(ctx context.Context, courseID string, input ReviewInput) (CourseRow, error) {
	action := strings.ToLower(strings.TrimSpace(input.Action))
	note := platform.SanitizeLine(input.Note)
	if utf8.RuneCountInString(note) > 500 {
		return CourseRow{}, fmt.Errorf("%w: note must be 500 characters or fewer", ErrInvalidName)
	}
	if action != "approve" && action != "reject" {
		return CourseRow{}, errors.New("admin: action must be approve or reject")
	}
	current, err := s.repo.FindCourseStatus(ctx, courseID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return CourseRow{}, ErrNotFound
		}
		return CourseRow{}, err
	}
	if current != "pending" {
		return CourseRow{}, errors.New("admin: only pending courses can be reviewed")
	}
	status := "published"
	if action == "reject" {
		status = "draft"
		if note == "" {
			return CourseRow{}, errors.New("admin: a rejection needs a note for the instructor")
		}
	} else {
		note = ""
	}
	if err := s.repo.ReviewCourse(ctx, courseID, status, note); err != nil {
		return CourseRow{}, err
	}
	courses, err := s.repo.Courses(ctx)
	if err != nil {
		return CourseRow{}, err
	}
	for _, course := range courses {
		if course.ID == courseID {
			return course, nil
		}
	}
	return CourseRow{}, ErrNotFound
}

func (s *Service) Languages(ctx context.Context) ([]LanguageRow, error) {
	return s.repo.Languages(ctx)
}

func (s *Service) UpdateLanguageActive(ctx context.Context, languageID string, active bool) error {
	if err := s.repo.UpdateLanguageActive(ctx, languageID, active); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}
	return nil
}
