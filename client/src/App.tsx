import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./lib/auth";
import HomePage from "@/pages/home-page";
import ActiveRoomsPage from "@/pages/active-rooms-page";
import VIPPage from "@/pages/vip-page";
import LeaguePage from "@/pages/league-page";
import ForumPage from "@/pages/forum-page";
import ForumPostDetailPage from "@/pages/forum-post-detail-page";
import AdminStaffPage from "@/pages/admin-staff-page";
import LoginPage from "@/pages/login-page";
import RegisterPage from "@/pages/register-page";
import ProfileSettingsPage from "@/pages/profile-settings-page";
import AdminApplicationPage from "@/pages/admin-application-page";
import TeamApplicationPage from "@/pages/team-application-page";
import ManagementPanelPage from "@/pages/management-panel-page";
import PasswordResetPage from "@/pages/password-reset-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/aktif-odalar" component={ActiveRoomsPage} />
      <Route path="/vip" component={VIPPage} />
      <Route path="/lig" component={LeaguePage} />
      <Route path="/forum" component={ForumPage} />
      <Route path="/forum/:id" component={ForumPostDetailPage} />
      <Route path="/admin-kadrosu" component={AdminStaffPage} />
      <Route path="/giris" component={LoginPage} />
      <Route path="/kayit" component={RegisterPage} />
      <Route path="/sifre-sifirlama" component={PasswordResetPage} />
      <Route path="/profil" component={ProfileSettingsPage} />
      <Route path="/admin-basvuru" component={AdminApplicationPage} />
      <Route path="/takim-basvuru" component={TeamApplicationPage} />
      <Route path="/yonetim" component={ManagementPanelPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
