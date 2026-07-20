"use client";

import { ArrowLeft, AtSign, Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

type ForgotPasswordResponse = {
  message?: string;
  resetUrl?: string;
};

function isForgotPasswordResponse(
  value: unknown,
): value is ForgotPasswordResponse {
  return typeof value === "object" && value !== null;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setResetUrl("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        setError("Permintaan belum bisa diproses. Coba lagi.");
        return;
      }

      if (isForgotPasswordResponse(data) && typeof data.resetUrl === "string") {
        setResetUrl(data.resetUrl);
      }

      setMessage(
        "Jika email terdaftar dan sudah diverifikasi, link reset akan dikirim.",
      );
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#051424] px-5 py-10 text-[#d4e4fa]">
      <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#00dbe7]/10 blur-[90px]" />
      <div className="absolute -bottom-52 -right-32 h-[620px] w-[620px] rounded-full bg-[#006a71]/12 blur-[95px]" />
      <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(0,219,231,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,219,231,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(5,20,36,0.18)_42%,rgba(5,20,36,0.9)_82%)]" />

      <section className="relative z-10 w-full max-w-[480px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            href="/"
            className="mb-6 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#051424]"
          >
            <Image
              src="/logo-vaultmind.webp"
              alt="VaultMind Personal Password Manager"
              width={360}
              height={120}
              priority
              className="h-auto w-[150px] object-contain sm:w-[176px]"
            />
          </Link>
          <p className="mt-3 font-mono text-xs font-bold uppercase tracking-[0.24em] text-[#b9cacb]">
            Cyber-Security Protocol
          </p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-[#00dbe7]/20 bg-[#122131]/72 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(225,253,255,0.08)] backdrop-blur-xl md:p-10">
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(135deg,rgba(225,253,255,0.1)_0%,rgba(225,253,255,0.02)_50%,rgba(225,253,255,0.1)_100%)] opacity-55" />
          <div className="relative">
            <div className="mb-8">
              <h2 className="text-4xl font-black leading-tight text-[#e1fdff]">
                Lupa Password?
              </h2>
              <p className="mt-5 max-w-[390px] text-lg leading-8 text-[#b9cacb]">
                Masukkan email terdaftar Anda. Kami akan mengirimkan tautan
                untuk mengatur ulang akses keamanan Anda.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <label className="block space-y-3">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#e1fdff]">
                  Email Address
                </span>
                <span className="group relative block">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#b9cacb] transition-colors group-focus-within:text-[#00dbe7]">
                    <AtSign className="h-6 w-6" />
                  </span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    autoComplete="email"
                    placeholder="nama@perusahaan.com"
                    required
                    className="w-full rounded-lg border border-[#3a494b]/55 bg-[#010f1f]/75 py-4 pl-12 pr-4 text-base font-semibold text-[#f6f7ff] outline-none transition placeholder:text-[#849495] focus:border-[#00dbe7] focus:bg-[#051424]/85 focus:ring-2 focus:ring-[#00dbe7]/25"
                  />
                </span>
              </label>

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
              {resetUrl ? (
                <Link
                  href={resetUrl}
                  className="block rounded-lg border border-[#00f2ff]/40 bg-[#e1fdff] px-4 py-4 text-center font-mono text-sm font-bold uppercase tracking-[0.18em] text-[#00363a] transition hover:bg-white"
                >
                  Buka link reset lokal
                </Link>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#00dbe7] px-5 py-5 font-mono text-sm font-bold uppercase tracking-[0.24em] text-[#00363a] shadow-[0_20px_45px_rgba(0,0,0,0.42)] transition hover:bg-[#00f2ff] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Link Reset"}
                <Rocket className="h-5 w-5" />
              </button>
            </form>

            <div className="mt-10 border-t border-[#3a494b]/40 pt-8 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-3 text-[#d4e4fa] transition hover:text-[#00dbe7]"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>
                  Ingat password?{" "}
                  <span className="font-semibold text-[#00dbe7]">Masuk</span>
                </span>
              </Link>
            </div>
          </div>
        </div>

        <footer className="mt-8 flex flex-col items-center gap-4">
          <div className="flex gap-2">
            <span className="h-1 w-12 rounded-full bg-[#00dbe7]/65" />
            <span className="h-1 w-4 rounded-full bg-[#3a494b]/45" />
            <span className="h-1 w-4 rounded-full bg-[#3a494b]/45" />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#849495]/55">
            Encrypted AES-256 Session
          </p>
        </footer>
      </section>
    </main>
  );
}
