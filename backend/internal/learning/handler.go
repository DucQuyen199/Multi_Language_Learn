package learning

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/auth"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/transport"
)

type Handler struct {
	service     *Service
	defaultUser string
}

func NewHandler(service *Service, defaultUser string) *Handler {
	return &Handler{service: service, defaultUser: defaultUser}
}

func (h *Handler) Courses(w http.ResponseWriter, r *http.Request) {
	userID := h.userID(r)
	courses, err := h.service.Courses(r.Context(), r.URL.Query().Get("language"), userID)
	if err != nil {
		transport.WriteError(w, http.StatusInternalServerError, "COURSES_FAILED", "Unable to load courses")
		return
	}
	transport.WriteJSON(w, http.StatusOK, courses)
}

func (h *Handler) CourseDetail(w http.ResponseWriter, r *http.Request) {
	userID := h.userID(r)
	detail, err := h.service.CourseDetail(r.Context(), r.PathValue("slug"), userID)
	if err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, detail)
}

func (h *Handler) MyCourses(w http.ResponseWriter, r *http.Request) {
	courses, err := h.service.MyCourses(r.Context(), h.userID(r))
	if err != nil {
		transport.WriteError(w, http.StatusInternalServerError, "ENROLLMENTS_FAILED", "Unable to load your courses")
		return
	}
	transport.WriteJSON(w, http.StatusOK, courses)
}

func (h *Handler) Enroll(w http.ResponseWriter, r *http.Request) {
	var input struct {
		CourseID string `json:"course_id"`
	}
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	if input.CourseID == "" {
		transport.WriteError(w, http.StatusBadRequest, "VALIDATION_ERROR", "course_id is required")
		return
	}
	course, err := h.service.Enroll(r.Context(), h.requiredUserID(r, w), input.CourseID)
	if err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusCreated, course)
}

func (h *Handler) Unenroll(w http.ResponseWriter, r *http.Request) {
	if err := h.service.Unenroll(r.Context(), h.requiredUserID(r, w), r.PathValue("id")); err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, map[string]bool{"unenrolled": true})
}

func (h *Handler) Lesson(w http.ResponseWriter, r *http.Request) {
	lesson, err := h.service.Lesson(r.Context(), r.PathValue("id"), h.userID(r))
	if err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, lesson)
}

func (h *Handler) CompleteLesson(w http.ResponseWriter, r *http.Request) {
	var input CompleteInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	lesson, err := h.service.Complete(r.Context(), h.requiredUserID(r, w), r.PathValue("id"), input)
	if err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, lesson)
}

func (h *Handler) userID(r *http.Request) string {
	if userID, ok := auth.UserID(r); ok {
		return userID
	}
	return ""
}

func (h *Handler) requiredUserID(r *http.Request, w http.ResponseWriter) string {
	if userID, ok := auth.UserID(r); ok && userID != "" {
		return userID
	}
	if h.defaultUser != "" {
		return h.defaultUser
	}
	transport.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Please sign in to continue")
	return ""
}

func (h *Handler) writeError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrNotFound):
		transport.WriteError(w, http.StatusNotFound, "NOT_FOUND", "That course or lesson does not exist")
	case errors.Is(err, ErrNotPublished):
		transport.WriteError(w, http.StatusConflict, "NOT_PUBLISHED", "This course is not open for enrollment yet")
	case errors.Is(err, ErrInvalidScore):
		transport.WriteError(w, http.StatusBadRequest, "VALIDATION_ERROR", "Score must be between 0 and 100")
	default:
		transport.WriteError(w, http.StatusInternalServerError, "LEARNING_FAILED", "Unable to complete this learning action")
	}
}

func decodeJSON(w http.ResponseWriter, r *http.Request, target any) error {
	r.Body = http.MaxBytesReader(w, r.Body, 8<<10)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(target); err != nil {
		transport.WriteError(w, http.StatusBadRequest, "INVALID_JSON", "Please send a valid JSON body")
		return err
	}
	return nil
}
