import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LogOut, User, Menu, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAlerts } from "@/contexts/AlertsContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { AlertSeverity } from "@/types";

const SEVERITY_DOT: Record<AlertSeverity, string> = {
  High: "bg-rag-red",
  Medium: "bg-rag-amber",
  Low: "bg-rag-green",
};

interface AppHeaderProps {
  onMenuToggle?: () => void;
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const { alerts, pendingCount, getDealerName } = useAlerts();
  const navigate = useNavigate();

  const latestPending = alerts
    .filter((a) => a.status === "Pending")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 shadow-sm">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-base font-bold tracking-tight text-foreground">
          DealerGuard
          <span className="ml-1.5 font-normal text-muted-foreground">
            – Lender Portal
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {pendingCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rag-red text-[10px] font-bold text-primary-foreground">
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
            <Button variant="ghost" className="gap-2 px-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {user?.name?.charAt(0) ?? "U"}
              </div>
              <span className="hidden text-sm font-medium text-foreground sm:inline-block">
                {user?.name}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              {user?.email}
            </DropdownMenuItem>
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
