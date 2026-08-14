USE multilanguage;

-- The mysql client used by the container defaults to latin1. Keep seed data
-- lossless when it contains Vietnamese, CJK, IPA, emoji, or punctuation.
SET NAMES utf8mb4;
SET time_zone = '+00:00';

INSERT IGNORE INTO languages (id, code, name, native_name, flag_emoji) VALUES
  ('10000000-0000-0000-0000-000000000001', 'vi', 'Vietnamese', 'Tiếng Việt', '🇻🇳'),
  ('10000000-0000-0000-0000-000000000002', 'en', 'English', 'English', '🇬🇧'),
  ('10000000-0000-0000-0000-000000000003', 'zh', 'Chinese', '中文', '🇨🇳'),
  ('10000000-0000-0000-0000-000000000004', 'ja', 'Japanese', '日本語', '🇯🇵'),
  ('10000000-0000-0000-0000-000000000005', 'ko', 'Korean', '한국어', '🇰🇷'),
  ('10000000-0000-0000-0000-000000000006', 'fr', 'French', 'Français', '🇫🇷'),
  ('10000000-0000-0000-0000-000000000007', 'de', 'German', 'Deutsch', '🇩🇪'),
  ('10000000-0000-0000-0000-000000000008', 'es', 'Spanish', 'Español', '🇪🇸');

INSERT IGNORE INTO users (id, email, role, email_verified_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'learner@example.com', 'student', UTC_TIMESTAMP());

INSERT IGNORE INTO user_profiles (user_id, first_name, native_language_id, learning_goal, timezone, preferred_accent)
VALUES ('00000000-0000-0000-0000-000000000001', 'Quyến', '10000000-0000-0000-0000-000000000001', 'Academic English', 'Asia/Ho_Chi_Minh', 'US');

INSERT IGNORE INTO user_languages (id, user_id, language_id, cefr_level, daily_goal, current_streak, longest_streak)
VALUES ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'B1', 50, 12, 28);

