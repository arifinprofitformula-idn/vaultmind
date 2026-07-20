# VaultMind

VaultMind adalah password manager zero-knowledge berbasis Next.js App Router.
Vault disimpan sebagai encrypted blob; isi credential dienkripsi dan didekripsi
di browser dengan master password pengguna.

## Status

Fase saat ini: MVP development lokal.

- Landing page produk tersedia di `/`.
- Auth lokal tersedia di `/auth/register`, `/auth/login`, dan reset password.
- Vault tersedia di `/vault` dan dilindungi optimistic route guard.
- API vault sync dilindungi Bearer access token.
- PostgreSQL diperlukan untuk register, login, refresh token, dan cloud sync.

## Struktur Utama

- `app/` - halaman dan route handlers Next.js.
- `components/` - komponen UI reusable.
- `lib/` - crypto vault, auth helpers, DB, mailer, cookie, dan env server.
- `public/` - aset publik yang benar-benar dipakai.
- `scripts/schema.sql` - schema PostgreSQL aplikasi.
- `proxy.ts` - guard akses halaman `/auth` dan `/vault`.

## Menjalankan Lokal

```bash
npm run dev
```

Buka `http://127.0.0.1:3000`.

Untuk fitur auth dan sync, jalankan PostgreSQL lalu apply `scripts/schema.sql`
ke database yang sama dengan `DATABASE_URL` di `.env.local`.

## Keamanan Akses

- `/vault` diarahkan ke `/auth/login` jika cookie UX `vm_session` tidak ada.
- API sensitif tetap memvalidasi Bearer JWT, bukan hanya cookie UX.
- Refresh token disimpan sebagai cookie `httpOnly`, `sameSite=strict`, dan hanya
  hash token yang disimpan di database.
- JWT secret divalidasi dari env server dan tidak boleh memakai placeholder.
- SMTP placeholder otomatis masuk mode development dan menampilkan link lokal
  untuk verifikasi/reset tanpa mengirim email sungguhan.

## Validasi

```bash
npm run lint
npm run build
```
# vaultmind
