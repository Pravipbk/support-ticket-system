import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ticket, User } from "@shared/schema";
import { 
  File, 
  Clock, 
  CheckCircle, 
  AlertTriangle 
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import TicketList from "@/components/tickets/TicketList";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketStats {
  total: number;
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  highPriorityCount: number;
  resolvedToday: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<TicketStats | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json() as Promise<TicketStats>;
    }
  });

  useEffect(() => {
    if (data) {
      setStats(data);
    }
  }, [data]);

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 mt-2 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white shadow rounded-lg p-5">
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="ml-5 w-0 flex-1">
                    <Skeleton className="h-5 w-20 mb-1" />
                    <Skeleton className="h-8 w-10" />
                  </div>
                </div>
                <div className="mt-3">
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </>
        ) : error ? (
          <div className="col-span-4 bg-red-50 text-red-800 p-4 rounded-lg">
            Error loading statistics
          </div>
        ) : stats ? (
          <>
            <StatCard
              title="Total Tickets"
              value={stats.total}
              icon={File}
              href="/tickets"
              color="primary"
            />
            <StatCard
              title="Pending"
              value={stats.openCount + stats.inProgressCount}
              icon={Clock}
              href="/tickets?status=open"
              color="yellow"
            />
            <StatCard
              title="Resolved Today"
              value={stats.resolvedToday}
              icon={CheckCircle}
              href="/tickets?status=resolved"
              color="green"
            />
            <StatCard
              title="High Priority"
              value={stats.highPriorityCount}
              icon={AlertTriangle}
              href="/tickets?priority=high"
              color="red"
            />
          </>
        ) : null}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Tickets */}
        <div className="lg:col-span-2">
          <TicketList 
            title="Recent Tickets"
            apiUrl="/api/tickets"
            emptyMessage="No tickets found. Create your first ticket to get started."
          />
        </div>

        {/* Activity Feed */}
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
