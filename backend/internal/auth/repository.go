package auth

import (
	"context"
	"crypto/rand"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/go-sql-driver/mysql"
)

type Store interface {
	CreateUser(ctx context.Context, email, passwordHash, firstName string) (User, error)
	CreateOAuthUser(ctx context.Context, email, firstName, providerSubject string) (User, error)
	FindByEmail(ctx context.Context, email string) (UserRecord, error)
	FindByGoogleSubject(ctx context.Context, subject string) (User, error)
	LinkGoogleSubject(ctx context.Context, userID, subject string) error
	CreateTokenPair(ctx context.Context, userID, familyID string, tokens PersistedTokens) error
	FindUserByAccessHash(ctx context.Context, tokenHash string) (User, error)
	FindRefresh(ctx context.Context, tokenHash string) (User, string, error)
	RotateRefreshToken(ctx context.Context, currentHash, userID, familyID string, tokens PersistedTokens) (User, error)
	RevokeRefreshFamilyByHash(ctx context.Context, tokenHash string) error
	RevokeAccessToken(ctx context.Context, tokenHash string) error
}

type UserRecord struct {
	User
	PasswordHash string
}

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateUser(ctx context.Context, email, passwordHash, firstName string) (User, error) {
	return r.createUser(ctx, email, passwordHash, firstName, "")
}

func (r *Repository) CreateOAuthUser(ctx context.Context, email, firstName, providerSubject string) (User, error) {
	return r.createUser(ctx, email, "", firstName, providerSubject)
}

