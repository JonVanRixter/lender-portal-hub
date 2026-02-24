export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  field: string;
  oldValue: string;
  newValue: string;
}

const STORAGE_KEY = "dg_audit_log";

export function getAuditLog(): AuditEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addAuditEntry(
  entry: Omit<AuditEntry, "id" | "timestamp">
): AuditEntry {
  const full: AuditEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  const log = getAuditLog();
  log.unshift(full);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(0, 200)));
  return full;
}
