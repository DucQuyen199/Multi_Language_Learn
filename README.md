<div align="center">

# 🌐 LinguaAtlas
### *Next-Generation Multi-Language Learning Platform*

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Go](https://img.shields.io/badge/Go-1.26-00ADD8?style=flat-square&logo=go)](https://golang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=flat-square&logo=mysql)](https://mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-8.0-DC382D?style=flat-square&logo=redis)](https://redis.io/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Kustomize-326CE5?style=flat-square&logo=kubernetes)](https://kubernetes.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

*A full-stack, cloud-native multilingual platform featuring real-time AI Tutoring, Spaced Repetition (SRS), phonetic speech labs, and deep polyglot dictionary streaming across 8 global languages.*

---

</div>

## 📌 System Navigation & Live Endpoints

| Service / Component | Protocol / Port | Direct Link / Path | Status & Purpose |
| :--- | :---: | :--- | :--- |
| **Frontend Web App** | HTTP `3000` | [`http://localhost:3000`](http://localhost:3000) | Main Portal & Showcase UI |
| **Authentication Form** | HTTP `3000` | [`/login`](http://localhost:3000/login) &middot; [`/register`](http://localhost:3000/register) | Dynamic Polyglot Auth Showcase |
| **Learner Dashboard** | HTTP `3000` | [`/app/dashboard`](http://localhost:3000/app/dashboard) | Progress Tracking & Stats |
| **Course Library & Enroll** | HTTP `3000` | [`/app/courses`](http://localhost:3000/app/courses) | Browse paths, enroll, track progress |
| **Lesson Study Player** | HTTP `3000` | [`/app/lessons/:id`](http://localhost:3000/app/courses) | Markdown-lite lessons, complete for XP |
| **Instructor Studio** | HTTP `3000` | [`/instructor`](http://localhost:3000/instructor) | Author courses & lessons, follow students |
| **Admin Console** | HTTP `3000` | [`/admin`](http://localhost:3000/admin) | Platform metrics, users, catalog, languages |
| **Spaced Repetition (SRS)** | HTTP `3000` | [`/app/flashcards`](http://localhost:3000/app/flashcards) | Active Recall & Flashcard Lab |
| **AI Language Tutor** | HTTP `3000` | [`/app/ai-tutor`](http://localhost:3000/app/ai-tutor) | Conversational AI Co-pilot |
| **Multilingual Dictionary** | HTTP `3000` | [`/dictionary`](http://localhost:3000/dictionary) | Unicode-Safe Lexicon Lookup |
| **Backend REST API** | HTTP `8080` | [`http://localhost:8080`](http://localhost:8080) | Go High-Performance Server |
| **API Health & Readiness** | HTTP `8080` | [`/healthz`](http://localhost:8080/healthz) &middot; [`/readyz`](http://localhost:8080/readyz) | Liveness / DB & Cache Checks |
| **MySQL Persistence** | TCP `3306` | `localhost:3306` (`multilanguage`) | UTF-8 / `utf8mb4` Relational Store |
| **Redis Cache** | TCP `6379` | `localhost:6379` | High-Speed Cache & Session Store |
| **Kubernetes Cluster** | K8s | `lingua-atlas` namespace | 6 Microservice Pods (HA Deployment) |

## 👥 Roles & Demo Accounts

Three first-class roles share one platform, each with its own workspace shell:

| Role | Workspace | Capabilities |
| :--- | :--- | :--- |
| **Learner** (`student`) | `/app` | Study courses & lessons, enroll/unenroll, earn XP, SRS flashcards, dictionary, AI tutor |
| **Instructor** (`instructor`) | `/instructor` | Create courses, author & publish lessons, view per-student progress |
| **Admin** (`admin`) | `/admin` | Platform metrics, promote/demote/remove accounts, publish/archive courses, toggle languages |

Seeded demo accounts (fresh database via `docker compose up`):

| Email | Password | Role |
| :--- | :--- | :--- |
| `admin@gmail.com` | `@Admin123` | Admin |
| `admin@lingua.dev` | `Admin1234` | Admin |
| `minh.anh@lingua.dev` | `Teacher1234` | Instructor |
| `sofia.reyes@lingua.dev` | `Teacher1234` | Instructor |
| `learner@example.com` | `Learner1234` | Learner |
| `linh@example.com` | `Learner1234` | Learner |

After sign-in you land in the workspace matching your role, and role switcher chips let admins/instructors jump between Learning, Studio, and Admin.

## 🛡️ Security Controls

The platform is hardened against the common OWASP Top 10 failure modes:

| Threat | Control |
| :--- | :--- |
| Brute force / credential stuffing | Sliding-window rate limits: 20 attempts / 5 min per source IP, 5 failures / 15 min per account, reset on success (`429 TOO_MANY_ATTEMPTS`) |
| Account enumeration (timing) | Unknown emails still run a full bcrypt comparison, so latency cannot reveal whether an account exists |
| Broken access control | Role middleware (`withRole`) + per-record ownership filters for instructors; roles are re-read from the database on every request; self-modification and last-admin removal are blocked |
| SQL injection | 100% parameterized queries; admin search additionally escapes LIKE wildcards (`%`, `_`) |
| XSS | React auto-escaping, no `dangerousSetInnerHTML`; lesson `video_url` only accepts `http(s)` URLs (`javascript:`/`data:` rejected); strict CSP on both API and web app |
| CSRF | State changes require a Bearer access token; the refresh cookie is `HttpOnly` + `SameSite=Lax` and only `POST /api/auth/refresh` reads it |
| Session theft / replay | Access + refresh tokens are 32-byte random values stored only as SHA-256 hashes; refresh rotation revokes the whole token family on anomaly; soft-deleting a user revokes their tokens immediately |
| Clickjacking / sniffing / referrer leaks | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS in production, `Cache-Control: no-store` on `/api/*` |
| Mass assignment | JSON decoders reject unknown fields and cap request body size |
| Dependency risk | `go test` security unit tests, `npm audit` (0 production vulnerabilities), `govulncheck` (0 reachable vulnerabilities) |
| Monitoring | Structured `auth_event` logs: `login_success`, `login_failed`, `rate_limited`, `register_success` |

Known trade-offs: register replies `409 EMAIL_EXISTS` (usability over obscurity), and the in-memory rate limiter is per-instance — move the counters to Redis before running multiple API replicas.

---

## ⚡ Quick Start

### 1. Docker Compose (Hot Reload Dev Mode)

Run the entire full-stack ecosystem locally with live hot-reloading:

```bash
# Clone repository
git clone https://github.com/DucQuyen199/Multi_Language_Learn.git
cd Multi_Language_Learn

# Start all services with Hot Reload enabled
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### 2. Kubernetes & k9s Deployment

Deploy production-ready manifests via Kustomize:

```bash
# Apply all manifests to 'lingua-atlas' namespace
kubectl apply -k infra/k8s

# Verify pods status & monitor with k9s
kubectl get pods -n lingua-atlas
k9s -n lingua-atlas
```

### 3. Local Native Development

```bash
# Backend (Go 1.26)
cd backend && go run ./cmd/api

# Frontend (Next.js 16 + React 19)
cd frontend && npm install && npm run dev
```

---

## 🏗️ Architecture & Core Modules

```
multi-language/
├── backend/                  # Go 1.26 Clean Architecture API
│   ├── cmd/api/              # HTTP Server Entrypoint
│   ├── internal/
│   │   ├── auth/             # Sessions, identities & RBAC roles (student/instructor/admin)
│   │   ├── admin/            # Admin console: metrics, user & catalog governance
│   │   ├── instructor/       # Studio: course authoring, lesson CRUD, student progress
│   │   ├── learning/         # Learner path: enrollments, lessons, completions & XP
│   │   ├── dictionary/       # Multi-language Lexicon Service
│   │   ├── vocabulary/       # User Wordbank & Spaced Repetition (SRS)
│   │   └── dashboard/        # Learner Metrics & Summary Engine
│   └── migrations/           # Versioned MySQL Schemas (001 - 006)
├── frontend/                 # Next.js 16 (App Router) + Tailwind CSS v4
│   ├── app/                  # Routes: /login, /app (learner), /instructor, /admin, /dictionary
│   ├── components/           # UI: AppShell, WorkspaceShell, role views, shared design system
│   └── lib/                  # Auth Context, API Client & State Hooks
├── infra/k8s/                # Kubernetes Kustomize Baseline (Deployment, Secrets, PVC)
└── docs/                     # Technical Specifications & Architecture Docs
```

---

## 📚 Technical Documentation

- 📐 [**System Architecture**](docs/architecture.md) — Layered design, dependency graph, and network topology.
- 🔐 [**Authentication Flow**](docs/auth-flow.md) — Dual-token lifecycle, Google OAuth 2.0, and RBAC sessions.
- 🔌 [**API Specifications**](docs/api.md) — Complete endpoint reference with payload examples.
- 🗄️ [**Entity Relationship Diagram (ERD)**](docs/erd.md) — Database models and table relations.
- ☸️ [**Kubernetes Deployment Guide**](infra/k8s/README.md) — Cluster configuration, scaling, and secret management.

---

## 🧪 Quality & Validation

```bash
# Frontend Lint & Production Typecheck
cd frontend && npm run lint && npm run build

# Backend Unit & Integration Tests
cd backend && go test ./...

# Infrastructure Manifest Validation
kubectl kustomize infra/k8s
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

