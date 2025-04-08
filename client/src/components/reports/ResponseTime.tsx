import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface ResponseTimeProps {
  timeframe: "7days" | "30days" | "90days";
}

interface ResponseTimeData {
  name: string;
  time: number;
}

const mockData: Record<string, ResponseTimeData[]> = {
  "7days": [
    { name: "Mon", time: 3.5 },
    { name: "Tue", time: 3.2 },
    { name: "Wed", time: 4.1 },
    { name: "Thu", time: 2.8 },
    { name: "Fri", time: 3.0 },
    { name: "Sat", time: 2.5 },
    { name: "Sun", time: 2.2 },
  ],
  "30days": [
    { name: "Week 1", time: 4.8 },
    { name: "Week 2", time: 4.5 },
    { name: "Week 3", time: 4.2 },
    { name: "Week 4", time: 3.9 },
  ],
  "90days": [
    { name: "Jan", time: 5.5 },
    { name: "Feb", time: 5.2 },
    { name: "Mar", time: 4.8 },
  ]
};

export default function ResponseTime({ timeframe }: ResponseTimeProps) {
  const [data, setData] = useState<ResponseTimeData[]>([]);
  
  // This is not a real API call, as we don't have a real API for reports
  // In a real application, we would query data from the backend
  const { isLoading } = useQuery({
    queryKey: [`/api/reports/response-time/${timeframe}`],
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
        <LineChart
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
            formatter={(value) => [`${value} hours`, "Response Time"]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "0.375rem",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="time"
            name="Response Time (hours)"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
