import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Joyride, { CallBackProps, STATUS, EVENTS, ACTIONS, Step } from "react-joyride";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface TourStep extends Step {
  route?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: "body",
    placement: "center",
    route: "/dashboard",
    title: "Welcome to DealerGuard 👋",
    content:
      "This is your Lender Portal — your central hub for monitoring dealer compliance across your portfolio. Let's take a 2-minute tour of the key features. Use the arrows or your keyboard to navigate.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="sidebar"]',
    placement: "right",
    route: "/dashboard",
    title: "Your Navigation",
    content:
      "Use the sidebar to move between the main sections of the platform: Dashboard, Dealers, Documents, Alerts, Do Not Deal, Reports, and Settings. Your active section is always highlighted.",
  },
  {
    target: '[data-tour="portfolio-health"]',
    placement: "right",
    route: "/dashboard",
    title: "Portfolio Health at a Glance",
    content:
      "This chart shows your entire dealer portfolio split by RAG status — Green (compliant), Amber (attention needed), and Red (critical). Click any segment to filter your dealer list instantly.",
  },
  {
    target: '[data-tour="kpi-cards"]',
    placement: "bottom",
    route: "/dashboard",
    title: "Key Performance Indicators",
    content:
      "These cards give you an instant read on portfolio health. The Critical Alerts count shows Red-rated dealers needing immediate attention. The Average Risk Score is the mean compliance score across all your dealers.",
  },
  {
    target: '[data-tour="dealer-watchlist"]',
    placement: "top",
    route: "/dashboard",
    title: "Your Dealer Watchlist",
    content:
      "Every dealer in your portfolio is listed here with their compliance score, RAG status, last audit date, and Customer Sentiment Score. Search, filter by RAG, and sort by any column. Click a dealer row to open their full profile.",
  },
  {
    target: '[data-tour="notification-bell"]',
    placement: "bottom",
    route: "/dashboard",
    title: "Alerts & Notifications",
    content:
      "The bell shows how many unread compliance alerts you have. Click it to see your 5 most recent alerts — threshold breaches, document expiries, and items flagged for manual review. The badge count updates in real time as alerts are acknowledged.",
  },
  {
    target: '[data-tour="dealer-table"]',
    placement: "right",
    route: "/dealers",
    title: "Your Dealer Directory",
    content:
      "This is your full dealer list. Filter by RAG status, search by name, or sort by score. The 'Add New Dealer' button launches the onboarding workflow to bring a new dealer into your portfolio.",
  },
  {
    target: '[data-tour="add-dealer-btn"]',
    placement: "bottom",
    route: "/dealers",
    title: "Onboarding a New Dealer",
    content:
      "Click here to start the 8-section compliance onboarding checklist for a new dealer. You'll work through Legal Status, FCA Authorisation, Financial Risk, KYC & AML, DBS, Training, Complaints Handling, and Website Compliance — then approve, reject, or request more information.",
  },
  {
    target: '[data-tour="dealer-score-card"]',
    placement: "bottom",
    route: "/dealers/d001",
    title: "Dealer Compliance Score",
    content:
      "Every dealer has an overall score (0–100) and a RAG status badge. Green means the dealer is compliant, Amber means action is needed, and Red means critical issues exist. The last audit date is shown here too.",
  },
  {
    target: '[data-tour="audit-sections"]',
    placement: "right",
    route: "/dealers/d001",
    title: "Section-by-Section Breakdown",
    content:
      "Each of the 8 compliance sections has its own score and Pass/Fail/Pending status. Click any card to expand the full detail — individual check results, evidence notes, and uploaded documents for that section.",
  },
  {
    target: '[data-tour="update-audit-btn"]',
    placement: "bottom",
    route: "/dealers/d001",
    title: "Re-Running an Audit",
    content:
      "Use this button to update any section of a dealer's audit. You can revise scores and results, then recalculate the overall score. If the update moves the dealer into a worse RAG band, a threshold breach alert is generated automatically.",
  },
  {
    target: '[data-tour="breach-banner"]',
    placement: "bottom",
    route: "/dealers/d010",
    title: "Threshold Breach Alerts",
    content:
      "When a dealer's score drops into a worse RAG band, this warning banner appears at the top of their profile. You can acknowledge the alert or launch a re-audit directly from here — no need to hunt through the Alerts page.",
  },
  {
    target: '[data-tour="audit-history"]',
    placement: "right",
    route: "/dealers/d001",
    title: "Audit History",
    content:
      "Every audit run for this dealer is recorded here in chronological order, showing the score and RAG status at each point in time. Arrows indicate whether the score improved, declined, or held steady. Click any entry to view the full audit detail from that date.",
  },
  {
    target: '[data-tour="document-table"]',
    placement: "right",
    route: "/documents",
    title: "Document Library",
    content:
      "All compliance documents across every dealer are stored here — DBS certificates, training records, complaints logs, and more. Documents are colour-coded by expiry status: green for valid, orange for expiring soon, red for expired. Use the filters to find what you need quickly.",
  },
  {
    target: '[data-tour="alert-table"]',
    placement: "right",
    route: "/alerts",
    title: "Compliance Alerts",
    content:
      "Your full alerts feed lives here. Three types of alert are generated automatically: Threshold Breaches (RAG status worsened), Document Expiries (certificates approaching or past expiry), and Manual Review flags raised by The Compliance Guys team. Acknowledge alerts to clear them from your count.",
  },
  {
    target: '[data-tour="dnd-table"]',
    placement: "right",
    route: "/do-not-deal",
    title: "Do Not Deal List",
    content:
      "Maintain your own registry of banned dealers and directors here. When you onboard a new dealer, the system automatically checks whether they or their directors appear on any lender's Do Not Deal list and warns you before proceeding.",
  },
  {
    target: '[data-tour="reports-summary"]',
    placement: "bottom",
    route: "/reports",
    title: "Reports & Analytics",
    content:
      "The Reports page gives you a live portfolio summary — RAG distribution, section compliance heatmap, CSS scores, document expiry summary, and open actions. Select any individual dealer from the dropdown to generate a full compliance report ready for download.",
  },
  {
    target: '[data-tour="rag-thresholds"]',
    placement: "right",
    route: "/settings",
    title: "Configure Your Risk Thresholds",
    content:
      "Adjust your RAG thresholds here to match your organisation's risk appetite. Changing the thresholds will automatically recalculate every dealer's RAG status across your portfolio. You can also manage your team, notification preferences, and account settings from this page.",
  },
  {
    // Final step
    target: "body",
    placement: "center",
    route: "/dashboard",
    title: "You're all set! ✅",
    content:
      "That's everything you need to get started with DealerGuard. Your portfolio is ready to explore — start by checking any Red or Amber dealers that need attention. If you ever need help, contact The Compliance Guys team at compliance@thecomplianceguys.co.uk",
  },
];

