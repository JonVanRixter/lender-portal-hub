export type RagStatus = "Green" | "Amber" | "Red";

export interface Dealer {
  id: string;
  name: string;
  tradingName: string;
  overallScore: number;
  ragStatus: RagStatus;
  lastAuditDate: string;
  cssScore: number;
}

export interface Document {
  id: string;
  name: string;
  dealerId: string;
  category: string;
  uploadDate: string;
  expiryDate: string;
  status: string;
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
