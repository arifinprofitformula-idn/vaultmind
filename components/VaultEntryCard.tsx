"use client";

import type { VaultEntry } from "@/lib/vault-crypto";
import { Copy, Edit3, KeyRound, Link2, Trash2, User } from "lucide-react";

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
    <article className="rounded-2xl border border-white/10 bg-[#1d2026]/70 p-5 shadow-xl shadow-black/20 backdrop-blur-xl transition hover:border-[#00dbe9]/50 hover:bg-[#272a31]/80 hover:shadow-[0_0_28px_rgba(0,219,233,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-black text-[#e1e2eb]">
              {entry.name}
            </h3>
            <span className="rounded-full border border-[#00dbe9] bg-[#00dbe9]/10 px-2.5 py-1 text-[11px] font-bold text-[#7df4ff]">
              {entry.category}
            </span>
            {entry.category === "Tagihan" && entry.billingDueDay ? (
              <span className="rounded-full border border-[#d1bcff] bg-[#7000ff]/15 px-2.5 py-1 text-[11px] font-bold text-[#d1bcff]">
                Jatuh tempo tgl {entry.billingDueDay}
              </span>
            ) : null}
          </div>
          <p className="mt-3 flex items-center gap-2 truncate text-sm text-[#b9cacb]">
            <User className="h-4 w-4 shrink-0 text-[#849495]" />
            <span className="truncate">{entry.username || "Tanpa username"}</span>
          </p>
          {entry.url ? (
            <p className="mt-2 flex items-center gap-2 truncate text-xs text-[#849495]">
              <Link2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{entry.url}</span>
            </p>
          ) : null}
        </div>
        <div className="rounded-xl border border-[#3b494b] bg-[#0b0e14]/70 px-3 py-2 text-sm font-black tracking-[0.18em] text-[#e1e2eb]">
          ••••••••••••
        </div>
      </div>

      {entry.notes ? (
        <p className="mt-4 rounded-xl border border-[#3b494b]/70 bg-[#0b0e14]/55 p-3 text-sm leading-6 text-[#b9cacb]">
          {entry.notes}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCopy(entry.username, "Username")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#3b494b] bg-transparent px-3 py-2 text-xs font-bold text-[#e1e2eb] transition hover:border-[#00dbe9] hover:bg-[#00dbe9]/5"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy user
        </button>
        <button
          type="button"
          onClick={() => onCopy(entry.password, "Password")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#3b494b] bg-transparent px-3 py-2 text-xs font-bold text-[#e1e2eb] transition hover:border-[#00dbe9] hover:bg-[#00dbe9]/5"
        >
          <KeyRound className="h-3.5 w-3.5" />
          Copy pass
        </button>
        <button
          type="button"
          onClick={() => onEdit(entry)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#3b494b] bg-transparent px-3 py-2 text-xs font-bold text-[#e1e2eb] transition hover:border-[#d1bcff] hover:bg-[#7000ff]/10"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#ffb4ab]/30 bg-[#ffb4ab]/10 px-3 py-2 text-xs font-bold text-[#ffb4ab] transition hover:bg-[#ffb4ab]/15"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Hapus
        </button>
      </div>
    </article>
  );
}
