import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useUser } from "./lib/auth";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import AllTickets from "@/pages/AllTickets";
import MyTickets from "@/pages/MyTickets";
import TicketView from "@/pages/TicketView";
import Reports from "@/pages/Reports";
import TeamMembers from "@/pages/TeamMembers";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/MainLayout";

function App() {
  const { user, isLoading } = useUser();
  const [location, setLocation] = useLocation();

  // Handle authentication redirects
  useEffect(() => {
    if (!isLoading) {
      // Redirect to login if not authenticated and not on login page
      if (!user && location !== "/login") {
        setLocation("/login");
      }

      // Redirect to dashboard if authenticated but on login page
      if (user && location === "/login") {
        setLocation("/dashboard");
      }

      // Role-based redirects
      if (user && location === "/team" && user.role !== "admin") {
        setLocation("/dashboard");
      }

      if (user && location === "/reports" && 
          user.role !== "admin" && user.role !== "agent") {
        setLocation("/dashboard");
      }
    }
  }, [user, isLoading, location, setLocation]);

  // Simple loading state
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // Main application routing
  return (
    <>
      <MainLayout>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/tickets" component={AllTickets} />
          <Route path="/my-tickets" component={MyTickets} />
          <Route path="/tickets/:id">
            {(params) => <TicketView id={params.id} />}
          </Route>
          <Route path="/reports" component={Reports} />
          <Route path="/team" component={TeamMembers} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </MainLayout>
      <Toaster />
    </>
  );
}

export default App;
