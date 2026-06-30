"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { signInWithEmail, signUpWithEmail } from "@/lib/firebase";
import { getEmailError, getPasswordError } from "@/lib/validation";
import { PasswordInput } from "./PasswordInput";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "Ese email ya está registrado",
  "auth/invalid-credential": "Email o contraseña incorrectos",
  "auth/wrong-password": "Email o contraseña incorrectos",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
  "auth/invalid-email": "Email inválido",
};

type EmailPasswordFormProps = {
  mode: "signin" | "signup";
};

export function EmailPasswordForm({ mode }: EmailPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);

  const emailError = getEmailError(email);
  const passwordError = getPasswordError(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (emailError || passwordError) {
      toast.error("Revisa los campos del formulario");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (error) {
      const code = (error as { code?: string }).code || "";
      toast.error(AUTH_ERROR_MESSAGES[code] || "Error al autenticar");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `bg-white/10 border rounded-xl px-4 py-2.5 text-white placeholder:text-slate-300 outline-none transition-colors ${
      hasError ? "border-red-500 focus:border-red-500" : "border-white/20 focus:border-white/40"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-1 mb-3 text-left">
      <input
        type="email"
        placeholder="Email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        className={inputClass(touched.email && !!emailError)}
      />
      {touched.email && emailError ? (
        <p className="text-red-500 text-xs mb-2">{emailError}</p>
      ) : (
        <div className="mb-2" />
      )}

      <PasswordInput
        value={password}
        onChange={setPassword}
        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
        hasError={touched.password && !!passwordError}
      />
      {touched.password && passwordError ? (
        <p className="text-red-500 text-xs mb-2">{passwordError}</p>
      ) : (
        <div className="mb-2" />
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-(--primary) hover:bg-(--primary-hover) text-white px-4 py-2.5 rounded-xl font-medium shadow-md transition-all disabled:opacity-50 mt-1"
      >
        {loading ? "Cargando..." : mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}
      </button>
    </form>
  );
}