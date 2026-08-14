package httpapi

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/quyen/multi-language/backend/internal/config"
	"github.com/quyen/multi-language/backend/internal/catalog"
	"github.com/quyen/multi-language/backend/internal/dashboard"
	"github.com/quyen/multi-language/backend/internal/dictionary"
	"github.com/quyen/multi-language/backend/internal/platform"
	"github.com/quyen/multi-language/backend/internal/transport"
	"github.com/quyen/multi-language/backend/internal/vocabulary"
)

type Server struct {
	db          *sql.DB
	cache       *platform.Cache
	logger      *slog.Logger
	dictionary  *dictionary.Handler
	vocabulary  *vocabulary.Handler
	dashboard   *dashboard.Handler
	catalog     *catalog.Handler
	defaultUser string
	allowed     map[string]struct{}
}

func NewServer(cfg config.Config, db *sql.DB, cache *platform.Cache, logger *slog.Logger) *Server {
	dictionaryService := dictionary.NewService(dictionary.NewRepository(db), cache, time.Duration(cfg.DictionaryCacheTTL)*time.Second)
	vocabularyService := vocabulary.NewService(vocabulary.NewRepository(db), cache)
	dashboardService := dashboard.NewService(dashboard.NewRepository(db), cache, time.Duration(cfg.DashboardCacheTTL)*time.Second)
	catalogHandler := catalog.NewHandler(catalog.NewRepository(db))
	allowed := make(map[string]struct{}, len(cfg.AllowedOrigins))
	for _, origin := range cfg.AllowedOrigins {
		allowed[origin] = struct{}{}
	}
	return &Server{
		db: db, cache: cache, logger: logger, allowed: allowed,
		dictionary: dictionary.NewHandler(dictionaryService),
		vocabulary: vocabulary.NewHandler(vocabularyService, cfg.DefaultUserID),
		dashboard: dashboard.NewHandler(dashboardService, cfg.DefaultUserID),
		catalog: catalogHandler,
		defaultUser: cfg.DefaultUserID,
	}
}

func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", s.healthz)
	mux.HandleFunc("GET /readyz", s.readyz)
	mux.HandleFunc("GET /api/dictionary/search", s.dictionary.Search)
	mux.HandleFunc("GET /api/dictionary/{language}/{slug}", s.dictionary.Detail)
	mux.HandleFunc("GET /api/vocabulary", s.vocabulary.List)
	mux.HandleFunc("POST /api/vocabulary", s.vocabulary.Save)
	mux.HandleFunc("DELETE /api/vocabulary/{entryID}", s.vocabulary.Delete)
	mux.HandleFunc("GET /api/dashboard", s.dashboard.Summary)
	mux.HandleFunc("GET /api/grammar", s.catalog.Grammar)
	mux.HandleFunc("GET /api/courses", s.catalog.Courses)
	mux.HandleFunc("POST /api/review/{id}", s.review)
	return s.withRequestID(s.withCORS(s.withLogging(mux)))
}

func (s *Server) healthz(w http.ResponseWriter, _ *http.Request) {
	transport.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Server) readyz(w http.ResponseWriter, r *http.Request) {
	if err := platform.PingDatabase(r.Context(), s.db); err != nil {
		transport.WriteError(w, http.StatusServiceUnavailable, "DATABASE_UNAVAILABLE", "Database is not ready")
		return
	}
	if err := s.cache.Ping(r.Context()); err != nil {
		transport.WriteError(w, http.StatusServiceUnavailable, "CACHE_UNAVAILABLE", "Cache is not ready")
		return
	}
	transport.WriteJSON(w, http.StatusOK, map[string]string{"status": "ready"})
}

func (s *Server) review(w http.ResponseWriter, r *http.Request) {
	var input struct {
		UserID string `json:"user_id"`
		Rating string `json:"rating"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		transport.WriteError(w, http.StatusBadRequest, "INVALID_JSON", "Please send a valid review")
		return
	}
	if input.UserID == "" { input.UserID = s.defaultUser }
	if input.Rating == "" { input.Rating = "good" }
	rating := strings.ToLower(input.Rating)
	interval := map[string]int{"again": 0, "hard": 3, "good": 10, "easy": 21}[rating]
	if interval == 0 && rating != "again" { interval = 10 }
	_, err := s.db.ExecContext(r.Context(), `
		UPDATE review_schedules rs
		JOIN vocabulary_items vi ON vi.id = rs.vocabulary_item_id
		SET rs.mastery = LEAST(1.000, GREATEST(0.000, rs.mastery + CASE ? WHEN 'again' THEN -0.120 WHEN 'hard' THEN 0.030 WHEN 'easy' THEN 0.140 ELSE 0.090 END)),
		    rs.confidence = LEAST(1.000, GREATEST(0.000, rs.confidence + CASE ? WHEN 'again' THEN -0.100 WHEN 'hard' THEN 0.010 WHEN 'easy' THEN 0.100 ELSE 0.060 END)),
		    rs.last_reviewed_at = UTC_TIMESTAMP(6),
		    rs.next_review_at = DATE_ADD(UTC_TIMESTAMP(6), INTERVAL ? DAY)
		WHERE (rs.id = ? OR vi.id = ?) AND rs.user_id = ?`, rating, rating, interval, r.PathValue("id"), r.PathValue("id"), input.UserID)
	if err != nil {
		transport.WriteError(w, http.StatusInternalServerError, "REVIEW_FAILED", "Unable to save this review")
		return
	}
	_ = s.cache.Delete(r.Context(), fmt.Sprintf("dashboard:v2:%s:en", input.UserID))
	transport.WriteJSON(w, http.StatusAccepted, map[string]any{"review_id": r.PathValue("id"), "rating": input.Rating, "next_review_in_days": interval})
}

func (s *Server) withRequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := r.Header.Get("X-Request-ID")
		if requestID == "" {
			requestID = fmt.Sprintf("req_%d", time.Now().UnixNano())
		}
		w.Header().Set("X-Request-ID", requestID)
		next.ServeHTTP(w, r)
	})
}

func (s *Server) withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if _, ok := s.allowed[origin]; ok {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		}
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Request-ID")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (s *Server) withLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		started := time.Now()
		next.ServeHTTP(w, r)
		if s.logger != nil {
			s.logger.InfoContext(r.Context(), "http_request", "method", r.Method, "path", r.URL.Path, "duration_ms", time.Since(started).Milliseconds())
		}
	})
}
