import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Dealer, RagStatus } from "@/types";

const RAG_BADGE: Record<RagStatus, string> = {
  Green: "bg-rag-green/15 text-rag-green",
  Amber: "bg-rag-amber/15 text-rag-amber",
  Red: "bg-rag-red/15 text-rag-red",
};

type SortKey = "name" | "overallScore" | "lastAuditDate";

interface Props {
  dealers: Dealer[];
  ragFilter: RagStatus | null;
  onRagFilterChange: (r: RagStatus | null) => void;
}

const PAGE_SIZE = 5;

export function DealerWatchlist({ dealers, ragFilter, onRagFilterChange }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("overallScore");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let list = dealers;
    if (ragFilter) list = list.filter((d) => d.ragStatus === ragFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) => d.name.toLowerCase().includes(q) || d.tradingName.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "overallScore") cmp = a.overallScore - b.overallScore;
      else cmp = new Date(a.lastAuditDate).getTime() - new Date(b.lastAuditDate).getTime();
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [dealers, ragFilter, search, sortKey, sortAsc]);

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

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search dealers…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 h-9"
          />
        </div>
        <Select
          value={ragFilter ?? "all"}
          onValueChange={(v) => { onRagFilterChange(v === "all" ? null : v as RagStatus); setPage(0); }}
        >
          <SelectTrigger className="w-full sm:w-36 h-9">
            <SelectValue placeholder="All RAG" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All RAG</SelectItem>
            <SelectItem value="Green">Green</SelectItem>
            <SelectItem value="Amber">Amber</SelectItem>
            <SelectItem value="Red">Red</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-3 py-2.5 text-left"><SortHeader label="Dealer Name" sortKeyName="name" /></th>
              <th className="px-3 py-2.5 text-left hidden sm:table-cell">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trading Name</span>
              </th>
              <th className="px-3 py-2.5 text-left"><SortHeader label="Score" sortKeyName="overallScore" /></th>
              <th className="px-3 py-2.5 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">RAG</span>
              </th>
              <th className="px-3 py-2.5 text-left hidden md:table-cell"><SortHeader label="Last Audit" sortKeyName="lastAuditDate" /></th>
              <th className="px-3 py-2.5 text-left hidden lg:table-cell">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">CSS</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">No dealers found.</td></tr>
            ) : (
              paginated.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => navigate(`/dealers/${d.id}`)}
                  className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2.5 font-medium text-foreground">{d.name}</td>
                  <td className="px-3 py-2.5 text-muted-foreground hidden sm:table-cell">{d.tradingName}</td>
                  <td className="px-3 py-2.5 font-semibold text-foreground">{d.overallScore}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${RAG_BADGE[d.ragStatus]}`}>
                      {d.ragStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground hidden md:table-cell">
                    {new Date(d.lastAuditDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-3 py-2.5 text-foreground hidden lg:table-cell">{d.cssScore}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filtered.length} dealer{filtered.length !== 1 && "s"}
        </p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            {page + 1} / {totalPages}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
