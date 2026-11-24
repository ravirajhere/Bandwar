"use client";

import { Pencil } from "lucide-react";
import { useContributorGate } from "@/hooks/useContributorGate";

export function EditModeToggle() {
  const { contributor, registrationModal, requestLogin } = useContributorGate();

  const handleClick = () => {
    if (!contributor) {
      requestLogin();
      return;
    }
    // Visitor ko seedha neeche wale Suggest box pe le jao
    // Article page me us box ko id="suggest-edit" dena hai
    const el = document.getElementById("suggest-edit");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Thoda highlight karke dikhao ki yahi hai
      el.classList.add("ring-2", "ring-accent");
      setTimeout(() => el.classList.remove("ring-2", "ring-accent"), 2000);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface text-ink-muted hover:text-accent hover:border-accent text-xs font-semibold border border-divider rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Suggest an edit for this article"
      >
        <Pencil size={13} aria-hidden="true" /> Suggest an Edit
      </button>
      {registrationModal}
    </>
  );
}