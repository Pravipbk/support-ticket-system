import { useEffect, useState } from "react";
import { Switch, Route, useLocation, Router } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useUser, UserProvider } from "./lib/auth";
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

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return user ? <Component {...rest} /> : null;
}

function AdminRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return user && user.role === "admin" ? <Component {...rest} /> : null;
}

function AdminOrAgentRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== "admin" && user.role !== "agent"))) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return user && (user.role === "admin" || user.role === "agent") ? <Component {...rest} /> : null;
}

function PublicRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, [key: string]: any }) {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/dashboard");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return !user ? <Component {...rest} /> : null;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/login">
        <PublicRoute component={Login} />
      </Route>
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/tickets">
        <ProtectedRoute component={AllTickets} />
      </Route>
      <Route path="/my-tickets">
        <ProtectedRoute component={MyTickets} />
      </Route>
      <Route path="/tickets/:id">
        {(params) => <ProtectedRoute component={TicketView} id={params.id} />}
      </Route>
      <Route path="/reports">
        <AdminOrAgentRoute component={Reports} />
      </Route>
      <Route path="/team">
        <AdminRoute component={TeamMembers} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      </Router>
      <Toaster />
    </UserProvider>
  );
}

export default App;
