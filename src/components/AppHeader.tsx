import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, User, Menu, ArrowRight, Shield } from "lucide-react";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { useAlerts } from "@/contexts/AlertsContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { AlertSeverity } from "@/types";

const ROLES: UserRole[] = ["Super Admin", "Admin", "User"];

const ROLE_BADGE: Record<UserRole, string> = {
  "Super Admin": "bg-rag-red/15 text-rag-red",
  Admin: "bg-rag-amber/15 text-rag-amber",
  User: "bg-rag-green/15 text-rag-green",
};

const SEVERITY_DOT: Record<AlertSeverity, string> = {
  High: "bg-rag-red",
  Medium: "bg-rag-amber",
  Low: "bg-rag-green",
};

interface AppHeaderProps {
  onMenuToggle?: () => void;
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const { user, logout, setRole } = useAuth();
  const { alerts, pendingCount, getDealerName } = useAlerts();
  const navigate = useNavigate();

  const latestPending = alerts
    .filter((a) => a.status === "Pending")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-primary px-4 shadow-md">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-primary-foreground hover:bg-white/10"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold tracking-tight text-primary-foreground uppercase">
            DealerGuard
          </span>
          <span className="hidden sm:inline text-sm font-normal text-primary-foreground/70">
            – Lender Portal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-white/10" data-tour="notification-bell">
              <Bell className="h-5 w-5" />
              {pendingCount > 0 && (
                <span
                  key={pendingCount}
                  className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground animate-[badge-bounce_0.4s_ease-out]"
                >
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Pending Alerts</h3>
              <p className="text-xs text-muted-foreground">{pendingCount} unacknowledged</p>
            </div>
            {latestPending.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No pending alerts
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto">
                {latestPending.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-muted/40 transition-colors"
                  >
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[alert.severity]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{alert.type}</p>
                      <p className="text-xs text-muted-foreground truncate">{getDealerName(alert.dealerId)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs text-muted-foreground">{fmtDate(alert.date)}</span>
                      <p className="text-[10px] font-medium text-muted-foreground">{alert.severity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="border-t border-border px-4 py-2">
              <button
                onClick={() => navigate("/alerts")}
                className="flex w-full items-center justify-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View all alerts
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2 text-primary-foreground hover:bg-white/10">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                {user?.name?.charAt(0) ?? "U"}
              </div>
              <span className="hidden text-sm font-medium text-primary-foreground sm:inline-block">
                {user?.name}
              </span>
              <ChevronDown className="h-4 w-4 text-primary-foreground/70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <Shield className="mr-2 h-4 w-4" />
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_BADGE[user?.role ?? "User"]}`}>
                {user?.role}
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Role (POC)</DropdownMenuLabel>
            {ROLES.map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => setRole(r)}
                className={user?.role === r ? "bg-muted" : ""}
              >
                {r}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
