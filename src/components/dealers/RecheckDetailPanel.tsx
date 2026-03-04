import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useRecheck } from "@/contexts/RecheckContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Clock, CheckCircle2, AlertCircle, Send, Zap,
  User, CalendarClock, MessageSquare, ArrowUpCircle, XCircle,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { RecheckRequest, RecheckStatus, RecheckPriority } from "@/data/recheckRequests";

const STATUS_STYLE: Record<RecheckStatus, { class: string; icon: React.ReactNode; label: string }> = {
  Submitted: { class: "bg-secondary/15 text-secondary border-secondary/30", icon: <Send className="h-3 w-3" />, label: "Submitted — awaiting TCG pickup" },
  "In Progress": { class: "bg-rag-amber/15 text-rag-amber border-rag-amber/30", icon: <Clock className="h-3 w-3" />, label: "In Progress — TCG investigating" },
  Completed: { class: "bg-rag-green/15 text-rag-green border-rag-green/30", icon: <CheckCircle2 className="h-3 w-3" />, label: "Completed" },
  Escalated: { class: "bg-rag-red/15 text-rag-red border-rag-red/30", icon: <AlertCircle className="h-3 w-3" />, label: "Escalated" },
  Dismissed: { class: "bg-muted text-muted-foreground border-border", icon: <XCircle className="h-3 w-3" />, label: "Dismissed" },
};

