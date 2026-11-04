"use client";

import { useState, useEffect, useCallback } from "react";
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

  // 🚀 FIX: Sync state if initialValue changes (e.g., on client-side navigation)
  useEffect(() => {
    setValue(initialValue);
    setDraft(initialValue);
  }, [initialValue]);

  const startEditing = useCallback(() => { 
    setDraft(value); 
    setStatus("editing"); 
  }, [value]);

  const cancelEditing = useCallback(() => { 
    setDraft(value); 
    setStatus("idle"); 
  }, [value]);

  const saveEdit = useCallback(async () => {
    if (draft.trim() === value.trim()) { 
      setStatus("idle"); 
      return; 
    }

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
          // 🚀 FIX: Revert to editing state so the user doesn't lose their draft
          setStatus("editing");
          toast("Failed to send suggestion. Please try again.", "error");
        }
      } catch (err) {
        // 🚀 FIX: Revert to editing state
        setStatus("editing");
        toast("Network error. Please try again.", "error");
      }
    });
  }, [draft, value, contextType, contextId, fieldName, submitWithGate, toast]);

  return {
    status, value, draft, setDraft, startEditing, cancelEditing, saveEdit,
    registrationModal, 
  };
}