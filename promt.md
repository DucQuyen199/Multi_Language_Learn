# PROMPT XÂY DỰNG WEBSITE HỌC ĐA NGÔN NGỮ

Bạn là **Senior Full-stack Engineer + Solution Architect + UI/UX Designer + AI Engineer + Language Learning Product Designer**.

Hãy thiết kế và xây dựng một website học đa ngôn ngữ ở mức **Production Ready**, kết hợp giữa:

* Từ điển học thuật.
* Từ điển đa ngôn ngữ.
* Hệ thống học từ vựng.
* Hệ thống luyện phát âm.
* Hệ thống luyện nghe.
* Hệ thống luyện nói.
* Hệ thống luyện đọc.
* Hệ thống luyện viết.
* Ngữ pháp.
* Flashcard.
* Spaced Repetition.
* AI Tutor.
* AI kiểm tra bài viết.
* AI đánh giá phát âm.
* Hệ thống khóa học theo cấp độ.
* Theo dõi tiến trình học tập.

Website phải có trải nghiệm hiện đại tương tự sự kết hợp về chức năng của:

**Oxford Learner's Dictionaries + Cambridge Dictionary + DeepL + Duolingo + Quizlet + Anki + ELSA Speak + Grammarly**, nhưng không sao chép giao diện, thương hiệu hoặc nội dung có bản quyền.

---

# 1. MỤC TIÊU SẢN PHẨM

Xây dựng một nền tảng học ngoại ngữ toàn diện cho phép người dùng học nhiều ngôn ngữ trên cùng một tài khoản.

Hệ thống phải tập trung vào 5 thành phần chính:

1. Academic Dictionary.
2. Vocabulary Learning.
3. Grammar Learning.
4. Four Skills: Listening, Speaking, Reading, Writing.
5. AI Language Tutor.

Website phải phù hợp với:

* Người mới bắt đầu.
* Học sinh.
* Sinh viên.
* Người đi làm.
* Người luyện thi chứng chỉ.
* Người học ngoại ngữ học thuật.
* Người học nhiều ngoại ngữ cùng lúc.

---

# 2. NGÔN NGỮ HỖ TRỢ

Thiết kế kiến trúc dữ liệu để có thể thêm ngôn ngữ mới mà không cần sửa lớn source code.

Phiên bản đầu hỗ trợ:

* Tiếng Việt.
* English.
* 中文 – Chinese.
* 日本語 – Japanese.
* 한국어 – Korean.
* Français – French.
* Deutsch – German.
* Español – Spanish.

Người dùng được chọn:

**Native Language**

Ví dụ:

Tiếng Việt

và

**Target Language**

Ví dụ:

English.

Có thể đổi cặp ngôn ngữ bất kỳ:

* Vietnamese → English.
* English → Chinese.
* Vietnamese → Chinese.
* English → Japanese.
* Vietnamese → Japanese.
* Chinese → English.
* Korean → English.
* v.v.

---

# 3. GIAO DIỆN CHÍNH

Thiết kế theo phong cách:

* Modern.
* Minimal.
* Academic.
* Professional.
* Responsive.
* Mobile First.
* Dễ đọc.
* Ít gây rối mắt.
* Có Dark Mode / Light Mode.

Desktop sidebar gồm:

* Home
* Dictionary
* Vocabulary
* Grammar
* Listening
* Speaking
* Reading
* Writing
* Flashcards
* Courses
* AI Tutor
* Practice
* Review
* Progress
* Notebook

Phần cuối:

* Settings
* Help
* User Profile

Mobile sử dụng:

* Bottom Navigation.
* Hamburger Menu.
* Responsive cards.

---

# 4. DASHBOARD

Trang Dashboard cần hiển thị:

## Greeting

Ví dụ:

Good afternoon, Quyến!

Continue your English journey.

## Daily Goal

Ví dụ:

Daily goal

35 / 50 XP

## Streak

12 days

## Study Time

42 minutes today

## Words Learned

1,284

## Words Due for Review

32

## Skills

Listening: 62%

Speaking: 54%

Reading: 78%

Writing: 64%

## Current Level

CEFR B1

Progress to B2: 68%

## Today's Learning

* 10 vocabulary words.
* 1 listening lesson.
* 1 pronunciation exercise.
* 1 reading.
* 1 writing exercise.

## Review

Hiển thị các từ cần ôn theo Spaced Repetition.

---

# 5. ACADEMIC DICTIONARY

Đây là chức năng quan trọng nhất.

Thanh tìm kiếm lớn:

**Search words, phrases, idioms or examples...**

Hỗ trợ:

* Auto complete.
* Typo correction.
* Search history.
* Recent words.
* Fuzzy Search.
* Keyboard navigation.

