"use client";

import { useRef, useEffect, useState } from "react";
import { Pencil, Check, X, Loader2, Link as LinkIcon, Eye, Edit3 } from "lucide-react";
import { useInlineEdit } from "@/hooks/useInlineEdit";
import { WikiText } from "@/components/article/WikiText";
import { useEditMode } from "./EditModeProvider";

interface EditableParagraphProps {
  initialValue: string;
  contextId: string;
  contextType: string;
  fieldName: string;
  className?: string;
  validIds?: string[];
}

export function EditableParagraph({
  initialValue, contextId, contextType, fieldName, className = "", validIds,
}: EditableParagraphProps) {
  const { isEditMode } = useEditMode();
  const {
    status, value, draft, setDraft, startEditing, cancelEditing, saveEdit, registrationModal
  } = useInlineEdit(initialValue, contextId, contextType, fieldName);

  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if ((status === "editing" || status === "saving") && textareaRef.current && !showPreview) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [status, draft, showPreview]);

  const insertWikiLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = draft.substring(start, end) || "article-id";
    const newText = draft.substring(0, start) + `[[${selected}]]` + draft.substring(end);
    setDraft(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + 2, start + 2 + selected.length);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (status !== "saving") saveEdit();
    } else if (e.key === "Escape" && status !== "saving") {
      cancelEditing();
    }
  };

  const renderContent = (text: string) => {
    if (validIds) {
      return <WikiText text={text} validIds={validIds} />;
    }
    return <p className="m-0">{text}</p>;
  };

  // 🚀 READING MODE
  if (!isEditMode && status === "idle") {
    return <div className={className}>{renderContent(value)}</div>;
  }

  if (status === "editing" || status === "saving") {
    return (
      <div className="w-full border-l-2 border-l-accent pl-3 -ml-3">
        <div className="flex items-center justify-between mb-2 bg-surface border border-divider rounded-sm px-2 py-1">
          <div className="flex items-center gap-1">
            <button onClick={() => setShowPreview(false)} className={`text-xs px-2 py-1 rounded-sm transition-colors flex items-center gap-1 ${!showPreview ? "bg-accent text-white" : "text-ink-muted hover:bg-canvas"}`}>
              <Edit3 size={12} /> Write
            </button>
            <button onClick={() => setShowPreview(true)} className={`text-xs px-2 py-1 rounded-sm transition-colors flex items-center gap-1 ${showPreview ? "bg-accent text-white" : "text-ink-muted hover:bg-canvas"}`}>
              <Eye size={12} /> Preview
            </button>
          </div>
          <button onClick={insertWikiLink} className="text-xs px-2 py-1 text-ink-muted hover:bg-canvas rounded-sm flex items-center gap-1">
            <LinkIcon size={12} /> Wiki Link
          </button>
        </div>

        {showPreview ? (
          <div className={`bg-canvas border border-divider rounded-sm px-4 py-3 min-h-[100px] ${className}`}>
            {draft.trim() ? renderContent(draft) : <span className="text-ink-muted italic text-sm">Nothing to preview...</span>}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              e.target.style.height = "inherit";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={handleKeyDown}
            disabled={status === "saving"}
            className="w-full bg-surface border border-divider rounded-sm px-4 py-3 outline-none focus:border-accent resize-none overflow-hidden font-sans text-ink text-base leading-relaxed disabled:opacity-70 min-h-[120px]"
          />
        )}

        <div className="flex items-center justify-between mt-2">
          <p className="text-[11px] text-ink-muted hidden sm:block">
            <kbd className="bg-canvas border border-divider px-1 py-0.5 rounded-sm text-[10px]">⌘/Ctrl + Enter</kbd> to save • <kbd className="bg-canvas border border-divider px-1 py-0.5 rounded-sm text-[10px]">Esc</kbd> to cancel
          </p>
          <div className="flex items-center gap-1 bg-ink text-white p-1 rounded-sm shadow-md ml-auto">
            <button onClick={() => saveEdit()} disabled={status === "saving"} className="flex items-center gap-1 text-xs px-2 py-1 hover:bg-white/20 rounded-sm disabled:opacity-50">
              {status === "saving" ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
            </button>
            <div className="w-px h-4 bg-white/20"></div>
            <button onClick={cancelEditing} disabled={status === "saving"} className="flex items-center gap-1 text-xs px-2 py-1 hover:bg-white/20 rounded-sm text-red-300 disabled:opacity-50">
              <X size={12} /> Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative group">
        <div onClick={startEditing} className={`cursor-text hover:bg-accent/5 hover:outline-dashed hover:outline-1 hover:outline-accent/30 rounded-sm transition-all ${status === "pending" ? "opacity-60" : ""} ${className}`} title={`Click to edit ${fieldName}`}>
          {renderContent(value)}
        </div>
        <button onClick={startEditing} className="absolute -right-8 top-1 p-1.5 text-ink/30 hover:text-accent opacity-0 group-hover:opacity-100 transition-all no-print">
          <Pencil size={14} />
        </button>
        {status === "pending" && (
          <span className="absolute -right-2 top-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
        )}
      </div>
      {registrationModal}
    </>
  );
}