INSERT IGNORE INTO dictionary_entries (id, language_id, word, slug, lemma, ipa, part_of_speech, cefr, academic_level, frequency, domain, formality) VALUES
  (UUID(), '10000000-0000-0000-0000-000000000002', 'development', 'development', 'develop', '/dɪˈveləpmənt/', 'noun', 'B1', 'AWL', 82, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'research', 'research', 'research', '/rɪˈsɜːrtʃ/', 'noun', 'B1', 'AWL', 79, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'evidence', 'evidence', 'evidence', '/ˈevɪdəns/', 'noun', 'B1', 'AWL', 76, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'significant', 'significant', 'significant', '/sɪɡˈnɪfɪkənt/', 'adjective', 'B1', 'AWL', 78, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'assess', 'assess', 'assess', '/əˈses/', 'verb', 'B2', 'AWL', 65, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'approach', 'approach', 'approach', '/əˈproʊtʃ/', 'noun', 'B1', 'AWL', 81, 'general', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'context', 'context', 'context', '/ˈkɑːntekst/', 'noun', 'B1', 'AWL', 73, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'achieve', 'achieve', 'achieve', '/əˈtʃiːv/', 'verb', 'A2', 'General', 86, 'general', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'establish', 'establish', 'establish', '/ɪˈstæblɪʃ/', 'verb', 'B2', 'AWL', 68, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'indicate', 'indicate', 'indicate', '/ˈɪndɪkeɪt/', 'verb', 'B1', 'AWL', 71, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'interpret', 'interpret', 'interpret', '/ɪnˈtɜːrprət/', 'verb', 'B2', 'AWL', 61, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'require', 'require', 'require', '/rɪˈkwaɪər/', 'verb', 'B1', 'AWL', 88, 'general', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'contribute', 'contribute', 'contribute', '/kənˈtrɪbjuːt/', 'verb', 'B2', 'AWL', 64, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'process', 'process', 'process', '/ˈprɑːses/', 'noun', 'B1', 'AWL', 84, 'general', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'feature', 'feature', 'feature', '/ˈfiːtʃər/', 'noun', 'B1', 'General', 80, 'general', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'method', 'method', 'method', '/ˈmeθəd/', 'noun', 'B1', 'AWL', 75, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'outcome', 'outcome', 'outcome', '/ˈaʊtkʌm/', 'noun', 'B2', 'AWL', 58, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'theory', 'theory', 'theory', '/ˈθɪəri/', 'noun', 'B1', 'AWL', 70, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'structure', 'structure', 'structure', '/ˈstrʌktʃər/', 'noun', 'B1', 'AWL', 83, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'respond', 'respond', 'respond', '/rɪˈspɑːnd/', 'verb', 'B1', 'General', 81, 'general', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'analyze', 'analyze', 'analyze', '/ˈænəlaɪz/', 'verb', 'B1', 'AWL', 63, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'benefit', 'benefit', 'benefit', '/ˈbenɪfɪt/', 'noun', 'B1', 'AWL', 82, 'general', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'complex', 'complex', 'complex', '/ˈkɑːmpleks/', 'adjective', 'B1', 'AWL', 69, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'concept', 'concept', 'concept', '/ˈkɑːnsept/', 'noun', 'B1', 'AWL', 72, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'data', 'data', 'data', '/ˈdeɪtə/', 'noun', 'B1', 'AWL', 90, 'technology', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'define', 'define', 'define', '/dɪˈfaɪn/', 'verb', 'B1', 'AWL', 77, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'derive', 'derive', 'derive', '/dɪˈraɪv/', 'verb', 'B2', 'AWL', 55, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'distribute', 'distribute', 'distribute', '/dɪˈstrɪbjuːt/', 'verb', 'B2', 'AWL', 54, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'environment', 'environment', 'environment', '/ɪnˈvaɪrənmənt/', 'noun', 'B1', 'AWL', 88, 'general', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'estimate', 'estimate', 'estimate', '/ˈestɪmeɪt/', 'verb', 'B2', 'AWL', 51, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'factor', 'factor', 'factor', '/ˈfæktər/', 'noun', 'B1', 'AWL', 74, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'function', 'function', 'function', '/ˈfʌŋkʃən/', 'noun', 'B1', 'AWL', 76, 'technology', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'identify', 'identify', 'identify', '/aɪˈdentɪfaɪ/', 'verb', 'B1', 'AWL', 85, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'impact', 'impact', 'impact', '/ˈɪmpækt/', 'noun', 'B1', 'AWL', 81, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'income', 'income', 'income', '/ˈɪnkʌm/', 'noun', 'B1', 'General', 67, 'business', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'individual', 'individual', 'individual', '/ˌɪndɪˈvɪdʒuəl/', 'noun', 'B1', 'AWL', 77, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'involve', 'involve', 'involve', '/ɪnˈvɑːlv/', 'verb', 'B1', 'AWL', 84, 'general', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'issue', 'issue', 'issue', '/ˈɪʃuː/', 'noun', 'B1', 'AWL', 82, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'maintain', 'maintain', 'maintain', '/meɪnˈteɪn/', 'verb', 'B2', 'AWL', 65, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'occur', 'occur', 'occur', '/əˈkɜːr/', 'verb', 'B1', 'AWL', 61, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'participate', 'participate', 'participate', '/pɑːrˈtɪsɪpeɪt/', 'verb', 'B1', 'AWL', 57, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'period', 'period', 'period', '/ˈpɪəriəd/', 'noun', 'A2', 'General', 89, 'general', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'policy', 'policy', 'policy', '/ˈpɑːləsi/', 'noun', 'B1', 'AWL', 64, 'business', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'principle', 'principle', 'principle', '/ˈprɪnsəpəl/', 'noun', 'B2', 'AWL', 59, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'proceed', 'proceed', 'proceed', '/prəˈsiːd/', 'verb', 'B2', 'AWL', 48, 'formal', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'range', 'range', 'range', '/reɪndʒ/', 'noun', 'B1', 'General', 76, 'general', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'region', 'region', 'region', '/ˈriːdʒən/', 'noun', 'B1', 'AWL', 74, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'relevant', 'relevant', 'relevant', '/ˈreləvənt/', 'adjective', 'B1', 'AWL', 71, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'result', 'result', 'result', '/rɪˈzʌlt/', 'noun', 'A2', 'General', 94, 'general', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'similar', 'similar', 'similar', '/ˈsɪmələr/', 'adjective', 'A2', 'General', 85, 'general', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'source', 'source', 'source', '/sɔːrs/', 'noun', 'B1', 'AWL', 82, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'specific', 'specific', 'specific', '/spəˈsɪfɪk/', 'adjective', 'B1', 'AWL', 87, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'strategy', 'strategy', 'strategy', '/ˈstrætədʒi/', 'noun', 'B1', 'AWL', 69, 'business', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'transfer', 'transfer', 'transfer', '/trænsˈfɜːr/', 'verb', 'B1', 'AWL', 63, 'business', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'vary', 'vary', 'vary', '/ˈveri/', 'verb', 'B1', 'AWL', 61, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'access', 'access', 'access', '/ˈækses/', 'noun', 'B1', 'AWL', 86, 'technology', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'acquire', 'acquire', 'acquire', '/əˈkwaɪər/', 'verb', 'B2', 'AWL', 52, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'adapt', 'adapt', 'adapt', '/əˈdæpt/', 'verb', 'B1', 'AWL', 56, 'general', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'adequate', 'adequate', 'adequate', '/ˈædəkwət/', 'adjective', 'B2', 'AWL', 45, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'annual', 'annual', 'annual', '/ˈænjuəl/', 'adjective', 'B1', 'AWL', 58, 'business', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'apparent', 'apparent', 'apparent', '/əˈpærənt/', 'adjective', 'B2', 'AWL', 46, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'approximate', 'approximate', 'approximate', '/əˈprɑːksɪmət/', 'adjective', 'B2', 'AWL', 39, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'aspect', 'aspect', 'aspect', '/ˈæspekt/', 'noun', 'B1', 'AWL', 62, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'assign', 'assign', 'assign', '/əˈsaɪn/', 'verb', 'B1', 'AWL', 44, 'education', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'category', 'category', 'category', '/ˈkætəɡɔːri/', 'noun', 'B1', 'AWL', 53, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'chapter', 'chapter', 'chapter', '/ˈtʃæptər/', 'noun', 'A2', 'General', 57, 'education', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'circumstance', 'circumstance', 'circumstance', '/ˈsɜːrkəmstæns/', 'noun', 'B2', 'AWL', 42, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'community', 'community', 'community', '/kəˈmjuːnəti/', 'noun', 'B1', 'General', 79, 'general', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'consequence', 'consequence', 'consequence', '/ˈkɑːnsɪkwens/', 'noun', 'B2', 'AWL', 51, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'construct', 'construct', 'construct', '/kənˈstrʌkt/', 'verb', 'B2', 'AWL', 37, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'consume', 'consume', 'consume', '/kənˈsuːm/', 'verb', 'B1', 'AWL', 48, 'business', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'create', 'create', 'create', '/kriˈeɪt/', 'verb', 'A2', 'General', 92, 'general', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'decline', 'decline', 'decline', '/dɪˈklaɪn/', 'verb', 'B1', 'AWL', 54, 'business', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'distinct', 'distinct', 'distinct', '/dɪˈstɪŋkt/', 'adjective', 'B2', 'AWL', 43, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'economy', 'economy', 'economy', '/ɪˈkɑːnəmi/', 'noun', 'B1', 'AWL', 66, 'business', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'eliminate', 'eliminate', 'eliminate', '/ɪˈlɪməneɪt/', 'verb', 'B2', 'AWL', 40, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'emerge', 'emerge', 'emerge', '/ɪˈmɜːrdʒ/', 'verb', 'B2', 'AWL', 47, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'export', 'export', 'export', '/ˈekspɔːrt/', 'noun', 'B1', 'AWL', 39, 'business', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'finance', 'finance', 'finance', '/ˈfaɪnæns/', 'noun', 'B1', 'AWL', 58, 'business', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'framework', 'framework', 'framework', '/ˈfreɪmwɜːrk/', 'noun', 'B2', 'AWL', 41, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'illustrate', 'illustrate', 'illustrate', '/ˈɪləstreɪt/', 'verb', 'B2', 'AWL', 49, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'imply', 'imply', 'imply', '/ɪmˈplaɪ/', 'verb', 'B2', 'AWL', 44, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'initial', 'initial', 'initial', '/ɪˈnɪʃəl/', 'adjective', 'B1', 'AWL', 66, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'instance', 'instance', 'instance', '/ˈɪnstəns/', 'noun', 'B2', 'AWL', 45, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'interact', 'interact', 'interact', '/ˌɪntərˈækt/', 'verb', 'B1', 'General', 39, 'technology', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'justify', 'justify', 'justify', '/ˈdʒʌstəfaɪ/', 'verb', 'B2', 'AWL', 38, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'layer', 'layer', 'layer', '/ˈleɪər/', 'noun', 'B1', 'General', 53, 'technology', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'legislate', 'legislate', 'legislate', '/ˈledʒɪsleɪt/', 'verb', 'C1', 'AWL', 23, 'policy', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'link', 'link', 'link', '/lɪŋk/', 'noun', 'A2', 'General', 78, 'technology', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'locate', 'locate', 'locate', '/ˈloʊkeɪt/', 'verb', 'B1', 'AWL', 44, 'general', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'maximize', 'maximize', 'maximize', '/ˈmæksəmaɪz/', 'verb', 'B2', 'AWL', 31, 'business', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'minimize', 'minimize', 'minimize', '/ˈmɪnəmaɪz/', 'verb', 'B2', 'AWL', 30, 'business', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'objective', 'objective', 'objective', '/əbˈdʒektɪv/', 'noun', 'B1', 'AWL', 52, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'perceive', 'perceive', 'perceive', '/pərˈsiːv/', 'verb', 'B2', 'AWL', 28, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'primary', 'primary', 'primary', '/ˈpraɪmeri/', 'adjective', 'B1', 'AWL', 74, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'promote', 'promote', 'promote', '/prəˈmoʊt/', 'verb', 'B1', 'AWL', 67, 'business', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'proportion', 'proportion', 'proportion', '/prəˈpɔːrʃən/', 'noun', 'B2', 'AWL', 36, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'publish', 'publish', 'publish', '/ˈpʌblɪʃ/', 'verb', 'B1', 'AWL', 59, 'academic', 'formal'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'react', 'react', 'react', '/riˈækt/', 'verb', 'B1', 'General', 58, 'general', 'neutral'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'regulate', 'regulate', 'regulate', '/ˈreɡjəleɪt/', 'verb', 'B2', 'AWL', 35, 'policy', 'formal');

