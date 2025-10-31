"use client";
import { useEffect, useState } from "react";
import {
  ensureUserDoc,
  subscribeUserDoc,
  saveUserDoc,
} from "@/lib/firebaseActions";
import { Clipboard, Trash2, FolderPlus, FilePlus } from "lucide-react";
import { User } from "firebase/auth";
import { Folder, FolderOpen } from "lucide-react";

type DataShape = {
  folders: Record<string, string[]>;
  free: string[];
};

export default function Composer({ user }: { user: User }) {
  const [data, setData] = useState<DataShape>({ folders: {}, free: [] });
  const [newPhrase, setNewPhrase] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [promptText, setPromptText] = useState("");
 useEffect(() => {
    if (!user?.uid) return;
    const uid = user.uid; // Capturamos el uid como string
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        const initial = await ensureUserDoc(uid);
        setData(initial);
        unsub = subscribeUserDoc(uid, (d: DataShape) => setData(d));
      } catch (error) {
        console.error("Error inicializando documento de usuario:", error);
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [user]);

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
    let item: string;
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


  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 max-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
    {/* SIDEBAR */}
      <aside className="w-full lg:w-72 bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200/70 p-5 flex flex-col transition-all duration-300">
        {/* Add folder */}
        <div className="pb-4 border-b border-slate-200">
          <h2 className="text-slate-800 font-semibold mb-3 flex items-center gap-2">
            <FolderPlus className="text-sky-600" size={18} />
            Carpetas
          </h2>
          <div className="flex gap-2">
            <input
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              placeholder="Nueva carpeta"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
            />
            <button
              onClick={addFolder}
              className="bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-1 transition-all"
            >
              <FolderPlus size={16} /> Crear
            </button>
          </div>
        </div>

        {/* Folder list */}
        <div className="mt-4 flex-1 overflow-auto pr-1">
          <div className="space-y-3">
            {Object.keys(data.folders).length === 0 && (
              <p className="text-sm text-slate-500 italic">Sin carpetas</p>
            )}
            {Object.keys(data.folders).map((folder) => (
              <div
                key={folder}
                className="border border-slate-200 rounded-xl overflow-hidden bg-gradient-to-br from-white to-slate-50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  onClick={() => toggleFolder(folder)}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDropToFolder(e, folder)}
                  className="flex justify-between items-center px-3 py-2 hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {openFolders[folder] ? (
                      <FolderOpen className="text-sky-600" size={18} />
                    ) : (
                      <Folder className="text-slate-400" size={18} />
                    )}
                    <span className="font-medium text-slate-700">{folder}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolder(folder);
                    }}
                    className="text-rose-500 hover:text-rose-600 transition-colors"
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
                        className="relative bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-1 text-sm whitespace-pre-wrap cursor-pointer hover:shadow-md hover:border-sky-300 transition-all"
                      >
                        {p}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePhrase(folder, i);
                          }}
                          className="absolute -top-1.5 -right-1.5 text-xs bg-white border border-slate-200 rounded-full text-rose-500 w-5 h-5 flex items-center justify-center shadow-sm hover:bg-rose-50"
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
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-2 flex flex-col gap-4 overflow-auto">
        {/* Frases libres */}
        <section
          className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200 p-5 transition-all"
          onDragOver={onDragOver}
          onDrop={onDropToFree}
        >
          <h2 className="text-slate-800 font-semibold mb-3 flex items-center gap-2">
            <FilePlus className="text-emerald-600" size={18} /> Frases libres
          </h2>

          <div className="flex flex-wrap gap-2">
            {data.free.map((p, i) => (
              <div
                key={i}
                draggable
                onDragStart={(e) => onDragStart(e, "free", null, i)}
                onDoubleClick={() => appendToPrompt(p)}
                className="relative bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-1 text-sm whitespace-pre-wrap cursor-move hover:shadow-md hover:border-emerald-300 transition-all"
              >
                {p}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePhrase(null, i);
                  }}
                  className="absolute -top-1.5 -right-1.5 text-xs bg-white border border-slate-200 rounded-full text-rose-500 w-5 h-5 flex items-center justify-center shadow-sm hover:bg-rose-50"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Añadir frase */}
          <div className="mt-5 border-t border-slate-200 pt-4">
            <label className="text-sm text-slate-600 mb-2 block">
              Nueva frase (puede tener saltos de línea)
            </label>
            <div className="flex gap-3">
              <textarea
                rows={3}
                value={newPhrase}
                onChange={(e) => setNewPhrase(e.target.value)}
                placeholder="Escribe tu frase..."
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
              <button
                onClick={addPhrase}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 font-medium shadow-sm transition-all"
              >
                <FilePlus size={16} /> Guardar
              </button>
            </div>
          </div>
        </section>

        {/* Prompt builder */}
        <section className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200 p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <Clipboard className="text-emerald-600" size={18} />
              Prompt generado
            </h3>
            <div className="flex gap-2">
              <button
                onClick={copyPrompt}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm font-medium shadow-sm transition-all"
              >
                <Clipboard size={16} /> Copiar
              </button>
              <button
                onClick={clearPrompt}
                className="bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-600 hover:to-rose-500 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-all"
              >
                <Trash2 size={16} /> Borrar
              </button>
            </div>
          </div>

          <textarea
            rows={8}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Doble clic en frases o escribe manualmente..."
            className="w-full border border-slate-300 rounded-lg p-3 text-sm font-mono resize-vertical focus:ring-2 focus:ring-sky-400 outline-none transition-all bg-white"
          />
        </section>
      </main>
    </div>

  );
}
