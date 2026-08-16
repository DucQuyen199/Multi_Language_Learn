package platform

import (
	"crypto/rand"
	"fmt"
	"strings"
	"unicode"
)

// NewID returns a random UUIDv4 for new records.
func NewID() (string, error) {
	var value [16]byte
	if _, err := rand.Read(value[:]); err != nil {
		return "", err
	}
	value[6] = (value[6] & 0x0f) | 0x40
	value[8] = (value[8] & 0x3f) | 0x80
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x", value[0:4], value[4:6], value[6:8], value[8:10], value[10:16]), nil
}

// NewIDOrPanic wraps NewID for call sites where UUID generation cannot fail
// (crypto/rand only fails when the OS entropy source is unavailable).
func NewIDOrPanic() string {
	id, err := NewID()
	if err != nil {
		panic(fmt.Sprintf("platform: generate id: %v", err))
	}
	return id
}

// Slugify converts a title into a URL-safe slug.
func Slugify(title string) string {
	var builder strings.Builder
	lastDash := true
	for _, character := range strings.ToLower(strings.TrimSpace(title)) {
		switch {
		case unicode.IsLetter(character) || unicode.IsNumber(character):
			builder.WriteRune(character)
			lastDash = false
		case !lastDash:
			builder.WriteRune('-')
			lastDash = true
		}
	}
	return strings.Trim(builder.String(), "-")
}
