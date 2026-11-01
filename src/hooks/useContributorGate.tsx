"use client";

import { useState, useEffect } from "react";
import { RegisterProfileModal } from "@/components/shared/RegisterProfileModal";
import { Contributor, CONTRIBUTOR_STORAGE_KEY, isAdmin } from "@/lib/contributor";

export function useContributorGate() {
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<{
    data: FormData;
    cb: (data: FormData) => Promise<void>;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CONTRIBUTOR_STORAGE_KEY);
    if (stored) {
      try { setContributor(JSON.parse(stored)); } catch {}
    }
  }, []);

  const submitWithGate = async (
    formData: FormData,
    callback: (data: FormData) => Promise<void>
  ) => {
    // 1. Agar user already registered hai (ya Admin hai)
    if (contributor) {
      formData.set("submitterName", contributor.displayName);
      formData.set("submitterUsername", contributor.username);
      
      // Admin ko alag se mark kar dein agar zaroorat ho
      if (isAdmin(contributor.username)) {
        formData.set("isAdmin", "true");
      }
      
      await callback(formData);
    } 
    // 2. Agar pehli baar edit kar raha hai (koi free edit nahi)
    else {
      setPendingSubmit({ data: formData, cb: callback });
      setShowRegistration(true);
    }
  };

  const handleRegistrationComplete = async (newContributor: Contributor) => {
    setContributor(newContributor);
    localStorage.setItem(CONTRIBUTOR_STORAGE_KEY, JSON.stringify(newContributor));
    setShowRegistration(false);

    if (pendingSubmit) {
      const { data, cb } = pendingSubmit;
      data.set("submitterName", newContributor.displayName);
      data.set("submitterUsername", newContributor.username);
      await cb(data);
      setPendingSubmit(null);
    }
  };

  const handleCancel = () => {
    setShowRegistration(false);
    setPendingSubmit(null);
  };

  const registrationModal = showRegistration ? (
    <RegisterProfileModal
      onComplete={handleRegistrationComplete}
      onCancel={handleCancel}
    />
  ) : null;

  return { contributor, submitWithGate, registrationModal };
}