package auth

import (
	"strings"
	"time"
)

const (
	RoleStudent    = "student"
	RoleInstructor = "instructor"
	RoleAdmin      = "admin"
)

// User is the authenticated identity shared with the rest of the application.
// Password hashes and token material intentionally never leave this package.
type User struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	FirstName     string `json:"first_name"`
	Role          string `json:"role"`
	EmailVerified bool   `json:"email_verified"`
}

// HasRole reports whether the user carries one of the requested roles.
func (u User) HasRole(roles ...string) bool {
	for _, role := range roles {
		if strings.EqualFold(u.Role, role) {
			return true
		}
	}
	return false
}

func IsValidRole(role string) bool {
	switch strings.ToLower(strings.TrimSpace(role)) {
	case RoleStudent, RoleInstructor, RoleAdmin:
		return true
	}
	return false
}

func NormalizeRole(role string) string {
	return strings.ToLower(strings.TrimSpace(role))
}

type RegisterInput struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
}

type LoginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Session struct {
	User        User   `json:"user"`
	AccessToken string `json:"access_token"`
	ExpiresIn   int64  `json:"expires_in"`

	// RefreshToken is only populated for native mobile clients (X-Client-Type:
	// mobile) which cannot use HttpOnly cookies. Web browsers keep receiving
	// the rotating token exclusively via the refresh cookie.
	RefreshToken string `json:"refresh_token,omitempty"`

	refreshToken string
}

type PersistedTokens struct {
	AccessID         string
	AccessHash       string
	AccessExpiresAt  time.Time
	RefreshID        string
	RefreshHash      string
	RefreshExpiresAt time.Time
}
