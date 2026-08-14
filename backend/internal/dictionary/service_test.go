package dictionary

import "testing"

func TestNormalizeQuery(t *testing.T) {
	if got := normalizeQuery("  spaced   academic   word "); got != "spaced academic word" {
		t.Fatalf("normalizeQuery() = %q, want %q", got, "spaced academic word")
	}
}

func TestNormalizeLanguageDefaultsToEnglish(t *testing.T) {
	if got := normalizeLanguage(" "); got != "en" {
		t.Fatalf("normalizeLanguage() = %q, want %q", got, "en")
	}
	if got := normalizeLanguage(" VI "); got != "vi" {
		t.Fatalf("normalizeLanguage() = %q, want %q", got, "vi")
	}
}
