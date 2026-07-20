"use client";

import {
  AtSign,
  Bolt,
  CircleHelp,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

function isErrorResponse(value: unknown): value is { error: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  );
}

function isRegisterResponse(
  value: unknown,
): value is { message?: string; verificationUrl?: string } {
  return typeof value === "object" && value !== null;
}

function getStrengthLevel(password: string): {
  label: string;
  activeSegments: number;
} {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  if (password.length === 0) {
    return { label: "Awaiting key", activeSegments: 0 };
  }

  if (score >= 4) {
    return { label: "High", activeSegments: 4 };
  }

  if (score >= 2) {
    return { label: "Medium", activeSegments: 2 };
  }

  return { label: "Low", activeSegments: 1 };
}

type CyberFieldProps = {
  label: string;
  type: "email" | "password" | "text";
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder: string;
  icon: React.ReactNode;
  rightAction?: React.ReactNode;
};

function CyberField({
  label,
  type,
  value,
  onChange,
  autoComplete,
  placeholder,
  icon,
  rightAction,
}: CyberFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#b9cacb]">
        {label}
      </span>
      <span className="group relative block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#b9cacb] transition-colors group-focus-within:text-[#00f2ff]">
          {icon}
        </span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required
          className="w-full rounded-lg border border-[#3a494b] bg-[#010f1f] py-4 pl-12 pr-12 text-base font-semibold text-[#f6f7ff] outline-none transition placeholder:text-[#849495] focus:border-[#00f2ff] focus:bg-[#031426] focus:ring-2 focus:ring-[#00f2ff]/25"
        />
        {rightAction ? (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightAction}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const strength = useMemo(() => getStrengthLevel(password), [password]);

  useEffect(() => {
    if (!message || verificationUrl) return;

    const timeout = window.setTimeout(() => router.replace("/auth/login"), 1800);

    return () => window.clearTimeout(timeout);
  }, [message, router, verificationUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setVerificationUrl("");

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        setError(
          isErrorResponse(data) ? data.error : "Registrasi gagal. Coba lagi.",
        );
        return;
      }

      if (isRegisterResponse(data) && typeof data.verificationUrl === "string") {
        setVerificationUrl(data.verificationUrl);
        setMessage("Registrasi berhasil. Mode lokal: verifikasi lewat link ini.");
        return;
      }

      setMessage("Registrasi berhasil. Cek email untuk verifikasi.");
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#051424] text-[#d4e4fa]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#051424_0%,#0d1c2d_46%,#051424_100%)]" />
      <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_20%_20%,rgba(0,242,255,0.12)_0,transparent_28%),radial-gradient(circle_at_80%_10%,rgba(225,253,255,0.08)_0,transparent_24%),radial-gradient(circle_at_50%_82%,rgba(0,219,231,0.08)_0,transparent_28%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(0,242,255,0.36)_1px,transparent_1px)] [background-size:76px_76px]" />

      <header className="relative z-10 flex items-center justify-between px-5 py-7 md:px-16">
        <Link href="/" className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#051424]">
          <Image
            src="/logo-vaultmind.webp"
            alt="VaultMind Personal Password Manager"
            width={360}
            height={120}
            priority
            className="h-auto w-[150px] object-contain sm:w-[176px]"
          />
        </Link>
        <Link
          href="mailto:halo@vaultmind.id"
          className="flex items-center gap-2 font-mono text-sm tracking-[0.18em] text-[#c3c6d3] transition hover:text-[#e1fdff]"
        >
          <CircleHelp className="h-4 w-4" />
          Support
        </Link>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-92px)] w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-12 pt-6 md:px-16 lg:grid-cols-12 lg:gap-12">
        <div className="hidden flex-col gap-9 lg:col-span-6 lg:flex">
          <div>
            <span className="inline-flex rounded-xl border border-[#849495]/45 bg-[#122131]/55 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.42em] text-[#f6f7ff]">
              System Access
            </span>
            <h1 className="mt-6 max-w-xl text-4xl font-black leading-tight text-white">
              Secure your digital legacy with VaultMind.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#b9cacb]">
              End-to-end encryption for the modern era. Initialize your account
              before creating the master key that only lives in your browser.
            </p>
          </div>

          <div className="relative max-w-[560px] overflow-hidden rounded-xl border border-[#849495]/25 bg-[#010f1f] p-6">
            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_0%,rgba(0,242,255,0.08)_48%,transparent_62%)]" />
            <div className="relative mx-auto w-52 rounded-xl border border-[#3a494b] bg-[#0d1c2d] p-4 shadow-[18px_18px_0_rgba(0,0,0,0.28)]">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#00f2ff]" />
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#b9cacb]">
                  Vault Initializing
                </span>
              </div>
              <div className="space-y-3">
                <div className="h-9 rounded bg-[#e1fdff]" />
                <div className="h-9 rounded bg-[#e1fdff]" />
                <div className="h-2 rounded bg-[#122131]" />
                <div className="h-9 rounded bg-[#e1fdff]" />
                <div className="h-9 rounded bg-[#00f2ff]" />
              </div>
            </div>
          </div>

          <div className="flex gap-14">
            <div>
              <p className="text-2xl font-black text-[#e1fdff]">256-bit</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#b9cacb]">
                Encryption Standard
              </p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#e1fdff]">Zero</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#b9cacb]">
                Knowledge Protocol
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:col-span-6 lg:justify-end">
          <div className="relative w-full max-w-[480px] overflow-hidden rounded-xl border border-[#00f2ff]/35 bg-[#122131]/70 p-8 shadow-[0_28px_80px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(225,253,255,0.08)] backdrop-blur-xl md:p-12">
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(120deg,transparent_0%,rgba(225,253,255,0.08)_42%,transparent_56%)] opacity-60" />
            <div className="relative">
              <div className="mb-10">
                <h2 className="text-2xl font-black text-white">Create Account</h2>
                <p className="mt-2 text-base text-[#b9cacb]">
                  Initialize your secure vault credentials
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <CyberField
                  label="Terminal Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  placeholder="user@vaultmind.sys"
                  icon={<AtSign className="h-6 w-6" />}
                />

                <div className="space-y-2">
                  <CyberField
                    label="Access Key"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter"
                    icon={<LockKeyhole className="h-6 w-6" />}
                    rightAction={
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="text-[#b9cacb] transition hover:text-[#00f2ff]"
                        aria-label={
                          showPassword
                            ? "Sembunyikan password"
                            : "Tampilkan password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    }
                  />
                  <div className="flex gap-1 pt-1">
                    {[0, 1, 2, 3].map((segment) => (
                      <span
                        key={segment}
                        className={`h-0.5 flex-1 rounded-full transition ${
                          segment < strength.activeSegments
                            ? "bg-[#00f2ff]"
                            : "bg-[#849495]/25"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="flex justify-between text-xs text-[#849495]">
                    <span>Entropy Level: {strength.label}</span>
                    <span className="text-[#00dbe7]">Min 8 chars</span>
                  </p>
                </div>

                <CyberField
                  label="Verify Key"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                  placeholder="Ulangi access key"
                  icon={<ShieldCheck className="h-6 w-6" />}
                />

                {error ? (
                  <p className="rounded-lg border border-[#ffb4ab]/35 bg-[#93000a]/35 px-4 py-3 text-sm font-semibold text-[#ffdad6]">
                    {error}
                  </p>
                ) : null}
                {message ? (
                  <p className="rounded-lg border border-[#00f2ff]/35 bg-[#00f2ff]/10 px-4 py-3 text-sm font-semibold text-[#e1fdff]">
                    {message}
                  </p>
                ) : null}
                {verificationUrl ? (
                  <Link
                    href={verificationUrl}
                    className="block rounded-lg border border-[#00f2ff]/40 bg-[#e1fdff] px-4 py-4 text-center font-mono text-sm font-bold uppercase tracking-[0.18em] text-[#00363a] transition hover:bg-white"
                  >
                    Verifikasi email lokal
                  </Link>
                ) : null}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#00f2ff] px-5 py-5 font-mono text-sm font-bold uppercase tracking-[0.22em] text-[#00363a] shadow-[0_18px_45px_rgba(0,0,0,0.38)] transition hover:bg-[#74f5ff] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Mendaftarkan..." : "Daftar"}
                    <Bolt className="h-5 w-5" />
                  </button>
                </div>
              </form>

              <div className="mt-8 border-t border-white/5 pt-8 text-center">
                <p className="text-[#b9cacb]">
                  Already have an active session?{" "}
                  <Link
                    href="/auth/login"
                    className="font-black text-[#e1fdff] transition hover:text-[#00f2ff]"
                  >
                    Masuk
                  </Link>
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-[#849495]/60">
                  <span className="h-px w-10 bg-current" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em]">
                    Secure Protocol
                  </span>
                  <span className="h-px w-10 bg-current" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 flex flex-col items-center justify-between gap-4 px-5 pb-8 font-mono text-xs tracking-[0.18em] text-[#849495] md:flex-row md:px-16">
        <span>(c) 2026 VaultMind Systems. Encrypted Connection.</span>
        <div className="flex gap-6 font-sans text-sm tracking-normal">
          <Link href="/privacy" className="transition hover:text-[#e1fdff]">
            Privacy Protocol
          </Link>
          <Link href="/terms" className="transition hover:text-[#e1fdff]">
            Security Audit
          </Link>
          <Link
            href="mailto:halo@vaultmind.id"
            className="transition hover:text-[#e1fdff]"
          >
            Support
          </Link>
        </div>
      </footer>
    </main>
  );
}
