# AI and speech architecture

## Provider interfaces

```go
type AIProvider interface {
    Chat(ctx context.Context, input ChatInput) (ChatOutput, error)
    AnalyzeWriting(ctx context.Context, input WritingInput) (WritingFeedback, error)
    ExplainWord(ctx context.Context, input WordInput) (Explanation, error)
    GenerateExercise(ctx context.Context, input ExerciseInput) (Exercise, error)
}

type SpeechToTextProvider interface { Transcribe(context.Context, AudioInput) (Transcript, error) }
type TextToSpeechProvider interface { Synthesize(context.Context, TTSInput) (AudioAsset, error) }
type PronunciationAssessmentProvider interface { Assess(context.Context, PronunciationInput) (Assessment, error) }
```

The backend selects providers from `AI_PROVIDER`, `STT_PROVIDER`, `TTS_PROVIDER` and `PRONUNCIATION_PROVIDER`. A deterministic local provider can return a clear `provider_not_configured` error while keeping the application healthy; no API key is ever shipped to Next.js.

## Speech UX states

`idle → requesting-permission → recording → uploading → analyzing → feedback → try-again`.

The frontend must expose microphone permission errors, a keyboard-accessible stop action, audio playback and an explicit transcript. Waveform rendering is progressive enhancement, not a prerequisite for recording.
