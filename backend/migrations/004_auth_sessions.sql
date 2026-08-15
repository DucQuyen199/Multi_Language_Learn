USE multilanguage;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS auth_access_tokens (
  id CHAR(36) PRIMARY KEY,
  token_hash CHAR(64) NOT NULL,
  user_id CHAR(36) NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  revoked_at DATETIME(6) NULL,
  UNIQUE KEY uq_auth_access_token_hash (token_hash),
  KEY idx_auth_access_user (user_id, expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auth_refresh_tokens (
  id CHAR(36) PRIMARY KEY,
  family_id CHAR(36) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  user_id CHAR(36) NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  revoked_at DATETIME(6) NULL,
  replaced_by_id CHAR(36) NULL,
  UNIQUE KEY uq_auth_refresh_token_hash (token_hash),
  KEY idx_auth_refresh_family (family_id, revoked_at),
  KEY idx_auth_refresh_user (user_id, expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (replaced_by_id) REFERENCES auth_refresh_tokens(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
