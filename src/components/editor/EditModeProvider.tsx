"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";

interface EditModeContextType {
  isEditMode: boolean;
  setEditMode: (v: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  setEditMode: () => {},
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setEditMode] = useState(false);
  
  // 🚀 PERFORMANCE FIX: Memoize the context value to prevent unnecessary re-renders in child components
  const value = useMemo(() => ({ isEditMode, setEditMode }), [isEditMode]);

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}