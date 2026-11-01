"use client";

import { useState, useEffect, useCallback } from "react";
import { RegisterProfileModal } from "@/components/shared/RegisterProfileModal";
import { Contributor, CONTRIBUTOR_STORAGE_KEY } from "@/lib/contributor";

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
    // 1. Agar user logged in hai (ya profile bana chuka hai)
    if (contributor) {
      formData.set("submitterName", contributor.displayName);
      formData.set("submitterUsername", contributor.username);
      await callback(formData);
    } 
    // 2. Agar logged in nahi hai
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

  // 🚀 EditModeToggle se login trigger karne ke liye
  const requestLogin = useCallback(() => {
    setShowRegistration(true);
  }, []);

  const registrationModal = showRegistration ? (
    <RegisterProfileModal
      onComplete={handleRegistrationComplete}
      onCancel={handleCancel}
    />
  ) : null;

  return { contributor, submitWithGate, requestLogin, registrationModal };
}