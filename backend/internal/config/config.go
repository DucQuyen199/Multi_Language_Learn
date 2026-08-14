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
	DictionaryCacheTTL   int
	DashboardCacheTTL    int
}

func Load() Config {
	return Config{
		Addr:               env("API_ADDR", ":8080"),
		DatabaseURL:        env("DATABASE_URL", "app:app@tcp(mysql:3306)/multilanguage?parseTime=true&charset=utf8mb4&collation=utf8mb4_unicode_ci"),
		RedisURL:            env("REDIS_URL", "redis://redis:6379/0"),
		AllowedOrigins:     splitCSV(env("CORS_ALLOWED_ORIGINS", "http://localhost:3000")),
		Environment:        env("APP_ENV", "development"),
		DefaultUserID:      env("DEMO_USER_ID", "00000000-0000-0000-0000-000000000001"),
		DictionaryCacheTTL: envInt("DICTIONARY_CACHE_TTL_SECONDS", 300),
		DashboardCacheTTL:  envInt("DASHBOARD_CACHE_TTL_SECONDS", 60),
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
