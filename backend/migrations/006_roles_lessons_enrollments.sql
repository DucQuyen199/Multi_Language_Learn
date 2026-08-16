USE multilanguage;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Instructors join admins and students as first-class platform roles.
ALTER TABLE users
  MODIFY COLUMN role ENUM('student', 'instructor', 'admin') NOT NULL DEFAULT 'student';

ALTER TABLE user_profiles
  ADD COLUMN headline VARCHAR(140) NOT NULL DEFAULT '' AFTER first_name,
  ADD COLUMN bio VARCHAR(600) NOT NULL DEFAULT '' AFTER headline;

ALTER TABLE courses
  ADD COLUMN instructor_id CHAR(36) NULL AFTER language_id,
  ADD COLUMN status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published' AFTER duration_minutes,
  ADD COLUMN created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) AFTER status,
  ADD COLUMN updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) AFTER created_at,
  ADD KEY idx_courses_instructor (instructor_id),
  ADD KEY idx_courses_status (status),
  ADD CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id) REFERENCES users (id);

CREATE TABLE IF NOT EXISTS lessons (
  id CHAR(36) PRIMARY KEY,
  course_id CHAR(36) NOT NULL,
  unit_id CHAR(36) NULL,
  slug VARCHAR(180) NOT NULL,
  title VARCHAR(180) NOT NULL,
  summary VARCHAR(500) NOT NULL DEFAULT '',
  content MEDIUMTEXT NOT NULL,
  video_url VARCHAR(500) NULL,
  duration_minutes INT UNSIGNED NOT NULL DEFAULT 10,
  lesson_order INT UNSIGNED NOT NULL DEFAULT 1,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'published',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_lessons_course_slug (course_id, slug),
  KEY idx_lessons_course_order (course_id, lesson_order),
  FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  FOREIGN KEY (unit_id) REFERENCES course_units (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enrollments (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  course_id CHAR(36) NOT NULL,
  enrolled_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_enrollments_user_course (user_id, course_id),
  KEY idx_enrollments_course (course_id),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lesson_completions (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  lesson_id CHAR(36) NOT NULL,
  score TINYINT UNSIGNED NULL,
  completed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_completions_user_lesson (user_id, lesson_id),
  KEY idx_completions_lesson (lesson_id),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Demo accounts. Passwords: Admin1234 / Teacher1234 / Learner1234
-- Hashes are generated with bcrypt (golang.org/x/crypto, default cost).
-- ---------------------------------------------------------------------------

INSERT IGNORE INTO users (id, email, password_hash, role, email_verified_at) VALUES
  ('00000000-0000-0000-0000-0000000000aa', 'admin@lingua.dev', '$2a$10$OOKuMYdGZOdUcuQyq4xaqeIeG/jtlecxVF0sk0USQ9W4ohxonQV9u', 'admin', UTC_TIMESTAMP(6)),
  ('00000000-0000-0000-0000-0000000000ab', 'admin@gmail.com', '$2a$10$vfmquocdclL025kEgLGUOONbdh9s3A4fKnM6VTBUMDCY4KnHFk5/u', 'admin', UTC_TIMESTAMP(6)),
  ('00000000-0000-0000-0000-0000000000b1', 'minh.anh@lingua.dev', '$2a$10$xMyR/Ib4wuLDVDItqUrJwep1GRTK2zTIEBm3y4F6aWeA73vzlbGPa', 'instructor', UTC_TIMESTAMP(6)),
  ('00000000-0000-0000-0000-0000000000b2', 'sofia.reyes@lingua.dev', '$2a$10$xMyR/Ib4wuLDVDItqUrJwep1GRTK2zTIEBm3y4F6aWeA73vzlbGPa', 'instructor', UTC_TIMESTAMP(6)),
  ('00000000-0000-0000-0000-0000000000c1', 'linh@example.com', '$2a$10$pgZ3Sob7xRhDqaSH6dTMPuW37kYWus8Z1iYDVXmeB9tGEZWYgSHWC', 'student', UTC_TIMESTAMP(6)),
  ('00000000-0000-0000-0000-0000000000c2', 'david@example.com', '$2a$10$pgZ3Sob7xRhDqaSH6dTMPuW37kYWus8Z1iYDVXmeB9tGEZWYgSHWC', 'student', UTC_TIMESTAMP(6)),
  ('00000000-0000-0000-0000-0000000000c3', 'yuki@example.com', '$2a$10$pgZ3Sob7xRhDqaSH6dTMPuW37kYWus8Z1iYDVXmeB9tGEZWYgSHWC', 'student', UTC_TIMESTAMP(6));

UPDATE users
SET password_hash = '$2a$10$pgZ3Sob7xRhDqaSH6dTMPuW37kYWus8Z1iYDVXmeB9tGEZWYgSHWC'
WHERE id = '00000000-0000-0000-0000-000000000001' AND (password_hash IS NULL OR password_hash = '');

INSERT IGNORE INTO user_profiles (user_id, first_name, headline, bio, native_language_id, learning_goal) VALUES
  ('00000000-0000-0000-0000-0000000000aa', 'Alex', 'Platform administrator', 'Keeps the LinguaAtlas catalogue healthy and the community safe.', '10000000-0000-0000-0000-000000000002', 'Platform operations'),
  ('00000000-0000-0000-0000-0000000000ab', 'Admin', 'Platform administrator', 'Quản trị viên hệ thống LinguaAtlas.', '10000000-0000-0000-0000-000000000001', 'Platform operations'),
  ('00000000-0000-0000-0000-0000000000b1', 'Minh Anh', 'Senior English instructor · CEFR B1–C1', 'Ten years coaching Vietnamese learners from hesitant A2 to confident B2. Loves corpus-based vocabulary work.', '10000000-0000-0000-0000-000000000001', 'Teach for momentum'),
  ('00000000-0000-0000-0000-0000000000b2', 'Sofia Reyes', 'Academic writing instructor', 'Former IELTS examiner helping students write clear, evidence-driven academic English.', '10000000-0000-0000-0000-000000000006', 'Teach academic clarity'),
  ('00000000-0000-0000-0000-0000000000c1', 'Linh', 'B1 learner', 'Studying English for a software engineering career.', '10000000-0000-0000-0000-000000000001', 'Professional communication'),
  ('00000000-0000-0000-0000-0000000000c2', 'David', 'B1 learner', 'Learning English to travel and work abroad.', '10000000-0000-0000-0000-000000000002', 'General fluency'),
  ('00000000-0000-0000-0000-0000000000c3', 'Yuki', 'B2 learner', 'Preparing for graduate school in Australia.', '10000000-0000-0000-0000-000000000004', 'Academic English');

INSERT IGNORE INTO user_languages (id, user_id, language_id, cefr_level, daily_goal)
VALUES
  (UUID(), '00000000-0000-0000-0000-0000000000c1', '10000000-0000-0000-0000-000000000002', 'B1', 40),
  (UUID(), '00000000-0000-0000-0000-0000000000c2', '10000000-0000-0000-0000-000000000002', 'A2', 30),
  (UUID(), '00000000-0000-0000-0000-0000000000c3', '10000000-0000-0000-0000-000000000002', 'B2', 50);

UPDATE courses SET instructor_id = '00000000-0000-0000-0000-0000000000b1', status = 'published'
WHERE id = '30000000-0000-0000-0000-000000000001';
UPDATE courses SET instructor_id = '00000000-0000-0000-0000-0000000000b2', status = 'published'
WHERE id = '30000000-0000-0000-0000-000000000002';

INSERT IGNORE INTO courses (id, language_id, slug, title, description, cefr, lesson_count, duration_minutes, instructor_id, status) VALUES
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'business-english-b1', 'Business English · Say it with impact', 'Meetings, emails, and negotiations for professionals who need English at work.', 'B1', 3, 90, '00000000-0000-0000-0000-0000000000b1', 'draft');

INSERT IGNORE INTO course_units (id, course_id, unit_order, title) VALUES
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', 1, 'Meetings that move forward');

INSERT IGNORE INTO lessons (id, course_id, unit_id, slug, title, summary, content, duration_minutes, lesson_order, status) VALUES
  ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001',
   'everyday-small-talk', 'Everyday small talk that builds real connections',
   'Open conversations naturally and keep them flowing.',
   '## Notice\nSmall talk is the gateway to real conversation. English speakers use it to test the mood before deeper topics.\n\n## Core phrases\n- "How has your week been?" — open with a time frame.\n- "What have you been up to?" — invite a story.\n- "That sounds great!" — react before you ask more.\n\n## Practice\nStart three conversations this week using one opener above. Write down which reaction worked best and why.\n\n## Quick check\nWhich phrase invites the longest answer: "Did you have a good week?" or "What have you been up to?" — Think about open vs. closed questions.',
   12, 1, 'published'),
  ('50000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001',
   'present-perfect-in-real-life', 'Present perfect in real life',
   'Talk about experience without saying exactly when.',
   '## Notice\n"I have worked here for two years." The action started in the past and still matters now.\n\n## Structure\nsubject + have/has + past participle\n\n## Use it\n1. Experience: "I have visited Singapore twice."\n2. Duration: "She has studied English since 2023."\n3. Change: "Prices have gone up this year."\n\n## Practice\nWrite four sentences about your own life: two about experience, two about duration. Say them out loud twice.',
   15, 2, 'published'),
  ('50000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001',
   'listening-for-key-words', 'Listening for the words that carry meaning',
   'Train your ear on stress and content words.',
   '## Notice\nEnglish rhythm stresses content words: nouns, verbs, adjectives. Function words shrink.\n\n## Technique\n1. Listen once for the topic only.\n2. Listen again and write only stressed words.\n3. Rebuild the sentence from your notes.\n\n## Practice\nUse the dictionary audio on five B1 words. Listen, write the stressed syllable, then check the IPA.',
   10, 3, 'published'),
  ('50000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002',
   'opinions-with-evidence', 'Give opinions people can follow',
   'Structure an opinion: claim, reason, example.',
   '## Notice\nStrong speakers signpost: "I think … because … for example …"\n\n## Frame\n- Claim: "I think remote work saves time."\n- Reason: "because commuting disappears."\n- Example: "For example, I gain two hours daily."\n\n## Practice\nRecord a 60-second opinion about learning languages. Use the three-part frame twice.',
   14, 4, 'published'),
  ('50000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002',
   'past-simple-stories', 'Tell a story in past simple',
   'Chain events naturally with time markers.',
   '## Notice\nStories run on past simple plus time markers: first, then, after that, finally.\n\n## Irregular verbs to master\ngo → went · take → took · think → thought · buy → bought\n\n## Practice\nTell the story of your best day this month in exactly five sentences, one time marker per sentence.',
   12, 5, 'published'),
  ('50000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002',
   'review-routine', 'Build a weekly review routine',
   'Turn what you learned into what you keep.',
   '## Notice\nMemory decays fast without spaced review. Three short beats beat one long session.\n\n## Routine\n1. Monday: add ten new words.\n2. Wednesday: review flashcards due.\n3. Sunday: write eight sentences using this week''s words.\n\n## Practice\nSchedule the three beats in your calendar right now, with reminders.',
   8, 6, 'published'),
  ('50000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003',
   'academic-word-list-core', 'Academic Word List: the core twenty',
   'Own the vocabulary that appears in every paper.',
   '## Notice\nWords like analyse, concept, derive, and framework appear across disciplines. Learn them as families: analyse → analysis → analytical.\n\n## Technique\nGroup by function: research verbs (assess, identify, indicate), structure nouns (framework, context, factor), and stance words (significant, relevant).\n\n## Practice\nWrite one paragraph about your field using at least six AWL words from this lesson.',
   15, 1, 'published'),
  ('50000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003',
   'claims-and-hedges', 'Make claims, then hedge them like a researcher',
   'Balance confidence with caution in academic writing.',
   '## Notice\nResearch rarely says "proves". It says "suggests", "indicates", "appears to".\n\n## Hedge ladder\nstrong → this demonstrates · medium → this suggests · careful → this may indicate\n\n## Practice\nTake three blunt sentences you wrote before and rewrite each one rung lower on the ladder.',
   13, 2, 'published'),
  ('50000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004',
   'essay-skeleton', 'The four-move essay skeleton',
   'Plan an essay that writes itself.',
   '## Notice\nStrong essays move in four steps: position, evidence, counterpoint, implication.\n\n## Skeleton\n1. Position: This essay argues that …\n2. Evidence: Two studies indicate …\n3. Counterpoint: Critics respond that …; however, …\n4. Implication: These findings suggest …\n\n## Practice\nDraft only the four skeleton sentences for your next essay before writing anything else.',
   14, 3, 'published'),
  ('50000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004',
   'citation-verbs', 'Citation verbs that carry your judgement',
   'Choose reporting verbs that show your stance.',
   '## Notice\n"Smith claims" and "Smith demonstrates" judge the same source differently.\n\n## Palette\nneutral: states, notes, reports · positive: shows, demonstrates, establishes · cautious: suggests, proposes, argues\n\n## Practice\nSummarise one source three ways — neutral, positive, cautious — and feel how the verdict shifts.',
   11, 4, 'published'),
  ('50000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000005',
   'opening-a-meeting', 'Opening a meeting with clear purpose',
   'Set the agenda and the tone in ninety seconds.',
   '## Notice\nMeetings succeed when the first minute announces purpose, agenda, and timing.\n\n## Frame\n"Thanks everyone. Today we have three items: X, Y, Z. We''ll finish by eleven."\n\n## Practice\nWrite and record your ninety-second opening for a real meeting you attend this week.',
   12, 1, 'draft'),
  ('50000000-0000-0000-0000-000000000022', '30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000005',
   'email-that-gets-replies', 'Email that gets replies',
   'Subject lines, one-ask bodies, and clear next steps.',
   '## Notice\nReply rates rise with a specific subject, one request, and a named deadline.\n\n## Template\nSubject: Decision needed: vendor choice by Friday\nBody: context (one line) → the ask → deadline → thanks.\n\n## Practice\nRewrite your longest pending email using the template and send it.',
   10, 2, 'draft'),
  ('50000000-0000-0000-0000-000000000023', '30000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000005',
   'polite-disagreement', 'Disagree without damaging the relationship',
   'Soften conflict while keeping your position.',
   '## Notice\nProfessionals disagree with the idea, never the person: "I see it differently because …"\n\n## Toolkit\n- "I see your point. My concern is …"\n- "Could we look at the numbers before deciding?"\n- "Let''s test both options for a week."\n\n## Practice\nRole-play disagreeing with a deadline. Record it, then listen for softeners you forgot.',
   12, 3, 'draft');

UPDATE courses c
SET lesson_count = (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id AND l.status = 'published')
WHERE c.id IN ('30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003');

INSERT IGNORE INTO enrollments (id, user_id, course_id, enrolled_at) VALUES
  ('60000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', UTC_TIMESTAMP(6)),
  ('60000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', UTC_TIMESTAMP(6)),
  ('60000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-0000000000c1', '30000000-0000-0000-0000-000000000001', UTC_TIMESTAMP(6)),
  ('60000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-0000000000c2', '30000000-0000-0000-0000-000000000001', UTC_TIMESTAMP(6)),
  ('60000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-0000000000c3', '30000000-0000-0000-0000-000000000002', UTC_TIMESTAMP(6));

INSERT IGNORE INTO lesson_completions (id, user_id, lesson_id, score, completed_at) VALUES
  ('70000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 90, UTC_TIMESTAMP(6)),
  ('70000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 75, UTC_TIMESTAMP(6)),
  ('70000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000011', 80, UTC_TIMESTAMP(6)),
  ('70000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-0000000000c1', '50000000-0000-0000-0000-000000000001', 85, UTC_TIMESTAMP(6)),
  ('70000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-0000000000c2', '50000000-0000-0000-0000-000000000001', 70, UTC_TIMESTAMP(6));
