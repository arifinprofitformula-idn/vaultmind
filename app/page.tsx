import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { label: "Fitur", href: "#fitur" },
  { label: "Keamanan", href: "#keamanan" },
  { label: "Harga", href: "#harga" },
];

const workSteps = [
  {
    icon: "◆",
    title: "Buat master password",
    description:
      "Master password menjadi kunci utama vault Anda dan tidak disimpan sebagai plaintext.",
  },
  {
    icon: "⌁",
    title: "Kunci dibuat di perangkat",
    description:
      "Browser membuat encryption key dari master password sebelum data sensitif diproses.",
  },
  {
    icon: "▣",
    title: "Vault dienkripsi sebelum disimpan",
    description:
      "Username, password, URL, token, PIN, dan catatan berubah menjadi payload terenkripsi.",
  },
  {
    icon: "▤",
    title: "Server hanya menyimpan data terkunci",
    description:
      "Tanpa master password, isi vault tidak terbaca oleh server maupun pihak lain.",
  },
];

const features = [
  {
    icon: "◇",
    accent: "from-indigo-500 to-cyan-400",
    title: "Vault terenkripsi",
    description:
      "Simpan akses penting dalam vault yang dirancang agar hanya bisa dibuka di perangkat Anda.",
  },
  {
    icon: "⌁",
    accent: "from-emerald-400 to-cyan-400",
    title: "Password generator",
    description:
      "Buat password kuat untuk akun kerja, bisnis, finansial, dan dashboard operasional.",
  },
  {
    icon: "▣",
    accent: "from-violet-500 to-indigo-400",
    title: "Auto-lock",
    description:
      "Vault otomatis terkunci saat idle untuk mengurangi risiko akses tanpa izin.",
  },
  {
    icon: "▥",
    accent: "from-amber-400 to-orange-500",
    title: "Clipboard auto-clear",
    description:
      "Password yang disalin dapat dibersihkan dari clipboard setelah waktu tertentu.",
  },
  {
    icon: "⌕",
    accent: "from-sky-400 to-cyan-300",
    title: "Pencarian cepat",
    description:
      "Temukan credential, token, URL, dan catatan sensitif tanpa membuang waktu.",
  },
  {
    icon: "☁",
    accent: "from-teal-400 to-emerald-400",
    title: "Backup & sync terenkripsi",
    description:
      "Sinkronisasi dan backup tetap membawa data dalam bentuk encrypted blob.",
  },
];

const securityChecklist = [
  "Zero-knowledge architecture",
  "AES-256-GCM untuk enkripsi vault",
  "PBKDF2 untuk penurunan kunci dari master password",
  "Salt dan IV random",
  "Auto-lock saat idle",
  "Tidak menyimpan plaintext password",
  "Encrypted backup/sync",
  "Session/auth dikelola di server sendiri",
];

const pricingPlans = [
  {
    name: "Free",
    price: "Rp0",
    description: "Untuk penggunaan personal dasar",
    cta: "Mulai Gratis",
    highlighted: false,
    features: [
      "Local encrypted vault",
      "Password generator",
      "Pencarian cepat",
      "Auto-lock",
      "Export encrypted backup",
    ],
  },
  {
    name: "Pro",
    price: "Mulai Rp29.000/bulan",
    description: "Untuk profesional yang butuh sync dan backup aman",
    cta: "Upgrade ke Pro",
    highlighted: true,
    features: [
      "Semua fitur Free",
      "Multi-device encrypted sync",
      "Encrypted cloud backup",
      "Priority security update",
      "Self-hosted auth infrastructure",
      "Early access fitur keamanan",
    ],
  },
];

const vaultItems = [
  { name: "Email Utama", meta: "user@email.com", mark: "M" },
  { name: "Internet Banking", meta: "bank.example.com", mark: "B" },
  { name: "Admin Dashboard", meta: "admin.example.com", mark: "</>" },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050814]";

