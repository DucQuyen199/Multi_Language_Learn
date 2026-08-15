package auth

import (
	"context"
	"net/http"
	"strings"
)

type contextKey struct{}

func WithUser(r *http.Request, user User) *http.Request {
	return r.WithContext(context.WithValue(r.Context(), contextKey{}, user))
}

func UserFromContext(ctx context.Context) (User, bool) {
	user, ok := ctx.Value(contextKey{}).(User)
	return user, ok
}

func UserID(r *http.Request) (string, bool) {
	user, ok := UserFromContext(r.Context())
	return user.ID, ok && strings.TrimSpace(user.ID) != ""
}

func AccessToken(r *http.Request) string {
	value := strings.TrimSpace(r.Header.Get("Authorization"))
	if len(value) < 8 || !strings.EqualFold(value[:7], "Bearer ") {
		return ""
	}
	return strings.TrimSpace(value[7:])
}