func (r *Repository) createUser(ctx context.Context, email, passwordHash, firstName, providerSubject string) (User, error) {
	userID, err := newID()
	if err != nil {
		return User{}, fmt.Errorf("generate user id: %w", err)
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return User{}, fmt.Errorf("begin create user: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO users (id, email, password_hash, role, email_verified_at)
		VALUES (?, ?, NULLIF(?, ''), 'student', UTC_TIMESTAMP(6))`, userID, email, passwordHash); err != nil {
		if isDuplicateKey(err) {
			return User{}, ErrEmailExists
		}
		return User{}, fmt.Errorf("insert user: %w", err)
	}

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO user_profiles (user_id, first_name)
		VALUES (?, ?)`, userID, firstName); err != nil {
		return User{}, fmt.Errorf("insert user profile: %w", err)
	}

	var languageID string
	if err := tx.QueryRowContext(ctx, `SELECT id FROM languages WHERE code = 'en' AND is_active = TRUE LIMIT 1`).Scan(&languageID); err != nil {
		return User{}, fmt.Errorf("find default language: %w", err)
	}
	learningID, err := newID()
	if err != nil {
		return User{}, fmt.Errorf("generate learning language id: %w", err)
	}
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO user_languages (id, user_id, language_id, cefr_level, daily_goal)
		VALUES (?, ?, ?, 'A1', 30)`, learningID, userID, languageID); err != nil {
		return User{}, fmt.Errorf("insert default learning language: %w", err)
	}

	if providerSubject != "" {
		identityID, err := newID()
		if err != nil {
			return User{}, fmt.Errorf("generate identity id: %w", err)
		}
		if _, err := tx.ExecContext(ctx, `
			INSERT INTO auth_identities (id, user_id, provider, provider_subject)
			VALUES (?, ?, 'google', ?)`, identityID, userID, providerSubject); err != nil {
			if isDuplicateKey(err) {
				return User{}, ErrGoogleIdentityExists
			}
			return User{}, fmt.Errorf("insert oauth identity: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return User{}, fmt.Errorf("commit user: %w", err)
	}
	return User{ID: userID, Email: email, FirstName: firstName, Role: "student", EmailVerified: true}, nil
}

func (r *Repository) FindByEmail(ctx context.Context, email string) (UserRecord, error) {
	var result UserRecord
	var verifiedAt sql.NullTime
	err := r.db.QueryRowContext(ctx, `
		SELECT u.id, u.email, COALESCE(u.password_hash, ''), u.role,
		       COALESCE(up.first_name, 'Learner'), u.email_verified_at
		FROM users u
		LEFT JOIN user_profiles up ON up.user_id = u.id
		WHERE u.email = ? AND u.deleted_at IS NULL`, email).Scan(
		&result.ID, &result.Email, &result.PasswordHash, &result.Role, &result.FirstName, &verifiedAt)
	if err != nil {
		return UserRecord{}, err
	}
	result.EmailVerified = verifiedAt.Valid
	return result, nil
}

func (r *Repository) FindByGoogleSubject(ctx context.Context, subject string) (User, error) {
	return r.findUser(ctx, `
		SELECT u.id, u.email, u.role, COALESCE(up.first_name, 'Learner'), u.email_verified_at
		FROM auth_identities ai
		JOIN users u ON u.id = ai.user_id
		LEFT JOIN user_profiles up ON up.user_id = u.id
		WHERE ai.provider = 'google' AND ai.provider_subject = ? AND u.deleted_at IS NULL`, subject)
}

func (r *Repository) LinkGoogleSubject(ctx context.Context, userID, subject string) error {
	identityID, err := newID()
	if err != nil {
		return fmt.Errorf("generate identity id: %w", err)
	}
	if _, err := r.db.ExecContext(ctx, `
		INSERT INTO auth_identities (id, user_id, provider, provider_subject)
		VALUES (?, ?, 'google', ?)`, identityID, userID, subject); err != nil {
		if isDuplicateKey(err) {
			return ErrGoogleIdentityExists
		}
		return fmt.Errorf("link oauth identity: %w", err)
	}
	return nil
}

func (r *Repository) CreateTokenPair(ctx context.Context, userID, familyID string, tokens PersistedTokens) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin create session: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO auth_access_tokens (id, token_hash, user_id, expires_at)
		VALUES (?, ?, ?, ?)`, tokens.AccessID, tokens.AccessHash, userID, tokens.AccessExpiresAt); err != nil {
		return fmt.Errorf("insert access token: %w", err)
	}
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO auth_refresh_tokens (id, family_id, token_hash, user_id, expires_at)
		VALUES (?, ?, ?, ?, ?)`, tokens.RefreshID, familyID, tokens.RefreshHash, userID, tokens.RefreshExpiresAt); err != nil {
		return fmt.Errorf("insert refresh token: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit session: %w", err)
	}
	return nil
}

func (r *Repository) FindUserByAccessHash(ctx context.Context, tokenHash string) (User, error) {
	return r.findUser(ctx, `
		SELECT u.id, u.email, u.role, COALESCE(up.first_name, 'Learner'), u.email_verified_at
		FROM auth_access_tokens at
		JOIN users u ON u.id = at.user_id
		LEFT JOIN user_profiles up ON up.user_id = u.id
		WHERE at.token_hash = ? AND at.revoked_at IS NULL
		  AND at.expires_at > UTC_TIMESTAMP(6) AND u.deleted_at IS NULL`, tokenHash)
}

func (r *Repository) FindRefresh(ctx context.Context, tokenHash string) (User, string, error) {
	var user User
	var familyID string
	var verifiedAt sql.NullTime
	err := r.db.QueryRowContext(ctx, `
		SELECT u.id, u.email, u.role, COALESCE(up.first_name, 'Learner'), u.email_verified_at, rt.family_id
		FROM auth_refresh_tokens rt
		JOIN users u ON u.id = rt.user_id
		LEFT JOIN user_profiles up ON up.user_id = u.id
		WHERE rt.token_hash = ? AND u.deleted_at IS NULL`, tokenHash).
		Scan(&user.ID, &user.Email, &user.Role, &user.FirstName, &verifiedAt, &familyID)
	if err != nil {
		return User{}, "", err
	}
	user.EmailVerified = verifiedAt.Valid
	return user, familyID, nil
}

func (r *Repository) RotateRefreshToken(ctx context.Context, currentHash, userID, familyID string, tokens PersistedTokens) (User, error) {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return User{}, fmt.Errorf("begin refresh: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	var tokenID, storedUserID, storedFamilyID string
	var expiresAt time.Time
	var revokedAt sql.NullTime
	err = tx.QueryRowContext(ctx, `
		SELECT id, user_id, family_id, expires_at, revoked_at
		FROM auth_refresh_tokens WHERE token_hash = ? FOR UPDATE`, currentHash).
		Scan(&tokenID, &storedUserID, &storedFamilyID, &expiresAt, &revokedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return User{}, ErrInvalidRefresh
	}
	if err != nil {
		return User{}, fmt.Errorf("find refresh token: %w", err)
	}
	if revokedAt.Valid {
		_, _ = tx.ExecContext(ctx, `UPDATE auth_refresh_tokens SET revoked_at = COALESCE(revoked_at, UTC_TIMESTAMP(6)) WHERE family_id = ?`, storedFamilyID)
		_ = tx.Commit()
		return User{}, ErrInvalidRefresh
	}
	if !expiresAt.After(time.Now().UTC()) {
		_, _ = tx.ExecContext(ctx, `UPDATE auth_refresh_tokens SET revoked_at = UTC_TIMESTAMP(6) WHERE id = ?`, tokenID)
		_ = tx.Commit()
		return User{}, ErrInvalidRefresh
	}
	if storedUserID != userID || storedFamilyID != familyID {
		return User{}, ErrInvalidRefresh
	}

	if _, err := tx.ExecContext(ctx, `
		INSERT INTO auth_access_tokens (id, token_hash, user_id, expires_at)
		VALUES (?, ?, ?, ?)`, tokens.AccessID, tokens.AccessHash, userID, tokens.AccessExpiresAt); err != nil {
		return User{}, fmt.Errorf("insert refreshed access token: %w", err)
	}
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO auth_refresh_tokens (id, family_id, token_hash, user_id, expires_at)
		VALUES (?, ?, ?, ?, ?)`, tokens.RefreshID, familyID, tokens.RefreshHash, userID, tokens.RefreshExpiresAt); err != nil {
		return User{}, fmt.Errorf("insert refreshed token: %w", err)
	}
	if _, err := tx.ExecContext(ctx, `
		UPDATE auth_refresh_tokens
		SET revoked_at = UTC_TIMESTAMP(6), replaced_by_id = ?
		WHERE id = ?`, tokens.RefreshID, tokenID); err != nil {
		return User{}, fmt.Errorf("revoke old refresh token: %w", err)
	}

	user, err := r.findUserTx(ctx, tx, userID)
	if err != nil {
		return User{}, err
	}
	if err := tx.Commit(); err != nil {
		return User{}, fmt.Errorf("commit refresh: %w", err)
	}
	return user, nil
}

