import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Calendar, ArrowRight, ChevronDown, ChevronUp, Hash, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { onboardingApplications } from "@/data/onboardingMockData";
import type { OnboardingApplication, OnboardingStage } from "@/types";

const STAGES: { key: OnboardingStage; label: string; color: string }[] = [
  { key: "pre-screening", label: "Pre-Screening", color: "bg-rag-amber/15 text-rag-amber border-rag-amber/30" },
  { key: "application", label: "Application", color: "bg-secondary/15 text-secondary border-secondary/30" },
  { key: "approval", label: "Approval", color: "bg-rag-green/15 text-rag-green border-rag-green/30" },
];

function ApplicationCard({ app }: { app: OnboardingApplication }) {
  const [expanded, setExpanded] = useState(false);
  const created = new Date(app.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const hasSeg =
    app.segmentation.franchise ||
    app.segmentation.size ||
    app.segmentation.stockType.length > 0 ||
    app.segmentation.existingFinance;

  return (
    <Card
      className="p-3 space-y-2 hover:shadow-md transition-shadow cursor-pointer border-border"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-4 w-4 shrink-0 text-primary" />
          <span className="font-semibold text-sm text-foreground truncate">{app.dealerName}</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {created}
        </span>
        {app.companyNumber && (
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            {app.companyNumber}
          </span>
        )}
      </div>

      {expanded && (
        <div className="pt-2 border-t border-border space-y-2 text-xs">
          {hasSeg && (
            <div className="flex flex-wrap gap-1">
              {app.segmentation.franchise && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  <Tag className="h-2.5 w-2.5 mr-0.5" />
                  {app.segmentation.franchise}
                </Badge>
              )}
              {app.segmentation.size && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {app.segmentation.size}
                </Badge>
              )}
              {app.segmentation.stockType.map((s) => (
                <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">
                  {s}
                </Badge>
              ))}
              {app.segmentation.existingFinance && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {app.segmentation.existingFinance} finance
                </Badge>
              )}
            </div>
          )}
          {app.qualificationNotes && (
            <p className="text-muted-foreground italic">{app.qualificationNotes}</p>
          )}
        </div>
      )}
    </Card>
  );
}

export function OnboardingPipeline() {
  const grouped = STAGES.map((stage) => ({
    ...stage,
    apps: onboardingApplications.filter((a) => a.stage === stage.key),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Onboarding Pipeline</h1>
        <p className="text-sm text-muted-foreground">
          Track dealer applications through each onboarding stage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {grouped.map((col) => (
          <div key={col.key} className="space-y-3">
            {/* Column header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={`${col.color} border font-semibold text-xs`}>
                  {col.label}
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  {col.apps.length}
                </span>
              </div>
              {col.key !== "approval" && (
                <ArrowRight className="h-4 w-4 text-muted-foreground/50 hidden md:block" />
              )}
            </div>

            {/* Cards */}
            <div className="space-y-2 min-h-[120px] rounded-lg bg-muted/30 p-2 border border-dashed border-border">
              {col.apps.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No applications
                </p>
              ) : (
                col.apps.map((app) => <ApplicationCard key={app.id} app={app} />)
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
