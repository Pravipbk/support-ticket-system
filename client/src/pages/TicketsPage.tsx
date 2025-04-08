import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';

// Define schema for ticket creation
const createTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string().min(3, 'Category must be at least 3 characters'),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).default('open'),
});

type CreateTicketValues = z.infer<typeof createTicketSchema>;

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

export default function TicketsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Fetch tickets
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/tickets'],
    queryFn: async () => {
      const response = await fetch('/api/tickets', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      
      return response.json();
    },
  });

  // Form for creating tickets
  const form = useForm<CreateTicketValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      subject: '',
      description: '',
      priority: 'medium',
      category: 'General',
      status: 'open',
    },
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (values: CreateTicketValues) => {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create ticket');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Ticket Created',
        description: 'Your ticket has been created successfully.',
      });
      setIsCreateModalOpen(false);
      form.reset();
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: CreateTicketValues) => {
    createTicketMutation.mutate(values);
  };

  const handleOpenTicket = (id: number) => {
    setLocation(`/tickets/${id}`);
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

  const handleGoBack = () => {
    setLocation('/');
  };

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
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
            <h2 className="text-xl font-semibold text-gray-800">All Tickets</h2>
          </div>
          
          <Button onClick={() => setIsCreateModalOpen(true)}>Create Ticket</Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading tickets...</p>
          </div>
        ) : !data || !data.tickets || data.tickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-800 mb-2">No tickets found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first ticket</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>Create Ticket</Button>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.tickets.map((ticket: any) => (
                  <TableRow key={ticket.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleOpenTicket(ticket.id)}>
                    <TableCell>TK-{ticket.id}</TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{ticket.createdBy?.name || 'Unknown'}</TableCell>
                    <TableCell>{ticket.assignedTo?.name || 'Unassigned'}</TableCell>
                    <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTicket(ticket.id);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {data.pagination && (
              <div className="py-4 px-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Showing page {data.pagination.page} of {data.pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    disabled={data.pagination.page <= 1}
                    onClick={() => {
                      // TODO: Implement pagination
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.pagination.page >= data.pagination.totalPages}
                    onClick={() => {
                      // TODO: Implement pagination
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* Create Ticket Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new support ticket.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter ticket subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your issue in detail" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Technical, Billing, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createTicketMutation.isPending}
                >
                  {createTicketMutation.isPending ? 'Creating...' : 'Create Ticket'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}