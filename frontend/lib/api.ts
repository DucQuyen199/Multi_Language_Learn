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

export type CourseCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cefr: string;
  language_code: string;
  language_name: string;
  flag_emoji: string;
  instructor_id: string;
  instructor_name: string;
  lesson_count: number;
  duration_minutes: number;
  enrollment_count: number;
  status: string;
  is_enrolled: boolean;
  completed_lessons: number;
  progress: number;
  skills: string[];
  exam_id: string;
  exam_title: string;
  exam_pass_score: number;
};

export type LessonSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  duration_minutes: number;
  lesson_order: number;
  completed: boolean;
  score: number | null;
  completed_at: string | null;
};

export type LearnerQuestion = { id: string; order: number; question: string; options: string[] };

export type GradedAnswer = {
  question_id: string;
  choice: number;
  correct_index: number;
  is_correct: boolean;
  explanation: string;
};

export type QuizResult = {
  score: number;
  correct: number;
  total: number;
  details: GradedAnswer[];
  lesson_done: boolean;
};

export type LearnerExam = {
  id: string;
  course_id: string;
  course_title: string;
  course_slug: string;
  title: string;
  description: string;
  pass_score: number;
  duration_minutes: number;
  question_count: number;
  questions: LearnerQuestion[];
  best_score: number | null;
  passed: boolean;
};

export type ExamResult = {
  attempt_id: string;
  score: number;
  passed: boolean;
  pass_score: number;
  correct: number;
  total: number;
  details: GradedAnswer[];
};

export type CourseDetail = {
  course: CourseCard;
  lessons: LessonSummary[];
  next_lesson: LessonSummary | null;
};

export type LessonDetail = {
  id: string;
  course_id: string;
  course_slug: string;
  course_title: string;
  title: string;
  summary: string;
  content: string;
  video_url: string;
  image_url: string;
  skill: string;
  duration_minutes: number;
  lesson_order: number;
  completed: boolean;
  score: number | null;
  questions: LearnerQuestion[];
};

export type AdminOverview = {
  users: { total: number; students: number; instructors: number; admins: number; new_this_week: number };
  courses: { total: number; published: number; draft: number; archived: number };
  lessons: number;
  enrollments: number;
  lesson_completions: number;
  dictionary_words: number;
  active_learners_today: number;
  recent_users: AdminAccount[];
  recent_enrollments: { id: string; student_name: string; student_email: string; course_title: string; instructor_name: string; enrolled_at: string }[];
};

export type AdminAccount = {
  id: string;
  email: string;
  first_name: string;
  role: string;
  email_verified: boolean;
  created_at: string;
  enrolled_courses: number;
  teaching_courses: number;
  completed_lessons: number;
};

export type AdminUserList = { items: AdminAccount[]; total: number; limit: number; offset: number };

export type AdminCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cefr: string;
  status: string;
  review_note: string;
  language_code: string;
  instructor_id: string;
  instructor_name: string;
  lesson_count: number;
  duration_minutes: number;
  enrollment_count: number;
};

export type AdminLanguage = {
  id: string;
  code: string;
  name: string;
  native_name: string;
  flag_emoji: string;
  is_active: boolean;
  word_count: number;
  course_count: number;
  learner_count: number;
};

export type InstructorCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  cefr: string;
  status: string;
  review_note: string;
  cover_image_url: string;
  language_code: string;
  language_name: string;
  flag_emoji: string;
  lesson_count: number;
  duration_minutes: number;
  enrollment_count: number;
  completion_count: number;
  avg_progress: number;
  skills: string[];
  exam_count: number;
  created_at: string;
};

export type InstructorLesson = {
  id: string;
  course_id: string;
  course_title: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  video_url: string;
  image_url: string;
  skill: string;
  duration_minutes: number;
  lesson_order: number;
  status: string;
  completion_count: number;
  question_count: number;
  updated_at: string;
};

export type AuthorQuestion = {
  id: string;
  order: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
};

export type QuestionInput = { question: string; options: string[]; correct_index: number; explanation?: string };

