import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DealersProvider } from "@/contexts/DealersContext";
import { AlertsProvider } from "@/contexts/AlertsContext";
import { OnboardingWorkflowProvider } from "@/contexts/OnboardingContext";
import { RecheckProvider } from "@/contexts/RecheckContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Dealers from "./pages/Dealers";
import Documents from "./pages/Documents";
import Alerts from "./pages/Alerts";
import DoNotDeal from "./pages/DoNotDeal";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import OnboardingNew from "./pages/OnboardingNew";
import OnboardingPreScreening from "./pages/OnboardingPreScreening";
import OnboardingChecklist from "./pages/OnboardingChecklist";
import MyRequests from "./pages/MyRequests";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <DealersProvider>
          <AlertsProvider>
            <OnboardingWorkflowProvider>
              <RecheckProvider>
              <BrowserRouter>
                <OnboardingProvider>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                      element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/dealers" element={<Dealers />} />
                      <Route path="/dealers/:id" element={<Dealers />} />
                      <Route path="/documents" element={<Documents />} />
                      <Route path="/alerts" element={<Alerts />} />
                      <Route path="/requests" element={<MyRequests />} />
                      <Route path="/requests/:requestId" element={<MyRequests />} />
                      <Route path="/do-not-deal" element={<DoNotDeal />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/onboarding/new" element={<OnboardingNew />} />
                      <Route path="/onboarding/:appId/pre-screening" element={<OnboardingPreScreening />} />
                      <Route path="/onboarding/:appId/checklist" element={<OnboardingChecklist />} />
                    </Route>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </OnboardingProvider>
              </BrowserRouter>
              </RecheckProvider>
            </OnboardingWorkflowProvider>
          </AlertsProvider>
        </DealersProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
