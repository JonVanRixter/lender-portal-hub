import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { EulaModal } from "./EulaModal";
import { GuidedTour } from "./GuidedTour";

type OnboardingPhase = "eula" | "tour" | "complete";

interface OnboardingContextType {
  phase: OnboardingPhase;
}

const OnboardingContext = createContext<OnboardingContextType>({ phase: "complete" });

export function useOnboarding() {
  return useContext(OnboardingContext);
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, logout } = useAuth();

  const [phase, setPhase] = useState<OnboardingPhase>(() => {
    if (!isAuthenticated) return "complete";
    if (!localStorage.getItem("dealerguard_eula_accepted")) return "eula";
    if (!localStorage.getItem("dealerguard_tour_completed")) return "tour";
    return "complete";
  });

  // Re-check when auth state changes
  useEffect(() => {
    if (!isAuthenticated) {
      setPhase("complete");
      return;
    }
    if (!localStorage.getItem("dealerguard_eula_accepted")) {
      setPhase("eula");
    } else if (!localStorage.getItem("dealerguard_tour_completed")) {
      setPhase("tour");
    } else {
      setPhase("complete");
    }
  }, [isAuthenticated]);

  const handleEulaAccept = useCallback(() => {
    localStorage.setItem("dealerguard_eula_accepted", "true");
    setPhase("tour");
  }, []);

  const handleEulaDecline = useCallback(() => {
    logout();
    setPhase("complete");
  }, [logout]);

  const handleTourComplete = useCallback(() => {
    localStorage.setItem("dealerguard_tour_completed", "true");
    setPhase("complete");
  }, []);

  return (
    <OnboardingContext.Provider value={{ phase }}>
      {children}
      {isAuthenticated && phase === "eula" && (
        <EulaModal onAccept={handleEulaAccept} onDecline={handleEulaDecline} />
      )}
      {isAuthenticated && phase === "tour" && (
        <GuidedTour onComplete={handleTourComplete} />
      )}
    </OnboardingContext.Provider>
  );
}
