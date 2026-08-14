const messages = {
  en: {
    brand: "Lingua Atlas",
    nav: {
      overview: "Overview",
      dictionary: "Dictionary",
      vocabulary: "Vocabulary",
      grammar: "Grammar",
      listening: "Listening",
      speaking: "Speaking",
      reading: "Reading",
      writing: "Writing",
      flashcards: "Flashcards",
      courses: "Courses",
      aiTutor: "AI Tutor",
      progress: "Progress",
      notebook: "Notebook",
      settings: "Settings",
    },
    common: {
      explore: "Explore dictionary",
      continue: "Continue learning",
      viewAll: "View all",
      today: "Today",
      minutes: "minutes",
      words: "words",
      save: "Save word",
      saved: "Saved",
      loading: "Loading your learning space…",
      retry: "Try again",
    },
  },
  vi: {
    brand: "Lingua Atlas",
    nav: { overview: "Tổng quan", dictionary: "Từ điển", vocabulary: "Từ vựng", grammar: "Ngữ pháp", listening: "Nghe", speaking: "Nói", reading: "Đọc", writing: "Viết", flashcards: "Flashcard", courses: "Khóa học", aiTutor: "Gia sư AI", progress: "Tiến độ", notebook: "Sổ tay", settings: "Cài đặt" },
    common: { explore: "Khám phá từ điển", continue: "Tiếp tục học", viewAll: "Xem tất cả", today: "Hôm nay", minutes: "phút", words: "từ", save: "Lưu từ", saved: "Đã lưu", loading: "Đang tải không gian học…", retry: "Thử lại" },
  },
} as const;

export type Locale = keyof typeof messages;

export function t(key: string, locale: Locale = "en"): string {
  const value = key.split(".").reduce<unknown>((current, part) => {
    if (current && typeof current === "object" && part in current) {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages[locale]);
  return typeof value === "string" ? value : key;
}
