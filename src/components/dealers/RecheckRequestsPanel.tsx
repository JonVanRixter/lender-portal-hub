import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRecheck } from "@/contexts/RecheckContext";
import {
  Clock, CheckCircle2, AlertCircle, Send, Zap,
  User, CalendarClock, MessageSquare,
} from "lucide-react";
import type { RecheckRequest, RecheckStatus, RecheckPriority } from "@/data/recheckRequests";

const STATUS_STYLE: Record<RecheckStatus, { class: string; icon: React.ReactNode }> = {
  Submitted: { class: "bg-secondary/15 text-secondary border-secondary/30", icon: <Send className="h-3 w-3" /> },
  "In Progress": { class: "bg-rag-amber/15 text-rag-amber border-rag-amber/30", icon: <Clock className="h-3 w-3" /> },
  Completed: { class: "bg-rag-green/15 text-rag-green border-rag-green/30", icon: <CheckCircle2 className="h-3 w-3" /> },
  Escalated: { class: "bg-rag-red/15 text-rag-red border-rag-red/30", icon: <AlertCircle className="h-3 w-3" /> },
  Dismissed: { class: "bg-muted text-muted-foreground border-border", icon: <AlertCircle className="h-3 w-3" /> },
};

const PRIORITY_STYLE: Record<RecheckPriority, string> = {
  Normal: "bg-muted text-muted-foreground",
  High: "bg-rag-amber/15 text-rag-amber",
  Critical: "bg-rag-red/15 text-rag-red",
};

const TYPE_STYLE: Record<string, { class: string; icon: React.ReactNode }> = {
  "Lender Re-Check": { class: "bg-primary/10 text-primary", icon: <Send className="h-3 w-3" /> },
  "Fail Chase": { class: "bg-rag-red/10 text-rag-red", icon: <Zap className="h-3 w-3" /> },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function SlaIndicator({ deadline, status }: { deadline: string; status: RecheckStatus }) {
  if (status === "Completed") return <span className="text-rag-green text-[10px]">✅ Resolved</span>;
  const now = new Date();
  const sla = new Date(deadline);
  const hoursLeft = (sla.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursLeft < 0) return <span className="text-rag-red text-[10px] font-semibold">⚠️ SLA Breached</span>;
  if (hoursLeft < 8) return <span className="text-rag-amber text-[10px]">⏳ {Math.round(hoursLeft)}h remaining</span>;
  return <span className="text-muted-foreground text-[10px]">Due: {fmtDateTime(deadline)}</span>;
}

export function RecheckRequestsPanel({ dealerId }: { dealerId: string }) {
  const { getRequestsForDealer } = useRecheck();
  const requests = useMemo(() => getRequestsForDealer(dealerId), [dealerId, getRequestsForDealer]);

  if (requests.length === 0) return null;

  const active = requests.filter((r) => r.status !== "Completed");
  const completed = requests.filter((r) => r.status === "Completed");

  return (
    <div className="space-y-3">
      <div className="border-t border-border pt-4 space-y-1">
        <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          Re-Check Requests
          {active.length > 0 && (
            <Badge variant="secondary" className="text-[10px] h-5">{active.length} active</Badge>
          )}
        </h3>
        <p className="text-xs text-muted-foreground">
          Requests raised by the lender for TCG to re-verify specific controls, plus auto-triggered chases for failed controls.
        </p>
      </div>

      {requests.map((r) => (
        <Card key={r.id} className={`border-border ${r.status === "Completed" ? "opacity-75" : ""}`}>
          <CardContent className="p-4 space-y-3">
            {/* Header row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${TYPE_STYLE[r.requestType]?.class}`}>
                {TYPE_STYLE[r.requestType]?.icon} {r.requestType}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[r.status].class}`}>
                {STATUS_STYLE[r.status].icon} {r.status}
              </span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLE[r.priority]}`}>
                {r.priority}
              </span>
              <span className="ml-auto">
                <SlaIndicator deadline={r.slaDeadline} status={r.status} />
              </span>
            </div>

            {/* Control info */}
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
              <span className="text-muted-foreground">Section: <strong className="text-foreground">{r.sectionName}</strong></span>
              <span className="text-muted-foreground">Control: <strong className="text-foreground">{r.controlName}</strong></span>
              <span className="text-muted-foreground">Result: <strong className={r.currentResult === "Pass" ? "text-rag-green" : r.currentResult === "Fail" ? "text-rag-red" : "text-rag-amber"}>{r.currentResult}</strong></span>
            </div>

            {/* Reason */}
            <p className="text-xs text-foreground leading-relaxed">{r.reasonDetail}</p>

            {/* TCG assignment */}
            {r.tcgAssignedTo && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Assigned to: <strong className="text-foreground">{r.tcgAssignedTo}</strong></span>
                {r.tcgPickedUpDate && (
                  <>
                    <CalendarClock className="h-3 w-3 ml-2" />
                    <span>Picked up: {fmtDateTime(r.tcgPickedUpDate)}</span>
                  </>
                )}
              </div>
            )}

            {/* TCG notes */}
            {r.tcgNotes && (
              <div className="rounded-md border border-border bg-muted/30 p-2.5 text-xs flex items-start gap-2">
                <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground mb-0.5">TCG Notes</p>
                  <p className="text-muted-foreground">{r.tcgNotes}</p>
                </div>
              </div>
            )}

            {/* TCG outcome */}
            {r.tcgOutcome && (
              <div className="rounded-md border border-rag-green/30 bg-rag-green/5 p-2.5 text-xs">
                <p className="font-medium text-rag-green mb-0.5">✅ Outcome: {r.tcgOutcome}</p>
                <p className="text-muted-foreground">Completed: {r.tcgCompletedDate ? fmtDateTime(r.tcgCompletedDate) : "—"}</p>
              </div>
            )}

            {/* History timeline */}
            {r.history.length > 0 && (
              <div className="border-t border-border pt-2 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Activity Log</p>
                {r.history.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-[10px] text-muted-foreground">
                    <span className="shrink-0 w-28">{fmtDateTime(h.date)}</span>
                    <span className={`shrink-0 rounded px-1 py-0.5 font-medium ${h.platform === "TCG" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary-foreground"}`}>
                      {h.platform}
                    </span>
                    <span className="text-foreground">{h.action}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Requested by + date */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
              <span>Requested by: {r.requestedBy} · {fmtDate(r.requestedDate)}</span>
              <span className="font-mono">{r.id}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
