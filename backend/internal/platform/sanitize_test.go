package platform

import "testing"

func TestSanitizeLineStripsMojibake(t *testing.T) {
	cases := map[string]string{
		"English A2 \uFFFD First Steps": "English A2 First Steps",
		"\uFFFD\uFFFDbroken":            "broken",
		"  spaced    out  ":            "spaced out",
		"Tiếng Việt OK":                "Tiếng Việt OK",
		"tab\tkept\tin text":           "tab kept in text",
	}
	for input, expected := range cases {
		if got := SanitizeLine(input); got != expected {
			t.Errorf("SanitizeLine(%q) = %q, want %q", input, got, expected)
		}
	}
}

func TestSanitizeTextRemovesControlCharsKeepsNewlines(t *testing.T) {
	got := SanitizeText("line one\x00\x1f\nline two\uFFFD end")
	if got != "line one\nline two end" {
		t.Fatalf("SanitizeText = %q", got)
	}
	if SanitizeLine("a\nb") != "a b" {
		t.Fatalf("SanitizeLine must flatten newlines, got %q", SanitizeLine("a\nb"))
	}
}
