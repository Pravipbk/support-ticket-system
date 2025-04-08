import React, { useState } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

// Functional Login component
function MinimalLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login error:", errorData);
        throw new Error(errorData.message || 'Login failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Login Successful",
        description: "You have been logged in successfully.",
      });
      setLocation('/dashboard');
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-600">SupportDesk</h1>
          <p className="mt-2 text-slate-600">Log in to your account</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Password"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full px-4 py-2 text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loginMutation.isPending ? 'Logging in...' : 'Login'}
            </button>
          </div>
          
          <div className="mt-4 text-sm text-center text-slate-600">
            <p className="font-semibold mb-1">Test Credentials:</p>
            <p className="font-medium">Admin: admin / admin123</p>
            <p className="font-medium">Agent: agent / agent123</p>
            <p className="font-medium">Customers:</p>
            <p className="text-xs mb-1">sarah, john, emily, robert / customer123</p>
          </div>
        </form>
      </div>
    </div>
  );
}

// Enhanced Dashboard component
function MinimalDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        toast({
          title: "Logged Out",
          description: "You have been logged out successfully.",
        });
        setLocation('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Welcome to SupportDesk</h2>
        <p className="text-slate-600 mb-4">
          This is a minimal dashboard page. You have successfully logged in!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h3 className="font-medium text-blue-800">Tickets</h3>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <h3 className="font-medium text-green-800">Resolved</h3>
            <p className="text-2xl font-bold">8</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <h3 className="font-medium text-yellow-800">Pending</h3>
            <p className="text-2xl font-bold">4</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// App component with route redirects
function MinimalApp() {
  const [location, setLocation] = useLocation();
  
  // Check if user is logged in (minimal check)
  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        
        // If not at login page and not authenticated, redirect to login
        if (!response.ok && location !== '/login') {
          setLocation('/login');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        if (location !== '/login') {
          setLocation('/login');
        }
      }
    };
    
    checkSession();
  }, [location, setLocation]);

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