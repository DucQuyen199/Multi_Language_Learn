package auth

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

// attemptLimiter is a small in-memory sliding-window limiter that blunts
// brute-force and credential-stuffing attacks against the auth endpoints.
// It is intentionally per-instance: for a multi-replica deployment move the
// counters to Redis, the call sites stay the same.
type attemptLimiter struct {
	mu      sync.Mutex
	entries map[string][]time.Time
	limit   int
	window  time.Duration
}

func newAttemptLimiter(limit int, window time.Duration) *attemptLimiter {
	return &attemptLimiter{entries: make(map[string][]time.Time), limit: limit, window: window}
}

// allow records an attempt for the key and reports whether it fits the window.
func (l *attemptLimiter) allow(key string, now time.Time) bool {
	l.mu.Lock()
	defer l.mu.Unlock()

	cutoff := now.Add(-l.window)
	attempts := l.entries[key][:0]
	for _, at := range l.entries[key] {
		if at.After(cutoff) {
			attempts = append(attempts, at)
		}
	}
	if len(attempts) >= l.limit {
		l.entries[key] = attempts
		return false
	}
	l.entries[key] = append(attempts, now)

	if len(l.entries) > 50_000 {
		for k, v := range l.entries {
			trimmed := v[:0]
			for _, at := range v {
				if at.After(cutoff) {
					trimmed = append(trimmed, at)
				}
			}
			if len(trimmed) == 0 {
				delete(l.entries, k)
			} else {
				l.entries[k] = trimmed
			}
		}
	}
	return true
}

// reset clears the counter after a successful authentication.
func (l *attemptLimiter) reset(key string) {
	l.mu.Lock()
	defer l.mu.Unlock()
	delete(l.entries, key)
}

// requestIP extracts the client IP. X-Forwarded-For is deliberately ignored:
// it is client-controlled and only a trusted reverse proxy should rewrite it.
func requestIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return strings.TrimSpace(r.RemoteAddr)
	}
	return host
}
