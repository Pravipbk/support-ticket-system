import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import TicketList from "@/components/tickets/TicketList";

export default function AllTickets() {
  const [location] = useLocation();
  const [apiUrl, setApiUrl] = useState("/api/tickets");
  const [title, setTitle] = useState("All Tickets");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.split("?")[1]);
    
    if (searchParams.has("status")) {
      const status = searchParams.get("status");
      setApiUrl(`/api/tickets/status/${status}`);
      setTitle(
        status === "open" ? "Open Tickets" : 
        status === "in_progress" ? "In Progress Tickets" :
        status === "resolved" ? "Resolved Tickets" :
        status === "closed" ? "Closed Tickets" :
        "Filtered Tickets"
      );
    } else if (searchParams.has("priority")) {
      const priority = searchParams.get("priority");
      setApiUrl(`/api/tickets/priority/${priority}`);
      setTitle(
        priority === "low" ? "Low Priority Tickets" :
        priority === "medium" ? "Medium Priority Tickets" :
        priority === "high" ? "High Priority Tickets" :
        "Filtered Tickets"
      );
    } else if (searchParams.has("search")) {
      const query = searchParams.get("search");
      setApiUrl(`/api/tickets/search?q=${query}`);
      setTitle(`Search Results: ${query}`);
    } else {
      setApiUrl("/api/tickets");
      setTitle("All Tickets");
    }
  }, [location]);

  return (
    <div>
      <TicketList 
        title={title}
        apiUrl={apiUrl}
        emptyMessage="No tickets found matching the criteria."
      />
    </div>
  );
}
