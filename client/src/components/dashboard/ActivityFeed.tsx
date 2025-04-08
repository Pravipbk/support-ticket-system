import { useState, useEffect } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Activity, User } from "@shared/schema";
import { MessageSquare, CheckCircle, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface EnhancedActivity extends Activity {
  user: User;
}

interface ActivityItemProps {
  activity: EnhancedActivity;
  isLast: boolean;
}

function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const getActivityIcon = () => {
    switch (activity.type) {
      case "commented":
        return (
          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
            <MessageSquare className="h-4 w-4 text-white" />
          </span>
        );
      case "resolved":
        return (
          <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
            <CheckCircle className="h-4 w-4 text-white" />
          </span>
        );
      case "escalated":
        return (
          <span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
            <AlertTriangle className="h-4 w-4 text-white" />
          </span>
        );
      case "created":
        return (
          <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
            <Plus className="h-4 w-4 text-white" />
          </span>
        );
      default:
        return (
          <span className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center ring-8 ring-white">
            <MessageSquare className="h-4 w-4 text-white" />
          </span>
        );
    }
  };

  const getRelativeTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const getTicketLink = () => {
    if (!activity.ticketId) return null;
    
    const ticketIdMatches = activity.message.match(/#TK-(\d+)/);
    const ticketId = ticketIdMatches ? ticketIdMatches[1] : activity.ticketId;
    
    return (
      <Link href={`/tickets/${ticketId}`} className="font-medium text-primary-600">
        #TK-{ticketId}
      </Link>
    );
  };

  return (
    <li>
      <div className="relative pb-8">
        {!isLast && (
          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true"></span>
        )}
        <div className="relative flex space-x-3">
          <div>
            {getActivityIcon()}
          </div>
          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
            <div>
              <p className="text-sm text-slate-500">
                {activity.message.replace(/#TK-\d+/, "")} {getTicketLink()}
              </p>
            </div>
            <div className="text-right text-xs whitespace-nowrap text-slate-500">
              <time dateTime={activity.createdAt.toString()}>
                {getRelativeTime(activity.createdAt)}
              </time>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<EnhancedActivity[]>([]);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const res = await fetch("/api/activities", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch activities");
      return res.json() as Promise<EnhancedActivity[]>;
    }
  });

  useEffect(() => {
    if (data) {
      setActivities(data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 border-b border-slate-200 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-slate-900">Recent Activity</h3>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 border-b border-slate-200 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-slate-900">Recent Activity</h3>
        </div>
        <div className="px-4 py-5 sm:px-6">
          <p className="text-sm text-red-500">Error loading activities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 border-b border-slate-200 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-slate-900">Recent Activity</h3>
      </div>
      <div className="px-4 py-5 sm:px-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, index) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isLast={index === activities.length - 1}
              />
            ))}
          </ul>
        </div>
        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full flex justify-center items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
            asChild
          >
            <Link href="/tickets">View all tickets</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
