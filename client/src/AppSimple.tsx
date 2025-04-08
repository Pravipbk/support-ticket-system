import { useState } from 'react';
import { Switch, Route } from 'wouter';
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/MainLayout";

function AppSimple() {
  return (
    <>
      <MainLayout>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route component={NotFound} />
        </Switch>
      </MainLayout>
      <Toaster />
    </>
  );
}

export default AppSimple;