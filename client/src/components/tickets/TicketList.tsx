import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Ticket, User } from "@shared/schema";
import TicketItem from "./TicketItem";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CreateTicketForm from "./CreateTicketForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface EnhancedTicket extends Ticket {
  createdBy: User;
  assignedTo?: User;
  commentCount: number;
}

interface TicketListProps {
  title?: string;
  apiUrl: string;
  emptyMessage?: string;
}

export default function TicketList({ 
  title = "Tickets", 
  apiUrl,
  emptyMessage = "No tickets found" 
}: TicketListProps) {
  const [tickets, setTickets] = useState<EnhancedTicket[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  
  const { data, isLoading, error } = useQuery({
    queryKey: [apiUrl, page],
    queryFn: async () => {
      const url = new URL(apiUrl, window.location.origin);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", "10");
      
      const res = await fetch(url.toString(), {
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return res.json();
    }
  });

  useEffect(() => {
    if (data) {
      setTickets(data.tickets || []);
      setTotalPages(data.pagination?.totalPages || 1);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tickets. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 border-b border-slate-200 sm:px-6 flex justify-between items-center">
        <h3 className="text-lg font-medium leading-6 text-slate-900">{title}</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <CreateTicketForm />
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="px-4 py-4 sm:px-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="border-b border-slate-200 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
              <div className="flex justify-between mb-2">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-6 w-1/6" />
              </div>
              <Skeleton className="h-4 w-1/2 mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="px-4 py-12 sm:px-6 text-center">
          <p className="text-slate-500">{emptyMessage}</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Create Your First Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <CreateTicketForm />
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-slate-200">
            {tickets.map((ticket) => (
              <TicketItem key={ticket.id} ticket={ticket} />
            ))}
          </ul>
          
          <div className="bg-slate-50 px-4 py-4 sm:px-6 rounded-b-lg border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                >
                  Next
                </Button>
              </div>
              <div className="hidden md:flex text-sm text-slate-500">
                Showing <span className="font-medium mx-1">{tickets.length ? (page - 1) * 10 + 1 : 0}</span> to <span className="font-medium mx-1">{(page - 1) * 10 + tickets.length}</span> of <span className="font-medium mx-1">{totalPages * 10}</span> results
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
