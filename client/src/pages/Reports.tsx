import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/lib/auth";
import { Calendar, BarChart2, PieChart, Clock } from "lucide-react";
import ReportCard from "@/components/reports/ReportCard";
import TicketVolume from "@/components/reports/TicketVolume";
import ResponseTime from "@/components/reports/ResponseTime";
import CategoryDistribution from "@/components/reports/CategoryDistribution";

export default function Reports() {
  const { user } = useUser();
  const [timeframe, setTimeframe] = useState<"7days" | "30days" | "90days">("30days");
  
  if (!user || (user.role !== "admin" && user.role !== "agent")) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              You don't have permission to view this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-500">
            View insights and statistics about your support operations
          </p>
        </div>
        
        <Tabs
          value={timeframe}
          onValueChange={(value) => setTimeframe(value as "7days" | "30days" | "90days")}
          className="w-full md:w-auto"
        >
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="7days" className="text-xs md:text-sm">
              Last 7 Days
            </TabsTrigger>
            <TabsTrigger value="30days" className="text-xs md:text-sm">
              Last 30 Days
            </TabsTrigger>
            <TabsTrigger value="90days" className="text-xs md:text-sm">
              Last 90 Days
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportCard 
          title="Total Tickets" 
          value={timeframe === "7days" ? "38" : timeframe === "30days" ? "142" : "396"} 
          trend={timeframe === "7days" ? "+12%" : timeframe === "30days" ? "+8%" : "+15%"}
          trendType="up"
          description={`vs previous ${timeframe === "7days" ? "week" : timeframe === "30days" ? "month" : "quarter"}`}
          icon={<BarChart2 className="h-4 w-4" />}
        />
        
        <ReportCard 
          title="Resolution Rate" 
          value={timeframe === "7days" ? "78%" : timeframe === "30days" ? "82%" : "85%"} 
          trend={timeframe === "7days" ? "+5%" : timeframe === "30days" ? "+3%" : "+7%"}
          trendType="up"
          description={`vs previous ${timeframe === "7days" ? "week" : timeframe === "30days" ? "month" : "quarter"}`}
          icon={<Calendar className="h-4 w-4" />}
        />
        
        <ReportCard 
          title="Avg. Response Time" 
          value={timeframe === "7days" ? "3.2h" : timeframe === "30days" ? "4.5h" : "5.1h"} 
          trend={timeframe === "7days" ? "-15%" : timeframe === "30days" ? "-8%" : "-12%"}
          trendType="down"
          description={`vs previous ${timeframe === "7days" ? "week" : timeframe === "30days" ? "month" : "quarter"}`}
          icon={<Clock className="h-4 w-4" />}
        />
        
        <ReportCard 
          title="Category Distribution" 
          value={timeframe === "7days" ? "4 cats" : timeframe === "30days" ? "5 cats" : "5 cats"} 
          trend="Website leads"
          trendType="neutral"
          description="Most common category"
          icon={<PieChart className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Volume</CardTitle>
            <CardDescription>Number of tickets over time</CardDescription>
          </CardHeader>
          <CardContent>
            <TicketVolume timeframe={timeframe} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Average Response Time</CardTitle>
            <CardDescription>Time to first response (hours)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponseTime timeframe={timeframe} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
          <CardDescription>Tickets by category</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <CategoryDistribution timeframe={timeframe} />
        </CardContent>
      </Card>
    </div>
  );
}
