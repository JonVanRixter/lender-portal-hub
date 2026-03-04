import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, CheckCircle2, RefreshCw, FileText, Eye } from "lucide-react";
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

const SEVERITY_ORDER: Record<AlertSeverity, number> = { High: 3, Medium: 2, Low: 1 };

const TYPES: AlertType[] = ["Threshold Breach", "Document Expiry", "Manual Review Required", "Re-Check Submitted", "Re-Check Picked Up", "Re-Check Completed", "Fail Chase Triggered", "Fail Chase Update", "SLA Breach", "Re-Check Score Changed"];
const SEVERITIES: AlertSeverity[] = ["High", "Medium", "Low"];

const PAGE_SIZE = 8;

type SortField = "date" | "severity";
type SortDir = "asc" | "desc";

export default function AlertsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { alerts, acknowledge, getDealerName } = useAlerts();
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "all">(() => {
    const s = searchParams.get("status");
    return s === "Pending" || s === "Acknowledged" ? s : "all";
  });
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">("all");
  const [typeFilter, setTypeFilter] = useState<AlertType | "all">(() => {
    const t = searchParams.get("type");
    return TYPES.includes(t as AlertType) ? (t as AlertType) : "all";
  });
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);
  const [ackAlert, setAckAlert] = useState<Alert | null>(null);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(0);
  };

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
      let cmp: number;
      if (sortField === "severity") {
        cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      } else {
        cmp = new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [alerts, statusFilter, severityFilter, typeFilter, search, sortField, sortDir, getDealerName]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const getDocumentLink = (alert: Alert) => {
    const msg = alert.message.toLowerCase();
    const status = msg.includes("expired") || msg.includes("expire") && !msg.includes("expiring")
      ? "Expired"
      : "Expiring Soon";
    return `/documents?dealer=${alert.dealerId}&status=${encodeURIComponent(status)}`;
  };

  const getEmptyStateMessage = () => {
    if (statusFilter === "Pending") return "✅ No pending alerts — your portfolio is up to date.";
    if (statusFilter === "Acknowledged") return "No acknowledged alerts in this period.";
    return "No alerts found.";
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown className={`h-3 w-3 ${sortField === field ? "text-primary" : ""}`} />
    </button>
  );

  return (
    <div className="space-y-4" data-tour="alert-table">
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
          <SelectTrigger className="w-full sm:w-44 h-9">
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
          <SelectTrigger className="w-full sm:w-44 h-9">
            <SelectValue placeholder="All Alerts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Alerts</SelectItem>
            <SelectItem value="Pending">⏳ Pending Action</SelectItem>
            <SelectItem value="Acknowledged">✓ Acknowledged</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border border-border bg-card">
        <table className="w-full text-sm table-fixed">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-2 py-2 text-left w-[18%]">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</span>
              </th>
              <th className="px-2 py-2 text-left w-[15%]">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dealer</span>
              </th>
              <th className="px-2 py-2 text-left w-[9%]">
                <SortHeader field="severity" label="Sev." />
              </th>
              <th className="px-2 py-2 text-left w-[24%] hidden lg:table-cell">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Message</span>
              </th>
              <th className="px-2 py-2 text-left w-[11%]">
                <SortHeader field="date" label="Date" />
              </th>
              <th className="px-2 py-2 text-left w-[11%]">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
              </th>
              <th className="px-2 py-2 text-left w-[12%]">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={7} className="px-2 py-8 text-center text-muted-foreground">{getEmptyStateMessage()}</td></tr>
            ) : (
              paginated.map((alert) => {
                const isRecheckType = ["Re-Check Submitted", "Re-Check Picked Up", "Re-Check Completed", "Fail Chase Triggered", "Fail Chase Update", "SLA Breach", "Re-Check Score Changed"].includes(alert.type);
                const rowHref = isRecheckType
                  ? "/requests"
                  : alert.type === "Document Expiry"
                    ? getDocumentLink(alert)
                    : `/dealers/${alert.dealerId}`;
                const isAcknowledged = alert.status === "Acknowledged";
                return (
                <tr
                  key={alert.id}
                  className={`border-b border-border last:border-0 hover:bg-muted/40 transition-colors cursor-pointer ${isAcknowledged ? "bg-muted/30" : ""}`}
                  onClick={() => navigate(rowHref)}
                >
                  <td className="px-2 py-2 font-medium text-foreground truncate">{alert.type}</td>
                  <td className="px-2 py-2 font-medium text-foreground truncate">
                    {getDealerName(alert.dealerId)}
                  </td>
                  <td className="px-2 py-2">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${SEVERITY_PILL[alert.severity]}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-muted-foreground hidden lg:table-cell truncate">{alert.message}</td>
                  <td className="px-2 py-2 text-muted-foreground whitespace-nowrap text-xs">{fmtDate(alert.date)}</td>
                  <td className="px-2 py-2">
                    {isAcknowledged ? (
                      <span className="inline-block rounded-full px-1.5 py-0.5 text-[11px] font-semibold bg-muted text-muted-foreground whitespace-nowrap">
                        ✓ Ack'd
                      </span>
                    ) : (
                      <span className="inline-block rounded-full px-1.5 py-0.5 text-[11px] font-semibold bg-rag-amber/15 text-rag-amber whitespace-nowrap">
                        ⏳ Pending
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                      {alert.status === "Pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 gap-1 text-[11px] px-1.5"
                          onClick={() => setAckAlert(alert)}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Ack
                        </Button>
                      )}
                      {alert.status === "Acknowledged" && (
                        <span className="text-[11px] text-muted-foreground">✓</span>
                      )}
                      {alert.type === "Threshold Breach" && alert.status === "Pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 gap-0.5 text-[11px] px-1 text-primary hover:text-primary/80"
                          onClick={() => navigate(`/dealers/${alert.dealerId}?reaudit=true`)}
                        >
                          <RefreshCw className="h-3 w-3" />
                          Audit
                        </Button>
                      )}
                      {alert.type === "Document Expiry" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 gap-0.5 text-[11px] px-1 text-primary hover:text-primary/80"
                          onClick={() => navigate(getDocumentLink(alert))}
                        >
                          <FileText className="h-3 w-3" />
                          Doc
                        </Button>
                      )}
                      {isRecheckType && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 gap-0.5 text-[11px] px-1 text-primary hover:text-primary/80"
                          onClick={() => navigate("/requests")}
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
                );
              })
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
