package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"errors"
	"fmt"
	"net/mail"
	"strings"
	"time"
	"unicode"

	"golang.org/x/crypto/bcrypt"
)

const (
	minimumPasswordLength = 8
	maximumPasswordLength = 72
)

type Service struct {
	repo       Store
	accessTTL  time.Duration
	refreshTTL time.Duration
}

func NewService(repo Store, accessTTL, refreshTTL time.Duration) *Service {
	if accessTTL <= 0 {
		accessTTL = 15 * time.Minute
	}
	if refreshTTL <= 0 {
		refreshTTL = 30 * 24 * time.Hour
	}
	return &Service{repo: repo, accessTTL: accessTTL, refreshTTL: refreshTTL}
}

func (s *Service) Register(ctx context.Context, input RegisterInput) (Session, error) {
	email, firstName, err := validateRegistration(input)
	if err != nil {
		return Session{}, err
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return Session{}, fmt.Errorf("hash password: %w", err)
	}
	user, err := s.repo.CreateUser(ctx, email, string(hash), firstName)
	if err != nil {
		return Session{}, err
	}
	return s.issueSession(ctx, user)
}

func (s *Service) Login(ctx context.Context, input LoginInput) (Session, error) {
	email, err := normalizeEmail(input.Email)
	if err != nil || strings.TrimSpace(input.Password) == "" {
		return Session{}, ErrInvalidCredentials
	}
	user, err := s.repo.FindByEmail(ctx, email)
	if errors.Is(err, sql.ErrNoRows) {
		return Session{}, ErrInvalidCredentials
	}
	if err != nil {
		return Session{}, fmt.Errorf("find login user: %w", err)
	}
	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)) != nil {
		return Session{}, ErrInvalidCredentials
	}
	return s.issueSession(ctx, user.User)
}

func (s *Service) LoginWithGoogle(ctx context.Context, subject, email, firstName string) (Session, error) {
	subject = strings.TrimSpace(subject)
	if subject == "" || len(subject) > 255 {
		return Session{}, ErrInvalidOAuth
	}
	normalizedEmail, err := normalizeEmail(email)
	if err != nil {
		return Session{}, ErrInvalidOAuth
	}
	firstName = strings.TrimSpace(firstName)
	if firstName == "" {
		firstName = "Learner"
	}
	if len([]rune(firstName)) > 100 {
		firstName = string([]rune(firstName)[:100])
	}

	user, err := s.repo.FindByGoogleSubject(ctx, subject)
	if err == nil {
		return s.issueSession(ctx, user)
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return Session{}, fmt.Errorf("find google identity: %w", err)
	}

	existing, err := s.repo.FindByEmail(ctx, normalizedEmail)
	if err == nil {
		if err := s.repo.LinkGoogleSubject(ctx, existing.ID, subject); err != nil {
			return Session{}, err
		}
		return s.issueSession(ctx, existing.User)
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return Session{}, fmt.Errorf("find google email owner: %w", err)
	}

	user, err = s.repo.CreateOAuthUser(ctx, normalizedEmail, firstName, subject)
	if err != nil {
		if errors.Is(err, ErrEmailExists) || errors.Is(err, ErrGoogleIdentityExists) {
			linkedUser, lookupErr := s.repo.FindByGoogleSubject(ctx, subject)
			if lookupErr == nil {
				return s.issueSession(ctx, linkedUser)
			}
		}
		return Session{}, err
	}
	return s.issueSession(ctx, user)
}

func (s *Service) Refresh(ctx context.Context, refreshToken string) (Session, error) {
	refreshToken = strings.TrimSpace(refreshToken)
	if refreshToken == "" {
		return Session{}, ErrInvalidRefresh
	}
	currentHash := hashToken(refreshToken)
	user, familyID, err := s.repo.FindRefresh(ctx, currentHash)
	if errors.Is(err, sql.ErrNoRows) {
		return Session{}, ErrInvalidRefresh
	}
	if err != nil {
		return Session{}, fmt.Errorf("find refresh owner: %w", err)
	}
	accessRaw, accessHash, err := newToken()
	if err != nil {
		return Session{}, err
	}
	refreshRaw, refreshHash, err := newToken()
	if err != nil {
		return Session{}, err
	}
	accessID, err := newID()
	if err != nil {
		return Session{}, err
	}
	refreshID, err := newID()
	if err != nil {
		return Session{}, err
	}
	now := time.Now().UTC()
	tokens := PersistedTokens{
		AccessID:         accessID,
		AccessHash:       accessHash,
		AccessExpiresAt:  now.Add(s.accessTTL),
		RefreshID:        refreshID,
		RefreshHash:      refreshHash,
		RefreshExpiresAt: now.Add(s.refreshTTL),
	}
	rotatedUser, err := s.repo.RotateRefreshToken(ctx, currentHash, user.ID, familyID, tokens)
	if err != nil {
		return Session{}, err
	}
	return Session{User: rotatedUser, AccessToken: accessRaw, ExpiresIn: int64(s.accessTTL.Seconds()), refreshToken: refreshRaw}, nil
}

