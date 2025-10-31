"use client";
import { useEffect, useState } from "react";
import {
  ensureUserDoc,
  subscribeUserDoc,
  saveUserDoc,
} from "@/lib/firebaseActions";
import { Clipboard, Trash2, FolderPlus, FilePlus } from "lucide-react";
import { User } from "firebase/auth";
import { Folder, FolderOpen, Edit3, Check } from "lucide-react";


type DataShape = {
  folders: Record<string, string[]>;
  free: string[];
};

export default function Composer({ user }: { user: User }) {
  const [data, setData] = useState<DataShape>({ folders: {}, free: [] });
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [newPhrase, setNewPhrase] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [promptText, setPromptText] = useState("");
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState<string>("");

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
    // al final, limpiar el highlight
    setDragOverFolder(null);
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
const startEditFolder = (folder: string) => {
  setEditingFolder(folder);
  setEditingFolderName(folder);
};

const cancelEditFolder = () => {
  setEditingFolder(null);
  setEditingFolderName("");
};

const saveEditedFolder = () => {
  if (!editingFolder) return;
  const oldName = editingFolder;
  const newName = editingFolderName.trim();
  if (!newName) {
    // opcional: mostrar toast o feedback
    return;
  }
  if (newName === oldName) {
    cancelEditFolder();
    return;
  }
  // evitar duplicados
  if (data.folders[newName]) {
    // opcional: mostrar mensaje "ya existe"
    return;
  }

  // construir nuevo objeto folders renombrando la clave
  const newFolders: Record<string, string[]> = {};
  Object.keys(data.folders).forEach((k) => {
    if (k === oldName) {
      newFolders[newName] = data.folders[oldName];
    } else {
      newFolders[k] = data.folders[k];
    }
  });

  // actualizar openFolders: mantener estado abierto/cerrado
  const newOpenFolders: Record<string, boolean> = {};
  Object.keys(openFolders).forEach((k) => {
    if (k === oldName) {
      newOpenFolders[newName] = openFolders[oldName];
    } else {
      newOpenFolders[k] = openFolders[k];
    }
  });

  // actualizar data y openFolders
  setData((prev) => ({ ...prev, folders: newFolders }));
  setOpenFolders(newOpenFolders);

  // limpiar estado de edición
  setEditingFolder(null);
  setEditingFolderName("");
};


  const clearPrompt = () => setPromptText("");


  return (
    <div className="flex flex-col lg:flex-row  text-[#242038] justify-stretch">
      {/* SIDEBAR */}
      <aside className="w-full lg:w-80 bg-[#F7ECE1] text-[#242038] flex flex-col p-2">
        {/* Crear carpeta */}
        <div className="pb-5 border-b border-[#8D86C9]/30">
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FolderPlus size={18} className="text-[#9067C6]" />
            Carpetas
          </h2>
          <div className="flex gap-2 items-center">
            <input
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
              placeholder="Nueva carpeta"
              className="flex-1 px-3 py-2 rounded-lg text-sm text-[#242038] border border-[#CAC4CE] focus:ring-2 focus:ring-[#9067C6] outline-none"
            />
            <button
              onClick={addFolder}
              className="bg-[#9067C6] hover:bg-[#8D86C9] text-white px-3 py-2 rounded-lg flex items-center gap-1 transition-all text-sm font-medium"
            >
              <FolderPlus size={16} /> Crear
            </button>
          </div>
        </div>

        {/* Lista de carpetas */}
        <div className="mt-4 flex-1 overflow-auto pr-1">
          {Object.keys(data.folders).length === 0 && (
            <p className="text-sm text-[#242038] italic">Sin carpetas</p>
          )}
          <div className="space-y-3">
            {Object.keys(data.folders).map((folder) => (
              <div
                key={folder}
                className={`border border-[#CAC4CE] rounded-xl overflow-hidden shadow-sm transition-all ${
                  dragOverFolder === folder ? "bg-[#CAC4CE]/50" : "bg-[#8D86C9]/10"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setDragOverFolder(folder)}
                onDragLeave={() => setDragOverFolder(null)}
                onDrop={(e) => onDropToFolder(e, folder)} // <- usa tu función existente
              >
                {/* HEADER DE CARPETA */}
                <div
                  onClick={() =>
                    setOpenFolders((prev) => ({ ...prev, [folder]: !prev[folder] }))
                  }
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#8D86C9]/20 transition-all"
                >
                  {/* Nombre o campo de edición */}
                  <div className="flex items-center gap-2">
                    {editingFolder === folder ? (
                      <>
                        <input
                          value={editingFolderName}
                          onChange={(e) => setEditingFolderName(e.target.value)}
                          className="px-2 py-1 text-sm border border-[#CAC4CE] rounded-md focus:ring-2 focus:ring-[#9067C6] outline-none w-36"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveEditedFolder();
                          }}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                          title="Guardar"
                        >
                          <Check className="text-green-600 font-bold" size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditFolder();
                          }}
                          className="text-rose-500 hover:text-rose-600 text-sm font-bold"
                          title="Cancelar"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        {openFolders[folder] ? (
                          <FolderOpen className="text-[#9067C6]" size={18} />
                        ) : (
                          <Folder className="text-[#242038]" size={18} />
                        )}
                        <span className="font-medium text-[#242038]">{folder}</span>
                      </>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditFolder(folder);
                      }}
                      className="text-[#8D86C9] hover:text-[#9067C6] flex items-center gap-1 text-sm font-medium"
                      title="Modificar carpeta"
                    >
                      <Edit3 size={16} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFolder(folder);
                      }}
                      className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm font-medium"
                      title="Eliminar carpeta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* CONTENIDO DE LA CARPETA (restaurado: doble click + botón borrar) */}
                {openFolders[folder] && (
                  <div className="px-3 pb-3 flex flex-wrap gap-2">
                    {data.folders[folder].length > 0 ? (
                      data.folders[folder].map((phrase, index) => (
                        <div
                          key={index}
                          onDoubleClick={() => appendToPrompt(phrase)}              // <- doble click -> añade al prompt
                          draggable
                          onDragStart={(e) => onDragStart(e, "folder", folder, index)} // <- usa onDragStart existente
                          className="relative bg-white border border-[#CAC4CE] rounded-lg px-3 py-1 text-sm text-[#242038] cursor-pointer hover:shadow-md transition-all"
                        >
                          {phrase}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePhrase(folder, index); // <- botón borrar restaurado
                            }}
                            className="absolute -top-1.5 -right-1.5 text-xs bg-white border border-[#CAC4CE] rounded-full text-rose-500 w-5 h-5 flex items-center justify-center shadow-sm hover:bg-rose-50"
                            title="Eliminar frase"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs italic text-[#8D86C9] p-2">Sin frases</div>
                    )}
                  </div>
                )}
              </div>
            ))}

          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col gap-4 p-5 overflow-hidden">
        {/* Frases libres */}
        <section
          className="bg-white border border-[#CAC4CE] rounded-2xl shadow-lg p-5 flex flex-col"
          onDragOver={onDragOver}
          onDrop={onDropToFree}
        >
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#242038]">
            <FilePlus size={18} className="text-[#9067C6]" />
            Frases libres
          </h2>

          <div className="flex flex-wrap gap-2 mb-5">
            {data.free.map((p, i) => (
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

          {/* Añadir frase */}
          <div className="border-t border-[#CAC4CE] pt-4 flex flex-col gap-3">
            <label className="text-sm text-[#242038]/80">Nueva frase:</label>
            <textarea
              rows={3}
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              placeholder="Escribe tu frase..."
              className="w-full border border-[#CAC4CE] rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-[#9067C6] outline-none resize-none"
            />
            <button
              onClick={addPhrase}
              className="self-start bg-[#9067C6] hover:bg-[#8D86C9] text-white px-4 py-2 rounded-lg flex items-center gap-1 font-medium shadow-sm transition-all"
            >
              <FilePlus size={16} /> Guardar
            </button>
          </div>
        </section>

        {/* Prompt generado */}
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
           // rows={12}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Doble clic en frases o escribe manualmente..."
            className="w-full flex-1 border border-[#CAC4CE] rounded-lg p-3 text-sm font-mono resize-none focus:ring-2 focus:ring-[#9067C6] outline-none bg-[#F7ECE1]"
          />
        </section>
      </main>
    </div>


  );
}
