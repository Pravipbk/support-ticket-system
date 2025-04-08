import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryDistributionProps {
  timeframe: "7days" | "30days" | "90days";
}

interface CategoryData {
  name: string;
  value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const mockData: Record<string, CategoryData[]> = {
  "7days": [
    { name: "Website", value: 15 },
    { name: "Mobile App", value: 10 },
    { name: "Billing", value: 8 },
    { name: "Dashboard", value: 5 },
  ],
  "30days": [
    { name: "Website", value: 45 },
    { name: "Mobile App", value: 32 },
    { name: "Billing", value: 38 },
    { name: "Dashboard", value: 20 },
    { name: "Other", value: 7 },
  ],
  "90days": [
    { name: "Website", value: 120 },
    { name: "Mobile App", value: 95 },
    { name: "Billing", value: 110 },
    { name: "Dashboard", value: 62 },
    { name: "Other", value: 9 },
  ]
};

export default function CategoryDistribution({ timeframe }: CategoryDistributionProps) {
  const [data, setData] = useState<CategoryData[]>([]);
  
  // This is not a real API call, as we don't have a real API for reports
  // In a real application, we would query data from the backend
  const { isLoading } = useQuery({
    queryKey: [`/api/reports/categories/${timeframe}`],
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
    <div className="w-full h-72 flex flex-col md:flex-row">
      <div className="w-full md:w-1/2 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [`${value} tickets`, name]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "0.375rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <div className="space-y-3">
          {data.map((category, index) => (
            <div key={category.name} className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">{category.name}</span>
                  <span>{category.value} tickets</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="h-1.5 rounded-full" 
                    style={{ 
                      width: `${(category.value / data.reduce((acc, curr) => acc + curr.value, 0) * 100).toFixed(0)}%`,
                      backgroundColor: COLORS[index % COLORS.length] 
                    }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