INSERT IGNORE INTO word_meanings (id, entry_id, sense_order, definition)
SELECT UUID(), de.id, 1,
  CASE de.slug
    WHEN 'development' THEN 'The gradual growth, formation, or improvement of something.'
    WHEN 'research' THEN 'A careful study of a subject, especially to discover new facts or information.'
    WHEN 'evidence' THEN 'Facts or information that show whether a belief or proposition is true.'
    WHEN 'significant' THEN 'Important or noticeable, especially because it has an effect or meaning.'
    WHEN 'assess' THEN 'To judge or calculate the quality, importance, amount, or value of something.'
    WHEN 'approach' THEN 'A way of dealing with a person, situation, or problem.'
    WHEN 'context' THEN 'The situation in which something happens and that helps explain it.'
    WHEN 'achieve' THEN 'To succeed in doing or getting something after trying.'
    WHEN 'establish' THEN 'To start or create an organization, system, or lasting relationship.'
    WHEN 'indicate' THEN 'To show, point out, or make something clear.'
    ELSE CONCAT('A useful academic term related to ', de.word, '.')
  END
FROM dictionary_entries de
WHERE de.language_id = '10000000-0000-0000-0000-000000000002'
  AND de.slug IN ('development','research','evidence','significant','assess','approach','context','achieve','establish','indicate');

