package auth

import (
	"context"
	"crypto/subtle"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/ducquyen199/Multi_Language_Learn/backend/internal/transport"
)

const (
	googleAuthorizationURL = "https://accounts.google.com/o/oauth2/v2/auth"
	googleTokenURL         = "https://oauth2.googleapis.com/token"
	googleUserInfoURL      = "https://openidconnect.googleapis.com/v1/userinfo"
)

type GoogleConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

type Handler struct {
	service            *Service
	cookieName         string
	secureCookie       bool
	refreshTTL         time.Duration
	googleClientID     string
	googleClientSecret string
	googleRedirectURL  string
	googleStateCookie  string
	httpClient         *http.Client
	logger             *slog.Logger
	ipLimiter          *attemptLimiter
	accountLimiter     *attemptLimiter
}

func NewHandler(service *Service, cookieName string, secureCookie bool, refreshTTL time.Duration, logger *slog.Logger, googleConfigs ...GoogleConfig) *Handler {
	if strings.TrimSpace(cookieName) == "" {
		cookieName = "lingua_refresh"
	}
	if refreshTTL <= 0 {
		refreshTTL = 30 * 24 * time.Hour
	}
	google := GoogleConfig{}
	if len(googleConfigs) > 0 {
		google = googleConfigs[0]
	}
	return &Handler{
		service:            service,
		cookieName:         cookieName,
		secureCookie:       secureCookie,
		refreshTTL:         refreshTTL,
		googleClientID:     strings.TrimSpace(google.ClientID),
		googleClientSecret: strings.TrimSpace(google.ClientSecret),
		googleRedirectURL:  strings.TrimSpace(google.RedirectURL),
		googleStateCookie:  "lingua_google_state",
		httpClient:         &http.Client{Timeout: 10 * time.Second},
		logger:             logger,
		// 20 attempts / 5 min per source IP absorbs NAT classrooms while
		// stopping brute force; 5 failures / 15 min per account protects a
		// targeted credential from sustained guessing.
		ipLimiter:      newAttemptLimiter(20, 5*time.Minute),
		accountLimiter: newAttemptLimiter(5, 15*time.Minute),
	}
}

func (h *Handler) logEvent(event string, details ...any) {
	if h.logger != nil {
		h.logger.Info("auth_event", append([]any{"event", event}, details...)...)
	}
}

// isMobileClient reports whether the caller is a native app. Mobile clients
// store the rotating refresh token in device secure storage instead of
// relying on HttpOnly cookies, so responses include it in the JSON body.
func isMobileClient(r *http.Request) bool {
	return strings.EqualFold(strings.TrimSpace(r.Header.Get("X-Client-Type")), "mobile")
}

// decodeRefreshBody reads an optional {"refresh_token": "..."} JSON body sent
// by mobile clients. Missing or invalid bodies simply yield an empty token.
func decodeRefreshBody(r *http.Request) string {
	if r.Body == nil {
		return ""
	}
	var input struct {
		RefreshToken string `json:"refresh_token"`
	}
	_ = json.NewDecoder(io.LimitReader(r.Body, 4<<10)).Decode(&input)
	return strings.TrimSpace(input.RefreshToken)
}

func (h *Handler) writeSession(w http.ResponseWriter, r *http.Request, status int, session Session) {
	h.setRefreshCookie(w, session.refreshToken)
	if isMobileClient(r) {
		session.RefreshToken = session.refreshToken
	}
	transport.WriteJSON(w, status, session)
}

// tooManyAttempts reports 429 and logs the throttle for monitoring.
func (h *Handler) tooManyAttempts(w http.ResponseWriter, scope string) {
	h.logEvent("rate_limited", "scope", scope)
	transport.WriteError(w, http.StatusTooManyRequests, "TOO_MANY_ATTEMPTS", "Too many attempts. Please wait a few minutes and try again.")
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var input RegisterInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	if !h.ipLimiter.allow("register:"+requestIP(r), time.Now().UTC()) {
		h.tooManyAttempts(w, "register")
		return
	}
	session, err := h.service.Register(r.Context(), input)
	if err != nil {
		h.writeServiceError(w, err)
		return
	}
	h.logEvent("register_success", "user_id", session.User.ID)
	h.writeSession(w, r, http.StatusCreated, session)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var input LoginInput
	if err := decodeJSON(w, r, &input); err != nil {
		return
	}
	now := time.Now().UTC()
	ipKey := "login-ip:" + requestIP(r)
	if !h.ipLimiter.allow(ipKey, now) {
		h.tooManyAttempts(w, "login_ip")
		return
	}
	accountKey := "login-account:" + strings.ToLower(strings.TrimSpace(input.Email))
	if !h.accountLimiter.allow(accountKey, now) {
		h.tooManyAttempts(w, "login_account")
		return
	}
	session, err := h.service.Login(r.Context(), input)
	if err != nil {
		h.logEvent("login_failed", "email", strings.ToLower(strings.TrimSpace(input.Email)), "reason", "invalid_credentials")
		h.writeServiceError(w, err)
		return
	}
	h.accountLimiter.reset(accountKey)
	h.logEvent("login_success", "user_id", session.User.ID, "role", session.User.Role)
	h.writeSession(w, r, http.StatusOK, session)
}