function IconBadge({
  icon,
  accent = "from-indigo-500 to-cyan-400",
  size = "md",
}: {
  icon: string;
  accent?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-10 w-10 text-base rounded-2xl",
    md: "h-14 w-14 text-2xl rounded-2xl",
    lg: "h-16 w-16 text-3xl rounded-3xl",
  };

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br ${accent} ${sizes[size]} shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_18px_40px_rgba(34,211,238,0.18)]`}
    >
      <div className="absolute inset-x-2 top-1 h-1/2 rounded-full bg-white/25 blur-md" />
      <div className="absolute bottom-0 left-1/2 h-1/3 w-2/3 -translate-x-1/2 rounded-full bg-black/20 blur-sm" />
      <span className="relative font-black leading-none text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
        {icon}
      </span>
    </div>
  );
}

function Logo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/logo-vaultmind.webp"
      alt="VaultMind Personal Password Manager"
      width={360}
      height={120}
      priority
      className={`h-auto w-[150px] object-contain sm:w-[176px] ${className}`}
    />
  );
}

function PrimaryCta({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href="/auth/register"
      aria-label="Mulai Gratis dengan VaultMind"
      className={`inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-3 text-sm font-black text-white shadow-[0_16px_48px_rgba(59,130,246,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_20px_60px_rgba(34,211,238,0.28)] ${focusRing} ${className}`}
    >
      {children}
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050814] text-slate-100">
      <div className="absolute inset-x-0 top-0 -z-0 h-[560px] bg-[radial-gradient(circle_at_20%_10%,rgba(79,70,229,0.24),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(34,211,238,0.18),transparent_32%)]" />
      <div className="relative z-10">
        <nav className="border-b border-white/10 bg-[#050814]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <Link href="/" aria-label="VaultMind home" className={focusRing}>
              <Logo />
            </Link>
            <div className="hidden items-center gap-10 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium text-slate-300 transition hover:text-white ${focusRing}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <PrimaryCta className="px-5 py-2.5">Mulai Gratis</PrimaryCta>
          </div>
        </nav>

        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1fr_0.95fr] lg:py-24">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold text-cyan-200">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              Zero-knowledge password manager
            </div>
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.22em] text-indigo-200/80">
              Satu kunci. Semua rahasia. Aman selamanya.
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Kelola semua password penting{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                tanpa menyerahkan rahasia Anda ke server.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              VaultMind menyimpan password, token, PIN, dan catatan sensitif
              dalam vault terenkripsi. Proses enkripsi dan dekripsi dilakukan di
              sisi pengguna, sehingga server hanya menerima data yang sudah
              terkunci.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <PrimaryCta>Mulai Gratis</PrimaryCta>
              <Link
                href="#cara-kerja"
                className={`inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-bold text-white transition hover:border-cyan-200/40 hover:bg-white/[0.07] ${focusRing}`}
              >
                Lihat cara kerjanya
              </Link>
            </div>
            <p className="mt-6 text-sm font-medium text-slate-400">
              Tidak ada plaintext password yang dikirim ke server.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/12 bg-white/[0.045] p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl">
            <div className="rounded-[1.5rem] border border-white/10 bg-[#080d19]/90 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <IconBadge icon="◇" size="sm" />
                    <p className="text-sm font-black text-white">
                      Vault terenkripsi
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Personal access vault
                  </p>
                </div>
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
                  Locked by design
                </span>
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-500">
                Cari di vault...
              </div>
              <div className="mt-4 space-y-3">
                {vaultItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xs font-black text-cyan-200">
                        {item.mark}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {item.name}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {item.meta}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 rounded-xl bg-white/[0.06] px-3 py-2 text-sm font-bold tracking-[0.18em] text-white">
                      ••••••••••••
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-4">
                <p className="text-sm font-black text-white">Keamanan</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Server hanya menyimpan encrypted blob.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-200">
                  {[
                    { label: "AES-256-GCM", icon: "◇" },
                    { label: "PBKDF2", icon: "⌁" },
                    { label: "Auto-lock", icon: "▣" },
                  ].map((stat) => (
                    <span
                      key={stat.label}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-2 py-2 text-center"
                    >
                      <span className="text-cyan-200">{stat.icon}</span>
                      {stat.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6">
          <div className="grid gap-3 rounded-3xl border border-white/10 bg-white/[0.045] px-6 py-6 text-sm font-bold text-slate-200 shadow-[0_18px_70px_rgba(2,6,23,0.4)] sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "AES-256-GCM", icon: "◇" },
              { label: "PBKDF2", icon: "⌁" },
              { label: "Zero-Knowledge", icon: "◆" },
              { label: "Data di Server Anda", icon: "▤" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3"
              >
                <span className="text-lg text-cyan-200">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="cara-kerja" className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
              Cara Kerja
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Cara kerjanya sederhana: rahasia tetap di sisi Anda.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {workSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-slate-950/20"
              >
                <div className="flex items-center justify-between">
                  <IconBadge icon={step.icon} size="sm" />
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-black text-cyan-100">
                    {index + 1}
                  </div>
                </div>
                <h3 className="mt-6 text-base font-black text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="fitur" className="mx-auto max-w-7xl px-6 pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
              Fitur Utama
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Fitur utama yang fokus ke keamanan dan kecepatan.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.065] to-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-cyan-200/30 hover:bg-white/[0.07]"
              >
                <IconBadge
                  icon={feature.icon}
                  accent={feature.accent}
                  size="lg"
                />
                <h3 className="mt-5 text-base font-black text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="keamanan" className="mx-auto max-w-7xl px-6 pb-24">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
                Keamanan
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Keamanan yang bisa dijelaskan, bukan sekadar dipercaya.
              </h2>
              <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.045] p-6">
                <div className="mb-6 grid grid-cols-[auto_1fr] items-center gap-5 rounded-3xl border border-cyan-300/15 bg-slate-950/45 p-5">
                  <IconBadge icon="▤" size="lg" accent="from-slate-700 to-cyan-500" />
                  <div className="grid grid-cols-3 gap-2">
                    {["Auth", "Vault", "Audit"].map((label) => (
                      <div
                        key={label}
                        className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-center text-[11px] font-bold text-slate-300"
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
                <h3 className="text-lg font-black text-white">
                  Kontrol penuh ada di tangan Anda.
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  VaultMind dirancang dengan prinsip zero-knowledge dan
                  dijalankan di infrastruktur kami sendiri untuk menjaga
                  kedaulatan data akun.
                </p>
                <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm font-bold leading-6 text-cyan-100">
                  Server auth kami berjalan di infrastruktur kami sendiri. Tidak
                  ada layanan pihak ketiga yang memegang data akun Anda.
                </div>
                <p className="mt-5 text-sm leading-7 text-slate-400">
                  Kontrol infrastruktur membantu mengurangi ketergantungan pada
                  pihak ketiga, memudahkan audit, dan memperjelas tanggung jawab
                  data yang Anda percayakan.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
              <div className="grid gap-3">
                {securityChecklist.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-300/15 text-xs font-black text-emerald-200">
                      ✓
                    </span>
                    <p className="text-sm leading-6 text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                <p className="text-sm leading-7 text-slate-300">
                  Keamanan tetap bergantung pada master password yang kuat dan
                  perangkat yang bersih dari malware.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="harga" className="mx-auto max-w-7xl px-6 pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
              Harga
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Pilih cara mulai yang paling masuk akal.
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={`relative rounded-3xl border p-7 ${
                  plan.highlighted
                    ? "border-indigo-300/70 bg-indigo-400/[0.07] shadow-[0_24px_80px_rgba(79,70,229,0.18)]"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                {plan.highlighted ? (
                  <span className="absolute right-6 top-0 -translate-y-1/2 rounded-full bg-indigo-500 px-4 py-1 text-xs font-black text-white">
                    Direkomendasikan
                  </span>
                ) : null}
                <p className="text-lg font-black text-white">{plan.name}</p>
                <p className="mt-5 text-3xl font-black text-white">{plan.price}</p>
                <p className="mt-3 text-sm text-slate-400">{plan.description}</p>
                <div className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <span className="mt-0.5 text-emerald-200">✓</span>
                      <p className="text-sm text-slate-300">{feature}</p>
                    </div>
                  ))}
                </div>
                <PrimaryCta className="mt-8 w-full">{plan.cta}</PrimaryCta>
              </article>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 bg-[#030611]">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 md:flex-row md:items-center md:justify-between">
            <Logo className="w-[150px] sm:w-[176px]" />
            <p className="text-sm text-slate-400">
              © 2026 VaultMind. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-5 text-sm text-slate-300">
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
          <p className="mx-auto max-w-7xl px-6 pb-8 text-center text-sm text-slate-500">
            Dibangun untuk membantu profesional menjaga akses digital tetap rapi,
            aman, dan terkendali.
          </p>
        </footer>
      </div>
    </main>
  );
}
