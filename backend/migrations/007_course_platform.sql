USE multilanguage;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Review workflow: instructors submit (pending), admins approve (published)
-- or reject (back to draft with a note explaining why).
ALTER TABLE courses
  MODIFY COLUMN status ENUM('draft', 'pending', 'published', 'archived') NOT NULL DEFAULT 'draft',
  ADD COLUMN review_note VARCHAR(500) NOT NULL DEFAULT '' AFTER status,
  ADD COLUMN cover_image_url VARCHAR(500) NULL AFTER review_note;

-- Skills a course trains (listening/speaking/reading/writing/vocabulary/grammar).
CREATE TABLE IF NOT EXISTS course_skills (
  id CHAR(36) PRIMARY KEY,
  course_id CHAR(36) NOT NULL,
  skill ENUM('listening', 'speaking', 'reading', 'writing', 'vocabulary', 'grammar') NOT NULL,
  note VARCHAR(300) NOT NULL DEFAULT '',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_course_skill (course_id, skill),
  FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lessons train one skill and carry an illustrative image.
ALTER TABLE lessons
  ADD COLUMN skill VARCHAR(20) NULL AFTER unit_id,
  ADD COLUMN image_url VARCHAR(500) NULL AFTER video_url;

-- Mini quiz questions shown inside a lesson.
CREATE TABLE IF NOT EXISTS quiz_questions (
  id CHAR(36) PRIMARY KEY,
  lesson_id CHAR(36) NOT NULL,
  question_order INT UNSIGNED NOT NULL DEFAULT 1,
  question VARCHAR(500) NOT NULL,
  options JSON NOT NULL,
  correct_index TINYINT UNSIGNED NOT NULL DEFAULT 0,
  explanation VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_quiz_order (lesson_id, question_order),
  KEY idx_quiz_lesson (lesson_id),
  FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Final exam per course.
CREATE TABLE IF NOT EXISTS exams (
  id CHAR(36) PRIMARY KEY,
  course_id CHAR(36) NOT NULL,
  title VARCHAR(180) NOT NULL,
  description VARCHAR(500) NOT NULL DEFAULT '',
  pass_score TINYINT UNSIGNED NOT NULL DEFAULT 70,
  duration_minutes INT UNSIGNED NOT NULL DEFAULT 20,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  KEY idx_exams_course (course_id),
  FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS exam_questions (
  id CHAR(36) PRIMARY KEY,
  exam_id CHAR(36) NOT NULL,
  question_order INT UNSIGNED NOT NULL DEFAULT 1,
  question VARCHAR(500) NOT NULL,
  options JSON NOT NULL,
  correct_index TINYINT UNSIGNED NOT NULL DEFAULT 0,
  explanation VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_examq_order (exam_id, question_order),
  FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS exam_attempts (
  id CHAR(36) PRIMARY KEY,
  exam_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  score TINYINT UNSIGNED NOT NULL,
  passed BOOLEAN NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  KEY idx_attempts_user (user_id),
  KEY idx_attempts_exam (exam_id),
  FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Seed: skills for existing courses, one mini quiz, one final exam.
-- ---------------------------------------------------------------------------

INSERT IGNORE INTO course_skills (id, course_id, skill, note) VALUES
  ('80000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'speaking', 'Everyday conversation builders in every unit.'),
  ('80000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'listening', 'Stress and content-word listening drills.'),
  ('80000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'vocabulary', 'Academic word families with spaced review.'),
  ('80000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 'writing', 'Claims, hedges, and the four-move essay skeleton.'),
  ('80000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', 'reading', 'Evidence-driven reading of academic texts.');

INSERT IGNORE INTO quiz_questions (id, lesson_id, question_order, question, options, correct_index, explanation) VALUES
  ('81000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002',
   1, 'Which sentence talks about experience without saying exactly when?',
   JSON_ARRAY('I visited Singapore last year.', 'I have visited Singapore twice.', 'I will visit Singapore.', 'I am visiting Singapore.'),
   1, 'Have + past participle connects past experience to now, with no exact time.'),
  ('81000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000002',
   2, 'Complete: She ___ English since 2023.',
   JSON_ARRAY('studies', 'studied', 'has studied', 'is studying'),
   2, '"Since 2023" is a duration that continues to now, so use the present perfect.');

INSERT IGNORE INTO exams (id, course_id, title, description, pass_score, duration_minutes, status) VALUES
  ('82000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
   'English B1 · Final Check', 'Ten minutes covering small talk, present perfect, and listening strategy.', 70, 15, 'published');

INSERT IGNORE INTO exam_questions (id, exam_id, question_order, question, options, correct_index, explanation) VALUES
  ('83000000-0000-0000-0000-000000000001', '82000000-0000-0000-0000-000000000001',
   1, 'Which opener invites the longest answer?',
   JSON_ARRAY('Did you have a good week?', 'What have you been up to?', 'Is it raining?', 'See you later.'),
   1, 'Open questions starting with "what" invite stories.'),
  ('83000000-0000-0000-0000-000000000002', '82000000-0000-0000-0000-000000000001',
   2, 'Choose the stressed-word listening habit.',
   JSON_ARRAY('Write every word you hear', 'Note only the stressed content words', 'Translate in your head', 'Slow the audio to half speed'),
   1, 'English rhythm carries meaning on stressed content words.');

UPDATE courses c SET
  lesson_count = (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id AND l.status = 'published')
WHERE c.id IN ('30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003');
