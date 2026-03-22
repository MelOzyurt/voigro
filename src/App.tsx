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
import PhoneSetup from "./pages/dashboard/PhoneSetup";
import CallHistory from "./pages/dashboard/CallHistory";
import CallDetail from "./pages/dashboard/CallDetail";
import Transcripts from "./pages/dashboard/Transcripts";
import Actions from "./pages/dashboard/Actions";
import Services from "./pages/dashboard/Services";
import Products from "./pages/dashboard/Products";
import FAQs from "./pages/dashboard/FAQs";
import Billing from "./pages/dashboard/Billing";
import Support from "./pages/dashboard/Support";
import SettingsPage from "./pages/dashboard/Settings";
import Bookings from "./pages/dashboard/Bookings";
import CalendarPage from "./pages/dashboard/Calendar";
import Customers from "./pages/dashboard/Customers";
import AvailabilityPage from "./pages/dashboard/Availability";
import NotFound from "./pages/NotFound";

// Admin
import AdminLogin from "./pages/admin/AdminLogin";
import AdminGuard from "./components/AdminGuard";
import AdminLayout from "./components/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminPlatformSettings from "./pages/admin/AdminPlatformSettings";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminUsers from "./pages/admin/AdminUsers";

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
            <Route path="phone" element={<PhoneSetup />} />
            <Route path="calls" element={<CallHistory />} />
            <Route path="calls/:id" element={<CallDetail />} />
            <Route path="transcripts" element={<Transcripts />} />
            <Route path="actions" element={<Actions />} />
            <Route path="services" element={<Services />} />
            <Route path="products" element={<Products />} />
            <Route path="faqs" element={<FAQs />} />
            <Route path="billing" element={<Billing />} />
            <Route path="support" element={<Support />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="settings" element={<AdminPlatformSettings />} />
              <Route path="organizations" element={<AdminOrganizations />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
