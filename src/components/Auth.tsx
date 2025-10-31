"use client";
import React, { useEffect, useState, JSX } from "react";
import {
  signInWithGoogle,
  signInWithGithub,
  signOut,
  watchAuthState,
} from "@/lib/firebase";
import { User } from "firebase/auth";
import { Info, X } from "lucide-react";

export default function Auth({
  children,
}: {
  children: (user: User) => JSX.Element;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const unsub = watchAuthState((u) => setUser(u));
    return () => unsub();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#242038] to-[#9067C6] px-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-white">
            Prompt Composer
          </h1>
          <p className="mb-8 text-slate-200 text-sm md:text-base leading-relaxed">
            Inicia sesión para guardar tus frases y carpetas en la nube.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={signInWithGoogle}
              className="flex items-center justify-center gap-2 bg-[#DB4437] hover:bg-[#C33C30] text-white px-4 py-2.5 rounded-xl font-medium shadow-md transition-all"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Iniciar sesión con Google
            </button>

            <button
              onClick={signInWithGithub}
              className="flex items-center justify-center gap-2 bg-[#242038] hover:bg-black text-white px-4 py-2.5 rounded-xl font-medium shadow-md transition-all"
            >
              <img
                src="https://www.svgrepo.com/show/512317/github-142.svg"
                alt="GitHub"
                className="w-5 h-5"
              />
              Iniciar sesión con GitHub
            </button>
          </div>

          <p className="mt-8 text-xs text-slate-300">
            © {new Date().getFullYear()} Prompt Composer by{" "}
            <a
              href="https://www.linkedin.com/in/cristianasollini/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D4BEE4] hover:text-white transition-colors"
            >
              @papercri
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-[#F7ECE1] to-[#EDE3E9] text-[#242038]">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#242038] via-[#4C3B73] to-[#9067C6] shadow-lg p-3 md:p-4 flex justify-between items-center z-50">
        <div className="font-bold text-white text-lg md:text-xl tracking-tight">
          Prompt Composer
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInfo(true)}
            className="text-white hover:text-[#D4BEE4] transition-colors"
            title="Cómo funciona"
          >
            <Info size={20} />
          </button>

          <span className="hidden sm:block text-sm text-slate-200 truncate max-w-[120px]">
            {user.displayName}
          </span>

          <button
            onClick={signOut}
            className="text-sm text-rose-400 hover:text-rose-300 hover:underline transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 flex flex-col pt-20 w-full overflow-auto">
        {children(user)}
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-gradient-to-r from-[#242038] via-[#4C3B73] to-[#9067C6] text-slate-200 text-sm text-center py-3 flex-shrink-0 shadow-inner">
        © {new Date().getFullYear()} Prompt Composer by{" "}
        <a
          href="https://www.linkedin.com/in/cristianasollini/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#D4BEE4] hover:text-white transition-colors ml-1"
        >
          @papercri
        </a>
      </footer>

      {/* INFO MODAL */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 relative border border-slate-200">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-slate-700 transition"
            >
              <X size={18} />
            </button>
            <h2 className="text-xl font-semibold text-[#242038] mb-3 flex items-center gap-2">
              <Info size={20} className="text-[#9067C6]" /> Cómo funciona
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>Prompt Composer</strong> te permite crear, organizar y
              combinar frases para generar prompts personalizados para tus
              proyectos de IA.  
              <br />
              <br />
              📁 Crea carpetas para clasificar frases.  
              ✍️ Añade o edita frases libres.  
              🖱️ Haz doble clic en una frase para añadirla al prompt.  
              💾 Todo se guarda automáticamente en la nube.  
            </p>
            <div className="mt-5 text-right">
              <button
                onClick={() => setShowInfo(false)}
                className="px-4 py-2 bg-[#9067C6] hover:bg-[#4C3B73] text-white rounded-md text-sm font-medium transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
