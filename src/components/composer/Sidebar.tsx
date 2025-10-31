import { FolderPlus } from "lucide-react";
import FolderItem from "./FolderItem";

interface SidebarProps {
  data: { folders: Record<string, string[]> };
  newFolder: string;
  setNewFolder: React.Dispatch<React.SetStateAction<string>>;
  addFolder: () => void;
  openFolders: Record<string, boolean>;
  setOpenFolders: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  deleteFolder: (folder: string) => void;
  deletePhrase: (folder: string | null, index: number) => void;
  appendToPrompt: (text: string) => void;
  onDragStart: (
    e: React.DragEvent<Element>,
    source: "free" | "folder",
    folder: string | null,
    index: number
  ) => void;
  onDropToFolder: (e: React.DragEvent<Element>, folder: string) => void;
  dragOverFolder: string | null;
  setDragOverFolder: React.Dispatch<React.SetStateAction<string | null>>;
  editingFolder: string | null;
  setEditingFolder: React.Dispatch<React.SetStateAction<string | null>>;
  editingFolderName: string;
  setEditingFolderName: React.Dispatch<React.SetStateAction<string>>;
  saveEditedFolder: () => void;
  startEditFolder: (folder: string) => void;
  cancelEditFolder: () => void;
}

export default function Sidebar({
  data,
  newFolder,
  setNewFolder,
  addFolder,
  openFolders,
  setOpenFolders,
  deleteFolder,
  deletePhrase,
  appendToPrompt,
  onDragStart,
  onDropToFolder,
  dragOverFolder,
  setDragOverFolder,
  editingFolder,
  setEditingFolder,
  editingFolderName,
  setEditingFolderName,
  saveEditedFolder,
  startEditFolder,
  cancelEditFolder,
}: SidebarProps) {

  return (
    <aside className="w-full lg:w-80 bg-[#F7ECE1] text-[#242038] flex flex-col p-2">
      {/* Crear carpeta */}
      <div className="pb-5 border-b border-[#8D86C9]/30">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <FolderPlus size={18} className="text-[#9067C6]" /> Carpetas
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

      {/* Listado de carpetas */}
      <div className="mt-4 flex-1 overflow-auto pr-1 space-y-3">
        {Object.keys(data.folders).length === 0 && (
          <p className="text-sm text-[#242038] italic">Sin carpetas</p>
        )}

        {Object.keys(data.folders).map((folder: string) => (
          <FolderItem
            key={folder}
            folder={folder}
            data={data}
            openFolders={openFolders}
            setOpenFolders={setOpenFolders}
            deleteFolder={deleteFolder}
            deletePhrase={deletePhrase}
            appendToPrompt={appendToPrompt}
            onDragStart={onDragStart}
            onDropToFolder={onDropToFolder}
            dragOverFolder={dragOverFolder}
            setDragOverFolder={setDragOverFolder}
            editingFolder={editingFolder}
            setEditingFolder={setEditingFolder}
            editingFolderName={editingFolderName}
            setEditingFolderName={setEditingFolderName}
            saveEditedFolder={saveEditedFolder}
            startEditFolder={startEditFolder}
            cancelEditFolder={cancelEditFolder}
          />
        ))}
      </div>
    </aside>
  );
}
