"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { useContributorGate } from "./useContributorGate"; 

export type EditStatus = "idle" | "editing" | "saving" | "pending" | "error";

export function useInlineEdit(
  initialValue: string,
  contextId: string,
  contextType: string,
  fieldName: string
) {
  const { toast } = useToast();
  const { submitWithGate, registrationModal } = useContributorGate(); 
  const [status, setStatus] = useState<EditStatus>("idle");
  const [value, setValue] = useState(initialValue);
  const [draft, setDraft] = useState(initialValue);

  const startEditing = () => { setDraft(value); setStatus("editing"); };
  const cancelEditing = () => { setDraft(value); setStatus("idle"); };

  const saveEdit = async () => {
    if (draft.trim() === value.trim()) { setStatus("idle"); return; }

    setStatus("saving");
    const formData = new FormData();
    formData.append("type", contextType);
    formData.append("contextId", contextId);
    formData.append("field", fieldName);
    formData.append("currentValue", value);
    formData.append("suggestedValue", draft);

    await submitWithGate(formData, async (data) => {
      try {
        const res = await fetch("/api/telegram-submit", { method: "POST", body: data });
        const resData = await res.json();

        if (resData.success) {
          setValue(draft); 
          setStatus("pending");
          toast("Suggestion sent for review.", "success");
          setTimeout(() => setStatus("idle"), 4000);
        } else {
          setStatus("error");
          toast("Failed to send suggestion.", "error");
        }
      } catch (err) {
        setStatus("error");
        toast("Network error.", "error");
      }
    });
  };

  return {
    status, value, draft, setDraft, startEditing, cancelEditing, saveEdit,
    registrationModal, 
  };
}