"use client";
import React from "react";
import { signInWithGoogle, signInWithGithub } from "@/lib/firebase";

export default function LoginScreen() {
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
            className="flex items-center justify-center gap-2 bg-white  hover:bg-[#F7ECE1] text-[#DB4437] px-4 py-2.5 rounded-xl font-medium shadow-md transition-all"
          >
            <img
              src="/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Iniciar sesión con Google
          </button>

          <button
            onClick={signInWithGithub}
            className="flex items-center justify-center gap-2 bg-white   text-[#242038]  hover:bg-[#F7ECE1] px-4 py-2.5 rounded-xl font-medium shadow-md transition-all hidden"
          >
            <img
              src="/github.svg"
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
