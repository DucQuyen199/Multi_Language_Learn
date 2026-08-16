package instructor

import (
	"strings"
	"testing"
)

func TestNormalizeLessonInputRejectsDangerousVideoURL(t *testing.T) {
	dangerous := []string{
		"javascript:alert(1)",
		"data:text/html;base64,PHNjcmlwdD4=",
		"vbscript:msgbox",
		"ftp://example.com/video.mp4",
		"not a url",
	}
	for _, url := range dangerous {
		input := LessonInput{Title: "A valid title", Content: "Long enough content here.", VideoURL: &url}
		if _, err := normalizeLessonInput(input, 1); err == nil || !strings.Contains(err.Error(), "video_url") {
			t.Errorf("video_url %q should be rejected, got err=%v", url, err)
		}
	}
}

func TestNormalizeLessonInputAcceptsHTTPSVideoURL(t *testing.T) {
	safe := "https://cdn.example.com/lesson.mp4"
	input := LessonInput{Title: "A valid title", Content: "Long enough content here.", VideoURL: &safe}
	normalized, err := normalizeLessonInput(input, 1)
	if err != nil {
		t.Fatalf("valid https video_url rejected: %v", err)
	}
	if *normalized.VideoURL != safe {
		t.Fatalf("video_url = %q, want %q", *normalized.VideoURL, safe)
	}
}

func TestNormalizeLessonInputValidatesBasics(t *testing.T) {
	if _, err := normalizeLessonInput(LessonInput{Title: "ab", Content: "valid content"}, 1); err == nil {
		t.Error("short title should be rejected")
	}
	if _, err := normalizeLessonInput(LessonInput{Title: "Valid", Content: "short"}, 1); err == nil {
		t.Error("short content should be rejected")
	}
	if _, err := normalizeLessonInput(LessonInput{Title: "Valid", Content: "valid content", Status: "live"}, 1); err == nil {
		t.Error("unknown status should be rejected")
	}
	normalized, err := normalizeLessonInput(LessonInput{Title: "Valid", Content: "valid content", DurationMinutes: 999}, 4)
	if err != nil {
		t.Fatalf("valid input rejected: %v", err)
	}
	// LessonOrder 0 means "auto": CreateLesson assigns the next slot and
	// UpdateLesson falls back to the existing order.
	if normalized.DurationMinutes != 180 || normalized.Status != "draft" || normalized.LessonOrder != 0 {
		t.Fatalf("unexpected normalization: %+v", normalized)
	}
}
