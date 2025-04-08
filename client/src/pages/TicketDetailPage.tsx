import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Define schema for comment creation
const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
});

type CommentValues = z.infer<typeof commentSchema>;

// Status badge color mapping
const statusColors = {
  open: 'bg-yellow-100 text-yellow-800',
  'in_progress': 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
};

// Priority badge color mapping
const priorityColors = {
  low: 'bg-slate-100 text-slate-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800'
};

interface TicketDetailPageProps {
  id: string;
}

export default function TicketDetailPage({ id }: TicketDetailPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCommenting, setIsCommenting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  
  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['/api/auth/session'],
    queryFn: async () => {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user session');
      }
      
      return response.json();
    },
  });
  
  // Fetch ticket details
  const { data: ticket, isLoading: isLoadingTicket, refetch: refetchTicket } = useQuery({
    queryKey: [`/api/tickets/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${id}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch ticket');
      }
      
      return response.json();
    },
  });
  
  // Fetch ticket comments
  const { data: comments, isLoading: isLoadingComments, refetch: refetchComments } = useQuery({
    queryKey: [`/api/tickets/${id}/comments`],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${id}/comments`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      return response.json();
    },
  });
  
  // Fetch ticket activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: [`/api/tickets/${id}/activities`],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${id}/activities`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      
      return response.json();
    },
  });
  
  // Form for creating comments
  const form = useForm<CommentValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
    },
  });
  
  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (values: CommentValues) => {
      const response = await fetch(`/api/tickets/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add comment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Comment Added',
        description: 'Your comment has been added successfully.',
      });
      form.reset();
      setIsCommenting(false);
      refetchComments();
      refetchTicket();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Update ticket mutation
  const updateTicketMutation = useMutation({
    mutationFn: async (data: { status?: string; priority?: string }) => {
      const response = await fetch(`/api/tickets/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update ticket');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Ticket Updated',
        description: 'The ticket has been updated successfully.',
      });
      refetchTicket();
      setSelectedStatus(null);
      setSelectedPriority(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const onSubmitComment = (values: CommentValues) => {
    createCommentMutation.mutate(values);
  };
  
  const handleUpdateStatus = (status: string) => {
    if (status !== ticket?.status) {
      setSelectedStatus(status);
      updateTicketMutation.mutate({ status });
    }
  };
  
  const handleUpdatePriority = (priority: string) => {
    if (priority !== ticket?.priority) {
      setSelectedPriority(priority);
      updateTicketMutation.mutate({ priority });
    }
  };
  
  const handleBack = () => {
    setLocation('/tickets');
  };
  
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
  
  const isAdmin = currentUser?.role === 'admin';
  const isAgent = currentUser?.role === 'agent';
  const canUpdateTicket = isAdmin || isAgent;
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">SupportDesk</h1>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={handleBack}>
            Back to Tickets
          </Button>
        </div>
        
        {isLoadingTicket ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading ticket...</p>
          </div>
        ) : !ticket ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Ticket not found</h3>
            <p className="text-gray-500 mb-6">The ticket you're looking for doesn't exist or has been deleted</p>
            <Button onClick={handleBack}>Back to Tickets</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ticket details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {ticket.subject}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Ticket #{ticket.id} • Created on {new Date(ticket.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    
                    <div className="flex gap-2">
                      <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p>{ticket.description}</p>
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Created by:</span> {ticket.createdBy?.name || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-medium">Assigned to:</span> {ticket.assignedTo?.name || 'Unassigned'}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Comments section */}
              <Card>
                <CardHeader>
                  <CardTitle>Comments {comments?.length ? `(${comments.length})` : ''}</CardTitle>
                </CardHeader>
                
                <CardContent>
                  {isLoadingComments ? (
                    <p className="text-center text-gray-500 py-4">Loading comments...</p>
                  ) : !comments || comments.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No comments yet</p>
                  ) : (
                    <div className="space-y-6">
                      {comments.map((comment: any) => (
                        <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <div className="font-medium">{comment.user?.name || 'User'}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {!isCommenting ? (
                    <div className="mt-6">
                      <Button 
                        onClick={() => setIsCommenting(true)} 
                        variant="outline"
                        className="w-full"
                      >
                        Add Comment
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <form onSubmit={form.handleSubmit(onSubmitComment)}>
                        <Textarea
                          placeholder="Type your comment here..."
                          className="min-h-[100px] mb-3"
                          {...form.register('content')}
                        />
                        {form.formState.errors.content && (
                          <p className="text-sm text-red-500 mb-3">
                            {form.formState.errors.content.message}
                          </p>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsCommenting(false);
                              form.reset();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createCommentMutation.isPending}
                          >
                            {createCommentMutation.isPending ? 'Submitting...' : 'Submit Comment'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Ticket actions */}
              {canUpdateTicket && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ticket Actions</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Status</label>
                      <Select
                        onValueChange={handleUpdateStatus}
                        value={ticket.status}
                        disabled={updateTicketMutation.isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Priority</label>
                      <Select
                        onValueChange={handleUpdatePriority}
                        value={ticket.priority}
                        disabled={updateTicketMutation.isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* TODO: Add assignment functionality */}
                  </CardContent>
                </Card>
              )}
              
              {/* Activity log */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Log</CardTitle>
                </CardHeader>
                
                <CardContent>
                  {isLoadingActivities ? (
                    <p className="text-center text-gray-500 py-4">Loading activities...</p>
                  ) : !activities || activities.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No activity yet</p>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity: any) => (
                        <div key={activity.id} className="flex gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 8v8" />
                              <path d="M8 12h8" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-700">{activity.message}</p>
                            <p className="text-xs text-gray-500">
                              {activity.user?.name || 'User'} • {new Date(activity.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Category info */}
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">Category</span>
                    <span className="block">{ticket.category || 'General'}</span>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">ID</span>
                    <span className="block">TK-{ticket.id}</span>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">Last Updated</span>
                    <span className="block">{new Date(ticket.updatedAt).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}