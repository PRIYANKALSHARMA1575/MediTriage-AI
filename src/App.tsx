import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NurseDashboard from "./pages/NurseDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import ParamedicDashboard from "./pages/ParamedicDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TriageResults from "./pages/TriageResults";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/nurse" element={<NurseDashboard />} />
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/paramedic" element={<ParamedicDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/triage-results/:caseId" element={<TriageResults />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
