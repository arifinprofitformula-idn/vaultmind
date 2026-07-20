"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Status = "loading" | "success" | "error";

function isErrorResponse(value: unknown): value is { error: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  );
}

export default function VerifyPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Memverifikasi email...");

  useEffect(() => {
    let active = true;

    async function verifyEmail() {
      const token = new URLSearchParams(window.location.search).get("token");

      if (!token) {
        setStatus("error");
        setMessage("Token tidak ditemukan.");
        return;
      }

      try {
        const response = await fetch(
          `/api/auth/verify?token=${encodeURIComponent(token)}`,
        );
        const data: unknown = await response.json();

        if (!active) return;

        if (!response.ok) {
          setStatus("error");
          setMessage(
            isErrorResponse(data)
              ? data.error
              : "Token tidak valid atau sudah expired.",
          );
          return;
        }

        setStatus("success");
        setMessage("Email berhasil diverifikasi. Silakan login.");
      } catch {
        if (!active) return;
        setStatus("error");
        setMessage("Tidak dapat menghubungi server.");
      }
    }

    verifyEmail();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050814] px-6 py-12 text-slate-100">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.045] p-8 text-center shadow-2xl shadow-cyan-950/20">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-200">
          Verifikasi Email
        </p>
        <h1 className="mt-4 text-3xl font-black text-white">
          {status === "loading"
            ? "Mohon tunggu"
            : status === "success"
              ? "Email terverifikasi"
              : "Verifikasi gagal"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-300">{message}</p>

        {status === "success" ? (
          <Link
            href="/auth/login"
            className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-3 text-sm font-black text-white"
          >
            Login Sekarang
          </Link>
        ) : null}
      </div>
    </main>
  );
}
