import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  FileText,
  AlertTriangle,
  ShieldBan,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Dealers", path: "/dealers", icon: Building2 },
  { title: "Documents", path: "/documents", icon: FileText },
  { title: "Alerts", path: "/alerts", icon: AlertTriangle },
  { title: "Do Not Deal", path: "/do-not-deal", icon: ShieldBan },
  { title: "Reports", path: "/reports", icon: BarChart3 },
  { title: "Settings", path: "/settings", icon: Settings },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const location = useLocation();

  const sidebar = (
    <div className="flex h-full w-60 flex-col bg-sidebar text-sidebar-foreground">
      {/* Mobile close button */}
      <div className="flex items-center justify-end p-2 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-accent-foreground")} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-[10px] text-sidebar-muted">DealerGuard v0.1 POC</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:shrink-0" data-tour="sidebar">{sidebar}</aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />
          <div className="relative z-50 h-full w-60 shadow-xl">{sidebar}</div>
        </div>
      )}
    </>
  );
}
