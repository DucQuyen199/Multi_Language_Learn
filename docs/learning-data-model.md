# Learning data model

Each `user_languages` row is an independent learning context. A user can be B2 in English and N5 in Japanese without sharing review schedules or skill scores.

## Knowledge item

```text
knowledge_item = {
  user_language_id,
  source_type: vocabulary | grammar | listening | speaking | reading | writing,
  source_id,
  mastery: 0.0..1.0,
  difficulty: 0.0..1.0,
  confidence: 0.0..1.0,
  error_rate: 0.0..1.0,
  response_time_ms,
  last_reviewed_at,
  next_review_at
}
```

Review events are append-only in the long term. The `review_schedules` projection is optimized for due-item queries. The first implementation stores vocabulary review metadata and exposes the review boundary so FSRS or SM-2 can be added without changing the UI contract.

## Recommendation inputs

- weak skill score;
- due review count;
- recent errors;
- current CEFR and goal;
- available daily minutes;
- recent study sessions.
