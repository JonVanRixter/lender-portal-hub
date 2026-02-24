import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, ShieldBan, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { dealers } from "@/data/mockData";
import { doNotDealEntries } from "@/data/mockData";
import { onboardingApplications } from "@/data/onboardingMockData";
import { useToast } from "@/hooks/use-toast";

export default function NewApplicationPage() {
  const navigate = useNavigate();
  const { createApplication, applications } = useOnboarding();
  const { toast } = useToast();

  const [form, setForm] = useState({
    companyName: "",
    companiesHouseNumber: "",
    tradingName: "",
    websiteUrl: "",
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
    street: "",
    town: "",
    county: "",
    postcode: "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Validate CH number format
  const chValid = /^\d{8}$/.test(form.companiesHouseNumber);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.primaryContactEmail);

  // Duplicate checks
  const duplicateDealer = useMemo(() => {
    if (!form.companiesHouseNumber || !chValid) return null;
    const existing = dealers.find((d) => d.companiesHouseNumber === form.companiesHouseNumber);
    if (existing) return { type: "dealer" as const, name: existing.tradingName };
    const existingApp = [...onboardingApplications, ...applications].find(
      (a) => "companiesHouseNumber" in a && (a as any).companiesHouseNumber === form.companiesHouseNumber
    );
    if (existingApp) return { type: "application" as const, name: (existingApp as any).dealerName || (existingApp as any).companyName };
    return null;
  }, [form.companiesHouseNumber, chValid, applications]);

  const dndMatch = useMemo(() => {
    if (!form.companiesHouseNumber || !chValid) return null;
    return doNotDealEntries.find((e) => e.companiesHouseNumber === form.companiesHouseNumber) || null;
  }, [form.companiesHouseNumber, chValid]);

  const requiredFilled =
    form.companyName &&
    form.companiesHouseNumber &&
    chValid &&
    form.tradingName &&
    form.websiteUrl &&
    form.primaryContactName &&
    form.primaryContactEmail &&
    emailValid &&
    form.primaryContactPhone;

  const handleSave = () => {
    const app = createApplication({
      companyName: form.companyName,
      companiesHouseNumber: form.companiesHouseNumber,
      tradingName: form.tradingName,
      websiteUrl: form.websiteUrl,
      primaryContactName: form.primaryContactName,
      primaryContactEmail: form.primaryContactEmail,
      primaryContactPhone: form.primaryContactPhone,
      address: { street: form.street, town: form.town, county: form.county, postcode: form.postcode },
      status: "pre-screening",
    });
    toast({ title: "Application Created", description: `${form.tradingName} saved. Proceeding to pre-screening.` });
    navigate(`/onboarding/${app.id}/pre-screening`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/dealers")}>
        <ArrowLeft className="h-4 w-4" /> Back to Onboarding
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">New Dealer Application</CardTitle>
          <CardDescription>
            Start by entering the dealer's basic details. We'll use these to begin pre-screening checks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Duplicate warnings */}
          {duplicateDealer && (
            <div className="flex items-start gap-3 rounded-md border border-rag-amber/50 bg-rag-amber/10 p-3">
              <AlertTriangle className="h-5 w-5 text-rag-amber shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                ⚠️ A dealer with this Companies House Number already exists in your portfolio (<strong>{duplicateDealer.name}</strong>). Check the existing record before proceeding.
              </p>
            </div>
          )}
          {dndMatch && (
            <div className="flex items-start gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <ShieldBan className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                🚫 This company or a connected director appears on the Do Not Deal list. Review before proceeding.
                <Button variant="link" size="sm" className="ml-2 h-auto p-0" onClick={() => navigate("/do-not-deal")}>
                  View DND Entry
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Company Name (Legal Registered) *</Label>
              <Input value={form.companyName} onChange={set("companyName")} placeholder="e.g. Acme Motors Ltd" />
            </div>
            <div className="space-y-2">
              <Label>Companies House Number *</Label>
              <Input
                value={form.companiesHouseNumber}
                onChange={set("companiesHouseNumber")}
                placeholder="e.g. 12345678"
                maxLength={8}
              />
              {form.companiesHouseNumber && !chValid && (
                <p className="text-xs text-destructive">Must be 8 digits</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Trading Name *</Label>
              <Input value={form.tradingName} onChange={set("tradingName")} placeholder="e.g. Acme Cars" />
            </div>
            <div className="space-y-2">
              <Label>Website URL *</Label>
              <Input value={form.websiteUrl} onChange={set("websiteUrl")} placeholder="e.g. www.acmecars.co.uk" />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Primary Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.primaryContactName} onChange={set("primaryContactName")} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" value={form.primaryContactEmail} onChange={set("primaryContactEmail")} />
                {form.primaryContactEmail && !emailValid && (
                  <p className="text-xs text-destructive">Invalid email</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input value={form.primaryContactPhone} onChange={set("primaryContactPhone")} />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Registered Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Street</Label>
                <Input value={form.street} onChange={set("street")} />
              </div>
              <div className="space-y-2">
                <Label>Town</Label>
                <Input value={form.town} onChange={set("town")} />
              </div>
              <div className="space-y-2">
                <Label>County</Label>
                <Input value={form.county} onChange={set("county")} />
              </div>
              <div className="space-y-2">
                <Label>Postcode</Label>
                <Input value={form.postcode} onChange={set("postcode")} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => navigate("/dealers")}>Cancel</Button>
            <Button onClick={handleSave} disabled={!requiredFilled}>
              Save &amp; Begin Pre-Screening
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
