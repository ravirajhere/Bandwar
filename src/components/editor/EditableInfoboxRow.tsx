"use client";

import { Pencil, Check, X, Loader2 } from "lucide-react";
import { useInlineEdit } from "@/hooks/useInlineEdit";
import { useRef, useEffect } from "react";
import { useEditMode } from "./EditModeProvider";

interface EditableInfoboxRowProps {
  label: string;
  initialValue: string;
  contextId: string;
  contextType: string;
}

export function EditableInfoboxRow({
  label, initialValue, contextId, contextType,
}: EditableInfoboxRowProps) {
  const { isEditMode } = useEditMode();
  const {
    status, value, draft, setDraft, startEditing, cancelEditing, saveEdit, registrationModal
  } = useInlineEdit(initialValue, contextId, contextType, `Infobox: ${label}`);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if ((status === "editing" || status === "saving") && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(draft.length, draft.length);
    }
  }, [status, draft]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && status !== "saving") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape" && status !== "saving") {
      cancelEditing();
    }
  };

  // 🚀 READING MODE: Koi bhi clickable/hover effect nahi
  if (!isEditMode && status === "idle") {
    return (
      <div className="flex">
        <dt className="w-[38%] sm:w-[40%] px-5 py-3 text-ink-muted font-medium text-[13px] sm:text-sm leading-snug flex items-center break-words shrink-0">
          {label}
        </dt>
        <dd className="w-[62%] sm:w-[60%] px-5 py-3 text-ink text-[13px] sm:text-[14px] font-medium leading-relaxed break-words m-0 truncate">
          {value || "—"}
        </dd>
      </div>
    );
  }

  return (
    <>
      <div className="flex group hover:bg-canvas/50 transition-colors">
        <dt className="w-[38%] sm:w-[40%] px-5 py-3 text-ink-muted font-medium text-[13px] sm:text-sm leading-snug flex items-center break-words shrink-0">
          {label}
        </dt>

        <dd className="w-[62%] sm:w-[60%] px-5 py-3 text-ink text-[13px] sm:text-[14px] font-medium leading-relaxed break-words flex items-center justify-between gap-2 min-w-0 m-0">
          
          {status === "editing" || status === "saving" ? (
            <>
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={status === "saving"}
                className="flex-1 min-w-0 bg-surface border border-accent rounded-sm px-2 py-1 outline-none text-sm text-ink disabled:opacity-70"
              />
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => saveEdit()} disabled={status === "saving"} className="p-1 bg-accent text-white rounded-sm hover:bg-accent-hover disabled:opacity-50">
                  {status === "saving" ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                </button>
                <button onClick={cancelEditing} disabled={status === "saving"} className="p-1 bg-canvas border border-divider text-ink-muted rounded-sm hover:text-ink disabled:opacity-50">
                  <X size={12} />
                </button>
              </div>
            </>
          ) : (
            <>
              <span onClick={startEditing} className={`flex-1 min-w-0 cursor-text hover:bg-accent/5 rounded-sm px-1 -mx-1 py-0.5 transition-colors truncate ${status === "pending" ? "opacity-60" : ""}`} title={value}>
                {value || "—"}
              </span>
              
              <button onClick={startEditing} className="shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-ink/40 hover:text-accent p-0.5 no-print">
                <Pencil size={11} />
              </button>

              {status === "pending" && (
                <span className="shrink-0 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </>
          )}
        </dd>
      </div>
      {registrationModal}
    </>
  );
}