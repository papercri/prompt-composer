"use client";
import React from "react";
import { Info } from "lucide-react";
import { User } from "firebase/auth";
import { signOut } from "@/lib/firebase";

export default function Header({
  user,
  onShowInfo,
}: {
  user: User;
  onShowInfo: () => void;
}) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-[#242038] via-[#4C3B73] to-[#9067C6] shadow-lg p-3 md:p-4  z-50">
      <div className="flex-1 flex  w-full overflow-auto max-w-[1400px] mx-auto   justify-between items-center">
        <div className="font-bold text-white text-lg md:text-xl tracking-tight">
          Prompt Composer
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onShowInfo}
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

      </div>
      
    </header>
  );
}
