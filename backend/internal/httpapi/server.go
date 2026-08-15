package httpapi

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/auth"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/catalog"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/config"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/dashboard"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/dictionary"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/platform"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/transport"
	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/vocabulary"
)

type Server struct {
	db          *sql.DB
	cache       *platform.Cache
	logger      *slog.Logger
	auth        *auth.Handler
	authService *auth.Service
	dictionary  *dictionary.Handler
	vocabulary  *vocabulary.Handler
	dashboard   *dashboard.Handler
	catalog     *catalog.Handler
	defaultUser string
	allowed     map[string]struct{}
	allowDemo   bool
}

func NewServer(cfg config.Config, db *sql.DB, cache *platform.Cache, logger *slog.Logger) *Server {
	authService := auth.NewService(
		auth.NewRepository(db),
		time.Duration(cfg.AuthAccessTTLSeconds)*time.Second,
		time.Duration(cfg.AuthRefreshTTLDays)*24*time.Hour,
	)
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
		auth: auth.NewHandler(
			authService,
			cfg.AuthCookieName,
			strings.EqualFold(cfg.Environment, "production"),
			time.Duration(cfg.AuthRefreshTTLDays)*24*time.Hour,
			auth.GoogleConfig{
				ClientID:     cfg.GoogleClientID,
				ClientSecret: cfg.GoogleClientSecret,
				RedirectURL:  cfg.GoogleRedirectURL,
			},
		),
		authService: authService,
		dictionary:  dictionary.NewHandler(dictionaryService),
		vocabulary:  vocabulary.NewHandler(vocabularyService, cfg.DefaultUserID),
		dashboard:   dashboard.NewHandler(dashboardService, cfg.DefaultUserID),
		catalog:     catalogHandler,
		defaultUser: cfg.DefaultUserID,
		allowDemo:   cfg.AllowDemoAuth,
	}
}

func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", s.healthz)
	mux.HandleFunc("GET /readyz", s.readyz)
	mux.HandleFunc("POST /api/auth/register", s.auth.Register)
	mux.HandleFunc("POST /api/auth/login", s.auth.Login)
	mux.HandleFunc("GET /api/auth/google/start", s.auth.GoogleStart)
	mux.HandleFunc("GET /api/auth/google/callback", s.auth.GoogleCallback)
	mux.HandleFunc("POST /api/auth/refresh", s.auth.Refresh)
	mux.HandleFunc("POST /api/auth/logout", s.auth.Logout)
	mux.Handle("GET /api/auth/me", s.withRequiredUser(http.HandlerFunc(s.auth.Me)))
	mux.HandleFunc("GET /api/dictionary/search", s.dictionary.Search)
	mux.HandleFunc("GET /api/dictionary/{language}/{slug}", s.dictionary.Detail)
	mux.Handle("GET /api/vocabulary", s.withUser(http.HandlerFunc(s.vocabulary.List)))
	mux.Handle("POST /api/vocabulary", s.withUser(http.HandlerFunc(s.vocabulary.Save)))
	mux.Handle("DELETE /api/vocabulary/{entryID}", s.withUser(http.HandlerFunc(s.vocabulary.Delete)))
	mux.Handle("GET /api/dashboard", s.withUser(http.HandlerFunc(s.dashboard.Summary)))
	mux.HandleFunc("GET /api/grammar", s.catalog.Grammar)
	mux.HandleFunc("GET /api/courses", s.catalog.Courses)
	mux.Handle("POST /api/review/{id}", s.withUser(http.HandlerFunc(s.review)))
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
	if userID, ok := auth.UserID(r); ok {
		input.UserID = userID
	} else {
		input.UserID = s.defaultUser
	}
	if input.Rating == "" {
		input.Rating = "good"
	}
	rating := strings.ToLower(input.Rating)
	interval := map[string]int{"again": 0, "hard": 3, "good": 10, "easy": 21}[rating]
	if interval == 0 && rating != "again" {
		interval = 10
	}
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
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (s *Server) withUser(next http.Handler) http.Handler {
	return s.authenticate(next, s.allowDemo)
}

func (s *Server) withRequiredUser(next http.Handler) http.Handler {
	return s.authenticate(next, false)
}

func (s *Server) authenticate(next http.Handler, allowDemo bool) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		accessToken := auth.AccessToken(r)
		if accessToken != "" {
			user, err := s.authService.Authenticate(r.Context(), accessToken)
			if err != nil {
				w.Header().Set("WWW-Authenticate", `Bearer realm="lingua-atlas"`)
				transport.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Please sign in to continue")
				return
			}
			next.ServeHTTP(w, auth.WithUser(r, user))
			return
		}
		if allowDemo {
			next.ServeHTTP(w, auth.WithUser(r, auth.User{ID: s.defaultUser, FirstName: "Learner", Role: "student", EmailVerified: true}))
			return
		}
		w.Header().Set("WWW-Authenticate", `Bearer realm="lingua-atlas"`)
		transport.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Please sign in to continue")
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
