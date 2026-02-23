import { useState, useMemo } from "react";
import { dealers, activityFeed } from "@/data/mockData";
import type { RagStatus } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { PortfolioHealthChart } from "@/components/dashboard/PortfolioHealthChart";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { DealerWatchlist } from "@/components/dashboard/DealerWatchlist";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { TopRiskDealers } from "@/components/dashboard/TopRiskDealers";

export default function Dashboard() {
  const [ragFilter, setRagFilter] = useState<RagStatus | null>(null);

  const ragCounts = useMemo(() => {
    const counts: Record<RagStatus, number> = { Green: 0, Amber: 0, Red: 0 };
    dealers.forEach((d) => counts[d.ragStatus]++);
    return counts;
  }, []);

  const avgScore = useMemo(
    () => Math.round(dealers.reduce((sum, d) => sum + d.overallScore, 0) / dealers.length),
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Portfolio health and compliance overview</p>
      </div>

      {/* Top row: Chart + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 border-border">
          <CardContent className="p-5">
            <PortfolioHealthChart counts={ragCounts} onSegmentClick={setRagFilter} activeFilter={ragFilter} />
          </CardContent>
        </Card>
        <div className="lg:col-span-2 flex flex-col justify-center">
          <KpiCards redCount={ragCounts.Red} averageScore={avgScore} />
        </div>
      </div>

      {/* Watchlist */}
      <Card className="border-border">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Dealer Watchlist</h3>
          <DealerWatchlist dealers={dealers} ragFilter={ragFilter} onRagFilterChange={setRagFilter} />
        </CardContent>
      </Card>

      {/* Bottom row: Activity + Top Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardContent className="p-5">
            <RecentActivityFeed items={activityFeed} />
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-5">
            <TopRiskDealers dealers={dealers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
