import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Mail, Phone, Globe, MapPin, Building2, AlertCircle, Clock, CheckCircle2, Users, UserCheck, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAlerts } from "@/contexts/AlertsContext";
import { ReAuditModal } from "./ReAuditModal";
import type { Dealer, RagStatus, SectionResult, ActionStatus, AuditChange } from "@/types";

const RAG_BADGE: Record<RagStatus, string> = {
  Green: "bg-rag-green/15 text-rag-green border-rag-green/30",
  Amber: "bg-rag-amber/15 text-rag-amber border-rag-amber/30",
  Red: "bg-rag-red/15 text-rag-red border-rag-red/30",
};

const RAG_BAR: Record<RagStatus, string> = {
  Green: "bg-rag-green",
  Amber: "bg-rag-amber",
  Red: "bg-rag-red",
};

const RESULT_ICON: Record<SectionResult, React.ReactNode> = {
  Pass: <CheckCircle2 className="h-4 w-4 text-rag-green" />,
  Pending: <Clock className="h-4 w-4 text-rag-amber" />,
  Fail: <AlertCircle className="h-4 w-4 text-rag-red" />,
};

const ACTION_BADGE: Record<ActionStatus, string> = {
  Open: "bg-rag-red/15 text-rag-red",
  "In Progress": "bg-rag-amber/15 text-rag-amber",
  Completed: "bg-rag-green/15 text-rag-green",
};

const CHANGE_ICON: Record<AuditChange, React.ReactNode> = {
  up: <TrendingUp className="h-4 w-4 text-rag-green" />,
  down: <TrendingDown className="h-4 w-4 text-rag-red" />,
  neutral: <Minus className="h-4 w-4 text-muted-foreground" />,
};

