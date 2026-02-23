import type { Dealer, ActivityItem, DealerDocument, Alert } from "@/types";

export const dealers: Dealer[] = [
  { id: "d1", name: "AutoMax Motors", tradingName: "AutoMax", overallScore: 92, ragStatus: "Green", lastAuditDate: "2026-01-15T10:00:00Z", cssScore: 88 },
  { id: "d2", name: "Premier Car Sales", tradingName: "Premier Cars", overallScore: 78, ragStatus: "Green", lastAuditDate: "2026-02-01T09:30:00Z", cssScore: 74 },
  { id: "d3", name: "DriveRight Dealers", tradingName: "DriveRight", overallScore: 55, ragStatus: "Amber", lastAuditDate: "2025-12-20T14:00:00Z", cssScore: 60 },
  { id: "d4", name: "QuickSell Autos", tradingName: "QuickSell", overallScore: 34, ragStatus: "Red", lastAuditDate: "2025-11-10T08:00:00Z", cssScore: 30 },
  { id: "d5", name: "Horizon Vehicle Group", tradingName: "Horizon VG", overallScore: 85, ragStatus: "Green", lastAuditDate: "2026-02-10T11:00:00Z", cssScore: 82 },
  { id: "d6", name: "Apex Motor Trade", tradingName: "Apex Motors", overallScore: 47, ragStatus: "Amber", lastAuditDate: "2025-12-05T16:00:00Z", cssScore: 45 },
  { id: "d7", name: "ClearView Cars", tradingName: "ClearView", overallScore: 22, ragStatus: "Red", lastAuditDate: "2025-10-28T13:00:00Z", cssScore: 18 },
  { id: "d8", name: "Summit Auto Sales", tradingName: "Summit Autos", overallScore: 68, ragStatus: "Amber", lastAuditDate: "2026-01-22T10:30:00Z", cssScore: 65 },
  { id: "d9", name: "TrustDrive Ltd", tradingName: "TrustDrive", overallScore: 15, ragStatus: "Red", lastAuditDate: "2025-09-15T09:00:00Z", cssScore: 12 },
  { id: "d10", name: "GreenLine Motors", tradingName: "GreenLine", overallScore: 81, ragStatus: "Green", lastAuditDate: "2026-02-18T15:00:00Z", cssScore: 79 }
];

