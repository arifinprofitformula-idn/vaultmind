"use client";

import AuthShell from "@/components/AuthShell";
import Input from "@/components/Input";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

function isErrorResponse(value: unknown): value is { error: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  useEffect(() => {
    if (!message) return;

    const timeout = window.setTimeout(() => router.replace("/auth/login"), 1800);

    return () => window.clearTimeout(timeout);
  }, [message, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Token tidak ditemukan.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        setError(
          isErrorResponse(data) ? data.error : "Reset password gagal.",
        );
        return;
      }

      setMessage("Password berhasil direset. Silakan login.");
    } catch {
      setError("Tidak dapat menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Password Baru"
      title="Reset password akun"
      description="Ini mengganti password akun VaultMind, bukan master password vault."
    >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Password baru"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            type="password"
            autoComplete="new-password"
            required
          />
          <Input
            label="Konfirmasi password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            autoComplete="new-password"
            required
          />

          {error ? (
            <p className="rounded-xl border border-rose-300/30 bg-rose-950/60 px-4 py-3 text-sm font-semibold text-rose-100">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-xl border border-emerald-300/30 bg-emerald-950/50 px-4 py-3 text-sm font-semibold text-emerald-100">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl border border-cyan-100/35 bg-[#d7f3ff] px-5 py-3 text-sm font-black text-slate-950 shadow-[0_7px_0_rgba(0,0,0,0.45)] transition hover:translate-y-[1px] hover:shadow-[0_5px_0_rgba(0,0,0,0.48)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Menyimpan..." : "Reset password"}
          </button>
        </form>
    </AuthShell>
  );
}
