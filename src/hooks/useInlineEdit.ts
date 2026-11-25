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
  // Gate se contributor bhi le lo — isme username hona chahiye
  const { submitWithGate, registrationModal, contributor } = useContributorGate() as any;
  const [status, setStatus] = useState<EditStatus>("idle");
  const [value, setValue] = useState(initialValue);
  const [draft, setDraft] = useState(initialValue);

  // Pending ko reload ke baad bhi yaad rakho — nahi toh visitor ko lagega suggest gaya hi nahi
  const pendingKey = `suggest-pending:${contextId}:${fieldName}`;

  useEffect(() => {
    try {
      if (localStorage.getItem(pendingKey) === "1") setStatus("pending");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingKey]);

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

    // Username — gate se, nahi mila toh localStorage se, nahi toh anonymous
    const suggestedBy =
      contributor?.username ||
      (typeof window !== "undefined" ? localStorage.getItem("contributor_username") || "" : "");

    const formData = new FormData();
    formData.append("type", contextType);
    formData.append("contextId", contextId);
    formData.append("field", fieldName);
    formData.append("currentValue", value);
    formData.append("suggestedValue", draft);
    formData.append("suggestedBy", suggestedBy);
    // Profile pe article ka naam dikhane ke liye — backend isko save karega
    formData.append("articleId", contextId);

    await submitWithGate(formData, async (data) => {
      try {
        // 1) Telegram — admin ko turant pata chale (pehle jaisa)
        const tg = await fetch("/api/telegram-submit", { method: "POST", body: data });
        const tgData = await tg.json().catch(() => ({}));

        // 2) DB / JSON me save — profile pe dikhane ke liye (ye naya hai)
        // Agar ye API abhi nahi hai toh fail hone do, Telegram wala suggest toh gaya hi hai
        try {
          await fetch("/api/suggestions", {
            method: "POST",
            body: data,
          });
        } catch {}

        if (tgData.success !== false) {
          setDraft(value);
          setStatus("pending");
          try { localStorage.setItem(pendingKey, "1"); } catch {}
          toast("Suggestion sent — Pending Review. Admin ke approve ke baad live hoga.", "success");
        } else {
          setStatus("editing");
          toast("Failed to send suggestion. Please try again.", "error");
        }
      } catch (err) {
        setStatus("editing");
        toast("Network error. Please try again.", "error");
      }
    });
  }, [draft, value, contextType, contextId, fieldName, submitWithGate, toast, contributor, pendingKey]);

  return {
    status, value, draft, setDraft, startEditing, cancelEditing, saveEdit,
    registrationModal,
  };
}