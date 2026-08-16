package auth

import (
	"errors"
	"testing"

	"golang.org/x/crypto/bcrypt"
)

// TestTimingEqualizerIsValidBcrypt guards the login timing-equalizer: if this
// constant ever stops being a real bcrypt digest, unknown-email logins would
// return instantly and leak account existence again.
func TestTimingEqualizerIsValidBcrypt(t *testing.T) {
	err := bcrypt.CompareHashAndPassword([]byte(timingEqualizer), []byte("definitely-not-the-password"))
	if !errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
		t.Fatalf("timingEqualizer must be a valid bcrypt digest, got %v", err)
	}
}
