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
| GET | `/api/dictionary/search?q=&language=` | cached dictionary search |
| GET | `/api/dictionary/:language/:slug` | cached dictionary detail |
| GET | `/api/vocabulary?user_id=` | saved vocabulary |
| POST | `/api/vocabulary` | save a dictionary entry |
| DELETE | `/api/vocabulary/:entry_id?user_id=` | unsave an entry |
| GET | `/api/dashboard?user_id=&language=` | learner summary |
| POST | `/api/review/:id` | review event boundary |

## Planned module endpoints

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
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
