"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  hasError: boolean;
};

export function PasswordInput({ value, onChange, onBlur, hasError }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  const inputClass = `bg-white/10 border rounded-xl px-4 py-2.5 text-white placeholder:text-slate-300 outline-none transition-colors w-full pr-11 ${
    hasError ? "border-red-500 focus:border-red-500" : "border-white/20 focus:border-white/40"
  }`;

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder="Contraseña"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={inputClass}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-(--primary)  hover:text-(--primary-hover)  transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}