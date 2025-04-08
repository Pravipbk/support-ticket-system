import { useEffect, useState } from "react";
import { useUser } from "@/lib/auth";
import TicketList from "@/components/tickets/TicketList";

export default function MyTickets() {
  const { user } = useUser();
  const [apiUrl, setApiUrl] = useState("");
  const [title, setTitle] = useState("My Tickets");

  useEffect(() => {
    if (user) {
      if (user.role === "agent" || user.role === "admin") {
        setApiUrl(`/api/tickets/assigned/${user.id}`);
        setTitle("Tickets Assigned to Me");
      } else {
        setApiUrl(`/api/tickets/created/${user.id}`);
        setTitle("My Tickets");
      }
    }
  }, [user]);

  if (!apiUrl) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <TicketList 
        title={title}
        apiUrl={apiUrl}
        emptyMessage={
          user?.role === "agent" || user?.role === "admin"
            ? "No tickets are currently assigned to you."
            : "You haven't created any tickets yet."
        }
      />
    </div>
  );
}
