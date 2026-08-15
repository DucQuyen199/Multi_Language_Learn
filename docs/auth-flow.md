# Authentication flow

Authentication is deliberately kept behind a boundary so the learning UI can ship with a demo learner in local development without hard-coding production credentials. Password accounts are active immediately because this repository does not yet include an email provider; email verification remains a Phase 2 extension.

## Production flow

1. `POST /api/auth/register` validates email/password, creates an active student, and initializes a profile plus an English learning path.
2. `POST /api/auth/login` returns a short-lived access token and rotates a refresh token stored in an HttpOnly, SameSite cookie. Production also sets `Secure`.
3. Middleware authenticates the bearer token and attaches the user identity to request context; services never trust a browser-supplied user ID.
4. `POST /api/auth/refresh` rotates the refresh token, invalidates the previous token, and records a token family for replay detection.
5. `POST /api/auth/logout` revokes the refresh family, revokes the current access token, and clears the cookie.

## Google OAuth

1. The frontend sends the browser to `GET /api/auth/google/start`.
2. The backend stores a short-lived HttpOnly `lingua_google_state` cookie and redirects to Google with the configured callback URL.
3. `GET /api/auth/google/callback` validates `state`, exchanges the authorization code, and reads the verified Google profile.
4. A matching Google subject signs in directly. Otherwise, a matching verified email is linked to the existing account; if neither exists, a student account and English learning path are created.
5. The backend issues the same access-token plus rotated refresh-cookie session and redirects to `/app/dashboard`.

Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URL` in the backend environment. Register the exact redirect URL in Google Cloud Console; local Compose uses `http://localhost:3000/api/auth/google/callback` by default.

The development-only demo fallback can be disabled with `ALLOW_DEMO_AUTH=false`. It always resolves to `DEMO_USER_ID`; a query/body `user_id` cannot override an authenticated identity.

Apple OAuth, OTP, 2FA and passkeys remain extension points for a later phase. Legacy `user_id` query parameters may remain in older local clients, but authenticated requests always use the token identity.
