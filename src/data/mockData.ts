import type { Dealer, ActivityItem } from "@/types";

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
