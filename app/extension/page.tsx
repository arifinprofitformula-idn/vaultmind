import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Instal VaultMind Chrome Extension",
  description:
    "Panduan lengkap mengunduh dan memasang VaultMind Chrome Extension secara manual (unpacked) melalui Developer Mode.",
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050814]";

const EXTENSION_ZIP_URL =
  "https://vaultmind.my.id/extension/vaultmind-chrome-extension.zip";

const steps = [
  {
    icon: "📥",
    title: "Unduh file ZIP",
    description:
      "Klik tombol unduh di bawah untuk mengambil vaultmind-chrome-extension.zip langsung dari domain resmi vaultmind.my.id.",
  },
  {
    icon: "📂",
    title: "Ekstrak ke folder baru",
    description:
      "Ekstrak isi ZIP ke folder baru, misalnya Downloads/vaultmind-ext/. Jangan biarkan file tetap terkompresi — Chrome hanya bisa memuat folder, bukan file .zip.",
  },
  {
    icon: "🧩",
    title: "Buka halaman Extensions",
    description:
      'Ketik chrome://extensions di address bar Chrome, lalu aktifkan toggle "Developer mode" di pojok kanan atas.',
  },
  {
    icon: "📁",
    title: 'Klik "Load unpacked"',
    description:
      "Pilih folder hasil ekstrak (vaultmind-ext/) — pastikan Anda memilih folder yang isinya langsung berisi manifest.json, bukan folder induk atau file ZIP-nya.",
  },
  {
    icon: "✅",
    title: "Selesai",
    description:
      "Ikon VaultMind akan muncul di toolbar Chrome. Klik ikon pin di toolbar agar ekstensi selalu terlihat, lalu login dengan akun VaultMind Anda.",
  },
];

const troubleshooting = [
  {
    q: '"Manifest file is missing or unreadable"',
    a: 'Anda memilih folder yang salah. Masuk ke dalam folder hasil ekstrak sampai Anda benar-benar melihat file manifest.json di dalamnya, lalu pilih folder itu — bukan folder ZIP atau folder induk yang membungkusnya.',
  },
  {
    q: "Tombol Load unpacked tidak muncul",
    a: 'Pastikan toggle "Developer mode" di kanan atas chrome://extensions sudah aktif (berwarna). Tanpa mode ini, opsi Load unpacked disembunyikan oleh Chrome.',
  },
  {
    q: "Chrome menampilkan peringatan setelah instal",
    a: 'Peringatan "Disable developer mode extensions" adalah perilaku normal Chrome untuk ekstensi yang di-load manual (belum lewat Chrome Web Store). Ekstensi tetap berfungsi normal, klik dismiss untuk menutup peringatan.',
  },
  {
    q: "Ada update baru, bagaimana cara memperbarui?",
    a: 'Hapus ekstensi lama lewat tombol "Remove" di chrome://extensions, lalu ulangi kelima langkah di atas dengan ZIP versi terbaru. Chrome tidak mengecek update otomatis untuk ekstensi unpacked.',
  },
];

export default function ExtensionPage() {
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
            Panduan Instalasi
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            Pasang VaultMind Chrome Extension
          </h1>
          <p className="mt-6 text-base leading-relaxed text-slate-300">
            Ekstensi VaultMind belum tersedia di Chrome Web Store, jadi untuk
            saat ini dipasang secara manual lewat mode Developer di Chrome.
            Prosesnya aman dan hanya butuh waktu sekitar satu menit — ikuti
            lima langkah di bawah ini.
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
            <span className="mt-0.5 text-amber-300">⚠</span>
            <p className="text-sm leading-relaxed text-amber-100">
              Hanya unduh ekstensi ini dari domain resmi{" "}
              <strong>vaultmind.my.id</strong>. Jangan pasang file ZIP dari
              sumber lain yang mengaku sebagai VaultMind — Developer mode
              memberi akses penuh ke isi ekstensi, jadi pastikan sumbernya
              terpercaya.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-start gap-3 rounded-3xl border border-white/10 bg-white/[0.045] p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-white">
                vaultmind-chrome-extension.zip
              </p>
              <p className="mt-1 text-xs text-slate-400">
                File ZIP resmi dari server VaultMind
              </p>
            </div>
            <Link
              href={EXTENSION_ZIP_URL}
              className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-3 text-sm font-black text-white shadow-[0_16px_48px_rgba(59,130,246,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_60px_rgba(34,211,238,0.28)] ${focusRing}`}
            >
              Unduh ZIP
            </Link>
          </div>

          <div className="mt-14 space-y-5">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-black text-cyan-200">
                  {index + 1}
                </div>
                <div>
                  <p className="flex items-center gap-2 text-sm font-black text-white">
                    <span aria-hidden>{step.icon}</span>
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <h2 className="text-lg font-black text-white">
              Masalah saat instalasi?
            </h2>
            <div className="mt-4 space-y-4">
              {troubleshooting.map((item) => (
                <div
                  key={item.q}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <p className="text-sm font-bold text-white">{item.q}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
            <p className="text-sm font-bold text-white">
              Mengapa harus mode Developer?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Chrome mewajibkan mode Developer untuk memuat ekstensi yang
              belum melalui review Chrome Web Store. Ini adalah pengaturan
              bawaan Chrome, bukan sesuatu yang khusus dibuat untuk VaultMind.
              Ekstensi tetap berjalan dengan izin (permissions) yang sama
              seperti ekstensi resmi lainnya.
            </p>
          </div>

          <div className="mt-12 border-t border-white/10 pt-8">
            <h2 className="text-lg font-black text-white">Butuh bantuan?</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Jika langkah di atas belum menyelesaikan masalah Anda, hubungi{" "}
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
              <Link href="/privacy" className={`hover:text-white ${focusRing}`}>
                Privacy Policy
              </Link>
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