func (h *Handler) GoogleStart(w http.ResponseWriter, r *http.Request) {
	if !h.googleConfigured() {
		h.redirectOAuthError(w, r, "google_not_configured")
		return
	}

	state, _, err := newToken()
	if err != nil {
		h.redirectOAuthError(w, r, "google_failed")
		return
	}
	h.setGoogleStateCookie(w, state)

	params := url.Values{}
	params.Set("client_id", h.googleClientID)
	params.Set("redirect_uri", h.googleRedirectURL)
	params.Set("response_type", "code")
	params.Set("scope", "openid email profile")
	params.Set("state", state)
	params.Set("prompt", "select_account")
	http.Redirect(w, r, googleAuthorizationURL+"?"+params.Encode(), http.StatusFound)
}

func (h *Handler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	if oauthError := strings.TrimSpace(r.URL.Query().Get("error")); oauthError != "" {
		if oauthError == "access_denied" {
			h.redirectOAuthError(w, r, "google_cancelled")
		} else {
			h.redirectOAuthError(w, r, "google_failed")
		}
		return
	}
	if !h.googleConfigured() {
		h.redirectOAuthError(w, r, "google_not_configured")
		return
	}

	stateCookie, cookieErr := r.Cookie(h.googleStateCookie)
	state := r.URL.Query().Get("state")
	h.clearGoogleStateCookie(w)
	if cookieErr != nil || state == "" || subtle.ConstantTimeCompare([]byte(stateCookie.Value), []byte(state)) != 1 {
		h.redirectOAuthError(w, r, "google_failed")
		return
	}

	code := strings.TrimSpace(r.URL.Query().Get("code"))
	if code == "" {
		h.redirectOAuthError(w, r, "google_failed")
		return
	}

	accessToken, err := h.exchangeGoogleCode(r.Context(), code)
	if err != nil {
		h.redirectOAuthError(w, r, "google_failed")
		return
	}
	profile, err := h.fetchGoogleProfile(r.Context(), accessToken)
	if err != nil {
		h.redirectOAuthError(w, r, "google_failed")
		return
	}
	if !profile.EmailVerified {
		h.redirectOAuthError(w, r, "google_email_unverified")
		return
	}

	session, err := h.service.LoginWithGoogle(r.Context(), profile.Subject, profile.Email, profile.GivenName)
	if err != nil {
		h.redirectOAuthError(w, r, "google_failed")
		return
	}
	h.setRefreshCookie(w, session.refreshToken)
	http.Redirect(w, r, "/app/dashboard", http.StatusSeeOther)
}

func (h *Handler) Refresh(w http.ResponseWriter, r *http.Request) {
	refreshToken := ""
	if cookie, err := r.Cookie(h.cookieName); err == nil {
		refreshToken = strings.TrimSpace(cookie.Value)
	}
	if refreshToken == "" {
		// Native apps pass the rotating refresh token in the JSON body.
		refreshToken = decodeRefreshBody(r)
	}
	if refreshToken == "" {
		transport.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Your session has expired. Please sign in again.")
		return
	}
	session, err := h.service.Refresh(r.Context(), refreshToken)
	if err != nil {
		h.clearRefreshCookie(w)
		h.writeServiceError(w, err)
		return
	}
	h.writeSession(w, r, http.StatusOK, session)
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	refreshToken := ""
	if cookie, err := r.Cookie(h.cookieName); err == nil {
		refreshToken = strings.TrimSpace(cookie.Value)
	}
	if refreshToken == "" {
		refreshToken = decodeRefreshBody(r)
	}
	if err := h.service.Logout(r.Context(), refreshToken, AccessToken(r)); err != nil {
		transport.WriteError(w, http.StatusInternalServerError, "LOGOUT_FAILED", "Unable to end this session")
		return
	}
	h.clearRefreshCookie(w)
	transport.WriteJSON(w, http.StatusOK, map[string]bool{"logged_out": true})
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	user, ok := UserFromContext(r.Context())
	if !ok {
		transport.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Please sign in to continue")
		return
	}
	transport.WriteJSON(w, http.StatusOK, user)
}

type googleProfile struct {
	Subject       string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	GivenName     string `json:"given_name"`
}

