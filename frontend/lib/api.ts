export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message: string | null;
  error?: { code: string; message: string };
};

export type SearchResult = {
  id: string;
  language_code: string;
  word: string;
  slug: string;
  ipa: string;
  part_of_speech: string;
  cefr: string;
  frequency: number;
  definition: string;
  translation: string;
};

export type Meaning = {
  id: string;
  order: number;
  definition: string;
  translations: string[];
  examples: { id: string; sentence: string; translation: string }[];
};

export type DictionaryEntry = {
  id: string;
  language_code: string;
  language_name: string;
  word: string;
  slug: string;
  lemma: string;
  ipa: string;
  part_of_speech: string;
  cefr: string;
  academic_level: string;
  frequency: number;
  domain: string;
  formality: string;
  meanings: Meaning[];
  pronunciations: { accent: string; ipa: string; audio_url: string }[];
};

export type VocabularyItem = {
  id: string;
  entry_id: string;
  word: string;
  ipa: string;
  part_of_speech: string;
  cefr: string;
  translation: string;
  note: string;
  mastery: number;
  next_review_at: string;
  created_at: string;
};

export type DashboardSummary = {
  greeting: string;
  target_language: string;
  daily_xp: number;
  daily_goal: number;
  streak_days: number;
  study_minutes: number;
  words_learned: number;
  due_reviews: number;
  current_level: string;
  level_progress: number;
  skills: { listening: number; speaking: number; reading: number; writing: number };
};

export type GrammarTopic = { id: string; slug: string; title: string; cefr: string; summary: string };
export type Course = { id: string; slug: string; title: string; description: string; cefr: string; lesson_count: number; duration_minutes: number };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message ?? "Something went wrong. Try again.");
  }
  return payload.data;
}

export const api = {
  search: (query: string, language = "en") =>
    request<SearchResult[]>(`/api/dictionary/search?q=${encodeURIComponent(query)}&language=${language}`),
  entry: (language: string, slug: string) => request<DictionaryEntry>(`/api/dictionary/${language}/${slug}`),
  dashboard: (language = "en") => request<DashboardSummary>(`/api/dashboard?language=${language}`),
  vocabulary: () => request<VocabularyItem[]>("/api/vocabulary"),
  saveVocabulary: (entryId: string, note = "") =>
    request<VocabularyItem>("/api/vocabulary", { method: "POST", body: JSON.stringify({ entry_id: entryId, note }) }),
  removeVocabulary: (entryId: string) =>
    request<{ removed: boolean }>(`/api/vocabulary/${entryId}`, { method: "DELETE" }),
  grammar: (level = "") => request<GrammarTopic[]>(`/api/grammar?language=en${level ? `&level=${level}` : ""}`),
  courses: () => request<Course[]>("/api/courses?language=en"),
  review: (reviewId: string, rating: string) => request<{ review_id: string; rating: string; next_review_in_days: number }>(`/api/review/${reviewId}`, { method: "POST", body: JSON.stringify({ rating }) }),
};
