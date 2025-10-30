"use client";
import { useEffect, useState } from "react";
import { signInWithGoogle, signInWithGithub, signOut, watchAuthState } from "@/lib/firebase";

export default function Auth({ children }: { children: (user: any) => JSX.Element }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = watchAuthState((u) => setUser(u));
    return () => unsub();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Prompt Composer</h1>
          <p className="mb-6 text-gray-600">Inicia sesión para guardar tus frases y carpetas en la nube.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={signInWithGoogle}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Iniciar sesión con Google
            </button>
            <button
              onClick={signInWithGithub}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg"
            >
              Iniciar sesión con GitHub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <div className="font-bold text-gray-700">Prompt Composer</div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">{user.displayName}</div>
          <button onClick={signOut} className="text-sm text-red-600 hover:underline">
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">{children(user)}</main>
    </div>
  );
}
