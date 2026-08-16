package auth

import (
	"testing"
	"time"
)

func TestAttemptLimiterBlocksAfterLimit(t *testing.T) {
	limiter := newAttemptLimiter(3, time.Minute)
	now := time.Now().UTC()

	for attempt := 1; attempt <= 3; attempt++ {
		if !limiter.allow("key", now) {
			t.Fatalf("attempt %d within the limit was rejected", attempt)
		}
	}
	if limiter.allow("key", now) {
		t.Fatal("4th attempt within the same window should be blocked")
	}
}

func TestAttemptLimiterTracksKeysIndependently(t *testing.T) {
	limiter := newAttemptLimiter(1, time.Minute)
	now := time.Now().UTC()

	if !limiter.allow("alice", now) {
		t.Fatal("first attempt for alice should pass")
	}
	if limiter.allow("alice", now) {
		t.Fatal("second attempt for alice should be blocked")
	}
	if !limiter.allow("bob", now) {
		t.Fatal("bob has his own budget and should pass")
	}
}

func TestAttemptLimiterResetAfterSuccess(t *testing.T) {
	limiter := newAttemptLimiter(2, time.Minute)
	now := time.Now().UTC()

	limiter.allow("key", now)
	limiter.allow("key", now)
	if limiter.allow("key", now) {
		t.Fatal("should be blocked at the limit before reset")
	}
	limiter.reset("key")
	if !limiter.allow("key", now) {
		t.Fatal("reset should restore the budget")
	}
}

func TestAttemptLimiterWindowSlides(t *testing.T) {
	limiter := newAttemptLimiter(2, time.Minute)
	start := time.Now().UTC()

	limiter.allow("key", start)
	limiter.allow("key", start)
	if limiter.allow("key", start) {
		t.Fatal("should be blocked inside the window")
	}
	if !limiter.allow("key", start.Add(2*time.Minute)) {
		t.Fatal("old attempts should expire once the window slides past them")
	}
}
