import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import { dealers as initialDealers, activityFeed as initialActivityFeed } from "@/data/mockData";
import type { Dealer, ActivityItem, DealerSection, AuditHistoryEntry } from "@/types";

interface UpdateAuditPayload {
  dealerId: string;
  sections: DealerSection[];
  initiatedBy: string;
}

interface DealersContextType {
  dealers: Dealer[];
  activityFeed: ActivityItem[];
  updateAudit: (payload: UpdateAuditPayload) => {
    oldScore: number;
    newScore: number;
    oldRag: string;
    newRag: string;
    ragWorsened: boolean;
    ragImproved: boolean;
  };
  getDealerById: (id: string) => Dealer | undefined;
}

const DealersContext = createContext<DealersContextType | null>(null);

function computeRag(score: number): "Green" | "Amber" | "Red" {
  if (score >= 75) return "Green";
  if (score >= 50) return "Amber";
  return "Red";
}

function computeChange(oldScore: number, newScore: number): "up" | "down" | "neutral" {
  if (newScore > oldScore) return "up";
  if (newScore < oldScore) return "down";
  return "neutral";
}

const RAG_ORDER = { Green: 0, Amber: 1, Red: 2 };

export function DealersProvider({ children }: { children: ReactNode }) {
  const [dealers, setDealers] = useState<Dealer[]>(initialDealers);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>(initialActivityFeed);

  const getDealerById = useCallback(
    (id: string) => dealers.find((d) => d.id === id),
    [dealers]
  );

  const updateAudit = useCallback(
    (payload: UpdateAuditPayload) => {
      const dealer = dealers.find((d) => d.id === payload.dealerId);
      if (!dealer) throw new Error("Dealer not found");

      const oldScore = dealer.overallScore;
      const oldRag = dealer.ragStatus;
      const newScore = Math.round(
        payload.sections.reduce((sum, s) => sum + s.score, 0) / payload.sections.length
      );
      const newRag = computeRag(newScore);
      const change = computeChange(oldScore, newScore);
      const ragWorsened = RAG_ORDER[newRag] > RAG_ORDER[oldRag];
      const ragImproved = RAG_ORDER[newRag] < RAG_ORDER[oldRag];
      const now = new Date().toISOString();
      const dateStr = "2026-02-23";

      const newHistoryEntry: AuditHistoryEntry = {
        id: `ah-reaudit-${Date.now()}`,
        date: dateStr,
        initiatedBy: payload.initiatedBy,
        overallScore: newScore,
        ragStatus: newRag,
        change,
      };

      // Update dealer
      setDealers((prev) =>
        prev.map((d) =>
          d.id === payload.dealerId
            ? {
                ...d,
                sections: payload.sections,
                overallScore: newScore,
                ragStatus: newRag,
                lastAuditDate: dateStr,
                auditHistory: [newHistoryEntry, ...(d.auditHistory ?? [])],
              }
            : d
        )
      );

      // Add activity event
      const activityEvent: ActivityItem = {
        id: `ev-${Date.now()}`,
        timestamp: now,
        dealerId: payload.dealerId,
        dealerName: dealer.tradingName,
        eventType: ragWorsened ? "Threshold Breach" : "Audit Completed",
        detail: `Audit updated. Score changed from ${oldScore} to ${newScore}. RAG: ${oldRag} → ${newRag}.`,
        user: payload.initiatedBy,
      };
      setActivityFeed((prev) => [activityEvent, ...prev]);

      return { oldScore, newScore, oldRag, newRag, ragWorsened, ragImproved };
    },
    [dealers]
  );

  return (
    <DealersContext.Provider value={{ dealers, activityFeed, updateAudit, getDealerById }}>
      {children}
    </DealersContext.Provider>
  );
}

export function useDealers() {
  const ctx = useContext(DealersContext);
  if (!ctx) throw new Error("useDealers must be used within DealersProvider");
  return ctx;
}
