import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRecheck } from "@/contexts/RecheckContext";
import { useAuth } from "@/contexts/AuthContext";

const REASONS = [
  "Score concern",
  "Routine verification",
  "Customer complaint received",
  "Regulatory change — re-assessment required",
  "Director / ownership change",
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
}: RequestRecheckModalProps) {
  const { toast } = useToast();
  const { submitRecheck } = useRecheck();
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");

  const handleSubmit = () => {
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
      reasonDetail: detail,
      priority: "Normal",
      requestedBy: user?.name ?? "Unknown",
      requestedDate: new Date().toISOString(),
    });
    toast({
      title: "✅ Re-check request submitted",
      description: `TCG will re-verify "${controlName}" in the ${sectionName} section.`,
    });
    setReason("");
    setDetail("");
    onClose();
  };

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
          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-1">
            <p className="text-xs text-muted-foreground">Dealer</p>
            <p className="text-sm font-medium text-foreground">{dealerName}</p>
            <div className="flex gap-4 mt-1">
              <div>
                <p className="text-xs text-muted-foreground">Section</p>
                <p className="text-sm text-foreground">{sectionName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Control</p>
                <p className="text-sm text-foreground">{controlName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Result</p>
                <p className={`text-sm font-semibold ${currentResult === "Pass" ? "text-rag-green" : currentResult === "Fail" ? "text-rag-red" : "text-rag-amber"}`}>
                  {currentResult}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Reason for re-check</label>
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

          <div>
            <label className="text-sm font-medium text-foreground">Detail / context for TCG</label>
            <Textarea
              placeholder="Provide relevant context to help TCG investigate…"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="mt-1 min-h-[80px]"
            />
          </div>

          <div className="rounded-md border border-rag-amber/30 bg-rag-amber/10 p-3 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-rag-amber mt-0.5 shrink-0" />
            <span className="text-foreground">
              Re-check requests are sent to The Compliance Guys for investigation. This does not modify the audit result — only TCG can update control outcomes.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!reason}
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
