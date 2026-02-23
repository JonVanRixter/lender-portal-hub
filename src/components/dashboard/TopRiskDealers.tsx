import { useNavigate } from "react-router-dom";
import type { Dealer, RagStatus } from "@/types";

const RAG_BADGE: Record<RagStatus, string> = {
  Green: "bg-rag-green/15 text-rag-green",
  Amber: "bg-rag-amber/15 text-rag-amber",
  Red: "bg-rag-red/15 text-rag-red",
};

export function TopRiskDealers({ dealers }: { dealers: Dealer[] }) {
  const navigate = useNavigate();
  const top5 = [...dealers].sort((a, b) => a.overallScore - b.overallScore).slice(0, 5);

  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Top Risk Dealers</h3>
      <div className="space-y-2">
        {top5.map((d, i) => (
          <div
            key={d.id}
            onClick={() => navigate(`/dealers/${d.id}`)}
            className="flex items-center gap-3 rounded-md border border-border p-3 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{d.name}</p>
            </div>
            <span className="text-sm font-bold text-foreground tabular-nums">{d.overallScore}</span>
            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${RAG_BADGE[d.ragStatus]}`}>
              {d.ragStatus}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
