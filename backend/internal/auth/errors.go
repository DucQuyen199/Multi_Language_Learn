package auth

import "errors"

var (
	ErrEmailExists          = errors.New("email already exists")
	ErrInvalidCredentials   = errors.New("invalid credentials")
	ErrInvalidRefresh       = errors.New("invalid refresh token")
	ErrUnauthorized         = errors.New("unauthorized")
	ErrInvalidOAuth         = errors.New("invalid oauth identity")
	ErrGoogleIdentityExists = errors.New("google identity already linked")
)
