package dictionary

import (
	"net/http"
	"strings"

	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/transport"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Search(w http.ResponseWriter, r *http.Request) {
	language := r.URL.Query().Get("language")
	items, err := h.service.Search(r.Context(), language, r.URL.Query().Get("q"))
	if err != nil {
		transport.WriteError(w, http.StatusInternalServerError, "DICTIONARY_SEARCH_FAILED", "Unable to search the dictionary")
		return
	}
	transport.WriteJSON(w, http.StatusOK, items)
}

func (h *Handler) Detail(w http.ResponseWriter, r *http.Request) {
	language := r.PathValue("language")
	slug := strings.TrimSpace(r.PathValue("slug"))
	entry, err := h.service.Find(r.Context(), language, slug)
	if err == ErrNotFound {
		transport.WriteError(w, http.StatusNotFound, "ENTRY_NOT_FOUND", "We could not find that word")
		return
	}
	if err != nil {
		transport.WriteError(w, http.StatusInternalServerError, "DICTIONARY_ENTRY_FAILED", "Unable to load that word")
		return
	}
	transport.WriteJSON(w, http.StatusOK, entry)
}
