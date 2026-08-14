# Authentication flow

Authentication is deliberately kept behind a boundary so the learning UI can ship with a demo learner in local development without hard-coding production credentials.

## Production flow

1. `POST /api/auth/register` validates email/password and creates a pending user.
2. Email verification activates the account.
3. `POST /api/auth/login` returns a short-lived access token and rotates a refresh token stored in an HttpOnly, Secure, SameSite cookie.
4. Middleware attaches a user ID to request context; services never trust a browser-supplied user ID in production.
5. Refresh token rotation invalidates the previous token and records a token family for replay detection.
6. Logout revokes the refresh family and clears the cookie.

Google OAuth, Apple OAuth, OTP, 2FA and passkeys are extension points for Phase 2. The demo `user_id` query parameter exists only for local foundation development and is explicitly documented as non-production.
