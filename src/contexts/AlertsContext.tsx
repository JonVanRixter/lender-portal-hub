import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import { initialAlerts, dealers } from "@/data/mockData";
import type { Alert } from "@/types";

const dealerMap = new Map(dealers.map((d) => [d.id, d.name]));

interface AlertsContextType {
  alerts: Alert[];
  pendingCount: number;
  acknowledge: (alertId: string) => void;
  getDealerName: (dealerId: string) => string;
}

const AlertsContext = createContext<AlertsContextType | null>(null);

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const pendingCount = useMemo(
    () => alerts.filter((a) => a.status === "Pending").length,
    [alerts]
  );

  const acknowledge = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: "Acknowledged" as const } : a))
    );
  }, []);

  const getDealerName = useCallback(
    (dealerId: string) => dealerMap.get(dealerId) ?? "Unknown",
    []
  );

  return (
    <AlertsContext.Provider value={{ alerts, pendingCount, acknowledge, getDealerName }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error("useAlerts must be used within AlertsProvider");
  return ctx;
}
