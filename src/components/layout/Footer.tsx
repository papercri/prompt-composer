"use client";
import React from "react";

export default function Footer() {
  return (
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
  );
}