func (s *Service) Authenticate(ctx context.Context, accessToken string) (User, error) {
	if strings.TrimSpace(accessToken) == "" {
		return User{}, ErrUnauthorized
	}
	user, err := s.repo.FindUserByAccessHash(ctx, hashToken(accessToken))
	if errors.Is(err, sql.ErrNoRows) {
		return User{}, ErrUnauthorized
	}
	if err != nil {
		return User{}, fmt.Errorf("authenticate access token: %w", err)
	}
	return user, nil
}

func (s *Service) Logout(ctx context.Context, refreshToken, accessToken string) error {
	if strings.TrimSpace(refreshToken) != "" {
		if err := s.repo.RevokeRefreshFamilyByHash(ctx, hashToken(refreshToken)); err != nil {
			return err
		}
	}
	if strings.TrimSpace(accessToken) != "" {
		if err := s.repo.RevokeAccessToken(ctx, hashToken(accessToken)); err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) issueSession(ctx context.Context, user User) (Session, error) {
	accessRaw, accessHash, err := newToken()
	if err != nil {
		return Session{}, fmt.Errorf("generate access token: %w", err)
	}
	refreshRaw, refreshHash, err := newToken()
	if err != nil {
		return Session{}, fmt.Errorf("generate refresh token: %w", err)
	}
	familyID, err := newID()
	if err != nil {
		return Session{}, fmt.Errorf("generate token family: %w", err)
	}
	accessID, err := newID()
	if err != nil {
		return Session{}, fmt.Errorf("generate access id: %w", err)
	}
	refreshID, err := newID()
	if err != nil {
		return Session{}, fmt.Errorf("generate refresh id: %w", err)
	}
	now := time.Now().UTC()
	if err := s.repo.CreateTokenPair(ctx, user.ID, familyID, PersistedTokens{
		AccessID:         accessID,
		AccessHash:       accessHash,
		AccessExpiresAt:  now.Add(s.accessTTL),
		RefreshID:        refreshID,
		RefreshHash:      refreshHash,
		RefreshExpiresAt: now.Add(s.refreshTTL),
	}); err != nil {
		return Session{}, fmt.Errorf("persist session: %w", err)
	}
	return Session{User: user, AccessToken: accessRaw, ExpiresIn: int64(s.accessTTL.Seconds()), refreshToken: refreshRaw}, nil
}

func validateRegistration(input RegisterInput) (string, string, error) {
	email, err := normalizeEmail(input.Email)
	if err != nil {
		return "", "", err
	}
	passwordLength := len([]byte(input.Password))
	if passwordLength < minimumPasswordLength || passwordLength > maximumPasswordLength {
		return "", "", fmt.Errorf("password must be between %d and %d characters", minimumPasswordLength, maximumPasswordLength)
	}
	if strings.TrimSpace(input.Password) != input.Password {
		return "", "", errors.New("password cannot start or end with whitespace")
	}
	if !hasPasswordVariety(input.Password) {
		return "", "", errors.New("password must contain a letter and a number")
	}
	firstName := strings.TrimSpace(input.FirstName)
	if firstName == "" {
		firstName = "Learner"
	}
	if len([]rune(firstName)) > 100 {
		return "", "", errors.New("first_name must be 100 characters or fewer")
	}
	return email, firstName, nil
}

func normalizeEmail(value string) (string, error) {
	email := strings.ToLower(strings.TrimSpace(value))
	if len(email) == 0 || len(email) > 255 {
		return "", errors.New("email must be between 1 and 255 characters")
	}
	parsed, err := mail.ParseAddress(email)
	if err != nil || parsed.Address != email || strings.ContainsAny(email, "\r\n") {
		return "", errors.New("email must be valid")
	}
	return email, nil
}

func hasPasswordVariety(value string) bool {
	hasLetter, hasNumber := false, false
	for _, character := range value {
		hasLetter = hasLetter || unicode.IsLetter(character)
		hasNumber = hasNumber || unicode.IsNumber(character)
	}
	return hasLetter && hasNumber
}

func newToken() (string, string, error) {
	value := make([]byte, 32)
	if _, err := rand.Read(value); err != nil {
		return "", "", err
	}
	raw := base64.RawURLEncoding.EncodeToString(value)
	return raw, hashToken(raw), nil
}

func hashToken(value string) string {
	digest := sha256.Sum256([]byte(value))
	return fmt.Sprintf("%x", digest[:])
}
