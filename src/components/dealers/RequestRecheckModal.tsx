import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Send, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRecheck } from "@/contexts/RecheckContext";
import { useAuth } from "@/contexts/AuthContext";
import type { RecheckPriority } from "@/data/recheckRequests";

const REASONS = [
  "Score concern — score seems inconsistent with our observations",
  "New information — we have new data that may affect this control",
  "Routine verification — periodic confidence check",
  "Director/personnel change — change in dealer personnel",
  "Customer complaint — complaint received relating to this area",
  "Other",
];

interface RequestRecheckModalProps {
  open: boolean;
  onClose: () => void;
  dealerId: string;
  dealerName: string;
  sectionId: string;
  sectionName: string;
  controlName: string;
  currentResult: "Pass" | "Pending" | "Fail";
  currentScore: number;
  lastCheckedDate: string;
}

export function RequestRecheckModal({
  open,
  onClose,
  dealerId,
  dealerName,
  sectionId,
  sectionName,
  controlName,
  currentResult,
  currentScore,
  lastCheckedDate,
}: RequestRecheckModalProps) {
  const { toast } = useToast();
  const { submitRecheck } = useRecheck();
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [priority, setPriority] = useState<RecheckPriority>("Normal");

  const detailTooShort = detail.trim().length > 0 && detail.trim().length < 30;
  const canSubmit = reason && detail.trim().length >= 30;
  const slaLabel = priority === "High" ? "24-hour SLA" : "48-hour SLA";

  const handleSubmit = () => {
    const now = new Date().toISOString();
    submitRecheck({
      dealerId,
      dealerName,
      lenderId: "l001",
      lenderName: "Apex Motor Finance Ltd",
      sectionId,
      sectionName,
      controlId: `${sectionId}c-${Date.now()}`,
      controlName,
      currentResult,
      currentScore,
      requestType: "Lender Re-Check",
      reason,
      reasonDetail: detail.trim(),
      priority,
      requestedBy: user?.name ?? "Unknown",
      requestedDate: now,
    });
    toast({
      title: "✅ Re-check request submitted",
      description: `TCG will re-verify "${controlName}". ${slaLabel}.`,
    });
    setReason("");
    setDetail("");
    setPriority("Normal");
    onClose();
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Request Re-Check</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Ask The Compliance Guys to re-verify a specific control for this dealer.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Control info */}
          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div>
                <p className="text-muted-foreground">Dealer</p>
                <p className="font-medium text-foreground">{dealerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Section</p>
                <p className="font-medium text-foreground">{sectionName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Control</p>
                <p className="font-medium text-foreground">{controlName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Current Result</p>
                <p className={`font-semibold ${currentResult === "Pass" ? "text-rag-green" : currentResult === "Fail" ? "text-rag-red" : "text-rag-amber"}`}>
                  {currentResult === "Pass" ? "✅" : currentResult === "Fail" ? "❌" : "⚠️"} {currentResult} · Score: {currentScore} / 100
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Last checked</p>
                <p className="font-medium text-foreground">{fmtDate(lastCheckedDate)} by TCG</p>
              </div>
            </div>
          </div>

          {/* Reason dropdown */}
          <div>
            <label className="text-sm font-medium text-foreground">Why are you requesting a re-check? *</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a reason…" />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Detail textarea */}
          <div>
            <label className="text-sm font-medium text-foreground">Additional detail * <span className="text-muted-foreground font-normal">(minimum 30 characters)</span></label>
            <Textarea
              placeholder="Describe what has prompted this re-check request. The more context you provide, the faster TCG can investigate."
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="mt-1 min-h-[100px]"
              rows={4}
            />
            <div className="flex justify-between mt-1">
              {detailTooShort && (
                <p className="text-[10px] text-rag-red">{30 - detail.trim().length} more characters required</p>
              )}
              <p className="text-[10px] text-muted-foreground ml-auto">{detail.trim().length} / 30 min</p>
            </div>
          </div>

          {/* Priority selection */}
          <div>
            <label className="text-sm font-medium text-foreground">Priority</label>
            <div className="flex gap-3 mt-1.5">
              <Button
                type="button"
                variant={priority === "Normal" ? "default" : "outline"}
                size="sm"
                onClick={() => setPriority("Normal")}
                className="flex-1"
              >
                Normal
              </Button>
              <Button
                type="button"
                variant={priority === "High" ? "destructive" : "outline"}
                size="sm"
                onClick={() => setPriority("High")}
                className="flex-1"
              >
                High
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Normal: 48-hour SLA · High: 24-hour SLA
            </p>
          </div>

          {/* Info callout */}
          <div className="rounded-md border border-border bg-muted/30 p-3 text-xs flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-muted-foreground">
              Re-check requests are sent to TCG for investigation. You will receive a notification when TCG has completed their review. Re-checks outside the scheduled cadence may incur additional cost. Pricing TBC.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-primary hover:bg-primary/90 gap-1.5"
            >
              <Send className="h-4 w-4" /> Submit Re-Check Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
