"use client";

import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

export function EditProfileModal({ contributor, onClose }: { contributor: any, onClose: () => void }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bio, setBio] = useState(contributor.bio || "");
  const [photo, setPhoto] = useState(contributor.photo || "");
  const [username, setUsername] = useState(contributor.username || "");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/contributor/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: contributor.id, 
          newUsername: username, 
          bio, 
          photo 
        }),
      });
      const data = await res.json();

      if (data.success) {
        toast("Profile updated successfully!", "success");
        // Update local storage so header reflects new username
        localStorage.setItem("bandwar_contributor", JSON.stringify(data.contributor));
        router.refresh();
        onClose();
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch (err) {
      setError("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm no-print">
      <div className="bg-surface w-full max-w-lg rounded-sm border border-divider shadow-xl flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-divider bg-canvas/50">
          <h2 className="font-serif font-bold text-ink text-lg">Edit Profile</h2>
          <button onClick={onClose} className="p-2 border border-divider rounded-sm hover:bg-canvas"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Username (Can only be changed once)</label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-accent font-semibold">@</span>
              <input 
                type="text" 
                value={username.replace('@', '')} 
                onChange={(e) => setUsername(`@${e.target.value.replace(/[^a-zA-Z0-9_]/g, '')}`)}
                disabled={contributor.hasChangedUsername}
                className="flex-1 h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none disabled:opacity-50" 
              />
            </div>
            {contributor.hasChangedUsername && <p className="text-[10px] text-red-500 mt-1">You have already used your one-time username change.</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Profile Photo URL</label>
            <input type="url" value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="https://example.com/photo.jpg" className="w-full h-11 px-4 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell us a bit about yourself..." className="w-full px-4 py-3 rounded-sm border border-divider bg-surface text-ink text-sm focus:border-accent outline-none resize-y" />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-500/10 p-2 border border-red-500/20 rounded-sm">{error}</p>}

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-divider rounded-sm text-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-accent text-white rounded-sm font-semibold text-sm flex items-center gap-2">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}