import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/home-page";
import ActiveRoomsPage from "@/pages/active-rooms-page";
import VIPPage from "@/pages/vip-page";
import LeaguePage from "@/pages/league-page";
import ForumPage from "@/pages/forum-page";
import AdminStaffPage from "@/pages/admin-staff-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/aktif-odalar" component={ActiveRoomsPage} />
      <Route path="/vip" component={VIPPage} />
      <Route path="/lig" component={LeaguePage} />
      <Route path="/forum" component={ForumPage} />
      <Route path="/admin-kadrosu" component={AdminStaffPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