Khi tìm một từ, ví dụ:

**development**

hiển thị:

# development

/dɪˈveləpmənt/

Audio:

* UK
* US

Word class:

noun

CEFR:

B1

Academic level:

AWL

Frequency:

★★★★★

---

## 5.1 Definition

### Meaning 1

The gradual growth or formation of something.

Vietnamese:

sự phát triển

Chinese:

发展

Japanese:

発展

---

## 5.2 Example Sentences

Mỗi nghĩa ít nhất 3 ví dụ.

Ví dụ:

Economic development remains a major priority.

Cho phép:

* nghe câu.
* dịch câu.
* lưu câu.
* thêm vào notebook.

---

# 6. WORD INFORMATION

Mỗi từ cần có:

* Word.
* Lemma.
* IPA.
* UK pronunciation.
* US pronunciation.
* Part of speech.
* Definition.
* Translation.
* CEFR.
* Frequency.
* Academic frequency.
* Domain.
* Formality.
* Register.
* Synonym.
* Antonym.
* Collocation.
* Idiom.
* Phrase.
* Example.
* Word family.
* Origin.
* Usage notes.
* Common mistakes.

---

# 7. WORD FAMILY

Ví dụ:

develop

development

developer

developed

developing

developmental

Hiển thị quan hệ giữa các từ.

---

# 8. WORD FORMS

Ví dụ động từ:

develop

develops

developed

developing

Đối với danh từ:

child

children

Đối với adjective:

good

better

best

---

# 9. COLLOCATIONS

Ví dụ từ:

research

Hiển thị:

conduct research

academic research

scientific research

extensive research

research findings

research methodology

Cho phép click vào từng collocation.

---

# 10. SYNONYM COMPARISON

Ví dụ:

big

large

huge

enormous

substantial

Hiển thị bảng:

| Word | Meaning | Formality | CEFR | Example |
| ---- | ------- | --------- | ---- | ------- |

Đưa ra giải thích sự khác biệt.

---

# 11. COMMON MISTAKES

Ví dụ:

Incorrect:

I am agree.

Correct:

I agree.

Giải thích vì sao.

---

# 12. ACADEMIC WRITING USAGE

Hiển thị cách sử dụng từ trong:

* Essay.
* Research Paper.
* Report.
* Thesis.
* Presentation.

Ví dụ:

**show**

Academic alternatives:

* demonstrate
* illustrate
* indicate
* reveal
* establish

---

# 13. WORD FREQUENCY

Hiển thị:

General English:

████████ 82%

Academic English:

██████ 64%

Spoken English:

█████████ 91%

Written English:

███████ 74%

---

# 14. VOCABULARY SYSTEM

Người dùng có thể:

* Save word.
* Favorite.
* Create vocabulary list.
* Add tag.
* Add note.
* Add example.
* Add image.
* Add pronunciation.
* Add custom definition.

Ví dụ danh sách:

IELTS Academic

HSK 3

TOEIC

JLPT N3

Business English

Computer Science English

---

# 15. FLASHCARD

Flashcard có mặt trước:

development

Mặt sau:

* IPA.
* Meaning.
* Translation.
* Example.
* Audio.

Các nút:

Again

Hard

Good

Easy

Sử dụng thuật toán:

**FSRS hoặc SM-2 Spaced Repetition.**

---

# 16. LISTENING SKILL

Trang `/listening`.

Các level:

* A1
* A2
* B1
* B2
* C1
* C2

Bài luyện gồm:

Audio player.

Tùy chọn:

0.5x

0.75x

1x

1.25x

1.5x

Không hiển thị transcript ngay.

Các bài tập:

### Listen and choose

Nghe audio và chọn đáp án.

### Listen and type

Nghe và nhập nội dung.

### Dictation

Nghe và viết lại toàn bộ câu.

### Missing Words

Điền từ còn thiếu.

### Listening Comprehension

Nghe đoạn hội thoại rồi trả lời.

### Shadowing

Nghe → lặp lại → ghi âm → AI chấm.

Sau khi hoàn thành hiển thị transcript.

Từng từ trong transcript phải có thể click mở dictionary popup.

---

# 17. SPEAKING SKILL

Trang `/speaking`.

Sử dụng microphone.

Các bài:

### Pronunciation

Người dùng đọc một từ.

AI đánh giá:

* pronunciation.
* phoneme.
* stress.
* intonation.
* fluency.

Ví dụ:

Pronunciation Score

87/100

Fluency

82

Accuracy

91

Intonation

76

---

# 18. PHONEME ANALYSIS

Hiển thị từng phoneme.

Ví dụ:

development

/dɪˈveləpmənt/

| Phoneme | Score |
| ------- | ----: |
| d       |    96 |
| ɪ       |    83 |
| v       |    91 |
| e       |    78 |

