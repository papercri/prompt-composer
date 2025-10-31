import { Folder, FolderOpen, Edit3, Trash2, Check } from "lucide-react";

interface FolderItemProps {
  folder: string;
  data: { folders: Record<string, string[]> };
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

export default function FolderItem({
  folder,
  data,
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
  editingFolderName,
  setEditingFolderName,
  saveEditedFolder,
  startEditFolder,
  cancelEditFolder,
}: FolderItemProps) {
  return (
    <div
      className={`border border-[#CAC4CE] rounded-xl overflow-hidden shadow-sm transition-all ${
        dragOverFolder === folder ? "bg-[#CAC4CE]/50" : "bg-[#8D86C9]/10"
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setDragOverFolder(folder)}
      onDragLeave={() => setDragOverFolder(null)}
      onDrop={(e) => onDropToFolder(e, folder)}
    >
      <div
        onClick={() =>
          setOpenFolders((prev) => ({ ...prev, [folder]: !prev[folder] }))
        }
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#8D86C9]/20 transition-all"
      >
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
                className="text-green-600 hover:text-green-700"
              >
                <Check size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  cancelEditFolder();
                }}
                className="text-rose-500 hover:text-rose-600"
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

              <span className="font-medium text-[#242038]">
                {folder}
                <span className="text-xs text-[#8D86C9] ml-1">
                  ({data.folders[folder].length})
                </span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              startEditFolder(folder);
            }}
            className="text-[#8D86C9] hover:text-[#9067C6]"
            title="Modificar carpeta"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteFolder(folder);
            }}
            className="text-red-500 hover:text-red-600"
            title="Eliminar carpeta"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {openFolders[folder] && (
        <div className="px-3 pb-3 flex flex-wrap gap-2">
          {data.folders[folder].length > 0 ? (
            data.folders[folder].map((phrase, index) => (
              <div
                key={index}
                onDoubleClick={() => appendToPrompt(phrase)}
                draggable
                onDragStart={(e) => onDragStart(e, "folder", folder, index)}
                className="relative bg-white border border-[#CAC4CE] rounded-lg px-3 py-1 text-sm cursor-pointer hover:shadow-md transition-all"
              >
                {phrase}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePhrase(folder, index);
                  }}
                  className="absolute -top-1.5 -right-1.5 text-xs bg-white border border-[#CAC4CE] rounded-full text-rose-500 w-5 h-5 flex items-center justify-center shadow-sm hover:bg-rose-50"
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
  );
}
