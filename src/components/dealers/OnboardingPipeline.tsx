import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Calendar, ArrowRight, ChevronDown, ChevronUp, Hash, Tag, Plus, FileText, ClipboardList } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

  return (
    <Card className="p-3 space-y-2 hover:shadow-md transition-shadow border-border">
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
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{created}</span>
        {app.companiesHouseNumber && <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{app.companiesHouseNumber}</span>}
      </div>
      {expanded && (
        <div className="pt-2 border-t border-border space-y-2">
          <Button size="sm" variant="outline" className="w-full gap-2" onClick={() => navigate(getRoute())}>
            {app.status === "checklist" ? <ClipboardList className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
            {app.status === "checklist" ? "Continue Checklist" : "Continue Pre-Screening"}
          </Button>
        </div>
      )}
    </Card>
  );
}

function LegacyCard({ app }: { app: OnboardingApplication }) {
  const [expanded, setExpanded] = useState(false);
  const created = new Date(app.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <Card className="p-3 space-y-2 hover:shadow-md transition-shadow cursor-pointer border-border" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-4 w-4 shrink-0 text-primary" />
          <span className="font-semibold text-sm text-foreground truncate">{app.dealerName}</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{created}</span>
        {app.companyNumber && <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{app.companyNumber}</span>}
      </div>
      {expanded && app.qualificationNotes && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground italic">{app.qualificationNotes}</p>
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Onboarding Pipeline</h1>
          <p className="text-sm text-muted-foreground">Track dealer applications through each onboarding stage</p>
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
