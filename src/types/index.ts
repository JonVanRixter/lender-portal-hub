export type RagStatus = "Green" | "Amber" | "Red";

export type DocCategory = "DBS" | "Training" | "Complaints" | "Other";
export type DocStatus = "Valid" | "Expiring Soon" | "Expired";

export type AlertType = "Threshold Breach" | "Document Expiry" | "Manual Review Required";
export type AlertSeverity = "High" | "Medium" | "Low";
export type AlertStatus = "Pending" | "Acknowledged";

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
  type: AlertType;
  dealerId: string;
  severity: AlertSeverity;
  message: string;
  date: string;
  status: AlertStatus;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  dealerName: string;
  eventType: "Audit completed" | "Threshold breach" | "Document uploaded" | "Re-audit triggered";
}
