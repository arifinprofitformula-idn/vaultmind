-- ============================================================
-- VaultMind Database Schema
-- Jalankan di database vaultmind_db sebagai superuser atau owner.
-- ============================================================

-- Extension untuk UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABEL USERS
-- Menyimpan akun pengguna (BUKAN isi vault)
-- Password di sini adalah password login akun,
-- BERBEDA dari master password vault
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  is_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- TABEL EMAIL VERIFICATION TOKENS
-- Token satu kali pakai untuk verifikasi email
-- ============================================================
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evtoken_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_evtoken_user ON email_verification_tokens(user_id);

-- ============================================================
-- TABEL PASSWORD RESET TOKENS
-- Token satu kali pakai untuk reset password akun
-- ============================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prtoken_token ON password_reset_tokens(token);

-- ============================================================
-- TABEL REFRESH TOKENS
-- Untuk rotasi JWT tanpa harus login ulang
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  user_agent  TEXT,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rtoken_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_rtoken_hash ON refresh_tokens(token_hash);

-- ============================================================
-- TABEL VAULTS
-- Hanya menyimpan EncryptedVault blob
-- Server tidak bisa membaca isi vault
-- ============================================================
CREATE TABLE IF NOT EXISTS vaults (
  user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  encrypted_vault  JSONB NOT NULL,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCTION: auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_vaults_updated_at ON vaults;
CREATE TRIGGER trigger_vaults_updated_at
  BEFORE UPDATE ON vaults
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions ke app user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vaultmind_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vaultmind_user;
