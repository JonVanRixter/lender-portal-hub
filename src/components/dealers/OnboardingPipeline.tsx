import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Calendar, ArrowRight, ChevronDown, ChevronUp, Hash, Plus, FileText, ClipboardList, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { onboardingApplications } from "@/data/onboardingMockData";
import { useOnboarding } from "@/contexts/OnboardingContext";
import type { OnboardingApplication, OnboardingStage } from "@/types";
import type { OnboardingApplicationFull, OnboardingAppStatus } from "@/types/onboarding";

const STAGES: { key: string; label: string; color: string }[] = [
  { key: "draft", label: "Draft", color: "bg-muted text-muted-foreground border-border" },
  { key: "pre-screening", label: "Pre-Screening", color: "bg-rag-amber/15 text-rag-amber border-rag-amber/30" },
  { key: "checklist", label: "Checklist", color: "bg-secondary/15 text-secondary border-secondary/30" },
  { key: "pending-approval", label: "Pending Approval", color: "bg-rag-green/15 text-rag-green border-rag-green/30" },
];

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  draft: { label: "Draft", icon: <FileText className="h-3.5 w-3.5" />, color: "bg-muted text-muted-foreground" },
  "pre-screening": { label: "Pre-Screening", icon: <Clock className="h-3.5 w-3.5" />, color: "bg-rag-amber/15 text-rag-amber" },
  checklist: { label: "In Checklist", icon: <ClipboardList className="h-3.5 w-3.5" />, color: "bg-primary/15 text-primary" },
  "pending-approval": { label: "Pending Approval", icon: <Clock className="h-3.5 w-3.5" />, color: "bg-rag-green/15 text-rag-green" },
  approved: { label: "Approved", icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "bg-rag-green/15 text-rag-green" },
  rejected: { label: "Rejected", icon: <XCircle className="h-3.5 w-3.5" />, color: "bg-rag-red/15 text-rag-red" },
};

function computePreScreeningProgress(app: OnboardingApplicationFull): number {
  const checks = app.preScreening;
  const fields = [checks.companiesHouse.result, checks.fcaRegister.result, checks.financialStanding.result, checks.sanctionsAml.result, checks.websiteTrading.result];
  const done = fields.filter((r) => r !== null).length;
  return Math.round((done / 5) * 100);
}

function computeChecklistProgress(app: OnboardingApplicationFull): number {
  const cl = app.checklist;
  const sections = [cl.section1, cl.section2, cl.section3, cl.section4, cl.section5, cl.section6, cl.section7, cl.section8];
  const done = sections.filter((s) => s.complete).length;
  return Math.round((done / 8) * 100);
}

function computeOverallProgress(app: OnboardingApplicationFull): number {
  // Draft = 0-5%, Pre-screening = 5-30%, Checklist = 30-90%, Pending = 90-100%
  if (app.status === "approved") return 100;
  if (app.status === "rejected") return 100;
  if (app.status === "pending-approval") return 95;
  if (app.status === "checklist") {
    const clProg = computeChecklistProgress(app);
    return Math.round(30 + (clProg / 100) * 60);
  }
  if (app.status === "pre-screening") {
    const psProg = computePreScreeningProgress(app);
    return Math.round(5 + (psProg / 100) * 25);
  }
  return 2; // draft
}

