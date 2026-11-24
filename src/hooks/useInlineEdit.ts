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

  // Sync state if initialValue changes (e.g., on client-side navigation)
  // Par agar already pending hai, toh usko overwrite mat karo
  useEffect(() => {
    setValue((prev) => {
      if (status === "pending") return prev;
      return initialValue;
    });
    setDraft((prev) => {
      if (status === "editing" || status === "saving" || status === "pending") return prev;
      return initialValue;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          // IMPORTANT: Live value MAT badlo — purana hi dikhega
          // Sirf status pending rakho, taaki amber dot dikhe
          // Draft ko bhi purane value pe wapas lao
          setDraft(value);
          setStatus("pending");
          toast("Suggestion sent — Pending Review. Admin ke approve ke baad live hoga.", "success");
          // Yaha timeout HATA diya — pending tab tak rahega jab tak page reload na ho
          // Taaki visitor ko pata chale ispe already suggestion gaya hai
        } else {
          setStatus("editing");
          toast("Failed to send suggestion. Please try again.", "error");
        }
      } catch (err) {
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