const PRIORITY_STYLE: Record<RecheckPriority, { class: string; emoji: string }> = {
  Normal: { class: "bg-muted text-muted-foreground", emoji: "🟢" },
  High: { class: "bg-rag-amber/15 text-rag-amber", emoji: "🟠" },
  Critical: { class: "bg-rag-red/15 text-rag-red", emoji: "🔴" },
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

interface RecheckDetailPanelProps {
  request: RecheckRequest;
}

export function RecheckDetailPanel({ request: r }: RecheckDetailPanelProps) {
  const { addLenderNote, escalatePriority, dismissRequest } = useRecheck();
  const { user } = useAuth();
  const { toast } = useToast();
  const [noteText, setNoteText] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showDismissDialog, setShowDismissDialog] = useState(false);
  const [dismissReason, setDismissReason] = useState("");

  const canEscalate = r.priority !== "Critical" && r.status !== "Completed";
  const isFailChase = r.requestType === "Fail Chase";
  const nextPriority = r.priority === "Normal" ? "High" : "Critical";

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addLenderNote(r.id, noteText.trim(), user?.name ?? "Unknown");
    toast({ title: "📝 Note added", description: "Your note is now visible to TCG." });
    setNoteText("");
    setShowNoteInput(false);
  };

  const handleEscalate = () => {
    escalatePriority(r.id, user?.name ?? "Unknown");
    toast({ title: "⚠️ Priority escalated", description: `Priority changed to ${nextPriority}. TCG will be notified.` });
  };

  const handleDismiss = () => {
    if (isFailChase && !dismissReason.trim()) return;
    dismissRequest(r.id, dismissReason.trim() || "No longer required", user?.name ?? "Unknown");
    toast({ title: "Request dismissed", description: "The control result will remain unchanged." });
    setShowDismissDialog(false);
    setDismissReason("");
  };

  return (
    <div className="rounded-md border border-border bg-card p-4 space-y-3 text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Re-Check Request Detail</span>
          <span className="font-mono text-[10px] text-muted-foreground">Ref: {r.id.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${TYPE_STYLE[r.requestType]?.class}`}>
            {TYPE_STYLE[r.requestType]?.icon} {r.requestType}
          </span>
        </div>
      </div>

      {/* Status section */}
      <div className="rounded-md border border-border bg-muted/20 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[r.status].class}`}>
            {STATUS_STYLE[r.status].icon} {STATUS_STYLE[r.status].label}
          </span>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLE[r.priority].class}`}>
            {PRIORITY_STYLE[r.priority].emoji} {r.priority}
          </span>
          <span className="ml-auto">
            <SlaIndicator deadline={r.slaDeadline} status={r.status} />
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
          <div>
            <p className="text-muted-foreground">Raised</p>
            <p className="text-foreground font-medium">{fmtDateTime(r.requestedDate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">SLA Deadline</p>
            <p className="text-foreground font-medium">{fmtDateTime(r.slaDeadline)}</p>
          </div>
          {r.tcgAssignedTo && (
            <div>
              <p className="text-muted-foreground">Assigned to</p>
              <p className="text-foreground font-medium flex items-center gap-1">
                <User className="h-2.5 w-2.5" /> {r.tcgAssignedTo}
              </p>
            </div>
          )}
          {r.tcgPickedUpDate && (
            <div>
              <p className="text-muted-foreground">Picked up</p>
              <p className="text-foreground font-medium">{fmtDateTime(r.tcgPickedUpDate)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reason */}
      <div>
        <p className="text-muted-foreground mb-0.5">Reason</p>
        <p className="text-foreground leading-relaxed">{r.reasonDetail}</p>
      </div>

      {/* TCG notes */}
      {r.tcgNotes && (
        <div className="rounded-md border border-border bg-muted/30 p-2.5 flex items-start gap-2">
          <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground mb-0.5">TCG Updates</p>
            <p className="text-muted-foreground">"{r.tcgNotes}"</p>
            {r.tcgAssignedTo && (
              <p className="text-muted-foreground mt-0.5">— {r.tcgAssignedTo}</p>
            )}
          </div>
        </div>
      )}

      {/* TCG outcome */}
      {r.tcgOutcome && (
        <div className="rounded-md border border-rag-green/30 bg-rag-green/5 p-2.5">
          <p className="font-medium text-rag-green mb-0.5">✅ Outcome: {r.tcgOutcome}</p>
          <p className="text-muted-foreground">Completed: {r.tcgCompletedDate ? fmtDateTime(r.tcgCompletedDate) : "—"}</p>
        </div>
      )}

      {/* Timeline */}
      {r.history.length > 0 && (
        <div className="border-t border-border pt-2 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Timeline</p>
          {r.history.map((h, i) => (
            <div key={i} className="flex items-start gap-2 text-[10px] text-muted-foreground">
              <span className="shrink-0 w-28 tabular-nums">{fmtDateTime(h.date)}</span>
              <span className={`shrink-0 rounded px-1 py-0.5 font-medium ${h.platform === "TCG" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary-foreground"}`}>
                {h.platform}
              </span>
              <span className="text-foreground">{h.action}</span>
            </div>
          ))}
        </div>
      )}

      {/* Lender actions */}
      {r.status !== "Completed" && r.status !== "Dismissed" && (
        <div className="border-t border-border pt-3 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Lender Actions</p>

          {/* Add note */}
          {showNoteInput ? (
            <div className="space-y-1.5">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note visible to TCG…"
                className="min-h-[60px] text-xs"
              />
              <div className="flex gap-1.5">
                <Button size="sm" className="h-6 text-[10px] px-2" onClick={handleAddNote} disabled={!noteText.trim()}>
                  Save Note
                </Button>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => { setShowNoteInput(false); setNoteText(""); }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[10px] px-2 gap-1"
                onClick={() => setShowNoteInput(true)}
              >
                <MessageSquare className="h-3 w-3" /> Add Lender Note
              </Button>
              {canEscalate && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[10px] px-2 gap-1 text-rag-amber border-rag-amber/30 hover:bg-rag-amber/10"
                  onClick={handleEscalate}
                >
                  <ArrowUpCircle className="h-3 w-3" /> Escalate to {nextPriority}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[10px] px-2 gap-1 text-muted-foreground"
                onClick={() => setShowDismissDialog(true)}
              >
                <XCircle className="h-3 w-3" /> Close / Dismiss
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Dismiss confirmation */}
      <AlertDialog open={showDismissDialog} onOpenChange={setShowDismissDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dismiss this request?</AlertDialogTitle>
            <AlertDialogDescription>
              {isFailChase
                ? "Dismissing a fail chase means the failed control will remain unresolved. A reason is required."
                : "The control result will remain unchanged."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {isFailChase && (
            <Textarea
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              placeholder="Reason for dismissing this fail chase (required)…"
              className="min-h-[60px]"
            />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDismiss}
              disabled={isFailChase && !dismissReason.trim()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Dismiss Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border">
        <span>Requested by: {r.requestedBy} · {fmtDate(r.requestedDate)}</span>
        <span className="font-mono">{r.id}</span>
      </div>
    </div>
  );
}
