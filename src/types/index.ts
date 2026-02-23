export type RagStatus = "Green" | "Amber" | "Red";

export type DocCategory = "DBS" | "Training" | "Complaints" | "Other";
export type DocStatus = "Valid" | "Expiring Soon" | "Expired";

export interface Dealer {
  id: string;
  name: string;
  tradingName: string;
  overallScore: number;
  ragStatus: RagStatus;
  lastAuditDate: string;
  cssScore: number;
}

export interface DealerDocument {
  id: string;
  name: string;
  dealerId: string;
  category: DocCategory;
  uploadDate: string;
  expiryDate: string;
  status: DocStatus;
}

export interface Alert {
  id: string;
  type: string;
  dealerId: string;
  severity: RagStatus;
  message: string;
  date: string;
  status: string;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  dealerName: string;
  eventType: "Audit completed" | "Threshold breach" | "Document uploaded" | "Re-audit triggered";
}
