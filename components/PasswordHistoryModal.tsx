"use client";

import type { PasswordHistoryEntry, VaultEntry } from "@/lib/vault-crypto";
import { ArrowLeft, Clock, History, RotateCcw } from "lucide-react";
import { useState } from "react";

type Props = {
  entry: VaultEntry;
  onClose: () => void;
  onRestore: (entryId: string, oldPassword: string) => void;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PasswordHistoryModal({ entry, onClose, onRestore }: Props) {
  const [restoring, setRestoring] = useState<string | null>(null);
  const history = entry.passwordHistory || [];

  const handleRestore = (old: PasswordHistoryEntry) => {
    setRestoring(old.changedAt);
    onRestore(entry.id, old.password);
    setTimeout(() => setRestoring(null), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0a0e1a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-slate-200">
              Riwayat Password
            </h2>
            <p className="text-xs text-slate-500">{entry.name}</p>
          </div>
          <History className="h-5 w-5 text-slate-600" />
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto p-4">
          {/* Current */}
          <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                SAAT INI
              </span>
            </div>
            <p className="font-mono text-sm text-emerald-300 break-all">
              {entry.password}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Diperbarui {formatDate(entry.updatedAt)}
            </p>
          </div>

          {/* Timeline */}
          {history.length === 0 ? (
            <div className="py-8 text-center">
              <Clock className="mx-auto h-8 w-8 text-slate-700 mb-2" />
              <p className="text-sm text-slate-500">Belum ada riwayat</p>
              <p className="text-xs text-slate-600">
                Password sebelumnya akan muncul di sini
              </p>
            </div>
          ) : (
            <div className="relative pl-6 before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-px before:bg-slate-800">
              {history
                .slice()
                .reverse()
                .map((h, i) => (
                  <div
                    key={h.changedAt}
                    className="relative mb-4 last:mb-0"
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-[23px] top-2 h-2 w-2 rounded-full bg-slate-700 ring-2 ring-[#0a0e1a]" />

                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                          VERSI {history.length - i}
                        </span>
                        <span className="text-[11px] text-slate-600">
                          {formatDate(h.changedAt)}
                        </span>
                      </div>
                      <p className="font-mono text-sm text-slate-400 break-all">
                        {h.password}
                      </p>
                      <button
                        onClick={() => handleRestore(h)}
                        disabled={restoring === h.changedAt}
                        className="mt-2 flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw
                          className={`h-3 w-3 ${restoring === h.changedAt ? "animate-spin" : ""}`}
                        />
                        Pulihkan
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-5 py-3">
          <p className="text-[10px] text-slate-600 text-center">
            Riwayat password disimpan secara lokal & terenkripsi
          </p>
        </div>
      </div>
    </div>
  );
}
