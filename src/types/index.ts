export type RagStatus = "Green" | "Amber" | "Red";

export type DocCategory = "DBS" | "Training" | "Complaints" | "Other";
export type DocStatus = "Valid" | "Expiring Soon" | "Expired";

export type AlertType = "Threshold Breach" | "Document Expiry" | "Manual Review Required" | "Re-Check Submitted" | "Re-Check Picked Up" | "Re-Check Completed" | "Fail Chase Triggered" | "Fail Chase Update" | "SLA Breach" | "Re-Check Score Changed";
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

export interface DealerDirector {
  name: string;
  role: string;
  appointedDate: string;
}

export interface DealerShareholder {
  name: string;
  shareholding: string;
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
  directors?: DealerDirector[];
  shareholders?: DealerShareholder[];
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

/* ── Onboarding Pipeline ── */
export type OnboardingStage = "pre-screening" | "application" | "approval";
export type OnboardingStatus = "in_progress" | "approved" | "rejected";

export interface OnboardingSegmentation {
  franchise: string;
  size: string;
  stockType: string[];
  existingFinance: string;
}

export interface OnboardingApplication {
  id: string;
  dealerName: string;
  companyNumber: string | null;
  stage: OnboardingStage;
  status: OnboardingStatus;
  segmentation: OnboardingSegmentation;
  qualificationNotes: string | null;
  screeningResults: Record<string, unknown>;
  checklistProgress: Record<string, unknown>;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
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
