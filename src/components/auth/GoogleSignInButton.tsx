"use client";
import React from "react";
import { signInWithGoogle } from "@/lib/firebase";

export function GoogleSignInButton() {
  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center justify-center gap-2 bg-white hover:bg-(--light) text-[#DB4437] px-4 py-2.5 rounded-xl font-medium shadow-md transition-all"
    >
      <img src="/google-color.svg" alt="Google" className="w-5 h-5" />
      Iniciar sesión con Google
    </button>
  );
}