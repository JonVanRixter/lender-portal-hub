import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Check, X, AlertTriangle, Save, ShieldAlert, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useToast } from "@/hooks/use-toast";
import type { PreScreenResult, PreScreeningData, OnboardingApplicationFull } from "@/types/onboarding";

type ToggleValue = string;

function ToggleGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? "" : opt)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
            value === opt
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-foreground border-border hover:bg-muted"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ResultToggle({ value, onChange, options }: { value: PreScreenResult; onChange: (v: PreScreenResult) => void; options: string[] }) {
  const colors: Record<string, string> = {
    Pass: "bg-rag-green/15 text-rag-green border-rag-green/30",
    Fail: "bg-destructive/15 text-destructive border-destructive/30",
    "Unable to Verify": "bg-rag-amber/15 text-rag-amber border-rag-amber/30",
    "Pending Review": "bg-rag-amber/15 text-rag-amber border-rag-amber/30",
    "Pending Further Review": "bg-rag-amber/15 text-rag-amber border-rag-amber/30",
    "Refer to TCG": "bg-secondary/15 text-secondary border-secondary/30",
  };
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? null : opt as PreScreenResult)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
            value === opt ? (colors[opt] || "bg-primary text-primary-foreground border-primary") : "bg-background text-foreground border-border hover:bg-muted"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

const RESULT_ICON: Record<string, React.ReactNode> = {
  Pass: <Check className="h-4 w-4 text-rag-green" />,
  Fail: <X className="h-4 w-4 text-destructive" />,
};

function resultLabel(r: PreScreenResult) {
  if (!r) return "";
  const icon = r === "Pass" ? "✅" : r === "Fail" ? "❌" : "⚠️";
  return `${icon} ${r}`;
}

/* ── Simulated Companies House API lookup ── */
function simulateCHLookup(app: OnboardingApplicationFull): OnboardingApplicationFull["preScreening"]["companiesHouse"] {
  // In MVP this would hit the real Companies House API.
  // For the POC we simulate a realistic response based on the application data.
  return {
    companyStatus: "Active",
    director1Name: app.primaryContactName || "Director on file",
    director2Name: "",
    pscDisclosed: "Yes",
    addressMatches: "Yes",
    notes: "",
    result: "Pass",
  };
}

