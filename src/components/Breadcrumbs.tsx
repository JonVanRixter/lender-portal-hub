import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { dealers } from "@/data/mockData";
import { useOnboarding } from "@/contexts/OnboardingContext";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  dealers: "Dealers",
  documents: "Documents",
  alerts: "Alerts",
  "do-not-deal": "Do Not Deal",
  reports: "Reports",
  settings: "Settings",
  onboarding: "Onboarding",
  "pre-screening": "Pre-Screening",
  checklist: "Checklist",
  new: "New Application",
};

export function Breadcrumbs() {
  const location = useLocation();
  const { applications } = useOnboarding();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard")) {
    return null;
  }

  const crumbs: { label: string; href?: string }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const path = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;

    if (ROUTE_LABELS[seg]) {
      // For "onboarding", link back to pipeline tab
      const href = seg === "onboarding" ? "/dealers?tab=onboarding" : path;
      crumbs.push({ label: ROUTE_LABELS[seg], href: isLast ? undefined : href });
    } else {
      const parentSeg = segments[i - 1];
      if (parentSeg === "dealers") {
        const dealer = dealers.find((d) => d.id === seg);
        crumbs.push({ label: dealer?.tradingName ?? seg });
      } else if (parentSeg === "onboarding") {
        // Resolve onboarding app UUID to trading name
        const app = applications.find((a) => a.id === seg);
        crumbs.push({ label: app?.tradingName || app?.companyName || seg, href: isLast ? undefined : path });
      } else {
        crumbs.push({ label: seg });
      }
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
      <Link to="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3" />
          {crumb.href ? (
            <Link to={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
