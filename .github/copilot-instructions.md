-- Active: 1778991267953@@127.0.0.1@3306
## Tentang Project

VaultMind adalah zero-knowledge password manager berbasis web.
Dibangun sebagai produk digital komersial yang akan dijual/diluncurkan.
Auth sistem sepenuhnya mandiri — tidak menggunakan Supabase Auth atau layanan auth pihak ketiga.

---

## Stack Teknologi

- Next.js 14 App Router + TypeScript (strict mode)
- Tailwind CSS (utility-first, dark theme)
- Web Crypto API — AES-256-GCM + PBKDF2-SHA256 (native browser, zero library)
- IndexedDB via lib/vault-store.ts (BUKAN localStorage)
- PostgreSQL (self-hosted di VPS) — database utama
- bcryptjs — hash password akun (rounds 12)
- jsonwebtoken — JWT access token (15 menit) + refresh token (7 hari)
- nodemailer — email verifikasi dan reset password
- pg (node-postgres) — database client

TIDAK ADA: Supabase, Firebase, Auth0, NextAuth, atau layanan auth eksternal apapun.

---

## ATURAN KRITIS — TIDAK BOLEH DILANGGAR

### Keamanan Vault (Zero-Knowledge)
1. TIDAK PERNAH menyimpan master password atau plaintext password ke server maupun database
2. TIDAK PERNAH menggunakan localStorage untuk menyimpan data vault
3. TIDAK PERNAH mengirim CryptoKey keluar dari browser
4. Enkripsi vault SELALU dilakukan di browser (Web Crypto API) sebelum dikirim ke server
5. Yang tersimpan di PostgreSQL (tabel vaults) hanya EncryptedVault — blob terenkripsi
6. Server tidak bisa membaca isi vault tanpa master password yang hanya ada di kepala user
7. PBKDF2 minimum 600.000 iterasi
8. IV untuk AES-GCM: random 12 byte baru di setiap operasi enkripsi
9. Salt untuk PBKDF2: random 32 byte, tersimpan di dalam objek EncryptedVault

### Keamanan Auth (Self-hosted)
10. Access token (JWT) disimpan di React state (memory) — BUKAN localStorage atau cookie
11. Refresh token disimpan di HttpOnly cookie (SameSite=Strict, Secure, Path=/api/auth)
12. Refresh token di-hash (SHA-256) sebelum disimpan ke database
13. Password akun di-hash dengan bcrypt rounds 12 — TIDAK PERNAH simpan plaintext
14. Password akun (Supabase/auth) BERBEDA dari master password vault — dua lapisan terpisah
15. Login error message TIDAK membedakan "email tidak ditemukan" vs "password salah"
16. Reset password response TIDAK membocorkan apakah email terdaftar atau tidak
17. Semua refresh token di-revoke saat user reset password

---

## Arsitektur Auth (Wajib Dipahami)

```
DUA LAPISAN KEAMANAN:

Lapisan 1 — Auth Akun (server-side):
  User punya email + password akun VaultMind
  → Di-hash dengan bcrypt
  → Disimpan di PostgreSQL tabel users
  → Menghasilkan JWT access token + refresh token

Lapisan 2 — Master Password Vault (client-side only):
  User punya master password vault
  → TIDAK dikirim ke server
  → Dipakai untuk derive CryptoKey via PBKDF2 di browser
  → CryptoKey ini yang mengenkripsi/dekripsi isi vault

Artinya: bahkan jika server dibobol, isi vault tetap tidak bisa dibaca
tanpa master password yang hanya ada di kepala user.
```

---

## Alur Token (JWT)

```
Login → Access Token (15 menit, di memory React)
      + Refresh Token (7 hari, HttpOnly cookie)

Request API → Authorization: Bearer <accessToken>

Token expired → POST /api/auth/refresh
             → Baca refresh token dari cookie
             → Issue access token baru + rotate refresh token
             → AccessToken baru disimpan di memory React

Logout → Revoke refresh token di DB
       → Clear cookie
       → Clear access token dari memory
```

---

## Struktur Folder

```
vaultmind/
├── .github/
│   └── copilot-instructions.md     ← file ini
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── app/
│   ├── page.tsx                    ← Landing page
│   ├── layout.tsx                  ← Wrap dengan AuthProvider
│   ├── globals.css
│   ├── error.tsx
│   ├── vault/
│   │   ├── page.tsx                ← Vault app utama
│   │   └── loading.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── verify/page.tsx         ← Verifikasi email via token
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── verify/route.ts
│       │   ├── login/route.ts
│       │   ├── refresh/route.ts
│       │   ├── logout/route.ts
│       │   ├── forgot-password/route.ts
│       │   └── reset-password/route.ts
│       └── vault/
│           └── sync/route.ts       ← GET, POST, DELETE
├── components/
│   ├── Input.tsx
│   ├── PasswordStrengthBar.tsx
│   ├── Toast.tsx
│   ├── VaultEntryCard.tsx
│   └── EmptyVault.tsx
├── lib/
│   ├── vault-crypto.ts             ← Zero-knowledge crypto engine
│   ├── vault-store.ts              ← IndexedDB operations
│   ├── vault-sync.ts               ← Client-side API calls untuk sync
│   ├── db.ts                       ← PostgreSQL connection pool
│   ├── auth-helpers.ts             ← bcrypt, JWT, token helpers
│   ├── auth-context.tsx            ← React Context untuk auth state
│   ├── get-auth-user.ts            ← JWT guard untuk API routes
│   ├── mailer.ts                   ← nodemailer untuk email
│   ├── rate-limit.ts               ← In-memory rate limiter
│   ├── sanitize.ts                 ← Input sanitization
│   └── env.ts                      ← Environment validation
├── types/
│   ├── vault.ts                    ← Re-export dari vault-crypto.ts
│   └── auth.ts                     ← Auth-related types
├── middleware.ts                    ← Next.js middleware (redirect saja)
├── nginx/
│   └── vaultmind.conf
├── scripts/
│   ├── schema.sql                  ← Database schema lengkap
│   ├── setup-server.sh
│   └── deploy.sh
├── ecosystem.config.js
├── next.config.js
├── .env.local
└── .env.production                 ← Jangan commit ke Git
```

