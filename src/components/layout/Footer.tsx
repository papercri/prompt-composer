"use client";
import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-linear-to-r from-(--foreground) via-(--secondary) to-(--primary) text-slate-200 text-sm text-center py-3 shrink-0 shadow-inner">
      © {new Date().getFullYear()} Prompt Composer by{" "}
      <a
        href="https://www.linkedin.com/in/cristianasollini/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-(--rose)  hover:text-white transition-colors ml-1"
      >
        @papercri
      </a>
    </footer>
  );
}