export type InstructorExam = {
  id: string;
  course_id: string;
  course_title: string;
  title: string;
  description: string;
  pass_score: number;
  duration_minutes: number;
  status: string;
  question_count: number;
};

export type InstructorStudent = {
  id: string;
  name: string;
  email: string;
  course_id: string;
  course_title: string;
  lessons_completed: number;
  lessons_total: number;
  progress: number;
  enrolled_at: string;
  last_activity: string | null;
};

export type InstructorOverview = {
  course_count: number;
  published_count: number;
  lesson_count: number;
  student_count: number;
  total_completions: number;
  avg_progress: number;
  top_courses: InstructorCourse[];
  recent_students: InstructorStudent[];
};

let accessToken: string | null = null;
let refreshPromise: Promise<AuthSession | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export function workspacePathForRole(role: string): string {
  if (role === "admin") return "/admin";
  if (role === "instructor") return "/instructor";
  return "/app/dashboard";
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
  review: (reviewId: string, rating: string) => request<{ review_id: string; rating: string; next_review_in_days: number }>(`/api/review/${reviewId}`, { method: "POST", body: JSON.stringify({ rating }) }),

  // Learner course path
  courses: (language = "en") => request<CourseCard[]>(`/api/courses?language=${language}`),
  courseDetail: (slug: string) => request<CourseDetail>(`/api/courses/${encodeURIComponent(slug)}`),
  myCourses: () => request<CourseCard[]>("/api/enrollments"),
  enroll: (courseIdOrSlug: string) =>
    request<CourseCard>("/api/enrollments", { method: "POST", body: JSON.stringify({ course_id: courseIdOrSlug }) }),
  unenroll: (courseIdOrSlug: string) =>
    request<{ unenrolled: boolean }>(`/api/enrollments/${encodeURIComponent(courseIdOrSlug)}`, { method: "DELETE" }),
  lesson: (lessonId: string) => request<LessonDetail>(`/api/lessons/${lessonId}`),
  completeLesson: (lessonId: string, score?: number) =>
    request<LessonDetail>(`/api/lessons/${lessonId}/complete`, { method: "POST", body: JSON.stringify(score === undefined ? {} : { score }) }),
  submitLessonQuiz: (lessonId: string, answers: { question_id: string; choice: number }[]) =>
    request<QuizResult>(`/api/lessons/${lessonId}/quiz`, { method: "POST", body: JSON.stringify({ answers }) }),
  exam: (examId: string) => request<LearnerExam>(`/api/exams/${examId}`),
  submitExam: (examId: string, answers: { question_id: string; choice: number }[]) =>
    request<ExamResult>(`/api/exams/${examId}/attempt`, { method: "POST", body: JSON.stringify({ answers }) }),

  // Admin console
  admin: {
    overview: () => request<AdminOverview>("/api/admin/overview"),
    users: (params: { role?: string; q?: string; limit?: number; offset?: number } = {}) => {
      const search = new URLSearchParams();
      if (params.role) search.set("role", params.role);
      if (params.q) search.set("q", params.q);
      if (params.limit) search.set("limit", String(params.limit));
      if (params.offset) search.set("offset", String(params.offset));
      return request<AdminUserList>(`/api/admin/users?${search.toString()}`);
    },
    updateUser: (userId: string, input: { role?: string; first_name?: string }) =>
      request<AdminAccount>(`/api/admin/users/${userId}`, { method: "PATCH", body: JSON.stringify(input) }),
    deleteUser: (userId: string) =>
      request<{ deleted: boolean }>(`/api/admin/users/${userId}`, { method: "DELETE" }),
    courses: () => request<AdminCourse[]>("/api/admin/courses"),
    updateCourseStatus: (courseId: string, status: string) =>
      request<{ id: string; status: string }>(`/api/admin/courses/${courseId}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    reviewCourse: (courseId: string, action: "approve" | "reject", note = "") =>
      request<AdminCourse>(`/api/admin/courses/${courseId}/review`, { method: "POST", body: JSON.stringify({ action, note }) }),
    languages: () => request<AdminLanguage[]>("/api/admin/languages"),
    updateLanguage: (languageId: string, isActive: boolean) =>
      request<{ is_active: boolean }>(`/api/admin/languages/${languageId}`, { method: "PATCH", body: JSON.stringify({ is_active: isActive }) }),
  },

  // Instructor studio
  instructor: {
    overview: () => request<InstructorOverview>("/api/instructor/overview"),
    courses: () => request<InstructorCourse[]>("/api/instructor/courses"),
    createCourse: (input: { language_code: string; title: string; description: string; cefr: string }) =>
      request<InstructorCourse>("/api/instructor/courses", { method: "POST", body: JSON.stringify(input) }),
    updateCourse: (courseId: string, input: { title?: string; description?: string; cefr?: string; status?: string; cover_image_url?: string }) =>
      request<InstructorCourse>(`/api/instructor/courses/${courseId}`, { method: "PATCH", body: JSON.stringify(input) }),
    setSkills: (courseId: string, skills: { skill: string; note: string }[]) =>
      request<{ skill: string; note: string }[]>(`/api/instructor/courses/${courseId}/skills`, { method: "PUT", body: JSON.stringify({ skills }) }),
    lessons: (courseId: string) => request<InstructorLesson[]>(`/api/instructor/courses/${courseId}/lessons`),
    createLesson: (courseId: string, input: { title: string; summary?: string; content: string; video_url?: string; image_url?: string; skill?: string; duration_minutes?: number; lesson_order?: number; status?: string }) =>
      request<InstructorLesson>(`/api/instructor/courses/${courseId}/lessons`, { method: "POST", body: JSON.stringify(input) }),
    updateLesson: (lessonId: string, input: { title: string; summary?: string; content: string; video_url?: string; image_url?: string; skill?: string; duration_minutes?: number; lesson_order?: number; status?: string }) =>
      request<InstructorLesson>(`/api/instructor/lessons/${lessonId}`, { method: "PATCH", body: JSON.stringify(input) }),
    deleteLesson: (lessonId: string) =>
      request<{ deleted: boolean }>(`/api/instructor/lessons/${lessonId}`, { method: "DELETE" }),
    lessonQuestions: (lessonId: string) => request<AuthorQuestion[]>(`/api/instructor/lessons/${lessonId}/questions`),
    addLessonQuestion: (lessonId: string, input: QuestionInput) =>
      request<AuthorQuestion>(`/api/instructor/lessons/${lessonId}/questions`, { method: "POST", body: JSON.stringify(input) }),
    deleteLessonQuestion: (questionId: string) =>
      request<{ deleted: boolean }>(`/api/instructor/questions/${questionId}`, { method: "DELETE" }),
    exams: (courseId: string) => request<InstructorExam[]>(`/api/instructor/courses/${courseId}/exams`),
    createExam: (courseId: string, input: { title: string; description?: string; pass_score?: number; duration_minutes?: number; status?: string }) =>
      request<InstructorExam>(`/api/instructor/courses/${courseId}/exams`, { method: "POST", body: JSON.stringify(input) }),
    updateExam: (examId: string, input: { title?: string; description?: string; pass_score?: number; duration_minutes?: number; status?: string }) =>
      request<InstructorExam>(`/api/instructor/exams/${examId}`, { method: "PATCH", body: JSON.stringify(input) }),
    deleteExam: (examId: string) =>
      request<{ deleted: boolean }>(`/api/instructor/exams/${examId}`, { method: "DELETE" }),
    examQuestions: (examId: string) => request<AuthorQuestion[]>(`/api/instructor/exams/${examId}/questions`),
    addExamQuestion: (examId: string, input: QuestionInput) =>
      request<AuthorQuestion>(`/api/instructor/exams/${examId}/questions`, { method: "POST", body: JSON.stringify(input) }),
    deleteExamQuestion: (questionId: string) =>
      request<{ deleted: boolean }>(`/api/instructor/exam-questions/${questionId}`, { method: "DELETE" }),
    students: () => request<InstructorStudent[]>("/api/instructor/students"),
  },
};
