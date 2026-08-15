package catalog

import (
	"net/http"
	"strings"

	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/transport"
)

type Handler struct { repo *Repository }

func NewHandler(repo *Repository) *Handler { return &Handler{repo: repo} }

func (h *Handler) Grammar(w http.ResponseWriter, r *http.Request) {
	language := strings.TrimSpace(r.URL.Query().Get("language")); if language == "" { language = "en" }
	items, err := h.repo.Grammar(r.Context(), language, strings.TrimSpace(r.URL.Query().Get("level")))
	if err != nil { transport.WriteError(w, http.StatusInternalServerError, "GRAMMAR_LIST_FAILED", "Unable to load grammar topics"); return }
	transport.WriteJSON(w, http.StatusOK, items)
}

func (h *Handler) Courses(w http.ResponseWriter, r *http.Request) {
	language := strings.TrimSpace(r.URL.Query().Get("language")); if language == "" { language = "en" }
	items, err := h.repo.Courses(r.Context(), language)
	if err != nil { transport.WriteError(w, http.StatusInternalServerError, "COURSE_LIST_FAILED", "Unable to load courses"); return }
	transport.WriteJSON(w, http.StatusOK, items)
}
