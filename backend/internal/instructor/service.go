package instructor

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"unicode/utf8"

	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/auth"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/platform"
)

var (
	ErrNotFound    = errors.New("instructor: record not found")
	ErrValidation  = errors.New("instructor: invalid input")
	ErrNeedsReview = errors.New("instructor: only an administrator can publish a course — submit it for review instead")
)

var validCEFR = map[string]bool{"A1": true, "A2": true, "B1": true, "B2": true, "C1": true, "C2": true}

type Service struct{ repo *Repository }

func NewService(repo *Repository) *Service { return &Service{repo: repo} }

func (s *Service) Courses(ctx context.Context, actor auth.User) ([]Course, error) {
	return s.repo.Courses(ctx, actor.ID, actor.HasRole(auth.RoleAdmin))
}

func (s *Service) Overview(ctx context.Context, actor auth.User) (Overview, error) {
	courses, err := s.repo.Courses(ctx, actor.ID, actor.HasRole(auth.RoleAdmin))
	if err != nil {
		return Overview{}, err
	}
	students, err := s.repo.Students(ctx, actor.ID, actor.HasRole(auth.RoleAdmin), 6)
	if err != nil {
		return Overview{}, err
	}
	overview := Overview{TopCourses: make([]Course, 0), RecentStudents: students}
	progressSum, progressCount := 0.0, 0
	for _, course := range courses {
		overview.CourseCount++
		if course.Status == "published" {
			overview.PublishedCount++
		}
		overview.LessonCount += course.LessonCount
		overview.TotalCompletions += course.CompletionCount
		if course.EnrollmentCount > 0 {
			progressSum += course.AvgProgress
			progressCount++
		}
	}
	if len(courses) > 0 {
		sorted := make([]Course, len(courses))
		copy(sorted, courses)
		for i := 1; i < len(sorted); i++ {
			for j := i; j > 0 && sorted[j].EnrollmentCount > sorted[j-1].EnrollmentCount; j-- {
				sorted[j], sorted[j-1] = sorted[j-1], sorted[j]
			}
		}
		if len(sorted) > 3 {
			sorted = sorted[:3]
		}
		overview.TopCourses = sorted
	}
	if progressCount > 0 {
		overview.AvgProgress = progressSum / float64(progressCount)
	}
	seen := make(map[string]bool)
	for _, student := range students {
		if !seen[student.ID] {
			seen[student.ID] = true
			overview.StudentCount++
		}
	}
	return overview, nil
}

func (s *Service) CreateCourse(ctx context.Context, actor auth.User, input CreateCourseInput) (Course, error) {
	title := platform.SanitizeLine(input.Title)
	if utf8.RuneCountInString(title) < 3 || utf8.RuneCountInString(title) > 160 {
		return Course{}, fmt.Errorf("%w: title must be 3-160 characters", ErrValidation)
	}
	description := platform.SanitizeText(input.Description)
	if description == "" || utf8.RuneCountInString(description) > 1000 {
		return Course{}, fmt.Errorf("%w: description must be 1-1000 characters", ErrValidation)
	}
	cefr := strings.ToUpper(strings.TrimSpace(input.CEFR))
	if !validCEFR[cefr] {
		return Course{}, fmt.Errorf("%w: cefr must be one of A1-C2", ErrValidation)
	}
	languageID, err := s.repo.LanguageIDByCode(ctx, input.LanguageCode)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Course{}, fmt.Errorf("%w: unknown or inactive language_code", ErrValidation)
		}
		return Course{}, err
	}

	courseID, err := platform.NewID()
	if err != nil {
		return Course{}, err
	}
	slug := platform.Slugify(title)
	if slug == "" {
		return Course{}, fmt.Errorf("%w: title must include letters or numbers", ErrValidation)
	}
	for suffix := 2; ; suffix++ {
		exists, err := s.repo.SlugExists(ctx, languageID, slug)
		if err != nil {
			return Course{}, err
		}
		if !exists {
			break
		}
		slug = fmt.Sprintf("%s-%d", platform.Slugify(title), suffix)
	}

	if err := s.repo.CreateCourse(ctx, courseID, actor.ID, languageID, slug, title, description, cefr); err != nil {
		return Course{}, err
	}
	return s.repo.FindCourse(ctx, courseID, actor.ID, true)
}

