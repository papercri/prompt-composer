"use client";
import { useEffect, useState } from "react";
import {
  ensureUserDoc,
  subscribeUserDoc,
  saveUserDoc,
} from "@/lib/firebaseActions";
import { Clipboard, Trash2, FolderPlus, FilePlus } from "lucide-react";

type DataShape = {
  folders: Record<string, string[]>;
  free: string[];
};

export default function Composer({ user }: { user: any }) {
  const [data, setData] = useState<DataShape>({ folders: {}, free: [] });
  const [newPhrase, setNewPhrase] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [promptText, setPromptText] = useState("");

  useEffect(() => {
    if (!user?.uid) return;
    let unsub: (() => void) | undefined;
    (async () => {
      const initial = await ensureUserDoc(user.uid);
      setData(initial);
      unsub = subscribeUserDoc(user.uid, (d: DataShape) => setData(d));
    })();
    return () => unsub && unsub();
  }, [user?.uid]);

  const save = async (newData: DataShape) => {
    if (!user?.uid) return;
    setData(newData);
    await saveUserDoc(user.uid, newData);
  };

  // === CRUD ===
  const addPhrase = () => {
    if (!newPhrase.trim()) return;
    const updated = { ...data, free: [...data.free, newPhrase.trim()] };
    setNewPhrase("");
    save(updated);
  };

  const addFolder = () => {
    const name = newFolder.trim();
    if (!name || data.folders[name]) return;
    const updated = { ...data, folders: { ...data.folders, [name]: [] } };
    setNewFolder("");
    save(updated);
  };

  const deletePhrase = (folder: string | null, index: number) => {
    const updated = { ...data, folders: { ...data.folders } };
    if (folder) {
      updated.folders[folder] = [...updated.folders[folder]];
      updated.folders[folder].splice(index, 1);
    } else {
      updated.free = [...updated.free];
      updated.free.splice(index, 1);
    }
    save(updated);
  };

  const deleteFolder = (folder: string) => {
    if (!confirm(`¿Borrar carpeta "${folder}" y mover frases a libres?`)) return;
    const updated = {
      ...data,
      folders: { ...data.folders },
      free: [...data.free, ...data.folders[folder]],
    };
    delete updated.folders[folder];
    save(updated);
  };

  const toggleFolder = (name: string) => {
    setOpenFolders((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // === DRAG & DROP ===
  const onDragStart = (
    e: React.DragEvent,
    from: "free" | "folder",
    folderName: string | null,
    index: number
  ) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ from, folderName, index }));
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onDropToFolder = (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData("text/plain");
    if (!payload) return;
    const { from, folderName, index } = JSON.parse(payload);
    const updated: DataShape = { folders: { ...data.folders }, free: [...data.free] };
    let item: string | undefined;
    if (from === "free") {
      item = updated.free[index];
      updated.free.splice(index, 1);
    } else {
      const f = folderName!;
      item = updated.folders[f][index];
      updated.folders[f].splice(index, 1);
    }
    updated.folders[targetFolder] = [...updated.folders[targetFolder], item];
    save(updated);
  };

  const onDropToFree = (e: React.DragEvent) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData("text/plain");
    if (!payload) return;
    const { from, folderName, index } = JSON.parse(payload);
    const updated: DataShape = { folders: { ...data.folders }, free: [...data.free] };
    if (from === "folder") {
      const f = folderName!;
      const item = updated.folders[f][index];
      updated.folders[f].splice(index, 1);
      updated.free.push(item);
      save(updated);
    }
  };

  // === Prompt ===
  const appendToPrompt = (text: string) =>
    setPromptText((prev) => (prev ? `${prev}\n${text}` : text));

  const copyPrompt = async () => {
  if (!promptText) {
    alert("El prompt está vacío");
    return;
  }
  
  try {
    // Intenta usar la API moderna del portapapeles
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(promptText);
    } else {
      // Fallback para navegadores antiguos o sin HTTPS
      const textarea = document.createElement("textarea");
      textarea.value = promptText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    // Toast sencillo: crea y elimina automáticamente
    const toast = document.createElement("div");
    toast.textContent = "Prompt copiado ✅";
    Object.assign(toast.style, {
      position: "fixed",
      right: "20px",
      bottom: "20px",
      background: "#111827",
      color: "white",
      padding: "8px 12px",
      borderRadius: "8px",
      zIndex: "9999",
      boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
      opacity: "0",
      transition: "opacity 0.2s ease",
    });
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 200);
    }, 1200);
  } catch (err) {
    console.error("Error copiando:", err);
    alert(`No se pudo copiar: ${err instanceof Error ? err.message : 'Error desconocido'}`);
  }
};


  const clearPrompt = () => setPromptText("");

  // === UI ===
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6 min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-full lg:w-72 bg-white rounded-2xl shadow-lg gap-4   border-r border-slate-200 p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            📁 Carpetas
          </h2>
          <div className="space-y-3 overflow-auto max-h-[65vh] pr-2">
            {Object.keys(data.folders).length === 0 && (
              <p className="text-sm text-slate-500">Sin carpetas</p>
            )}
            {Object.keys(data.folders).map((folder) => (
              <div
                key={folder}
                className="border border-slate-200 rounded-lg overflow-hidden bg-gradient-to-br from-white to-slate-50"
              >
                <div
                  onClick={() => toggleFolder(folder)}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDropToFolder(e, folder)}
                  className="flex justify-between items-center px-3 py-2 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>{openFolders[folder] ? "📂" : "📁"}</span>
                    <span className="font-medium text-slate-700">{folder}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolder(folder);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {openFolders[folder] && (
                  <div className="px-3 pb-3 flex flex-wrap gap-2 transition-all duration-300">
                    {data.folders[folder].map((p, i) => (
                      <div
                        key={i}
                        onDoubleClick={() => appendToPrompt(p)}
                        draggable
                        onDragStart={(e) => onDragStart(e, "folder", folder, i)}
                        className="relative bg-white border border-slate-200 shadow-sm rounded-md px-3 py-1 text-sm whitespace-pre-wrap cursor-pointer hover:shadow-md"
                      >
                        {p}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePhrase(folder, i);
                          }}
                          className="absolute -top-1 -right-1 text-xs bg-white border border-slate-200 rounded-full text-red-500 w-5 h-5 flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add folder */}
        <div className="pt-3 border-t border-slate-200">
          <div className="flex gap-2">
            <input
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              placeholder="Nueva carpeta"
              className="flex-1 px-2 py-1 border border-slate-300 rounded-md text-sm"
            />
            <button
              onClick={addFolder}
              className="bg-sky-600 hover:bg-sky-700 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1"
            >
              <FolderPlus size={16} /> Crear
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 flex flex-col gap-8 overflow-auto">
        {/* Frases libres */}
        <section
          className="bg-white rounded-2xl shadow p-5"
          onDragOver={onDragOver}
          onDrop={onDropToFree}
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-slate-700">Frases libres</h3>
            <span className="text-sm text-slate-400">{data.free.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.free.map((p, i) => (
              <div
                key={i}
                draggable
                onDragStart={(e) => onDragStart(e, "free", null, i)}
                onDoubleClick={() => appendToPrompt(p)}
                className="relative bg-white border border-slate-200 shadow-sm rounded-md px-3 py-1 text-sm whitespace-pre-wrap cursor-move hover:shadow-md"
              >
                {p}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePhrase(null, i);
                  }}
                  className="absolute -top-1 -right-1 text-xs bg-white border border-slate-200 rounded-full text-red-500 w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Añadir frase */}
          <div className="mt-4 border-t border-slate-200 pt-3">
            <label className="text-sm text-slate-600 mb-1 block">
              Nueva frase (puede tener saltos de línea)
            </label>
            <div className="flex gap-2">
              <textarea
                rows={3}
                value={newPhrase}
                onChange={(e) => setNewPhrase(e.target.value)}
                placeholder="Escribe tu frase..."
                className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm resize-none"
              />
              <button
                onClick={addPhrase}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md flex items-center gap-1"
              >
                <FilePlus size={16} /> Guardar
              </button>
            </div>
          </div>
        </section>

        {/* Prompt builder */}
        <section className="bg-white rounded-2xl shadow p-5">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-slate-700">Prompt generado</h3>
            <div className="flex gap-2">
              <button
                onClick={copyPrompt}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-md flex items-center gap-1"
              >
                <Clipboard size={16} /> Copiar
              </button>
              <button
                onClick={clearPrompt}
                className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1 rounded-md"
              >
                Borrar
              </button>
            </div>
          </div>
          <textarea
            rows={8}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Doble clic en frases o escribe manualmente..."
            className="w-full border border-slate-300 rounded-md p-3 text-sm font-mono resize-vertical"
          />
        </section>

      </main>
    </div>
  );
}
