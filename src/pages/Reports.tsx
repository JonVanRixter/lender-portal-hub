import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { dealers, documents, initialAlerts } from "@/data/mockData";
import type { Dealer, RagStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FileDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const RAG_COLORS: Record<RagStatus, string> = {
  Green: "hsl(142, 72%, 37%)",
  Amber: "hsl(25, 95%, 53%)",
  Red: "hsl(0, 72%, 51%)",
};

const RAG_PILL: Record<RagStatus, string> = {
  Green: "bg-rag-green/15 text-rag-green",
  Amber: "bg-rag-amber/15 text-rag-amber",
  Red: "bg-rag-red/15 text-rag-red",
};

const SECTION_NAMES = [
  "Legal Status",
  "FCA Authorization",
  "Financial Risk",
  "KYC & AML",
  "DBS Compliance",
  "Training & Competence",
  "Complaints Handling",
  "Website & Marketing",
];

// ─── Portfolio Summary Components ───

function PortfolioHealthCard() {
  const navigate = useNavigate();
  const ragCounts = useMemo(() => {
    const c: Record<RagStatus, number> = { Green: 0, Amber: 0, Red: 0 };
    dealers.forEach((d) => c[d.ragStatus]++);
    return c;
  }, []);

  const data = [
    { name: "Green", value: ragCounts.Green },
    { name: "Amber", value: ragCounts.Amber },
    { name: "Red", value: ragCounts.Red },
  ].filter((d) => d.value > 0);

  const handlePieClick = (_: unknown, index: number) => {
    const rag = data[index]?.name;
    if (rag) navigate(`/dealers?rag=${rag}`);
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Portfolio Health</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              dataKey="value"
              stroke="hsl(0,0%,100%)"
              strokeWidth={3}
              onClick={handlePieClick}
              cursor="pointer"
            >
              {data.map((e) => (
                <Cell key={e.name} fill={RAG_COLORS[e.name as RagStatus]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value} dealer${value !== 1 ? "s" : ""}`, `View ${name} dealers →`]}
            />
          </PieChart>
        </ResponsiveContainer>
        <p className="text-sm text-muted-foreground mt-2">
          {ragCounts.Green} Green · {ragCounts.Amber} Amber · {ragCounts.Red} Red out of {dealers.length} dealers
        </p>
      </CardContent>
    </Card>
  );
}

function ScoreDistributionCard() {
  const navigate = useNavigate();
  const bands = useMemo(() => {
    const b = [
      { range: "0–24", count: 0, fill: RAG_COLORS.Red, min: 0, max: 24 },
      { range: "25–49", count: 0, fill: RAG_COLORS.Red, min: 25, max: 49 },
      { range: "50–74", count: 0, fill: RAG_COLORS.Amber, min: 50, max: 74 },
      { range: "75–100", count: 0, fill: RAG_COLORS.Green, min: 75, max: 100 },
    ];
    dealers.forEach((d) => {
      const idx = d.overallScore < 25 ? 0 : d.overallScore < 50 ? 1 : d.overallScore < 75 ? 2 : 3;
      b[idx].count++;
    });
    return b;
  }, []);

  const handleBarClick = (data: { min: number; max: number }) => {
    navigate(`/dealers?scoreMin=${data.min}&scoreMax=${data.max}`);
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Score Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={bands}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240,6%,88%)" />
            <XAxis dataKey="range" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number) => [`${value} dealer${value !== 1 ? "s" : ""}`, "Click to view →"]}
            />
            <Bar
              dataKey="count"
              name="Dealers"
              cursor="pointer"
              onClick={(data) => handleBarClick(data)}
            >
              {bands.map((b, i) => (
                <Cell key={i} fill={b.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function SectionHeatmapCard() {
  return (
    <Card className="border-border col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Section Compliance Heatmap</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="min-w-[800px]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 text-left font-semibold text-muted-foreground sticky left-0 bg-muted/50 z-10">Section</th>
                  {dealers.map((d) => (
                    <th key={d.id} className="px-2 py-2 text-center font-medium whitespace-nowrap">
                      <button onClick={() => window.location.href = `/dealers/${d.id}`} className="text-primary hover:underline cursor-pointer text-xs">
                        {d.tradingName.length > 12 ? d.tradingName.slice(0, 10) + "…" : d.tradingName}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SECTION_NAMES.map((section) => (
                  <tr key={section} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-medium text-foreground sticky left-0 bg-card z-10 whitespace-nowrap">{section}</td>
                    {dealers.map((d) => {
                      const sec = d.sections?.find((s) => s.name === section);
                      const rag = sec?.ragStatus ?? "Green";
                        return (
                          <td key={d.id} className="px-2 py-2 text-center">
                            <button onClick={() => window.location.href = `/dealers/${d.id}`} className="cursor-pointer" title={`${d.tradingName} — ${section}: ${rag} (${sec?.score ?? "—"})`}>
                              <span className={`inline-block h-3 w-3 rounded-full`} style={{ backgroundColor: RAG_COLORS[rag] }} />
                            </button>
                          </td>
                        );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function CssSummaryCard() {
  const sorted = useMemo(() => [...dealers].sort((a, b) => b.cssScore - a.cssScore), []);
  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">CSS Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Dealer</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">CSS Score</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => {
              const status = d.cssScore >= 75 ? "Reward" : "Oversight";
              return (
                <tr key={d.id} className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors" onClick={() => window.location.href = `/dealers/${d.id}`}>
                  <td className="px-3 py-2 font-medium text-primary hover:underline">{d.tradingName}</td>
                  <td className="px-3 py-2 text-muted-foreground">{d.cssScore}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${status === "Reward" ? "text-rag-green" : "text-rag-amber"}`}>
                      {status === "Reward" ? "🏆" : "⚠️"} {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function OpenActionsCard() {
  const rows = useMemo(() => {
    return dealers
      .map((d) => {
        const actions = d.keyActions ?? [];
        return {
          id: d.id,
          name: d.tradingName,
          open: actions.filter((a) => a.status === "Open").length,
          inProgress: actions.filter((a) => a.status === "In Progress").length,
          completed: actions.filter((a) => a.status === "Completed").length,
          total: actions.length,
        };
      })
      .filter((r) => r.total > 0);
  }, []);

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Open Actions Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Dealer</th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Open</th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">In Progress</th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Completed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors" onClick={() => window.location.href = `/dealers/${r.id}`}>
                <td className="px-3 py-2 font-medium text-primary hover:underline">{r.name}</td>
                <td className="px-3 py-2 text-center text-muted-foreground">{r.open || "—"}</td>
                <td className="px-3 py-2 text-center text-muted-foreground">{r.inProgress || "—"}</td>
                <td className="px-3 py-2 text-center text-muted-foreground">{r.completed || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function DocExpirySummaryCard() {
  const counts = useMemo(() => {
    const c = { Valid: 0, "Expiring Soon": 0, Expired: 0 };
    documents.forEach((d) => {
      if (d.status === "Valid") c.Valid++;
      else if (d.status === "Expiring Soon") c["Expiring Soon"]++;
      else c.Expired++;
    });
    return c;
  }, []);

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Document Expiry Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(["Valid", "Expiring Soon", "Expired"] as const).map((status) => (
            <div key={status} className="flex items-center justify-between">
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                status === "Valid" ? "bg-rag-green/15 text-rag-green" :
                status === "Expiring Soon" ? "bg-rag-amber/15 text-rag-amber" :
                "bg-rag-red/15 text-rag-red"
              }`}>{status}</span>
              <button onClick={() => window.location.href = `/documents?status=${encodeURIComponent(status)}`} className="text-lg font-bold text-primary hover:underline cursor-pointer">{counts[status]}</button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AlertsSummaryCard() {
  const navigate = useNavigate();
  const summary = useMemo(() => {
    const types = ["Threshold Breach", "Document Expiry", "Manual Review Required"] as const;
    return types.map((type) => {
      const ofType = initialAlerts.filter((a) => a.type === type);
      return {
        type,
        pending: ofType.filter((a) => a.status === "Pending").length,
        acknowledged: ofType.filter((a) => a.status === "Acknowledged").length,
      };
    });
  }, []);

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Active Alerts Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Type</th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Pending</th>
              <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Acknowledged</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((s) => (
              <tr key={s.type} className="border-b border-border last:border-0">
                <td className="px-3 py-2 font-medium text-foreground">{s.type}</td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => navigate(`/alerts?type=${encodeURIComponent(s.type)}&status=Pending`)}
                    className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold bg-rag-amber/15 text-rag-amber hover:underline cursor-pointer"
                  >
                    {s.pending}
                  </button>
                </td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => navigate(`/alerts?type=${encodeURIComponent(s.type)}&status=Acknowledged`)}
                    className="text-muted-foreground hover:underline cursor-pointer text-sm"
                  >
                    {s.acknowledged}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

// ─── Portfolio Download ───

function generatePortfolioCsv() {
  const now = new Date();
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const fmtDateTime = () =>
    now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " " +
    now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const dateRef = now.toISOString().slice(0, 10).replace(/-/g, "");

  const esc = (v: string | number) => {
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const avgScore = (dealers.reduce((s, d) => s + d.overallScore, 0) / dealers.length).toFixed(1);
  const ragCounts = { Green: 0, Amber: 0, Red: 0 } as Record<RagStatus, number>;
  dealers.forEach((d) => ragCounts[d.ragStatus]++);

  const docCounts = { Valid: 0, "Expiring Soon": 0, Expired: 0 };
  documents.forEach((d) => {
    if (d.status === "Valid") docCounts.Valid++;
    else if (d.status === "Expiring Soon") docCounts["Expiring Soon"]++;
    else docCounts.Expired++;
  });

  const expiringDocs = documents.filter((d) => d.status === "Expiring Soon" || d.status === "Expired");
  const openActions = dealers.flatMap((d) =>
    (d.keyActions ?? [])
      .filter((a) => a.status === "Open" || a.status === "In Progress")
      .map((a) => ({ dealerName: d.tradingName, ...a }))
  );

  const sortedDealers = [...dealers].sort((a, b) => b.overallScore - a.overallScore);

  const rows: string[][] = [];
  rows.push(["DEALERGUARD PORTFOLIO SUMMARY REPORT"]);
  rows.push(["Generated:", fmtDateTime()]);
  rows.push(["Lender:", "Apex Motor Finance Ltd"]);
  rows.push(["Report Ref:", `PF-${dateRef}`]);
  rows.push([]);
  rows.push(["PORTFOLIO OVERVIEW"]);
  rows.push(["Total Dealers:", String(dealers.length)]);
  rows.push(["Average Score:", avgScore]);
  rows.push(["Green (Compliant):", String(ragCounts.Green)]);
  rows.push(["Amber (Attention Needed):", String(ragCounts.Amber)]);
  rows.push(["Red (Critical):", String(ragCounts.Red)]);
  rows.push([]);
  rows.push(["DEALER LIST"]);
  rows.push(["Dealer Name", "Trading Name", "Overall Score", "RAG Status", "CSS Score", "CSS Status", "Last Audit Date"]);
  sortedDealers.forEach((d) => {
    rows.push([esc(d.name), esc(d.tradingName), String(d.overallScore), d.ragStatus, String(d.cssScore), d.cssStatus, fmtDate(d.lastAuditDate)]);
  });
  rows.push([]);
  rows.push(["CRITICAL ALERTS (PENDING)"]);
  rows.push(["Alert Type", "Dealer Name", "Severity", "Message", "Date Raised"]);
  const pendingAlerts = initialAlerts.filter((a) => a.status === "Pending" && a.type === "Threshold Breach");
  if (pendingAlerts.length === 0) {
    rows.push(["None"]);
  } else {
    pendingAlerts.forEach((a) => {
      const dName = dealers.find((d) => d.id === a.dealerId)?.tradingName ?? "Unknown";
      rows.push([a.type, esc(dName), a.severity, esc(a.message), fmtDate(a.date)]);
    });
  }
  rows.push([]);
  rows.push(["DOCUMENT EXPIRY SUMMARY"]);
  rows.push(["Status", "Count"]);
  rows.push(["Valid", String(docCounts.Valid)]);
  rows.push(["Expiring Soon", String(docCounts["Expiring Soon"])]);
  rows.push(["Expired", String(docCounts.Expired)]);
  rows.push([]);
  rows.push(["EXPIRING & EXPIRED DOCUMENTS DETAIL"]);
  rows.push(["Document Name", "Dealer Name", "Category", "Expiry Date", "Status"]);
  expiringDocs.forEach((doc) => {
    const dName = dealers.find((d) => d.id === doc.dealerId)?.tradingName ?? "Unknown";
    rows.push([esc(doc.name), esc(dName), esc(doc.category), doc.expiryDate ? fmtDate(doc.expiryDate) : "—", doc.status]);
  });
  rows.push([]);
  rows.push(["OPEN ACTIONS SUMMARY"]);
  rows.push(["Dealer Name", "Action Description", "Status", "Due Date"]);
  if (openActions.length === 0) {
    rows.push(["None"]);
  } else {
    openActions.forEach((a) => {
      rows.push([esc(a.dealerName), esc(a.description), a.status, fmtDate(a.dueDate)]);
    });
  }
  rows.push([]);
  rows.push(["---"]);
  rows.push(["Report generated by DealerGuard · The Compliance Guys Ltd"]);
  rows.push(["compliance@thecomplianceguys.co.uk"]);

  return rows.map((r) => r.join(",")).join("\n");
}

// ─── Individual Dealer Report ───

function DealerReport({ dealer }: { dealer: Dealer }) {
  const dealerDocs = documents.filter((d) => d.dealerId === dealer.id);
  const dealerAlerts = initialAlerts.filter((a) => a.dealerId === dealer.id);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const handleDownloadPdf = () => {
    toast({ title: "PDF Export", description: "PDF export available in full MVP." });
  };

  return (
    <div className="space-y-4">
      {/* Header info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Dealer</p>
            <p className="text-lg font-bold text-foreground">{dealer.name}</p>
            <p className="text-sm text-muted-foreground">{dealer.tradingName}</p>
            {dealer.companiesHouseNumber && <p className="text-xs text-muted-foreground">CH: {dealer.companiesHouseNumber}</p>}
            {dealer.website && <p className="text-xs text-muted-foreground">{dealer.website}</p>}
            {dealer.contactEmail && <p className="text-xs text-muted-foreground">{dealer.contactEmail}</p>}
            {dealer.contactPhone && <p className="text-xs text-muted-foreground">{dealer.contactPhone}</p>}
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Overall Score</p>
            <p className="text-4xl font-bold" style={{ color: RAG_COLORS[dealer.ragStatus] }}>{dealer.overallScore}</p>
            <Badge className={`mt-1 ${RAG_PILL[dealer.ragStatus]}`}>{dealer.ragStatus}</Badge>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">CSS Score</p>
            <p className="text-4xl font-bold text-foreground">{dealer.cssScore}</p>
            <span className={`text-xs font-semibold mt-1 ${dealer.cssScore >= 75 ? "text-rag-green" : "text-rag-amber"}`}>
              {dealer.cssScore >= 75 ? "🏆 Reward" : "⚠️ Oversight"}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Section breakdown */}
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Section Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Section</th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Score</th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Result</th>
                <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">RAG</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground hidden md:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {(dealer.sections ?? []).map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 font-medium text-foreground">{s.name}</td>
                  <td className="px-3 py-2 text-center text-muted-foreground">{s.score}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-xs font-semibold ${s.result === "Pass" ? "text-rag-green" : s.result === "Fail" ? "text-rag-red" : "text-rag-amber"}`}>{s.result}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: RAG_COLORS[s.ragStatus] }} />
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground hidden md:table-cell max-w-xs truncate">{s.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Audit History */}
      {dealer.auditHistory && dealer.auditHistory.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Audit History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Date</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Initiated By</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Score</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">RAG</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Trend</th>
                </tr>
              </thead>
              <tbody>
                {dealer.auditHistory.map((ah) => (
                  <tr key={ah.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-muted-foreground">{fmtDate(ah.date)}</td>
                    <td className="px-3 py-2 text-muted-foreground">{ah.initiatedBy}</td>
                    <td className="px-3 py-2 text-center font-medium text-foreground">{ah.overallScore}</td>
                    <td className="px-3 py-2 text-center">
                      <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: RAG_COLORS[ah.ragStatus] }} />
                    </td>
                    <td className="px-3 py-2 text-center">
                      {ah.change === "up" && <TrendingUp className="h-4 w-4 text-rag-green inline" />}
                      {ah.change === "down" && <TrendingDown className="h-4 w-4 text-rag-red inline" />}
                      {ah.change === "neutral" && <Minus className="h-4 w-4 text-muted-foreground inline" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Key Actions */}
      {dealer.keyActions && dealer.keyActions.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Key Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Action</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold uppercase text-muted-foreground">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Due</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground hidden sm:table-cell">Assigned</th>
                </tr>
              </thead>
              <tbody>
                {dealer.keyActions.map((ka) => (
                  <tr key={ka.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-foreground">{ka.description}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        ka.status === "Open" ? "bg-rag-red/15 text-rag-red" :
                        ka.status === "In Progress" ? "bg-rag-amber/15 text-rag-amber" :
                        "bg-rag-green/15 text-rag-green"
                      }`}>{ka.status}</span>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{fmtDate(ka.dueDate)}</td>
                    <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">{ka.assignedTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      {dealerDocs.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Documents ({dealerDocs.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Document</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Expiry</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {dealerDocs.map((doc) => (
                  <tr key={doc.id} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 font-medium text-foreground">{doc.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{doc.category}</td>
                    <td className="px-3 py-2 text-muted-foreground">{doc.expiryDate ? fmtDate(doc.expiryDate) : "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        doc.status === "Valid" ? "bg-rag-green/15 text-rag-green" :
                        doc.status === "Expiring Soon" ? "bg-rag-amber/15 text-rag-amber" :
                        "bg-rag-red/15 text-rag-red"
                      }`}>{doc.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {dealer.notes && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Dealer Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{dealer.notes}</p>
          </CardContent>
        </Card>
      )}

      <Button variant="outline" onClick={handleDownloadPdf} className="gap-2">
        <FileDown className="h-4 w-4" /> Download Full Report
      </Button>
    </div>
  );
}

// ─── Main Reports Page ───

export default function Reports() {
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const selectedDealer = selectedDealerId ? dealers.find((d) => d.id === selectedDealerId) : null;
  const [downloading, setDownloading] = useState(false);

  const avgScore = useMemo(
    () => (dealers.reduce((sum, d) => sum + d.overallScore, 0) / dealers.length).toFixed(1),
    []
  );

  const handleDownloadPortfolio = () => {
    setDownloading(true);
    setTimeout(() => {
      const content = generatePortfolioCsv();
      const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dealerguard-portfolio-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloading(false);
      toast({ title: "✅ Portfolio report downloaded as CSV.", duration: 4000 });
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Section B — Individual Dealer Report */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-3">Individual Dealer Report</h2>
        <Select value={selectedDealerId ?? ""} onValueChange={(v) => setSelectedDealerId(v || null)}>
          <SelectTrigger className="w-full sm:w-80 h-9">
            <SelectValue placeholder="Select a dealer to generate report" />
          </SelectTrigger>
          <SelectContent>
            {dealers.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.tradingName} — {d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedDealer && (
          <div className="mt-4">
            <DealerReport dealer={selectedDealer} />
          </div>
        )}
      </div>

      {/* Section A — Portfolio Summary */}
      <div data-tour="reports-summary">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Portfolio Summary Report</h1>
            <p className="text-sm text-muted-foreground">Average risk score: {avgScore} across {dealers.length} dealers</p>
          </div>
          <Button variant="outline" onClick={handleDownloadPortfolio} disabled={downloading} className="gap-2">
            <FileDown className="h-4 w-4" />
            {downloading ? "⏳ Generating..." : "📥 Download Portfolio Report (CSV)"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PortfolioHealthCard />
          <ScoreDistributionCard />
          <SectionHeatmapCard />
          <CssSummaryCard />
          <OpenActionsCard />
          <DocExpirySummaryCard />
          <AlertsSummaryCard />
        </div>
      </div>
    </div>
  );
}
