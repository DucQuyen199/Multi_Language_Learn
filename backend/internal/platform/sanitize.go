package platform

import "strings"

// replacementRune (U+FFFD) is what UTF-8 decoders emit for broken bytes —
// typically a client that sent text in a legacy codepage. Storing it shows
// users "�" forever, so it is stripped before validation and persistence.
const replacementRune = '\uFFFD'

// SanitizeText drops replacement characters and non-printable control bytes
// while keeping line structure. Use for multi-line content such as lessons.
func SanitizeText(value string) string {
	return strings.Map(func(r rune) rune {
		switch {
		case r == replacementRune:
			return -1
		case r == '\n' || r == '\t':
			return r
		case r < 0x20 || r == 0x7f:
			return -1
		default:
			return r
		}
	}, value)
}

// SanitizeLine is SanitizeText plus collapsing whitespace runs into single
// spaces. Use for single-line fields such as titles and names.
func SanitizeLine(value string) string {
	return strings.Join(strings.Fields(SanitizeText(value)), " ")
}
