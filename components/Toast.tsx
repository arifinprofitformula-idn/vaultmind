"use client";

type ToastProps = {
  message: string;
  type: "success" | "error" | "info";
  onClose?: () => void;
};

const tone = {
  success: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  error: "border-rose-300/20 bg-rose-400/10 text-rose-100",
  info: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
};

export default function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div
      className={`fixed right-4 top-4 z-50 flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${tone[type]}`}
    >
      <p className="leading-6">{message}</p>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2 text-current/70 transition hover:bg-white/10 hover:text-current"
          aria-label="Tutup notifikasi"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
