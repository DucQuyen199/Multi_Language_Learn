package vocabulary

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

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

func (h *Handler) userID(r *http.Request) string {
	if userID, ok := auth.UserID(r); ok {
		return userID
	}
	if value := strings.TrimSpace(r.URL.Query().Get("user_id")); value != "" {
		return value
	}
	return h.defaultUser
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	items, err := h.service.List(r.Context(), h.userID(r))
	if err != nil {
		transport.WriteError(w, http.StatusInternalServerError, "VOCABULARY_LIST_FAILED", "Unable to load your vocabulary")
		return
	}
	transport.WriteJSON(w, http.StatusOK, items)
}

func (h *Handler) Save(w http.ResponseWriter, r *http.Request) {
	var input SaveInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		transport.WriteError(w, http.StatusBadRequest, "INVALID_JSON", "Please send a valid JSON body")
		return
	}
	input.UserID = h.userID(r)
	if strings.TrimSpace(input.EntryID) == "" {
		transport.WriteError(w, http.StatusBadRequest, "VALIDATION_ERROR", "entry_id is required")
		return
	}
	item, err := h.service.Save(r.Context(), input)
	if err != nil {
		transport.WriteError(w, http.StatusInternalServerError, "VOCABULARY_SAVE_FAILED", "Unable to save that word")
		return
	}
	transport.WriteJSON(w, http.StatusCreated, item)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.service.Delete(r.Context(), h.userID(r), r.PathValue("entryID")); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			transport.WriteError(w, http.StatusNotFound, "VOCABULARY_NOT_FOUND", "That word is not in your vocabulary")
			return
		}
		transport.WriteError(w, http.StatusInternalServerError, "VOCABULARY_DELETE_FAILED", "Unable to remove that word")
		return
	}
	transport.WriteJSON(w, http.StatusOK, map[string]bool{"removed": true})
}
