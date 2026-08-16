package admin

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/auth"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/transport"
)

type Handler struct{ service *Service }

func NewHandler(service *Service) *Handler { return &Handler{service: service} }

func (h *Handler) Overview(w http.ResponseWriter, r *http.Request) {
	overview, err := h.service.Overview(r.Context())
	if err != nil {
		transport.WriteError(w, http.StatusInternalServerError, "ADMIN_OVERVIEW_FAILED", "Unable to load platform metrics")
		return
	}
	transport.WriteJSON(w, http.StatusOK, overview)
}

func (h *Handler) Users(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	limit, _ := strconv.Atoi(query.Get("limit"))
	offset, _ := strconv.Atoi(query.Get("offset"))
	list, err := h.service.Users(r.Context(), query.Get("role"), query.Get("q"), limit, offset)
	if err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, list)
}

func (h *Handler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	actor, ok := auth.UserFromContext(r.Context())
	if !ok {
		transport.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Please sign in to continue")
		return
	}
	var input UpdateUserInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	account, err := h.service.UpdateUser(r.Context(), actor.ID, r.PathValue("id"), input)
	if err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, account)
}

func (h *Handler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	actor, ok := auth.UserFromContext(r.Context())
	if !ok {
		transport.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Please sign in to continue")
		return
	}
	if err := h.service.DeleteUser(r.Context(), actor.ID, r.PathValue("id")); err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, map[string]bool{"deleted": true})
}

func (h *Handler) Courses(w http.ResponseWriter, r *http.Request) {
	courses, err := h.service.Courses(r.Context())
	if err != nil {
		transport.WriteError(w, http.StatusInternalServerError, "ADMIN_COURSES_FAILED", "Unable to load courses")
		return
	}
	transport.WriteJSON(w, http.StatusOK, courses)
}

func (h *Handler) UpdateCourse(w http.ResponseWriter, r *http.Request) {
	var input UpdateCourseInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	if input.Status == nil {
		transport.WriteError(w, http.StatusBadRequest, "VALIDATION_ERROR", "status is required")
		return
	}
	if err := h.service.UpdateCourseStatus(r.Context(), r.PathValue("id"), *input.Status); err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, map[string]string{"id": r.PathValue("id"), "status": *input.Status})
}

func (h *Handler) ReviewCourse(w http.ResponseWriter, r *http.Request) {
	var input ReviewInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	course, err := h.service.ReviewCourse(r.Context(), r.PathValue("id"), input)
	if err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, course)
}

func (h *Handler) Languages(w http.ResponseWriter, r *http.Request) {
	languages, err := h.service.Languages(r.Context())
	if err != nil {
		transport.WriteError(w, http.StatusInternalServerError, "ADMIN_LANGUAGES_FAILED", "Unable to load languages")
		return
	}
	transport.WriteJSON(w, http.StatusOK, languages)
}

func (h *Handler) UpdateLanguage(w http.ResponseWriter, r *http.Request) {
	var input UpdateLanguageInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	if input.IsActive == nil {
		transport.WriteError(w, http.StatusBadRequest, "VALIDATION_ERROR", "is_active is required")
		return
	}
	if err := h.service.UpdateLanguageActive(r.Context(), r.PathValue("id"), *input.IsActive); err != nil {
		h.writeError(w, err)
		return
	}
	transport.WriteJSON(w, http.StatusOK, map[string]bool{"id_ok": true, "is_active": *input.IsActive})
}

func (h *Handler) writeError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrNotFound):
		transport.WriteError(w, http.StatusNotFound, "NOT_FOUND", "That record does not exist")
	case errors.Is(err, ErrInvalidRole):
		transport.WriteError(w, http.StatusBadRequest, "INVALID_ROLE", "Role must be student, instructor, or admin")
	case errors.Is(err, ErrInvalidStatus):
		transport.WriteError(w, http.StatusBadRequest, "INVALID_STATUS", "Status must be draft, published, or archived")
	case errors.Is(err, ErrSelfTarget):
		transport.WriteError(w, http.StatusConflict, "SELF_TARGET", "You cannot modify or delete your own account here")
	case errors.Is(err, ErrLastAdmin):
		transport.WriteError(w, http.StatusConflict, "LAST_ADMIN", "The platform must keep at least one other administrator")
	case errors.Is(err, ErrInvalidName), strings.Contains(err.Error(), "nothing to update"):
		transport.WriteError(w, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
	case strings.Contains(err.Error(), "admin:"):
		transport.WriteError(w, http.StatusBadRequest, "VALIDATION_ERROR", strings.TrimPrefix(err.Error(), "admin: "))
	default:
		transport.WriteError(w, http.StatusInternalServerError, "ADMIN_FAILED", "Unable to complete this administration action")
	}
}

func decodeJSON(w http.ResponseWriter, r *http.Request, target any) error {
	r.Body = http.MaxBytesReader(w, r.Body, 16<<10)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(target); err != nil {
		transport.WriteError(w, http.StatusBadRequest, "INVALID_JSON", "Please send a valid JSON body")
		return err
	}
	return nil
}