export function DealerDetail({ dealer }: { dealer: Dealer }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { alerts, acknowledge } = useAlerts();
  const [reAuditOpen, setReAuditOpen] = useState(() => searchParams.get("reaudit") === "true");

  // Active threshold breach for this dealer
  const activeBreachAlert = useMemo(
    () => alerts.find((a) => a.dealerId === dealer.id && a.type === "Threshold Breach" && a.status === "Pending"),
    [alerts, dealer.id]
  );

  // Extract previous score from breach alert message for context
  const breachContext = useMemo(() => {
    if (!activeBreachAlert) return null;
    // Try to parse "from Green (88) to Amber (66)" pattern
    const match = activeBreachAlert.message.match(/from (\w+) \((\d+)\)/);
    if (match) return { previousScore: Number(match[2]), previousRag: match[1] as RagStatus };
    return null;
  }, [activeBreachAlert]);

  const handleOpenReAudit = () => {
    setReAuditOpen(true);
  };

  const handleCloseReAudit = () => {
    setReAuditOpen(false);
    // Remove reaudit param
    if (searchParams.has("reaudit")) {
      searchParams.delete("reaudit");
      setSearchParams(searchParams, { replace: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/dealers")} className="mb-3 -ml-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dealers
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{dealer.name}</h1>
              <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${RAG_BADGE[dealer.ragStatus]}`}>
                {dealer.ragStatus}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">Trading as: {dealer.tradingName}</p>
          </div>
          <div className="flex items-center gap-2">
            {dealer.cssStatus && (
              <Badge variant={dealer.cssStatus === "Reward" ? "default" : "secondary"} className="text-xs uppercase tracking-wide">
                CSS: {dealer.cssStatus}
              </Badge>
            )}
            <Button onClick={handleOpenReAudit} className="gap-1.5 bg-[#3d1468] hover:bg-[#3d1468]/90 text-white">
              <RefreshCw className="h-4 w-4" /> Update Audit
            </Button>
          </div>
        </div>
      </div>

      {/* Threshold Breach Banner */}
      {activeBreachAlert && (
        <div className="rounded-md border border-rag-red/30 bg-rag-red/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-rag-red mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Active threshold breach alert for this dealer.</p>
              <p className="text-xs text-muted-foreground mt-0.5">{activeBreachAlert.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => acknowledge(activeBreachAlert.id)}>
              Acknowledge Alert
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1 bg-[#3d1468] hover:bg-[#3d1468]/90 text-white" onClick={handleOpenReAudit}>
              <RefreshCw className="h-3.5 w-3.5" /> Re-run Audit Now
            </Button>
          </div>
        </div>
      )}

      {/* Score Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Overall Score</p>
            <p className="text-3xl font-bold text-foreground mt-1">{dealer.overallScore}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">CSS Score</p>
            <p className="text-3xl font-bold text-foreground mt-1">{dealer.cssScore}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Last Audit</p>
            <p className="text-lg font-bold text-foreground mt-1">
              {new Date(dealer.lastAuditDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Sections</p>
            <p className="text-3xl font-bold text-foreground mt-1">{dealer.sections?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      {(dealer.address || dealer.contactEmail || dealer.contactPhone || dealer.website) && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Contact Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {dealer.address && (
              <div className="flex items-start gap-2 text-foreground"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />{dealer.address}</div>
            )}
            {dealer.contactEmail && (
              <div className="flex items-center gap-2 text-foreground"><Mail className="h-4 w-4 text-muted-foreground shrink-0" />{dealer.contactEmail}</div>
            )}
            {dealer.contactPhone && (
              <div className="flex items-center gap-2 text-foreground"><Phone className="h-4 w-4 text-muted-foreground shrink-0" />{dealer.contactPhone}</div>
            )}
            {dealer.website && (
              <div className="flex items-center gap-2 text-foreground"><Globe className="h-4 w-4 text-muted-foreground shrink-0" />{dealer.website}</div>
            )}
            {dealer.companiesHouseNumber && (
              <div className="flex items-center gap-2 text-foreground"><Building2 className="h-4 w-4 text-muted-foreground shrink-0" />CH: {dealer.companiesHouseNumber}</div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Directors & Shareholders */}
      {(dealer.directors?.length || dealer.shareholders?.length) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {dealer.directors && dealer.directors.length > 0 && (
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" /> Directors ({dealer.directors.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dealer.directors.map((d, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.role}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Appointed: {new Date(d.appointedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {dealer.shareholders && dealer.shareholders.length > 0 && (
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4" /> Shareholders ({dealer.shareholders.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dealer.shareholders.map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border border-border p-3">
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <Badge variant="secondary" className="text-xs">{s.shareholding}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Audit Sections */}
      {dealer.sections && dealer.sections.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Audit Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dealer.sections.map((s) => (
              <div key={s.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {RESULT_ICON[s.result]}
                    <span className="font-semibold text-sm text-foreground">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tabular-nums text-foreground">{s.score}</span>
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${RAG_BADGE[s.ragStatus]}`}>
                      {s.ragStatus}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${RAG_BAR[s.ragStatus]}`} style={{ width: `${s.score}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">{s.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Bottom row: Key Actions + Audit History side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Key Actions */}
        {dealer.keyActions && dealer.keyActions.length > 0 && (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                Key Actions ({dealer.keyActions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {dealer.keyActions.map((a) => (
                <div key={a.id} className="rounded-md border border-border p-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium text-foreground">{a.description}</p>
                    <span className={`shrink-0 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${ACTION_BADGE[a.status]}`}>
                      {a.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Due: {new Date(a.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    <span>→ {a.assignedTo}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Audit History */}
        {dealer.auditHistory && dealer.auditHistory.length > 0 && (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Audit History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dealer.auditHistory.map((h) => (
                  <div key={h.id} className="flex items-center justify-between rounded-md border border-border p-3">
                    <div className="flex items-center gap-3">
                      {CHANGE_ICON[h.change]}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(h.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                        <p className="text-xs text-muted-foreground">by {h.initiatedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold tabular-nums text-foreground">{h.overallScore}</span>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${RAG_BADGE[h.ragStatus]}`}>
                        {h.ragStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notes */}
      {dealer.notes && (
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">{dealer.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Re-Audit Modal */}
      <ReAuditModal
        open={reAuditOpen}
        onClose={handleCloseReAudit}
        dealer={dealer}
        breachContext={breachContext}
      />
    </div>
  );
}
