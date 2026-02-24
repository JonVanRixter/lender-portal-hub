import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useToast } from "@/hooks/use-toast";
import type { ChecklistData, ChecklistSectionResult, DbsStaffRow, TrainingRow, OnboardingApplicationFull } from "@/types/onboarding";

/* ── Shared helpers ── */
function ToggleGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onChange(value === opt ? "" : opt)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${value === opt ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"}`}
        >{opt}</button>
      ))}
    </div>
  );
}

function ResultToggle({ value, onChange, options }: { value: ChecklistSectionResult; onChange: (v: ChecklistSectionResult) => void; options: string[] }) {
  const colors: Record<string, string> = {
    Pass: "bg-rag-green/15 text-rag-green border-rag-green/30",
    Fail: "bg-destructive/15 text-destructive border-destructive/30",
    Pending: "bg-rag-amber/15 text-rag-amber border-rag-amber/30",
    "Refer to TCG": "bg-secondary/15 text-secondary border-secondary/30",
  };
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onChange(value === opt ? null : opt as ChecklistSectionResult)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${value === opt ? (colors[opt] || "bg-primary text-primary-foreground border-primary") : "bg-background text-foreground border-border hover:bg-muted"}`}
        >{opt}</button>
      ))}
    </div>
  );
}

const SECTION_NAMES = [
  "Legal Status",
  "FCA Authorisation",
  "Financial Risk",
  "KYC & AML",
  "DBS Compliance",
  "Training & Competence",
  "Complaints Handling",
  "Website & Marketing",
];

function sectionStatus(sec: { result: ChecklistSectionResult; complete: boolean }): string {
  if (sec.complete) return sec.result === "Fail" ? "❌" : "✅";
  if (sec.result) return "🔵";
  return "⬜";
}
function getCreditRating(score: number | null): string {
  if (score === null) return "";
  if (score >= 81) return "Excellent";
  if (score >= 61) return "Good";
  if (score >= 41) return "Fair";
  if (score >= 21) return "Poor";
  return "Very Poor";
}

export default function ChecklistPage() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { getApplication, updateApplicationDeep } = useOnboarding();
  const { toast } = useToast();
  const app = getApplication(appId || "");

  const [openSection, setOpenSection] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  const update = useCallback(
    (updater: (cl: ChecklistData) => ChecklistData) => {
      if (!appId) return;
      setSaveStatus("saving");
      updateApplicationDeep(appId, (a) => ({ ...a, checklist: updater(a.checklist) }));
      setTimeout(() => setSaveStatus("saved"), 1000);
    }, [appId, updateApplicationDeep]
  );

  if (!app) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h1 className="text-xl font-bold text-foreground">Application Not Found</h1>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/dealers?tab=onboarding")}>Back</Button>
      </div>
    );
  }

  const cl = app.checklist;
  const sections = [cl.section1, cl.section2, cl.section3, cl.section4, cl.section5, cl.section6, cl.section7, cl.section8];
  const allComplete = sections.every((s) => s.complete);

  const markComplete = (sectionKey: string) => {
    update((cl) => ({ ...cl, [sectionKey]: { ...(cl as any)[sectionKey], complete: true } }));
  };

  const handleSubmit = () => {
    updateApplicationDeep(appId!, (a) => ({ ...a, status: "pending-approval" }));
    toast({ title: "Application Submitted", description: `${app.tradingName} submitted for approval.` });
    navigate("/dealers?tab=onboarding");
  };

  const handleSaveReturn = () => {
    toast({ title: "Saved", description: "Checklist progress saved." });
    navigate("/dealers?tab=onboarding");
  };

  const sectionNames = [
    "Legal Status", "FCA Authorisation", "Financial Risk", "KYC & AML",
    "DBS Compliance", "Training & Competence", "Complaints Handling", "Website & Marketing",
  ];

  const sectionKeys = ["section1","section2","section3","section4","section5","section6","section7","section8"] as const;
  const sectionStatuses = sectionKeys.map((k) => cl[k]);

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
        <h1 className="text-2xl font-bold text-foreground">Onboarding Checklist — {app.tradingName}</h1>
        <p className="text-sm text-muted-foreground mt-1">Ref: {app.id.slice(0, 8).toUpperCase()}</p>
      </div>

      {/* Progress stepper */}
      <div className="flex flex-wrap gap-2">
        {SECTION_NAMES.map((name, i) => (
          <button
            key={i}
            onClick={() => setOpenSection(i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              openSection === i ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-muted"
            }`}
          >
            <span>{sectionStatus(sections[i])}</span>
            <span className="hidden sm:inline">{name}</span>
            <span className="sm:hidden">{i + 1}</span>
          </button>
        ))}
      </div>

      {/* Info banner */}
      <div className="rounded-md bg-secondary/10 border border-secondary/30 p-3 text-sm text-foreground">
        ℹ️ Complete all 8 sections to build the dealer's onboarding application. The Compliance Guys will then run the formal compliance audit.
      </div>

      {/* Section 1 — Legal Status */}
      {openSection === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Legal Status</CardTitle>
            <p className="text-sm text-muted-foreground">Confirm the dealer's legal status and company registration details.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Active on Companies House</Label>
                <ToggleGroup options={["Yes", "No", "Unable to Confirm"]} value={cl.section1.companyActive} onChange={(v) => update((c) => ({ ...c, section1: { ...c.section1, companyActive: v as any } }))} />
              </div>
              <div className="space-y-2">
                <Label>Company Type</Label>
                <Select value={cl.section1.companyType} onValueChange={(v) => update((c) => ({ ...c, section1: { ...c.section1, companyType: v as any } }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["Limited Company", "LLP", "Sole Trader", "Partnership"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Directors */}
            <div className="border-t border-border pt-3 space-y-3">
              <h4 className="text-sm font-semibold">Directors</h4>
              {[1, 2, 3].map((n) => {
                const nameKey = `director${n}Name` as keyof typeof cl.section1;
                const dobKey = `director${n}Dob` as keyof typeof cl.section1;
                const natKey = `director${n}Nationality` as keyof typeof cl.section1;
                return (
                  <div key={n} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Director {n} Name{n > 1 && " (optional)"}</Label>
                      <Input value={(cl.section1[nameKey] as string) || ""} onChange={(e) => update((c) => ({ ...c, section1: { ...c.section1, [nameKey]: e.target.value } }))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Date of Birth</Label>
                      <Input type="date" value={(cl.section1[dobKey] as string) || ""} onChange={(e) => update((c) => ({ ...c, section1: { ...c.section1, [dobKey]: e.target.value } }))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Nationality</Label>
                      <Input value={(cl.section1[natKey] as string) || ""} onChange={(e) => update((c) => ({ ...c, section1: { ...c.section1, [natKey]: e.target.value } }))} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>PSC(s) Disclosed</Label>
                <ToggleGroup options={["Yes", "No"]} value={cl.section1.pscDisclosed} onChange={(v) => update((c) => ({ ...c, section1: { ...c.section1, pscDisclosed: v as any } }))} />
              </div>
              {cl.section1.pscDisclosed === "Yes" && (
                <>
                  <div className="space-y-2">
                    <Label>PSC Name</Label>
                    <Input value={cl.section1.pscName} onChange={(e) => update((c) => ({ ...c, section1: { ...c.section1, pscName: e.target.value } }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>% Ownership</Label>
                    <Input value={cl.section1.pscOwnership} onChange={(e) => update((c) => ({ ...c, section1: { ...c.section1, pscOwnership: e.target.value } }))} />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>Registered Address Confirmed</Label>
                <ToggleGroup options={["Yes", "No"]} value={cl.section1.addressConfirmed} onChange={(v) => update((c) => ({ ...c, section1: { ...c.section1, addressConfirmed: v as any } }))} />
              </div>
              <div className="space-y-2">
                <Label>Address Changed in Last 12 Months</Label>
                <ToggleGroup options={["Yes", "No"]} value={cl.section1.addressChanged12Months} onChange={(v) => update((c) => ({ ...c, section1: { ...c.section1, addressChanged12Months: v as any } }))} />
              </div>
              <div className="space-y-2">
                <Label>Company Age (Years Trading)</Label>
                <Input type="number" value={cl.section1.companyAge ?? ""} onChange={(e) => update((c) => ({ ...c, section1: { ...c.section1, companyAge: e.target.value ? Number(e.target.value) : null } }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={cl.section1.notes} onChange={(e) => update((c) => ({ ...c, section1: { ...c.section1, notes: e.target.value } }))} rows={3} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Section Result</Label>
              <ResultToggle value={cl.section1.result} onChange={(v) => update((c) => ({ ...c, section1: { ...c.section1, result: v } }))} options={["Pass", "Fail", "Pending"]} />
            </div>
            <Button size="sm" disabled={!cl.section1.result} onClick={() => { markComplete("section1"); setOpenSection(1); }}>
              <Check className="h-4 w-4 mr-1" /> Mark Complete
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 2 — FCA Authorisation */}
      {openSection === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. FCA Authorisation</CardTitle>
            <p className="text-sm text-muted-foreground">Confirm the dealer's FCA authorisation status and permissions.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>FCA Reference Number</Label>
                <Input value={cl.section2.fcaRefNumber} onChange={(e) => update((c) => ({ ...c, section2: { ...c.section2, fcaRefNumber: e.target.value } }))} />
              </div>
              <div className="space-y-2">
                <Label>Authorisation Type</Label>
                <Select value={cl.section2.authorisationType} onValueChange={(v) => update((c) => ({ ...c, section2: { ...c.section2, authorisationType: v as any } }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["Full Authorisation", "Appointed Representative", "Other"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {cl.section2.authorisationType === "Appointed Representative" && (
                <div className="space-y-2">
                  <Label>Name of Principal</Label>
                  <Input value={cl.section2.principalName} onChange={(e) => update((c) => ({ ...c, section2: { ...c.section2, principalName: e.target.value } }))} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Consumer Credit Confirmed</Label>
                <ToggleGroup options={["Yes", "No"]} value={cl.section2.consumerCredit} onChange={(v) => update((c) => ({ ...c, section2: { ...c.section2, consumerCredit: v as any } }))} />
              </div>
              <div className="space-y-2">
                <Label>Insurance Distribution</Label>
                <ToggleGroup options={["Yes", "No"]} value={cl.section2.insuranceDistribution} onChange={(v) => update((c) => ({ ...c, section2: { ...c.section2, insuranceDistribution: v as any } }))} />
              </div>
              <div className="space-y-2">
                <Label>Authorisation Expiry Date</Label>
                <Input type="date" value={cl.section2.expiryDate} onChange={(e) => update((c) => ({ ...c, section2: { ...c.section2, expiryDate: e.target.value } }))} />
              </div>
              <div className="space-y-2">
                <Label>Conditions on Authorisation</Label>
                <ToggleGroup options={["Yes", "No"]} value={cl.section2.conditions} onChange={(v) => update((c) => ({ ...c, section2: { ...c.section2, conditions: v as any } }))} />
              </div>
              {cl.section2.conditions === "Yes" && (
                <div className="space-y-2 sm:col-span-2">
                  <Label>Condition Details</Label>
                  <Textarea value={cl.section2.conditionDetails} onChange={(e) => update((c) => ({ ...c, section2: { ...c.section2, conditionDetails: e.target.value } }))} rows={2} />
                </div>
              )}
              <div className="space-y-2">
                <Label>FCA Register Screenshot Taken</Label>
                <ToggleGroup options={["Yes", "No"]} value={cl.section2.screenshotTaken} onChange={(v) => update((c) => ({ ...c, section2: { ...c.section2, screenshotTaken: v as any } }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={cl.section2.notes} onChange={(e) => update((c) => ({ ...c, section2: { ...c.section2, notes: e.target.value } }))} rows={2} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Section Result</Label>
              <ResultToggle value={cl.section2.result} onChange={(v) => update((c) => ({ ...c, section2: { ...c.section2, result: v } }))} options={["Pass", "Fail", "Pending"]} />
            </div>
            <Button size="sm" disabled={!cl.section2.result} onClick={() => { markComplete("section2"); setOpenSection(2); }}>
              <Check className="h-4 w-4 mr-1" /> Mark Complete
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 3 — Financial Risk */}
      {openSection === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">3. Financial Risk</CardTitle>
            <p className="text-sm text-muted-foreground">Assess the dealer's financial stability and credit position.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Credit Score Source</Label>
                <Select value={cl.section3.creditSource} onValueChange={(v) => update((c) => ({ ...c, section3: { ...c.section3, creditSource: v as any } }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual Review">Manual Review</SelectItem>
                    <SelectItem value="CreditSafe">CreditSafe (POC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Credit Score (0–100)</Label>
                <Input type="number" min={0} max={100} value={cl.section3.creditScore ?? ""} onChange={(e) => {
                  const score = e.target.value ? Number(e.target.value) : null;
                  update((c) => ({ ...c, section3: { ...c.section3, creditScore: score, creditRating: getCreditRating(score) } }));
                }} />
              </div>
              {cl.section3.creditScore !== null && (
                <div className="space-y-2">
                  <Label>Credit Rating (auto)</Label>
                  <Input disabled value={getCreditRating(cl.section3.creditScore)} />
                </div>
              )}
              <div className="space-y-2">
                <Label>CCJs on Record</Label>
                <ToggleGroup options={["Yes", "No"]} value={cl.section3.ccjsOnRecord} onChange={(v) => update((c) => ({ ...c, section3: { ...c.section3, ccjsOnRecord: v as any } }))} />
              </div>
              {cl.section3.ccjsOnRecord === "Yes" && (
                <>
                  <div className="space-y-2"><Label>Number</Label><Input type="number" value={cl.section3.ccjCount ?? ""} onChange={(e) => update((c) => ({ ...c, section3: { ...c.section3, ccjCount: e.target.value ? Number(e.target.value) : null } }))} /></div>
                  <div className="space-y-2"><Label>Total Value (£)</Label><Input type="number" value={cl.section3.ccjTotalValue ?? ""} onChange={(e) => update((c) => ({ ...c, section3: { ...c.section3, ccjTotalValue: e.target.value ? Number(e.target.value) : null } }))} /></div>
                  <div className="space-y-2"><Label>Most Recent</Label><Input type="date" value={cl.section3.ccjMostRecent} onChange={(e) => update((c) => ({ ...c, section3: { ...c.section3, ccjMostRecent: e.target.value } }))} /></div>
                  <div className="space-y-2"><Label>Under Appeal</Label><ToggleGroup options={["Yes", "No"]} value={cl.section3.ccjUnderAppeal} onChange={(v) => update((c) => ({ ...c, section3: { ...c.section3, ccjUnderAppeal: v as any } }))} /></div>
                </>
              )}
              <div className="space-y-2"><Label>Winding-up Petition</Label><ToggleGroup options={["Yes", "No"]} value={cl.section3.windingUpPetition} onChange={(v) => update((c) => ({ ...c, section3: { ...c.section3, windingUpPetition: v as any } }))} /></div>
              <div className="space-y-2"><Label>Insolvency History</Label><ToggleGroup options={["Yes", "No"]} value={cl.section3.insolvencyHistory} onChange={(v) => update((c) => ({ ...c, section3: { ...c.section3, insolvencyHistory: v as any } }))} /></div>
              {cl.section3.insolvencyHistory === "Yes" && (
                <div className="space-y-2 sm:col-span-2"><Label>Details</Label><Textarea value={cl.section3.insolvencyDetails} onChange={(e) => update((c) => ({ ...c, section3: { ...c.section3, insolvencyDetails: e.target.value } }))} rows={2} /></div>
              )}
              <div className="space-y-2"><Label>Latest Accounts Filed</Label><ToggleGroup options={["Yes", "No", "Not yet due"]} value={cl.section3.latestAccountsFiled} onChange={(v) => update((c) => ({ ...c, section3: { ...c.section3, latestAccountsFiled: v as any } }))} /></div>
              <div className="space-y-2"><Label>Filing Date</Label><Input type="date" value={cl.section3.accountsFilingDate} onChange={(e) => update((c) => ({ ...c, section3: { ...c.section3, accountsFilingDate: e.target.value } }))} /></div>
              <div className="space-y-2"><Label>Accounts Overdue</Label><ToggleGroup options={["Yes", "No"]} value={cl.section3.accountsOverdue} onChange={(v) => update((c) => ({ ...c, section3: { ...c.section3, accountsOverdue: v as any } }))} /></div>
              <div className="space-y-2"><Label>Turnover (£)</Label><Input type="number" value={cl.section3.turnover ?? ""} onChange={(e) => update((c) => ({ ...c, section3: { ...c.section3, turnover: e.target.value ? Number(e.target.value) : null } }))} /></div>
              <div className="space-y-2"><Label>Net Profit/Loss (£)</Label><Input type="number" value={cl.section3.netProfitLoss ?? ""} onChange={(e) => update((c) => ({ ...c, section3: { ...c.section3, netProfitLoss: e.target.value ? Number(e.target.value) : null } }))} /></div>
              <div className="space-y-2"><Label>Years of Accounts</Label><Input type="number" value={cl.section3.yearsOfAccounts ?? ""} onChange={(e) => update((c) => ({ ...c, section3: { ...c.section3, yearsOfAccounts: e.target.value ? Number(e.target.value) : null } }))} /></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={cl.section3.notes} onChange={(e) => update((c) => ({ ...c, section3: { ...c.section3, notes: e.target.value } }))} rows={3} /></div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Section Result</Label>
              <ResultToggle value={cl.section3.result} onChange={(v) => update((c) => ({ ...c, section3: { ...c.section3, result: v } }))} options={["Pass", "Fail", "Pending"]} />
            </div>
            <Button size="sm" disabled={!cl.section3.result} onClick={() => { markComplete("section3"); setOpenSection(3); }}>
              <Check className="h-4 w-4 mr-1" /> Mark Complete
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 4 — KYC & AML */}
      {openSection === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">4. KYC & AML</CardTitle>
            <p className="text-sm text-muted-foreground">Complete KYC and AML checks for the dealer and its directors.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Sanctions Screening Completed</Label><ToggleGroup options={["Yes", "No"]} value={cl.section4.sanctionsCompleted} onChange={(v) => update((c) => ({ ...c, section4: { ...c.section4, sanctionsCompleted: v as any } }))} /></div>
              <div className="space-y-2"><Label>Sanctions Result</Label><ToggleGroup options={["Clear", "Possible Match", "Match Found"]} value={cl.section4.sanctionsResult} onChange={(v) => update((c) => ({ ...c, section4: { ...c.section4, sanctionsResult: v as any } }))} /></div>
              {cl.section4.sanctionsResult !== "Clear" && cl.section4.sanctionsResult && (
                <div className="space-y-2 sm:col-span-2"><Label>Details</Label><Textarea value={cl.section4.sanctionsDetails} onChange={(e) => update((c) => ({ ...c, section4: { ...c.section4, sanctionsDetails: e.target.value } }))} rows={2} /></div>
              )}
              <div className="space-y-2"><Label>PEP Check Completed</Label><ToggleGroup options={["Yes", "No"]} value={cl.section4.pepCompleted} onChange={(v) => update((c) => ({ ...c, section4: { ...c.section4, pepCompleted: v as any } }))} /></div>
              <div className="space-y-2"><Label>PEP Result</Label><ToggleGroup options={["No PEPs", "PEP Identified"]} value={cl.section4.pepResult} onChange={(v) => update((c) => ({ ...c, section4: { ...c.section4, pepResult: v as any } }))} /></div>
              {cl.section4.pepResult === "PEP Identified" && (
                <>
                  <div className="space-y-2"><Label>PEP Name</Label><Input value={cl.section4.pepName} onChange={(e) => update((c) => ({ ...c, section4: { ...c.section4, pepName: e.target.value } }))} /></div>
                  <div className="space-y-2"><Label>Nature of PEP Status</Label><Input value={cl.section4.pepNature} onChange={(e) => update((c) => ({ ...c, section4: { ...c.section4, pepNature: e.target.value } }))} /></div>
                  <div className="space-y-2 sm:col-span-2"><Label>Risk Assessment Notes</Label><Textarea value={cl.section4.pepRiskNotes} onChange={(e) => update((c) => ({ ...c, section4: { ...c.section4, pepRiskNotes: e.target.value } }))} rows={2} /></div>
                </>
              )}
              <div className="space-y-2"><Label>Adverse Media Completed</Label><ToggleGroup options={["Yes", "No"]} value={cl.section4.adverseMediaCompleted} onChange={(v) => update((c) => ({ ...c, section4: { ...c.section4, adverseMediaCompleted: v as any } }))} /></div>
              <div className="space-y-2"><Label>Adverse Media Result</Label><ToggleGroup options={["None", "Minor Historical", "Ongoing", "Significant"]} value={cl.section4.adverseMediaResult} onChange={(v) => update((c) => ({ ...c, section4: { ...c.section4, adverseMediaResult: v as any } }))} /></div>
              {cl.section4.adverseMediaResult && cl.section4.adverseMediaResult !== "None" && (
                <div className="space-y-2 sm:col-span-2"><Label>Details</Label><Textarea value={cl.section4.adverseMediaDetails} onChange={(e) => update((c) => ({ ...c, section4: { ...c.section4, adverseMediaDetails: e.target.value } }))} rows={2} /></div>
              )}
              <div className="space-y-2"><Label>Source of Funds Documented</Label><ToggleGroup options={["Yes", "No", "Not Applicable"]} value={cl.section4.sourceOfFunds} onChange={(v) => update((c) => ({ ...c, section4: { ...c.section4, sourceOfFunds: v as any } }))} /></div>
              <div className="space-y-2"><Label>CDD Level</Label><ToggleGroup options={["Standard", "Enhanced", "Simplified"]} value={cl.section4.cddLevel} onChange={(v) => update((c) => ({ ...c, section4: { ...c.section4, cddLevel: v as any } }))} /></div>
              {cl.section4.cddLevel === "Enhanced" && (
                <div className="space-y-2"><Label>Enhanced CDD Completed</Label><ToggleGroup options={["Yes", "No", "N/A"]} value={cl.section4.enhancedCddCompleted} onChange={(v) => update((c) => ({ ...c, section4: { ...c.section4, enhancedCddCompleted: v as any } }))} /></div>
              )}
            </div>
            <p className="text-xs text-muted-foreground italic">Enhanced CDD required if PEP identified, sanctions match, or high-risk indicators present.</p>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={cl.section4.notes} onChange={(e) => update((c) => ({ ...c, section4: { ...c.section4, notes: e.target.value } }))} rows={3} /></div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Section Result</Label>
              <ResultToggle value={cl.section4.result} onChange={(v) => update((c) => ({ ...c, section4: { ...c.section4, result: v } }))} options={["Pass", "Fail", "Refer to TCG", "Pending"]} />
            </div>
            <Button size="sm" disabled={!cl.section4.result} onClick={() => { markComplete("section4"); setOpenSection(4); }}>
              <Check className="h-4 w-4 mr-1" /> Mark Complete
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 5 — DBS Compliance */}
      {openSection === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">5. DBS Compliance</CardTitle>
            <p className="text-sm text-muted-foreground">Confirm DBS certificates are in place for all relevant staff.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* DBS Staff Table */}
            <div className="overflow-auto">
              <table className="w-full text-sm border border-border rounded-md">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 text-left font-medium text-muted-foreground">Staff Name</th>
                    <th className="p-2 text-left font-medium text-muted-foreground">Role</th>
                    <th className="p-2 text-left font-medium text-muted-foreground">DBS Level</th>
                    <th className="p-2 text-left font-medium text-muted-foreground">Cert. Date</th>
                    <th className="p-2 text-left font-medium text-muted-foreground">Expiry</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {cl.section5.staffRows.map((row, i) => (
                    <tr key={row.id} className="border-t border-border">
                      <td className="p-1"><Input className="h-8 text-xs" value={row.staffName} onChange={(e) => {
                        const rows = [...cl.section5.staffRows]; rows[i] = { ...rows[i], staffName: e.target.value };
                        update((c) => ({ ...c, section5: { ...c.section5, staffRows: rows } }));
                      }} /></td>
                      <td className="p-1"><Input className="h-8 text-xs" value={row.role} onChange={(e) => {
                        const rows = [...cl.section5.staffRows]; rows[i] = { ...rows[i], role: e.target.value };
                        update((c) => ({ ...c, section5: { ...c.section5, staffRows: rows } }));
                      }} /></td>
                      <td className="p-1">
                        <Select value={row.dbsLevel} onValueChange={(v) => {
                          const rows = [...cl.section5.staffRows]; rows[i] = { ...rows[i], dbsLevel: v as any };
                          update((c) => ({ ...c, section5: { ...c.section5, staffRows: rows } }));
                        }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Basic", "Standard", "Enhanced"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-1"><Input type="date" className="h-8 text-xs" value={row.certificateDate} onChange={(e) => {
                        const rows = [...cl.section5.staffRows]; rows[i] = { ...rows[i], certificateDate: e.target.value };
                        update((c) => ({ ...c, section5: { ...c.section5, staffRows: rows } }));
                      }} /></td>
                      <td className="p-1"><Input type="date" className="h-8 text-xs" value={row.expiryDate} onChange={(e) => {
                        const rows = [...cl.section5.staffRows]; rows[i] = { ...rows[i], expiryDate: e.target.value };
                        update((c) => ({ ...c, section5: { ...c.section5, staffRows: rows } }));
                      }} /></td>
                      <td className="p-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                          const rows = cl.section5.staffRows.filter((_, j) => j !== i);
                          update((c) => ({ ...c, section5: { ...c.section5, staffRows: rows } }));
                        }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              const newRow: DbsStaffRow = { id: crypto.randomUUID(), staffName: "", role: "", dbsLevel: "", certificateDate: "", expiryDate: "" };
              update((c) => ({ ...c, section5: { ...c.section5, staffRows: [...c.section5.staffRows, newRow] } }));
            }}>
              <Plus className="h-4 w-4 mr-1" /> Add Staff Member
            </Button>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>All Staff Have DBS</Label><ToggleGroup options={["Yes", "No", "Partial"]} value={cl.section5.allStaffHaveDbs} onChange={(v) => update((c) => ({ ...c, section5: { ...c.section5, allStaffHaveDbs: v as any } }))} /></div>
              <div className="space-y-2"><Label>Any Expired</Label><ToggleGroup options={["Yes", "No"]} value={cl.section5.anyExpired} onChange={(v) => update((c) => ({ ...c, section5: { ...c.section5, anyExpired: v as any } }))} /></div>
              <div className="space-y-2"><Label>Renewal Process</Label><ToggleGroup options={["Yes", "No", "N/A"]} value={cl.section5.renewalProcess} onChange={(v) => update((c) => ({ ...c, section5: { ...c.section5, renewalProcess: v as any } }))} /></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={cl.section5.notes} onChange={(e) => update((c) => ({ ...c, section5: { ...c.section5, notes: e.target.value } }))} rows={2} /></div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Section Result</Label>
              <ResultToggle value={cl.section5.result} onChange={(v) => update((c) => ({ ...c, section5: { ...c.section5, result: v } }))} options={["Pass", "Fail", "Pending"]} />
            </div>
            <Button size="sm" disabled={!cl.section5.result} onClick={() => { markComplete("section5"); setOpenSection(5); }}>
              <Check className="h-4 w-4 mr-1" /> Mark Complete
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 6 — Training & Competence */}
      {openSection === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">6. Training & Competence</CardTitle>
            <p className="text-sm text-muted-foreground">Confirm training and competency records for all F&I staff.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-auto">
              <table className="w-full text-sm border border-border rounded-md">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="p-2 text-left font-medium text-muted-foreground">Staff Name</th>
                    <th className="p-2 text-left font-medium text-muted-foreground">Role</th>
                    <th className="p-2 text-left font-medium text-muted-foreground">Qualification</th>
                    <th className="p-2 text-left font-medium text-muted-foreground">Provider</th>
                    <th className="p-2 text-left font-medium text-muted-foreground">Completed</th>
                    <th className="p-2 text-left font-medium text-muted-foreground">Expiry</th>
                    <th className="p-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {cl.section6.trainingRows.map((row, i) => (
                    <tr key={row.id} className="border-t border-border">
                      <td className="p-1"><Input className="h-8 text-xs" value={row.staffName} onChange={(e) => {
                        const rows = [...cl.section6.trainingRows]; rows[i] = { ...rows[i], staffName: e.target.value };
                        update((c) => ({ ...c, section6: { ...c.section6, trainingRows: rows } }));
                      }} /></td>
                      <td className="p-1">
                        <Select value={row.role} onValueChange={(v) => {
                          const rows = [...cl.section6.trainingRows]; rows[i] = { ...rows[i], role: v as any };
                          update((c) => ({ ...c, section6: { ...c.section6, trainingRows: rows } }));
                        }}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["F&I Manager", "Dealer Principal", "Sales Executive", "Other"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-1"><Input className="h-8 text-xs" value={row.qualification} onChange={(e) => {
                        const rows = [...cl.section6.trainingRows]; rows[i] = { ...rows[i], qualification: e.target.value };
                        update((c) => ({ ...c, section6: { ...c.section6, trainingRows: rows } }));
                      }} /></td>
                      <td className="p-1"><Input className="h-8 text-xs" value={row.provider} onChange={(e) => {
                        const rows = [...cl.section6.trainingRows]; rows[i] = { ...rows[i], provider: e.target.value };
                        update((c) => ({ ...c, section6: { ...c.section6, trainingRows: rows } }));
                      }} /></td>
                      <td className="p-1"><Input type="date" className="h-8 text-xs" value={row.completionDate} onChange={(e) => {
                        const rows = [...cl.section6.trainingRows]; rows[i] = { ...rows[i], completionDate: e.target.value };
                        update((c) => ({ ...c, section6: { ...c.section6, trainingRows: rows } }));
                      }} /></td>
                      <td className="p-1"><Input type="date" className="h-8 text-xs" value={row.expiryDate} onChange={(e) => {
                        const rows = [...cl.section6.trainingRows]; rows[i] = { ...rows[i], expiryDate: e.target.value };
                        update((c) => ({ ...c, section6: { ...c.section6, trainingRows: rows } }));
                      }} /></td>
                      <td className="p-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                          const rows = cl.section6.trainingRows.filter((_, j) => j !== i);
                          update((c) => ({ ...c, section6: { ...c.section6, trainingRows: rows } }));
                        }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              const newRow: TrainingRow = { id: crypto.randomUUID(), staffName: "", role: "", qualification: "", provider: "", completionDate: "", expiryDate: "" };
              update((c) => ({ ...c, section6: { ...c.section6, trainingRows: [...c.section6.trainingRows, newRow] } }));
            }}>
              <Plus className="h-4 w-4 mr-1" /> Add Record
            </Button>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>All Staff Qualified</Label><ToggleGroup options={["Yes", "No", "Partial"]} value={cl.section6.allStaffQualified} onChange={(v) => update((c) => ({ ...c, section6: { ...c.section6, allStaffQualified: v as any } }))} /></div>
              <div className="space-y-2"><Label>CPD Maintained</Label><ToggleGroup options={["Yes", "No"]} value={cl.section6.cpdMaintained} onChange={(v) => update((c) => ({ ...c, section6: { ...c.section6, cpdMaintained: v as any } }))} /></div>
              <div className="space-y-2"><Label>Training Reviewed (12 months)</Label><ToggleGroup options={["Yes", "No"]} value={cl.section6.trainingReviewed} onChange={(v) => update((c) => ({ ...c, section6: { ...c.section6, trainingReviewed: v as any } }))} /></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={cl.section6.notes} onChange={(e) => update((c) => ({ ...c, section6: { ...c.section6, notes: e.target.value } }))} rows={2} /></div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Section Result</Label>
              <ResultToggle value={cl.section6.result} onChange={(v) => update((c) => ({ ...c, section6: { ...c.section6, result: v } }))} options={["Pass", "Fail", "Pending"]} />
            </div>
            <Button size="sm" disabled={!cl.section6.result} onClick={() => { markComplete("section6"); setOpenSection(6); }}>
              <Check className="h-4 w-4 mr-1" /> Mark Complete
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 7 — Complaints Handling */}
      {openSection === 6 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">7. Complaints Handling</CardTitle>
            <p className="text-sm text-muted-foreground">Confirm adequate complaints handling procedures and a clean complaints record.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Written Complaints Procedure</Label><ToggleGroup options={["Yes", "No"]} value={cl.section7.writtenProcedure} onChange={(v) => update((c) => ({ ...c, section7: { ...c.section7, writtenProcedure: v as any } }))} /></div>
              <div className="space-y-2"><Label>Complaints Log Maintained</Label><ToggleGroup options={["Yes", "No"]} value={cl.section7.complaintsLogMaintained} onChange={(v) => update((c) => ({ ...c, section7: { ...c.section7, complaintsLogMaintained: v as any } }))} /></div>
              <div className="space-y-2"><Label>Complaints (Last 12 Months)</Label><Input type="number" value={cl.section7.complaintsCount12Months ?? ""} onChange={(e) => update((c) => ({ ...c, section7: { ...c.section7, complaintsCount12Months: e.target.value ? Number(e.target.value) : null } }))} /></div>
              <div className="space-y-2"><Label>Resolved Within 8 Weeks</Label><Input type="number" value={cl.section7.resolvedWithin8Weeks ?? ""} onChange={(e) => update((c) => ({ ...c, section7: { ...c.section7, resolvedWithin8Weeks: e.target.value ? Number(e.target.value) : null } }))} /></div>
              <div className="space-y-2"><Label>FOS Referrals</Label><Input type="number" value={cl.section7.fosReferrals ?? ""} onChange={(e) => update((c) => ({ ...c, section7: { ...c.section7, fosReferrals: e.target.value ? Number(e.target.value) : null } }))} /></div>
              <div className="space-y-2"><Label>FOS Upheld</Label><Input type="number" value={cl.section7.fosUpheld ?? ""} onChange={(e) => update((c) => ({ ...c, section7: { ...c.section7, fosUpheld: e.target.value ? Number(e.target.value) : null } }))} /></div>
              <div className="space-y-2"><Label>Systemic Patterns Identified</Label><ToggleGroup options={["Yes", "No"]} value={cl.section7.systemicPatterns} onChange={(v) => update((c) => ({ ...c, section7: { ...c.section7, systemicPatterns: v as any } }))} /></div>
              {cl.section7.systemicPatterns === "Yes" && (
                <div className="space-y-2"><Label>Details</Label><Textarea value={cl.section7.systemicDetails} onChange={(e) => update((c) => ({ ...c, section7: { ...c.section7, systemicDetails: e.target.value } }))} rows={2} /></div>
              )}
              <div className="space-y-2"><Label>Customer-Facing Process Published</Label><ToggleGroup options={["Yes", "No"]} value={cl.section7.customerFacingPublished} onChange={(v) => update((c) => ({ ...c, section7: { ...c.section7, customerFacingPublished: v as any } }))} /></div>
            </div>
            <div className="rounded-md bg-muted/50 border border-border p-3 text-xs text-muted-foreground font-mono whitespace-pre-line">
{`0 complaints → low risk
1–3 complaints, all resolved on time → acceptable
Any FOS referrals (upheld) → flag for review
Systemic patterns identified → fail`}
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={cl.section7.notes} onChange={(e) => update((c) => ({ ...c, section7: { ...c.section7, notes: e.target.value } }))} rows={3} /></div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Section Result</Label>
              <ResultToggle value={cl.section7.result} onChange={(v) => update((c) => ({ ...c, section7: { ...c.section7, result: v } }))} options={["Pass", "Fail", "Pending", "Refer to TCG"]} />
            </div>
            <Button size="sm" disabled={!cl.section7.result} onClick={() => { markComplete("section7"); setOpenSection(7); }}>
              <Check className="h-4 w-4 mr-1" /> Mark Complete
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 8 — Website & Marketing */}
      {openSection === 7 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">8. Website & Marketing Compliance</CardTitle>
            <p className="text-sm text-muted-foreground">Confirm website and marketing materials comply with FCA consumer credit rules.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Website URL</Label><Input value={cl.section8.websiteUrl || app.websiteUrl} onChange={(e) => update((c) => ({ ...c, section8: { ...c.section8, websiteUrl: e.target.value } }))} /></div>
              <div className="space-y-2"><Label>APR Displayed</Label><ToggleGroup options={["Yes", "No", "Not Applicable"]} value={cl.section8.aprDisplayed} onChange={(v) => update((c) => ({ ...c, section8: { ...c.section8, aprDisplayed: v as any } }))} /></div>
              <div className="space-y-2"><Label>Risk Warnings Present</Label><ToggleGroup options={["Yes", "No", "Not Applicable"]} value={cl.section8.riskWarnings} onChange={(v) => update((c) => ({ ...c, section8: { ...c.section8, riskWarnings: v as any } }))} /></div>
              <div className="space-y-2"><Label>Clear, Fair, Not Misleading</Label><ToggleGroup options={["Yes", "No"]} value={cl.section8.clearFairNotMisleading} onChange={(v) => update((c) => ({ ...c, section8: { ...c.section8, clearFairNotMisleading: v as any } }))} /></div>
              <div className="space-y-2"><Label>Terms & Conditions Present</Label><ToggleGroup options={["Yes", "No"]} value={cl.section8.termsAndConditions} onChange={(v) => update((c) => ({ ...c, section8: { ...c.section8, termsAndConditions: v as any } }))} /></div>
              <div className="space-y-2"><Label>Privacy Policy Present</Label><ToggleGroup options={["Yes", "No"]} value={cl.section8.privacyPolicy} onChange={(v) => update((c) => ({ ...c, section8: { ...c.section8, privacyPolicy: v as any } }))} /></div>
              <div className="space-y-2"><Label>Compliant Social Media</Label><ToggleGroup options={["Yes", "No", "Not Applicable"]} value={cl.section8.compliantSocialMedia} onChange={(v) => update((c) => ({ ...c, section8: { ...c.section8, compliantSocialMedia: v as any } }))} /></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={cl.section8.notes} onChange={(e) => update((c) => ({ ...c, section8: { ...c.section8, notes: e.target.value } }))} rows={3} /></div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Section Result</Label>
              <ResultToggle value={cl.section8.result} onChange={(v) => update((c) => ({ ...c, section8: { ...c.section8, result: v } }))} options={["Pass", "Fail", "Pending"]} />
            </div>
            <Button size="sm" disabled={!cl.section8.result} onClick={() => markComplete("section8")}>
              <Check className="h-4 w-4 mr-1" /> Mark Complete
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Submit section */}
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={handleSaveReturn}>
          <Save className="h-4 w-4 mr-2" /> Save & Return Later
        </Button>
        <Button onClick={handleSubmit} disabled={!allComplete}>
          Submit for Approval
        </Button>
      </div>
    </div>
  );
}
