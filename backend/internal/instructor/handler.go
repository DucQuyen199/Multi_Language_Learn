package instructor

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/auth"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/transport"
)

type Handler struct{ service *Service }

func NewHandler(service *Service) *Handler { return &Handler{service: service} }

func (h *Handler) Overview(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	overview, err := h.service.Overview(r.Context(), actor)
	if err != nil {
		transport.WriteError(w, http.StatusInternalServerError, "INSTRUCTOR_OVERVIEW_FAILED", "Unable to load your studio metrics")
		return
	}
	transport.WriteJSON(w, http.StatusOK, overview)
}

func (h *Handler) Courses(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	courses, err := h.service.Courses(r.Context(), actor)
	if err != nil {
		transport.WriteError(w, http.StatusInternalServerError, "INSTRUCTOR_COURSES_FAILED", "Unable to load your courses")
		return
	}
	transport.WriteJSON(w, http.StatusOK, courses)
}

func (h *Handler) CreateCourse(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	var input CreateCourseInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	course, err := h.service.CreateCourse(r.Context(), actor, input)
	if err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusCreated, course)
}

func (h *Handler) UpdateCourse(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	var input UpdateCourseInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	course, err := h.service.UpdateCourse(r.Context(), actor, r.PathValue("id"), input)
	if err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, course)
}

func (h *Handler) Lessons(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	lessons, err := h.service.Lessons(r.Context(), actor, r.PathValue("id"))
	if err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, lessons)
}

func (h *Handler) CreateLesson(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	var input LessonInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	lesson, err := h.service.CreateLesson(r.Context(), actor, r.PathValue("id"), input)
	if err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusCreated, lesson)
}

func (h *Handler) UpdateLesson(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	var input LessonInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	lesson, err := h.service.UpdateLesson(r.Context(), actor, r.PathValue("id"), input)
	if err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, lesson)
}

func (h *Handler) DeleteLesson(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	if err := h.service.DeleteLesson(r.Context(), actor, r.PathValue("id")); err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

func (h *Handler) Students(w http.ResponseWriter, r *http.Request) {
	actor, _ := auth.UserFromContext(r.Context())
	students, err := h.service.Students(r.Context(), actor)
	if err != nil {
		transport.WriteError(w, http.StatusInternalServerError, "INSTRUCTOR_STUDENTS_FAILED", "Unable to load your students")
		return
	}
	transport.WriteJSON(w, http.StatusOK, students)
}

func (h *Handler) writeError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrNotFound):
		transport.WriteError(w, http.StatusNotFound, "NOT_FOUND", "That course or lesson does not exist")
	case errors.Is(err, ErrNeedsReview):
		transport.WriteError(w, http.StatusForbidden, "NEEDS_REVIEW", "Only an administrator can publish a course — submit it for review instead")
	case errors.Is(err, ErrValidation):
		transport.WriteError(w, http.StatusBadRequest, "VALIDATION_ERROR", strings.TrimPrefix(err.Error(), "instructor: "))
	default:
		transport.WriteError(w, http.StatusInternalServerError, "INSTRUCTOR_FAILED", "Unable to complete this studio action")
	}
}

func decodeJSON(w http.ResponseWriter, r *http.Request, target any) error {
	r.Body = http.MaxBytesReader(w, r.Body, 128<<10)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(target); err != nil {
		transport.WriteError(w, http.StatusBadRequest, "INVALID_JSON", "Please send a valid JSON body")
		return err
	}
	return nil
}
