import { useRef } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { getControlAreasForSection } from "@/data/controlAreaData";
import type { Dealer, RagStatus, SectionResult } from "@/types";

const RAG_COLOUR: Record<RagStatus, string> = {
  Green: "text-rag-green", Amber: "text-rag-amber", Red: "text-rag-red",
};
const RAG_BG: Record<RagStatus, string> = {
  Green: "bg-rag-green/10 border-rag-green/30 text-rag-green",
  Amber: "bg-rag-amber/10 border-rag-amber/30 text-rag-amber",
  Red: "bg-rag-red/10 border-rag-red/30 text-rag-red",
};
const RESULT_STYLE: Record<SectionResult, { bg: string; icon: React.ReactNode }> = {
  Pass: { bg: "bg-rag-green/10 text-rag-green", icon: <CheckCircle2 className="h-3 w-3" /> },
  Pending: { bg: "bg-rag-amber/10 text-rag-amber", icon: <Clock className="h-3 w-3" /> },
  Fail: { bg: "bg-rag-red/10 text-rag-red", icon: <AlertCircle className="h-3 w-3" /> },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export function AuditReportModal({ dealer, open, onOpenChange }: { dealer: Dealer; open: boolean; onOpenChange: (v: boolean) => void }) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => window.print();

  const sectionsPassed = (dealer.sections ?? []).filter((s) => s.result === "Pass").length;
  const totalSections = dealer.sections?.length ?? 0;
  const reportRef_ = `AR-${dealer.id.replace("d", "").padStart(3, "0")}-2026`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 print:max-w-none print:max-h-none print:overflow-visible">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-3 flex items-center justify-between print:hidden">
          <DialogHeader>
            <DialogTitle className="text-base">Audit Report Preview</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="h-3.5 w-3.5" /> Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Report body */}
        <div ref={reportRef} className="px-8 py-6 space-y-8 text-foreground print:px-12 print:py-8" style={{ fontFamily: "'Inter', sans-serif" }}>
          {/* Letterhead */}
          <div className="text-center space-y-1 border-b-2 border-primary pb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">The Compliance Guys Ltd</p>
            <h1 className="text-2xl font-bold tracking-tight">Compliance Audit Report</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Prepared for: <strong className="text-foreground">Kensington Mortgages Ltd</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Dealer: <strong className="text-foreground">{dealer.tradingName}</strong> ({dealer.name})
            </p>
            <p className="text-xs text-muted-foreground">
              Report Ref: {reportRef_} &nbsp;·&nbsp; Audit Date: {fmtDate(dealer.lastAuditDate)} &nbsp;·&nbsp; Classification: <strong>CONFIDENTIAL</strong>
            </p>
          </div>

          {/* Summary box */}
          <div className="border border-border rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Audit Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Overall Score</p>
                <p className={`text-3xl font-bold ${RAG_COLOUR[dealer.ragStatus]}`}>{dealer.overallScore}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {dealer.overallScore >= 75
                    ? <span className="text-rag-green font-medium">+{dealer.overallScore - 75} above Green (≥75)</span>
                    : dealer.overallScore >= 50
                    ? <span className="text-rag-amber font-medium">{75 - dealer.overallScore} pts below Green (≥75)</span>
                    : <span className="text-rag-red font-medium">{75 - dealer.overallScore} pts below Green · {50 - dealer.overallScore} below Amber</span>
                  }
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">RAG Status</p>
                <Badge className={`mt-1 border ${RAG_BG[dealer.ragStatus]}`}>{dealer.ragStatus}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sections Passed</p>
                <p className="text-xl font-bold">{sectionsPassed} / {totalSections}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CSS Score</p>
                <p className="text-xl font-bold">{dealer.cssScore}</p>
                {dealer.cssStatus && <p className="text-[10px] text-muted-foreground">{dealer.cssStatus}</p>}
              </div>
            </div>
          </div>

          {/* Dealer info */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div><span className="text-muted-foreground">Legal Name:</span> <strong>{dealer.name}</strong></div>
            <div><span className="text-muted-foreground">Trading Name:</span> <strong>{dealer.tradingName}</strong></div>
            {dealer.companiesHouseNumber && <div><span className="text-muted-foreground">Companies House:</span> {dealer.companiesHouseNumber}</div>}
            {dealer.website && <div><span className="text-muted-foreground">Website:</span> {dealer.website}</div>}
            {dealer.address && <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {dealer.address}</div>}
            {dealer.contactEmail && <div><span className="text-muted-foreground">Email:</span> {dealer.contactEmail}</div>}
            {dealer.contactPhone && <div><span className="text-muted-foreground">Phone:</span> {dealer.contactPhone}</div>}
          </div>

          {/* Directors & shareholders */}
          {(dealer.directors || dealer.shareholders) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {dealer.directors && dealer.directors.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Directors</h3>
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border"><th className="text-left py-1 text-muted-foreground">Name</th><th className="text-left py-1 text-muted-foreground">Role</th><th className="text-left py-1 text-muted-foreground">Appointed</th></tr></thead>
                    <tbody>
                      {dealer.directors.map((d, i) => (
                        <tr key={i} className="border-b border-border/50"><td className="py-1">{d.name}</td><td className="py-1">{d.role}</td><td className="py-1">{fmtDate(d.appointedDate)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {dealer.shareholders && dealer.shareholders.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Shareholders / PSCs</h3>
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border"><th className="text-left py-1 text-muted-foreground">Name</th><th className="text-left py-1 text-muted-foreground">Shareholding</th></tr></thead>
                    <tbody>
                      {dealer.shareholders.map((s, i) => (
                        <tr key={i} className="border-b border-border/50"><td className="py-1">{s.name}</td><td className="py-1">{s.shareholding}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Executive summary */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">Executive Summary</h2>
            <p className="text-sm leading-relaxed">{dealer.notes || "No executive summary available for this dealer."}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm font-semibold">Overall Conclusion:</span>
              <Badge className={`border ${RAG_BG[dealer.ragStatus]}`}>
                {dealer.ragStatus === "Green" ? "LOW RISK" : dealer.ragStatus === "Amber" ? "MEDIUM RISK" : "HIGH RISK"} — {dealer.ragStatus.toUpperCase()}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Section results */}
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Section Results</h2>
            {(dealer.sections ?? []).map((s, sIdx) => {
              const controlAreas = getControlAreasForSection(s.name, s.result, s.notes);
              return (
                <div key={s.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">
                      <span className="text-muted-foreground mr-2">{sIdx + 1}.</span>{s.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${RESULT_STYLE[s.result].bg}`}>
                        {RESULT_STYLE[s.result].icon} {s.result}
                      </span>
                      <span className="text-xs text-muted-foreground">Score: <strong>{s.score}</strong>/100</span>
                      <span className="text-[10px] text-muted-foreground">
                        {s.score >= 75
                          ? <span className="text-rag-green">+{s.score - 75}</span>
                          : <span className="text-rag-amber">−{75 - s.score}</span>
                        }
                      </span>
                      <Badge variant="outline" className={`text-[10px] ${RAG_BG[s.ragStatus]}`}>{s.ragStatus}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic pl-5">"{s.notes}"</p>

                  {controlAreas.length > 0 && (
                    <div className="overflow-x-auto rounded border border-border ml-5">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/50 border-b border-border">
                            <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Control Area</th>
                            <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Objective</th>
                            <th className="px-2 py-1.5 text-center font-semibold text-muted-foreground">Result</th>
                            <th className="px-2 py-1.5 text-center font-semibold text-muted-foreground">Risk</th>
                            <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {controlAreas.map((ca, idx) => (
                            <tr key={idx} className="border-b border-border/50 last:border-0">
                              <td className="px-2 py-1.5 font-medium">{ca.controlArea}</td>
                              <td className="px-2 py-1.5 text-muted-foreground">{ca.objective}</td>
                              <td className="px-2 py-1.5 text-center">
                                <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${RESULT_STYLE[ca.result].bg}`}>
                                  {ca.result === "Pass" ? "✅" : ca.result === "Pending" ? "⚠️" : "❌"} {ca.result}
                                </span>
                              </td>
                              <td className={`px-2 py-1.5 text-center text-[10px] font-semibold ${ca.riskRating === "High" ? "text-rag-red" : ca.riskRating === "Medium" ? "text-rag-amber" : "text-rag-green"}`}>
                                {ca.riskRating}
                              </td>
                              <td className="px-2 py-1.5 text-muted-foreground">{ca.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Key actions */}
          {dealer.keyActions && dealer.keyActions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Key Actions Raised</h2>
              <table className="w-full text-xs border border-border rounded">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">#</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Action</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Due Date</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dealer.keyActions.map((a, i) => (
                    <tr key={a.id} className="border-b border-border/50 last:border-0">
                      <td className="px-2 py-1.5 font-mono">{i + 1}</td>
                      <td className="px-2 py-1.5">{a.description}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap">{fmtDate(a.dueDate)}</td>
                      <td className="px-2 py-1.5">
                        <Badge variant="outline" className={`text-[10px] ${a.status === "Open" ? "text-rag-amber" : a.status === "In Progress" ? "text-secondary" : "text-rag-green"}`}>
                          {a.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Separator />

          {/* Audit history */}
          {dealer.auditHistory && dealer.auditHistory.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Audit History</h2>
              <table className="w-full text-xs border border-border rounded">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Date</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-muted-foreground">Score</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-muted-foreground">RAG</th>
                    <th className="px-2 py-1.5 text-center font-semibold text-muted-foreground">Trend</th>
                    <th className="px-2 py-1.5 text-left font-semibold text-muted-foreground">Audited By</th>
                  </tr>
                </thead>
                <tbody>
                  {dealer.auditHistory.map((h) => (
                    <tr key={h.id} className="border-b border-border/50 last:border-0">
                      <td className="px-2 py-1.5">{fmtDate(h.date)}</td>
                      <td className="px-2 py-1.5 text-center font-bold">{h.overallScore}</td>
                      <td className="px-2 py-1.5 text-center"><Badge variant="outline" className={`text-[10px] ${RAG_BG[h.ragStatus]}`}>{h.ragStatus}</Badge></td>
                      <td className="px-2 py-1.5 text-center">{h.change === "up" ? "↑" : h.change === "down" ? "↓" : "→"}</td>
                      <td className="px-2 py-1.5">The Compliance Guys</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="border-t-2 border-primary pt-4 mt-8 text-center space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">End of Report</p>
            <p className="text-[10px] text-muted-foreground">
              This report has been prepared by The Compliance Guys Ltd for the exclusive use of the commissioning lender.
              It must not be shared, reproduced, or distributed without prior written consent.
            </p>
            <p className="text-[10px] text-muted-foreground">
              The Compliance Guys Ltd · Registered in England & Wales · Company No. 12345678 · compliance@thecomplianceguys.co.uk
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
