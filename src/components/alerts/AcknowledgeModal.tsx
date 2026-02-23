import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Alert } from "@/types";

interface Props {
  alert: Alert | null;
  dealerName: string;
  onClose: () => void;
  onConfirm: (alertId: string) => void;
}

export function AcknowledgeModal({ alert, dealerName, onClose, onConfirm }: Props) {
  const [notes, setNotes] = useState("");

  if (!alert) return null;

  const handleConfirm = () => {
    onConfirm(alert.id);
    setNotes("");
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNotes("");
      onClose();
    }
  };

  return (
    <Dialog open={!!alert} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Acknowledge Alert</DialogTitle>
          <DialogDescription>
            Confirm acknowledgement for this alert. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="rounded-md border border-border bg-muted/50 p-3 space-y-1">
            <p className="text-sm font-medium text-foreground">{alert.type}</p>
            <p className="text-xs text-muted-foreground">{dealerName}</p>
            <p className="text-sm text-foreground">{alert.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this acknowledgement…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleConfirm}>Acknowledge</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
