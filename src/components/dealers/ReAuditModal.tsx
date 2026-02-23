import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle2, Info, ArrowLeft, ArrowRight } from "lucide-react";
import { useDealers } from "@/contexts/DealersContext";
import { useAlerts } from "@/contexts/AlertsContext";
import { useToast } from "@/hooks/use-toast";
import type { Dealer, DealerSection, SectionResult, RagStatus } from "@/types";

const RAG_PILL: Record<RagStatus, string> = {
  Green: "bg-rag-green/15 text-rag-green border-rag-green/30",
  Amber: "bg-rag-amber/15 text-rag-amber border-rag-amber/30",
  Red: "bg-rag-red/15 text-rag-red border-rag-red/30",
};

const RESULT_PILL: Record<SectionResult, string> = {
  Pass: "bg-rag-green/15 text-rag-green",
  Pending: "bg-rag-amber/15 text-rag-amber",
  Fail: "bg-rag-red/15 text-rag-red",
};

function computeRag(score: number): RagStatus {
  if (score >= 75) return "Green";
  if (score >= 50) return "Amber";
  return "Red";
}

interface ReAuditModalProps {
  open: boolean;
  onClose: () => void;
  dealer: Dealer;
  breachContext?: { previousScore: number; previousRag: RagStatus } | null;
}

interface EditableSection extends DealerSection {
  originalScore: number;
  originalResult: SectionResult;
  originalNotes: string;
}

