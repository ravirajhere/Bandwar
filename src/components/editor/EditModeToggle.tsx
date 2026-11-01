"use client";

import { Pencil, CheckCircle2 } from "lucide-react";
import { useEditMode } from "./EditModeProvider";
import { useContributorGate } from "@/hooks/useContributorGate";
import { useState } from "react";

export function EditModeToggle() {
  const { isEditMode, setEditMode } = useEditMode();
  const { contributor, registrationModal, requestLogin } = useContributorGate();
  const [showRegModal, setShowRegModal] = useState(false);

  const handleEnable = () => {
    if (!contributor) {
      requestLogin();
      return;
    }
    setEditMode(true);
  };

  if (isEditMode) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent text-xs font-semibold border border-accent/20 rounded-sm">
          <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
          Editing Mode
        </span>
        <button
          onClick={() => setEditMode(false)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface text-ink-muted hover:text-ink text-xs font-semibold border border-divider rounded-sm transition-colors"
        >
          <CheckCircle2 size={14} /> Done Editing
        </button>
        {registrationModal}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleEnable}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface text-ink-muted hover:text-accent hover:border-accent text-xs font-semibold border border-divider rounded-sm transition-colors"
      >
        <Pencil size={13} /> Suggest an Edit
      </button>
      {registrationModal}
    </>
  );
}