import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketVolumeProps {
  timeframe: "7days" | "30days" | "90days";
}

interface TicketVolumeData {
  name: string;
  created: number;
  resolved: number;
}

const mockData: Record<string, TicketVolumeData[]> = {
  "7days": [
    { name: "Mon", created: 5, resolved: 3 },
    { name: "Tue", created: 8, resolved: 5 },
    { name: "Wed", created: 6, resolved: 7 },
    { name: "Thu", created: 9, resolved: 6 },
    { name: "Fri", created: 7, resolved: 8 },
    { name: "Sat", created: 2, resolved: 4 },
    { name: "Sun", created: 1, resolved: 3 },
  ],
  "30days": [
    { name: "Week 1", created: 28, resolved: 20 },
    { name: "Week 2", created: 32, resolved: 27 },
    { name: "Week 3", created: 45, resolved: 38 },
    { name: "Week 4", created: 37, resolved: 42 },
  ],
  "90days": [
    { name: "Jan", created: 85, resolved: 72 },
    { name: "Feb", created: 110, resolved: 95 },
    { name: "Mar", created: 120, resolved: 105 },
  ]
};

export default function TicketVolume({ timeframe }: TicketVolumeProps) {
  const [data, setData] = useState<TicketVolumeData[]>([]);
  
  // This is not a real API call, as we don't have a real API for reports
  // In a real application, we would query data from the backend
  const { isLoading } = useQuery({
    queryKey: [`/api/reports/volume/${timeframe}`],
    queryFn: async () => {
      // Simulating network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockData[timeframe] || [];
    },
    onSuccess: (data) => {
      setData(data);
    }
  });

  if (isLoading) {
    return (
      <div className="w-full h-64">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "0.375rem",
            }}
          />
          <Legend />
          <Bar dataKey="created" name="Created" fill="#3b82f6" barSize={20} />
          <Bar dataKey="resolved" name="Resolved" fill="#22c55e" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
