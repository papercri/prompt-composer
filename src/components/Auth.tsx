"use client";
import { useEffect, useState } from "react";
import {
  signInWithGoogle,
  signInWithGithub,
  signOut,
  watchAuthState,
} from "@/lib/firebase";

export default function Auth({
  children,
}: {
  children: (user: any) => JSX.Element;
}) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = watchAuthState((u) => setUser(u));
    return () => unsub();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 tracking-tight">
            Prompt Composer
          </h1>
          <p className="mb-8 text-gray-600 text-sm md:text-base leading-relaxed">
            Inicia sesión para guardar tus frases y carpetas en la nube.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={signInWithGoogle}
              className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-md transition-all"
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
              className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-xl font-medium shadow-md transition-all"
            >
              <img
                src="https://www.svgrepo.com/show/512317/github-142.svg"
                alt="GitHub"
                className="w-5 h-5"
              />
              Iniciar sesión con GitHub
            </button>
          </div>

          <p className="mt-8 text-xs text-gray-400">
            © {new Date().getFullYear()} Prompt Composer
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md p-3 md:p-4 flex justify-between items-center z-50">
        <div className="font-bold text-gray-700 text-lg md:text-xl">
          Prompt Composer
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-gray-600 truncate max-w-[120px]">
            {user.displayName}
          </span>
          <button
            onClick={signOut}
            className="text-sm text-red-600 hover:text-red-700 hover:underline transition-colors"
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
      <footer className="w-full bg-slate-900 text-slate-200 text-sm text-center py-3 flex-shrink-0">
        © {new Date().getFullYear()} Prompt Composer —{" "}
        <a
          href="https://www.linkedin.com/in/cristianasollini/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-300 hover:text-white transition-colors"
        >
          @papercri
        </a>
      </footer>
    </div>
  );
}