interface GuidedTourProps {
  onComplete: () => void;
}

export function GuidedTour({ onComplete }: GuidedTourProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [stepIndex, setStepIndex] = useState(0);
  const [run, setRun] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(false);

  const totalSteps = TOUR_STEPS.length;
  const currentStep = TOUR_STEPS[stepIndex];
  const isLastStep = stepIndex === totalSteps - 1;

  // Navigate to correct route when step changes
  useEffect(() => {
    const targetRoute = currentStep?.route;
    if (targetRoute && location.pathname !== targetRoute) {
      setRun(false);
      setPendingNavigation(true);
      navigate(targetRoute);
    } else if (!run && !pendingNavigation) {
      setRun(true);
    }
  }, [stepIndex]);

  // After navigation completes, wait for DOM then resume
  useEffect(() => {
    if (pendingNavigation) {
      const timer = setTimeout(() => {
        setPendingNavigation(false);
        setRun(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, pendingNavigation]);

  // Start tour on mount
  useEffect(() => {
    const timer = setTimeout(() => setRun(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSkipConfirm) return;
      if (e.key === "ArrowRight" && !isLastStep) {
        setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
      } else if (e.key === "ArrowLeft" && stepIndex > 0) {
        setStepIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Escape") {
        setShowSkipConfirm(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stepIndex, isLastStep, showSkipConfirm, totalSteps]);

  const handleFinish = () => {
    setRun(false);
    navigate("/dashboard");
    toast({
      title: "You're all set!",
      description: "Remember, you can always refer to the Help section if you need it.",
    });
    onComplete();
  };

  const handleSkipConfirmed = () => {
    setShowSkipConfirm(false);
    setRun(false);
    navigate("/dashboard");
    toast({
      title: "Tour skipped",
      description: "You're all set! Remember, you can always refer to the Help section if you need it.",
    });
    onComplete();
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { action, status, type, index } = data;

    if (status === STATUS.SKIPPED) {
      setShowSkipConfirm(true);
      return;
    }

    if (type === EVENTS.STEP_AFTER) {
      if (action === ACTIONS.NEXT) {
        if (isLastStep) {
          handleFinish();
        } else {
          setStepIndex((prev) => prev + 1);
        }
      } else if (action === ACTIONS.PREV) {
        setStepIndex((prev) => Math.max(prev - 1, 0));
      }
    }

    if (action === ACTIONS.CLOSE) {
      setShowSkipConfirm(true);
    }
  };

  return (
    <>
      <Joyride
        steps={TOUR_STEPS}
        stepIndex={stepIndex}
        run={run}
        continuous
        showProgress
        showSkipButton
        disableOverlayClose
        disableCloseOnEsc
        callback={handleJoyrideCallback}
        spotlightPadding={8}
        locale={{
          back: "← Back",
          next: isLastStep ? "✓ Go to Dashboard" : "→ Next",
          skip: "Skip Tour",
          last: "✓ Go to Dashboard",
        }}
        styles={{
          options: {
            zIndex: 90,
            primaryColor: "#3d1468",
            arrowColor: "hsl(0, 0%, 100%)",
            backgroundColor: "hsl(0, 0%, 100%)",
            textColor: "hsl(269, 30%, 14%)",
            overlayColor: "rgba(0, 0, 0, 0.6)",
          },
          spotlight: {
            borderRadius: 8,
            boxShadow: "0 0 0 3px #fcba09, 0 0 20px rgba(252, 186, 9, 0.4)",
          },
          tooltip: {
            borderRadius: 12,
            padding: "20px 24px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          },
          tooltipTitle: {
            fontSize: 18,
            fontWeight: 700,
            color: "#3d1468",
            fontFamily: "Raleway, sans-serif",
          },
          tooltipContent: {
            fontSize: 14,
            lineHeight: 1.6,
            color: "hsl(269, 30%, 14%)",
            padding: "8px 0",
          },
          buttonNext: {
            backgroundColor: "#3d1468",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            padding: "8px 16px",
          },
          buttonBack: {
            color: "#3d1468",
            fontSize: 13,
            fontWeight: 600,
            marginRight: 8,
          },
          buttonSkip: {
            color: "hsl(240, 5%, 42%)",
            fontSize: 12,
          },
          tooltipFooter: {
            marginTop: 12,
          },
        }}
        floaterProps={{
          disableAnimation: false,
        }}
      />

      {/* Progress indicator overlay */}
      {run && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 rounded-full bg-card/95 backdrop-blur-sm border border-border px-4 py-2 shadow-lg">
          <span className="text-xs font-medium text-muted-foreground">
            Step {stepIndex + 1} of {totalSteps}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i <= stepIndex ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground ml-2">
            → Next &nbsp; ← Back &nbsp; Esc Skip
          </span>
        </div>
      )}

      {/* Skip confirmation dialog */}
      <Dialog open={showSkipConfirm} onOpenChange={setShowSkipConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Skip the tour?</DialogTitle>
            <DialogDescription>
              Are you sure you want to skip the tour? You won't be able to re-launch it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowSkipConfirm(false)}>
              Continue tour
            </Button>
            <Button onClick={handleSkipConfirmed} className="bg-[#3d1468] hover:bg-[#3d1468]/90 text-white">
              Yes, skip
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