function CompaniesHouseAutoCard({
  app,
  ch,
  update,
}: {
  app: OnboardingApplicationFull;
  ch: OnboardingApplicationFull["preScreening"]["companiesHouse"];
  update: (updater: (ps: PreScreeningData) => PreScreeningData) => void;
}) {
  const [status, setStatus] = useState<"idle" | "running" | "done">(ch.result ? "done" : "idle");

  const runCheck = useCallback(() => {
    setStatus("running");
    // Simulate API delay
    setTimeout(() => {
      const result = simulateCHLookup(app);
      update((ps) => ({ ...ps, companiesHouse: result }));
      setStatus("done");
    }, 1500);
  }, [app, update]);

  // Auto-run on first mount if not already done
  useEffect(() => {
    if (status === "idle" && !ch.result) {
      runCheck();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fields = [
    { label: "Company Status", value: ch.companyStatus },
    { label: "Director 1", value: ch.director1Name },
    { label: "Director 2", value: ch.director2Name || "—" },
    { label: "PSC Disclosed", value: ch.pscDisclosed || "—" },
    { label: "Address Matches", value: ch.addressMatches || "—" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            1. Companies House Verification
          </span>
          <span className="text-xs font-normal">{resultLabel(ch.result)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "running" && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-muted/50 border border-border">
            <RefreshCw className="h-4 w-4 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              Querying Companies House API for <strong>{app.companiesHouseNumber}</strong>…
            </p>
          </div>
        )}

        {status === "done" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {fields.map((f) => (
                <div key={f.label} className="space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{f.label}</p>
                  <p className="text-sm font-medium text-foreground">{f.value || "—"}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              {app.companiesHouseNumber && (
                <a
                  href={`https://find-and-update.company-information.service.gov.uk/company/${app.companiesHouseNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View on Companies House
                </a>
              )}
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={runCheck}>
                <RefreshCw className="h-3 w-3" /> Re-run Check
              </Button>
            </div>
          </>
        )}

        {status === "idle" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-sm text-muted-foreground">Automated check has not been run yet.</p>
            <Button size="sm" onClick={runCheck} className="gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Run Companies House Check
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Simulated FCA Register API lookup ── */
function simulateFCALookup(app: OnboardingApplicationFull): OnboardingApplicationFull["preScreening"]["fcaRegister"] {
  return {
    fcaRefNumber: app.preScreening.fcaRegister.fcaRefNumber || "FCA-" + (app.companiesHouseNumber || "000000").slice(0, 6),
    authorisationType: "Full Authorisation",
    consumerCredit: "Yes",
    insuranceDistribution: "No",
    authorisationStatus: "Current",
    tradingNameMatches: "Yes",
    notes: "",
    result: "Pass",
  };
}

function FCAAutoCard({
  app,
  fcaData,
  fcaBlocked,
  update,
}: {
  app: OnboardingApplicationFull;
  fcaData: OnboardingApplicationFull["preScreening"]["fcaRegister"];
  fcaBlocked: boolean;
  update: (updater: (ps: PreScreeningData) => PreScreeningData) => void;
}) {
  const [status, setStatus] = useState<"idle" | "running" | "done">(fcaData.result ? "done" : "idle");

  const runCheck = useCallback(() => {
    setStatus("running");
    setTimeout(() => {
      const result = simulateFCALookup(app);
      update((ps) => ({ ...ps, fcaRegister: result }));
      setStatus("done");
    }, 1800);
  }, [app, update]);

  useEffect(() => {
    if (status === "idle" && !fcaData.result) {
      runCheck();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fields = [
    { label: "FCA Reference", value: fcaData.fcaRefNumber },
    { label: "Authorisation Type", value: fcaData.authorisationType },
    { label: "Consumer Credit", value: fcaData.consumerCredit || "—" },
    { label: "Insurance Distribution", value: fcaData.insuranceDistribution || "—" },
    { label: "Authorisation Status", value: fcaData.authorisationStatus },
    { label: "Trading Name Match", value: fcaData.tradingNameMatches || "—" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            2. FCA Authorisation
          </span>
          <span className="text-xs font-normal">{resultLabel(fcaData.result)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "running" && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-muted/50 border border-border">
            <RefreshCw className="h-4 w-4 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              Querying FCA Register for <strong>{app.tradingName}</strong>…
            </p>
          </div>
        )}

        {status === "done" && (
          <>
            {fcaBlocked && (
              <div className="flex items-start gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-3">
                <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive font-medium">
                  🚫 A dealer without valid FCA authorisation cannot be onboarded. This application cannot proceed.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {fields.map((f) => (
                <div key={f.label} className="space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{f.label}</p>
                  <p className="text-sm font-medium text-foreground">{f.value || "—"}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <a href="https://register.fca.org.uk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> View on FCA Register
              </a>
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={runCheck}>
                <RefreshCw className="h-3 w-3" /> Re-run Check
              </Button>
            </div>
          </>
        )}

        {status === "idle" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-sm text-muted-foreground">Automated check has not been run yet.</p>
            <Button size="sm" onClick={runCheck} className="gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Run FCA Check
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PreScreeningPage() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { getApplication, updateApplicationDeep } = useOnboarding();
  const { toast } = useToast();

  // Auto-save debounce
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  const update = useCallback(
    (updater: (ps: PreScreeningData) => PreScreeningData) => {
      if (!appId) return;
      setSaveStatus("saving");
      updateApplicationDeep(appId, (a) => ({
        ...a,
        preScreening: updater(a.preScreening),
      }));
      setTimeout(() => setSaveStatus("saved"), 1000);
    },
    [appId, updateApplicationDeep]
  );

  const app = getApplication(appId || "");

  const ps = app?.preScreening;
  const fca = ps?.fcaRegister;
  const fcaBlocked = fca ? (["Lapsed", "Cancelled", "Not Found"].includes(fca.authorisationStatus) || fca.authorisationType === "Not Authorised") : false;

  // Force FCA result to Fail if blocked
  useEffect(() => {
    if (app && fcaBlocked && fca && fca.result !== "Fail") {
      update((ps) => ({ ...ps, fcaRegister: { ...ps.fcaRegister, result: "Fail" } }));
    }
  }, [app, fcaBlocked, fca, update]);

  if (!app) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h1 className="text-xl font-bold text-foreground">Application Not Found</h1>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/dealers?tab=onboarding")}>Back</Button>
      </div>
    );
  }

  const ch = app.preScreening.companiesHouse;
  const fcaData = app.preScreening.fcaRegister;
  const fin = app.preScreening.financialStanding;
  const aml = app.preScreening.sanctionsAml;
  const web = app.preScreening.websiteTrading;

  // Overall result
  const allResults = [ch.result, fcaData.result, fin.result, aml.result, web.result];
  const allComplete = allResults.every((r) => r !== null);
  const hasFail = allResults.includes("Fail");
  const hasRefer = allResults.includes("Refer to TCG");

  let overallLabel = "";
  let overallColor = "";
  if (allComplete) {
    if (fcaBlocked || hasFail) {
      overallLabel = fcaBlocked ? "CANNOT PROCEED — FCA AUTHORISATION REQUIRED" : "REVIEW REQUIRED BEFORE PROCEEDING";
      overallColor = "bg-destructive/10 border-destructive/30 text-destructive";
    } else if (hasRefer) {
      overallLabel = "PROCEED WITH CAUTION";
      overallColor = "bg-rag-amber/10 border-rag-amber/30 text-rag-amber";
    } else {
      overallLabel = "CLEAR TO PROCEED";
      overallColor = "bg-rag-green/10 border-rag-green/30 text-rag-green";
    }
  }

  const handleProceed = () => {
    updateApplicationDeep(appId!, (a) => ({ ...a, status: "checklist" }));
    toast({ title: "Pre-Screening Complete", description: "Proceeding to full onboarding checklist." });
    navigate(`/onboarding/${appId}/checklist`);
  };

  const handleSaveReturn = () => {
    toast({ title: "Saved", description: "Pre-screening progress saved." });
navigate("/dealers?tab=onboarding");
  };


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/dealers?tab=onboarding")}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Badge variant="outline" className="text-xs">
          {saveStatus === "saving" ? "💾 Saving..." : "✅ Saved"}
        </Badge>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Pre-Screening — {app.tradingName}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete these initial checks to decide whether to proceed with full onboarding. These checks are your responsibility as the lender.
        </p>
      </div>

      {/* Check 1 — Companies House (Automated) */}
      <CompaniesHouseAutoCard app={app} ch={ch} update={update} />

      {/* Check 2 — FCA (Automated) */}
      <FCAAutoCard app={app} fcaData={fcaData} fcaBlocked={fcaBlocked} update={update} />

      {/* Check 3 — Financial Standing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>3. Financial Standing (Initial)</span>
            <span className="text-xs font-normal">{resultLabel(fin.result)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Credit Check Source</Label>
              <Select value={fin.creditCheckSource} onValueChange={(v) => update((ps) => ({ ...ps, financialStanding: { ...ps.financialStanding, creditCheckSource: v as any } }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual Review">Manual Review</SelectItem>
                  <SelectItem value="Credit Agency">Credit Agency (placeholder)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Indicative Credit Score (0–100)</Label>
              <Input type="number" min={0} max={100} value={fin.creditScore ?? ""} onChange={(e) => update((ps) => ({ ...ps, financialStanding: { ...ps.financialStanding, creditScore: e.target.value ? Number(e.target.value) : null } }))} />
            </div>
            <div className="space-y-2">
              <Label>CCJs Present</Label>
              <ToggleGroup options={["Yes", "No", "Unknown"]} value={fin.ccjsPresent} onChange={(v) => update((ps) => ({ ...ps, financialStanding: { ...ps.financialStanding, ccjsPresent: v as any } }))} />
            </div>
            {fin.ccjsPresent === "Yes" && (
              <>
                <div className="space-y-2">
                  <Label>Number of CCJs</Label>
                  <Input type="number" value={fin.ccjCount ?? ""} onChange={(e) => update((ps) => ({ ...ps, financialStanding: { ...ps.financialStanding, ccjCount: e.target.value ? Number(e.target.value) : null } }))} />
                </div>
                <div className="space-y-2">
                  <Label>Total Value (£)</Label>
                  <Input type="number" value={fin.ccjTotalValue ?? ""} onChange={(e) => update((ps) => ({ ...ps, financialStanding: { ...ps.financialStanding, ccjTotalValue: e.target.value ? Number(e.target.value) : null } }))} />
                </div>
                <div className="space-y-2">
                  <Label>Date of Most Recent</Label>
                  <Input type="date" value={fin.ccjMostRecentDate} onChange={(e) => update((ps) => ({ ...ps, financialStanding: { ...ps.financialStanding, ccjMostRecentDate: e.target.value } }))} />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Accounts Filed on Time</Label>
              <ToggleGroup options={["Yes", "No", "Not Yet Due"]} value={fin.accountsFiledOnTime} onChange={(v) => update((ps) => ({ ...ps, financialStanding: { ...ps.financialStanding, accountsFiledOnTime: v as any } }))} />
            </div>
            <div className="space-y-2">
              <Label>Insolvency Notices</Label>
              <ToggleGroup options={["Yes", "No"]} value={fin.insolvencyNotices} onChange={(v) => update((ps) => ({ ...ps, financialStanding: { ...ps.financialStanding, insolvencyNotices: v as any } }))} />
            </div>
          </div>
          <div className="rounded-md bg-muted/50 border border-border p-3 text-xs text-muted-foreground font-mono">
            Score 70–100 = Low risk — proceed{"\n"}
            Score 50–69  = Medium risk — proceed with caution{"\n"}
            Score {"<"} 50   = High risk — consider declining
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={fin.notes} onChange={(e) => update((ps) => ({ ...ps, financialStanding: { ...ps.financialStanding, notes: e.target.value } }))} rows={2} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Result</Label>
            <ResultToggle value={fin.result} onChange={(v) => update((ps) => ({ ...ps, financialStanding: { ...ps.financialStanding, result: v } }))} options={["Pass", "Fail", "Pending Further Review"]} />
          </div>
        </CardContent>
      </Card>

      {/* Check 4 — Sanctions & AML */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>4. Sanctions & AML (Initial Screen)</span>
            <span className="text-xs font-normal">{resultLabel(aml.result)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sanctions Screen Completed</Label>
              <ToggleGroup options={["Yes", "No"]} value={aml.sanctionsCompleted} onChange={(v) => update((ps) => ({ ...ps, sanctionsAml: { ...ps.sanctionsAml, sanctionsCompleted: v as any } }))} />
            </div>
            <div className="space-y-2">
              <Label>Sanctions Result</Label>
              <ToggleGroup options={["Clear", "Possible Match", "Match Found"]} value={aml.sanctionsResult} onChange={(v) => update((ps) => ({ ...ps, sanctionsAml: { ...ps.sanctionsAml, sanctionsResult: v as any } }))} />
            </div>
            {aml.sanctionsResult === "Match Found" && (
              <div className="space-y-2 sm:col-span-2">
                <Label>Match Details (required)</Label>
                <Textarea value={aml.sanctionsDetails} onChange={(e) => update((ps) => ({ ...ps, sanctionsAml: { ...ps.sanctionsAml, sanctionsDetails: e.target.value } }))} rows={2} />
              </div>
            )}
            <div className="space-y-2">
              <Label>PEP Check Completed</Label>
              <ToggleGroup options={["Yes", "No"]} value={aml.pepCompleted} onChange={(v) => update((ps) => ({ ...ps, sanctionsAml: { ...ps.sanctionsAml, pepCompleted: v as any } }))} />
            </div>
            <div className="space-y-2">
              <Label>PEP Result</Label>
              <ToggleGroup options={["No PEPs", "PEP Identified"]} value={aml.pepResult} onChange={(v) => update((ps) => ({ ...ps, sanctionsAml: { ...ps.sanctionsAml, pepResult: v as any } }))} />
            </div>
            {aml.pepResult === "PEP Identified" && (
              <div className="space-y-2 sm:col-span-2">
                <Label>PEP Details (required)</Label>
                <Textarea value={aml.pepDetails} onChange={(e) => update((ps) => ({ ...ps, sanctionsAml: { ...ps.sanctionsAml, pepDetails: e.target.value } }))} rows={2} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Adverse Media Search Completed</Label>
              <ToggleGroup options={["Yes", "No"]} value={aml.adverseMediaCompleted} onChange={(v) => update((ps) => ({ ...ps, sanctionsAml: { ...ps.sanctionsAml, adverseMediaCompleted: v as any } }))} />
            </div>
            <div className="space-y-2">
              <Label>Adverse Media Found</Label>
              <ToggleGroup options={["None", "Minor", "Significant"]} value={aml.adverseMediaResult} onChange={(v) => update((ps) => ({ ...ps, sanctionsAml: { ...ps.sanctionsAml, adverseMediaResult: v as any } }))} />
            </div>
            {(aml.adverseMediaResult === "Minor" || aml.adverseMediaResult === "Significant") && (
              <div className="space-y-2 sm:col-span-2">
                <Label>Adverse Media Details (required)</Label>
                <Textarea value={aml.adverseMediaDetails} onChange={(e) => update((ps) => ({ ...ps, sanctionsAml: { ...ps.sanctionsAml, adverseMediaDetails: e.target.value } }))} rows={2} />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={aml.notes} onChange={(e) => update((ps) => ({ ...ps, sanctionsAml: { ...ps.sanctionsAml, notes: e.target.value } }))} rows={2} />
          </div>
          <p className="text-xs text-muted-foreground italic">
            Selecting 'Refer to TCG' will flag this check for The Compliance Guys to review. You can still continue with onboarding but this section will be marked for manual review.
          </p>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Result</Label>
            <ResultToggle value={aml.result} onChange={(v) => update((ps) => ({ ...ps, sanctionsAml: { ...ps.sanctionsAml, result: v } }))} options={["Pass", "Refer to TCG", "Fail"]} />
          </div>
        </CardContent>
      </Card>

      {/* Check 5 — Website & Trading */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>5. Website & Initial Trading Check</span>
            <span className="text-xs font-normal">{resultLabel(web.result)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Website Active</Label>
              <ToggleGroup options={["Yes", "No"]} value={web.websiteActive} onChange={(v) => update((ps) => ({ ...ps, websiteTrading: { ...ps.websiteTrading, websiteActive: v as any } }))} />
            </div>
            <div className="space-y-2">
              <Label>APR / Representative Example Visible</Label>
              <ToggleGroup options={["Yes", "No", "Not Applicable"]} value={web.aprVisible} onChange={(v) => update((ps) => ({ ...ps, websiteTrading: { ...ps.websiteTrading, aprVisible: v as any } }))} />
            </div>
            <div className="space-y-2">
              <Label>Risk Warnings Present</Label>
              <ToggleGroup options={["Yes", "No", "Not Applicable"]} value={web.riskWarnings} onChange={(v) => update((ps) => ({ ...ps, websiteTrading: { ...ps.websiteTrading, riskWarnings: v as any } }))} />
            </div>
            <div className="space-y-2">
              <Label>Website Consistent with Business Type</Label>
              <ToggleGroup options={["Yes", "No"]} value={web.websiteConsistent} onChange={(v) => update((ps) => ({ ...ps, websiteTrading: { ...ps.websiteTrading, websiteConsistent: v as any } }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={web.notes} onChange={(e) => update((ps) => ({ ...ps, websiteTrading: { ...ps.websiteTrading, notes: e.target.value } }))} rows={2} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Result</Label>
            <ResultToggle value={web.result} onChange={(v) => update((ps) => ({ ...ps, websiteTrading: { ...ps.websiteTrading, result: v } }))} options={["Pass", "Fail", "Pending Review"]} />
          </div>
        </CardContent>
      </Card>

      {/* Summary Panel */}
      {allComplete && (
        <Card className={`border-2 ${overallColor}`}>
          <CardContent className="py-5 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wide">Pre-Screening Summary — {app.tradingName}</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">{resultLabel(ch.result)} Companies House</div>
              <div className="flex items-center gap-2">{resultLabel(fcaData.result)} FCA Authorisation</div>
              <div className="flex items-center gap-2">{resultLabel(fin.result)} Financial Standing</div>
              <div className="flex items-center gap-2">{resultLabel(aml.result)} Sanctions & AML</div>
              <div className="flex items-center gap-2">{resultLabel(web.result)} Website Check</div>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="font-bold text-sm">{overallLabel}</p>
              {hasRefer && (
                <p className="text-xs text-muted-foreground mt-1">
                  Flagged items will appear in the TCG manual review queue automatically.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={handleSaveReturn}>
          <Save className="h-4 w-4 mr-2" /> Save & Return Later
        </Button>
        <Button
          onClick={handleProceed}
          disabled={!allComplete || fcaBlocked}
          title={fcaBlocked ? "Cannot proceed — FCA authorisation required" : ""}
        >
          Proceed to Full Onboarding
        </Button>
      </div>
    </div>
  );
}