Highlight phần phát âm sai.

---

# 19. SHADOWING

Quy trình:

Listen

↓

Record

↓

Compare

↓

AI Feedback

↓

Try Again

Hiển thị waveform của:

Native speaker.

User recording.

---

# 20. AI SPEAKING PARTNER

Người dùng có thể nói chuyện với AI.

Các chủ đề:

* Daily conversation.
* Job interview.
* University.
* Travel.
* Business.
* Technology.
* IELTS Speaking.
* TOEFL.
* HSK.
* JLPT.

AI phải:

* nghe speech.
* chuyển speech thành text.
* trả lời.
* sửa lỗi.
* gợi ý cách nói tự nhiên hơn.

Ví dụ:

User:

I very like this university.

AI:

Better:

I really like this university.

Explanation:

"Very" is not normally used directly before the verb "like".

---

# 21. READING SKILL

Trang `/reading`.

Có các bài đọc:

* Short story.
* News style.
* Academic article.
* Conversation.
* Technical article.
* Essay.
* Business article.

Phân theo CEFR.

Ví dụ:

A1

A2

B1

B2

C1

C2.

---

# 22. INTERACTIVE READING

Trong bài đọc:

Click một từ → mở mini dictionary.

Popup hiển thị:

* Definition.
* IPA.
* Translation.
* Audio.
* Save word.

Không chuyển sang trang khác.

---

# 23. READING EXERCISES

Sau bài đọc:

* Multiple choice.
* True / False.
* Matching heading.
* Fill blank.
* Vocabulary.
* Main idea.
* Inference.
* Summary.

AI phân tích đáp án sai.

---

# 24. READING ANALYSIS

Hiển thị:

Reading time.

Words/minute.

Accuracy.

Unknown words.

New vocabulary.

Reading difficulty.

---

# 25. WRITING SKILL

Trang `/writing`.

Bài tập:

* Sentence writing.
* Paragraph.
* Email.
* Essay.
* Academic essay.
* Report.
* Research abstract.
* IELTS Writing.
* TOEFL Writing.
* Business writing.

---

# 26. AI WRITING CORRECTION

Editor kiểu Google Docs.

AI highlight lỗi theo nhóm:

Grammar.

Vocabulary.

Spelling.

Punctuation.

Clarity.

Academic style.

Coherence.

Cohesion.

Word choice.

Naturalness.

Ví dụ:

Original:

The technology develop very fast.

Corrected:

Technology is developing very rapidly.

---

# 27. WRITING FEEDBACK

AI trả về:

Overall Score: 76/100

Grammar: 72

Vocabulary: 81

Coherence: 74

Academic Style: 78

Task Achievement: 76

Đồng thời đưa ra:

### Errors

### Explanation

### Suggested revision

### Improved version

Không chỉ sửa câu mà phải giải thích lý do.

---

# 28. WRITING COMPARISON

Cho phép hiển thị:

Original

vs

Corrected

Highlight phần thay đổi.

---

# 29. GRAMMAR SYSTEM

Trang:

`/grammar`

Chia theo level.

A1:

* To be.
* Present Simple.
* Pronouns.
* Articles.

A2:

* Past Simple.
* Future.
* Comparatives.

B1:

* Present Perfect.
* Conditionals.
* Passive Voice.

B2:

* Advanced Conditionals.
* Relative Clauses.

C1/C2:

* Inversion.
* Advanced Clauses.
* Academic Structures.

---

# 30. GRAMMAR LESSON

Mỗi bài gồm:

* Explanation.
* Structure.
* Usage.
* Examples.
* Common mistakes.
* Exercises.
* Mini test.

Ví dụ:

Present Perfect

Structure:

Subject + have/has + V3.

---

# 31. AI TUTOR

Trang:

`/ai-tutor`

Chat UI.

AI đóng vai giáo viên ngoại ngữ.

Người dùng có thể hỏi:

"What is the difference between affect and effect?"

"Explain present perfect."

"Why is my sentence wrong?"

"Give me 10 B2 vocabulary words."

AI cần nhận biết:

* native language.
* target language.
* CEFR.
* learning history.
* weak skills.

Sau đó cá nhân hóa câu trả lời.

---

# 32. ASK AI TRONG DICTIONARY

Trong mỗi từ có nút:

**Ask AI**

Các câu hỏi nhanh:

* Explain simply.
* Give more examples.
* Compare synonyms.
* Explain grammar.
* Create exercises.
* Show academic usage.
* Show common mistakes.
* Help me memorize.

---

# 33. COURSES

Trang `/courses`.

Ví dụ:

English A1

English A2

English B1

IELTS Vocabulary

Academic English

Business English

English for IT

HSK 1

