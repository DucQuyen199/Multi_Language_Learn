package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Addr                 string
	DatabaseURL          string
	RedisURL             string
	AllowedOrigins       []string
	Environment          string
	DefaultUserID        string
	AllowDemoAuth        bool
	AuthAccessTTLSeconds int
	AuthRefreshTTLDays   int
	AuthCookieName       string
	GoogleClientID       string
	GoogleClientSecret   string
	GoogleRedirectURL    string
	DictionaryCacheTTL   int
	DashboardCacheTTL    int
}

func Load() Config {
	environment := env("APP_ENV", "development")
	return Config{
		Addr:                 env("API_ADDR", ":8080"),
		DatabaseURL:          env("DATABASE_URL", "app:app@tcp(mysql:3306)/multilanguage?parseTime=true&charset=utf8mb4&collation=utf8mb4_unicode_ci"),
		RedisURL:             env("REDIS_URL", "redis://redis:6379/0"),
		AllowedOrigins:       splitCSV(env("CORS_ALLOWED_ORIGINS", "http://localhost:3000")),
		Environment:          environment,
		DefaultUserID:        env("DEMO_USER_ID", "00000000-0000-0000-0000-000000000001"),
		AllowDemoAuth:        envBool("ALLOW_DEMO_AUTH", environment == "development"),
		AuthAccessTTLSeconds: envInt("AUTH_ACCESS_TTL_SECONDS", 900),
		AuthRefreshTTLDays:   envInt("AUTH_REFRESH_TTL_DAYS", 30),
		AuthCookieName:       env("AUTH_REFRESH_COOKIE", "lingua_refresh"),
		GoogleClientID:       env("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret:   env("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURL:    env("GOOGLE_REDIRECT_URL", "http://localhost:3000/api/auth/google/callback"),
		DictionaryCacheTTL:   envInt("DICTIONARY_CACHE_TTL_SECONDS", 300),
		DashboardCacheTTL:    envInt("DASHBOARD_CACHE_TTL_SECONDS", 60),
	}
}

func env(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}
	return fallback
}

func envInt(key string, fallback int) int {
	value, err := strconv.Atoi(env(key, ""))
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}

func envBool(key string, fallback bool) bool {
	value := strings.ToLower(strings.TrimSpace(os.Getenv(key)))
	if value == "" {
		return fallback
	}
	return value == "1" || value == "true" || value == "yes" || value == "on"
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}
