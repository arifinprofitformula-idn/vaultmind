export default function EmptyVault() {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.035] px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-2xl font-black text-white shadow-[0_18px_44px_rgba(34,211,238,0.2)]">
        ◇
      </div>
      <h3 className="mt-6 text-lg font-black text-white">
        Vault masih kosong
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
        Tambahkan credential pertama Anda. Data akan dienkripsi di browser
        sebelum disimpan secara lokal atau disinkronkan.
      </p>
    </div>
  );
}