---

## TypeScript Types

```typescript
// lib/vault-crypto.ts — source of truth untuk vault types

type VaultEntry = {
  id: string;                         // crypto.randomUUID()
  name: string;
  username: string;
  password: string;                   // plaintext — hanya ada di memory browser
  url?: string;                       // https:// only
  notes?: string;
  category: "Email" | "Bank" | "Sosmed" | "Kerja" | "Lainnya";
  createdAt: string;                  // ISO 8601
  updatedAt: string;
};

type EncryptedVault = {
  id: "main";
  version: 1;
  kdf: {
    name: "PBKDF2-SHA256";
    iterations: number;               // minimum 600000
    salt: string;                     // base64, 32 bytes random
  };
  cipher: {
    name: "AES-256-GCM";
    iv: string;                       // base64, 12 bytes random per enkripsi
    data: string;                     // base64, ciphertext
  };
  updatedAt: string;
};

// types/auth.ts
type AuthUser = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};
```

---

## Database Schema (PostgreSQL)

```sql
-- Tabel utama
users (id UUID PK, email VARCHAR UNIQUE, password_hash VARCHAR, is_verified BOOLEAN, timestamps)
email_verification_tokens (id, user_id FK, token UNIQUE, expires_at, used_at, created_at)
password_reset_tokens (id, user_id FK, token UNIQUE, expires_at, used_at, created_at)
refresh_tokens (id, user_id FK, token_hash UNIQUE, expires_at, revoked_at, user_agent, ip_address, created_at)
vaults (user_id UUID PK FK, encrypted_vault JSONB, updated_at)

-- Catatan: tabel vaults hanya menyimpan EncryptedVault blob
-- Server tidak bisa membaca isi vault
```

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://vaultmind_user:PASSWORD@localhost:5432/vaultmind_db

# JWT (generate: openssl rand -base64 64)
JWT_ACCESS_SECRET=minimal_64_karakter_random
JWT_REFRESH_SECRET=minimal_64_karakter_berbeda_dari_access
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# App
NEXT_PUBLIC_APP_URL=https://vaultmind.id
APP_URL=https://vaultmind.id

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@domain.com
SMTP_PASS=app_password
SMTP_FROM=VaultMind <noreply@vaultmind.id>
```

---

## Design System

```
Warna:
--bg:        #070a13   Background
--surface:   #101827   Card/panel
--accent:    #818cf8   Indigo (aksi utama)
--accent-2:  #22d3ee   Cyan (highlight)
--text:      #e5e7eb
--muted:     #94a3b8

Border radius:
rounded-2xl = 16px  (input, button)
rounded-3xl = 24px  (card entry)
rounded-[2rem] = 32px (panel besar)

Button primary:  bg-indigo-400 text-slate-950 font-black rounded-2xl
Button secondary: border border-white/10 bg-white/[0.04] text-white rounded-2xl
Button danger:   border border-rose-300/20 bg-rose-400/10 text-rose-100 rounded-2xl
```

---

## Pola Kode Wajib

```typescript
// ✅ Access token di React state (memory), BUKAN storage
const [accessToken, setAccessToken] = useState<string | null>(null);
// atau
const tokenRef = useRef<string | null>(null);

// ✅ CryptoKey di useRef, bukan useState
const keyRef = useRef<CryptoKey | null>(null);

// ✅ Rate limit check di API routes
const rateLimitResult = checkRateLimit(request);
if (!rateLimitResult.allowed) {
  return Response.json({ error: 'Too many requests' }, {
    status: 429,
    headers: { 'Retry-After': String(rateLimitResult.retryAfter) }
  });
}

// ✅ JWT guard di API routes
const user = getAuthUser(request);
if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

// ✅ Sanitize sebelum simpan
const safeName = sanitizeText(form.name);
const safeUrl = validateUrl(form.url);

// ❌ JANGAN simpan token di localStorage
localStorage.setItem('accessToken', token); // SALAH

// ❌ JANGAN kirim plaintext ke API vault
fetch('/api/vault/sync', { body: JSON.stringify({ entries }) }); // SALAH
// Yang benar: kirim EncryptedVault, bukan entries
```

---

## Prompt Template Pembuka Sesi

```
Saya sedang membangun VaultMind — zero-knowledge password manager produk digital komersial.

Baca .github/copilot-instructions.md untuk konteks penuh.

Stack auth: PostgreSQL mandiri + bcrypt + JWT (BUKAN Supabase/Firebase/NextAuth).
Access token disimpan di React state (memory). Refresh token di HttpOnly cookie.
Enkripsi vault hanya di browser via Web Crypto API.
Server hanya menyimpan EncryptedVault blob — tidak bisa membaca isi vault.

Sesi ini kita akan mengerjakan: [TUGAS SPESIFIK]
```