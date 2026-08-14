USE multilanguage;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL,
  role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  email_verified_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at DATETIME(6) NULL,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS languages (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(8) NOT NULL,
  name VARCHAR(80) NOT NULL,
  native_name VARCHAR(80) NOT NULL,
  flag_emoji VARCHAR(8) NOT NULL DEFAULT '🌐',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_languages_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id CHAR(36) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL DEFAULT 'Learner',
  native_language_id CHAR(36) NULL,
  learning_goal VARCHAR(80) NOT NULL DEFAULT 'General Communication',
  timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  preferred_accent VARCHAR(12) NOT NULL DEFAULT 'US',
  avatar_url VARCHAR(500) NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (native_language_id) REFERENCES languages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_languages (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  language_id CHAR(36) NOT NULL,
  cefr_level VARCHAR(4) NOT NULL DEFAULT 'A1',
  daily_goal INT NOT NULL DEFAULT 50,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_user_languages (user_id, language_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (language_id) REFERENCES languages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dictionary_entries (
  id CHAR(36) PRIMARY KEY,
  language_id CHAR(36) NOT NULL,
  word VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  lemma VARCHAR(160) NOT NULL,
  ipa VARCHAR(160) NOT NULL DEFAULT '',
  part_of_speech VARCHAR(40) NOT NULL DEFAULT 'word',
  cefr VARCHAR(4) NOT NULL DEFAULT 'B1',
  academic_level VARCHAR(20) NOT NULL DEFAULT 'General',
  frequency TINYINT UNSIGNED NOT NULL DEFAULT 50,
  domain VARCHAR(80) NOT NULL DEFAULT 'General',
  formality VARCHAR(20) NOT NULL DEFAULT 'neutral',
  register_name VARCHAR(40) NOT NULL DEFAULT 'standard',
  usage_notes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at DATETIME(6) NULL,
  UNIQUE KEY uq_dictionary_language_slug (language_id, slug),
  KEY idx_dictionary_language_word (language_id, word),
  FULLTEXT KEY ft_dictionary_word_lemma (word, lemma),
  FOREIGN KEY (language_id) REFERENCES languages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS word_meanings (
  id CHAR(36) PRIMARY KEY,
  entry_id CHAR(36) NOT NULL,
  sense_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  definition TEXT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_meaning_order (entry_id, sense_order),
  FOREIGN KEY (entry_id) REFERENCES dictionary_entries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS word_translations (
  id CHAR(36) PRIMARY KEY,
  meaning_id CHAR(36) NOT NULL,
  language_id CHAR(36) NOT NULL,
  translation VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_translation_language (meaning_id, language_id),
  FOREIGN KEY (meaning_id) REFERENCES word_meanings(id) ON DELETE CASCADE,
  FOREIGN KEY (language_id) REFERENCES languages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS word_examples (
  id CHAR(36) PRIMARY KEY,
  meaning_id CHAR(36) NOT NULL,
  example_order SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  sentence TEXT NOT NULL,
  translation TEXT NULL,
  FOREIGN KEY (meaning_id) REFERENCES word_meanings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS word_pronunciations (
  id CHAR(36) PRIMARY KEY,
  entry_id CHAR(36) NOT NULL,
  accent ENUM('UK', 'US', 'AU', 'OTHER') NOT NULL DEFAULT 'US',
  ipa VARCHAR(160) NOT NULL,
  audio_url VARCHAR(500) NULL,
  UNIQUE KEY uq_pronunciation_accent (entry_id, accent),
  FOREIGN KEY (entry_id) REFERENCES dictionary_entries(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vocabulary_items (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  entry_id CHAR(36) NOT NULL,
  note TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at DATETIME(6) NULL,
  UNIQUE KEY uq_vocabulary_user_entry (user_id, entry_id),
  KEY idx_vocabulary_user_created (user_id, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (entry_id) REFERENCES dictionary_entries(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS review_schedules (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  vocabulary_item_id CHAR(36) NOT NULL,
  mastery DECIMAL(4,3) NOT NULL DEFAULT 0.000,
  difficulty DECIMAL(4,3) NOT NULL DEFAULT 0.500,
  error_rate DECIMAL(4,3) NOT NULL DEFAULT 0.000,
  confidence DECIMAL(4,3) NOT NULL DEFAULT 0.500,
  response_time_ms INT UNSIGNED NOT NULL DEFAULT 0,
  last_reviewed_at DATETIME(6) NULL,
  next_review_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_review_vocabulary (vocabulary_item_id),
  KEY idx_review_due (user_id, next_review_at),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (vocabulary_item_id) REFERENCES vocabulary_items(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS learning_sessions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  language_id CHAR(36) NOT NULL,
  minutes INT UNSIGNED NOT NULL DEFAULT 0,
  xp INT UNSIGNED NOT NULL DEFAULT 0,
  skill VARCHAR(30) NOT NULL DEFAULT 'review',
  studied_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  KEY idx_sessions_user_day (user_id, studied_at),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (language_id) REFERENCES languages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS grammar_topics (
  id CHAR(36) PRIMARY KEY,
  language_id CHAR(36) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  title VARCHAR(180) NOT NULL,
  cefr VARCHAR(4) NOT NULL,
  summary TEXT NOT NULL,
  UNIQUE KEY uq_grammar_language_slug (language_id, slug),
  FOREIGN KEY (language_id) REFERENCES languages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courses (
  id CHAR(36) PRIMARY KEY,
  language_id CHAR(36) NOT NULL,
  slug VARCHAR(180) NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  cefr VARCHAR(4) NOT NULL,
  lesson_count INT UNSIGNED NOT NULL DEFAULT 0,
  duration_minutes INT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_course_language_slug (language_id, slug),
  FOREIGN KEY (language_id) REFERENCES languages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_units (
  id CHAR(36) PRIMARY KEY,
  course_id CHAR(36) NOT NULL,
  unit_order INT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  UNIQUE KEY uq_course_unit_order (course_id, unit_order),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