HSK 2

Japanese N5

Japanese N4

Korean TOPIK I

---

# 34. COURSE STRUCTURE

Course

→ Unit

→ Lesson

→ Vocabulary

→ Grammar

→ Listening

→ Speaking

→ Reading

→ Writing

→ Quiz

→ Review

---

# 35. PERSONALIZED LEARNING PATH

Sau bài kiểm tra đầu vào, hệ thống xác định:

Language Level.

Listening Level.

Speaking Level.

Reading Level.

Writing Level.

Vocabulary Size.

Grammar Level.

Ví dụ:

Overall: B1

Listening: B1

Speaking: A2

Reading: B2

Writing: B1

Sau đó AI tạo learning plan.

---

# 36. PLACEMENT TEST

Có bài kiểm tra:

* Vocabulary.
* Grammar.
* Listening.
* Reading.
* Writing.
* Speaking.

Kết quả ánh xạ sang:

CEFR:

A1 → A2 → B1 → B2 → C1 → C2.

---

# 37. PROGRESS PAGE

Trang `/progress`.

Hiển thị biểu đồ:

Study Time.

Vocabulary Learned.

Vocabulary Mastered.

Listening Accuracy.

Speaking Score.

Reading Speed.

Writing Score.

Grammar Accuracy.

---

# 38. LEARNING HEATMAP

Tạo heatmap giống contribution calendar.

Mỗi ngày hiển thị mức học.

Ví dụ:

0 phút → empty

1–15 phút → level 1

15–30 → level 2

30–60 → level 3

60+ → level 4.

---

# 39. STREAK

Hiển thị:

Current Streak.

Longest Streak.

Days Active.

Cho phép:

Streak Freeze.

---

# 40. ACHIEVEMENTS

Ví dụ:

First 100 Words

Vocabulary Master

7 Day Streak

30 Day Streak

Listening Master

Speaking Master

B1 Completed

B2 Completed.

---

# 41. NOTEBOOK

Người dùng có notebook cá nhân.

Có thể lưu:

* Words.
* Sentences.
* Grammar.
* AI explanations.
* Reading passages.
* Writing corrections.

Cho phép:

Folder.

Tag.

Search.

Filter.

---

# 42. TEXT TRANSLATION

Trang `/translate`.

Cho phép:

Text translation.

Auto detect language.

Swap languages.

Listen.

Copy.

Save.

Dictionary lookup.

Translation history.

Không chỉ trả về bản dịch mà có thể hiển thị:

Literal translation.

Natural translation.

Academic translation.

---

# 43. SENTENCE ANALYSIS

Khi nhập câu:

She has been studying English for three years.

AI phân tích:

She

Pronoun

has been studying

Present Perfect Continuous

English

Object

for three years

Duration phrase.

---

# 44. TEXT-TO-SPEECH

Hỗ trợ audio cho:

* Word.
* Phrase.
* Sentence.
* Paragraph.

Nếu có thể chọn:

Voice.

Male/Female.

Accent.

Speed.

---

# 45. SPEECH-TO-TEXT

Sử dụng STT cho speaking.

Phải hỗ trợ:

* Audio recording.
* Microphone permission.
* Waveform.
* Audio playback.
* Transcript.

---

# 46. SEARCH

Global Search hỗ trợ tìm:

Words.

Grammar lessons.

Courses.

Reading materials.

Saved notes.

Vocabulary lists.

---

# 47. COMMAND SEARCH

Nhấn:

Ctrl + K

mở command palette.

Ví dụ:

Search "development"

Go to Listening

Open Vocabulary

Ask AI.

---

# 48. AUTHENTICATION

Hỗ trợ:

Email/password.

Google OAuth.

Apple OAuth nếu có.

Forgot Password.

Email Verification.

Refresh Token.

Session Management.

---

# 49. USER PROFILE

Thông tin:

Name.

Avatar.

Native Language.

Target Languages.

Current Level.

Learning Goal.

Daily Goal.

Timezone.

Preferred Accent.

---

# 50. LEARNING GOAL

Ví dụ:

General Communication.

Academic English.

IELTS.

TOEFL.

TOEIC.

Business.

Travel.

University.

HSK.

JLPT.

TOPIK.

---

# 51. MULTIPLE LANGUAGE PROFILE

Một tài khoản có thể có:

English B2

Chinese HSK 2

Japanese N5

Người dùng chuyển nhanh:

English ▼

Chinese

Japanese.

Dữ liệu tiến trình phải riêng biệt cho từng ngôn ngữ.

---

# 52. GAMIFICATION

Có:

XP.

Level.

Streak.

Achievement.

Daily Goal.

Weekly Goal.

Challenge.

Leaderboard có thể cấu hình bật/tắt.

