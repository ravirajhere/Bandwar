"use client";

import { useState, useEffect } from "react";
import { Edit3 } from "lucide-react";
import { EditProfileModal } from "./EditProfileModal";
import { CONTRIBUTOR_STORAGE_KEY } from "@/lib/contributor"; // 🚀 isAdmin hata diya

export function ProfileClientWrapper({ contributor }: { contributor: any }) {
  const [isOwner, setIsOwner] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    // Check karein ki logged-in user hi is profile ka owner hai ya nahi
    const stored = localStorage.getItem(CONTRIBUTOR_STORAGE_KEY);
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