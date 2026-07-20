"use client";

import type { VaultEntry } from "@/lib/vault-crypto";

type VaultEntryCardProps = {
  entry: VaultEntry;
  onEdit: (entry: VaultEntry) => void;
  onDelete: (id: string) => void;
  onCopy: (value: string, label: string) => void;
};

export default function VaultEntryCard({
  entry,
  onEdit,
  onDelete,
  onCopy,
}: VaultEntryCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-slate-950/20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-black text-white">
              {entry.name}
            </h3>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-bold text-cyan-100">
              {entry.category}
            </span>
          </div>
          <p className="mt-2 truncate text-sm text-slate-400">{entry.username}</p>
          {entry.url ? (
            <p className="mt-1 truncate text-xs text-slate-500">{entry.url}</p>
          ) : null}
        </div>
        <div className="rounded-2xl bg-slate-950/60 px-3 py-2 text-sm font-black tracking-[0.18em] text-slate-200">
          ••••••••••••
        </div>
      </div>

      {entry.notes ? (
        <p className="mt-4 rounded-2xl bg-slate-950/50 p-3 text-sm leading-6 text-slate-300">
          {entry.notes}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCopy(entry.username, "Username")}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-cyan-300/40"
        >
          Copy user
        </button>
        <button
          type="button"
          onClick={() => onCopy(entry.password, "Password")}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-cyan-300/40"
        >
          Copy pass
        </button>
        <button
          type="button"
          onClick={() => onEdit(entry)}
          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-indigo-300/40"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          className="rounded-xl border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-xs font-bold text-rose-100 transition hover:bg-rose-400/15"
        >
          Hapus
        </button>
      </div>
    </article>
  );
}
