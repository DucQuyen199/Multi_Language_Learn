# REST API design

Base URL: `/api/v1` in production. The local server also exposes `/api` aliases for the initial frontend slice.

## Envelope

```json
{
  "success": true,
  "data": {},
  "message": null
}
```

Errors use:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}
```

## Implemented foundation endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/healthz` | liveness |
| GET | `/readyz` | MySQL/Redis readiness |
| POST | `/api/auth/register` | Create an account and start a session |
| POST | `/api/auth/login` | Sign in and start a session |
| GET | `/api/auth/google/start` | Start Google OAuth in the browser |
| GET | `/api/auth/google/callback` | Validate Google OAuth and create the session |
| POST | `/api/auth/refresh` | Rotate the refresh cookie and issue a new access token |
| POST | `/api/auth/logout` | Revoke the current session |
| GET | `/api/auth/me` | Return the authenticated account |
| GET | `/api/dictionary/search?q=&language=` | cached dictionary search |
| GET | `/api/dictionary/:language/:slug` | cached dictionary detail |
| GET | `/api/vocabulary` | saved vocabulary for the authenticated account |
| POST | `/api/vocabulary` | save a dictionary entry |
| DELETE | `/api/vocabulary/:entry_id` | unsave an entry from the authenticated account |
| GET | `/api/dashboard?language=` | learner summary for the authenticated account |
| POST | `/api/review/:id` | review event boundary |

## Planned module endpoints

```text
GET  /api/grammar?level=B1
GET  /api/courses
GET  /api/listening?level=B1
POST /api/listening/:id/attempt
POST /api/speaking/analyze
GET  /api/reading?level=B1
POST /api/writing/analyze
POST /api/ai/chat
GET  /api/progress
```

Every endpoint keeps transport, validation, service and repository responsibilities separate so the frontend can adopt TanStack Query without coupling to SQL.
