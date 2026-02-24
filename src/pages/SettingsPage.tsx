import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { dealers as initialDealers } from "@/data/mockData";
import { addAuditEntry, getAuditLog, type AuditEntry } from "@/lib/auditLog";
import type { RagStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Lock, History } from "lucide-react";
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

// ─── Team mock data ───
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Risk Manager" | "Viewer";
  status: "Active" | "Invited";
  lastLogin: string;
}

const initialTeam: TeamMember[] = [
  { id: "u1", name: "Sarah Mitchell", email: "s.mitchell@lender.com", role: "Admin", status: "Active", lastLogin: "2026-02-23T09:00:00Z" },
  { id: "u2", name: "James Hart", email: "j.hart@lender.com", role: "Risk Manager", status: "Active", lastLogin: "2026-02-22T16:30:00Z" },
  { id: "u3", name: "Emily Chen", email: "e.chen@lender.com", role: "Viewer", status: "Active", lastLogin: "2026-02-21T11:00:00Z" },
  { id: "u4", name: "David Okonkwo", email: "d.okonkwo@lender.com", role: "Risk Manager", status: "Invited", lastLogin: "—" },
];

const ROLE_PILL: Record<TeamMember["role"], string> = {
  Admin: "bg-primary/15 text-primary",
  "Risk Manager": "bg-rag-amber/15 text-rag-amber",
  Viewer: "bg-muted text-muted-foreground",
};

function LockedOverlay({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 shadow-sm">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">{message}</span>
      </div>
    </div>
  );
}

