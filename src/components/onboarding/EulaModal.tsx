import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const EULA_TEXT = `DEALERGUARD PLATFORM — END USER LICENCE AGREEMENT

This platform ("DealerGuard") is operated by The Compliance Guys Ltd. 
By accessing this platform you agree to the following terms:

1. ACCESS & USE
   This platform is licensed to your organisation for internal compliance 
   monitoring purposes only. You may not share login credentials or use 
   this platform for any purpose other than dealer compliance management.

2. DATA RESPONSIBILITY
   You are responsible for the accuracy of all data entered into this 
   platform. The Compliance Guys Ltd accepts no liability for decisions 
   made based on inaccurate data entered by your organisation.

3. CONFIDENTIALITY
   All dealer data, audit results, and compliance reports generated within 
   this platform are confidential. You must not share this data with 
   unauthorised third parties.

4. COMPLIANCE
   Use of this platform does not constitute legal or regulatory advice. 
   You remain responsible for ensuring your organisation's compliance with 
   all applicable FCA rules and regulations.

5. PLATFORM AVAILABILITY
   The Compliance Guys Ltd will endeavour to maintain platform availability 
   but cannot guarantee uninterrupted access. Scheduled maintenance will 
   be communicated in advance where possible.

6. CHANGES TO TERMS
   These terms may be updated periodically. Continued use of the platform 
   following notification of updates constitutes acceptance of revised terms.

For queries regarding these terms, contact: compliance@thecomplianceguys.co.uk`;

interface EulaModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function EulaModal({ onAccept, onDecline }: EulaModalProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
      <div className="w-full max-w-[640px] mx-4 rounded-lg bg-card shadow-2xl border border-border">
        {/* Header */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent mb-4">
            <Shield className="h-7 w-7 text-accent-foreground" />
          </div>
          <h2 className="text-xl font-extrabold text-foreground uppercase tracking-wide">
            Welcome to DealerGuard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Before you continue, please read and accept our Terms of Use.
          </p>
        </div>

        {/* Scrollable EULA text */}
        <div className="px-6">
          <div className="h-[280px] overflow-y-auto rounded-md border border-border bg-muted/30 p-4">
            <pre className="whitespace-pre-wrap text-xs text-foreground font-sans leading-relaxed">
              {EULA_TEXT}
            </pre>
          </div>
        </div>

        {/* Checkbox */}
        <div className="px-6 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <Checkbox
              checked={agreed}
              onCheckedChange={(v) => setAgreed(!!v)}
            />
            <span className="text-sm text-foreground font-medium">
              I have read and agree to the DealerGuard Terms of Use
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 pt-4 pb-6">
          <Button variant="outline" onClick={onDecline} className="font-semibold">
            Decline & Logout
          </Button>
          <Button
            onClick={onAccept}
            disabled={!agreed}
            className="font-semibold bg-[#3d1468] hover:bg-[#3d1468]/90 text-white"
          >
            Accept & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
