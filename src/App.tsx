
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { EventProvider } from "./context/EventContext";
import { TaskProvider } from "./context/TaskContext";
import { NotificationProvider } from "./context/NotificationContext";
import Chat from "./pages/Chat";
import Planning from "./pages/Planning";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import AdvisorDashboard from "./pages/AdvisorDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <EventProvider>
        <TaskProvider>
          <NotificationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/planning" element={<Planning />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/advisor" element={<AdvisorDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </TaskProvider>
      </EventProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
