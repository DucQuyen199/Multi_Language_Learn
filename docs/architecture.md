# Multi-language Learning OS — System Architecture

## Decision summary

- **Frontend:** Next.js 16 App Router, React, TypeScript, Tailwind CSS v4, TanStack Query and Zustand.
- **Backend:** Go 1.26, `net/http`, `chi`, `sqlx`, MySQL driver and Redis client. The API is organized as handler → service → repository.
- **Data:** MySQL 8.4 LTS with UUID strings, foreign keys, timestamps, soft-delete columns where needed and full-text-ready indexes.
- **Cache:** Redis for dictionary lookups, dashboard snapshots and short-lived rate-limit/session data. MySQL remains the source of truth.
- **Runtime:** Docker Compose for local development; Kubernetes manifests under `infra/k8s` for a small production deployment. `k9s` can inspect the resulting cluster.
- **AI and speech:** Provider interfaces in Go. The first implementation is safe and deterministic; external providers are injected through environment variables and are not required to boot the application.

## Runtime topology

```text
Browser
  │ HTTPS
  ▼
Next.js web (3000)
  │ REST /api/*
  ▼
Go API (8080) ─────── Redis (6379)
  │                    │
  ▼                    └─ cache-aside: dictionary/dashboard
MySQL (3306)
  │
  └─ migrations + seed data
```

The browser only talks to the public web/API boundary. Provider keys are server-side only. Next.js can proxy `/api` during local development, while deployments may put both services behind the same ingress.

## Backend boundaries

```text
internal/
  config       environment parsing and safe defaults
  http         router, middleware, response envelope
  dictionary   search and entry detail use cases
  vocabulary   save/list/remove use cases
  dashboard    learner summary and review queue
  review       FSRS-compatible review event boundary
  grammar      grammar catalog boundary
  course       course catalog boundary
  ai           AIProvider interface and provider registry
  speech       STT/TTS/pronunciation interfaces
  platform     MySQL, Redis, clock, IDs and logging adapters
```

Handlers validate transport input and serialize envelopes. Services own business rules. Repositories own SQL. No business logic is placed in the router.

## Cache-aside policy

| Key | TTL | Invalidate on |
| --- | ---: | --- |
| `dict:v1:{language}:{normalized_query}` | 5 min | dictionary import |
| `dict-entry:v1:{language}:{slug}` | 10 min | dictionary import/edit |
| `dashboard:v1:{user_id}:{language_id}` | 60 sec | vocabulary/review/session mutation |
| `rate:v1:{ip}:{route}` | 1 min | expiry only |

Cache failures are non-fatal: the service falls back to MySQL and logs the degraded path.

## Security baseline

- Validate and normalize every request at the handler boundary.
- Use parameterized SQL only; never concatenate user input into queries.
- Keep secrets in environment variables; `.env` is ignored by git.
- Auth now uses short-lived opaque access tokens plus refresh-token rotation in HttpOnly cookies; add email verification and optional OAuth/2FA as later extensions.
- Restrict CORS with `CORS_ALLOWED_ORIGINS` in non-local environments.
- Add request IDs, structured logs, health/readiness probes and rate limiting before production exposure.

## Scaling path

1. Add read replicas and a background job worker for imports, audio and AI jobs.
2. Move media to S3-compatible object storage.
3. Replace MySQL full-text search with OpenSearch behind the `DictionarySearch` interface when corpus size requires it.
4. Add an event/outbox table for progress, streaks and analytics.
