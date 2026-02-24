import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { OnboardingApplicationFull, OnboardingAppStatus } from "@/types/onboarding";
import { createEmptyApplication } from "@/types/onboarding";

const STORAGE_KEY = "dg_onboarding_apps";

interface OnboardingContextType {
  applications: OnboardingApplicationFull[];
  getApplication: (id: string) => OnboardingApplicationFull | undefined;
  createApplication: (data: Partial<OnboardingApplicationFull>) => OnboardingApplicationFull;
  updateApplication: (id: string, patch: Partial<OnboardingApplicationFull>) => void;
  updateApplicationDeep: (id: string, updater: (app: OnboardingApplicationFull) => OnboardingApplicationFull) => void;
  setApplicationStatus: (id: string, status: OnboardingAppStatus) => void;
}

const OnboardingCtx = createContext<OnboardingContextType | null>(null);

function loadFromStorage(): OnboardingApplicationFull[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(apps: OnboardingApplicationFull[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export function OnboardingWorkflowProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<OnboardingApplicationFull[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(applications);
  }, [applications]);

  const getApplication = useCallback(
    (id: string) => applications.find((a) => a.id === id),
    [applications]
  );

  const createApplication = useCallback((data: Partial<OnboardingApplicationFull>) => {
    const now = new Date().toISOString();
    const app: OnboardingApplicationFull = {
      ...createEmptyApplication(),
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as OnboardingApplicationFull;
    setApplications((prev) => [...prev, app]);
    return app;
  }, []);

  const updateApplication = useCallback((id: string, patch: Partial<OnboardingApplicationFull>) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a))
    );
  }, []);

  const updateApplicationDeep = useCallback(
    (id: string, updater: (app: OnboardingApplicationFull) => OnboardingApplicationFull) => {
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...updater(a), updatedAt: new Date().toISOString() } : a))
      );
    },
    []
  );

  const setApplicationStatus = useCallback((id: string, status: OnboardingAppStatus) => {
    updateApplication(id, { status });
  }, [updateApplication]);

  return (
    <OnboardingCtx.Provider value={{ applications, getApplication, createApplication, updateApplication, updateApplicationDeep, setApplicationStatus }}>
      {children}
    </OnboardingCtx.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingCtx);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingWorkflowProvider");
  return ctx;
}
