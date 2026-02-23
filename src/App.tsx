import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DealersProvider } from "@/contexts/DealersContext";
import { AlertsProvider } from "@/contexts/AlertsContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <DealersProvider>
          <AlertsProvider>
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
                    <Route path="/do-not-deal" element={<DoNotDeal />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </OnboardingProvider>
            </BrowserRouter>
          </AlertsProvider>
        </DealersProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
