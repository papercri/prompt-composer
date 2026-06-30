"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
} from "@/lib/firebase";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getEmailError(email: string): string {
  if (!email.trim()) return "El email es obligatorio";
  if (!EMAIL_REGEX.test(email)) return "Formato de email inválido";
  return "";
}

function getPasswordError(password: string): string {
  if (!password.trim()) return "La contraseña es obligatoria";
  const letters = password.replace(/[^a-zA-Z]/g, "").length;
  const numbers = password.replace(/[^0-9]/g, "").length;
  if (letters < 3 || numbers < 3) {
    return "Mínimo 3 letras y 3 números";
  }
  return "";
}

export default function LoginScreen() {
   const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      if (code === "auth/email-already-in-use") {
        toast.error("Ese email ya está registrado");
      } else if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        toast.error("Email o contraseña incorrectos");
      } else if (code === "auth/weak-password") {
        toast.error("La contraseña debe tener al menos 6 caracteres");
      } else if (code === "auth/invalid-email") {
        toast.error("Email inválido");
      } else {
        toast.error("Error al autenticar");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `bg-white/10 border rounded-xl px-4 py-2.5 text-white placeholder:text-slate-300 outline-none transition-colors ${
      hasError
        ? "border-red-500 focus:border-red-500"
        : "border-white/20 focus:border-white/40"
    }`;
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-(--foreground) to-(--primary) px-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-white">
          Prompt Composer
        </h1>
        <p className="mb-8 text-slate-200 text-sm md:text-base leading-relaxed">
          Inicia sesión para guardar tus frases y carpetas en la nube.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-3 text-left">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            className={inputClass(touched.email && !!emailError)}
          />
          {touched.email && emailError && (
            <p className="text-red-500 text-xs mb-2">{emailError}</p>
          )}
          {!(touched.email && emailError) && <div className="mb-2" />}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              className={`${inputClass(touched.password && !!passwordError)} w-full pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--primary)  hover:text-(--primary-hover)  transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {touched.password && passwordError && (
            <p className="text-red-500 text-xs mb-2">{passwordError}</p>
          )}
          {!(touched.password && passwordError) && <div className="mb-2" />}

          <button
            type="submit"
            disabled={loading}
            className="bg-(--primary) hover:bg-(--primary-hover) text-white px-4 py-2.5 rounded-xl font-medium shadow-md transition-all disabled:opacity-50 mt-1"
          >
            {loading
              ? "Cargando..."
              : mode === "signin"
              ? "Iniciar sesión"
              : "Crear cuenta"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-xs text-slate-300 hover:text-white transition-colors mb-6"
        >
          {mode === "signin"
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-white/20 flex-1" />
          <span className="text-xs text-slate-300">o</span>
          <div className="h-px bg-white/20 flex-1" />
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={signInWithGoogle}
            className="flex items-center justify-center gap-2 bg-white  hover:bg-(--light) text-[#DB4437] px-4 py-2.5 rounded-xl font-medium shadow-md transition-all"
          >
            <img
              src="/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Iniciar sesión con Google
          </button>

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
