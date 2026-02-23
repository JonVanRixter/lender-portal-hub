import { ClipboardCheck, AlertTriangle, FileUp, RotateCcw } from "lucide-react";
import type { ActivityItem } from "@/types";

const EVENT_CONFIG: Record<ActivityItem["eventType"], { icon: typeof ClipboardCheck; colorClass: string }> = {
  "Audit completed": { icon: ClipboardCheck, colorClass: "text-rag-green bg-rag-green/10" },
  "Threshold breach": { icon: AlertTriangle, colorClass: "text-rag-red bg-rag-red/10" },
  "Document uploaded": { icon: FileUp, colorClass: "text-primary bg-primary/10" },
  "Re-audit triggered": { icon: RotateCcw, colorClass: "text-rag-amber bg-rag-amber/10" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function RecentActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Recent Activity</h3>
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
        {items.map((item) => {
          const cfg = EVENT_CONFIG[item.eventType];
          const Icon = cfg.icon;
          return (
            <div key={item.id} className="flex items-start gap-3 rounded-md p-2 hover:bg-muted/40 transition-colors">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${cfg.colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">
                  <span className="font-medium">{item.dealerName}</span>
                </p>
                <p className="text-xs text-muted-foreground">{item.eventType}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo(item.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
