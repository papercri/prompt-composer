"use client";
import { useEffect, useState } from "react";
import {
  ensureUserDoc,
  subscribeUserDoc,
  saveUserDoc,
} from "@/lib/firebaseActions";

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

  // carga inicial + suscripción
  useEffect(() => {
    if (!user?.uid) return;
    let unsub: (() => void) | undefined;
    (async () => {
      const initial = await ensureUserDoc(user.uid);
      setData(initial);
      unsub = subscribeUserDoc(user.uid, (d: DataShape) => {
        // conservar promptText localmente, no sobreescribirlo
        setData(d);
      });
    })();
    return () => unsub && unsub();
  }, [user?.uid]);

  // helper guardar
  const save = async (newData: DataShape) => {
    if (!user?.uid) return;
    setData(newData);
    await saveUserDoc(user.uid, newData);
  };

  // Añadir frase (desde textarea)
  const addPhrase = () => {
    if (!newPhrase.trim()) return;
    const updated = { ...data, free: [...data.free, newPhrase] };
    setNewPhrase("");
    save(updated);
  };

  // Añadir carpeta
  const addFolder = () => {
    const name = newFolder.trim();
    if (!name) return;
    if (data.folders[name]) {
      setNewFolder("");
      return;
    }
    const updated = { ...data, folders: { ...data.folders, [name]: [] } };
    setNewFolder("");
    save(updated);
  };

  // Eliminar frase (de carpeta o de free)
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

  // Eliminar carpeta (mueve su contenido a free)
  const deleteFolder = (folder: string) => {
    if (!confirm(`¿Seguro que quieres borrar la carpeta "${folder}"?`)) return;
    const updated = { ...data, folders: { ...data.folders }, free: [...data.free] };
    updated.free.push(...updated.folders[folder]);
    delete updated.folders[folder];
    save(updated);
  };

  // Accordion toggle
  const toggleFolder = (name: string) => {
    setOpenFolders((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // --- DRAG & DROP handlers ---
  // dataTransfer payload: JSON.stringify({ from: "free" | "folder", folderName: string | null, index })
  const onDragStart = (e: React.DragEvent, from: "free" | "folder", folderName: string | null, index: number) => {
    const payload = JSON.stringify({ from, folderName, index });
    e.dataTransfer.setData("text/plain", payload);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Dropear en carpeta
  const onDropToFolder = (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault();
    try {
      const raw = e.dataTransfer.getData("text/plain");
      if (!raw) return;
      const { from, folderName, index } = JSON.parse(raw) as {
        from: "free" | "folder";
        folderName: string | null;
        index: number;
      };
      const updated: DataShape = { folders: { ...data.folders }, free: [...data.free] };

      // obtener item
      let item: string | undefined;
      if (from === "free") {
        item = updated.free[index];
        if (item === undefined) return;
        updated.free.splice(index, 1);
      } else {
        const f = folderName!;
        item = [...updated.folders[f]][index];
        if (item === undefined) return;
        updated.folders[f] = [...updated.folders[f]];
        updated.folders[f].splice(index, 1);
      }

      // evitar duplicar si ya existe exactamente igual en target (opcional)
      updated.folders[targetFolder] = [...updated.folders[targetFolder], item];

      save(updated);
    } catch (err) {
      console.error("drop error", err);
    }
  };

  // Dropear en area free
  const onDropToFree = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const raw = e.dataTransfer.getData("text/plain");
      if (!raw) return;
      const { from, folderName, index } = JSON.parse(raw) as {
        from: "free" | "folder";
        folderName: string | null;
        index: number;
      };
      const updated: DataShape = { folders: { ...data.folders }, free: [...data.free] };

      if (from === "free") {
        // nada que hacer (ya está en free); si quieres reordenar, habría que manejar índices
        return;
      } else {
        const f = folderName!;
        const item = [...updated.folders[f]][index];
        if (item === undefined) return;
        updated.folders[f] = [...updated.folders[f]];
        updated.folders[f].splice(index, 1);
        updated.free.push(item);
        save(updated);
      }
    } catch (err) {
      console.error("drop free error", err);
    }
  };

  // Doble click para añadir al prompt (preserva saltos de línea)
  const appendToPrompt = (text: string) => {
    // si el textarea ya tiene texto, añade una línea en blanco entre frases (opcional)
    const newPrompt = promptText ? `${promptText}\n${text}` : text;
    setPromptText(newPrompt);
  };

  // Copiar prompt
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      // pequeña notificación no intrusiva
      const prev = document.getElementById("copy-toast");
      if (prev) prev.remove();
      const toast = document.createElement("div");
      toast.id = "copy-toast";
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
      });
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1500);
    } catch (err) {
      alert("No se pudo copiar el prompt");
    }
  };

  const clearPrompt = () => setPromptText("");

  // Small helper to render phrase box (used in free and in folder)
  const PhraseBox = ({
    text,
    onDelete,
    draggableProps,
    onDoubleClick,
  }: {
    text: string;
    onDelete: () => void;
    draggableProps?: {
      draggable: boolean;
      onDragStart: (e: React.DragEvent) => void;
    };
    onDoubleClick?: () => void;
  }) => {
    return (
      <div
        draggable={draggableProps?.draggable ?? false}
        onDragStart={draggableProps?.onDragStart}
        onDoubleClick={onDoubleClick}
        className="group bg-gradient-to-br from-white to-slate-50 border border-slate-200 px-3 py-2 rounded-lg shadow-sm max-w-[280px] break-words whitespace-pre-wrap cursor-move hover:shadow-md transition"
      >
        <div className="text-sm text-slate-800">{text}</div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 transition absolute right-2 top-2 text-red-500 text-xs"
          aria-label="Eliminar frase"
          title="Eliminar frase"
        >
          ✕
        </button>
      </div>
    );
  };

  // Render
  return (
    <div className="flex gap-6 p-6 bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white rounded-2xl shadow-lg p-4 flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-slate-700">Carpetas</h3>

        <div className="flex-1 overflow-auto pr-2 space-y-3">
          {Object.keys(data.folders).length === 0 && (
            <div className="text-sm text-slate-500">No hay carpetas todavía.</div>
          )}

          {Object.keys(data.folders).map((folder) => (
            <div
              key={folder}
              className="bg-white border border-slate-100 rounded-xl overflow-hidden"
            >
              {/* header: droppable (soporta drop en header too) */}
              <div
                onDragOver={onDragOver}
                onDrop={(e) => {
                  e.stopPropagation();
                  onDropToFolder(e, folder);
                }}
                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-slate-50"
                onClick={() => toggleFolder(folder)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">📁</span>
                  <div>
                    <div className="text-sm font-medium text-slate-800">{folder}</div>
                    <div className="text-xs text-slate-400">{data.folders[folder].length} frases</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFolder(folder);
                    }}
                    className="text-red-500 text-sm px-2 py-1 rounded hover:bg-red-50"
                    title="Eliminar carpeta"
                  >
                    Eliminar
                  </button>
                  <button
                    className="text-slate-400 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFolder(folder);
                    }}
                    aria-expanded={!!openFolders[folder]}
                  >
                    {openFolders[folder] ? "▾" : "▸"}
                  </button>
                </div>
              </div>

              {/* contenido */}
              {openFolders[folder] && (
                <div className="p-3 flex flex-wrap gap-2 bg-slate-50" onDragOver={onDragOver} onDrop={(e) => onDropToFolder(e, folder)}>
                  {data.folders[folder].map((p, idx) => (
                    <div
                      key={idx}
                      onDoubleClick={() => appendToPrompt(p)}
                      draggable
                      onDragStart={(e) => onDragStart(e, "folder", folder, idx)}
                    >
                      <div className="relative">
                        <div className="bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm max-w-[240px] break-words whitespace-pre-wrap cursor-pointer hover:shadow">
                          <div className="text-sm text-slate-800">{p}</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePhrase(folder, idx);
                          }}
                          className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-50"
                          title="Eliminar frase"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* añadir carpeta */}
        <div className="pt-2 border-t border-slate-100">
          <label className="text-xs text-slate-500">Crear carpeta</label>
          <div className="flex gap-2 mt-2">
            <input
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              placeholder="Nombre carpeta"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
            <button
              onClick={addFolder}
              className="px-3 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700"
            >
              Añadir
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col gap-6">
        {/* Free phrases area (droppable) */}
        <section
          className="bg-white rounded-2xl shadow p-4"
          onDragOver={onDragOver}
          onDrop={onDropToFree}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-slate-700">Frases libres</h3>
            <div className="text-sm text-slate-400">{data.free.length} frases</div>
          </div>

          <div className="flex flex-wrap gap-3">
            {data.free.map((p, i) => (
              <div
                key={i}
                draggable
                onDragStart={(e) => onDragStart(e, "free", null, i)}
                onDoubleClick={() => appendToPrompt(p)}
                className="relative"
              >
                <div className="bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm max-w-[280px] break-words whitespace-pre-wrap cursor-move hover:shadow">
                  <div className="text-sm text-slate-800">{p}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePhrase(null, i);
                  }}
                  className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-50"
                  title="Eliminar frase"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* añadir nueva frase (multiline) */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="text-sm text-slate-600">Nueva frase (puede contener saltos de línea)</label>
            <div className="flex gap-3 mt-2">
              <textarea
                rows={3}
                value={newPhrase}
                onChange={(e) => setNewPhrase(e.target.value)}
                placeholder="Escribe la frase... (shift+enter para salto de línea)"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
              />
              <button onClick={addPhrase} className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700">
                Guardar
              </button>
            </div>
            <div className="text-xs text-slate-400 mt-2">Doble click en una frase para añadirla al prompt.</div>
          </div>
        </section>

        {/* Prompt builder + canvas */}
        <section className="bg-white rounded-2xl shadow p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-700">Prompt (texto)</h3>
            <div className="flex gap-2">
              <button
                onClick={copyPrompt}
                className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Copiar
              </button>
              <button
                onClick={clearPrompt}
                className="px-3 py-1 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600"
              >
                Borrar
              </button>
            </div>
          </div>

          <textarea
            rows={8}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Aquí se genera el prompt. Puedes escribir manualmente o doble-click en una frase para insertarla."
            className="w-full p-3 border border-slate-200 rounded-lg text-sm resize-vertical font-mono"
          />

          <div className="text-xs text-slate-400">
            El texto mantiene saltos de línea. Úsalo tal cual para enviarlo a ChatGPT u otra IA.
          </div>
        </section>
      </main>
    </div>
  );
}
