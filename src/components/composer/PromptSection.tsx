import { Clipboard, Trash2 } from "lucide-react";

interface PromptSectionProps {
  promptText: string;
  setPromptText: (text: string) => void;
  copyPrompt: () => void;
  clearPrompt: () => void;
}

export default function PromptSection({
  promptText,
  setPromptText,
  copyPrompt,
  clearPrompt,
}: PromptSectionProps) {
  return (
    <section className="bg-white border border-[#CAC4CE] rounded-2xl shadow-lg p-5 flex flex-col flex-1 max-h-[350px]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-[#242038]">
          <Clipboard className="text-[#9067C6]" size={18} />
          Prompt generado
        </h3>
        <div className="flex gap-2">
          <button
            onClick={copyPrompt}
            className="bg-[#9067C6] hover:bg-[#8D86C9] text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm font-medium shadow-sm transition-all"
          >
            <Clipboard size={16} /> Copiar
          </button>
          <button
            onClick={clearPrompt}
            className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm font-medium shadow-sm transition-all"
          >
            <Trash2 size={16} /> Borrar
          </button>
        </div>
      </div>

      <textarea
        value={promptText}
        onChange={(e) => setPromptText(e.target.value)}
        placeholder="Doble clic en frases o escribe manualmente..."
        className="w-full flex-1 border border-[#CAC4CE] rounded-lg p-3 text-sm font-mono resize-none focus:ring-2 focus:ring-[#9067C6] outline-none bg-[#F7ECE1]"
      />
    </section>
  );
}
