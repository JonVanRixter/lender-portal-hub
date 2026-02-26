import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Eye, X, ArrowLeft } from "lucide-react";
import { dealers, documents as initialDocuments } from "@/data/mockData";
import type { DealerDocument, DocCategory, DocStatus } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadDocumentModal } from "@/components/documents/UploadDocumentModal";

const STATUS_PILL: Record<DocStatus, string> = {
  Valid: "bg-rag-green/15 text-rag-green",
  "Expiring Soon": "bg-rag-amber/15 text-rag-amber",
  Expired: "bg-rag-red/15 text-rag-red",
};

const CATEGORIES: DocCategory[] = ["DBS", "Training", "Complaints", "Other"];
const STATUSES: DocStatus[] = ["Valid", "Expiring Soon", "Expired"];

type SortKey = "dealerName" | "uploadDate" | "expiryDate";
const PAGE_SIZE = 8;

const dealerMap = new Map(dealers.map((d) => [d.id, d.name]));

export default function Documents() {
  const [docs, setDocs] = useState<DealerDocument[]>(initialDocuments);
  const [searchParams, setSearchParams] = useSearchParams();

  // Read query params for filtering from alerts
  const dealerParam = searchParams.get("dealer");
  const statusParam = searchParams.get("status");
  const hasAlertFilter = !!(dealerParam || statusParam);

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [catFilter, setCatFilter] = useState<DocCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<DocStatus | "all">(
    statusParam && STATUSES.includes(statusParam as DocStatus) ? statusParam as DocStatus : "all"
  );
  const [sortKey, setSortKey] = useState<SortKey>("uploadDate");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);

  const clearAlertFilters = () => {
    setSearchParams({});
    setSearch("");
    setStatusFilter("all");
    setCatFilter("all");
    setPage(0);
  };

  const filtered = useMemo(() => {
    let list = docs;
    // Dealer param filter
    if (dealerParam) list = list.filter((d) => d.dealerId === dealerParam);
    if (catFilter !== "all") list = list.filter((d) => d.category === catFilter);
    if (statusFilter !== "all") list = list.filter((d) => d.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          (dealerMap.get(d.dealerId) ?? "").toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "dealerName") {
        cmp = (dealerMap.get(a.dealerId) ?? "").localeCompare(dealerMap.get(b.dealerId) ?? "");
      } else if (sortKey === "uploadDate") {
        cmp = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      } else {
        const aExp = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
        const bExp = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
        cmp = aExp - bExp;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [docs, dealerParam, catFilter, statusFilter, search, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
    setPage(0);
  };

  const SortHeader = ({ label, sortKeyName }: { label: string; sortKeyName: SortKey }) => (
    <button
      onClick={() => toggleSort(sortKeyName)}
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown className={`h-3 w-3 ${sortKey === sortKeyName ? "text-primary" : ""}`} />
    </button>
  );

  const handleUpload = (doc: DealerDocument) => {
    setDocs((prev) => [doc, ...prev]);
    setPage(0);
  };

  const fmtDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "—";

  const dealerName = dealerParam ? dealerMap.get(dealerParam) : null;

  return (
    <div className="space-y-6" data-tour="document-table">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Documents</h1>
          <p className="text-sm text-muted-foreground">Track dealer document compliance</p>
        </div>
        <UploadDocumentModal onUpload={handleUpload} />
      </div>

      {/* Alert filter context banner */}
      {hasAlertFilter && (
        <div className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span>
              Viewing documents filtered from alert
              {dealerName && <> — <strong>{dealerName}</strong></>}
              {statusParam && <> · <strong>{statusParam}</strong></>}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={clearAlertFilters}>
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by document or dealer name…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 h-9"
          />
        </div>
        <Select value={catFilter} onValueChange={(v) => { setCatFilter(v as DocCategory | "all"); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-40 h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as DocStatus | "all"); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-40 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-3 py-2.5 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Document Name</span>
              </th>
              <th className="px-3 py-2.5 text-left">
                <SortHeader label="Dealer" sortKeyName="dealerName" />
              </th>
              <th className="px-3 py-2.5 text-left hidden sm:table-cell">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</span>
              </th>
              <th className="px-3 py-2.5 text-left hidden md:table-cell">
                <SortHeader label="Uploaded" sortKeyName="uploadDate" />
              </th>
              <th className="px-3 py-2.5 text-left">
                <SortHeader label="Expiry" sortKeyName="expiryDate" />
              </th>
              <th className="px-3 py-2.5 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
              </th>
              <th className="px-3 py-2.5 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">No documents found.</td></tr>
            ) : (
              paginated.map((doc) => (
                <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-3 py-2.5 font-medium text-foreground">{doc.name}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{dealerMap.get(doc.dealerId) ?? "Unknown"}</td>
                  <td className="px-3 py-2.5 text-muted-foreground hidden sm:table-cell">{doc.category}</td>
                  <td className="px-3 py-2.5 text-muted-foreground hidden md:table-cell">{fmtDate(doc.uploadDate)}</td>
                  <td className="px-3 py-2.5 text-muted-foreground">{fmtDate(doc.expiryDate)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_PILL[doc.status]}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-primary hover:text-primary/80">
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{filtered.length} document{filtered.length !== 1 && "s"}</p>
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
    </div>
  );
}
