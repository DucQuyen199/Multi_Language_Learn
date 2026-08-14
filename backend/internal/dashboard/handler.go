package dashboard

import (
	"net/http"
	"strings"

	"github.com/quyen/multi-language/backend/internal/transport"
)

type Handler struct {
	service     *Service
	defaultUser string
}

func NewHandler(service *Service, defaultUser string) *Handler {
	return &Handler{service: service, defaultUser: defaultUser}
}

func (h *Handler) Summary(w http.ResponseWriter, r *http.Request) {
	userID := strings.TrimSpace(r.URL.Query().Get("user_id"))
	if userID == "" {
		userID = h.defaultUser
	}
	language := strings.TrimSpace(r.URL.Query().Get("language"))
	if language == "" {
		language = "en"
	}
	summary, err := h.service.Summary(r.Context(), userID, language)
	if err != nil {
		transport.WriteError(w, http.StatusInternalServerError, "DASHBOARD_FAILED", "Unable to load your dashboard")
		return
	}
	transport.WriteJSON(w, http.StatusOK, summary)
}
