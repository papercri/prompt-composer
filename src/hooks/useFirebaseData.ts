"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { User } from "firebase/auth";
import {
  ensureUserDoc,
  subscribeUserDoc,
  saveUserDoc,
} from "@/lib/firebaseActions";

type DataShape = {
  folders: Record<string, string[]>;
  free: string[];
};

export function useFirebaseData(user: User | null) {
  const [data, setData] = useState<DataShape>({ folders: {}, free: [] });
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [newFolder, setNewFolder] = useState<string>("");
  const [newPhrase, setNewPhrase] = useState<string>("");
  const [promptText, setPromptText] = useState<string>("");
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState<string>("");

  // --- 🔹 Inicialización y suscripción a Firestore ---
  useEffect(() => {
    if (!user?.uid) return;

    const uid = user.uid;
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        const initial = await ensureUserDoc(uid);
        setData(initial);
        unsub = subscribeUserDoc(uid, setData);
      } catch (error) {
        console.error("Error inicializando datos:", error);
        toast.error("Error al cargar datos");
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [user]);

  // --- 🔹 Guardar cambios en Firestore ---
  const saveData = (newData: DataShape): void => {
    if (!user?.uid) return;
    setData(newData);
    saveUserDoc(user.uid, newData).catch((error) => {
      console.error("Error guardando datos:", error);
      toast.error("Error al guardar");
    });
  };

  // --- 🔹 Carpetas ---
  const addFolder = (): void => {
    if (!newFolder.trim() || data.folders[newFolder]) return;
    const newData: DataShape = {
      ...data,
      folders: { ...data.folders, [newFolder]: [] },
    };
    saveData(newData);
    setNewFolder("");
  };

  const deleteFolder = (folder: string): void => {
    if (!confirm(`¿Seguro que quieres borrar la carpeta "${folder}"?`)) return;

    const newData: DataShape = { ...data };
    delete newData.folders[folder];
    saveData(newData);

    toast.success(`Carpeta "${folder}" eliminada`);
  };

  const startEditFolder = (folder: string): void => {
    setEditingFolder(folder);
    setEditingFolderName(folder);
  };

  const cancelEditFolder = (): void => {
    setEditingFolder(null);
    setEditingFolderName("");
  };

  const saveEditedFolder = (): void => {
    if (!editingFolder || !editingFolderName.trim()) return;
    if (editingFolderName === editingFolder) {
      setEditingFolder(null);
      return;
    }

    const newData: DataShape = { ...data };
    newData.folders[editingFolderName] = newData.folders[editingFolder];
    delete newData.folders[editingFolder];
    saveData(newData);

    setEditingFolder(null);
    setEditingFolderName("");
  };

  // --- 🔹 Frases ---
  const addPhrase = (): void => {
    if (!newPhrase.trim()) return;
    const newData: DataShape = { ...data, free: [...data.free, newPhrase.trim()] };
    saveData(newData);
    setNewPhrase("");
  };

  const deletePhrase = (folder: string | null, index: number): void => {
    const newData: DataShape = { ...data };
    if (folder) {
      newData.folders[folder] = newData.folders[folder].filter((_, i) => i !== index);
    } else {
      newData.free = newData.free.filter((_, i) => i !== index);
    }
    saveData(newData);
  };

  const appendToPrompt = (phrase: string): void => {
    setPromptText((prev) => (prev ? prev + " " + phrase : phrase));
  };

  // --- 🔹 Drag & Drop ---
  const onDragStart = (
    e: React.DragEvent<Element>,
    source: "free" | "folder",
    folder: string | null,
    index: number
  ): void => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ source, folder, index })
    );
  };

  const onDropToFolder = (e: React.DragEvent<Element>, targetFolder: string): void => {
    e.preventDefault();
    const info = JSON.parse(e.dataTransfer.getData("text/plain")) as {
      source: "free" | "folder";
      folder: string | null;
      index: number;
    };
    const newData: DataShape = { ...data };

    let phrase = "";
    if (info.source === "free") {
      phrase = newData.free[info.index];
      newData.free.splice(info.index, 1);
    } else {
      if (!info.folder) return;
      phrase = newData.folders[info.folder][info.index];
      newData.folders[info.folder].splice(info.index, 1);
    }

    if (!newData.folders[targetFolder]) newData.folders[targetFolder] = [];
    newData.folders[targetFolder].push(phrase);

    setDragOverFolder(null);
    saveData(newData);
  };

  const onDropToFree = (e: React.DragEvent<Element>): void => {
    e.preventDefault();
    const info = JSON.parse(e.dataTransfer.getData("text/plain")) as {
      source: "free" | "folder";
      folder: string | null;
      index: number;
    };
    const newData: DataShape = { ...data };

    if (info.source === "free") return; // ya está en free

    if (!info.folder) return;
    const phrase = newData.folders[info.folder][info.index];
    newData.folders[info.folder].splice(info.index, 1);
    newData.free.push(phrase);

    saveData(newData);
  };

  return {
    data,
    setData,
    openFolders,
    setOpenFolders,
    newFolder,
    setNewFolder,
    newPhrase,
    setNewPhrase,
    promptText,
    setPromptText,
    dragOverFolder,
    setDragOverFolder,
    editingFolder,
    setEditingFolder,
    editingFolderName,
    setEditingFolderName,
    addFolder,
    deleteFolder,
    addPhrase,
    deletePhrase,
    appendToPrompt,
    onDragStart,
    onDropToFolder,
    onDropToFree,
    startEditFolder,
    cancelEditFolder,
    saveEditedFolder,
  };
}