INSERT IGNORE INTO word_translations (id, meaning_id, language_id, translation)
SELECT UUID(), wm.id, '10000000-0000-0000-0000-000000000001',
  CASE de.slug
    WHEN 'development' THEN 'sự phát triển'
    WHEN 'research' THEN 'nghiên cứu'
    WHEN 'evidence' THEN 'bằng chứng'
    WHEN 'significant' THEN 'đáng kể; quan trọng'
    WHEN 'assess' THEN 'đánh giá'
    WHEN 'approach' THEN 'cách tiếp cận'
    WHEN 'context' THEN 'bối cảnh'
    WHEN 'achieve' THEN 'đạt được'
    WHEN 'establish' THEN 'thiết lập'
    WHEN 'indicate' THEN 'chỉ ra'
    ELSE de.word
  END
FROM word_meanings wm
JOIN dictionary_entries de ON de.id = wm.entry_id
WHERE de.slug IN ('development','research','evidence','significant','assess','approach','context','achieve','establish','indicate');

INSERT IGNORE INTO word_translations (id, meaning_id, language_id, translation)
SELECT UUID(), wm.id, '10000000-0000-0000-0000-000000000003',
  CASE de.slug
    WHEN 'development' THEN '发展'
    WHEN 'research' THEN '研究'
    WHEN 'evidence' THEN '证据'
    WHEN 'significant' THEN '重要的'
    WHEN 'assess' THEN '评估'
    WHEN 'approach' THEN '方法'
    WHEN 'context' THEN '语境'
    WHEN 'achieve' THEN '实现'
    WHEN 'establish' THEN '建立'
    WHEN 'indicate' THEN '表明'
    ELSE de.word
  END
