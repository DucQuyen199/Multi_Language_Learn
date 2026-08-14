# UI sitemap and primary journeys

## Public

```text
/
├─ /dictionary
├─ /dictionary/[language]/[slug]
├─ /translate
├─ /courses
├─ /login
└─ /register
```

## Learner workspace

```text
/app
├─ /dashboard
├─ /vocabulary
├─ /flashcards
├─ /grammar
├─ /listening
├─ /speaking
├─ /reading
├─ /writing
├─ /courses/[slug]
├─ /ai-tutor
├─ /progress
├─ /review
├─ /notebook
├─ /profile
└─ /settings
```

The initial slice renders the dashboard shell, dictionary workspace, vocabulary collection, review flashcard, grammar/course catalogue cards and four-skills launch cards. Each new route must preserve loading, empty, error, unauthorized and responsive states.

## Authentication flow

```text
Register/Login
  → verify email (Phase 2)
  → choose native + target language
  → choose goal + daily minutes
  → optional placement test
  → personalized dashboard
```

## Keyboard map

- `Ctrl/Cmd + K`: global command search.
- `D`: dictionary.
- `V`: vocabulary.
- `L`: listening.
- `S`: speaking.
- `R`: reading.
- `W`: writing.

Shortcuts are disabled while a text input, textarea or contenteditable element has focus.
