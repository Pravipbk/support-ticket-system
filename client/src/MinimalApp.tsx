import React, { useState } from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";

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
  const [user, setUser] = React.useState<any>(null);

  // Get user profile
  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    
    fetchUser();
  }, []);
  
  // Fetch ticket stats using query
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      return response.json();
    },
  });
  
  // Define types
  interface Activity {
    id: number;
    type: string;
    message: string;
    createdAt: string;
    ticketId: number | null;
    userId: number;
    user?: {
      name: string;
    };
  }

  interface Ticket {
    id: number;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    category: string;
  }

  // Fetch recent tickets using query
  const { data: ticketsData, isLoading: isLoadingTickets } = useQuery<{tickets: Ticket[], total: number}>({
    queryKey: ['/api/tickets'],
    queryFn: async () => {
      const response = await fetch('/api/tickets?limit=5', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      return response.json();
    },
  });

  // Fetch recent activities using query
  const { data: activities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
    queryFn: async () => {
      const response = await fetch('/api/activities?limit=5', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      
      return response.json();
    },
  });
  
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

  const handleViewAllTickets = () => {
    setLocation('/tickets');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">SupportDesk</h1>
            
            {user && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Dashboard Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={handleViewAllTickets}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {isLoadingStats ? '...' : stats?.total || 0}
                  </p>
                </div>
                <div className="p-2 bg-blue-50 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
                View all tickets 
                <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Open Tickets</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {isLoadingStats ? '...' : stats?.openCount || 0}
                  </p>
                </div>
                <div className="p-2 bg-yellow-50 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {isLoadingStats ? '...' : stats?.inProgressCount || 0}
                  </p>
                </div>
                <div className="p-2 bg-indigo-50 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {isLoadingStats ? '...' : stats?.resolvedCount || 0}
                  </p>
                </div>
                <div className="p-2 bg-green-50 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-800">Recent Tickets</h3>
              <button 
                onClick={handleViewAllTickets}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoadingTickets ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-500">Loading tickets...</td>
                    </tr>
                  ) : !ticketsData || ticketsData.tickets.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-500">No tickets available</td>
                    </tr>
                  ) : (
                    ticketsData.tickets.map((ticket) => (
                      <tr 
                        key={ticket.id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => setLocation(`/tickets/${ticket.id}`)}
                      >
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">{ticket.subject}</div>
                          <div className="text-xs text-gray-500 mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                            ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                            ticket.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="font-medium text-gray-800 mb-4">Recent Activity</h3>
            {isLoadingActivities ? (
              <p className="text-center text-gray-500 py-4">Loading activities...</p>
            ) : !activities || activities.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No recent activities</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity: Activity, index: number) => (
                  <div key={activity.id || index} className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-blue-50">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{activity.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.user?.name || 'User'} • {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Import new pages
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';

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
        <Route path="/tickets" component={TicketsPage} />
        <Route path="/tickets/:id">
          {(params) => <TicketDetailPage id={params.id} />}
        </Route>
      </Switch>
      <Toaster />
    </>
  );
}

export default MinimalApp;