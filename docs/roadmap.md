# Implementation roadmap

## Delivered in this foundation

- architecture artefacts and language-neutral MySQL model;
- Go HTTP API with health/readiness, dictionary search/detail, vocabulary save/list/remove and dashboard summary;
- MySQL migrations and copyright-safe seed content;
- Redis cache-aside layer;
- Next.js responsive learner shell with dashboard, dictionary, vocabulary, review and catalogue surfaces;
- Docker Compose, production Dockerfiles and Kubernetes manifests.

## Next increments

1. Auth and onboarding with refresh-token rotation.
2. Dictionary import pipeline, richer relations, audio and fuzzy search.
3. FSRS review scheduler, grammar lessons, course enrollment and progress events.
4. Listening/reading lesson players and writing editor with provider-backed AI.
5. Speaking recorder, STT/TTS and pronunciation assessment.
6. Admin editor, analytics, subscriptions, PWA offline cache and SEO dictionary pages.

## Definition of done for each module

- real API and persistence path;
- loading, empty, error and unauthorized states;
- mobile and keyboard accessibility review;
- unit/integration/API/component/E2E coverage appropriate to risk;
- metrics, logs and rate limits before production exposure.
