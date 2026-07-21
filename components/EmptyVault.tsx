import { ShieldPlus } from "lucide-react";

export default function EmptyVault() {
  return (
    <div className="rounded-2xl border border-dashed border-[#3b494b] bg-[#1d2026]/45 px-6 py-14 text-center backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00dbe9]/40 bg-[#00dbe9]/10 text-[#00dbe9] shadow-[0_0_32px_rgba(0,219,233,0.14)]">
        <ShieldPlus className="h-8 w-8" />
      </div>
      <h3 className="mt-6 text-lg font-black text-[#e1e2eb]">
        Vault masih kosong
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#b9cacb]">
        Tambahkan credential pertama Anda. Data akan dienkripsi di browser
        sebelum disimpan secara lokal atau disinkronkan.
      </p>
    </div>
  );
}
