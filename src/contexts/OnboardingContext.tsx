import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { OnboardingApplicationFull, OnboardingAppStatus } from "@/types/onboarding";
import { createEmptyApplication, createEmptyPreScreening, createEmptyChecklist } from "@/types/onboarding";
import { toast } from "sonner";

const STORAGE_KEY = "dg_onboarding_apps";
const SEEDED_KEY = "dg_onboarding_seeded_v2";

/* ── Automatically determine the correct pipeline stage from data completeness ── */
function deriveStatus(app: OnboardingApplicationFull): OnboardingAppStatus {
  // Terminal statuses are never overridden
  if (app.status === "approved" || app.status === "rejected") return app.status;

  const ps = app.preScreening;
  const psResults = [ps.companiesHouse.result, ps.fcaRegister.result, ps.financialStanding.result, ps.sanctionsAml.result, ps.websiteTrading.result];
  const psAllDone = psResults.every((r) => r !== null);
  const psAllPass = psResults.every((r) => r === "Pass");

  const cl = app.checklist;
  const sections = [cl.section1, cl.section2, cl.section3, cl.section4, cl.section5, cl.section6, cl.section7, cl.section8];
  const clAllComplete = sections.every((s) => s.complete);

  // All checklist sections complete → pending-approval
  if (psAllPass && clAllComplete) return "pending-approval";

  // Pre-screening all passed → checklist
  if (psAllPass) return "checklist";

  // Any pre-screening work started → pre-screening
  if (psResults.some((r) => r !== null)) return "pre-screening";

  // Check if basic company info is filled in
  const hasBasicInfo = app.companyName && app.companiesHouseNumber;
  if (hasBasicInfo) return "pre-screening";

  return "draft";
}
const STAGE_LABELS: Record<OnboardingAppStatus, string> = {
  draft: "Draft",
  "pre-screening": "Pre-Screening",
  checklist: "Checklist",
  "pending-approval": "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

function notifyStageAdvance(companyName: string, from: OnboardingAppStatus, to: OnboardingAppStatus) {
  toast.success(`${companyName} advanced to ${STAGE_LABELS[to]}`, {
    description: `Moved from ${STAGE_LABELS[from]}`,
  });
}


function buildSeederApps(): OnboardingApplicationFull[] {
  const now = new Date().toISOString();
  const base = () => ({ ...createEmptyApplication(), id: crypto.randomUUID(), createdAt: now, updatedAt: now }) as OnboardingApplicationFull;

  // Draft
  const draft1: OnboardingApplicationFull = {
    ...base(),
    companyName: "Riverside Motor Group Ltd",
    companiesHouseNumber: "09812345",
    tradingName: "Riverside Motors",
    websiteUrl: "https://riversidemotors.co.uk",
    primaryContactName: "James Whitfield",
    primaryContactEmail: "james@riversidemotors.co.uk",
    primaryContactPhone: "07700 123456",
    address: { street: "14 Riverside Way", town: "Birmingham", county: "West Midlands", postcode: "B1 2HG" },
    status: "draft",
    createdAt: "2026-02-20T09:15:00.000Z",
    updatedAt: "2026-02-20T09:15:00.000Z",
  };

  // Pre-screening (partially done)
  const ps1: OnboardingApplicationFull = {
    ...base(),
    companyName: "Northern Star Autos Ltd",
    companiesHouseNumber: "11234567",
    tradingName: "Northern Star Cars",
    websiteUrl: "https://northernstarcars.co.uk",
    primaryContactName: "Sarah Henderson",
    primaryContactEmail: "sarah@northernstarcars.co.uk",
    primaryContactPhone: "07700 654321",
    address: { street: "8 Station Road", town: "Leeds", county: "West Yorkshire", postcode: "LS1 4AP" },
    status: "pre-screening",
    createdAt: "2026-02-18T14:22:00.000Z",
    updatedAt: "2026-02-22T10:05:00.000Z",
  };
  ps1.preScreening.companiesHouse = { ...ps1.preScreening.companiesHouse, companyStatus: "Active", director1Name: "Sarah Henderson", pscDisclosed: "Yes", addressMatches: "Yes", result: "Pass" };
  ps1.preScreening.fcaRegister = { ...ps1.preScreening.fcaRegister, fcaRefNumber: "789012", authorisationType: "Full Authorisation", consumerCredit: "Yes", insuranceDistribution: "No", authorisationStatus: "Current", tradingNameMatches: "Yes", result: "Pass" };
  ps1.preScreening.financialStanding = { ...ps1.preScreening.financialStanding, creditCheckSource: "Manual Review", creditScore: 72, ccjsPresent: "No", accountsFiledOnTime: "Yes", insolvencyNotices: "No", result: "Pass" };

  // Checklist (in progress — 3/8 done)
  const cl1: OnboardingApplicationFull = {
    ...base(),
    companyName: "Oakwood Vehicle Solutions Ltd",
    companiesHouseNumber: "10567890",
    tradingName: "Oakwood Cars",
    websiteUrl: "https://oakwoodcars.co.uk",
    primaryContactName: "David Chen",
    primaryContactEmail: "david@oakwoodcars.co.uk",
    primaryContactPhone: "07700 987654",
    address: { street: "22 Oak Lane", town: "Manchester", county: "Greater Manchester", postcode: "M1 3FJ" },
    status: "checklist",
    createdAt: "2026-02-10T11:00:00.000Z",
    updatedAt: "2026-02-23T16:30:00.000Z",
  };
  // All pre-screening passed
  cl1.preScreening.companiesHouse.result = "Pass";
  cl1.preScreening.fcaRegister.result = "Pass";
  cl1.preScreening.financialStanding.result = "Pass";
  cl1.preScreening.sanctionsAml.result = "Pass";
  cl1.preScreening.websiteTrading.result = "Pass";
  // 3 checklist sections complete
  cl1.checklist.section1 = { ...cl1.checklist.section1, companyActive: "Yes", companyType: "Limited Company", director1Name: "David Chen", result: "Pass", complete: true };
  cl1.checklist.section2 = { ...cl1.checklist.section2, fcaRefNumber: "654321", authorisationType: "Full Authorisation", consumerCredit: "Yes", result: "Pass", complete: true };
  cl1.checklist.section3 = { ...cl1.checklist.section3, creditSource: "Manual Review", creditScore: 78, creditRating: "Good", ccjsOnRecord: "No", result: "Pass", complete: true };

  // Pending approval
  const pa1: OnboardingApplicationFull = {
    ...base(),
    companyName: "Summit Motor Finance Ltd",
    companiesHouseNumber: "08765432",
    tradingName: "Summit Motors",
    websiteUrl: "https://summitmotors.co.uk",
    primaryContactName: "Rachel Morgan",
    primaryContactEmail: "rachel@summitmotors.co.uk",
    primaryContactPhone: "07700 111222",
    address: { street: "1 High Street", town: "Bristol", county: "Avon", postcode: "BS1 6QA" },
    status: "pending-approval",
    createdAt: "2026-02-05T08:45:00.000Z",
    updatedAt: "2026-02-24T09:00:00.000Z",
  };
  pa1.preScreening.companiesHouse.result = "Pass";
  pa1.preScreening.fcaRegister.result = "Pass";
  pa1.preScreening.financialStanding.result = "Pass";
  pa1.preScreening.sanctionsAml.result = "Pass";
  pa1.preScreening.websiteTrading.result = "Pass";
  Object.keys(pa1.checklist).forEach((k) => {
    (pa1.checklist as any)[k].result = "Pass";
    (pa1.checklist as any)[k].complete = true;
  });

  return [draft1, ps1, cl1, pa1];
}

function loadFromStorage(): OnboardingApplicationFull[] {
  try {
    // Seed once
    if (!localStorage.getItem(SEEDED_KEY)) {
      const seeds = buildSeederApps();
      const existing = localStorage.getItem(STORAGE_KEY);
      const current: OnboardingApplicationFull[] = existing ? JSON.parse(existing) : [];
      const merged = [...current, ...seeds];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      localStorage.setItem(SEEDED_KEY, "true");
      return merged;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(apps: OnboardingApplicationFull[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

interface OnboardingContextType {
  applications: OnboardingApplicationFull[];
  getApplication: (id: string) => OnboardingApplicationFull | undefined;
  createApplication: (data: Partial<OnboardingApplicationFull>) => OnboardingApplicationFull;
  updateApplication: (id: string, patch: Partial<OnboardingApplicationFull>) => void;
  updateApplicationDeep: (id: string, updater: (app: OnboardingApplicationFull) => OnboardingApplicationFull) => void;
  setApplicationStatus: (id: string, status: OnboardingAppStatus) => void;
}

const OnboardingCtx = createContext<OnboardingContextType | null>(null);

export function OnboardingWorkflowProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<OnboardingApplicationFull[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(applications);
  }, [applications]);

  const getApplication = useCallback(
    (id: string) => applications.find((a) => a.id === id),
    [applications]
  );

  const createApplication = useCallback((data: Partial<OnboardingApplicationFull>) => {
    const now = new Date().toISOString();
    const app: OnboardingApplicationFull = {
      ...createEmptyApplication(),
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as OnboardingApplicationFull;
    // Auto-derive the correct pipeline stage from data completeness
    app.status = deriveStatus(app);
    setApplications((prev) => [...prev, app]);
    return app;
  }, []);

  const updateApplication = useCallback((id: string, patch: Partial<OnboardingApplicationFull>) => {
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const oldStatus = a.status;
        const updated = { ...a, ...patch, updatedAt: new Date().toISOString() };
        updated.status = deriveStatus(updated);
        if (updated.status !== oldStatus && oldStatus !== "approved" && oldStatus !== "rejected") {
          notifyStageAdvance(updated.companyName || "Dealer", oldStatus, updated.status);
        }
        return updated;
      })
    );
  }, []);

  const updateApplicationDeep = useCallback(
    (id: string, updater: (app: OnboardingApplicationFull) => OnboardingApplicationFull) => {
      setApplications((prev) =>
        prev.map((a) => {
          if (a.id !== id) return a;
          const oldStatus = a.status;
          const updated = { ...updater(a), updatedAt: new Date().toISOString() };
          updated.status = deriveStatus(updated);
          if (updated.status !== oldStatus && oldStatus !== "approved" && oldStatus !== "rejected") {
            notifyStageAdvance(updated.companyName || "Dealer", oldStatus, updated.status);
          }
          return updated;
        })
      );
    },
    []
  );

  const setApplicationStatus = useCallback((id: string, status: OnboardingAppStatus) => {
    updateApplication(id, { status });
  }, [updateApplication]);

  return (
    <OnboardingCtx.Provider value={{ applications, getApplication, createApplication, updateApplication, updateApplicationDeep, setApplicationStatus }}>
      {children}
    </OnboardingCtx.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingCtx);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingWorkflowProvider");
  return ctx;
}
