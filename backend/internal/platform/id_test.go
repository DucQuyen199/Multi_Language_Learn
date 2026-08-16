package platform

import "testing"

func TestSlugify(t *testing.T) {
	cases := map[string]string{
		"  English B1 · Build momentum  ": "english-b1-build-momentum",
		"Greetings & introductions!":     "greetings-introductions",
		// Unicode letters are preserved: Vietnamese slugs stay readable.
		"Tiếng Việt cho người mới": "tiếng-việt-cho-người-mới",
		"///":                      "",
		"Mixed 123 OK":             "mixed-123-ok",
	}
	for input, expected := range cases {
		if got := Slugify(input); got != expected {
			t.Errorf("Slugify(%q) = %q, want %q", input, got, expected)
		}
	}
}

func TestNewIDIsUUIDv4(t *testing.T) {
	first, err := NewID()
	if err != nil {
		t.Fatalf("NewID returned error: %v", err)
	}
	if len(first) != 36 || first[14] != '4' {
		t.Fatalf("NewID = %q, want a 36-char UUIDv4", first)
	}
	second, err := NewID()
	if err != nil {
		t.Fatalf("NewID returned error: %v", err)
	}
	if first == second {
		t.Fatal("NewID must not repeat values")
	}
}
