import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Audit / Terms — VaultMind",
  description:
    "Syarat penggunaan VaultMind: tanggung jawab akun, batas layanan, dan konsekuensi dari arsitektur zero-knowledge.",
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050814]";

const sections = [
  {
    title: "1. Akun Anda",
    paragraphs: [
      "Anda bertanggung jawab menjaga kerahasiaan email dan password akun yang digunakan untuk login ke VaultMind. Aktivitas apa pun yang terjadi lewat sesi login Anda dianggap sebagai tindakan Anda.",
      "Kami dapat mencabut refresh token atau sesi yang terdeteksi mencurigakan (misalnya perubahan user-agent/IP yang tidak wajar) untuk melindungi akun Anda.",
    ],
  },
  {
    title: "2. Master password dan tanggung jawab enkripsi",
    paragraphs: [
      "Vault Anda dienkripsi secara zero-knowledge di perangkat Anda menggunakan master password. Master password tidak pernah dikirim atau disimpan di server kami dalam bentuk apa pun.",
      "Konsekuensinya: jika Anda lupa master password, kami tidak memiliki cara untuk memulihkan isi vault Anda. Kehilangan master password sama dengan kehilangan akses permanen ke data vault yang dienkripsi dengannya. Simpan master password Anda dengan aman di luar sistem kami.",
    ],
  },
  {
    title: "3. Penggunaan yang wajar",
    paragraphs: [
      "Anda setuju untuk tidak menyalahgunakan layanan ini — termasuk namun tidak terbatas pada upaya membobol akun lain, membebani infrastruktur secara sengaja, atau menggunakan VaultMind untuk menyimpan konten ilegal.",
      "Kami berhak menangguhkan akun yang terbukti melanggar ketentuan ini.",
    ],
  },
  {
    title: "4. Ketersediaan layanan",
    paragraphs: [
      "VaultMind saat ini berjalan di infrastruktur yang kami kelola sendiri dan berada pada tahap pengembangan aktif. Kami berupaya menjaga ketersediaan layanan, namun tidak menjamin uptime 100% dan dapat melakukan maintenance yang memengaruhi akses sementara.",
      "Kami menyarankan Anda mengekspor backup vault terenkripsi secara berkala sebagai langkah pencegahan.",
    ],
  },
  {
    title: "5. Paket berbayar",
    paragraphs: [
      "Fitur pada paket Pro (seperti multi-device sync dan encrypted cloud backup) tunduk pada ketentuan langganan yang berlaku saat pembelian. Perubahan harga atau fitur akan diinformasikan sebelum berlaku bagi pelanggan aktif.",
    ],
  },
  {
    title: "6. Penghentian akun",
    paragraphs: [
      "Anda dapat meminta penghapusan akun kapan saja lewat kontak di bawah. Penghapusan akun akan menghapus data akun serta blob vault terenkripsi terkait dari sistem kami.",
      "Kami dapat menangguhkan atau menghapus akun yang melanggar ketentuan penggunaan yang wajar di atas.",
    ],
  },
  {
    title: "7. Perubahan ketentuan",
    paragraphs: [
      "Jika ketentuan ini berubah secara material, kami akan memperbarui tanggal di bagian atas halaman ini dan, bila relevan, menginformasikannya lewat email.",
    ],
  },
];

export default function TermsPage() {
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
            Security Audit / Terms
          </p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
            Syarat Penggunaan VaultMind
          </h1>
          <p className="mt-4 text-sm text-slate-400">
            Terakhir diperbarui: 21 Juli 2026
          </p>
          <p className="mt-6 text-base leading-relaxed text-slate-300">
            Dengan membuat akun dan menggunakan VaultMind, Anda setuju dengan
            ketentuan berikut. Ketentuan ini melengkapi{" "}
            <Link
              href="/privacy"
              className={`font-bold text-cyan-300 hover:text-white ${focusRing}`}
            >
              Privacy Protocol
            </Link>{" "}
            kami, yang menjelaskan bagaimana data dan vault Anda diperlakukan.
          </p>

          <div className="mt-12 space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-lg font-black text-white">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-3">
                  {section.paragraphs.map((p) => (
                    <p
                      key={p}
                      className="text-sm leading-relaxed text-slate-300"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-white/10 pt-8">
            <h2 className="text-lg font-black text-white">Hubungi kami</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Ada pertanyaan seputar ketentuan ini? Hubungi{" "}
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