Không để gamification làm ảnh hưởng đến trải nghiệm học thuật.

---

# 53. DAILY REVIEW

Mỗi ngày hệ thống tạo:

Vocabulary Review.

Grammar Review.

Listening Review.

Pronunciation Review.

Mistake Review.

Ưu tiên nội dung người dùng thường xuyên làm sai.

---

# 54. MISTAKE BOOK

Tự động lưu:

Vocabulary mistakes.

Grammar mistakes.

Listening mistakes.

Pronunciation mistakes.

Writing mistakes.

Cho phép người dùng học lại riêng phần lỗi.

---

# 55. AI PERSONALIZATION

AI phải phân tích:

* lịch sử học.
* từ đã học.
* lỗi thường gặp.
* thời gian học.
* level.
* mục tiêu.
* kỹ năng yếu.

Sau đó đề xuất:

Today's Lesson.

Words to Review.

Recommended Reading.

Recommended Listening.

Speaking Practice.

Writing Practice.

---

# 56. DATABASE

Thiết kế PostgreSQL database chuẩn hóa.

Các bảng chính:

users

user_profiles

languages

user_languages

dictionary_entries

word_meanings

word_translations

word_examples

word_pronunciations

word_forms

word_relations

synonyms

antonyms

collocations

idioms

phrases

grammar_topics

grammar_lessons

courses

course_units

lessons

exercises

exercise_questions

exercise_attempts

vocabulary_lists

vocabulary_items

flashcards

review_schedules

learning_sessions

user_progress

listening_lessons

speaking_lessons

reading_lessons

writing_tasks

writing_submissions

pronunciation_attempts

ai_conversations

ai_messages

notes

mistakes

achievements

user_achievements

streaks

notifications

subscriptions.

Sử dụng UUID làm primary key khi phù hợp.

Tạo:

* foreign key.
* unique constraint.
* indexes.
* full-text search indexes.
* timestamps.
* soft delete cho dữ liệu cần thiết.

---

# 57. BACKEND ARCHITECTURE

Thiết kế theo module:

Auth

User

Language

Dictionary

Vocabulary

Grammar

Course

Listening

Speaking

Reading

Writing

AI

Progress

Review

Search

Notification

Subscription.

Tách rõ:

Controller

Service

Repository

DTO

Validation

Middleware.

---

# 58. API

Thiết kế REST API chuẩn.

Ví dụ:

GET /api/dictionary/search?q=

GET /api/dictionary/:word

POST /api/vocabulary

GET /api/vocabulary

POST /api/review/:id

GET /api/listening

POST /api/listening/:id/attempt

POST /api/speaking/analyze

POST /api/writing/analyze

POST /api/ai/chat

GET /api/progress

GET /api/dashboard.

Chuẩn response:

```json
{
  "success": true,
  "data": {},
  "message": null
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}
```

---

# 59. TECHNOLOGY STACK

Ưu tiên kiến trúc hiện đại:

## Frontend

* React.
* TypeScript.
* Vite hoặc Next.js.
* Tailwind CSS.
* TanStack Query.
* Zustand.
* React Hook Form.
* Zod.

## Backend

* Node.js.
* TypeScript.
* Express.js hoặc NestJS.

## Database

PostgreSQL.

## ORM

Prisma.

## Cache

Redis.

## Search

PostgreSQL Full Text Search ở giai đoạn đầu.

Kiến trúc phải cho phép nâng cấp sang Elasticsearch/OpenSearch.

## File Storage

S3-compatible Object Storage.

## AI

Thiết kế abstraction layer để có thể kết nối:

* OpenAI.
* Gemini.
* Claude.
* Ollama.
* Local AI models.

Không hard-code một AI provider.

---

# 60. AI ARCHITECTURE

Tạo interface:

```ts
interface AIProvider {
  chat();
  analyzeWriting();
  explainWord();
  generateExercise();
  analyzeGrammar();
}
```

Cho phép thay provider thông qua environment variable.

Ví dụ:

AI_PROVIDER=openai

hoặc:

AI_PROVIDER=ollama.

---

# 61. SPEECH ARCHITECTURE

Tạo abstraction:

SpeechToTextProvider.

TextToSpeechProvider.

PronunciationAssessmentProvider.

Để có thể tích hợp nhiều nhà cung cấp khác nhau.

---

# 62. SECURITY

Production security bắt buộc:

* HTTPS.
* JWT / secure session.
* Refresh Token Rotation.
* Password hashing Argon2 hoặc bcrypt.
* HttpOnly Cookies.
* Secure Cookies.
* SameSite.
* CSRF protection khi cần.
* CORS whitelist.
* Helmet.
* Rate limiting.
* Input validation.
* SQL injection protection.
* XSS protection.
* File validation.
* API abuse protection.

