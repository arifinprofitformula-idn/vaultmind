"use client";

import {
  analyzeVaultHealth,
  generateStrongPassword,
  type VaultEntry,
  type VaultHealthReport,
} from "@/lib/vault-crypto";
import {
  AlertTriangle,
  Clock,
  Copy,
  Lock,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  entries: VaultEntry[];
  onNavigateToEntry: (entryId: string) => void;
  onRegeneratePassword: (entryId: string, newPassword: string) => void;
};

export default function PasswordHealthPanel({
  entries,
  onNavigateToEntry,
  onRegeneratePassword,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [regenerating, setRegenerating] = useState<Set<string>>(new Set());

  const report: VaultHealthReport = useMemo(
    () => analyzeVaultHealth(entries),
    [entries],
  );

  const handleRegenerate = (entry: VaultEntry) => {
    setRegenerating((prev) => new Set(prev).add(entry.id));
    const newPassword = generateStrongPassword();
    onRegeneratePassword(entry.id, newPassword);
    setTimeout(
      () =>
        setRegenerating((prev) => {
          const next = new Set(prev);
          next.delete(entry.id);
          return next;
        }),
      600,
    );
  };

  const iconForType = (type: string) => {
    switch (type) {
      case "weak":
        return <ShieldAlert className="h-4 w-4 text-[#d1bcff]" />;
      case "old":
        return <Clock className="h-4 w-4 text-[#00dbe9]" />;
      case "reused":
        return <Copy className="h-4 w-4 text-[#b3c5ff]" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const labelForType = (type: string) => {
    switch (type) {
      case "weak":
        return "Lemah";
      case "old":
        return "Usang";
      case "reused":
        return "Duplikat";
      default:
        return type;
    }
  };

  const scoreColor =
    report.score >= 80
      ? "text-[#7df4ff]"
      : report.score >= 50
        ? "text-[#d1bcff]"
        : "text-[#ffb4ab]";

  if (entries.length === 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0e14]/70 p-4 backdrop-blur-xl">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 text-left"
      >
        <Shield
          className={`h-5 w-5 ${report.score >= 80 ? "text-[#00dbe9]" : report.score >= 50 ? "text-[#d1bcff]" : "text-[#ffb4ab]"}`}
        />
        <div className="flex-1">
          <span className="text-sm font-semibold text-[#e1e2eb]">
            Password Health
          </span>
        </div>
        <span className={`text-lg font-bold ${scoreColor}`}>
          {report.score}
        </span>
        <span className="text-xs text-[#849495]">/100</span>
      </button>

      {!expanded && report.issues.length > 0 && (
        <div className="mt-2 flex gap-2">
          {report.weakCount > 0 && (
            <span className="rounded-full border border-[#d1bcff] bg-[#7000ff]/15 px-2 py-0.5 text-[10px] font-semibold text-[#d1bcff]">
              {report.weakCount} lemah
            </span>
          )}
          {report.oldCount > 0 && (
            <span className="rounded-full border border-[#00dbe9] bg-[#00dbe9]/10 px-2 py-0.5 text-[10px] font-semibold text-[#7df4ff]">
              {report.oldCount} usang
            </span>
          )}
          {report.reusedCount > 0 && (
            <span className="rounded-full border border-[#b3c5ff] bg-[#b3c5ff]/10 px-2 py-0.5 text-[10px] font-semibold text-[#b3c5ff]">
              {report.reusedCount} duplikat
            </span>
          )}
        </div>
      )}

      {!expanded && report.issues.length === 0 && (
        <p className="mt-2 text-xs text-[#7df4ff]">Semua password aman</p>
      )}

      {/* Expanded */}
      {expanded && (
        <div className="mt-4 space-y-3">
          {report.issues.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-[#00dbe9]/40 bg-[#00dbe9]/10 px-4 py-3">
              <ShieldCheck className="h-5 w-5 text-[#00dbe9]" />
              <span className="text-sm text-[#7df4ff]">
                Semua password kuat, fresh, dan unik!
              </span>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#b9cacb]">
                {report.issues.length} isu ditemukan di {report.totalEntries}{" "}
                entri
              </p>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {report.issues.map((issue) => {
                  const entry = entries.find((e) => e.id === issue.entryId);
                  return (
                    <div
                      key={`${issue.entryId}-${issue.type}`}
                      className="flex items-center gap-3 rounded-xl border border-[#3b494b] bg-[#1d2026]/80 px-3 py-2"
                    >
                      {iconForType(issue.type)}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#e1e2eb]">
                          {issue.entryName}
                        </p>
                        <p className="truncate text-[11px] text-[#849495]">
                          {issue.detail}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-[#3b494b] bg-[#0b0e14] px-2 py-0.5 text-[10px] font-semibold text-[#b9cacb]">
                        {labelForType(issue.type)}
                      </span>
                      {issue.type === "weak" && entry && (
                        <button
                          onClick={() => handleRegenerate(entry)}
                          disabled={regenerating.has(entry.id)}
                          className="shrink-0 rounded-lg border border-[#d1bcff]/40 bg-[#7000ff]/10 p-1.5 text-[#d1bcff] transition-colors hover:bg-[#7000ff]/20"
                          title="Generate password kuat"
                        >
                          <Zap
                            className={`h-3.5 w-3.5 ${regenerating.has(entry.id) ? "animate-pulse" : ""}`}
                          />
                        </button>
                      )}
                      <button
                        onClick={() => onNavigateToEntry(issue.entryId)}
                        className="shrink-0 rounded-lg border border-[#3b494b] bg-[#0b0e14] p-1.5 text-[#b9cacb] transition-colors hover:border-[#00dbe9] hover:text-[#00dbe9]"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Tips */}
          <div className="rounded-xl border border-[#3b494b] bg-[#1d2026]/55 px-4 py-3">
            <p className="mb-1 text-[11px] font-semibold text-[#e1e2eb]">
              Tips keamanan
            </p>
            <ul className="space-y-1 text-[11px] text-[#849495]">
              <li>Gunakan minimal 16 karakter</li>
              <li>Campur huruf besar, kecil, angka, simbol</li>
              <li>Jangan pakai password yang sama</li>
              <li>Ganti password tiap 3 bulan</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