func (s *Service) UpdateCourse(ctx context.Context, actor auth.User, courseID string, input UpdateCourseInput) (Course, error) {
	if _, err := s.authorizeCourse(ctx, actor, courseID); err != nil {
		return Course{}, err
	}
	if input.Title != nil {
		title := platform.SanitizeLine(*input.Title)
		if utf8.RuneCountInString(title) < 3 || utf8.RuneCountInString(title) > 160 {
			return Course{}, fmt.Errorf("%w: title must be 3-160 characters", ErrValidation)
		}
		input.Title = &title
	}
	if input.Description != nil {
		description := platform.SanitizeText(*input.Description)
		if description == "" || utf8.RuneCountInString(description) > 1000 {
			return Course{}, fmt.Errorf("%w: description must be 1-1000 characters", ErrValidation)
		}
		input.Description = &description
	}
	if input.CEFR != nil {
		cefr := strings.ToUpper(strings.TrimSpace(*input.CEFR))
		if !validCEFR[cefr] {
			return Course{}, fmt.Errorf("%w: cefr must be one of A1-C2", ErrValidation)
		}
		input.CEFR = &cefr
	}
	if input.CoverImageURL != nil {
		cover := strings.TrimSpace(*input.CoverImageURL)
		if cover != "" {
			parsed, err := url.Parse(cover)
			if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
				return Course{}, fmt.Errorf("%w: cover_image_url must be a valid http(s) URL", ErrValidation)
			}
		}
		input.CoverImageURL = &cover
	}
	if input.Status != nil {
		status := strings.ToLower(strings.TrimSpace(*input.Status))
		if err := s.authorizeStatusChange(actor, status); err != nil {
			return Course{}, err
		}
		input.Status = &status
	}
	if err := s.repo.UpdateCourse(ctx, courseID, input); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Course{}, ErrNotFound
		}
		return Course{}, err
	}
	return s.authorizeCourse(ctx, actor, courseID)
}

// authorizeStatusChange enforces the review workflow: instructors may only
// submit for review (pending) or withdraw to draft; publishing and archiving
// stay with the admin, who reviews courses in the admin console.
func (s *Service) authorizeStatusChange(actor auth.User, status string) error {
	if actor.HasRole(auth.RoleAdmin) {
		switch status {
		case "draft", "pending", "published", "archived":
			return nil
		}
		return fmt.Errorf("%w: status must be draft, pending, published, or archived", ErrValidation)
	}
	switch status {
	case "draft", "pending":
		return nil
	}
	return ErrNeedsReview
}

func (s *Service) authorizeCourse(ctx context.Context, actor auth.User, courseID string) (Course, error) {
	course, err := s.repo.FindCourse(ctx, courseID, actor.ID, actor.HasRole(auth.RoleAdmin))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Course{}, ErrNotFound
		}
		return Course{}, err
	}
	if course.ID == "" {
		return Course{}, ErrNotFound
	}
	return course, nil
}

func (s *Service) Lessons(ctx context.Context, actor auth.User, courseID string) ([]Lesson, error) {
	if _, err := s.authorizeCourse(ctx, actor, courseID); err != nil {
		return nil, err
	}
	return s.repo.Lessons(ctx, courseID)
}

func (s *Service) CreateLesson(ctx context.Context, actor auth.User, courseID string, input LessonInput) (Lesson, error) {
	if _, err := s.authorizeCourse(ctx, actor, courseID); err != nil {
		return Lesson{}, err
	}
	normalized, err := normalizeLessonInput(input, 0)
	if err != nil {
		return Lesson{}, err
	}
	order := normalized.LessonOrder
	if order == 0 {
		order, err = s.repo.NextLessonOrder(ctx, courseID)
		if err != nil {
			return Lesson{}, err
		}
	}
	lessonID, err := platform.NewID()
	if err != nil {
		return Lesson{}, err
	}
	slug, err := s.uniqueLessonSlug(ctx, courseID, normalized.Title, "")
	if err != nil {
		return Lesson{}, err
	}
	if err := s.repo.CreateLesson(ctx, lessonID, courseID, slug, normalized, order); err != nil {
		return Lesson{}, err
	}
	if err := s.repo.SyncCourseLessonCount(ctx, courseID); err != nil {
		return Lesson{}, err
	}
	return s.repo.FindLesson(ctx, lessonID, actor.ID, true)
}