Không lưu API key ở frontend.

---

# 63. PERFORMANCE

Sử dụng:

* lazy loading.
* route splitting.
* image optimization.
* caching.
* Redis.
* pagination.
* database indexing.
* query optimization.
* skeleton loading.
* CDN cho static assets.

Dictionary search phải phản hồi nhanh.

---

# 64. ACCESSIBILITY

Tuân thủ WCAG.

Hỗ trợ:

* keyboard.
* screen reader.
* aria-label.
* focus states.
* sufficient contrast.
* scalable text.

---

# 65. RESPONSIVE

Breakpoints:

Mobile:

320–767px.

Tablet:

768–1023px.

Desktop:

1024px+.

Không tạo giao diện desktop rồi thu nhỏ đơn thuần.

Thiết kế mobile-first thực sự.

---

# 66. COMPONENT SYSTEM

Tạo reusable components:

Button

Input

Textarea

Select

Modal

Drawer

Tooltip

Popover

Tabs

Card

Badge

Progress

Skeleton

AudioPlayer

Recorder

Waveform

DictionaryPopup

WordCard

Flashcard

ExerciseCard

AIChat

ScoreCard

StatCard

ChartCard.

---

# 67. DESIGN SYSTEM

Tạo variables:

background

surface

text-primary

text-secondary

border

primary

success

warning

danger.

Không hard-code màu khắp project.

Hỗ trợ:

Light Theme.

Dark Theme.

---

# 68. DICTIONARY UX

Khi hover hoặc click một từ trong:

Reading.

Grammar.

Listening transcript.

AI chat.

Writing correction.

Phải có thể mở:

**Quick Dictionary Popup**

mà không mất trạng thái trang đang học.

---

# 69. LOADING STATES

Không hiển thị màn hình trắng.

Sử dụng:

Skeleton.

Spinner.

Progress indicator.

Optimistic updates khi phù hợp.

---

# 70. EMPTY STATES

Ví dụ Vocabulary chưa có từ:

**Your vocabulary list is empty.**

Start by searching for a word in the dictionary.

[Open Dictionary]

---

# 71. ERROR STATES

Không chỉ hiển thị:

Something went wrong.

Phải có:

Mô tả dễ hiểu.

Retry.

Back.

Report nếu phù hợp.

---

# 72. ADMIN DASHBOARD

Tạo `/admin`.

Admin có thể quản lý:

Users.

Languages.

Dictionary.

Courses.

Lessons.

Exercises.

Reading materials.

Listening materials.

Vocabulary.

Grammar.

AI usage.

Reports.

Subscriptions.

---

# 73. ADMIN CONTENT EDITOR

Admin có thể tạo bài học bằng editor.

Các block:

Heading.

Paragraph.

Example.

Vocabulary.

Image.

Audio.

Video.

Question.

Tip.

Warning.

Grammar box.

Exercise.

Không yêu cầu admin viết HTML.

---

# 74. ANALYTICS

Theo dõi:

DAU.

MAU.

Retention.

Study time.

Lessons completed.

Average session.

Vocabulary learned.

AI requests.

Speaking attempts.

Writing submissions.

---

# 75. SUBSCRIPTION ARCHITECTURE

Chuẩn bị:

Free.

Premium.

Student.

Có feature flags.

Ví dụ Free:

Limited AI requests.

Premium:

Unlimited AI tutor.

Advanced speaking.

Advanced writing.

Personalized learning path.

Không cần bật thanh toán ngay nhưng kiến trúc phải hỗ trợ.

---

# 76. NOTIFICATIONS

Hỗ trợ:

Daily reminder.

Review due.

Streak warning.

Course reminder.

Achievement.

Có notification center.

---

# 77. PWA

Website có thể cài trên:

Android.

Windows.

macOS.

Hỗ trợ:

Web App Manifest.

Service Worker.

Offline cache cho vocabulary và flashcards nếu phù hợp.

---

# 78. SEO

Public dictionary pages cần hỗ trợ SEO.

Ví dụ:

`/dictionary/en/development`

Tạo:

title.

description.

canonical.

Open Graph.

structured data.

sitemap.

robots.txt.

---

# 79. URL STRUCTURE

Ví dụ:

/

/dictionary

/dictionary/en/development

/vocabulary

/flashcards

/grammar

/grammar/present-perfect

/listening

/speaking

/reading

/writing

/courses

/courses/english-b1

/ai-tutor

/progress

/notebook

/translate

/profile

/settings

/admin.

---

# 80. TESTING

Viết:

Unit tests.

Integration tests.

API tests.

Component tests.

E2E tests.

Kiểm thử các luồng quan trọng:

Register.

Login.

Dictionary Search.

Save Vocabulary.