FROM word_meanings wm
JOIN dictionary_entries de ON de.id = wm.entry_id
WHERE de.slug IN ('development','research','evidence','significant','assess','approach','context','achieve','establish','indicate');

INSERT IGNORE INTO word_examples (id, meaning_id, example_order, sentence, translation)
SELECT UUID(), wm.id, examples.example_order, examples.sentence, examples.translation
FROM word_meanings wm
JOIN dictionary_entries de ON de.id = wm.entry_id
JOIN (
  SELECT 1 AS example_order, 'Economic development remains a major priority.' AS sentence, 'Phát triển kinh tế vẫn là một ưu tiên lớn.' AS translation
  UNION ALL SELECT 2, 'The city has invested in sustainable development.', 'Thành phố đã đầu tư vào phát triển bền vững.'
  UNION ALL SELECT 3, 'Language development is supported by regular practice.', 'Sự phát triển ngôn ngữ được hỗ trợ bởi việc luyện tập thường xuyên.'
) examples ON TRUE
WHERE de.slug = 'development' AND wm.sense_order = 1;

INSERT IGNORE INTO word_pronunciations (id, entry_id, accent, ipa, audio_url)
SELECT UUID(), de.id, 'UK', '/dɪˈveləpmənt/', NULL FROM dictionary_entries de WHERE de.slug = 'development'
UNION ALL
SELECT UUID(), de.id, 'US', '/dɪˈveləpmənt/', NULL FROM dictionary_entries de WHERE de.slug = 'development';

INSERT IGNORE INTO vocabulary_items (id, user_id, entry_id, note)
SELECT UUID(), '00000000-0000-0000-0000-000000000001', de.id, 'Start with the academic meaning.'
FROM dictionary_entries de
WHERE de.slug IN ('development', 'research', 'evidence');

