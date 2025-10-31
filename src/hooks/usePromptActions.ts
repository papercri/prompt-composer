"use client";
import { toast } from "react-hot-toast";

export function usePromptActions(
  promptText: string,
  setPromptText: (value: string) => void
) {
  const copyPrompt = async () => {
    if (!promptText.trim()) return;
    await navigator.clipboard.writeText(promptText);
    toast.success("Texto copiado al portapapeles");
  };

  const clearPrompt = () => {
    if (!promptText.trim()) return;
    setPromptText("");
    toast.success("Prompt limpiado");
  };

  return { copyPrompt, clearPrompt };
}