export const documents: DealerDocument[] = [
  { id: "doc1", name: "DBS Check - J. Smith", dealerId: "d1", category: "DBS", uploadDate: "2026-01-10T09:00:00Z", expiryDate: "2027-01-10T09:00:00Z", status: "Valid" },
  { id: "doc2", name: "FCA Training Certificate", dealerId: "d1", category: "Training", uploadDate: "2026-01-12T10:00:00Z", expiryDate: "2026-07-12T10:00:00Z", status: "Valid" },
  { id: "doc3", name: "Complaints Register Q4", dealerId: "d2", category: "Complaints", uploadDate: "2025-12-30T14:00:00Z", expiryDate: "2026-03-30T14:00:00Z", status: "Expiring Soon" },
  { id: "doc4", name: "DBS Check - A. Brown", dealerId: "d2", category: "DBS", uploadDate: "2025-06-15T08:00:00Z", expiryDate: "2026-06-15T08:00:00Z", status: "Valid" },
  { id: "doc5", name: "Anti-Money Laundering Training", dealerId: "d3", category: "Training", uploadDate: "2025-08-20T11:00:00Z", expiryDate: "2026-02-20T11:00:00Z", status: "Expired" },
  { id: "doc6", name: "Complaints Procedure v3", dealerId: "d3", category: "Complaints", uploadDate: "2025-11-01T09:30:00Z", expiryDate: "2026-11-01T09:30:00Z", status: "Valid" },
  { id: "doc7", name: "DBS Check - M. Taylor", dealerId: "d4", category: "DBS", uploadDate: "2024-11-05T10:00:00Z", expiryDate: "2025-11-05T10:00:00Z", status: "Expired" },
  { id: "doc8", name: "Motor Trade Insurance", dealerId: "d4", category: "Other", uploadDate: "2025-10-20T08:00:00Z", expiryDate: "2026-04-20T08:00:00Z", status: "Expiring Soon" },
  { id: "doc9", name: "Sales Staff Training Log", dealerId: "d5", category: "Training", uploadDate: "2026-02-01T12:00:00Z", expiryDate: "2027-02-01T12:00:00Z", status: "Valid" },
  { id: "doc10", name: "DBS Check - L. Harris", dealerId: "d5", category: "DBS", uploadDate: "2026-01-20T09:00:00Z", expiryDate: "2027-01-20T09:00:00Z", status: "Valid" },
  { id: "doc11", name: "Consumer Complaints Q3", dealerId: "d6", category: "Complaints", uploadDate: "2025-10-01T14:00:00Z", expiryDate: "2026-01-01T14:00:00Z", status: "Expired" },
  { id: "doc12", name: "Vulnerability Training Cert", dealerId: "d6", category: "Training", uploadDate: "2025-12-10T10:00:00Z", expiryDate: "2026-06-10T10:00:00Z", status: "Valid" },
  { id: "doc13", name: "DBS Check - R. Wilson", dealerId: "d7", category: "DBS", uploadDate: "2025-03-15T08:00:00Z", expiryDate: "2026-03-15T08:00:00Z", status: "Expiring Soon" },
  { id: "doc14", name: "Premises Licence", dealerId: "d7", category: "Other", uploadDate: "2025-01-10T09:00:00Z", expiryDate: "2025-07-10T09:00:00Z", status: "Expired" },
  { id: "doc15", name: "FCA Compliance Training", dealerId: "d8", category: "Training", uploadDate: "2026-01-05T11:00:00Z", expiryDate: "2026-07-05T11:00:00Z", status: "Valid" },
  { id: "doc16", name: "Complaints Register Q1", dealerId: "d8", category: "Complaints", uploadDate: "2026-02-15T13:00:00Z", expiryDate: "2026-05-15T13:00:00Z", status: "Expiring Soon" },
  { id: "doc17", name: "DBS Check - P. Evans", dealerId: "d9", category: "DBS", uploadDate: "2024-09-01T08:00:00Z", expiryDate: "2025-09-01T08:00:00Z", status: "Expired" },
  { id: "doc18", name: "Data Protection Policy", dealerId: "d9", category: "Other", uploadDate: "2025-06-20T10:00:00Z", expiryDate: "2026-06-20T10:00:00Z", status: "Valid" },
  { id: "doc19", name: "TCF Training Certificate", dealerId: "d10", category: "Training", uploadDate: "2026-02-10T09:00:00Z", expiryDate: "2027-02-10T09:00:00Z", status: "Valid" },
  { id: "doc20", name: "DBS Check - S. Green", dealerId: "d10", category: "DBS", uploadDate: "2026-01-28T08:00:00Z", expiryDate: "2027-01-28T08:00:00Z", status: "Valid" }
];

