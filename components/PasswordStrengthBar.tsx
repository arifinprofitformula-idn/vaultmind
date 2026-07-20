"use client";

type PasswordStrengthBarProps = {
  password: string;
};

function scorePassword(password: string) {
  let score = 0;

  if (password.length >= 12) score += 25;
  if (password.length >= 16) score += 25;
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;

  if (score >= 80) {
    return { label: "Sangat kuat", tone: "bg-emerald-400", score };
  }

  if (score >= 55) {
    return { label: "Cukup kuat", tone: "bg-amber-400", score };
  }

  return { label: "Perlu diperkuat", tone: "bg-rose-400", score };
}

export default function PasswordStrengthBar({
  password,
}: PasswordStrengthBarProps) {
  const result = scorePassword(password);
  const width = password.length === 0 ? 0 : Math.max(result.score, 12);

  return (
    <div className="space-y-2">
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${result.tone}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="text-xs font-medium text-slate-400">
        Kekuatan password: {password.length === 0 ? "Belum diisi" : result.label}
      </p>
    </div>
  );
}
