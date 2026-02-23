import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, ChevronLeft, ChevronRight, ShieldBan, AlertTriangle } from "lucide-react";
import { doNotDealEntries as initialEntries } from "@/data/mockData";
import type { DoNotDealEntry, DndEntityType, DndReason } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const REASON_PILL: Record<DndReason, string> = {
  "Fraudulent activity": "bg-rag-red/15 text-rag-red",
  "Failed compliance checks": "bg-rag-amber/15 text-rag-amber",
  "Non-payment": "bg-rag-red/15 text-rag-red",
  Other: "bg-muted text-muted-foreground",
};

const TYPE_PILL: Record<DndEntityType, string> = {
  Dealer: "bg-primary/15 text-primary",
  Director: "bg-rag-amber/15 text-rag-amber",
};

const PAGE_SIZE = 5;

export default function DoNotDeal() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<DoNotDealEntry[]>(initialEntries);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState<DndEntityType>("Dealer");
  const [newName, setNewName] = useState("");
  const [newCH, setNewCH] = useState("");
  const [newReason, setNewReason] = useState<DndReason | "">("");
  const [newNotes, setNewNotes] = useState("");

  const filtered = search
    ? entries.filter((e) =>
        e.entityName.toLowerCase().includes(search.toLowerCase()) ||
        e.reason.toLowerCase().includes(search.toLowerCase()) ||
        e.notes.toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const resetForm = () => {
    setNewType("Dealer");
    setNewName("");
    setNewCH("");
    setNewReason("");
    setNewNotes("");
  };

  const handleAdd = () => {
    if (!newName || !newReason || !newNotes) return;
    const entry: DoNotDealEntry = {
      id: `dnd-${Date.now()}`,
      entityName: newName,
      entityType: newType,
      companiesHouseNumber: newCH || null,
      reason: newReason as DndReason,
      notes: newNotes,
      dateAdded: new Date().toISOString().slice(0, 10),
      addedBy: "Test User",
      failedChecks: [],
    };
    setEntries((prev) => [entry, ...prev]);
    setShowAdd(false);
    resetForm();
    setPage(0);
    toast({ title: "Entity Added", description: `${newName} added to Do Not Deal list.` });
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const canSubmit = !!newName && !!newReason && !!newNotes;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Do Not Deal</h1>
          <p className="text-sm text-muted-foreground">Restricted entities and banned dealers/directors</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" />
          Add to Do Not Deal List
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, reason or notes…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-9 h-9"
        />
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {paginated.length === 0 ? (
          <div className="rounded-md border border-border bg-card p-12 text-center">
            <ShieldBan className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-muted-foreground">No entries found.</p>
          </div>
        ) : (
          paginated.map((e) => (
            <div
              key={e.id}
              className="rounded-md border border-border bg-card hover:border-rag-red/30 transition-colors cursor-pointer"
              onClick={() => setExpanded(expanded === e.id ? null : e.id)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rag-red/10">
                    <AlertTriangle className="h-4 w-4 text-rag-red" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{e.entityName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_PILL[e.entityType]}`}>
                        {e.entityType}
                      </span>
                      {e.companiesHouseNumber && (
                        <span className="text-xs text-muted-foreground">CH: {e.companiesHouseNumber}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${REASON_PILL[e.reason]}`}>
                    {e.reason}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(e.dateAdded)}</span>
                </div>
              </div>

              {expanded === e.id && (
                <div className="border-t border-border px-4 py-3 space-y-3 bg-muted/30">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm text-foreground leading-relaxed">{e.notes}</p>
                  </div>
                  {e.failedChecks.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Failed Checks</p>
                      <div className="flex flex-wrap gap-1.5">
                        {e.failedChecks.map((c) => (
                          <Badge key={c} variant="outline" className="text-xs border-rag-red/30 text-rag-red">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Added by: <span className="text-foreground font-medium">{e.addedBy}</span></span>
                    <span>Date: {fmtDate(e.dateAdded)}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{filtered.length} entr{filtered.length !== 1 ? "ies" : "y"}</p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">{page + 1} / {totalPages}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add to DND modal */}
      <Dialog open={showAdd} onOpenChange={(v) => { setShowAdd(v); if (!v) resetForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add to Do Not Deal List</DialogTitle>
            <DialogDescription>Flag an entity as restricted. This will be visible to all portal users.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Entity Type</Label>
                <Select value={newType} onValueChange={(v) => setNewType(v as DndEntityType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dealer">Dealer</SelectItem>
                    <SelectItem value="Director">Director</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="entity-name">Entity Name</Label>
                <Input id="entity-name" placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ch-number">Companies House Number (optional)</Label>
                <Input id="ch-number" placeholder="e.g. 12345678" value={newCH} onChange={(e) => setNewCH(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Select value={newReason} onValueChange={(v) => setNewReason(v as DndReason)}>
                  <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fraudulent activity">Fraudulent activity</SelectItem>
                    <SelectItem value="Failed compliance checks">Failed compliance checks</SelectItem>
                    <SelectItem value="Non-payment">Non-payment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dnd-notes">Notes (required)</Label>
              <Textarea
                id="dnd-notes"
                placeholder="Provide details about why this entity is being added…"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => { setShowAdd(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleAdd} disabled={!canSubmit}>Add Entity</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
