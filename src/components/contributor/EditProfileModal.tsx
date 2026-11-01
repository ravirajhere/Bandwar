"use client";

import { useState, useRef } from "react";
import { X, Loader2, Save, UploadCloud, User } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

// 🚀 Image Compression Logic
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxSize = 400; // Profile pics shouldn't be huge

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
            } else {
              reject(new Error("Compression failed"));
            }
          },
          "image/jpeg",
          0.85
        );
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

export function EditProfileModal({ contributor, onClose }: { contributor: any, onClose: () => void }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bio, setBio] = useState(contributor.bio || "");
  const [username, setUsername] = useState(contributor.username || "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(contributor.photo || "");
  const [error, setError] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("id", contributor.id);
      formData.append("newUsername", username);
      formData.append("bio", bio);
      
      if (file) {
        // 🚀 Compress and send
        const compressed = await compressImage(file);
        formData.append("photoFile", compressed);
      }

      const res = await fetch("/api/contributor/update", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast("Profile updated successfully!", "success");
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
      <div className="bg-surface w-full max-w-lg rounded-sm border border-divider shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-divider bg-canvas/50">
          <h2 className="font-serif font-bold text-ink text-lg">Edit Profile</h2>
          <button onClick={onClose} className="p-2 border border-divider rounded-sm hover:bg-canvas"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5">
          
          {/* 🚀 Photo Upload Section */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border border-divider bg-canvas flex items-center justify-center shrink-0 overflow-hidden relative group cursor-pointer">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-ink/20" />
              )}
              <div className="absolute inset-0 bg-ink/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <UploadCloud size={20} className="text-white" />
              </div>
              <input 
                type="file" 
                accept="image/*"
                onChange={handlePhotoChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink mb-1">Profile Photo</p>
              <p className="text-xs text-ink-muted">Click to upload. (Auto-compressed)</p>
            </div>
          </div>

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