import { FilePlus } from "lucide-react";

interface FreePhrasesProps {
  data: { free: string[] };
  newPhrase: string;
  setNewPhrase: (value: string) => void;
  addPhrase: () => void;
  deletePhrase: (category: null, index: number) => void;
  onDragStart: (e: React.DragEvent, type: string, category: null, index: number) => void;
  onDropToFree: (e: React.DragEvent) => void;
  appendToPrompt: (phrase: string) => void;
}

export default function FreePhrases({
  data,
  newPhrase,
  setNewPhrase,
  addPhrase,
  deletePhrase,
  onDragStart,
  onDropToFree,
  appendToPrompt,
}: FreePhrasesProps) {
  return (
    <section
      className="bg-white border border-[#CAC4CE] rounded-2xl shadow-lg p-5 flex flex-col"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDropToFree}
    >
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#242038]">
        <FilePlus size={18} className="text-[#9067C6]" />
        Frases libres
      </h2>

      <div className="flex flex-wrap gap-2 mb-5">
        {data.free.map((p: string, i: number) => (
          <div
            key={i}
            draggable
            onDragStart={(e) => onDragStart(e, "free", null, i)}
            onDoubleClick={() => appendToPrompt(p)}
            className="relative bg-[#F7ECE1] border border-[#CAC4CE] rounded-lg px-3 py-1 text-sm cursor-move hover:shadow-md transition-all"
          >
            {p}
            <button
              onClick={(e) => {
                e.stopPropagation();
                deletePhrase(null, i);
              }}
              className="absolute -top-1.5 -right-1.5 text-xs bg-white border border-[#CAC4CE] rounded-full text-rose-500 w-5 h-5 flex items-center justify-center shadow-sm hover:bg-rose-50"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-[#CAC4CE] pt-4 flex flex-col gap-3">
        <label className="text-sm text-[#242038]/80">Nueva frase:</label>
        <textarea
          rows={3}
          value={newPhrase}
          onChange={(e) => setNewPhrase(e.target.value)}
          placeholder="Escribe tu frase..."
          className="w-full border border-[#CAC4CE] rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-[#9067C6] outline-none"
        />
        <button
          onClick={addPhrase}
          className="self-start bg-[#9067C6] hover:bg-[#8D86C9] text-white px-4 py-2 rounded-lg flex items-center gap-1 font-medium shadow-sm transition-all"
        >
          <FilePlus size={16} /> Guardar
        </button>
      </div>
    </section>
  );
}
