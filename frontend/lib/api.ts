export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message: string | null;
  error?: { code: string; message: string };
};

export type AuthUser = {
  id: string;
  email: string;
  first_name: string;
  role: string;
  email_verified: boolean;
};

export type AuthSession = {
  user: AuthUser;
  access_token: string;
  expires_in: number;
};

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code = "API_ERROR") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

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

let accessToken: string | null = null;
let refreshPromise: Promise<AuthSession | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export async function refreshSession(): Promise<AuthSession | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      const payload = (await response.json()) as ApiEnvelope<AuthSession>;
      if (!response.ok || !payload.success || !payload.data?.access_token) {
        clearAccessToken();
        return null;
      }
      setAccessToken(payload.data.access_token);
      return payload.data;
    } catch {
      clearAccessToken();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function request<T>(path: string, init?: RequestInit, retryOnUnauthorized = true): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (accessToken && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (response.status === 401 && retryOnUnauthorized && !path.startsWith("/api/auth/")) {
    const session = await refreshSession();
    if (session) return request(path, init, false);
  }
  if (!response.ok || !payload.success) {
    throw new ApiError(payload.error?.message ?? "Something went wrong. Try again.", response.status, payload.error?.code);
  }
  return payload.data;
}

export const api = {
  auth: {
    register: (input: { email: string; password: string; first_name?: string }) =>
      request<AuthSession>("/api/auth/register", { method: "POST", body: JSON.stringify(input) }),
    login: (input: { email: string; password: string }) =>
      request<AuthSession>("/api/auth/login", { method: "POST", body: JSON.stringify(input) }),
    logout: () => request<{ logged_out: boolean }>("/api/auth/logout", { method: "POST" }),
    me: () => request<AuthUser>("/api/auth/me"),
  },
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
