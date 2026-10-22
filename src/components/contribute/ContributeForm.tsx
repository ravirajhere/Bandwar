"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export function ContributeForm({ email }: { email: string }) {
  const [type, setType] = useState("correction");
  const [isSent, setIsSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    target: "",
    details: "",
    source: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the email subject based on type
    const subject = `[${type.toUpperCase()}] Contribution for Bandwar Portal`;
    
    // Format the email body beautifully
    const body = `Name: ${formData.name}
Contact (Email/Phone): ${formData.contact}
Page/Article Name: ${formData.target}

Details of Contribution:
${formData.details}

Source/Reference (if any):
${formData.source}

---
Sent via Bandwar Village Portal`;

    // Create mailto link
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Trigger email client
    window.location.href = mailtoLink;
    setIsSent(true);
    
    // Reset message after 5 seconds
    setTimeout(() => setIsSent(false), 5000);
  };

  return (
    <div className="border border-wiki-border-light bg-wiki-bg p-4 md:p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Contribution Type Selector */}
        <div>
          <label className="block text-[14px] font-bold text-wiki-text mb-2">
            What are you contributing?
          </label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2.5 border border-wiki-border focus:outline-none focus:ring-2 focus:ring-wiki-link bg-wiki-bg-alt text-wiki-text text-[15px]"
          >
            <option value="correction">✏️ Suggest a Correction</option>
            <option value="information">➕ Add Information</option>
            <option value="person">👤 Add a Person</option>
            <option value="photo">📸 Submit a Photo</option>
            <option value="issue">🐞 Report an Issue</option>
          </select>
        </div>

        {/* Common Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-wiki-text-muted mb-1">Your Name <span className="text-red-500">*</span></label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-wiki-border-light focus:outline-none focus:border-wiki-link text-[14px]" placeholder="e.g., Ravi Raj" />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-wiki-text-muted mb-1">Your Email / Phone <span className="text-red-500">*</span></label>
            <input required type="text" name="contact" value={formData.contact} onChange={handleChange} className="w-full p-2 border border-wiki-border-light focus:outline-none focus:border-wiki-link text-[14px]" placeholder="So we can contact you" />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-wiki-text-muted mb-1">
            {type === "photo" ? "Photo Location / Description" : "Article Name / URL"} <span className="text-red-500">*</span>
          </label>
          <input required type="text" name="target" value={formData.target} onChange={handleChange} className="w-full p-2 border border-wiki-border-light focus:outline-none focus:border-wiki-link text-[14px]" placeholder={type === "photo" ? "e.g., Old temple photo, 1970s" : "e.g., SNK High School"} />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-wiki-text-muted mb-1">Details / Message <span className="text-red-500">*</span></label>
          <textarea required name="details" value={formData.details} onChange={handleChange} rows={4} className="w-full p-2 border border-wiki-border-light focus:outline-none focus:border-wiki-link text-[14px] resize-y" placeholder="Please provide the exact details here..."></textarea>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-wiki-text-muted mb-1">Source / Reference (Optional)</label>
          <input type="text" name="source" value={formData.source} onChange={handleChange} className="w-full p-2 border border-wiki-border-light focus:outline-none focus:border-wiki-link text-[14px]" placeholder="Where did you get this info?" />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full flex items-center justify-center gap-2 bg-wiki-link text-white p-3 font-bold text-[15px] hover:bg-blue-800 transition-colors"
        >
          {isSent ? (
            <>
              <CheckCircle2 size={18} /> Email Draft Opened!
            </>
          ) : (
            <>
              <Send size={18} /> Send via Email
            </>
          )}
        </button>
        
        <p className="text-[12px] text-wiki-text-muted text-center mt-2">
          Clicking this will open your default email app (like Gmail) with the information pre-filled.
        </p>
      </form>
    </div>
  );
}