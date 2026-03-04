import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRecheck } from "@/contexts/RecheckContext";
import { RecheckDetailPanel } from "@/components/dealers/RecheckDetailPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Zap, Clock, CheckCircle2, AlertCircle, Filter } from "lucide-react";
import type { RecheckRequest, RecheckStatus, RecheckPriority } from "@/data/recheckRequests";

/* ── Styling maps ── */
const STATUS_PILL: Record<string, { bg: string; text: string; label: string }> = {
  Submitted:     { bg: "bg-[#f59e0b]/15", text: "text-[#f59e0b]", label: "🟡 Submitted" },
  "In Progress": { bg: "bg-[#3b82f6]/15", text: "text-[#3b82f6]", label: "🔵 In Progress" },
  Completed:     { bg: "bg-[#16a34a]/15", text: "text-[#16a34a]", label: "✅ Completed" },
  Dismissed:     { bg: "bg-[#6b7280]/15", text: "text-[#6b7280]", label: "Dismissed" },
  Escalated:     { bg: "bg-[#dc2626]/15", text: "text-[#dc2626]", label: "⚠️ Escalated" },
};

const PRIORITY_PILL: Record<RecheckPriority, { class: string; emoji: string }> = {
  Normal:   { class: "bg-muted text-muted-foreground", emoji: "" },
  High:     { class: "bg-rag-amber/15 text-rag-amber", emoji: "🟠" },
  Critical: { class: "bg-rag-red/15 text-rag-red", emoji: "🔴" },
};

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function SlaCell({ deadline, status }: { deadline: string; status: string }) {
  if (status === "Completed") return <span className="text-[#16a34a] text-xs font-medium">Met ✅</span>;
  if (status === "Dismissed") return <span className="text-[#6b7280] text-xs">—</span>;
  const now = new Date();
  const sla = new Date(deadline);
  const total = sla.getTime() - new Date(deadline).getTime(); // not useful, compute from request
  const msLeft = sla.getTime() - now.getTime();
  const hoursLeft = msLeft / (1000 * 60 * 60);

  if (hoursLeft < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#dc2626]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#dc2626] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#dc2626]" />
        </span>
        BREACHED
      </span>
    );
  }

  // Determine color based on proportion remaining
  const hoursTotal = hoursLeft + (now.getTime() - new Date(deadline).getTime()) / (1000 * 60 * 60);
  let colorClass = "text-[#16a34a]"; // >50% green
  if (hoursLeft < 4) colorClass = "text-[#dc2626]"; // <25% roughly
  else if (hoursLeft < 12) colorClass = "text-[#f97316]"; // <50%

  if (hoursLeft < 1) {
    return <span className={`text-xs font-semibold ${colorClass}`}>{Math.round(hoursLeft * 60)}m left</span>;
  }
  return <span className={`text-xs font-medium ${colorClass}`}>{Math.round(hoursLeft)}h left</span>;
}

