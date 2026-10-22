"use client";

import { PhoneCall, ShieldAlert, Ambulance, Stethoscope } from "lucide-react";
import { MasterConfig } from "@/lib/schema";

export function EmergencyBar({ config }: { config: MasterConfig }) {
  if (!config.emergencyContacts || config.emergencyContacts.length === 0) return null;

  return (
    // Mobile-only sticky bar at the bottom
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-wiki-bg-alt border-t border-wiki-border md:hidden flex justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe">
      {config.emergencyContacts.map((contact, idx) => {
        // Dynamic Icon Selection
        let Icon = PhoneCall;
        if (contact.type === "police") Icon = ShieldAlert;
        if (contact.type === "ambulance") Icon = Ambulance;
        if (contact.type === "health") Icon = Stethoscope;

        return (
          <a 
            key={idx}
            href={`tel:${contact.number}`}
            className="flex flex-col items-center justify-center w-full py-2.5 text-wiki-text hover:bg-wiki-bg active:bg-[#eaecf0] transition-colors"
            aria-label={`Call ${contact.label} at ${contact.number}`}
          >
            <Icon size={20} className="text-wiki-link mb-1" />
            <span className="text-[11px] font-bold uppercase tracking-wider">{contact.label}</span>
          </a>
        );
      })}
    </div>
  );
}