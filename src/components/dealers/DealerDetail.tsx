import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, Globe, Building2,
  Download, RefreshCw, CheckCircle2, Clock, AlertCircle, ChevronDown,
  ChevronUp, Trophy, AlertTriangle, FileText, Calendar, BarChart3,
  Search, Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { documents as allDocuments } from "@/data/mockData";
import { getControlAreasForSection } from "@/data/controlAreaData";
import { useRecheck } from "@/contexts/RecheckContext";
import { RequestReAuditModal } from "./RequestReAuditModal";
import { RequestRecheckModal } from "./RequestRecheckModal";
import { RecheckRequestsPanel } from "./RecheckRequestsPanel";
import { AuditReportModal } from "./AuditReportModal";
import type { Dealer, RagStatus, SectionResult, ActionStatus, AuditChange, DocStatus } from "@/types";

const RAG_BADGE: Record<RagStatus, string> = {
  Green: "bg-rag-green/15 text-rag-green border-rag-green/30",
  Amber: "bg-rag-amber/15 text-rag-amber border-rag-amber/30",
  Red: "bg-rag-red/15 text-rag-red border-rag-red/30",
};

const RAG_BG: Record<RagStatus, string> = {
  Green: "bg-rag-green/10 border-rag-green/20",
  Amber: "bg-rag-amber/10 border-rag-amber/20",
  Red: "bg-rag-red/10 border-rag-red/20",
};