function ApplicationCardFull({ app }: { app: OnboardingApplicationFull }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const created = new Date(app.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const getRoute = () => {
    if (app.status === "draft" || app.status === "pre-screening") return `/onboarding/${app.id}/pre-screening`;
    if (app.status === "checklist") return `/onboarding/${app.id}/checklist`;
    return `/onboarding/${app.id}/checklist`;
  };

  const overall = computeOverallProgress(app);
  const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.draft;

  const preScreenProg = computePreScreeningProgress(app);
  const checklistProg = computeChecklistProgress(app);

  return (
    <Card className="p-3 space-y-2.5 hover:shadow-md transition-shadow border-border">
      <div className="flex items-start justify-between gap-2">
        <div
          className="flex items-center gap-2 min-w-0 cursor-pointer"
          onClick={() => navigate(getRoute())}
        >
          <Building2 className="h-4 w-4 shrink-0 text-primary" />
          <span className="font-semibold text-sm text-foreground truncate">{app.tradingName || app.companyName}</span>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Status badge + progress */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${statusCfg.color}`}>
          {statusCfg.icon} {statusCfg.label}
        </span>
        <span className="text-xs font-semibold text-foreground ml-auto">{overall}%</span>
      </div>
      <Progress value={overall} className="h-1.5" />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{created}</span>
        {app.companiesHouseNumber && <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{app.companiesHouseNumber}</span>}
      </div>

      {expanded && (
        <div className="pt-2 border-t border-border space-y-3">
          {/* Stage breakdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pre-Screening</span>
              <span className="font-medium text-foreground">{preScreenProg}%</span>
            </div>
            <Progress value={preScreenProg} className="h-1" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Checklist (8 sections)</span>
              <span className="font-medium text-foreground">{checklistProg}%</span>
            </div>
            <Progress value={checklistProg} className="h-1" />
          </div>
          <Button size="sm" variant="outline" className="w-full gap-2" onClick={() => navigate(getRoute())}>
            {app.status === "checklist" ? <ClipboardList className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
            {app.status === "checklist" ? "Continue Checklist" : app.status === "draft" ? "Start Application" : "Continue Pre-Screening"}
          </Button>
        </div>
      )}
    </Card>
  );
}

function LegacyCard({ app }: { app: OnboardingApplication }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const created = new Date(app.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  // Compute a rough progress for legacy apps based on stage
  const stageProgress: Record<OnboardingStage, number> = {
    "pre-screening": 15,
    "application": 55,
    "approval": 90,
  };
  const progress = stageProgress[app.stage] || 0;
  const stageLabel: Record<OnboardingStage, string> = {
    "pre-screening": "Pre-Screening",
    "application": "In Checklist",
    "approval": "Pending Approval",
  };

  return (
    <Card className="p-3 space-y-2.5 hover:shadow-md transition-shadow border-border">
      <div className="flex items-start justify-between gap-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-4 w-4 shrink-0 text-primary" />
          <span className="font-semibold text-sm text-foreground truncate">{app.dealerName}</span>
        </div>
        <button className="text-muted-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold bg-muted text-muted-foreground">
          <Clock className="h-3.5 w-3.5" /> {stageLabel[app.stage]}
        </span>
        <span className="text-xs font-semibold text-foreground ml-auto">{progress}%</span>
      </div>
      <Progress value={progress} className="h-1.5" />

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{created}</span>
        {app.companyNumber && <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{app.companyNumber}</span>}
      </div>

      {expanded && (
        <div className="pt-2 border-t border-border">
          {app.qualificationNotes && (
            <p className="text-xs text-muted-foreground italic mb-2">{app.qualificationNotes}</p>
          )}
          <Button size="sm" variant="outline" className="w-full gap-2" onClick={() => navigate("/onboarding/new")}>
            <FileText className="h-3.5 w-3.5" /> View Application
          </Button>
        </div>
      )}
    </Card>
  );
}

export function OnboardingPipeline() {
  const navigate = useNavigate();
  const { applications } = useOnboarding();

  // Group new-workflow apps by status
  const grouped = STAGES.map((stage) => ({
    ...stage,
    apps: applications.filter((a) => a.status === stage.key),
    legacyApps: [] as OnboardingApplication[],
  }));

  // Map legacy apps into the pipeline
  const legacyStageMap: Record<OnboardingStage, string> = {
    "pre-screening": "pre-screening",
    "application": "checklist",
    "approval": "pending-approval",
  };
  onboardingApplications.forEach((legacy) => {
    const targetKey = legacyStageMap[legacy.stage];
    const col = grouped.find((g) => g.key === targetKey);
    if (col) col.legacyApps.push(legacy);
  });

  const totalApps = grouped.reduce((sum, col) => sum + col.apps.length + col.legacyApps.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Onboarding Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {totalApps} application{totalApps !== 1 ? "s" : ""} in progress — track dealer applications through each onboarding stage
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/onboarding/new")}>
          <Plus className="h-4 w-4" /> Add New Dealer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {grouped.map((col, i) => (
          <div key={col.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={`${col.color} border font-semibold text-xs`}>{col.label}</Badge>
                <span className="text-xs font-medium text-muted-foreground">{col.apps.length + col.legacyApps.length}</span>
              </div>
              {i < grouped.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground/50 hidden md:block" />}
            </div>
            <div className="space-y-2 min-h-[120px] rounded-lg bg-muted/30 p-2 border border-dashed border-border">
              {col.apps.length === 0 && col.legacyApps.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No applications</p>
              ) : (
                <>
                  {col.apps.map((app) => <ApplicationCardFull key={app.id} app={app} />)}
                  {col.legacyApps.map((app) => <LegacyCard key={app.id} app={app} />)}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
