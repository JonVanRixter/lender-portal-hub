import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { computeDocStatus } from "@/lib/docStatus";
import { dealers } from "@/data/mockData";
import type { DocCategory, DealerDocument } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const CATEGORIES: DocCategory[] = ["DBS", "Training", "Complaints", "Other"];

interface Props {
  onUpload: (doc: DealerDocument) => void;
}

export function UploadDocumentModal({ onUpload }: Props) {
  const [open, setOpen] = useState(false);
  const [dealerId, setDealerId] = useState("");
  const [category, setCategory] = useState<DocCategory | "">("");
  const [fileName, setFileName] = useState("");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);

  const reset = () => {
    setDealerId("");
    setCategory("");
    setFileName("");
    setExpiryDate(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerId || !category || !fileName) return;

    const now = new Date().toISOString();
    const expiry = expiryDate ? expiryDate.toISOString() : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const doc: DealerDocument = {
      id: `doc-${Date.now()}`,
      name: fileName,
      dealerId,
      category: category as DocCategory,
      uploadDate: now,
      expiryDate: expiry,
      status: computeDocStatus(expiry),
    };

    onUpload(doc);
    reset();
    setOpen(false);
  };

  const canSubmit = !!dealerId && !!category && !!fileName;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Dealer select */}
          <div className="space-y-2">
            <Label>Dealer</Label>
            <Select value={dealerId} onValueChange={setDealerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select dealer" />
              </SelectTrigger>
              <SelectContent>
                {dealers.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category select */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as DocCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File input */}
          <div className="space-y-2">
            <Label>File</Label>
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setFileName(file ? file.name : "");
              }}
              className="cursor-pointer"
            />
          </div>

          {/* Expiry date */}
          <div className="space-y-2">
            <Label>Expiry Date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expiryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiryDate ? format(expiryDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={setExpiryDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!canSubmit}>Upload</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
