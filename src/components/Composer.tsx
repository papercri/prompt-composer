"use client";
import { useEffect, useState } from "react";
import { ensureUserDoc, subscribeUserDoc, saveUserDoc } from "@/lib/firebaseActions";

export default function Composer({ user }: { user: any }) {
  const [data, setData] = useState<any>({ folders: {}, free: [] });
  const [newPhrase, setNewPhrase] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  // Cargar datos y suscribirse a Firebase
  useEffect(() => {
    if (!user?.uid) return;
    async function load() {
      const initial = await ensureUserDoc(user.uid);
      setData(initial);
      const unsub = subscribeUserDoc(user.uid, setData);
      return () => unsub();
    }
    load();
  }, [user?.uid]);

  // Guardar cambios en Firebase
  const save = async (newData: any) => {
    if (!user?.uid) return;
    setData(newData);
    await saveUserDoc(user.uid, newData);
  };

  // Frases
  const addPhrase = () => {
    if (!newPhrase.trim()) return;
    const updated = { ...data, free: [...data.free, newPhrase.trim()] };
    setNewPhrase("");
    save(updated);
  };
  const deletePhrase = (folder: string | null, index: number) => {
    const updated = { ...data };
    if (folder) updated.folders[folder].splice(index, 1);
    else updated.free.splice(index, 1);
    save(updated);
  };

  // Carpetas
  const addFolder = () => {
    if (!newFolder.trim() || data.folders[newFolder]) return;
    const updated = { ...data, folders: { ...data.folders, [newFolder]: [] } };
    setNewFolder("");
    save(updated);
  };
  const deleteFolder = (folder: string) => {
    if (!confirm(`¿Seguro que quieres borrar la carpeta "${folder}"?`)) return;
    const updated = { ...data };
    updated.free.push(...updated.folders[folder]);
    delete updated.folders[folder];
    save(updated);
  };
  const toggleFolder = (name: string) => {
    setOpenFolders((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="flex h-full gap-4">
      {/* Sidebar de carpetas */}
      <aside className="w-64 bg-white shadow-lg p-4 flex flex-col gap-4 overflow-auto">
        <h2 className="font-bold text-gray-700 mb-2">Carpetas</h2>
        {Object.keys(data.folders).map((folder) => (
          <div key={folder} className="border rounded">
            {/* Header accordion */}
            <div
              className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => toggleFolder(folder)}
            >
              <span className="font-medium">📁 {folder}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFolder(folder);
                }}
                className="text-red-500 text-xs hover:text-red-700"
              >
                X
              </button>
            </div>
            {/* Contenido del accordion */}
            {openFolders[folder] && (
              <div className="p-2 flex flex-wrap gap-2">
                {data.folders[folder].map((phrase: string, idx: number) => (
                  <div
                    key={idx}
                    className="bg-blue-50 p-2 rounded text-sm flex items-center gap-2 max-w-[180px]"
                  >
                    <span>{phrase}</span>
                    <button
                      onClick={() => deletePhrase(folder, idx)}
                      className="text-red-400 text-xs hover:text-red-600"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <input
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            placeholder="Nueva carpeta"
            className="border p-1 rounded flex-1 text-sm"
          />
          <button
            onClick={addFolder}
            className="bg-green-500 text-white px-2 rounded text-sm"
          >
            +
          </button>
        </div>
      </aside>

      {/* Main content */}
      <section className="flex-1 p-6 overflow-auto flex flex-col gap-4">
        <h2 className="font-semibold text-lg mb-2 text-gray-700">Frases libres</h2>
        <div className="flex flex-wrap gap-2">
          {data.free.map((p: string, i: number) => (
            <div
              key={i}
              className="bg-gray-100 p-2 rounded flex items-center gap-2 max-w-[200px]"
            >
              <span>{p}</span>
              <button
                onClick={() => deletePhrase(null, i)}
                className="text-red-400 text-xs hover:text-red-600"
              >
                X
              </button>
            </div>
          ))}
        </div>

        {/* Input nueva frase */}
        <div className="flex gap-2 mt-4">
          <textarea
            value={newPhrase}
            onChange={(e) => setNewPhrase(e.target.value)}
            placeholder="Escribe una nueva frase..."
            className="border p-2 rounded w-full text-sm"
            rows={3}
          />
          <button
            onClick={addPhrase}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            Añadir
          </button>
        </div>

        {/* Canvas de frases montadas */}
        <div className="mt-6 p-4 border rounded bg-gray-50 min-h-[120px] flex flex-wrap gap-2">
          {[...data.free, ...Object.values(data.folders).flat()].map((p: string, i: number) => (
            <span
              key={i}
              className="bg-gray-200 p-2 rounded text-sm max-w-[200px]"
            >
              {p}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
