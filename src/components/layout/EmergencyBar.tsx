"use client";

import { PhoneCall, ShieldAlert, Ambulance, Stethoscope } from "lucide-react";
import { MasterConfig } from "@/lib/schema";

export function EmergencyBar({ config }: { config: MasterConfig }) {
  if (!config.emergencyContacts || config.emergencyContacts.length === 0) return null;

  // Zyada contacts hone par UI na toote, isliye max 4 contact dikhayenge
  const displayContacts = config.emergencyContacts.slice(0, 4);

  return (
    // Mobile-only sticky bar (Glassmorphism effect)
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/90 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe no-print">
      <div className="flex justify-around items-center h-16">
        {displayContacts.map((contact, idx) => {
          // Dynamic Icon Selection
          let Icon = PhoneCall;
          if (contact.type === "police") Icon = ShieldAlert;
          if (contact.type === "ambulance") Icon = Ambulance;
          if (contact.type === "health") Icon = Stethoscope;

          return (
            <a 
              key={idx}
              href={`tel:${contact.number}`}
              className="flex flex-col items-center justify-center flex-1 h-full text-foreground/80 active:bg-brand/10 transition-colors group"
              aria-label={`Call ${contact.label} at ${contact.number}`}
            >
              {/* Icon Container */}
              <div className="bg-brand/10 text-brand p-1.5 rounded-full mb-1 group-active:scale-95 transition-transform">
                <Icon size={18} strokeWidth={2.5} />
              </div>
              {/* Label */}
              <span className="text-[12px] font-bold tracking-wide uppercase line-clamp-1 px-1">
                {contact.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}