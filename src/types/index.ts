export type RagStatus = "Green" | "Amber" | "Red";

export type DocCategory = "DBS" | "Training" | "Complaints" | "Other";
export type DocStatus = "Valid" | "Expiring Soon" | "Expired";

export type AlertType = "Threshold Breach" | "Document Expiry" | "Manual Review Required";
export type AlertSeverity = "High" | "Medium" | "Low";
export type AlertStatus = "Pending" | "Acknowledged";

export type CssStatus = "Reward" | "Oversight";
export type SectionResult = "Pass" | "Pending" | "Fail";
export type ActionStatus = "Open" | "In Progress" | "Completed";
export type AuditChange = "up" | "down" | "neutral";

export interface DealerSection {
  id: string;
  name: string;
  score: number;
  ragStatus: RagStatus;
  result: SectionResult;
  notes: string;
}

export interface AuditHistoryEntry {
  id: string;
  date: string;
  initiatedBy: string;
  overallScore: number;
  ragStatus: RagStatus;
  change: AuditChange;
}

export interface KeyAction {
  id: string;
  description: string;
  status: ActionStatus;
  dueDate: string;
  assignedTo: string;
}

export interface Dealer {
  id: string;
  name: string;
  tradingName: string;
  companiesHouseNumber?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  overallScore: number;
  ragStatus: RagStatus;
  lastAuditDate: string;
  cssScore: number;
  cssStatus?: CssStatus;
  sections?: DealerSection[];
  auditHistory?: AuditHistoryEntry[];
  keyActions?: KeyAction[];
  notes?: string;
}

export interface DealerDocument {
  id: string;
  name: string;
  dealerId: string;
  category: DocCategory;
  uploadDate: string;
  expiryDate: string | null;
  status: DocStatus;
}

export interface Alert {
  id: string;
  type: AlertType;
  dealerId: string;
  severity: AlertSeverity;
  message: string;
  date: string;
  status: AlertStatus;
}

export type ActivityEventType =
  | "Audit Completed"
  | "Threshold Breach"
  | "Document Uploaded"
  | "Manual Re-Audit Triggered";

export interface ActivityItem {
  id: string;
  timestamp: string;
  dealerId: string;
  dealerName: string;
  eventType: ActivityEventType;
  detail: string;
  user: string;
}

export type DndEntityType = "Dealer" | "Director";
export type DndReason = "Fraudulent activity" | "Failed compliance checks" | "Non-payment" | "Other";

export interface DoNotDealEntry {
  id: string;
  entityName: string;
  entityType: DndEntityType;
  companiesHouseNumber: string | null;
  reason: DndReason;
  notes: string;
  dateAdded: string;
  addedBy: string;
  failedChecks: string[];
}