func (h *Handler) exchangeGoogleCode(ctx context.Context, code string) (string, error) {
	form := url.Values{}
	form.Set("code", code)
	form.Set("client_id", h.googleClientID)
	form.Set("client_secret", h.googleClientSecret)
	form.Set("redirect_uri", h.googleRedirectURL)
	form.Set("grant_type", "authorization_code")

	request, err := http.NewRequestWithContext(ctx, http.MethodPost, googleTokenURL, strings.NewReader(form.Encode()))
	if err != nil {
		return "", fmt.Errorf("create google token request: %w", err)
	}
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	response, err := h.httpClient.Do(request)
	if err != nil {
		return "", fmt.Errorf("exchange google code: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return "", fmt.Errorf("google token endpoint returned %s", response.Status)
	}

	var payload struct {
		AccessToken string `json:"access_token"`
	}
	if err := json.NewDecoder(io.LimitReader(response.Body, 1<<20)).Decode(&payload); err != nil {
		return "", fmt.Errorf("decode google token response: %w", err)
	}
	if strings.TrimSpace(payload.AccessToken) == "" {
		return "", errors.New("google token response did not include an access token")
	}
	return payload.AccessToken, nil
}

func (h *Handler) fetchGoogleProfile(ctx context.Context, accessToken string) (googleProfile, error) {
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, googleUserInfoURL, nil)
	if err != nil {
		return googleProfile{}, fmt.Errorf("create google profile request: %w", err)
	}
	request.Header.Set("Authorization", "Bearer "+accessToken)
	response, err := h.httpClient.Do(request)
	if err != nil {
		return googleProfile{}, fmt.Errorf("fetch google profile: %w", err)
	}
	defer response.Body.Close()
	if response.StatusCode != http.StatusOK {
		return googleProfile{}, fmt.Errorf("google profile endpoint returned %s", response.Status)
	}

	var profile googleProfile
	if err := json.NewDecoder(io.LimitReader(response.Body, 1<<20)).Decode(&profile); err != nil {
		return googleProfile{}, fmt.Errorf("decode google profile: %w", err)
	}
	return profile, nil
}

func (h *Handler) googleConfigured() bool {
	return h.googleClientID != "" && h.googleClientSecret != "" && h.googleRedirectURL != ""
}

func (h *Handler) redirectOAuthError(w http.ResponseWriter, r *http.Request, code string) {
	http.Redirect(w, r, "/login?oauth_error="+url.QueryEscape(code), http.StatusSeeOther)
}

func (h *Handler) setGoogleStateCookie(w http.ResponseWriter, state string) {
	http.SetCookie(w, &http.Cookie{
		Name:     h.googleStateCookie,
		Value:    state,
		Path:     "/api/auth/google",
		MaxAge:   10 * 60,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   h.secureCookie,
	})
}

func (h *Handler) clearGoogleStateCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     h.googleStateCookie,
		Value:    "",
		Path:     "/api/auth/google",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   h.secureCookie,
		Expires:  time.Unix(1, 0),
	})
}

func (h *Handler) setRefreshCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     h.cookieName,
		Value:    token,
		Path:     "/api/auth",
		MaxAge:   int(h.refreshTTL.Seconds()),
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   h.secureCookie,
	})
}

func (h *Handler) clearRefreshCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     h.cookieName,
		Value:    "",
		Path:     "/api/auth",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   h.secureCookie,
		Expires:  time.Unix(1, 0),
	})
}

func (h *Handler) writeServiceError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrEmailExists):
		transport.WriteError(w, http.StatusConflict, "EMAIL_EXISTS", "An account with that email already exists")
	case errors.Is(err, ErrGoogleIdentityExists):
		transport.WriteError(w, http.StatusConflict, "GOOGLE_ACCOUNT_EXISTS", "This Google account is already linked")
	case errors.Is(err, ErrInvalidCredentials):
		transport.WriteError(w, http.StatusUnauthorized, "INVALID_CREDENTIALS", "Email or password is incorrect")
	case errors.Is(err, ErrInvalidRefresh), errors.Is(err, ErrUnauthorized):
		transport.WriteError(w, http.StatusUnauthorized, "UNAUTHORIZED", "Your session has expired. Please sign in again.")
	case errors.Is(err, ErrInvalidOAuth):
		transport.WriteError(w, http.StatusBadRequest, "OAUTH_FAILED", "Unable to verify this Google account")
	case strings.Contains(err.Error(), "password"), strings.Contains(err.Error(), "email"), strings.Contains(err.Error(), "first_name"):
		transport.WriteError(w, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
	default:
		transport.WriteError(w, http.StatusInternalServerError, "AUTH_FAILED", "Unable to complete authentication")
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
