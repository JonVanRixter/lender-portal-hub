import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { recheckRequests as initialRequests, type RecheckRequest, type RecheckHistoryEntry, type RecheckPriority } from "@/data/recheckRequests";
import { useAlerts } from "./AlertsContext";
import type { Alert } from "@/types";

interface SubmitRecheckPayload {
  dealerId: string;
  dealerName: string;
  lenderId: string;
  lenderName: string;
  sectionId: string;
  sectionName: string;
  controlId: string;
  controlName: string;
  currentResult: "Pass" | "Pending" | "Fail";
  currentScore: number;
  requestType: "Lender Re-Check" | "Fail Chase";
  reason: string;
  reasonDetail: string;
  priority: RecheckPriority;
  requestedBy: string;
  requestedDate: string;
}

interface RecheckContextType {
  requests: RecheckRequest[];
  getRequestsForDealer: (dealerId: string) => RecheckRequest[];
  getRequestForControl: (dealerId: string, controlName: string, sectionName: string) => RecheckRequest | undefined;
  submitRecheck: (payload: SubmitRecheckPayload) => RecheckRequest;
  addLenderNote: (requestId: string, note: string, userName: string) => void;
  escalatePriority: (requestId: string, userName: string) => void;
  dismissRequest: (requestId: string, reason: string, userName: string) => void;
}

const RecheckContext = createContext<RecheckContextType | null>(null);

function computeSlaDeadline(requestedDate: string, priority: RecheckPriority): string {
  const d = new Date(requestedDate);
  if (priority === "Critical") d.setHours(d.getHours() + 8);
  else if (priority === "High") d.setHours(d.getHours() + 24);
  else d.setHours(d.getHours() + 48);
  return d.toISOString();
}

function computeSlaDays(priority: RecheckPriority): number {
  if (priority === "Critical") return 0.33;
  if (priority === "High") return 1;
  return 2;
}

export function RecheckProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<RecheckRequest[]>(initialRequests);
  const { addAlert } = useAlerts();

  // SLA breach auto-escalation — check every 30s
  useEffect(() => {
    const check = () => {
      setRequests((prev) =>
        prev.map((r) => {
          if (r.status === "Completed" || r.status === "Dismissed") return r;
          const now = new Date();
          const sla = new Date(r.slaDeadline);
          if (now > sla && r.priority !== "Critical") {
            const newPriority: RecheckPriority = r.priority === "Normal" ? "High" : "Critical";
            const newR = {
              ...r,
              priority: newPriority,
              slaDeadline: computeSlaDeadline(r.requestedDate, newPriority),
              slaDays: computeSlaDays(newPriority),
              history: [
                ...r.history,
                {
                  date: now.toISOString(),
                  action: `SLA breached — priority auto-escalated from ${r.priority} to ${newPriority}`,
                  user: "System",
                  platform: "Lender" as const,
                },
              ],
            };
            addAlert({
              id: `al-sla-${r.id}-${Date.now()}`,
              type: "SLA Breach",
              dealerId: r.dealerId,
              severity: "High",
              message: `🔴 SLA breached: ${r.requestType} for ${r.controlName} — ${r.dealerName}. Priority auto-escalated.`,
              date: now.toISOString(),
              status: "Pending",
            });
            return newR;
          }
          return r;
        })
      );
    };
    const interval = setInterval(check, 30000);
    check(); // run once immediately
    return () => clearInterval(interval);
  }, [addAlert]);

  const getRequestsForDealer = useCallback(
    (dealerId: string) => requests.filter((r) => r.dealerId === dealerId),
    [requests]
  );

  const getRequestForControl = useCallback(
    (dealerId: string, controlName: string, sectionName: string) =>
      requests.find(
        (r) =>
          r.dealerId === dealerId &&
          r.controlName === controlName &&
          r.sectionName === sectionName &&
          r.status !== "Completed" &&
          r.status !== "Dismissed"
      ),
    [requests]
  );

  const submitRecheck = useCallback((partial: SubmitRecheckPayload): RecheckRequest => {
    const now = partial.requestedDate || new Date().toISOString();
    const slaHours = partial.priority === "Critical" ? 8 : partial.priority === "High" ? 24 : 48;
    const newRequest: RecheckRequest = {
      ...partial,
      id: `rr-${Date.now()}`,
      status: "Submitted",
      tcgAssignedTo: null,
      tcgPickedUpDate: null,
      tcgCompletedDate: null,
      tcgOutcome: null,
      tcgNotes: null,
      slaDeadline: computeSlaDeadline(now, partial.priority),
      slaDays: computeSlaDays(partial.priority),
      history: [
        {
          date: now,
          action: partial.requestType === "Fail Chase"
            ? "Fail chase auto-triggered"
            : "Request submitted",
          user: partial.requestedBy,
          platform: "Lender" as const,
        },
      ],
    };
    setRequests((prev) => [newRequest, ...prev]);

    // Create corresponding alert
    if (partial.requestType === "Fail Chase") {
      addAlert({
        id: `al-fc-${Date.now()}`,
        type: "Fail Chase Triggered",
        dealerId: partial.dealerId,
        severity: "High",
        message: `⚠️ Fail chase raised: ${partial.controlName} — ${partial.dealerName}. ${partial.reason}. TCG has been notified.`,
        date: now,
        status: "Pending",
      });
    } else {
      addAlert({
        id: `al-rc-${Date.now()}`,
        type: "Re-Check Submitted",
        dealerId: partial.dealerId,
        severity: "Low",
        message: `Re-check request submitted for ${partial.controlName} — ${partial.dealerName}. TCG will review within ${slaHours} hours.`,
        date: now,
        status: "Pending",
      });
    }

    return newRequest;
  }, [addAlert]);

  const addLenderNote = useCallback((requestId: string, note: string, userName: string) => {
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              history: [
                ...r.history,
                { date: now, action: `Lender note added: ${note}`, user: userName, platform: "Lender" as const },
              ],
            }
          : r
      )
    );
  }, []);

  const escalatePriority = useCallback((requestId: string, userName: string) => {
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const newPriority: RecheckPriority =
          r.priority === "Normal" ? "High" : r.priority === "High" ? "Critical" : "Critical";
        return {
          ...r,
          priority: newPriority,
          slaDeadline: computeSlaDeadline(r.requestedDate, newPriority),
          slaDays: computeSlaDays(newPriority),
          history: [
            ...r.history,
            {
              date: now,
              action: `Priority escalated from ${r.priority} to ${newPriority}`,
              user: userName,
              platform: "Lender" as const,
            },
          ],
        };
      })
    );
  }, []);

  const dismissRequest = useCallback((requestId: string, reason: string, userName: string) => {
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "Dismissed" as any,
              tcgOutcome: `Dismissed by lender: ${reason}`,
              tcgCompletedDate: now,
              history: [
                ...r.history,
                { date: now, action: `Dismissed: ${reason}`, user: userName, platform: "Lender" as const },
              ],
            }
          : r
      )
    );
  }, []);

  return (
    <RecheckContext.Provider
      value={{
        requests,
        getRequestsForDealer,
        getRequestForControl,
        submitRecheck,
        addLenderNote,
        escalatePriority,
        dismissRequest,
      }}
    >
      {children}
    </RecheckContext.Provider>
  );
}

export function useRecheck() {
  const ctx = useContext(RecheckContext);
  if (!ctx) throw new Error("useRecheck must be used within RecheckProvider");
  return ctx;
}
