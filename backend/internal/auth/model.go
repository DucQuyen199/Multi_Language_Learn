package auth

import "time"

// User is the authenticated identity shared with the rest of the application.
// Password hashes and token material intentionally never leave this package.
type User struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	FirstName     string `json:"first_name"`
	Role          string `json:"role"`
	EmailVerified bool   `json:"email_verified"`
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
