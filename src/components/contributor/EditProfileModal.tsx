"use client";

import { useState } from "react";
import { X, Loader2, Save, UploadCloud, User, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import Image from "next/image"; // 🚀 Next.js Image Import

// 🚀 Image Compression Logic
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      // 🚀 FIX: Use window.Image to resolve Next.js Image conflict
      const img = new window.Image(); 
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxSize = 400; 

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
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm no-print animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Edit Profile"
    >
      <div className="bg-surface w-full max-w-lg rounded-lg border border-divider shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-divider bg-canvas/50 shrink-0">
          <div>
            <h2 className="font-serif font-bold text-ink text-xl">Edit Profile</h2>
            <p className="text-xs text-ink-muted mt-1">Update your public archive identity.</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 text-ink-muted hover:text-ink hover:bg-canvas border border-transparent hover:border-divider rounded-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Close modal"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6 text-left custom-scrollbar">
            
            {/* Photo Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-ink mb-3">Profile Photo</label>
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 rounded-full border-2 border-divider bg-canvas flex items-center justify-center shrink-0 overflow-hidden group cursor-pointer shadow-sm">
                  {preview ? (
                    <Image src={preview} alt="Profile Preview" fill className="object-cover" />
                  ) : (
                    <User size={32} className="text-ink/20" aria-hidden="true" />
                  )}
                  <div className="absolute inset-0 bg-ink/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <UploadCloud size={20} className="text-white mb-1" />
                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">Change</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label="Upload new profile photo"
                  />
                </div>
                <div className="text-sm">
                  <p className="text-ink font-medium">Upload a new photo</p>
                  <p className="text-ink-muted text-xs mt-1">JPG or PNG. Max 400x400px. Auto-compressed.</p>
                </div>
              </div>
            </div>

            {/* Username Section */}
            <div className="pt-2 border-t border-divider">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="username" className="block text-sm font-semibold text-ink">Username</label>
                {contributor.hasChangedUsername && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-sm">Locked</span>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-mono text-ink/40 font-semibold" aria-hidden="true">@</span>
                <input 
                  id="username"
                  type="text" 
                  value={username.replace('@', '')} 
                  onChange={(e) => setUsername(`@${e.target.value.replace(/[^a-zA-Z0-9_]/g, '')}`)}
                  disabled={contributor.hasChangedUsername}
                  autoComplete="off"
                  className="w-full h-11 pl-9 pr-4 rounded-sm border border-divider bg-canvas text-ink text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all" 
                />
              </div>
              <p className="text-[11px] text-ink-muted mt-1.5">
                {contributor.hasChangedUsername 
                  ? "You have already used your one-time username change." 
                  : "You can only change your username once. Choose carefully."}
              </p>
            </div>

            {/* Bio Section */}
            <div className="pt-2 border-t border-divider">
              <label htmlFor="bio" className="block text-sm font-semibold text-ink mb-2">Short Bio</label>
              <textarea 
                id="bio"
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                rows={4} 
                placeholder="Tell the community about yourself..." 
                className="w-full px-4 py-3 rounded-sm border border-divider bg-canvas text-ink text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none transition-all leading-relaxed" 
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-sm flex items-start gap-2">
                <span className="font-bold shrink-0">Error:</span> {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-divider bg-canvas/50 flex justify-end gap-3 shrink-0">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 border border-divider rounded-sm text-sm font-semibold hover:bg-surface text-ink transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-sm font-semibold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} aria-hidden="true" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}