export function ReAuditModal({ open, onClose, dealer, breachContext }: ReAuditModalProps) {
  const { updateAudit } = useDealers();
  const { addAlert } = useAlerts();
  const { toast } = useToast();

  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [sections, setSections] = useState<EditableSection[]>(() =>
    (dealer.sections ?? []).map((s) => ({
      ...s,
      originalScore: s.score,
      originalResult: s.result,
      originalNotes: s.notes,
    }))
  );

  // Reset when dealer changes or modal opens
  const resetState = () => {
    setStage(1);
    setSections(
      (dealer.sections ?? []).map((s) => ({
        ...s,
        originalScore: s.score,
        originalResult: s.result,
        originalNotes: s.notes,
      }))
    );
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const updateSection = (id: string, field: keyof EditableSection, value: string | number) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const newScore = useMemo(
    () => Math.round(sections.reduce((sum, s) => sum + s.score, 0) / (sections.length || 1)),
    [sections]
  );
  const newRag = computeRag(newScore);
  const oldScore = dealer.overallScore;
  const oldRag = dealer.ragStatus;

  const RAG_ORDER: Record<RagStatus, number> = { Green: 0, Amber: 1, Red: 2 };
  const ragWorsened = RAG_ORDER[newRag] > RAG_ORDER[oldRag];
  const ragImproved = RAG_ORDER[newRag] < RAG_ORDER[oldRag];

  const changedSections = sections.filter(
    (s) => s.score !== s.originalScore || s.result !== s.originalResult || s.notes !== s.originalNotes
  );

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const handleConfirm = () => {
    // Build clean sections
    const cleanSections: DealerSection[] = sections.map((s) => ({
      id: s.id,
      name: s.name,
      score: s.score,
      ragStatus: computeRag(s.score),
      result: s.result,
      notes: s.notes,
    }));

    const result = updateAudit({
      dealerId: dealer.id,
      sections: cleanSections,
      initiatedBy: "Sarah Jenkins",
    });

    // Generate threshold breach alert if worsened
    if (result.ragWorsened) {
      addAlert({
        id: `al-${Date.now()}`,
        type: "Threshold Breach",
        dealerId: dealer.id,
        severity: "High",
        message: `${dealer.tradingName} moved from ${result.oldRag} (${result.oldScore}) to ${result.newRag} (${result.newScore}) following audit update on 23 Feb 2026.`,
        date: "2026-02-23",
        status: "Pending",
      });
    }

    // Toast
    if (result.ragWorsened) {
      toast({
        title: "⚠️ Threshold Breach",
        description: `Audit updated — threshold breach alert generated for ${dealer.tradingName}.`,
        variant: "destructive",
      });
    } else if (result.ragImproved) {
      toast({
        title: "✅ Audit Updated",
        description: `${dealer.tradingName} improved to ${result.newRag}.`,
      });
    } else {
      toast({
        title: "ℹ️ Audit Updated",
        description: "Score revised, RAG status unchanged.",
      });
    }

    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Update Audit — {dealer.tradingName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Current overall score: {oldScore}{" "}
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${RAG_PILL[oldRag]}`}>{oldRag}</span>
            {" "}— Last audited {fmtDate(dealer.lastAuditDate)}
          </p>
        </DialogHeader>

        {/* Breach context banner */}
        {breachContext && (
          <div className="rounded-md border border-rag-amber/30 bg-rag-amber/10 p-3 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-rag-amber mt-0.5 shrink-0" />
            <span className="text-foreground">
              This re-audit was triggered by a threshold breach alert. Previous score: {breachContext.previousScore} ({breachContext.previousRag}).
            </span>
          </div>
        )}

        {/* Stage 1: Edit Sections */}
        {stage === 1 && (
          <div className="space-y-3">
            {sections.map((s) => {
              const changed = s.score !== s.originalScore || s.result !== s.originalResult || s.notes !== s.originalNotes;
              return (
                <div key={s.id} className="rounded-md border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{s.name}</span>
                      {changed && (
                        <Badge variant="secondary" className="text-[10px] bg-rag-amber/15 text-rag-amber">Changed</Badge>
                      )}
                    </div>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${RESULT_PILL[s.result]}`}>
                      {s.result}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Result</label>
                      <Select value={s.result} onValueChange={(v) => updateSection(s.id, "result", v)}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pass">Pass</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Fail">Fail</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Score (0–100)</label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={s.score}
                        onChange={(e) => updateSection(s.id, "score", Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Notes</label>
                    <Textarea
                      value={s.notes}
                      onChange={(e) => updateSection(s.id, "notes", e.target.value)}
                      className="text-xs min-h-[60px]"
                    />
                  </div>
                </div>
              );
            })}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={() => setStage(2)} className="gap-1">
                Recalculate Score <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Stage 2: Preview */}
        {stage === 2 && (
          <div className="space-y-4">
            {/* Score comparison */}
            <div className="rounded-md border border-border p-4">
              <div className="flex items-center justify-center gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Previous</p>
                  <p className="text-3xl font-bold text-foreground">{oldScore}</p>
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${RAG_PILL[oldRag]}`}>{oldRag}</span>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase">New</p>
                  <p className="text-3xl font-bold text-foreground">{newScore}</p>
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${RAG_PILL[newRag]}`}>{newRag}</span>
                </div>
              </div>

              <div className="mt-4">
                {ragWorsened && (
                  <div className="flex items-start gap-2 rounded-md bg-rag-red/10 border border-rag-red/30 p-3 text-sm">
                    <AlertTriangle className="h-4 w-4 text-rag-red mt-0.5 shrink-0" />
                    <span className="text-foreground">
                      <strong>WARNING:</strong> This update moves {dealer.tradingName} from {oldRag} to {newRag}. A threshold breach alert will be generated automatically.
                    </span>
                  </div>
                )}
                {ragImproved && (
                  <div className="flex items-start gap-2 rounded-md bg-rag-green/10 border border-rag-green/30 p-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-rag-green mt-0.5 shrink-0" />
                    <span className="text-foreground">
                      Score improved. {dealer.tradingName} moves from {oldRag} to {newRag}.
                    </span>
                  </div>
                )}
                {!ragWorsened && !ragImproved && (
                  <div className="flex items-start gap-2 rounded-md bg-muted p-3 text-sm">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-foreground">
                      RAG status unchanged. Score updated within the same band.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Changed sections table */}
            {changedSections.length > 0 && (
              <div className="rounded-md border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Section</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Prev Score</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">New Score</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Prev Result</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">New Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changedSections.map((s) => (
                      <tr key={s.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 font-medium text-foreground">{s.name}</td>
                        <td className="px-3 py-2 text-center text-muted-foreground">{s.originalScore}</td>
                        <td className="px-3 py-2 text-center font-semibold text-foreground">{s.score}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${RESULT_PILL[s.originalResult]}`}>{s.originalResult}</span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${RESULT_PILL[s.result]}`}>{s.result}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStage(1)} className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back — Edit Sections
              </Button>
              <Button onClick={handleConfirm} className="gap-1">
                Confirm & Save Audit Update
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