func (s *Service) UpdateLesson(ctx context.Context, actor auth.User, lessonID string, input LessonInput) (Lesson, error) {
	existing, err := s.repo.FindLesson(ctx, lessonID, actor.ID, actor.HasRole(auth.RoleAdmin))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Lesson{}, ErrNotFound
		}
		return Lesson{}, err
	}
	normalized, err := normalizeLessonInput(input, existing.LessonOrder)
	if err != nil {
		return Lesson{}, err
	}
	if normalized.LessonOrder == 0 {
		normalized.LessonOrder = existing.LessonOrder
	}
	if err := s.repo.UpdateLesson(ctx, lessonID, normalized); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Lesson{}, ErrNotFound
		}
		return Lesson{}, err
	}
	if err := s.repo.SyncCourseLessonCount(ctx, existing.CourseID); err != nil {
		return Lesson{}, err
	}
	return s.repo.FindLesson(ctx, lessonID, actor.ID, true)
}

func (s *Service) DeleteLesson(ctx context.Context, actor auth.User, lessonID string) error {
	existing, err := s.repo.FindLesson(ctx, lessonID, actor.ID, actor.HasRole(auth.RoleAdmin))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		return err
	}
	if err := s.repo.DeleteLesson(ctx, lessonID); err != nil {
		return err
	}
	return s.repo.SyncCourseLessonCount(ctx, existing.CourseID)
}

func (s *Service) Students(ctx context.Context, actor auth.User) ([]Student, error) {
	return s.repo.Students(ctx, actor.ID, actor.HasRole(auth.RoleAdmin), 0)
}

func normalizeLessonInput(input LessonInput, currentOrder int) (LessonInput, error) {
	title := platform.SanitizeLine(input.Title)
	if utf8.RuneCountInString(title) < 3 || utf8.RuneCountInString(title) > 160 {
		return LessonInput{}, fmt.Errorf("%w: title must be 3-160 characters", ErrValidation)
	}
	content := platform.SanitizeText(input.Content)
	if utf8.RuneCountInString(content) < 10 {
		return LessonInput{}, fmt.Errorf("%w: content must be at least 10 characters", ErrValidation)
	}
	status := strings.ToLower(strings.TrimSpace(input.Status))
	if status == "" {
		status = "draft"
	}
	if status != "draft" && status != "published" {
		return LessonInput{}, fmt.Errorf("%w: status must be draft or published", ErrValidation)
	}
	if input.VideoURL != nil && strings.TrimSpace(*input.VideoURL) != "" {
		videoURL := strings.TrimSpace(*input.VideoURL)
		parsed, err := url.Parse(videoURL)
		// Only http(s) links are stored: schemes like javascript: would turn the
		// lesson player into an XSS vector once rendered as a link.
		if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
			return LessonInput{}, fmt.Errorf("%w: video_url must be a valid http(s) URL", ErrValidation)
		}
		input.VideoURL = &videoURL
	}
	if input.ImageURL != nil && strings.TrimSpace(*input.ImageURL) != "" {
		imageURL := strings.TrimSpace(*input.ImageURL)
		parsed, err := url.Parse(imageURL)
		if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
			return LessonInput{}, fmt.Errorf("%w: image_url must be a valid http(s) URL", ErrValidation)
		}
		input.ImageURL = &imageURL
	}
	skill := strings.ToLower(strings.TrimSpace(input.Skill))
	if skill != "" && !validSkills[skill] {
		return LessonInput{}, ErrInvalidSkill
	}
	duration := input.DurationMinutes
	if duration <= 0 {
		duration = 10
	}
	if duration > 180 {
		duration = 180
	}
	order := input.LessonOrder
	if order < 0 || order > 999 {
		order = currentOrder
	}
	return LessonInput{
		Title:           title,
		Summary:         trimTo(platform.SanitizeLine(input.Summary), 500),
		Content:         content,
		VideoURL:        input.VideoURL,
		ImageURL:        input.ImageURL,
		Skill:           skill,
		DurationMinutes: duration,
		LessonOrder:     order,
		Status:          status,
	}, nil
}

func (s *Service) uniqueLessonSlug(ctx context.Context, courseID, title, excludeLessonID string) (string, error) {
	base := platform.Slugify(title)
	if base == "" {
		return "", fmt.Errorf("%w: title must include letters or numbers", ErrValidation)
	}
	slug := base
	for suffix := 2; ; suffix++ {
		exists, err := s.repo.LessonSlugExists(ctx, courseID, slug, excludeLessonID)
		if err != nil {
			return "", err
		}
		if !exists {
			return slug, nil
		}
		slug = fmt.Sprintf("%s-%d", base, suffix)
	}
}

func trimTo(value string, limit int) string {
	if utf8.RuneCountInString(value) <= limit {
		return value
	}
	return string([]rune(value)[:limit])
}
