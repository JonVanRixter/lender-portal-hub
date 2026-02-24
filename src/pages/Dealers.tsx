import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDealers } from "@/contexts/DealersContext";
import { DealerList } from "@/components/dealers/DealerList";
import { DealerDetail } from "@/components/dealers/DealerDetail";
import { OnboardingPipeline } from "@/components/dealers/OnboardingPipeline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dealers() {
  const { id } = useParams();
  const { dealers } = useDealers();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "onboarding" ? "onboarding" : "active");

  useEffect(() => {
    if (searchParams.get("tab") === "onboarding" && activeTab !== "onboarding") {
      setActiveTab("onboarding");
    }
  }, [searchParams]);

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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="active">Active Dealers</TabsTrigger>
        <TabsTrigger value="onboarding">Onboarding Pipeline</TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <DealerList dealers={dealers} onAddDealer={() => setActiveTab("onboarding")} />
      </TabsContent>
      <TabsContent value="onboarding">
        <OnboardingPipeline />
      </TabsContent>
    </Tabs>
  );
}
