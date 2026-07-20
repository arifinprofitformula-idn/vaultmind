"use client";

import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-100">{label}</span>
      <input
        {...props}
        className={`mt-2 w-full rounded-xl border border-slate-400 bg-slate-100 px-4 py-3 text-base font-semibold text-slate-950 shadow-[inset_0_2px_0_rgba(255,255,255,0.9),0_7px_0_rgba(0,0,0,0.35)] outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:bg-white focus:shadow-[inset_0_2px_0_rgba(255,255,255,1),0_5px_0_rgba(0,0,0,0.42)] disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      />
      {error ? <p className="mt-2 text-xs text-rose-200">{error}</p> : null}
    </label>
  );
}
