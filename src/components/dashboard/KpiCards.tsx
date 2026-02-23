import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<number>();
  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [target, duration]);
  return value;
}

function getRag(score: number) {
  if (score >= 75) return { label: "Green", bg: "bg-rag-green/10", text: "text-rag-green", pill: "bg-rag-green/15 text-rag-green border-rag-green/30" };
  if (score >= 50) return { label: "Amber", bg: "bg-rag-amber/10", text: "text-rag-amber", pill: "bg-rag-amber/15 text-rag-amber border-rag-amber/30" };
  return { label: "Red", bg: "bg-rag-red/10", text: "text-rag-red", pill: "bg-rag-red/15 text-rag-red border-rag-red/30" };
}

interface KpiCardsProps {
  redCount: number;
  averageScore: number;
}

export function KpiCards({ redCount, averageScore }: KpiCardsProps) {
  const navigate = useNavigate();
  const animatedRed = useCountUp(redCount, 800);
  const animatedAvg = useCountUp(averageScore, 1200);
  const rag = getRag(averageScore);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card
        className="cursor-pointer border-border hover:border-rag-red/40 transition-colors group"
        onClick={() => navigate("/dealers?rag=Red")}
      >
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rag-red/10 text-rag-red group-hover:bg-rag-red/20 transition-colors">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Critical Alerts</p>
            <p className="text-3xl font-bold text-foreground">{animatedRed}</p>
            <p className="text-xs text-muted-foreground">Red-rated dealers</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="flex items-center gap-4 p-5">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${rag.bg} ${rag.text} transition-colors`}>
            <TrendingDown className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Risk Score</p>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-foreground">{animatedAvg}</p>
              <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${rag.pill}`}>
                {rag.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              across all dealers · Thresholds: <span className="text-rag-green">≥75</span> / <span className="text-rag-amber">50–74</span> / <span className="text-rag-red">&lt;50</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
