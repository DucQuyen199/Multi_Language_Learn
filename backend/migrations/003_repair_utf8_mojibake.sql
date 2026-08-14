USE multilanguage;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Repair databases initialized before 002_seed.sql declared utf8mb4. The
-- predicates keep this migration idempotent and avoid touching valid Unicode.
UPDATE languages
SET native_name = CONVERT(CAST(CONVERT(native_name USING latin1) AS BINARY) USING utf8mb4),
    flag_emoji = CONVERT(CAST(CONVERT(flag_emoji USING latin1) AS BINARY) USING utf8mb4)
WHERE native_name LIKE _utf8mb4'%Ã%' COLLATE utf8mb4_bin OR native_name LIKE _utf8mb4'%Â%' COLLATE utf8mb4_bin OR native_name LIKE _utf8mb4'%áº%' COLLATE utf8mb4_bin
   OR native_name LIKE _utf8mb4'%á»%' COLLATE utf8mb4_bin OR native_name LIKE _utf8mb4'%å%' COLLATE utf8mb4_bin
   OR flag_emoji LIKE _utf8mb4'%ð%' COLLATE utf8mb4_bin;

UPDATE user_profiles
SET first_name = CONVERT(CAST(CONVERT(first_name USING latin1) AS BINARY) USING utf8mb4)
WHERE first_name LIKE _utf8mb4'%Ã%' COLLATE utf8mb4_bin OR first_name LIKE _utf8mb4'%Â%' COLLATE utf8mb4_bin OR first_name LIKE _utf8mb4'%áº%' COLLATE utf8mb4_bin
   OR first_name LIKE _utf8mb4'%á»%' COLLATE utf8mb4_bin;

UPDATE dictionary_entries
SET ipa = CONVERT(CAST(CONVERT(ipa USING latin1) AS BINARY) USING utf8mb4)
WHERE ipa LIKE _utf8mb4'%Ã%' COLLATE utf8mb4_bin OR ipa LIKE _utf8mb4'%Â%' COLLATE utf8mb4_bin OR ipa LIKE _utf8mb4'%É%' COLLATE utf8mb4_bin OR ipa LIKE _utf8mb4'%Ë%' COLLATE utf8mb4_bin;

UPDATE word_pronunciations
SET ipa = CONVERT(CAST(CONVERT(ipa USING latin1) AS BINARY) USING utf8mb4)
WHERE ipa LIKE _utf8mb4'%Ã%' COLLATE utf8mb4_bin OR ipa LIKE _utf8mb4'%Â%' COLLATE utf8mb4_bin OR ipa LIKE _utf8mb4'%É%' COLLATE utf8mb4_bin OR ipa LIKE _utf8mb4'%Ë%' COLLATE utf8mb4_bin;

UPDATE word_meanings
SET definition = CONVERT(CAST(CONVERT(definition USING latin1) AS BINARY) USING utf8mb4)
WHERE definition LIKE _utf8mb4'%Ã%' COLLATE utf8mb4_bin OR definition LIKE _utf8mb4'%Â%' COLLATE utf8mb4_bin OR definition LIKE _utf8mb4'%áº%' COLLATE utf8mb4_bin
   OR definition LIKE _utf8mb4'%á»%' COLLATE utf8mb4_bin;

UPDATE word_translations
SET translation = CONVERT(CAST(CONVERT(translation USING latin1) AS BINARY) USING utf8mb4)
WHERE translation LIKE _utf8mb4'%Ã%' COLLATE utf8mb4_bin OR translation LIKE _utf8mb4'%Â%' COLLATE utf8mb4_bin OR translation LIKE _utf8mb4'%áº%' COLLATE utf8mb4_bin
   OR translation LIKE _utf8mb4'%á»%' COLLATE utf8mb4_bin OR translation LIKE _utf8mb4'%å%' COLLATE utf8mb4_bin;

UPDATE word_examples
SET sentence = CONVERT(CAST(CONVERT(sentence USING latin1) AS BINARY) USING utf8mb4),
    translation = CONVERT(CAST(CONVERT(translation USING latin1) AS BINARY) USING utf8mb4)
WHERE sentence LIKE _utf8mb4'%Ã%' COLLATE utf8mb4_bin OR sentence LIKE _utf8mb4'%Â%' COLLATE utf8mb4_bin OR sentence LIKE _utf8mb4'%áº%' COLLATE utf8mb4_bin
   OR sentence LIKE _utf8mb4'%á»%' COLLATE utf8mb4_bin OR sentence LIKE _utf8mb4'%â%' COLLATE utf8mb4_bin
   OR translation LIKE _utf8mb4'%Ã%' COLLATE utf8mb4_bin OR translation LIKE _utf8mb4'%Â%' COLLATE utf8mb4_bin OR translation LIKE _utf8mb4'%áº%' COLLATE utf8mb4_bin
   OR translation LIKE _utf8mb4'%á»%' COLLATE utf8mb4_bin OR translation LIKE _utf8mb4'%â%' COLLATE utf8mb4_bin;

UPDATE courses
SET title = CONVERT(CAST(CONVERT(title USING latin1) AS BINARY) USING utf8mb4),
    description = CONVERT(CAST(CONVERT(description USING latin1) AS BINARY) USING utf8mb4)
WHERE title LIKE _utf8mb4'%Ã%' COLLATE utf8mb4_bin OR title LIKE _utf8mb4'%Â%' COLLATE utf8mb4_bin OR title LIKE _utf8mb4'%áº%' COLLATE utf8mb4_bin
   OR title LIKE _utf8mb4'%á»%' COLLATE utf8mb4_bin OR description LIKE _utf8mb4'%Ã%' COLLATE utf8mb4_bin OR description LIKE _utf8mb4'%Â%' COLLATE utf8mb4_bin
   OR description LIKE _utf8mb4'%áº%' COLLATE utf8mb4_bin OR description LIKE _utf8mb4'%á»%' COLLATE utf8mb4_bin;
