"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast"; 
import {
  ensureUserDoc,
  subscribeUserDoc,
  saveUserDoc,
} from "@/lib/firebaseActions";

type DataShape = {
  folders: Record<string, string[]>;
  free: string[];
};

type User = {
  uid: string;
} | null;

export function useFirebaseData(user: User) {
  const [data, setData] = useState<DataShape>({ folders: {}, free: [] });
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [newFolder, setNewFolder] = useState("");
  const [newPhrase, setNewPhrase] = useState("");
  const [promptText, setPromptText] = useState("");
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");

  // --- 🔹 Inicialización y suscripción a Firestore ---
  useEffect(() => {
    if (!user?.uid) return;

    let unsub: (() => void) | undefined;
    (async () => {
      const initial = await ensureUserDoc(user.uid);
      setData(initial);
      unsub = subscribeUserDoc(user.uid, setData);
    })();

    return () => unsub && unsub();
  }, [user]);

  // --- 🔹 Guardar cambios en Firestore ---
  const saveData = (newData: DataShape) => {
    setData(newData);
    saveUserDoc(user.uid, newData);
  };

  // --- 🔹 Carpetas ---
  const addFolder = () => {
    if (!newFolder.trim() || data.folders[newFolder]) return;
    const newData = {
      ...data,
      folders: { ...data.folders, [newFolder]: [] },
    };
    saveData(newData);
    setNewFolder("");
  };

  const deleteFolder = (folder: string) => {
    if (!confirm(`¿Seguro que quieres borrar la carpeta "${folder}"?`)) return;

    const newData = { ...data };
    delete newData.folders[folder];
    saveData(newData);

    toast.success(`Carpeta "${folder}" eliminada`);
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
    if (!editingFolder || !editingFolderName.trim()) return;
    if (editingFolderName === editingFolder) {
      setEditingFolder(null);
      return;
    }

    const newData = { ...data };
    newData.folders[editingFolderName] = newData.folders[editingFolder];
    delete newData.folders[editingFolder];
    saveData(newData);

    setEditingFolder(null);
    setEditingFolderName("");
  };

  // --- 🔹 Frases ---
  const addPhrase = () => {
    if (!newPhrase.trim()) return;
    const newData = { ...data, free: [...data.free, newPhrase.trim()] };
    saveData(newData);
    setNewPhrase("");
  };

  const deletePhrase = (folder: string | null, index: number) => {
    const newData = { ...data };
    if (folder) {
      newData.folders[folder] = newData.folders[folder].filter((_, i) => i !== index);
    } else {
      newData.free = newData.free.filter((_, i) => i !== index);
    }
    saveData(newData);
  };

  const appendToPrompt = (phrase: string) => {
    setPromptText((prev) => (prev ? prev + " " + phrase : phrase));
  };

  // --- 🔹 Drag & Drop ---
  const onDragStart = (
    e: React.DragEvent,
    source: "free" | "folder",
    folder: string | null,
    index: number
  ) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ source, folder, index })
    );
  };

  const onDropToFolder = (e: React.DragEvent, targetFolder: string) => {
    e.preventDefault();
    const info = JSON.parse(e.dataTransfer.getData("text/plain"));
    const newData = { ...data };

    let phrase = "";
    if (info.source === "free") {
      phrase = newData.free[info.index];
      newData.free.splice(info.index, 1);
    } else {
      phrase = newData.folders[info.folder][info.index];
      newData.folders[info.folder].splice(info.index, 1);
    }

    if (!newData.folders[targetFolder]) newData.folders[targetFolder] = [];
    newData.folders[targetFolder].push(phrase);

    setDragOverFolder(null);
    saveData(newData);
  };

  const onDropToFree = (e: React.DragEvent) => {
    e.preventDefault();
    const info = JSON.parse(e.dataTransfer.getData("text/plain"));
    const newData = { ...data };

    let phrase = "";
    if (info.source === "free") return; // ya está en free

    phrase = newData.folders[info.folder][info.index];
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
