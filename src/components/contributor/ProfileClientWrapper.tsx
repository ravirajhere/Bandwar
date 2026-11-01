"use client";

import { useState, useEffect } from "react";
import { Edit3 } from "lucide-react";
import { EditProfileModal } from "./EditProfileModal";
import { isAdmin } from "@/lib/contributor";

export function ProfileClientWrapper({ contributor }: { contributor: any }) {
  const [isOwner, setIsOwner] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("bandwar_contributor");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.id === contributor.id) {
          setIsOwner(true);
        }
      } catch {}
    }
  }, [contributor.id]);

  if (!isOwner) return null;

  return (
    <>
      <button 
        onClick={() => setIsEditOpen(true)}
        className="inline-flex items-center gap-2 bg-canvas border border-divider text-ink px-4 py-2 rounded-sm text-sm font-semibold hover:border-accent transition-colors"
      >
        <Edit3 size={16} /> Edit My Profile
      </button>
      
      {isEditOpen && (
        <EditProfileModal contributor={contributor} onClose={() => setIsEditOpen(false)} />
      )}
    </>
  );
}