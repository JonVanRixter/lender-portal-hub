import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, ChevronLeft, ChevronRight, ShieldBan } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type EntityType = "Dealer" | "Director";
type DndReason = "Failed checks" | "Fraudulent activity" | "Non-payment" | "Other";

interface DndEntry {
  id: string;
  entityName: string;
  entityType: EntityType;
  companiesHouseNumber: string;
  reason: DndReason;
  notes: string;
  dateAdded: string;
  addedBy: string;
}

const initialEntries: DndEntry[] = [
  { id: "dnd1", entityName: "Apex Deals Ltd", entityType: "Dealer", companiesHouseNumber: "12345678", reason: "Fraudulent activity", notes: "Falsified MOT records discovered during audit.", dateAdded: "2025-11-15T10:00:00Z", addedBy: "Sarah Mitchell" },
  { id: "dnd2", entityName: "Mark Reynolds", entityType: "Director", companiesHouseNumber: "", reason: "Failed checks", notes: "DBS check returned disqualified director status.", dateAdded: "2025-12-02T14:00:00Z", addedBy: "James Hart" },
  { id: "dnd3", entityName: "FastTrack Motors", entityType: "Dealer", companiesHouseNumber: "87654321", reason: "Non-payment", notes: "Outstanding balance of £42,000 unpaid for 90+ days.", dateAdded: "2026-01-08T09:30:00Z", addedBy: "Sarah Mitchell" },
  { id: "dnd4", entityName: "Linda Osei", entityType: "Director", companiesHouseNumber: "", reason: "Fraudulent activity", notes: "Connected to fraudulent finance applications at two dealerships.", dateAdded: "2026-01-20T16:00:00Z", addedBy: "Emily Chen" },
  { id: "dnd5", entityName: "BrightStar Autos", entityType: "Dealer", companiesHouseNumber: "11223344", reason: "Failed checks", notes: "FCA authorisation revoked – no longer permitted to trade.", dateAdded: "2026-02-05T11:00:00Z", addedBy: "James Hart" },
  { id: "dnd6", entityName: "Roger Pemberton", entityType: "Director", companiesHouseNumber: "", reason: "Other", notes: "Subject of ongoing SFO investigation.", dateAdded: "2026-02-10T08:30:00Z", addedBy: "Sarah Mitchell" },
  { id: "dnd7", entityName: "Valley View Cars", entityType: "Dealer", companiesHouseNumber: "99887766", reason: "Non-payment", notes: "Repeated failed direct debits; no response to collections.", dateAdded: "2026-02-18T13:00:00Z", addedBy: "David Okonkwo" },
];

const REASON_PILL: Record<DndReason, string> = {
  "Failed checks": "bg-rag-amber/15 text-rag-amber",
  "Fraudulent activity": "bg-rag-red/15 text-rag-red",
  "Non-payment": "bg-rag-red/15 text-rag-red",
  Other: "bg-muted text-muted-foreground",
};

const TYPE_PILL: Record<EntityType, string> = {
  Dealer: "bg-primary/15 text-primary",
  Director: "bg-rag-amber/15 text-rag-amber",
};

const PAGE_SIZE = 6;

export default function DoNotDeal() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<DndEntry[]>(initialEntries);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [newType, setNewType] = useState<EntityType>("Dealer");
  const [newName, setNewName] = useState("");
  const [newCH, setNewCH] = useState("");
  const [newReason, setNewReason] = useState<DndReason | "">("");
  const [newNotes, setNewNotes] = useState("");

  const filtered = search
    ? entries.filter((e) =>
        e.entityName.toLowerCase().includes(search.toLowerCase()) ||
        e.reason.toLowerCase().includes(search.toLowerCase())
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
    const entry: DndEntry = {
      id: `dnd-${Date.now()}`,
      entityName: newName,
      entityType: newType,
      companiesHouseNumber: newCH,
      reason: newReason as DndReason,
      notes: newNotes,
      dateAdded: new Date().toISOString(),
      addedBy: "Test User",
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
          <p className="text-sm text-muted-foreground">Restricted entities and banned dealers</p>
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
          placeholder="Search by name or reason…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="pl-9 h-9"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entity Name</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reason</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Date Added</th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden lg:table-cell">Added By</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-12 text-center">
                  <ShieldBan className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-muted-foreground">No entries found.</p>
                </td>
              </tr>
            ) : (
              paginated.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors group">
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-foreground">{e.entityName}</p>
                    {e.companiesHouseNumber && (
                      <p className="text-xs text-muted-foreground">CH: {e.companiesHouseNumber}</p>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${TYPE_PILL[e.entityType]}`}>
                      {e.entityType}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${REASON_PILL[e.reason]}`}>
                      {e.reason}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-xs truncate hidden sm:block">{e.notes}</p>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap hidden md:table-cell">{fmtDate(e.dateAdded)}</td>
                  <td className="px-3 py-2.5 text-muted-foreground hidden lg:table-cell">{e.addedBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
                <Select value={newType} onValueChange={(v) => setNewType(v as EntityType)}>
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
                    <SelectItem value="Failed checks">Failed checks</SelectItem>
                    <SelectItem value="Fraudulent activity">Fraudulent activity</SelectItem>
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