func (r *Repository) RevokeRefreshFamilyByHash(ctx context.Context, tokenHash string) error {
	var familyID string
	err := r.db.QueryRowContext(ctx, `SELECT family_id FROM auth_refresh_tokens WHERE token_hash = ?`, tokenHash).Scan(&familyID)
	if errors.Is(err, sql.ErrNoRows) {
		return nil
	}
	if err != nil {
		return fmt.Errorf("find refresh family: %w", err)
	}
	if _, err := r.db.ExecContext(ctx, `UPDATE auth_refresh_tokens SET revoked_at = COALESCE(revoked_at, UTC_TIMESTAMP(6)) WHERE family_id = ?`, familyID); err != nil {
		return fmt.Errorf("revoke refresh family: %w", err)
	}
	return nil
}

func (r *Repository) RevokeAccessToken(ctx context.Context, tokenHash string) error {
	if strings.TrimSpace(tokenHash) == "" {
		return nil
	}
	if _, err := r.db.ExecContext(ctx, `UPDATE auth_access_tokens SET revoked_at = COALESCE(revoked_at, UTC_TIMESTAMP(6)) WHERE token_hash = ?`, tokenHash); err != nil {
		return fmt.Errorf("revoke access token: %w", err)
	}
	return nil
}

func (r *Repository) findUser(ctx context.Context, query, arg string) (User, error) {
	var user User
	var verifiedAt sql.NullTime
	err := r.db.QueryRowContext(ctx, query, arg).Scan(&user.ID, &user.Email, &user.Role, &user.FirstName, &verifiedAt)
	if err != nil {
		return User{}, err
	}
	user.EmailVerified = verifiedAt.Valid
	return user, nil
}

func (r *Repository) findUserTx(ctx context.Context, tx *sql.Tx, userID string) (User, error) {
	var user User
	var verifiedAt sql.NullTime
	err := tx.QueryRowContext(ctx, `
		SELECT u.id, u.email, u.role, COALESCE(up.first_name, 'Learner'), u.email_verified_at
		FROM users u LEFT JOIN user_profiles up ON up.user_id = u.id
		WHERE u.id = ? AND u.deleted_at IS NULL`, userID).
		Scan(&user.ID, &user.Email, &user.Role, &user.FirstName, &verifiedAt)
	if err != nil {
		return User{}, fmt.Errorf("load refreshed user: %w", err)
	}
	user.EmailVerified = verifiedAt.Valid
	return user, nil
}

func isDuplicateKey(err error) bool {
	var mysqlErr *mysql.MySQLError
	return errors.As(err, &mysqlErr) && mysqlErr.Number == 1062
}

func newID() (string, error) {
	var value [16]byte
	if _, err := rand.Read(value[:]); err != nil {
		return "", err
	}
	value[6] = (value[6] & 0x0f) | 0x40
	value[8] = (value[8] & 0x3f) | 0x80
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x", value[0:4], value[4:6], value[6:8], value[8:10], value[10:16]), nil
}
