import React from 'react';
import { Switch, Route } from 'wouter';
import { Toaster } from "@/components/ui/toaster";

// Minimal Login component
function MinimalLogin() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold">SupportDesk</h1>
          <p className="mt-2 text-gray-600">Log in to your account</p>
        </div>
        <form className="mt-8 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              placeholder="Username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
              placeholder="Password"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Minimal Home/Dashboard component
function MinimalDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>This is a minimal dashboard page.</p>
    </div>
  );
}

// Simple app component
function MinimalApp() {
  return (
    <>
      <Switch>
        <Route path="/login" component={MinimalLogin} />
        <Route path="/" component={MinimalDashboard} />
        <Route path="/dashboard" component={MinimalDashboard} />
      </Switch>
      <Toaster />
    </>
  );
}

export default MinimalApp;