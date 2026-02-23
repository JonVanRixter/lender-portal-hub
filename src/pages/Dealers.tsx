import { useParams, useSearchParams } from "react-router-dom";
import { dealers } from "@/data/mockData";

export default function Dealers() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const ragFilter = searchParams.get("rag");

  // Single dealer view
  if (id) {
    const dealer = dealers.find((d) => d.id === id);
    if (!dealer) {
      return (
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dealer Not Found</h1>
          <p className="mt-2 text-muted-foreground">No dealer with ID "{id}".</p>
        </div>
      );
    }
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground">{dealer.name}</h1>
        <p className="mt-1 text-muted-foreground">Trading as: {dealer.tradingName}</p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground uppercase">Score</p>
            <p className="text-2xl font-bold text-foreground">{dealer.overallScore}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground uppercase">RAG</p>
            <p className="text-2xl font-bold text-foreground">{dealer.ragStatus}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground uppercase">CSS</p>
            <p className="text-2xl font-bold text-foreground">{dealer.cssScore}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground uppercase">Last Audit</p>
            <p className="text-sm font-bold text-foreground">{new Date(dealer.lastAuditDate).toLocaleDateString("en-GB")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dealers</h1>
      <p className="mt-2 text-muted-foreground">
        Manage and monitor dealer profiles.
        {ragFilter && <span className="ml-1 font-medium"> Filtered: {ragFilter}</span>}
      </p>
    </div>
  );
}
