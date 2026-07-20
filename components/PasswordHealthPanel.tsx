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
        return <ShieldAlert className="h-4 w-4 text-amber-400" />;
      case "old":
        return <Clock className="h-4 w-4 text-sky-400" />;
      case "reused":
        return <Copy className="h-4 w-4 text-purple-400" />;
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
      ? "text-emerald-400"
      : report.score >= 50
        ? "text-amber-400"
        : "text-red-400";

  if (entries.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 text-left"
      >
        <Shield
          className={`h-5 w-5 ${report.score >= 80 ? "text-emerald-400" : report.score >= 50 ? "text-amber-400" : "text-red-400"}`}
        />
        <div className="flex-1">
          <span className="text-sm font-semibold text-slate-200">
            Password Health
          </span>
        </div>
        <span className={`text-lg font-bold ${scoreColor}`}>
          {report.score}
        </span>
        <span className="text-xs text-slate-500">/100</span>
      </button>

      {!expanded && report.issues.length > 0 && (
        <div className="mt-2 flex gap-2">
          {report.weakCount > 0 && (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
              {report.weakCount} lemah
            </span>
          )}
          {report.oldCount > 0 && (
            <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
              {report.oldCount} usang
            </span>
          )}
          {report.reusedCount > 0 && (
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-400">
              {report.reusedCount} duplikat
            </span>
          )}
        </div>
      )}

      {!expanded && report.issues.length === 0 && (
        <p className="mt-2 text-xs text-emerald-400">✨ Semua password aman</p>
      )}

      {/* Expanded */}
      {expanded && (
        <div className="mt-4 space-y-3">
          {report.issues.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-emerald-300">
                Semua password kuat, fresh, dan unik!
              </span>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-400">
                {report.issues.length} isu ditemukan di {report.totalEntries}{" "}
                entri
              </p>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {report.issues.map((issue) => {
                  const entry = entries.find((e) => e.id === issue.entryId);
                  return (
                    <div
                      key={`${issue.entryId}-${issue.type}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2"
                    >
                      {iconForType(issue.type)}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-slate-200">
                          {issue.entryName}
                        </p>
                        <p className="truncate text-[11px] text-slate-500">
                          {issue.detail}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                        {labelForType(issue.type)}
                      </span>
                      {issue.type === "weak" && entry && (
                        <button
                          onClick={() => handleRegenerate(entry)}
                          disabled={regenerating.has(entry.id)}
                          className="shrink-0 rounded-lg bg-amber-500/10 p-1.5 text-amber-400 hover:bg-amber-500/20 transition-colors"
                          title="Generate password kuat"
                        >
                          <Zap
                            className={`h-3.5 w-3.5 ${regenerating.has(entry.id) ? "animate-pulse" : ""}`}
                          />
                        </button>
                      )}
                      <button
                        onClick={() => onNavigateToEntry(issue.entryId)}
                        className="shrink-0 rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:bg-slate-700 transition-colors"
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
          <div className="rounded-xl bg-slate-800/50 px-4 py-3">
            <p className="text-[11px] font-semibold text-slate-300 mb-1">
              💡 Tips keamanan
            </p>
            <ul className="space-y-1 text-[11px] text-slate-500">
              <li>• Gunakan minimal 16 karakter</li>
              <li>• Campur huruf besar, kecil, angka, simbol</li>
              <li>• Jangan pakai password yang sama</li>
              <li>• Ganti password tiap 3 bulan</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
