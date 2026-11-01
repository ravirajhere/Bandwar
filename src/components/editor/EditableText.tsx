"use client";

import { useRef, useEffect } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { useInlineEdit } from "@/hooks/useInlineEdit";

interface EditableTextProps {
  initialValue: string;
  contextId: string;
  contextType: string;
  fieldName: string;
  className?: string; 
  as?: "h1" | "h2" | "p" | "span";
}

export function EditableText({
  initialValue,
  contextId,
  contextType,
  fieldName,
  className = "",
  as: Component = "p",
}: EditableTextProps) {
  const {
    status, value, draft, setDraft, startEditing, cancelEditing, saveEdit, registrationModal
  } = useInlineEdit(initialValue, contextId, contextType, fieldName);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if ((status === "editing" || status === "saving") && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(draft.length, draft.length);
      inputRef.current.style.height = "inherit";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [status, draft]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (status !== "saving") saveEdit();
    } else if (e.key === "Escape" && status !== "saving") {
      cancelEditing();
    }
  };

  if (status === "editing" || status === "saving") {
    return (
      <div className="relative group w-full">
        <textarea
          ref={inputRef}
          value={draft}
          disabled={status === "saving"}
          onChange={(e) => {
            setDraft(e.target.value);
            e.target.style.height = "inherit";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={handleKeyDown}
          className={`w-full bg-surface border-2 border-accent rounded-sm px-2 py-1 outline-none resize-none overflow-hidden font-sans text-ink disabled:opacity-70 ${className}`}
        />
        
        <div className="absolute -bottom-10 left-0 flex items-center gap-1 bg-ink text-white p-1 rounded-sm shadow-md z-50 animate-in fade-in zoom-in duration-150">
          <button 
            onClick={() => saveEdit()} 
            disabled={status === "saving"}
            className="flex items-center gap-1 text-xs px-2 py-1 hover:bg-white/20 rounded-sm transition-colors disabled:opacity-50"
          >
            {status === "saving" ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} 
            {status === "saving" ? "Saving..." : "Save"}
          </button>
          <div className="w-px h-4 bg-white/20"></div>
          <button 
            onClick={cancelEditing} 
            disabled={status === "saving"}
            className="flex items-center gap-1 text-xs px-2 py-1 hover:bg-white/20 rounded-sm transition-colors text-red-300 hover:text-red-200 disabled:opacity-50"
          >
            <X size={12} /> Cancel
          </button>
        </div>
        
        <div className="absolute top-full left-0 mt-1 text-[10px] text-ink-muted">
          Enter to save • Esc to cancel
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative group inline-block w-full">
        <Component
          onClick={startEditing}
          className={`cursor-text hover:bg-accent/5 hover:outline-dashed hover:outline-1 hover:outline-accent/30 rounded-sm transition-all pr-8 ${className} ${
            status === "pending" ? "opacity-60" : ""
          }`}
          title={`Click to edit ${fieldName}`}
        >
          {value || "—"}
        </Component>

        <button
          onClick={startEditing}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-ink/30 hover:text-accent opacity-0 group-hover:opacity-100 transition-all"
          aria-label={`Edit ${fieldName}`}
        >
          <Pencil size={16} />
        </button>

        {status === "pending" && (
          <span className="absolute -right-2 top-1/2 -translate-y-1/2 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        )}
      </div>
      {registrationModal}
    </>
  );
}