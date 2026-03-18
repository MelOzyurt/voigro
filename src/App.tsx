import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Onboarding from "./pages/Onboarding";
import DashboardLayout from "./components/DashboardLayout";
import DashboardOverview from "./pages/dashboard/Overview";
import AgentConfig from "./pages/dashboard/AgentConfig";
import CallHistory from "./pages/dashboard/CallHistory";
import CallDetail from "./pages/dashboard/CallDetail";
import Transcripts from "./pages/dashboard/Transcripts";
import Services from "./pages/dashboard/Services";
import Products from "./pages/dashboard/Products";
import FAQs from "./pages/dashboard/FAQs";
import Billing from "./pages/dashboard/Billing";
import Support from "./pages/dashboard/Support";
import SettingsPage from "./pages/dashboard/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="agent" element={<AgentConfig />} />
            <Route path="calls" element={<CallHistory />} />
            <Route path="calls/:id" element={<CallDetail />} />
            <Route path="transcripts" element={<Transcripts />} />
            <Route path="services" element={<Services />} />
            <Route path="products" element={<Products />} />
            <Route path="faqs" element={<FAQs />} />
            <Route path="billing" element={<Billing />} />
            <Route path="support" element={<Support />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
