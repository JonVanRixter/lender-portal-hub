import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle2, RefreshCw } from "lucide-react";
import { useAlerts } from "@/contexts/AlertsContext";
import type { Alert, AlertType, AlertSeverity, AlertStatus } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AcknowledgeModal } from "@/components/alerts/AcknowledgeModal";

const SEVERITY_PILL: Record<AlertSeverity, string> = {
  High: "bg-rag-red/15 text-rag-red",
  Medium: "bg-rag-amber/15 text-rag-amber",
  Low: "bg-rag-green/15 text-rag-green",
};

const STATUS_PILL: Record<AlertStatus, string> = {
  Pending: "bg-rag-amber/15 text-rag-amber",
  Acknowledged: "bg-muted text-muted-foreground",
};

const TYPES: AlertType[] = ["Threshold Breach", "Document Expiry", "Manual Review Required"];
const SEVERITIES: AlertSeverity[] = ["High", "Medium", "Low"];
const STATUSES: AlertStatus[] = ["Pending", "Acknowledged"];

const PAGE_SIZE = 8;

export default function AlertsPage() {
  const navigate = useNavigate();
  const { alerts, acknowledge, getDealerName } = useAlerts();
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">("all");
  const [typeFilter, setTypeFilter] = useState<AlertType | "all">("all");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const [ackAlert, setAckAlert] = useState<Alert | null>(null);

  const filtered = useMemo(() => {
    let list = alerts;
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter);
    if (severityFilter !== "all") list = list.filter((a) => a.severity === severityFilter);
    if (typeFilter !== "all") list = list.filter((a) => a.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.message.toLowerCase().includes(q) ||
          getDealerName(a.dealerId).toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      const cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [alerts, statusFilter, severityFilter, typeFilter, search, sortAsc, getDealerName]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
        <p className="text-sm text-muted-foreground">Review and manage compliance alerts</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 h-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as AlertType | "all"); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-48 h-9">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v as AlertSeverity | "all"); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-36 h-9">
            <SelectValue placeholder="All Severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            {SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as AlertStatus | "all"); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-40 h-9">
            <SelectValue placeholder="All Statuses" />
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
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</span>
              </th>
              <th className="px-3 py-2.5 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dealer</span>
              </th>
              <th className="px-3 py-2.5 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Severity</span>
              </th>
              <th className="px-3 py-2.5 text-left hidden md:table-cell">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Message</span>
              </th>
              <th className="px-3 py-2.5 text-left">
                <button
                  onClick={() => { setSortAsc(!sortAsc); setPage(0); }}
                  className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                >
                  Date
                  <ArrowUpDown className={`h-3 w-3 ${!sortAsc ? "text-primary" : ""}`} />
                </button>
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
              <tr><td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">No alerts found.</td></tr>
            ) : (
              paginated.map((alert) => (
                <tr key={alert.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{alert.type}</td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{getDealerName(alert.dealerId)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${SEVERITY_PILL[alert.severity]}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground hidden md:table-cell max-w-xs truncate">{alert.message}</td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{fmtDate(alert.date)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_PILL[alert.status]}`}>
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      {alert.status === "Pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs"
                          onClick={() => setAckAlert(alert)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Acknowledge
                        </Button>
                      )}
                      {alert.type === "Threshold Breach" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1 text-xs text-[#3d1468] hover:text-[#3d1468]/80"
                          onClick={() => navigate(`/dealers/${alert.dealerId}?reaudit=true`)}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Re-run Audit
                        </Button>
                      )}
                      {alert.status !== "Pending" && alert.type !== "Threshold Breach" && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{filtered.length} alert{filtered.length !== 1 && "s"}</p>
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

      {/* Acknowledge modal */}
      <AcknowledgeModal
        alert={ackAlert}
        dealerName={ackAlert ? getDealerName(ackAlert.dealerId) : ""}
        onClose={() => setAckAlert(null)}
        onConfirm={acknowledge}
      />
    </div>
  );
}