Flashcard Review.

Listening Attempt.

Speaking Recording.

Writing Submission.

AI Tutor.

Progress update.

---

# 81. DOCKER

Tạo:

Dockerfile frontend.

Dockerfile backend.

docker-compose.yml.

Services:

frontend

backend

postgres

redis.

Cho phép chạy bằng:

```bash
docker compose up -d
```

---

# 82. ENVIRONMENT

Tạo `.env.example`.

Ví dụ:

```env
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
REFRESH_TOKEN_SECRET=

AI_PROVIDER=
OPENAI_API_KEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=

OLLAMA_BASE_URL=

S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

Tuyệt đối không commit secret.

---

# 83. DOCUMENTATION

Tạo README đầy đủ:

Project overview.

Features.

Architecture.

Technology stack.

Folder structure.

Database.

Installation.

Environment setup.

Development.

Docker.

Testing.

Build.

Deployment.

API documentation.

---

# 84. SEED DATA

Tạo sample data để project chạy ngay.

Bao gồm ít nhất:

* 100 dictionary entries mẫu.
* 20 grammar topics.
* 10 reading lessons.
* 10 listening lessons.
* 10 speaking exercises.
* 10 writing assignments.
* 2 sample courses.
* sample users.

Không sử dụng nội dung có bản quyền từ Cambridge, Oxford hoặc các nguồn thương mại.

---

# 85. DEMO USER

Tạo demo account trong seed development:

Student account.

Admin account.

Không hard-code credential trong production.

---

# 86. YÊU CẦU VỀ CODE

Code phải:

* Clean.
* Modular.
* Typed.
* Maintainable.
* Reusable.
* Scalable.
* Testable.

Không:

* tạo component khổng lồ.
* đặt toàn bộ logic trong route.
* lặp code.
* hard-code text.
* hard-code language.
* hard-code API keys.
* sử dụng mock data sau khi backend thực đã được triển khai.

---

# 87. INTERNATIONALIZATION

Toàn bộ UI phải sử dụng i18n.

Ví dụ:

```ts
t("dictionary.search.placeholder")
```

Không viết trực tiếp text UI trong component nếu có thể tránh.

Hỗ trợ ban đầu:

vi

en.

Sau đó dễ dàng bổ sung:

zh

ja

ko

fr

de

es.

---

# 88. KIẾN TRÚC NGÔN NGỮ

Không xây database kiểu:

english_word

chinese_word

japanese_word.

Thay vào đó thiết kế generic:

Language

DictionaryEntry

Meaning

Translation.

Để thêm một ngôn ngữ mới mà không phải migration lớn.

---

# 89. LUỒNG NGƯỜI DÙNG MỚI

Sau đăng ký:

### Step 1

Choose your native language.

### Step 2

What language do you want to learn?

### Step 3

What is your goal?

### Step 4

How much time can you study every day?

5 min

10 min

20 min

30 min

60 min.

### Step 5

Do you know this language already?

Beginner

Take Placement Test.

### Step 6

Generate personalized learning path.

---

# 90. HOME PAGE

Landing page phải thể hiện ngay giá trị:

# Master Languages. Understand Every Word.

Learn vocabulary, pronunciation, grammar and all four language skills in one intelligent learning platform.

CTA:

**Start Learning Free**

Secondary CTA:

**Explore Dictionary**

Các section:

Academic Dictionary.

Four Skills.

AI Tutor.

Vocabulary Review.

Personalized Learning.

Progress Analytics.

Supported Languages.

---

# 91. TRANG DICTIONARY DESKTOP

Layout:

Left/Main 70%:

Word information.

Right 30%:

Save.

Vocabulary list.

AI explanation.

Related words.

Learning progress.

Mobile:

Stack toàn bộ theo chiều dọc.

---

# 92. BOTTOM AUDIO PLAYER

Khi nghe pronunciation hoặc listening lesson có thể sử dụng bottom mini player.

Hiển thị:

Play/Pause.

Current sentence.

Speed.

Progress.

Close.

---

# 93. KEYBOARD SHORTCUT

Desktop:

Ctrl + K → Search.

D → Dictionary.

V → Vocabulary.

L → Listening.

S → Speaking.

R → Reading.

W → Writing.

Chỉ bật nếu không xung đột khi người dùng đang nhập văn bản.

---

# 94. STUDY SESSION

Cho phép người dùng chọn:

5 minutes.

10 minutes.

20 minutes.

30 minutes.

Custom.

AI tạo session gồm:

Vocabulary.

Listening.

Speaking.

Reading.

Writing.

Review.

---

# 95. SMART REVIEW

Không chỉ ôn từ.

Hệ thống phải có thể ôn:

Vocabulary.

Grammar mistakes.

Pronunciation mistakes.

Writing mistakes.

Listening mistakes.

---

# 96. LEARNING ENGINE

Tạo một Learning Engine tính:

Mastery Score.

Difficulty.

Last Reviewed.

Next Review.

Error Rate.

Confidence.

Response Time.

Mỗi knowledge item có mastery từ:

0.0 → 1.0.

AI recommendations sử dụng các dữ liệu này.

---

# 97. KHÔNG XÂY DỰNG WEBSITE DẠNG DEMO TĨNH

Đây là yêu cầu bắt buộc.

Không tạo một landing page đơn giản rồi coi là hoàn thành.

Phải triển khai hệ thống theo từng module thực sự hoạt động:

Auth

Dictionary

Vocabulary

Flashcard

Listening

Speaking

Reading

Writing

Grammar

AI Tutor

Progress.

---

# 98. THỨ TỰ TRIỂN KHAI

Thực hiện project theo thứ tự:

## Phase 1 – Foundation

Architecture.

Database.

Authentication.

Design system.

i18n.

## Phase 2 – Dictionary

Dictionary database.

Search.

Word details.

Quick lookup.

Audio.

Vocabulary save.

## Phase 3 – Learning

Vocabulary.

Flashcard.

Spaced repetition.

Grammar.

Courses.

## Phase 4 – Four Skills

Listening.

Speaking.

Reading.

Writing.

## Phase 5 – AI

AI Tutor.

Writing correction.

Grammar explanation.

Dictionary AI.

Exercise generation.

## Phase 6 – Personalization

Placement Test.

Learning path.

Smart Review.

Learning Engine.

## Phase 7 – Production

Security.

Performance.

Tests.

Docker.

Documentation.

Deployment.

---

# 99. TRƯỚC KHI CODE

Trước khi bắt đầu triển khai, hãy tạo:

1. System Architecture.
2. Database ERD.
3. Folder Structure.
4. API Design.
5. UI Sitemap.
6. Authentication Flow.
7. Learning Data Model.
8. AI Architecture.
9. Speech Architecture.
10. Implementation Roadmap.

Sau đó mới bắt đầu viết code.

---

# 100. KẾT QUẢ CUỐI CÙNG

Website cuối cùng phải tạo cảm giác đây là một:

**Academic Language Learning Operating System**

chứ không đơn thuần là website tra từ.

Người dùng phải có thể thực hiện toàn bộ quá trình:

**Search → Understand → Listen → Pronounce → Read → Write → Practice → Review → Master**

trên cùng một nền tảng.

Ưu tiên cao nhất theo thứ tự:

1. Trải nghiệm tra từ cực nhanh.
2. Giải thích từ chính xác và dễ hiểu.
3. Học đủ Listening – Speaking – Reading – Writing.
4. AI hỗ trợ nhưng không phụ thuộc hoàn toàn vào AI.
5. Spaced Repetition và hệ thống ghi nhớ.
6. Cá nhân hóa quá trình học.
7. Multi-language architecture.
8. Mobile responsive.
9. Production security.
10. Performance và khả năng mở rộng.

Không dừng ở việc tạo mockup. Hãy xây dựng từng module thành hệ thống có thể chạy thực tế, kết nối frontend, backend và database đầy đủ.

---

# Implementation notes

The repository now contains a runnable foundation for the platform described above:

- `frontend/`: Next.js 16 App Router, TypeScript, Tailwind CSS v4, TanStack Query, Zustand and responsive learner UI.
- `backend/`: Go 1.26 REST API with separated handlers/services/repositories, MySQL access and Redis cache-aside.
- `backend/migrations/`: MySQL 8.4-compatible schema plus copyright-safe development seed data (100 English dictionary entries, grammar topics and courses).
- `infra/k8s/`: Kubernetes resources for MySQL, Redis, API and frontend; inspect the deployment with `k9s`.
- `docs/`: architecture, ERD, API, sitemap, authentication, learning data, AI/speech boundaries, folder structure and roadmap.

Run locally with Docker:

```bash
docker compose up -d --build
```

Open `http://localhost:3000` for the landing page, `http://localhost:3000/app/dashboard` for the learner workspace, and `http://localhost:3000/dictionary` for the academic dictionary. The demo seed user is only for local development; replace the auth boundary before production.

The seed and repair migrations explicitly use `utf8mb4`. If an existing MySQL volume was initialized before this fix, run `backend/migrations/003_repair_utf8_mojibake.sql` once and restart the API; cache keys were bumped to `v2` so stale encoded responses are not reused.

Validation currently covers ESLint, TypeScript, Next production build, Go tests, Docker Compose, Kubernetes kustomize output, health/readiness, Unicode API payloads, vocabulary save/remove, and review scheduling.
