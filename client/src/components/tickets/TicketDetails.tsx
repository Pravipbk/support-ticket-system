import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Ticket, User, Comment, insertCommentSchema } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Tag, MessageSquare, AlertCircle, CheckCircle } from "lucide-react";

type TicketWithRelations = Ticket & {
  createdBy: User;
  assignedTo?: User;
  comments?: Array<Comment & { user: User }>;
};

interface TicketDetailsProps {
  ticketId: string;
}

const commentFormSchema = insertCommentSchema
  .omit({ userId: true, ticketId: true })
  .extend({
    content: z.string().min(1, {
      message: "Comment cannot be empty.",
    }),
  });

type CommentFormValues = z.infer<typeof commentFormSchema>;

export default function TicketDetails({ ticketId }: TicketDetailsProps) {
  const [ticket, setTicket] = useState<TicketWithRelations | null>(null);
  const [agents, setAgents] = useState<User[]>([]);
  const { user } = useUser();
  const { toast } = useToast();
  const isAgentOrAdmin = user && (user.role === "admin" || user.role === "agent");

  // Fetch ticket details
  const { 
    data: ticketData, 
    isLoading: isLoadingTicket, 
    error: ticketError 
  } = useQuery({
    queryKey: [`/api/tickets/${ticketId}`],
    queryFn: async () => {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch ticket");
      return res.json() as Promise<TicketWithRelations>;
    }
  });

  // Fetch agents for assignment
  const { 
    data: agentsData, 
    isLoading: isLoadingAgents 
  } = useQuery({
    queryKey: ["/api/users/agents"],
    queryFn: async () => {
      const res = await fetch("/api/users/agents", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch agents");
      return res.json() as Promise<User[]>;
    },
    enabled: isAgentOrAdmin
  });

  // Update ticket mutation
  const updateTicketMutation = useMutation({
    mutationFn: async (data: Partial<Ticket>) => {
      const response = await apiRequest("PATCH", `/api/tickets/${ticketId}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Ticket updated",
        description: `Ticket #TK-${ticketId} has been updated successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Comment form
  const commentForm = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: CommentFormValues) => {
      const response = await apiRequest(
        "POST", 
        `/api/tickets/${ticketId}/comments`, 
        data
      );
      return response.json();
    },
    onSuccess: () => {
      commentForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/tickets/${ticketId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (ticketData) {
      setTicket(ticketData);
    }
  }, [ticketData]);

  useEffect(() => {
    if (agentsData) {
      setAgents(agentsData);
    }
  }, [agentsData]);

  const handleStatusChange = (value: string) => {
    updateTicketMutation.mutate({ status: value });
  };

  const handlePriorityChange = (value: string) => {
    updateTicketMutation.mutate({ priority: value });
  };

  const handleAssigneeChange = (value: string) => {
    updateTicketMutation.mutate({ assignedToId: parseInt(value) });
  };

  const onCommentSubmit = (data: CommentFormValues) => {
    addCommentMutation.mutate(data);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-100 text-blue-800">Open</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return null;
    }
  };

  if (isLoadingTicket) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (ticketError || !ticket) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              Error Loading Ticket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Could not load the ticket details. Please try again later.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <a href="/tickets">Back to Tickets</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">
                #TK-{ticket.id}: {ticket.subject}
              </CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" /> Created on {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4 mr-1" /> Last updated on {format(new Date(ticket.updatedAt), "MMM d, yyyy")}
                <span className="mx-2">•</span>
                <Tag className="h-4 w-4 mr-1" /> {ticket.category}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              {getPriorityBadge(ticket.priority)}
              {getStatusBadge(ticket.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={ticket.createdBy.avatarUrl} alt={ticket.createdBy.name} />
              <AvatarFallback>{ticket.createdBy.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{ticket.createdBy.name}</div>
              <div className="text-sm text-slate-500">{ticket.createdBy.email}</div>
            </div>
          </div>
          <div className="whitespace-pre-line text-slate-700">{ticket.description}</div>
        </CardContent>
        {isAgentOrAdmin && (
          <CardFooter className="border-t pt-6 flex flex-wrap gap-4">
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Status:</span>
              <Select 
                value={ticket.status} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Priority:</span>
              <Select 
                value={ticket.priority} 
                onValueChange={handlePriorityChange}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">Assigned to:</span>
              <Select 
                value={ticket.assignedToId?.toString() || ""} 
                onValueChange={handleAssigneeChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Comments ({ticket.comments?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ticket.comments && ticket.comments.length > 0 ? (
            <div className="space-y-6">
              {ticket.comments.map((comment) => (
                <div key={comment.id} className="flex">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} />
                    <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{comment.user.name}</div>
                      <div className="text-xs text-slate-500">
                        {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                    <div className="mt-1 text-slate-700 whitespace-pre-line">{comment.content}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-lg font-medium text-slate-900">No comments yet</h3>
              <p className="text-slate-500 mt-1">Be the first to add a comment</p>
            </div>
          )}

          <div className="mt-6">
            <Form {...commentForm}>
              <form onSubmit={commentForm.handleSubmit(onCommentSubmit)} className="space-y-3">
                <FormField
                  control={commentForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Add a comment..." 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button 
                    type="submit"
                    disabled={addCommentMutation.isPending}
                  >
                    {addCommentMutation.isPending ? "Sending..." : "Add Comment"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
