import { Link } from "wouter";
import { format, formatDistanceToNow } from "date-fns";
import { User, Calendar, Mail, Clock } from "lucide-react";
import { Ticket } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface EnhancedTicket extends Ticket {
  createdBy: {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  assignedTo?: {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  commentCount: number;
}

interface TicketItemProps {
  ticket: EnhancedTicket;
}

export default function TicketItem({ ticket }: TicketItemProps) {
  const getPriorityBadge = () => {
    switch (ticket.priority) {
      case "low":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (ticket.status) {
      case "open":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Open</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
      case "closed":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Closed</Badge>;
      default:
        return null;
    }
  };

  const getRelativeTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <li>
      <Link href={`/tickets/${ticket.id}`}>
        <div className="block hover:bg-slate-50">
          <div className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="truncate">
                <div className="flex text-sm">
                  <p className="font-medium text-primary-600 truncate">
                    #TK-{ticket.id}: {ticket.subject}
                  </p>
                  <p className="ml-1 flex-shrink-0 font-normal text-slate-500">in {ticket.category}</p>
                </div>
                <div className="mt-2 flex">
                  <div className="flex items-center text-sm text-slate-500">
                    <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-slate-400" />
                    <span>
                      Created on <time dateTime={ticket.createdAt.toString()}>
                        {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                      </time>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-shrink-0 ml-2">
                {getPriorityBadge()}
                <span className="ml-2">{getStatusBadge()}</span>
              </div>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-slate-500">
                  <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-slate-400" />
                  {ticket.createdBy.name}
                </p>
                <p className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0 sm:ml-6">
                  <Mail className="flex-shrink-0 mr-1.5 h-5 w-5 text-slate-400" />
                  {ticket.commentCount} {ticket.commentCount === 1 ? "reply" : "replies"}
                </p>
              </div>
              <div className="mt-2 flex items-center text-sm text-slate-500 sm:mt-0">
                <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-slate-400" />
                <span>Updated {getRelativeTime(ticket.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