INSERT IGNORE INTO review_schedules (id, user_id, vocabulary_item_id, mastery, difficulty, confidence, next_review_at)
SELECT UUID(), vi.user_id, vi.id,
  CASE de.slug WHEN 'development' THEN 0.72 WHEN 'research' THEN 0.58 ELSE 0.41 END,
  0.48, 0.68,
  CASE de.slug WHEN 'development' THEN DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 DAY) ELSE UTC_TIMESTAMP() END
FROM vocabulary_items vi
JOIN dictionary_entries de ON de.id = vi.entry_id
WHERE vi.user_id = '00000000-0000-0000-0000-000000000001';

INSERT IGNORE INTO learning_sessions (id, user_id, language_id, minutes, xp, skill, studied_at) VALUES
  (UUID(), '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 42, 35, 'review', UTC_TIMESTAMP()),
  (UUID(), '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 18, 20, 'listening', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY));

INSERT IGNORE INTO grammar_topics (id, language_id, slug, title, cefr, summary) VALUES
  (UUID(), '10000000-0000-0000-0000-000000000002', 'to-be', 'Verb to be', 'A1', 'Use am, is, and are to describe identity, state, and location.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'present-simple', 'Present simple', 'A1', 'Talk about routines, facts, and repeated actions.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'articles', 'Articles', 'A1', 'Choose a, an, and the with countable and unique nouns.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'past-simple', 'Past simple', 'A2', 'Describe completed events in the past.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'future-forms', 'Future forms', 'A2', 'Compare will, going to, and present continuous for future meaning.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'comparatives', 'Comparatives', 'A2', 'Compare people, places, and ideas with clear structures.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'present-perfect', 'Present perfect', 'B1', 'Connect past events to the present using have or has plus V3.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'conditionals', 'Conditionals', 'B1', 'Express real, likely, and unreal conditions.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'passive-voice', 'Passive voice', 'B1', 'Focus on the action or result rather than the agent.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'reported-speech', 'Reported speech', 'B1', 'Report statements and questions accurately.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'relative-clauses', 'Relative clauses', 'B2', 'Add defining and non-defining information to a noun.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'advanced-conditionals', 'Advanced conditionals', 'B2', 'Use mixed and inverted conditional structures.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'gerunds-infinitives', 'Gerunds and infinitives', 'B2', 'Choose verb patterns that change meaning and grammar.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'cleft-sentences', 'Cleft sentences', 'C1', 'Highlight information for emphasis and contrast.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'inversion', 'Inversion', 'C1', 'Create formal emphasis with negative and limiting adverbials.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'nominalisation', 'Nominalisation', 'C1', 'Build concise academic noun phrases.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'hedging', 'Academic hedging', 'C1', 'Express claims with an appropriate level of certainty.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'cohesion', 'Cohesion and reference', 'C1', 'Link ideas with reference, substitution, and logical connectors.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'subjunctive', 'Mandative subjunctive', 'C2', 'Use formal recommendations and requirements accurately.'),
  (UUID(), '10000000-0000-0000-0000-000000000002', 'complex-sentences', 'Complex academic sentences', 'C2', 'Balance clauses and information density in formal writing.');

INSERT IGNORE INTO courses (id, language_id, slug, title, description, cefr, lesson_count, duration_minutes) VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'english-b1', 'English B1 · Build momentum', 'A structured path through everyday fluency, academic vocabulary, and confident communication.', 'B1', 36, 720),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'academic-english', 'Academic English · Make your ideas clear', 'Build the vocabulary, grammar, and four-skill habits needed for study and professional writing.', 'B2', 28, 560);

INSERT IGNORE INTO course_units (id, course_id, unit_order, title) VALUES
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 1, 'Everyday systems and routines'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 2, 'Stories, opinions, and evidence'),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', 1, 'Research vocabulary and structure'),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', 2, 'Clear claims and careful conclusions');
