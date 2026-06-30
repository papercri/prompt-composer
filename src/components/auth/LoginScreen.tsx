"use client";
import React, { useState } from "react";
import { EmailPasswordForm } from "./EmailPasswordForm";
import { GoogleSignInButton } from "./GoogleSignInButton";

export default function LoginScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-(--foreground) to-(--primary) px-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-white">
          Prompt Composer
        </h1>
        <p className="mb-8 text-slate-200 text-sm md:text-base leading-relaxed">
          Inicia sesión para guardar tus frases y carpetas en la nube.
        </p>

        <EmailPasswordForm key={mode} mode={mode} />

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-xs text-slate-300 hover:text-white transition-colors mb-6"
        >
          {mode === "signin" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-white/20 flex-1" />
          <span className="text-xs text-slate-300">o</span>
          <div className="h-px bg-white/20 flex-1" />
        </div>

        <div className="flex flex-col gap-3">
          <GoogleSignInButton />
        </div>

        <p className="mt-8 text-xs text-slate-300">
          © {new Date().getFullYear()} Prompt Composer by{" "}
          <a
            href="https://frontend-ux.website/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-(--rose) hover:text-white transition-colors"
          >
            Cristiana Sollini
          </a>
        </p>
      </div>
    </div>
  );
}