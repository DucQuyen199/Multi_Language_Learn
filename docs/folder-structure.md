# Folder structure

```text
multi-language/
├─ backend/
│  ├─ cmd/api/main.go
│  ├─ internal/{config,database,http,dictionary,vocabulary,dashboard}
│  ├─ migrations/
│  ├─ Dockerfile
│  └─ go.mod
├─ frontend/
│  ├─ app/
│  ├─ components/
│  ├─ lib/
│  ├─ public/
│  ├─ Dockerfile
│  └─ package.json
├─ infra/
│  ├─ mysql/init/
│  └─ k8s/
├─ docs/
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

Frontend components are presentational where possible; API calls live in `frontend/lib/api.ts`. Backend SQL is kept in migrations and repositories. Infrastructure manifests do not contain secrets.
