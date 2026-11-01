"use client";

import { useState, createContext, useContext, ReactNode } from "react";
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
    // ✅ Fixed: substr() is deprecated, using slice() instead
    const id = Math.random().toString(36).slice(2, 11);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* 🪟 Toast Container (Accessible & Formal) */}
      <div 
        className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-[99999] flex flex-col gap-3 pointer-events-none"
        role="status"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className={`
              pointer-events-auto flex items-start justify-between gap-3 px-4 py-3.5 3xl:px-6 3xl:py-5 rounded-md shadow-lg border backdrop-blur-md bg-surface/95 text-ink animate-in slide-in-from-bottom-5 fade-in duration-300
              ${t.type === "success" ? "border-green-500/40" : ""}
              ${t.type === "error" ? "border-red-500/40" : ""}
              ${t.type === "info" ? "border-blue-500/40" : ""}
            `}
          >
            <div className="flex items-start gap-3">
              {t.type === "success" && <CheckCircle2 size={20} className="text-green-600 dark:text-green-500 shrink-0 mt-0.5 3xl:w-6 3xl:h-6" />}
              {t.type === "error" && <AlertCircle size={20} className="text-red-600 dark:text-red-500 shrink-0 mt-0.5 3xl:w-6 3xl:h-6" />}
              {t.type === "info" && <Info size={20} className="text-blue-600 dark:text-blue-500 shrink-0 mt-0.5 3xl:w-6 3xl:h-6" />}
              <p className="text-sm 3xl:text-base font-medium leading-snug">{t.message}</p>
            </div>
            <button 
              onClick={() => removeToast(t.id)} 
              className="text-ink/40 hover:text-ink transition-colors p-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
              aria-label="Dismiss notification"
            >
              <X size={16} className="3xl:w-5 3xl:h-5" />
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