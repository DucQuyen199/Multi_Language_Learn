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
| **Spaced Repetition (SRS)** | HTTP `3000` | [`/app/flashcards`](http://localhost:3000/app/flashcards) | Active Recall & Flashcard Lab |
| **AI Language Tutor** | HTTP `3000` | [`/app/ai-tutor`](http://localhost:3000/app/ai-tutor) | Conversational AI Co-pilot |
| **Multilingual Dictionary** | HTTP `3000` | [`/dictionary`](http://localhost:3000/dictionary) | Unicode-Safe Lexicon Lookup |
| **Backend REST API** | HTTP `8080` | [`http://localhost:8080`](http://localhost:8080) | Go High-Performance Server |
| **API Health & Readiness** | HTTP `8080` | [`/healthz`](http://localhost:8080/healthz) &middot; [`/readyz`](http://localhost:8080/readyz) | Liveness / DB & Cache Checks |
| **MySQL Persistence** | TCP `3306` | `localhost:3306` (`multilanguage`) | UTF-8 / `utf8mb4` Relational Store |
| **Redis Cache** | TCP `6379` | `localhost:6379` | High-Speed Cache & Session Store |
| **Kubernetes Cluster** | K8s | `lingua-atlas` namespace | 6 Microservice Pods (HA Deployment) |

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
│   │   ├── auth/             # Session & Identity Management (OAuth, JWT)
│   │   ├── dictionary/       # Multi-language Lexicon Service
│   │   ├── vocabulary/       # User Wordbank & Spaced Repetition (SRS)
│   │   └── dashboard/        # Learner Metrics & Summary Engine
│   └── migrations/           # Versioned MySQL Schemas (001 - 005)
├── frontend/                 # Next.js 16 (App Router) + Tailwind CSS v4
│   ├── app/                  # Route Handlers & Pages (/login, /app, /dictionary)
│   ├── components/           # UI Components (Logo, AuthForm, AppShell, ThemeToggle)
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

