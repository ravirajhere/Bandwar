"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* 🪟 Toast Container */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[99999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300
              ${t.type === "success" ? "bg-card/95 border-green-500/30 text-foreground" : ""}
              ${t.type === "error" ? "bg-card/95 border-red-500/30 text-foreground" : ""}
              ${t.type === "info" ? "bg-card/95 border-blue-500/30 text-foreground" : ""}
            `}
          >
            <div className="flex items-center gap-3">
              {t.type === "success" && <CheckCircle2 size={20} className="text-green-500 shrink-0" />}
              {t.type === "error" && <AlertCircle size={20} className="text-red-500 shrink-0" />}
              {t.type === "info" && <Info size={20} className="text-blue-500 shrink-0" />}
              <p className="text-sm font-semibold">{t.message}</p>
            </div>
            <button onClick={() => removeToast(t.id)} className="text-muted hover:text-foreground transition-colors p-1">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// 🪝 Custom Hook to use anywhere
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}