"use client";
import React from "react";
import { Info, X } from "lucide-react";

export default function InfoModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 relative border border-slate-200">
        <button
          onClick={onClose}
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
          <ul style={{ listStyleType: "disc", marginLeft: "20px", marginTop: "8px" }}>
            <li>Crea carpetas para clasificar frases.</li>
            <li>Añade o edita carpetas.  </li>
            <li>Arrastra las frases en las carpetas para mantener todo ordenado.</li>
            <li>Haz doble clic en una frase para añadirla al prompt.  </li>
            <li>Todo se guarda automáticamente en la nube.</li>

          </ul>
   
        </p>
        <div className="mt-5 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#9067C6] hover:bg-[#4C3B73] text-white rounded-md text-sm font-medium transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
