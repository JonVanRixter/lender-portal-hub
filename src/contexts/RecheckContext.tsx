import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { recheckRequests as initialRequests, type RecheckRequest, type RecheckHistoryEntry } from "@/data/recheckRequests";

interface RecheckContextType {
  requests: RecheckRequest[];
  getRequestsForDealer: (dealerId: string) => RecheckRequest[];
  getRequestForControl: (dealerId: string, controlName: string, sectionName: string) => RecheckRequest | undefined;
  submitRecheck: (request: Omit<RecheckRequest, "id" | "history" | "status" | "tcgAssignedTo" | "tcgPickedUpDate" | "tcgCompletedDate" | "tcgOutcome" | "tcgNotes" | "slaDeadline" | "slaDays">) => void;
}

const RecheckContext = createContext<RecheckContextType | null>(null);

export function RecheckProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<RecheckRequest[]>(initialRequests);

  const getRequestsForDealer = useCallback(
    (dealerId: string) => requests.filter((r) => r.dealerId === dealerId),
    [requests]
  );

  const getRequestForControl = useCallback(
    (dealerId: string, controlName: string, sectionName: string) =>
      requests.find(
        (r) => r.dealerId === dealerId && r.controlName === controlName && r.sectionName === sectionName && r.status !== "Completed"
      ),
    [requests]
  );

  const submitRecheck = useCallback((partial: Omit<RecheckRequest, "id" | "history" | "status" | "tcgAssignedTo" | "tcgPickedUpDate" | "tcgCompletedDate" | "tcgOutcome" | "tcgNotes" | "slaDeadline" | "slaDays">) => {
    const now = new Date().toISOString();
    const slaDate = new Date();
    slaDate.setDate(slaDate.getDate() + 2);

    const newRequest: RecheckRequest = {
      ...partial,
      id: `rr-${Date.now()}`,
      status: "Submitted",
      tcgAssignedTo: null,
      tcgPickedUpDate: null,
      tcgCompletedDate: null,
      tcgOutcome: null,
      tcgNotes: null,
      slaDeadline: slaDate.toISOString(),
      slaDays: 2,
      history: [
        { date: now, action: "Request submitted", user: partial.requestedBy, platform: "Lender" as const },
      ],
    };
    setRequests((prev) => [newRequest, ...prev]);
  }, []);

  return (
    <RecheckContext.Provider value={{ requests, getRequestsForDealer, getRequestForControl, submitRecheck }}>
      {children}
    </RecheckContext.Provider>
  );
}

export function useRecheck() {
  const ctx = useContext(RecheckContext);
  if (!ctx) throw new Error("useRecheck must be used within RecheckProvider");
  return ctx;
}