function AuditLogPanel() {
  const [entries] = useState<AuditEntry[]>(() => getAuditLog());

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">No audit entries yet.</p>
    );
  }

  const fmtTs = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time</th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">User</th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Field</th>
            <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Old → New</th>
          </tr>
        </thead>
        <tbody>
          {entries.slice(0, 50).map((e) => (
            <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
              <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{fmtTs(e.timestamp)}</td>
              <td className="px-3 py-2 font-medium text-foreground">{e.user}</td>
              <td className="px-3 py-2 text-foreground">{e.action}</td>
              <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">{e.field}</td>
              <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">
                <span className="text-rag-red">{e.oldValue}</span>
                {" → "}
                <span className="text-rag-green">{e.newValue}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "Super Admin";

  // General
  const [contactEmail, setContactEmail] = useState("compliance@acmelending.com");
  const [dateFormat, setDateFormat] = useState<"DD/MM/YYYY" | "MM/DD/YYYY">("DD/MM/YYYY");
  const [darkMode, setDarkMode] = useState(false);

  // RAG thresholds
  const [greenMin, setGreenMin] = useState(75);
  const [amberMin, setAmberMin] = useState(50);
  const [maxAmberForGreen, setMaxAmberForGreen] = useState(1);
  const [maxRedForAmber, setMaxRedForAmber] = useState(0);
  const [showThresholdConfirm, setShowThresholdConfirm] = useState(false);

  // Track original values for audit
  const [origGreen] = useState(75);
  const [origAmber] = useState(50);
  const [origMaxAmberForGreen] = useState(1);
  const [origMaxRedForAmber] = useState(0);

  // Team
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<TeamMember["role"]>("Viewer");

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [inAppNotif, setInAppNotif] = useState(true);
  const [notifThreshold, setNotifThreshold] = useState(true);
  const [notifDocExpiry, setNotifDocExpiry] = useState(true);
  const [notifManualReview, setNotifManualReview] = useState(false);

  // Audit log
  const [showAuditLog, setShowAuditLog] = useState(false);

  const handleThemeToggle = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
  };

  const handleSaveThresholds = () => {
    if (!isSuperAdmin) return;

    // Audit each changed field
    const userName = user?.name ?? "Unknown";
    const userRole = user?.role ?? "Unknown";

    if (greenMin !== origGreen) {
      addAuditEntry({ user: userName, role: userRole, action: "Update Threshold", field: "Green Minimum", oldValue: String(origGreen), newValue: String(greenMin) });
    }
    if (amberMin !== origAmber) {
      addAuditEntry({ user: userName, role: userRole, action: "Update Threshold", field: "Amber Minimum", oldValue: String(origAmber), newValue: String(amberMin) });
    }
    if (maxAmberForGreen !== origMaxAmberForGreen) {
      addAuditEntry({ user: userName, role: userRole, action: "Update Threshold", field: "Max Amber for Green", oldValue: String(origMaxAmberForGreen), newValue: String(maxAmberForGreen) });
    }
    if (maxRedForAmber !== origMaxRedForAmber) {
      addAuditEntry({ user: userName, role: userRole, action: "Update Threshold", field: "Max Red for Amber", oldValue: String(origMaxRedForAmber), newValue: String(maxRedForAmber) });
    }

    // POC: recompute RAG statuses
    const recomputed = initialDealers.map((d) => {
      let ragStatus: RagStatus = "Red";
      if (d.overallScore >= greenMin) ragStatus = "Green";
      else if (d.overallScore >= amberMin) ragStatus = "Amber";
      return { ...d, ragStatus };
    });

    const greenCount = recomputed.filter((d) => d.ragStatus === "Green").length;
    const amberCount = recomputed.filter((d) => d.ragStatus === "Amber").length;
    const redCount = recomputed.filter((d) => d.ragStatus === "Red").length;

    setShowThresholdConfirm(false);
    toast({
      title: "Thresholds Updated",
      description: `RAG recalculated: ${greenCount} Green, ${amberCount} Amber, ${redCount} Red`,
    });
  };

  const handleAddUser = () => {
    if (!newEmail) return;
    if (!isSuperAdmin) return;
    const member: TeamMember = {
      id: `u-${Date.now()}`,
      name: newEmail.split("@")[0],
      email: newEmail,
      role: newRole,
      status: "Invited",
      lastLogin: "—",
    };
    setTeam((prev) => [...prev, member]);
    addAuditEntry({
      user: user?.name ?? "Unknown",
      role: user?.role ?? "Unknown",
      action: "Add Team Member",
      field: "Team",
      oldValue: "—",
      newValue: `${newEmail} (${newRole})`,
    });
    setNewEmail("");
    setNewRole("Viewer");
    setShowAddUser(false);
    toast({ title: "User Invited", description: `Invitation sent to ${newEmail}` });
  };

  const handleSaveNotifications = () => {
    toast({ title: "Preferences Saved", description: "Notification preferences updated." });
  };

  const fmtDate = (iso: string) => {
    if (iso === "—") return "—";
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure portal preferences and team access</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Role: {user?.role}
          </Badge>
          {isSuperAdmin && (
            <Button variant="outline" size="sm" onClick={() => setShowAuditLog(true)}>
              <History className="h-4 w-4 mr-1" />
              Audit Log
            </Button>
          )}
        </div>
      </div>

      {/* ─── General ─── */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input value="Acme Lending Ltd" readOnly className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Primary Contact Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>Date Format</Label>
              <div className="space-y-2">
                {(["DD/MM/YYYY", "MM/DD/YYYY"] as const).map((fmt) => (
                  <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dateFormat"
                      checked={dateFormat === fmt}
                      onChange={() => setDateFormat(fmt)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm text-foreground">{fmt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Theme</Label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Light</span>
                <Switch checked={darkMode} onCheckedChange={handleThemeToggle} />
                <span className="text-sm text-muted-foreground">Dark</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── RAG Thresholds (Super Admin only) ─── */}
      <Card className="border-border relative" data-tour="rag-thresholds">
        {!isSuperAdmin && <LockedOverlay message="Super Admin access required to modify thresholds" />}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">RAG Threshold Configuration</CardTitle>
            {!isSuperAdmin && <Lock className="h-4 w-4 text-muted-foreground" />}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Green: Score ≥</Label>
                <span className="text-sm font-bold text-rag-green">{greenMin}</span>
              </div>
              <Slider
                value={[greenMin]}
                onValueChange={([v]) => {
                  setGreenMin(v);
                  if (v <= amberMin) setAmberMin(Math.max(0, v - 1));
                }}
                min={0}
                max={100}
                step={1}
                disabled={!isSuperAdmin}
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Amber: Score ≥</Label>
                <span className="text-sm font-bold text-rag-amber">{amberMin}</span>
              </div>
              <Slider
                value={[amberMin]}
                onValueChange={([v]) => {
                  setAmberMin(v);
                  if (v >= greenMin) setGreenMin(Math.min(100, v + 1));
                }}
                min={0}
                max={100}
                step={1}
                disabled={!isSuperAdmin}
              />
            </div>
          </div>

          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground mb-1">Current breakdown:</p>
            <p className="text-sm text-foreground">
              <span className="text-rag-green font-medium">Green ≥ {greenMin}</span>
              {" · "}
              <span className="text-rag-amber font-medium">{amberMin}–{greenMin - 1} Amber</span>
              {" · "}
              <span className="text-rag-red font-medium">{"< "}{amberMin} Red</span>
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Max Amber sections for overall Green</Label>
              <Input
                type="number"
                min={0}
                max={10}
                value={maxAmberForGreen}
                onChange={(e) => setMaxAmberForGreen(Number(e.target.value))}
                className="w-24"
                disabled={!isSuperAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Red sections for overall Amber</Label>
              <Input
                type="number"
                min={0}
                max={10}
                value={maxRedForAmber}
                onChange={(e) => setMaxRedForAmber(Number(e.target.value))}
                className="w-24"
                disabled={!isSuperAdmin}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setShowThresholdConfirm(true)} disabled={!isSuperAdmin}>
              Save Thresholds
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Threshold confirmation dialog */}
      <Dialog open={showThresholdConfirm} onOpenChange={setShowThresholdConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Threshold Change</DialogTitle>
            <DialogDescription>
              Changing thresholds will re-calculate all dealer RAG scores. This action will be recorded in the audit log. Continue?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowThresholdConfirm(false)}>Cancel</Button>
            <Button onClick={handleSaveThresholds}>Continue</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Team Management (Super Admin only for adding) ─── */}
      <Card className="border-border">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">Team Management</CardTitle>
          <Button size="sm" onClick={() => setShowAddUser(true)} disabled={!isSuperAdmin}>
            {!isSuperAdmin && <Lock className="h-3 w-3 mr-1" />}
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Email</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {team.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-foreground">{m.name}</td>
                    <td className="px-3 py-2.5 text-muted-foreground hidden sm:table-cell">{m.email}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_PILL[m.role]}`}>{m.role}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${m.status === "Active" ? "bg-rag-green/15 text-rag-green" : "bg-rag-amber/15 text-rag-amber"}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground hidden md:table-cell">{fmtDate(m.lastLogin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User modal */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>Invite a new team member to the portal.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="user@lender.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as TeamMember["role"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Risk Manager">Risk Manager</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowAddUser(false)}>Cancel</Button>
              <Button onClick={handleAddUser} disabled={!newEmail}>Invite</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Notification Preferences ─── */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <Label>Email Notifications</Label>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border p-3">
              <Label>In-app Notifications</Label>
              <Switch checked={inAppNotif} onCheckedChange={setInAppNotif} />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Notify me about:</Label>
            <div className="space-y-2">
              {([
                { label: "Threshold breaches", checked: notifThreshold, onChange: setNotifThreshold },
                { label: "Document expiry warnings", checked: notifDocExpiry, onChange: setNotifDocExpiry },
                { label: "Manual review requests", checked: notifManualReview, onChange: setNotifManualReview },
              ] as const).map((item) => (
                <label key={item.label} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={item.checked} onCheckedChange={(v) => item.onChange(!!v)} />
                  <span className="text-sm text-foreground">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveNotifications}>Save Preferences</Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Audit Log Dialog ─── */}
      <Dialog open={showAuditLog} onOpenChange={setShowAuditLog}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Settings Audit Log
            </DialogTitle>
            <DialogDescription>
              Complete record of all configuration changes made by Super Admin users.
            </DialogDescription>
          </DialogHeader>
          <AuditLogPanel />
        </DialogContent>
      </Dialog>
    </div>
  );
}
