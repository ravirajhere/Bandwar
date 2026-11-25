"use client";

import { useState, useEffect, useCallback } from "react";
import { RegisterProfileModal } from "@/components/shared/RegisterProfileModal";
import { Contributor, CONTRIBUTOR_STORAGE_KEY } from "@/lib/contributor";

function readStoredContributor(): Contributor | null {
  try {
    const stored = localStorage.getItem(CONTRIBUTOR_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function useContributorGate() {
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<{
    data: FormData;
    cb: (data: FormData) => Promise<void>;
  } | null>(null);

  useEffect(() => {
    setContributor(readStoredContributor());
  }, []);

  const submitWithGate = useCallback(async (
    formData: FormData,
    callback: (data: FormData) => Promise<void>
  ) => {
    // State ka wait mat karo — localStorage se turant padho, nahi toh pehle click pe galat modal khulega
    const current = contributor || readStoredContributor();

    if (current) {
      if (!contributor) setContributor(current);
      // Ek hi naam rakho — submitterUsername hi source of truth hai
      // suggestedBy alias bhi de do taaki /api/suggestions ko alag se parse na karna pade
      formData.set("submitterName", current.displayName);
      formData.set("submitterUsername", current.username);
      formData.set("suggestedBy", current.username);
      await callback(formData);
    } else {
      setPendingSubmit({ data: formData, cb: callback });
      setShowRegistration(true);
    }
  }, [contributor]);

  const handleRegistrationComplete = useCallback(async (newContributor: Contributor) => {
    setContributor(newContributor);
    localStorage.setItem(CONTRIBUTOR_STORAGE_KEY, JSON.stringify(newContributor));
    setShowRegistration(false);

    if (pendingSubmit) {
      const { data, cb } = pendingSubmit;
      data.set("submitterName", newContributor.displayName);
      data.set("submitterUsername", newContributor.username);
      data.set("suggestedBy", newContributor.username);
      await cb(data);
      setPendingSubmit(null);
    }
  }, [pendingSubmit]);

  const handleCancel = useCallback(() => {
    setShowRegistration(false);
    setPendingSubmit(null);
  }, []);

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