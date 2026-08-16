package learning

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/platform"
)

var (
	ErrNotFound     = errors.New("learning: record not found")
	ErrNotPublished = errors.New("learning: this course is not open for enrollment")
	ErrInvalidScore = errors.New("learning: score must be between 0 and 100")
)

type Service struct {
	repo  *Repository
	cache *platform.Cache
}

func NewService(repo *Repository, cache *platform.Cache) *Service {
	return &Service{repo: repo, cache: cache}
}

type enrollmentState struct {
	enrolled  bool
	completed int
}

func (s *Service) decorate(ctx context.Context, userID string, courses []CourseCard) error {
	if userID == "" || len(courses) == 0 {
		return nil
	}
	ids := make([]string, 0, len(courses))
	for _, course := range courses {
		ids = append(ids, course.ID)
	}
	states, err := s.repo.enrollmentStates(ctx, userID, ids)
	if err != nil {
		return err
	}
	for index := range courses {
		state, ok := states[courses[index].ID]
		if !ok {
			continue
		}
		courses[index].IsEnrolled = state.enrolled
		courses[index].CompletedLessons = state.completed
		if courses[index].LessonCount > 0 {
			courses[index].Progress = float64(state.completed) / float64(courses[index].LessonCount)
		}
	}
	return nil
}

func (s *Service) Courses(ctx context.Context, language, userID string) ([]CourseCard, error) {
	courses, err := s.repo.PublishedCourses(ctx, language)
	if err != nil {
		return nil, err
	}
	if err := s.decorate(ctx, userID, courses); err != nil {
		return nil, err
	}
	return courses, nil
}

func (s *Service) MyCourses(ctx context.Context, userID string) ([]CourseCard, error) {
	courses, err := s.repo.EnrolledCourses(ctx, userID)
	if err != nil {
		return nil, err
	}
	if err := s.decorate(ctx, userID, courses); err != nil {
		return nil, err
	}
	return courses, nil
}

func (s *Service) CourseDetail(ctx context.Context, slug, userID string) (CourseDetail, error) {
	course, err := s.repo.CourseBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return CourseDetail{}, ErrNotFound
		}
		return CourseDetail{}, err
	}
	course.Skills = s.repo.courseSkills(ctx, course.ID)
	if examID, examTitle, passScore, err := s.repo.publishedExamSummary(ctx, course.ID); err == nil {
		course.ExamID = examID
		course.ExamTitle = examTitle
		course.ExamPassScore = passScore
	}
	includeDrafts := false
	detail := CourseDetail{Course: course, Lessons: []LessonSummary{}}
	if course.Status == "published" || userID != "" {
		lessons, err := s.repo.LessonSummaries(ctx, course.ID, userID, includeDrafts)
		if err != nil {
			return CourseDetail{}, err
		}
		detail.Lessons = lessons
		for _, lesson := range lessons {
			if !lesson.Completed {
				lessonCopy := lesson
				detail.NextLesson = &lessonCopy
				break
			}
		}
		if userID != "" {
			state, err := s.repo.enrollmentStates(ctx, userID, []string{course.ID})
			if err != nil {
				return CourseDetail{}, err
			}
			if state, ok := state[course.ID]; ok {
				detail.Course.IsEnrolled = state.enrolled
				detail.Course.CompletedLessons = state.completed
				if course.LessonCount > 0 {
					detail.Course.Progress = float64(state.completed) / float64(course.LessonCount)
				}
			}
		}
	}
	return detail, nil
}

func (s *Service) resolveCourse(ctx context.Context, idOrSlug string) (CourseCard, error) {
	course, err := s.repo.CourseBySlug(ctx, idOrSlug)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return CourseCard{}, ErrNotFound
		}
		return CourseCard{}, err
	}
	return course, nil
}

func (s *Service) Enroll(ctx context.Context, userID, courseID string) (CourseCard, error) {
	course, err := s.resolveCourse(ctx, courseID)
	if err != nil {
		return CourseCard{}, err
	}
	if course.Status != "published" {
		return CourseCard{}, ErrNotPublished
	}
	if err := s.repo.Enroll(ctx, userID, course.ID); err != nil {
		return CourseCard{}, err
	}
	course.IsEnrolled = true
	return course, nil
}

func (s *Service) Unenroll(ctx context.Context, userID, courseID string) error {
	course, err := s.resolveCourse(ctx, courseID)
	if err != nil {
		return err
	}
	return s.repo.Unenroll(ctx, userID, course.ID)
}

func (s *Service) Lesson(ctx context.Context, lessonID, userID string) (LessonDetail, error) {
	lesson, err := s.repo.LessonByID(ctx, lessonID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return LessonDetail{}, ErrNotFound
		}
		return LessonDetail{}, err
	}
	if userID != "" {
		score, err := s.repo.LessonCompletion(ctx, userID, lessonID)
		if err != nil {
			return LessonDetail{}, err
		}
		lesson.Score = score
		lesson.Completed = score != nil
	}
	if questions, err := s.repo.loadQuestions(ctx, "quiz_questions", "lesson_id", lessonID); err == nil {
		lesson.Questions = toLearnerQuestions(questions)
	}
	return lesson, nil
}

func (s *Service) Complete(ctx context.Context, userID, lessonID string, input CompleteInput) (LessonDetail, error) {
	if input.Score != nil && (*input.Score < 0 || *input.Score > 100) {
		return LessonDetail{}, ErrInvalidScore
	}
	lesson, err := s.repo.LessonByID(ctx, lessonID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return LessonDetail{}, ErrNotFound
		}
		return LessonDetail{}, err
	}
	xp := 10
	minutes := lesson.DurationMinutes
	if minutes <= 0 {
		minutes = 10
	}
	if err := s.repo.RecordCompletion(ctx, userID, lessonID, input.Score, minutes, xp); err != nil {
		return LessonDetail{}, err
	}
	if s.cache != nil {
		_ = s.cache.Delete(ctx, fmt.Sprintf("dashboard:v2:%s:en", userID))
	}
	lesson.Completed = true
	lesson.Score = input.Score
	return lesson, nil
}
