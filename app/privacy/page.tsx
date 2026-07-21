import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Protocol — VaultMind",
  description:
    "Kebijakan privasi VaultMind: data apa yang kami simpan, bagaimana vault Anda dienkripsi secara zero-knowledge, dan hak Anda atas data tersebut.",
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050814]";

const dataWeStore = [
  {
    title: "Data akun",
    items: [
      "Alamat email (untuk login dan verifikasi akun)",
      "Password hash — dihitung dengan bcrypt, bukan password asli Anda",
      "Status verifikasi email dan timestamp pembuatan/pembaruan akun",
    ],
  },
  {
    title: "Token sesi & keamanan",
    items: [
      "Refresh token — hanya hash yang disimpan di server, token asli hidup sebagai cookie httpOnly & sameSite=strict di browser Anda",
      "User-agent dan alamat IP yang terkait dengan setiap refresh token, untuk mendeteksi dan mencabut sesi yang mencurigakan",
      "Token verifikasi email dan token reset password — sekali pakai dan kedaluwarsa otomatis",
    ],
  },
  {
    title: "Vault Anda",
    items: [
      "Satu blob terenkripsi per akun (JSON hasil AES-256-GCM) — bukan field per-item yang bisa dibaca",
      "Server tidak pernah menerima atau menyimpan username, password, URL, catatan, maupun master password Anda dalam bentuk plaintext",
    ],
  },
];

const whatWeDontDo = [
  "Tidak ada analytics pihak ketiga, pixel iklan, atau tracker yang dipasang di aplikasi ini",
  "Tidak ada layanan pihak ketiga yang memegang data akun atau vault Anda — autentikasi dan penyimpanan berjalan di infrastruktur kami sendiri",
  "Master password Anda tidak pernah dikirim ke server dalam bentuk apa pun, dan kami tidak menyimpannya",
  "Kami tidak menjual atau membagikan data Anda kepada pihak ketiga untuk tujuan pemasaran",
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#050814] text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.18),_transparent_55%)]" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Link href="/" aria-label="VaultMind home" className={focusRing}>
            <Image
              src="/logo-vaultmind.webp"
              alt="VaultMind Personal Password Manager"
              width={360}
              height={120}
              priority
              className="w-[150px] sm:w-[176px]"
            />
          </Link>
          <Link
            href="/"
            className={`text-sm font-medium text-slate-300 transition hover:text-white ${focusRing}`}
          >
            ← Kembali ke beranda
          </Link>
        </header>

        <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
            Privacy Protocol
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            Kebijakan Privasi VaultMind
          </h1>
          <p className="mt-4 text-sm text-slate-400">
            Terakhir diperbarui: 21 Juli 2026
          </p>
          <p className="mt-6 text-base leading-relaxed text-slate-300">
            VaultMind adalah password manager dengan arsitektur{" "}
            <em>zero-knowledge</em>: isi vault Anda dienkripsi di perangkat
            Anda sendiri sebelum meninggalkan browser, sehingga server kami
            tidak pernah bisa membacanya. Halaman ini menjelaskan secara
            konkret data apa yang kami simpan, bagaimana enkripsi bekerja,
            dan apa yang tidak kami lakukan terhadap data Anda.
          </p>

          <div className="mt-12 space-y-10">
            {dataWeStore.map((group) => (
              <div key={group.title}>
                <h2 className="text-lg font-black text-white">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 text-cyan-300">▸</span>
                      <p className="text-sm leading-relaxed text-slate-300">
                        {item}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <h2 className="text-lg font-black text-white">
              Bagaimana enkripsi vault bekerja
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Saat Anda memasukkan master password, browser menurunkan kunci
              enkripsi menggunakan PBKDF2-SHA256 dengan 600.000 iterasi dan
              salt acak — proses ini terjadi sepenuhnya di perangkat Anda
              lewat Web Crypto API bawaan browser. Setiap entri vault
              (username, password, URL, catatan, PIN, riwayat password)
              dienkripsi dengan AES-256-GCM dan IV acak sebelum disinkronkan.
              Yang sampai ke server hanyalah blob terenkripsi yang tidak
              berarti apa-apa tanpa master password Anda. Password login akun
              Anda berbeda dari master password vault, dan di-hash terpisah
              di server menggunakan bcrypt.
            </p>
          </div>

          <div className="mt-12">
            <h2 className="text-lg font-black text-white">
              Sesi, cookie, dan email
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Kami menggunakan access token JWT berumur pendek dan refresh
              token yang disimpan sebagai cookie httpOnly &amp; sameSite=strict
              agar tidak bisa diakses lewat JavaScript pihak ketiga. Satu
              cookie tambahan yang tidak sensitif dipakai hanya untuk menandai
              status login di antarmuka. Email verifikasi akun dan reset
              password dikirim lewat SMTP milik kami sendiri — bukan lewat
              layanan pemasaran atau pihak ketiga.
            </p>
          </div>

          <div className="mt-12">
            <h2 className="text-lg font-black text-white">
              Yang tidak kami lakukan
            </h2>
            <ul className="mt-4 space-y-3">
              {whatWeDontDo.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-emerald-300">✓</span>
                  <p className="text-sm leading-relaxed text-slate-300">
                    {item}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12">
            <h2 className="text-lg font-black text-white">Hak Anda</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Anda dapat mengekspor backup vault terenkripsi Anda kapan saja,
              mencabut sesi aktif dari perangkat lain, atau meminta penghapusan
              akun beserta seluruh data yang terkait dengannya. Karena vault
              dienkripsi secara zero-knowledge, kami tidak dapat memulihkan
              isi vault Anda jika master password hilang — simpan master
              password Anda di tempat yang aman.
            </p>
          </div>

          <div className="mt-12">
            <h2 className="text-lg font-black text-white">
              Perubahan kebijakan
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Jika kebijakan ini berubah secara material, kami akan
              memperbarui tanggal di bagian atas halaman ini dan, bila relevan,
              menginformasikannya lewat email.
            </p>
          </div>

          <div className="mt-12 border-t border-white/10 pt-8">
            <h2 className="text-lg font-black text-white">Hubungi kami</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Ada pertanyaan seputar privasi atau ingin menghapus akun Anda?
              Hubungi{" "}
              <Link
                href="mailto:halo@vaultmind.id"
                className={`font-bold text-cyan-300 hover:text-white ${focusRing}`}
              >
                halo@vaultmind.id
              </Link>
              .
            </p>
          </div>
        </section>

        <footer className="relative z-10 border-t border-white/10 bg-[#030611]">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>© 2026 VaultMind. All rights reserved.</p>
            <div className="flex flex-wrap gap-5 text-slate-300">
              <Link href="/terms" className={`hover:text-white ${focusRing}`}>
                Terms
              </Link>
              <Link
                href="mailto:halo@vaultmind.id"
                className={`hover:text-white ${focusRing}`}
              >
                Kontak
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
