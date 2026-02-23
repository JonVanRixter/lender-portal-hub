import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import { initialAlerts } from "@/data/mockData";
import { useDealers } from "./DealersContext";
import type { Alert } from "@/types";

interface AlertsContextType {
  alerts: Alert[];
  pendingCount: number;
  acknowledge: (alertId: string) => void;
  addAlert: (alert: Alert) => void;
  getDealerName: (dealerId: string) => string;
}

const AlertsContext = createContext<AlertsContextType | null>(null);

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const { dealers } = useDealers();

  const dealerMap = useMemo(
    () => new Map(dealers.map((d) => [d.id, d.name])),
    [dealers]
  );

  const pendingCount = useMemo(
    () => alerts.filter((a) => a.status === "Pending").length,
    [alerts]
  );

  const acknowledge = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: "Acknowledged" as const } : a))
    );
  }, []);

  const addAlert = useCallback((alert: Alert) => {
    setAlerts((prev) => [alert, ...prev]);
  }, []);

  const getDealerName = useCallback(
    (dealerId: string) => dealerMap.get(dealerId) ?? "Unknown",
    [dealerMap]
  );

  return (
    <AlertsContext.Provider value={{ alerts, pendingCount, acknowledge, addAlert, getDealerName }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error("useAlerts must be used within AlertsProvider");
  return ctx;
}