export default function MyRequests() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const { requests } = useRecheck();

  // Filters
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dealerFilter, setDealerFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Unique dealers
  const dealers = useMemo(() => {
    const map = new Map<string, string>();
    requests.forEach((r) => map.set(r.dealerId, r.dealerName));
    return Array.from(map.entries());
  }, [requests]);

  // If viewing a specific request
  const selectedRequest = requestId ? requests.find((r) => r.id === requestId) : null;

  // Filtered & sorted
  const filtered = useMemo(() => {
    let list = [...requests];

    if (typeFilter === "recheck") list = list.filter((r) => r.requestType === "Lender Re-Check");
    if (typeFilter === "chase") list = list.filter((r) => r.requestType === "Fail Chase");

    if (statusFilter === "open") list = list.filter((r) => r.status === "Submitted" || r.status === "In Progress");
    if (statusFilter === "completed") list = list.filter((r) => r.status === "Completed");
    if (statusFilter === "dismissed") list = list.filter((r) => (r as any).status === "Dismissed");

    if (dealerFilter !== "all") list = list.filter((r) => r.dealerId === dealerFilter);

    list.sort((a, b) => {
      if (sortBy === "date") return new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime();
      if (sortBy === "sla") {
        const aLeft = new Date(a.slaDeadline).getTime() - Date.now();
        const bLeft = new Date(b.slaDeadline).getTime() - Date.now();
        return aLeft - bLeft; // most urgent first
      }
      if (sortBy === "priority") {
        const order: Record<string, number> = { Critical: 3, High: 2, Normal: 1 };
        return (order[b.priority] ?? 0) - (order[a.priority] ?? 0);
      }
      return 0;
    });

    return list;
  }, [requests, typeFilter, statusFilter, dealerFilter, sortBy]);

  // KPIs
  const kpis = useMemo(() => {
    const total = requests.length;
    const submitted = requests.filter((r) => r.status === "Submitted").length;
    const inProgress = requests.filter((r) => r.status === "In Progress").length;
    const completed = requests.filter((r) => r.status === "Completed").length;
    const breached = requests.filter((r) => {
      if (r.status === "Completed") return false;
      return new Date(r.slaDeadline).getTime() < Date.now();
    }).length;
    return { total, submitted, inProgress, completed, breached };
  }, [requests]);

  // Detail view
  if (selectedRequest) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/requests")} className="-ml-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Requests
        </Button>
        <RecheckDetailPanel request={selectedRequest} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Re-Check & Chase Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All re-check requests and fail chases raised by your team. TCG investigates and resolves. Track progress and SLA status here.
        </p>
      </div>

      {/* KPI strip */}
      <div className="flex flex-wrap gap-3">
        <Card className="border-border flex-1 min-w-[120px]">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{kpis.total}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">Total Requests</p>
          </CardContent>
        </Card>
        <Card className="border-border flex-1 min-w-[120px]">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-[#f59e0b]">{kpis.submitted}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">🟡 Submitted</p>
          </CardContent>
        </Card>
        <Card className="border-border flex-1 min-w-[120px]">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-[#3b82f6]">{kpis.inProgress}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">🔵 In Progress</p>
          </CardContent>
        </Card>
        <Card className="border-border flex-1 min-w-[120px]">
          <CardContent className="p-3 text-center">
            <p className="text-2xl font-bold text-[#16a34a]">{kpis.completed}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">✅ Completed</p>
          </CardContent>
        </Card>
        <Card className={`border-border flex-1 min-w-[120px] ${kpis.breached > 0 ? "border-[#dc2626]/30 bg-[#dc2626]/5" : ""}`}>
          <CardContent className="p-3 text-center">
            <p className={`text-2xl font-bold ${kpis.breached > 0 ? "text-[#dc2626]" : "text-foreground"}`}>{kpis.breached}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold">⚠️ SLA Breached</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="recheck">🔄 Re-Check</SelectItem>
            <SelectItem value="chase">⚠️ Fail Chase</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dealerFilter} onValueChange={setDealerFilter}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="Dealer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dealers</SelectItem>
            {dealers.map(([id, name]) => (
              <SelectItem key={id} value={id}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px] h-8 text-xs">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date (newest)</SelectItem>
            <SelectItem value="sla">SLA urgency</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Request table */}
      <div className="rounded-md border border-border bg-card overflow-x-auto">
        <table className="w-full text-xs table-fixed">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-2 py-2 text-left font-semibold text-muted-foreground w-[7%]">Ref</th>
              <th className="px-2 py-2 text-left font-semibold text-muted-foreground w-[13%]">Dealer</th>
              <th className="px-2 py-2 text-left font-semibold text-muted-foreground w-[12%] hidden md:table-cell">Section</th>
              <th className="px-2 py-2 text-left font-semibold text-muted-foreground w-[14%]">Control</th>
              <th className="px-2 py-2 text-center font-semibold text-muted-foreground w-[9%]">Type</th>
              <th className="px-2 py-2 text-center font-semibold text-muted-foreground w-[8%]">Priority</th>
              <th className="px-2 py-2 text-center font-semibold text-muted-foreground w-[10%]">Status</th>
              <th className="px-2 py-2 text-center font-semibold text-muted-foreground w-[9%]">SLA</th>
              <th className="px-2 py-2 text-left font-semibold text-muted-foreground w-[10%] hidden lg:table-cell">Requested</th>
              <th className="px-2 py-2 text-right font-semibold text-muted-foreground w-[8%]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">No requests match filters.</td>
              </tr>
            ) : (
              filtered.map((r) => {
                const statusStyle = STATUS_PILL[r.status] ?? STATUS_PILL.Submitted;
                const isBreach = r.status !== "Completed" && new Date(r.slaDeadline).getTime() < Date.now();
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors ${isBreach ? "bg-[#dc2626]/5" : ""}`}
                    onClick={() => navigate(`/requests/${r.id}`)}
                  >
                    <td className="px-2 py-2 font-mono text-muted-foreground">{r.id.toUpperCase().replace("RR-", "RR-").slice(0, 6)}</td>
                    <td className="px-2 py-2 font-medium text-foreground truncate">{r.dealerName.split(" ").slice(0, 2).join(" ")}</td>
                    <td className="px-2 py-2 text-muted-foreground truncate hidden md:table-cell">{r.sectionName}</td>
                    <td className="px-2 py-2 text-foreground truncate">{r.controlName}</td>
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                        r.requestType === "Fail Chase" ? "bg-rag-red/10 text-rag-red" : "bg-primary/10 text-primary"
                      }`}>
                        {r.requestType === "Fail Chase" ? <>⚠️ Chase</> : <>🔄 Re-Check</>}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_PILL[r.priority].class}`}>
                        {PRIORITY_PILL[r.priority].emoji} {r.priority}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.label}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <SlaCell deadline={r.slaDeadline} status={r.status} />
                    </td>
                    <td className="px-2 py-2 text-muted-foreground hidden lg:table-cell whitespace-nowrap">{fmtDateTime(r.requestedDate)}</td>
                    <td className="px-2 py-2 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[10px] text-primary gap-0.5"
                        onClick={(e) => { e.stopPropagation(); navigate(`/requests/${r.id}`); }}
                      >
                        {isBreach ? "View / Escalate" : "View"}
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
