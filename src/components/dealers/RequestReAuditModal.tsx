import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const REASONS = [
  "Concerns about dealer compliance",
  "Score decline observed",
  "Customer complaint escalation",
  "Regulatory change — re-assessment required",
  "Scheduled periodic review",
  "Other",
];

interface RequestReAuditModalProps {
  open: boolean;
  onClose: () => void;
  dealerName: string;
}

export function RequestReAuditModal({ open, onClose, dealerName }: RequestReAuditModalProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [justification, setJustification] = useState("");

  const handleSubmit = () => {
    toast({
      title: "Re-audit request submitted",
      description: "The Compliance Guys will be in touch to confirm.",
    });
    setReason("");
    setJustification("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Request Re-Audit — {dealerName}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Submit a request to The Compliance Guys to conduct a new audit for this dealer.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Reason for request</label>
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
            <label className="text-sm font-medium text-foreground">Justification / additional detail</label>
            <Textarea
              placeholder="Provide any relevant context for The Compliance Guys…"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div className="rounded-md border border-rag-amber/30 bg-rag-amber/10 p-3 text-sm flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-rag-amber mt-0.5 shrink-0" />
            <span className="text-foreground">
              Re-audit requests are subject to your service agreement with The Compliance Guys. Additional charges may apply.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!reason}
              className="bg-primary hover:bg-primary/90"
            >
              Submit Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
