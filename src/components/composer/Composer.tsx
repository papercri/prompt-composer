"use client";
import { User } from "firebase/auth";
import { useFirebaseData } from "@/hooks/useFirebaseData";
import { usePromptActions } from "@/hooks/usePromptActions";
import Sidebar from "./Sidebar";
import FreePhrases from "./FreePhrases";
import PromptSection from "./PromptSection";

export default function Composer({ user }: { user: User }) {
  const {
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
    addPhrase,
    deleteFolder,
    deletePhrase,
    onDragStart,
    onDropToFolder,
    onDropToFree,
    appendToPrompt,
    saveEditedFolder,
    startEditFolder,
    cancelEditFolder,
  } = useFirebaseData(user);

  const { copyPrompt, clearPrompt } = usePromptActions(promptText, setPromptText);

  return (
    <div className="flex flex-col lg:flex-row text-[#242038] justify-stretch">
      <Sidebar
        data={data}
        newFolder={newFolder}
        setNewFolder={setNewFolder}
        addFolder={addFolder}
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

      <main className="flex-1 flex flex-col gap-4 p-5 overflow-hidden">
        <FreePhrases
          data={data}
          newPhrase={newPhrase}
          setNewPhrase={setNewPhrase}
          addPhrase={addPhrase}
          deletePhrase={deletePhrase}
          onDragStart={onDragStart}
          onDropToFree={onDropToFree}
          appendToPrompt={appendToPrompt}
        />

        <PromptSection
          promptText={promptText}
          setPromptText={setPromptText}
          copyPrompt={copyPrompt}
          clearPrompt={clearPrompt}
        />
      </main>
    </div>
  );
}
