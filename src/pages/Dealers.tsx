import { useParams, useSearchParams } from "react-router-dom";
import { useDealers } from "@/contexts/DealersContext";
import { DealerList } from "@/components/dealers/DealerList";
import { DealerDetail } from "@/components/dealers/DealerDetail";

export default function Dealers() {
  const { id } = useParams();
  const { dealers } = useDealers();

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
    return <DealerDetail dealer={dealer} />;
  }

  return <DealerList dealers={dealers} />;
}
