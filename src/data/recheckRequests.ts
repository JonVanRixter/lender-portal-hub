export interface RecheckHistoryEntry {
  date: string;
  action: string;
  user: string;
  platform: "Lender" | "TCG";
}

export type RecheckStatus = "Submitted" | "In Progress" | "Completed" | "Escalated";
export type RecheckPriority = "Normal" | "High" | "Critical";
export type RecheckRequestType = "Lender Re-Check" | "Fail Chase";

export interface RecheckRequest {
  id: string;
  dealerId: string;
  dealerName: string;
  lenderId: string;
  lenderName: string;
  sectionId: string;
  sectionName: string;
  controlId: string;
  controlName: string;
  currentResult: "Pass" | "Pending" | "Fail";
  currentScore: number;
  requestType: RecheckRequestType;
  reason: string;
  reasonDetail: string;
  priority: RecheckPriority;
  requestedBy: string;
  requestedDate: string;
  status: RecheckStatus;
  tcgAssignedTo: string | null;
  tcgPickedUpDate: string | null;
  tcgCompletedDate: string | null;
  tcgOutcome: string | null;
  tcgNotes: string | null;
  slaDeadline: string;
  slaDays: number;
  history: RecheckHistoryEntry[];
}

export const recheckRequests: RecheckRequest[] = [
  {
    id: "rr001",
    dealerId: "d001",
    dealerName: "Blackmore Automotive Ltd",
    lenderId: "l001",
    lenderName: "Apex Motor Finance Ltd",
    sectionId: "s4",
    sectionName: "KYC & AML",
    controlId: "s4c4",
    controlName: "Source of funds",
    currentResult: "Pass",
    currentScore: 85,
    requestType: "Lender Re-Check",
    reason: "Score concern",
    reasonDetail: "We've received 3 informal complaints about Blackmore's handling of support requests in January. Could TCG re-verify their consumer support processes?",
    priority: "Normal",
    requestedBy: "Sarah Jenkins",
    requestedDate: "2026-02-20T10:30:00",
    status: "Submitted",
    tcgAssignedTo: null,
    tcgPickedUpDate: null,
    tcgCompletedDate: null,
    tcgOutcome: null,
    tcgNotes: null,
    slaDeadline: "2026-02-22T10:30:00",
    slaDays: 2,
    history: [
      { date: "2026-02-20T10:30:00", action: "Request submitted", user: "Sarah Jenkins", platform: "Lender" },
    ],
  },
  {
    id: "rr002",
    dealerId: "d010",
    dealerName: "Summit Cars",
    lenderId: "l001",
    lenderName: "Apex Motor Finance Ltd",
    sectionId: "s1",
    sectionName: "Legal Status",
    controlId: "s1c1",
    controlName: "Legal entity status",
    currentResult: "Fail",
    currentScore: 42,
    requestType: "Fail Chase",
    reason: "Control failed — auto-chase triggered",
    reasonDetail: "Companies House confirmation statement is overdue. Legal entity status check has failed. Automatic chase raised to TCG to pursue updated filings from the dealer.",
    priority: "High",
    requestedBy: "System (Auto)",
    requestedDate: "2026-02-27T09:00:00",
    status: "In Progress",
    tcgAssignedTo: "Tom Griffiths",
    tcgPickedUpDate: "2026-02-27T11:00:00",
    tcgCompletedDate: null,
    tcgOutcome: null,
    tcgNotes: "Contacted dealer by email 27 Feb — awaiting response. Follow-up call scheduled 03 Mar.",
    slaDeadline: "2026-02-28T09:00:00",
    slaDays: 1,
    history: [
      { date: "2026-02-27T09:00:00", action: "Fail chase auto-triggered", user: "System", platform: "Lender" },
      { date: "2026-02-27T11:00:00", action: "Picked up by Tom Griffiths", user: "Tom Griffiths", platform: "TCG" },
      { date: "2026-02-27T11:15:00", action: "TCG note added: Contacted dealer by email", user: "Tom Griffiths", platform: "TCG" },
    ],
  },
  {
    id: "rr003",
    dealerId: "d005",
    dealerName: "Westfield Auto Centre Ltd",
    lenderId: "l001",
    lenderName: "Apex Motor Finance Ltd",
    sectionId: "s4",
    sectionName: "KYC & AML",
    controlId: "s5c1",
    controlName: "KYC/IDV completed",
    currentResult: "Pass",
    currentScore: 75,
    requestType: "Lender Re-Check",
    reason: "Routine verification",
    reasonDetail: "Westfield had a recent change of director — we want TCG to re-verify the KYC/IDV status is still current post-change.",
    priority: "Normal",
    requestedBy: "Mark Davies",
    requestedDate: "2026-02-15T14:00:00",
    status: "Completed",
    tcgAssignedTo: "Amara Osei",
    tcgPickedUpDate: "2026-02-15T16:00:00",
    tcgCompletedDate: "2026-02-17T10:00:00",
    tcgOutcome: "Confirmed — no change",
    tcgNotes: "Re-verified KYC/IDV records post-director change. New director (appointed 01 Feb 2026) has completed full IDV. All checks pass. No change to control result.",
    slaDeadline: "2026-02-17T14:00:00",
    slaDays: 2,
    history: [
      { date: "2026-02-15T14:00:00", action: "Request submitted", user: "Mark Davies", platform: "Lender" },
      { date: "2026-02-15T16:00:00", action: "Picked up by Amara Osei", user: "Amara Osei", platform: "TCG" },
      { date: "2026-02-17T10:00:00", action: "Completed — Confirmed no change", user: "Amara Osei", platform: "TCG" },
    ],
  },
  {
    id: "rr004",
    dealerId: "d011",
    dealerName: "Horizon Motors",
    lenderId: "l001",
    lenderName: "Apex Motor Finance Ltd",
    sectionId: "s2",
    sectionName: "FCA Authorization",
    controlId: "s2c1",
    controlName: "FCA authorisation & permissions",
    currentResult: "Fail",
    currentScore: 28,
    requestType: "Fail Chase",
    reason: "Control failed — auto-chase triggered",
    reasonDetail: "FCA authorisation renewal is pending and has lapsed. Automatic chase raised to TCG to pursue the renewal status directly with the dealer and FCA Register.",
    priority: "Critical",
    requestedBy: "System (Auto)",
    requestedDate: "2026-02-27T09:00:00",
    status: "Submitted",
    tcgAssignedTo: null,
    tcgPickedUpDate: null,
    tcgCompletedDate: null,
    tcgOutcome: null,
    tcgNotes: null,
    slaDeadline: "2026-02-27T17:00:00",
    slaDays: 0.33,
    history: [
      { date: "2026-02-27T09:00:00", action: "Fail chase auto-triggered — CRITICAL: FCA lapsed", user: "System", platform: "Lender" },
    ],
  },
];