const RESULT_PILL: Record<SectionResult, { class: string; icon: React.ReactNode }> = {
  Pass: { class: "bg-rag-green/15 text-rag-green", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  Pending: { class: "bg-rag-amber/15 text-rag-amber", icon: <Clock className="h-3.5 w-3.5" /> },
  Fail: { class: "bg-rag-red/15 text-rag-red", icon: <AlertCircle className="h-3.5 w-3.5" /> },
};

const ACTION_PILL: Record<ActionStatus, string> = {
  Open: "bg-rag-amber/15 text-rag-amber",
  "In Progress": "bg-secondary/15 text-secondary",
  Completed: "bg-rag-green/15 text-rag-green",
};

const RISK_PILL: Record<string, string> = {
  High: "text-rag-red",
  Medium: "text-rag-amber",
  Low: "text-rag-green",
};

const DOC_STATUS_PILL: Record<DocStatus, string> = {
  Valid: "bg-rag-green/15 text-rag-green",
  "Expiring Soon": "bg-rag-amber/15 text-rag-amber",
  Expired: "bg-rag-red/15 text-rag-red",
};

const CHANGE_ICON: Record<AuditChange, { icon: React.ReactNode; label: string }> = {
  up: { icon: <TrendingUp className="h-4 w-4 text-rag-green" />, label: "Improved" },
  down: { icon: <TrendingDown className="h-4 w-4 text-rag-red" />, label: "Declined" },
  neutral: { icon: <Minus className="h-4 w-4 text-muted-foreground" />, label: "Unchanged" },
};

const RAG_LABEL: Record<RagStatus, string> = {
  Green: "Green — Compliant",
  Amber: "Amber — Under Review",
  Red: "Red — Non-Compliant",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function getNextReviewDate(lastAudit: string) {
  const d = new Date(lastAudit);
  d.setMonth(d.getMonth() + 3);
  return fmtDate(d.toISOString());
}

export function DealerDetail({ dealer }: { dealer: Dealer }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reAuditOpen, setReAuditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [recheckModal, setRecheckModal] = useState<{
    sectionId: string; sectionName: string; controlName: string;
    result: "Pass" | "Pending" | "Fail"; score: number;
  } | null>(null);
  const { getRequestForControl } = useRecheck();

  const dealerDocs = useMemo(
    () => allDocuments.filter((d) => d.dealerId === dealer.id),
    [dealer.id]
  );

  const sectionsPassed = useMemo(
    () => (dealer.sections ?? []).filter((s) => s.result === "Pass").length,
    [dealer.sections]
  );

  const totalSections = dealer.sections?.length ?? 0;

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDownloadReport = () => {
    setReportOpen(true);
  };

  const handleViewHistoricalReport = () => {
    toast({
      title: "📄 Historical Report",
      description: "Historical report available in full MVP.",
    });
  };

  const handleDownloadDoc = () => {
    toast({
      title: "📥 Document Download",
      description: "Document download available in full MVP.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/dealers")} className="-ml-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dealers
      </Button>

      {/* 2.1 — Page Header */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-foreground">{dealer.tradingName}</h1>
              <p className="text-sm text-muted-foreground">{dealer.name}</p>
              {dealer.companiesHouseNumber && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Companies House: {dealer.companiesHouseNumber}
                </p>
              )}
              <p className="text-sm text-muted-foreground">FCA Reference: 734291</p>
              {dealer.website && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> {dealer.website}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-foreground">{dealer.overallScore}</span>
                <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-bold ${RAG_BADGE[dealer.ragStatus]}`}>
                  {dealer.ragStatus}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Last Audit: {fmtDate(dealer.lastAuditDate)}</p>
              <p className="text-xs text-muted-foreground">Audited by: The Compliance Guys</p>
              <div className="flex items-center gap-2 mt-2">
                <Button onClick={handleDownloadReport} className="gap-1.5 bg-primary hover:bg-primary/90">
                  <Download className="h-4 w-4" /> Download Audit Report
                </Button>
                <Button variant="outline" onClick={() => setReAuditOpen(true)} className="gap-1.5">
                  <RefreshCw className="h-4 w-4" /> Request Re-Audit
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2.2 — Audit Summary Card Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className={`border ${RAG_BG[dealer.ragStatus]}`}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Overall Score</p>
            <p className="text-3xl font-bold text-foreground mt-1">{dealer.overallScore}</p>
            <p className="text-xs font-medium mt-1" style={{ color: `hsl(var(--rag-${dealer.ragStatus.toLowerCase()}))` }}>
              {RAG_LABEL[dealer.ragStatus]}
            </p>
            {/* Threshold indicator */}
            <div className="mt-3 space-y-1.5">
              <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all"
                  style={{
                    width: `${dealer.overallScore}%`,
                    backgroundColor: `hsl(var(--rag-${dealer.ragStatus.toLowerCase()}))`,
                  }}
                />
                {/* Green threshold marker */}
                <div
                  className="absolute inset-y-0 w-0.5 bg-rag-green"
                  style={{ left: "75%" }}
                  title="Green threshold: 75"
                />
                {/* Amber threshold marker */}
                <div
                  className="absolute inset-y-0 w-0.5 bg-rag-amber"
                  style={{ left: "50%" }}
                  title="Amber threshold: 50"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>0</span>
                <span className="text-rag-amber">Amber ≥50</span>
                <span className="text-rag-green">Green ≥75</span>
                <span>100</span>
              </div>
              {dealer.overallScore >= 75 ? (
                <p className="text-[10px] text-rag-green font-medium">
                  ✅ {dealer.overallScore - 75} points above Green threshold
                </p>
              ) : dealer.overallScore >= 50 ? (
                <p className="text-[10px] text-rag-amber font-medium">
                  ⚠️ {75 - dealer.overallScore} points below Green threshold
                </p>
              ) : (
                <p className="text-[10px] text-rag-red font-medium">
                  ❌ {75 - dealer.overallScore} points below Green threshold · {50 - dealer.overallScore} below Amber
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Audit Date
            </p>
            <p className="text-lg font-bold text-foreground mt-1">{fmtDate(dealer.lastAuditDate)}</p>
            <p className="text-xs text-muted-foreground mt-1">Next review due: {getNextReviewDate(dealer.lastAuditDate)}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold flex items-center gap-1">
              <BarChart3 className="h-3 w-3" /> Sections Passed
            </p>
            <p className="text-lg font-bold text-foreground mt-1">{sectionsPassed} / {totalSections} sections</p>
            <Progress value={totalSections > 0 ? (sectionsPassed / totalSections) * 100 : 0} className="h-1.5 mt-2 [&>div]:bg-rag-green" />
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Customer Sentiment</p>
            <p className="text-3xl font-bold text-foreground mt-1">{dealer.cssScore}</p>
            {dealer.cssStatus && (
              <Badge variant={dealer.cssStatus === "Reward" ? "default" : "secondary"} className="text-[10px] mt-1 gap-1">
                {dealer.cssStatus === "Reward" ? <Trophy className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {dealer.cssStatus}
              </Badge>
            )}
            <p className="text-[10px] text-muted-foreground mt-1">Score provided by The Compliance Guys</p>
          </CardContent>
        </Card>
      </div>

      {/* 2.3 — Report Header */}
      <div className="border-t border-b border-border py-4 space-y-1">
        <h2 className="text-lg font-bold text-foreground uppercase tracking-wide">Compliance Audit Report</h2>
        <p className="text-sm text-muted-foreground">Prepared by: The Compliance Guys Ltd</p>
        <p className="text-sm text-muted-foreground">
          Audit Date: {fmtDate(dealer.lastAuditDate)} · Report Ref: AR-{dealer.id.replace("d", "")}-2026
        </p>
        <p className="text-xs text-muted-foreground italic">This report is produced by TCG and is read-only.</p>
      </div>

      {/* 2.4 — Executive Summary */}
      {dealer.notes && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Executive Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground leading-relaxed">{dealer.notes}</p>
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <span className="text-sm font-semibold text-foreground">Overall Conclusion:</span>
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${RAG_BADGE[dealer.ragStatus]}`}>
                {dealer.ragStatus === "Green" ? "LOW RISK — GREEN" : dealer.ragStatus === "Amber" ? "MEDIUM RISK — AMBER" : "HIGH RISK — RED"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2.5 — Section Results Breakdown */}
      {dealer.sections && dealer.sections.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Section Results</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dealer.sections.map((s) => {
              const expanded = expandedSections.has(s.id);
              const controlAreas = getControlAreasForSection(s.name, s.result, s.notes);
              return (
                <Card key={s.id} className="border-border">
                  <CardContent className="p-4 space-y-3">
                    {/* Section header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold text-sm text-foreground">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${RESULT_PILL[s.result].class}`}>
                          {RESULT_PILL[s.result].icon} {s.result}
                        </span>
                      </div>
                    </div>
                    {/* Score + RAG */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Score: <strong className="text-foreground">{s.score}</strong> / 100</span>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${RAG_BADGE[s.ragStatus]}`}>
                        {s.ragStatus}
                      </span>
                    </div>
                    {/* Section threshold bar */}
                    <div className="space-y-1">
                      <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full"
                          style={{
                            width: `${s.score}%`,
                            backgroundColor: `hsl(var(--rag-${s.ragStatus.toLowerCase()}))`,
                          }}
                        />
                        <div className="absolute inset-y-0 w-0.5 bg-rag-green" style={{ left: "75%" }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {s.score >= 75 ? (
                          <span className="text-rag-green">+{s.score - 75} above threshold</span>
                        ) : (
                          <span className="text-rag-amber">{75 - s.score} pts to Green</span>
                        )}
                      </p>
                    </div>
                    {/* Notes */}
                    <p className="text-xs text-muted-foreground leading-relaxed">"{s.notes}"</p>
                    {/* Expand toggle */}
                    {controlAreas.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-center text-xs text-primary gap-1"
                        onClick={() => toggleSection(s.id)}
                      >
                        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {expanded ? "Hide Detail" : "View Full Detail"}
                      </Button>
                    )}
                    {/* 2.6 — Control Area Detail Table */}
                    {expanded && controlAreas.length > 0 && (
                      <div className="overflow-x-auto rounded-md border border-border mt-2">
                        <table className="w-full text-xs">
                          <thead>
                             <tr className="border-b border-border bg-muted/50">
                               <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Control Area</th>
                               <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground hidden sm:table-cell">Objective</th>
                               <th className="px-2 py-1.5 text-center font-semibold text-muted-foreground">Result</th>
                               <th className="px-2 py-1.5 text-center font-semibold text-muted-foreground">Risk</th>
                               <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Notes</th>
                               <th className="px-2 py-1.5 text-center font-semibold text-muted-foreground">Re-Check</th>
                             </tr>
                          </thead>
                          <tbody>
                             {controlAreas.map((ca, idx) => {
                               const existingReq = getRequestForControl(dealer.id, ca.controlArea, s.name);
                               const isFailChase = ca.result === "Fail";
                               return (
                               <tr key={idx} className={`border-b border-border last:border-0 ${isFailChase ? "bg-rag-red/5" : ""}`}>
                                 <td className="px-2 py-1.5 font-medium text-foreground">
                                   {ca.controlArea}
                                   {isFailChase && (
                                     <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] text-rag-red font-semibold">
                                       <Zap className="h-2.5 w-2.5" /> Auto-chase
                                     </span>
                                   )}
                                 </td>
                                 <td className="px-2 py-1.5 text-muted-foreground hidden sm:table-cell">{ca.objective}</td>
                                 <td className="px-2 py-1.5 text-center">
                                   <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${RESULT_PILL[ca.result].class} rounded-full px-1.5 py-0.5`}>
                                     {ca.result === "Pass" ? "✅" : ca.result === "Pending" ? "⚠️" : "❌"} {ca.result}
                                   </span>
                                 </td>
                                 <td className={`px-2 py-1.5 text-center text-[10px] font-semibold ${RISK_PILL[ca.riskRating]}`}>
                                   {ca.riskRating}
                                 </td>
                                 <td className="px-2 py-1.5 text-muted-foreground">{ca.notes}</td>
                                 <td className="px-2 py-1.5 text-center">
                                   {existingReq ? (
                                     <Tooltip>
                                       <TooltipTrigger asChild>
                                         <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold cursor-default ${
                                           existingReq.status === "Submitted" ? "bg-secondary/15 text-secondary" :
                                           existingReq.status === "In Progress" ? "bg-rag-amber/15 text-rag-amber" :
                                           "bg-rag-green/15 text-rag-green"
                                         }`}>
                                           {existingReq.status === "Submitted" ? "📨" : existingReq.status === "In Progress" ? "🔄" : "✅"} {existingReq.status}
                                         </span>
                                       </TooltipTrigger>
                                       <TooltipContent className="max-w-xs text-xs">
                                         <p className="font-medium">{existingReq.requestType}: {existingReq.reason}</p>
                                         {existingReq.tcgAssignedTo && <p>Assigned to: {existingReq.tcgAssignedTo}</p>}
                                       </TooltipContent>
                                     </Tooltip>
                                   ) : (
                                     <Button
                                       variant="ghost"
                                       size="sm"
                                       className="h-5 px-1.5 text-[10px] text-primary gap-0.5"
                                       onClick={() => setRecheckModal({
                                         sectionId: s.id,
                                         sectionName: s.name,
                                         controlName: ca.controlArea,
                                         result: ca.result,
                                         score: s.score,
                                       })}
                                     >
                                       <Search className="h-2.5 w-2.5" /> Request
                                     </Button>
                                   )}
                                 </td>
                               </tr>
                               );
                             })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 2.7 — Key Actions Panel */}
      <div className="space-y-3">
        <div className="border-t border-border pt-4 space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Key Actions from Audit</h3>
          <p className="text-xs text-muted-foreground">Actions below have been raised by The Compliance Guys.</p>
        </div>
        {dealer.keyActions && dealer.keyActions.length > 0 ? (
          <div className="overflow-x-auto rounded-md border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">#</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Action</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground hidden sm:table-cell">Priority</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Due Date</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {dealer.keyActions.map((a, idx) => (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{idx + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-foreground">{a.description}</td>
                    <td className="px-3 py-2.5 text-muted-foreground hidden sm:table-cell">Medium</td>
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{fmtDate(a.dueDate)}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${ACTION_PILL[a.status]}`}>
                        {a.status === "Open" ? "🟡 Open" : a.status === "In Progress" ? "🔵 In Progress" : "🟢 Closed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Card className="border-border">
            <CardContent className="p-4 text-sm text-muted-foreground">No actions raised for this dealer.</CardContent>
          </Card>
        )}
        <p className="text-xs text-muted-foreground italic">
          To raise a new action or update the status of an existing action, contact The Compliance Guys: compliance@thecomplianceguys.co.uk
        </p>
      </div>

      {/* Bottom row: Audit History + Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2.8 — Audit History Timeline */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Audit History</h3>
          {dealer.auditHistory && dealer.auditHistory.length > 0 ? (
            <div className="space-y-0 relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />
              {dealer.auditHistory.map((h) => (
                <div key={h.id} className="flex items-start gap-4 relative pl-8 py-3">
                  {/* Dot */}
                  <div className={`absolute left-1.5 top-4 h-3 w-3 rounded-full border-2 border-card ${
                    h.ragStatus === "Green" ? "bg-rag-green" : h.ragStatus === "Amber" ? "bg-rag-amber" : "bg-rag-red"
                  }`} />
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{fmtDate(h.date)}</p>
                      <p className="text-xs text-muted-foreground">Audited by: The Compliance Guys</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold tabular-nums text-foreground">{h.overallScore}</span>
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${RAG_BADGE[h.ragStatus]}`}>
                        {h.ragStatus}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        {CHANGE_ICON[h.change].icon}
                      </span>
                      <Button variant="ghost" size="sm" className="text-xs text-primary h-6 px-2" onClick={handleViewHistoricalReport}>
                        View Report
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-border">
              <CardContent className="p-4 text-sm text-muted-foreground">No audit history available.</CardContent>
            </Card>
          )}
        </div>

        {/* 2.9 — Documents Panel */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Documents</h3>
          {dealerDocs.length > 0 ? (
            <div className="overflow-x-auto rounded-md border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Document</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground hidden sm:table-cell">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground hidden md:table-cell">Uploaded</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Expiry</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Status</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {dealerDocs.map((doc) => (
                    <tr key={doc.id} className="border-b border-border last:border-0">
                      <td className="px-3 py-2 font-medium text-foreground text-xs">{doc.name}</td>
                      <td className="px-3 py-2 text-muted-foreground text-xs hidden sm:table-cell">{doc.category}</td>
                      <td className="px-3 py-2 text-muted-foreground text-xs hidden md:table-cell">{fmtDate(doc.uploadDate)}</td>
                      <td className="px-3 py-2 text-muted-foreground text-xs">{doc.expiryDate ? fmtDate(doc.expiryDate) : "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${DOC_STATUS_PILL[doc.status]}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <Button variant="ghost" size="sm" className="text-xs text-primary h-6 px-2 gap-1" onClick={handleDownloadDoc}>
                          <Download className="h-3 w-3" /> Download
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Card className="border-border">
              <CardContent className="p-4 text-sm text-muted-foreground">No documents on file for this dealer.</CardContent>
            </Card>
          )}
          <p className="text-xs text-muted-foreground italic">
            Documents are managed by The Compliance Guys as part of the audit process. To submit additional documents, contact: compliance@thecomplianceguys.co.uk
          </p>
        </div>
      </div>

      {/* Re-Check Requests Panel */}
      <RecheckRequestsPanel dealerId={dealer.id} />

      {/* Request Re-Audit Modal */}
      <RequestReAuditModal
        open={reAuditOpen}
        onClose={() => setReAuditOpen(false)}
        dealerName={dealer.tradingName}
      />
      <AuditReportModal dealer={dealer} open={reportOpen} onOpenChange={setReportOpen} />
      {recheckModal && (
        <RequestRecheckModal
          open={!!recheckModal}
          onClose={() => setRecheckModal(null)}
          dealerId={dealer.id}
          dealerName={dealer.name}
          sectionId={recheckModal.sectionId}
          sectionName={recheckModal.sectionName}
          controlName={recheckModal.controlName}
          currentResult={recheckModal.result}
          currentScore={recheckModal.score}
        />
      )}
    </div>
  );
}
