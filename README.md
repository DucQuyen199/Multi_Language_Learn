# Multi Language Learn

Multi Language Learn is a full-stack language-learning workspace for vocabulary, dictionary lookup, spaced review, grammar, courses, listening, speaking, reading, writing, progress tracking and an AI tutor experience.

The repository is designed to run locally with one Docker Compose command and can be promoted to Kubernetes with the included Kustomize manifests.

## Highlights

- Learner dashboard with daily progress and review information.
- Unicode-safe dictionary search and entry details for multilingual content.
- Save, filter and remove vocabulary items.
- Flashcard review actions with `again`, `hard`, `good` and `easy` ratings.
- Grammar and course catalog views.
- Listening, speaking, reading, writing, AI tutor, progress and notebook workspaces.
- Responsive UI with keyboard shortcuts, accessible controls, action feedback and light/dark themes.
- Go REST API with MySQL persistence and Redis caching.
- Docker Compose development environment and Kubernetes/k9s deployment baseline.

## Technology

| Layer | Technology |
| --- | --- |
| Web | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| Client state/data | TanStack Query, Zustand, Zod |
| API | Go 1.26, `net/http`, layered handlers/services/repositories |
| Database | MySQL 8.4 with `utf8mb4` encoding |
| Cache | Redis 8 |
| Delivery | Docker, Docker Compose, Kubernetes, Kustomize, k9s |

## Quick start with Docker

### Requirements

- Docker Desktop or Docker Engine with Docker Compose v2.
- Optional for running services outside Docker: Node.js 20+, npm and Go 1.26.
- Optional for Kubernetes: `kubectl`, Kustomize and [k9s](https://k9scli.io/).

Clone and start the complete stack:

```bash
git clone https://github.com/DucQuyen199/Multi_Language_Learn.git
cd Multi_Language_Learn
docker compose up -d --build
```

Open the application at:

- Web app: <http://localhost:3000>
- API: <http://localhost:8080>
- API readiness: <http://localhost:8080/readyz>

Useful commands:

```bash
docker compose ps
docker compose logs -f backend
docker compose down
```

The database and Redis data are stored in Docker volumes. `docker compose down -v` removes those local volumes and should only be used when a clean database is required.

## Configuration

Copy the example environment file when running services directly or when adding local overrides:

```bash
# macOS/Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Provider keys for AI, speech-to-text, text-to-speech and pronunciation services are optional. They are read server-side only. Never commit `.env` or real credentials; use a secret manager in shared environments.

The local seed data and API responses use UTF-8/`utf8mb4` so Vietnamese, Chinese and other multilingual text remains readable. If an existing MySQL volume predates the current migrations, apply the repair migration before testing old data:

```bash
docker compose exec -T mysql mysql -uroot -proot multilanguage < backend/migrations/003_repair_utf8_mojibake.sql
docker compose restart backend frontend
```

## Run services without Docker

Start MySQL and Redis separately, then configure `.env` with host-local connection values.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
go run ./cmd/api
```

For a production-style frontend process:

```bash
cd frontend
npm run build
npm run start
```

## API foundation

The local API exposes the following working endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/healthz` | Liveness check |
| `GET` | `/readyz` | MySQL and Redis readiness check |
| `GET` | `/api/dictionary/search?q=&language=` | Cached dictionary search |
| `GET` | `/api/dictionary/:language/:slug` | Dictionary entry details |
| `GET` | `/api/vocabulary?user_id=` | List saved vocabulary |
| `POST` | `/api/vocabulary` | Save a vocabulary entry |
| `DELETE` | `/api/vocabulary/:entry_id?user_id=` | Remove a vocabulary entry |
| `GET` | `/api/dashboard?user_id=&language=` | Dashboard summary |
| `GET` | `/api/grammar` | Grammar catalog |
| `GET` | `/api/courses` | Course catalog |
| `POST` | `/api/review/:id` | Save a spaced-review result |

See the complete API notes in [`docs/api.md`](docs/api.md).

## Kubernetes and k9s

The manifests in [`infra/k8s`](infra/k8s) provide a development/early-production baseline:

```bash
kubectl apply -k infra/k8s
kubectl -n lingua-atlas get pods
k9s -n lingua-atlas
```

Before a production rollout, replace placeholder images and development secrets, configure ingress/TLS, backups, resource limits, observability and an explicit migration job. A managed MySQL and Redis service is recommended for high availability. See [`infra/k8s/README.md`](infra/k8s/README.md).

## Quality checks

Run the checks before opening a pull request:

```bash
# Frontend
cd frontend
npm run lint
npx tsc --noEmit
npm run build

# Backend
cd ../backend
go test ./...

# Repository/deployment validation
cd ..
docker compose config --quiet
kubectl kustomize infra/k8s
```

## Repository map

```text
backend/       Go API, repositories, services and database migrations
frontend/      Next.js web application
docs/          Architecture, API, ERD, flows and product documentation
infra/k8s/     Kubernetes manifests and k9s quick start
docker-compose.yml
.env.example
```

Useful documentation:

- [`docs/architecture.md`](docs/architecture.md)
- [`docs/erd.md`](docs/erd.md)
- [`docs/learning-data-model.md`](docs/learning-data-model.md)
- [`docs/auth-flow.md`](docs/auth-flow.md)
- [`docs/roadmap.md`](docs/roadmap.md)

## Contributing

Bug reports, improvements and pull requests are welcome. Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before making a change. Every contribution should preserve UTF-8 correctness, keep user-facing actions functional, add or update tests where appropriate and pass the quality checks above.

## Code of Conduct

Participation in this project is governed by [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). Please use the repository's GitHub contact channels to report unacceptable behavior.

## License

This project is released under the [MIT License](LICENSE).
