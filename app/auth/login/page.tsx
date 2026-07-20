"use client";

import { useAuth } from "@/lib/auth-context";
import {
  AtSign,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Shield,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type LoginFieldProps = {
  label: string;
  type: "email" | "password" | "text";
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder: string;
  icon: React.ReactNode;
  rightAction?: React.ReactNode;
};

function LoginField({
  label,
  type,
  value,
  onChange,
  autoComplete,
  placeholder,
  icon,
  rightAction,
}: LoginFieldProps) {
  return (
    <label className="block space-y-3">
      <span className="font-mono text-xs font-bold tracking-[0.18em] text-[#d4e4fa]">
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
          className="w-full rounded-lg border border-[#3a494b]/70 bg-[#010f1f] py-4 pl-12 pr-12 text-base font-semibold text-[#f6f7ff] outline-none transition placeholder:text-[#849495] focus:border-[#00dbe7] focus:bg-[#051424] focus:ring-2 focus:ring-[#00dbe7]/25"
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

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.replace("/vault");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login gagal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#051424] px-5 py-10 text-[#d4e4fa]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,219,231,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,219,231,0.035)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="absolute left-1/2 top-1/2 h-[780px] w-[780px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00dbe7]/10 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,219,231,0.11)_0,rgba(5,20,36,0.18)_34%,rgba(5,20,36,0.86)_78%)]" />

      <section className="relative z-10 w-full max-w-[440px]">
        <div className="mb-10 flex flex-col items-center text-center">
          <Link
            href="/"
            className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl border border-[#e1fdff]/20 bg-[#e1fdff]/10 text-[#e1fdff] shadow-[0_18px_45px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(225,253,255,0.12)]"
          >
            <Shield className="h-9 w-9" strokeWidth={2.4} />
          </Link>
          <h1 className="text-4xl font-black tracking-tight text-[#e1fdff]">
            VaultMind
          </h1>
          <p className="mt-3 font-mono text-xs font-bold uppercase tracking-[0.32em] text-[#b9cacb]/75">
            Secure Session Entry
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-[#00dbe7]/25 bg-[#122131]/70 p-8 shadow-[0_28px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(225,253,255,0.08)] backdrop-blur-2xl">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(45deg,transparent_20%,rgba(0,219,231,0.06)_50%,transparent_80%)] opacity-80" />
          <form onSubmit={handleSubmit} className="relative space-y-6">
            <LoginField
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              placeholder="name@company.com"
              icon={<AtSign className="h-6 w-6" />}
            />

            <LoginField
              label="Security Key"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              placeholder="Password akun"
              icon={<LockKeyhole className="h-6 w-6" />}
              rightAction={
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="text-[#b9cacb] transition hover:text-[#00f2ff]"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
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

            {error ? (
              <p className="rounded-lg border border-[#ffb4ab]/35 bg-[#93000a]/35 px-4 py-3 text-sm font-semibold text-[#ffdad6]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative mt-4 w-full overflow-hidden rounded-lg bg-[#00dbe7] px-5 py-4 font-mono text-sm font-bold uppercase tracking-[0.24em] text-[#00363a] shadow-[0_18px_45px_rgba(0,0,0,0.38)] transition hover:-translate-y-px hover:bg-[#74f5ff] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="relative mt-8 border-t border-[#00dbe7]/10 pt-6">
            <div className="flex items-center justify-between">
              <Link
                href="/auth/register"
                className="flex items-center gap-2 text-[#d4e4fa] transition hover:text-[#00f2ff]"
              >
                <UserPlus className="h-5 w-5" />
                Daftar
              </Link>
              <Link
                href="/auth/forgot-password"
                className="flex items-center gap-2 text-[#d4e4fa] transition hover:text-[#00f2ff]"
              >
                <KeyRound className="h-5 w-5" />
                Lupa Password
              </Link>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-[#c3c6d3]/45">
          <p className="text-sm">(c) 2026 VaultMind Systems. Encrypted Connection.</p>
          <div className="mt-3 flex justify-center gap-4">
            <span className="rounded border border-[#00f2ff]/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#00f2ff]">
              AES-256
            </span>
            <span className="rounded border border-[#00f2ff]/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#00f2ff]">
              TLS 1.3
            </span>
          </div>
        </footer>
      </section>
    </main>
  );
}
