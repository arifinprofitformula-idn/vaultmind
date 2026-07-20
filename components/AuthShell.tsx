import Link from "next/link";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070a0f] px-6 py-12 text-slate-100">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#070a0f_0%,#101722_48%,#080b11_100%)]" />
      <div className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rotate-45 border border-slate-500/10 bg-slate-950/20 shadow-[18px_18px_0_rgba(0,0,0,0.22)]" />
      <div className="absolute left-[12%] top-[18%] h-28 w-44 -rotate-12 border border-slate-500/15 bg-slate-900/45 shadow-[12px_14px_0_rgba(0,0,0,0.24)]" />
      <div className="absolute bottom-[12%] right-[10%] h-36 w-56 rotate-12 border border-slate-500/15 bg-slate-800/25 shadow-[14px_16px_0_rgba(0,0,0,0.28)]" />

      <section className="relative w-full max-w-md">
        <div className="rounded-[28px] border border-slate-500/25 bg-[#111821] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="rounded-[22px] border border-black/50 bg-[#0b1119] p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8">
            <div className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-3 text-sm font-black text-slate-100"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-500/30 bg-slate-200 text-sm font-black text-slate-950 shadow-[4px_5px_0_rgba(0,0,0,0.35)]">
                  V
                </span>
                VaultMind
              </Link>
              <p className="mt-8 text-xs font-black uppercase text-cyan-200">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight text-white">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {description}
              </p>
            </div>

            {children}

            {footer ? (
              <div className="mt-6 border-t border-slate-600/25 pt-5">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
