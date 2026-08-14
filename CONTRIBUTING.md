# Contributing to Multi Language Learn

Thank you for helping improve Multi Language Learn. Contributions should be small, reviewable and focused on a clear user or engineering outcome.

## Before you start

1. Search existing issues and documentation.
2. For a larger change, open an issue first so the design and scope are clear.
3. Do not include passwords, API keys, `.env` files, production data or private user information in a commit.

## Development flow

```bash
git checkout -b feat/short-description
docker compose up -d --build
```

Make the change, keep the frontend action and API behavior connected, and update documentation when a command, endpoint or deployment setting changes.

## Required checks

```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build

cd ../backend
go test ./...

cd ..
docker compose config --quiet
kubectl kustomize infra/k8s
```

If a check cannot be run locally, explain why in the pull request.

## Pull requests

Please include:

- a short summary of the problem and solution;
- screenshots or a short recording for UI changes;
- API, migration and configuration notes when relevant;
- test commands and their results;
- any follow-up work or known limitations.

Use clear commit messages such as `feat: add vocabulary review action`, `fix: preserve UTF-8 seed data` or `docs: update local setup`.

## Reporting security issues

Do not open a public issue for a suspected vulnerability. Contact the maintainers privately through the GitHub repository so the issue can be assessed and fixed responsibly.