export const initialAlerts: Alert[] = [
  { id: "al1", type: "Threshold Breach", dealerId: "d9", severity: "High", message: "Overall score dropped below 20 – immediate review required", date: "2026-02-23T08:30:00Z", status: "Pending" },
  { id: "al2", type: "Document Expiry", dealerId: "d3", severity: "High", message: "Anti-Money Laundering Training certificate has expired", date: "2026-02-22T17:00:00Z", status: "Pending" },
  { id: "al3", type: "Threshold Breach", dealerId: "d7", severity: "High", message: "CSS score critically low at 18 – escalation needed", date: "2026-02-22T14:20:00Z", status: "Pending" },
  { id: "al4", type: "Document Expiry", dealerId: "d4", severity: "Medium", message: "Motor Trade Insurance expiring within 60 days", date: "2026-02-22T10:00:00Z", status: "Pending" },
  { id: "al5", type: "Manual Review Required", dealerId: "d4", severity: "High", message: "Dealer flagged for manual audit – multiple expired documents", date: "2026-02-21T16:00:00Z", status: "Pending" },
  { id: "al6", type: "Threshold Breach", dealerId: "d6", severity: "Medium", message: "Overall score dropped below 50 – monitoring advised", date: "2026-02-21T11:30:00Z", status: "Pending" },
  { id: "al7", type: "Document Expiry", dealerId: "d7", severity: "Medium", message: "DBS Check for R. Wilson expiring within 30 days", date: "2026-02-20T15:45:00Z", status: "Pending" },
  { id: "al8", type: "Manual Review Required", dealerId: "d9", severity: "High", message: "Dealer under investigation – pending compliance review", date: "2026-02-20T09:00:00Z", status: "Pending" },
  { id: "al9", type: "Document Expiry", dealerId: "d6", severity: "Low", message: "Consumer Complaints Q3 report has expired – replacement needed", date: "2026-02-19T14:00:00Z", status: "Acknowledged" },
  { id: "al10", type: "Threshold Breach", dealerId: "d4", severity: "Medium", message: "Overall score trending downward – 3 consecutive declines", date: "2026-02-19T10:30:00Z", status: "Acknowledged" },
  { id: "al11", type: "Manual Review Required", dealerId: "d3", severity: "Low", message: "Routine quarterly review due for DriveRight Dealers", date: "2026-02-18T16:00:00Z", status: "Acknowledged" },
  { id: "al12", type: "Document Expiry", dealerId: "d8", severity: "Medium", message: "Complaints Register Q1 expiring in May – plan renewal", date: "2026-02-18T11:00:00Z", status: "Pending" },
  { id: "al13", type: "Threshold Breach", dealerId: "d9", severity: "High", message: "CSS score at 12 – lowest in portfolio", date: "2026-02-17T09:30:00Z", status: "Acknowledged" },
  { id: "al14", type: "Manual Review Required", dealerId: "d7", severity: "Medium", message: "Multiple compliance flags – consolidated review recommended", date: "2026-02-16T14:15:00Z", status: "Pending" },
  { id: "al15", type: "Document Expiry", dealerId: "d2", severity: "Low", message: "Complaints Register Q4 approaching expiry in March", date: "2026-02-15T10:00:00Z", status: "Acknowledged" }
];

export const activityFeed: ActivityItem[] = [
  { id: "a1", timestamp: "2026-02-23T09:15:00Z", dealerName: "AutoMax Motors", eventType: "Audit completed" },
  { id: "a2", timestamp: "2026-02-23T08:42:00Z", dealerName: "TrustDrive Ltd", eventType: "Threshold breach" },
  { id: "a3", timestamp: "2026-02-22T17:30:00Z", dealerName: "GreenLine Motors", eventType: "Document uploaded" },
  { id: "a4", timestamp: "2026-02-22T14:10:00Z", dealerName: "QuickSell Autos", eventType: "Re-audit triggered" },
  { id: "a5", timestamp: "2026-02-22T11:05:00Z", dealerName: "ClearView Cars", eventType: "Threshold breach" },
  { id: "a6", timestamp: "2026-02-21T16:45:00Z", dealerName: "Horizon Vehicle Group", eventType: "Audit completed" },
  { id: "a7", timestamp: "2026-02-21T13:20:00Z", dealerName: "DriveRight Dealers", eventType: "Document uploaded" },
  { id: "a8", timestamp: "2026-02-21T10:00:00Z", dealerName: "Premier Car Sales", eventType: "Audit completed" },
  { id: "a9", timestamp: "2026-02-20T15:30:00Z", dealerName: "Apex Motor Trade", eventType: "Re-audit triggered" },
  { id: "a10", timestamp: "2026-02-20T12:15:00Z", dealerName: "Summit Auto Sales", eventType: "Document uploaded" },
  { id: "a11", timestamp: "2026-02-20T09:00:00Z", dealerName: "TrustDrive Ltd", eventType: "Re-audit triggered" },
  { id: "a12", timestamp: "2026-02-19T16:40:00Z", dealerName: "AutoMax Motors", eventType: "Document uploaded" },
  { id: "a13", timestamp: "2026-02-19T11:25:00Z", dealerName: "QuickSell Autos", eventType: "Threshold breach" }
];
